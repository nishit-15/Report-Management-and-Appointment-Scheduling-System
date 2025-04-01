const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const multer = require("multer");
const GridFsStorage = require("multer-gridfs-storage").GridFsStorage;
const Grid = require("gridfs-stream");
const Doctor = require("../models/doctorModel");
const authMiddleware = require("../middlewares/authMiddleware");
const Appointment = require("../models/appointmentModel");
const User = require("../models/userModel");
const { sendSMS } = require("../twilio"); // Import Twilio helper function
let gfs;

const mongo_URL=process.env.mongo_URL;
const conn = mongoose.createConnection(mongo_URL, { useNewUrlParser: true, useUnifiedTopology: true });
conn.once("open", () => {
    gfs = Grid(conn.db, mongoose.mongo);
    gfs.collection("uploads");
});

const storage = new GridFsStorage({
  url: mongo_URL,
  file: (req, file) => {
      return {
          filename: `${Date.now()}-${file.originalname}`,
          bucketName: "uploads",
          metadata: {
              userId: req.body.userId,
              doctorId: req.body.doctorId
          }
      };
  }
});

const upload = multer({ storage });

// **Search User API**// **Search User API**
router.get("/search-user", authMiddleware, async (req, res) => {
  try {
      const { name } = req.query;
      
      // Better logging to debug the incoming query
      console.log("Search query received:", { name });
      
      if (!name) {
          return res.status(400).json({ message: "Search name parameter is required" });
      }
      
      // Use find instead of findOne to get all matching users
      const users = await User.find({ 
          name: { $regex: new RegExp(name, "i") } 
      });

      console.log("Search results:", users.length);
      
      if (!users || users.length === 0) {
          return res.status(404).json({ message: "No users found matching the criteria" });
      }

      // Return all matching users
      res.json({ 
          message: `Found ${users.length} user(s)`,
          users: users.map(user => ({
              userId: user._id,
              name: user.name
          }))
      });
  } catch (error) {
      console.error("Error in search-user API:", error);
      res.status(500).json({ message: "Error searching user", error: error.message });
  }
});


router.post("/upload-pdf", authMiddleware, upload.single("pdf"), async (req, res) => {
  console.log("📥 File Upload Request Received!");

  if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
  }

  const userId = req.body.userId;
  const doctorId = req.body.doctorId;

  if (!userId || !doctorId) {
      return res.status(400).json({ error: "User ID and Doctor ID are required" });
  }

  const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
      bucketName: "uploads"
  });

  // Open upload stream to GridFS
  const uploadStream = bucket.openUploadStream(req.file.originalname, {
      metadata: { userId, doctorId }
  });

  uploadStream.end(req.file.buffer);

  uploadStream.on("finish", () => {
      res.json({
          message: "PDF uploaded successfully!",
          filename: req.file.originalname,
          userId,
          doctorId
      });
  });

  uploadStream.on("error", (err) => {
      console.error("GridFS Upload Error:", err);
      res.status(500).json({ error: "File upload failed" });
  });
});



router.post("/get-doctor-info-by-user-id", authMiddleware, async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.body.userId });
    res.status(200).send({
      success: true,
      message: "Doctor info fetched successfully",
      data: doctor,
    });
  } catch (error) {
    res
      .status(500)
      .send({ message: "Error getting doctor info", success: false, error });
  }
});

router.post("/get-doctor-info-by-id", authMiddleware, async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ _id: req.body.doctorId });
    res.status(200).send({
      success: true,
      message: "Doctor info fetched successfully",
      data: doctor,
    });
  } catch (error) {
    res
      .status(500)
      .send({ message: "Error getting doctor info", success: false, error });
  }
});

router.post("/update-doctor-profile", authMiddleware, async (req, res) => {
  try {
    const doctor = await Doctor.findOneAndUpdate(
      { userId: req.body.userId },
      req.body
    );
    res.status(200).send({
      success: true,
      message: "Doctor profile updated successfully",
      data: doctor,
    });
  } catch (error) {
    res
      .status(500)
      .send({ message: "Error getting doctor info", success: false, error });
  }
});

router.get(
  "/get-appointments-by-doctor-id",
  authMiddleware,
  async (req, res) => {
    try {
      //console.log("test7 : "+req.query.userId);
      const doctor = await Doctor.findOne({ userId: req.query.userId});
     // console.log("test1243"+doctor);
      const appointments = await Appointment.find({ doctorId: doctor._id });
      res.status(200).send({
        message: "Appointments fetched successfully",
        success: true,
        data: appointments,
      });
    } catch (error) {
      console.log(error);
      res.status(500).send({
        message: "Error fetching appointments",
        success: false,
        error,
      });
    }
  }
);

router.post("/change-appointment-status", authMiddleware, async (req, res) => {
  try {
    const { appointmentId, status } = req.body;
    const appointment = await Appointment.findByIdAndUpdate(appointmentId, {
      status,
    });
     
    const appointmentTime = appointment.dateTime;
    const user = await User.findOne({ _id: appointment.userId });
    //const userPhoneNumber = user.phoneNumber;
    const doctor=await Doctor.findById(appointment.doctorId);
    const unseenNotifications = user.unseenNotifications;
    unseenNotifications.push({
      type: "appointment-status-changed",
      message: `Your appointment status has been ${status} for ${doctor.firstName} ${doctor.lastName}`,
      onClickPath: "/appointments",
    });
    // if (userPhoneNumber) {
    //   const message = `Hello ${user.name}, your appointment with Dr. ${doctor.firstName} ${doctor.lastName} has been ${status}. Scheduled time: ${appointmentTime}.`;
    //   sendSMS(userPhoneNumber, message);
    // } else {
    //   console.warn("User does not have a phone number saved.");
    // }
    await user.save();

    res.status(200).send({
      message: "Appointment status updated successfully",
      success: true
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Error changing appointment status",
      success: false,
      error,
    });
  }
});

module.exports = router;

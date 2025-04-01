// const express = require("express");
// const router = express.Router();
// const twilio = require('twilio'); // For sending SMS
// const User = require("../models/userModel");
// const Doctor = require("../models/doctorModel");
// const jwt = require("jsonwebtoken");

// const Appointment = require("../models/appointmentModel");
// const moment = require("moment");
// const OTP = require('otp-generator'); // You can use a package to generate OTP

// // Replace with your Twilio credentials
// const accountSid = process.env.TWILIO_ACCOUNT_SID;
// const authToken = process.env.TWILIO_AUTH_TOKEN;
// const client = new twilio(accountSid, authToken);



// router.post('/send-otp', async (req, res) => {
//   console.log("Request body:", req.body);
//   try {
//     const { phoneNumber } = req.body;
//     console.log("Phone number:", phoneNumber);

//     const user = await User.findOne({ phoneNumber });
//     if (!user) {
//       return res.status(400).json({ success: false, message: 'User not found' });
//     }
    
//     const verification=await client.verify.v2.services(process.env.TWILIO_VERIFY_SID).verifications.create(
//       {
//         to: phoneNumber,
//         channel: 'sms',
//       }
//     );

//     console.log("Twilio verification response: ",verification);

//     user.otp = verification.sid;
//     user.otpExpires = Date.now() + 300000;
//     await user.save();

//     res.json({ success: true, message: 'OTP sent successfully' });
//   } catch (error) {
//     console.error("Error in /send-otp:", error);
//     res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
//   }
// });

// router.post('/verify-otp', async (req, res) => {
//   const { phoneNumber, otp } = req.body;

//   try {
//     // Find the user by phone number
//     const user = await User.findOne({ phoneNumber });

//     // Check if the user exists
//     if (!user) {
//       return res.status(400).json({ success: false, message: 'User not found' });
//     }

//     if (user.otpExpires < Date.now()) {
//       return res.status(400).json({ success: false, message: 'OTP has expired' });
//     }

//     const verificationCheck = await client.verify.v2.services(process.env.TWILIO_VERIFY_SID)
//       .verificationChecks.create({
//         to: phoneNumber,
//         code: otp,
//       });

//     // Check if OTP matches and is not expired
//     if (verificationCheck.status === 'approved') {
//       // OTP is valid
//       user.otp = undefined; // Clear OTP after verification
//       user.otpExpires = undefined; // Clear expiration time
//       await user.save(); // Save changes to the user document
//       const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

//       res.json({ success: true, message: 'OTP verified successfully' });
//     } else {
//       // OTP is invalid or expired
//       res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
//     }
//   } catch (error) {
//     console.error("Error verifying OTP:", error.message);
//     res.status(500).json({ success: false, message: 'Error verifying OTP', error: error.message });
//   }
// });




// router.post("/register", async (req, res) => {
//   try {
//     // Check if user already exists based on phone number
//     const userExists = await User.findOne({ phoneNumber: req.body.phoneNumber });
//     if (userExists) {
//       return res
//         .status(200)
//         .send({ message: "Phone number already registered", success: false });
//     }


//     // Create new user with the name, phone number, and OTP
//     const newUser = new User({
//       name: req.body.name,
//       phoneNumber: req.body.phoneNumber, 
//     });

//     // Save the user to the database
//     await newUser.save();

//     // Send success response along with OTP
//     res
//       .status(200)
//       .send({ message: "User created successfully", success: true});
//   } catch (error) {
//     console.log(error);
//     res
//       .status(500)
//       .send({ message: "Error creating user", success: false, error });
//   }
// });


// // router.post("/login", async (req, res) => {
// //   try {
// //     const user = await User.findOne({ email: req.body.email });
// //     if (!user) {
// //       return res
// //         .status(200)
// //         .send({ message: "User does not exist", success: false });
// //     }
// //     const isMatch = await bcrypt.compare(req.body.password, user.password);
// //     if (!isMatch) {
// //       return res
// //         .status(200)
// //         .send({ message: "Password is incorrect", success: false });
// //     } else {
// //       const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
// //         expiresIn: "1d",
// //       });
// //       res
// //         .status(200)
// //         .send({ message: "Login successful", success: true, data: token });
// //     }
// //   } catch (error) {
// //     console.log(error);
// //     res
// //       .status(500)
// //       .send({ message: "Error logging in", success: false, error });
// //   }
// // });

// router.post("/get-user-info-by-id", authMiddleware, async (req, res) => {
//   try {
//     const user = await User.findById(req.body.userId).select("-otp -otpExpires"); // Exclude OTP fields
//     if (!user) {
//       return res.status(400).json({ message: "User does not exist", success: false });
//     }

//     res.status(200).json({
//       success: true,
//       data: user,
//     });
//   } catch (error) {
//     console.error("Error fetching user info:", error);
//     res.status(500).json({ message: "Error getting user info", success: false, error });
//   }
// });

// router.post("/apply-doctor-account", authMiddleware, async (req, res) => {
//   try {
//     const newdoctor = new Doctor({ ...req.body, status: "pending" });
//     await newdoctor.save();
//     const adminUser = await User.findOne({ isAdmin: true });
    
//     const unseenNotifications = adminUser.unseenNotifications;
//     unseenNotifications.push({
//       type: "new-doctor-request",
//       message: `${newdoctor.firstName} ${newdoctor.lastName} has applied for a doctor account`,
//       data: {
//         doctorId: newdoctor._id,
//         name: newdoctor.firstName + " " + newdoctor.lastName,
//       },
//       onClickPath: "/admin/doctorslist",
//     });
//     await User.findByIdAndUpdate(adminUser._id, { unseenNotifications });
//     res.status(200).send({
//       success: true,
//       message: "Doctor account applied successfully",
//     });
//   } catch (error) {
//     console.log(error);
//     res.status(500).send({
//       message: "Error applying doctor account",
//       success: false,
//       error,
//     });
//   }
// });
// router.post(
//   "/mark-all-notifications-as-seen",
//   authMiddleware,
//   async (req, res) => {
//     try {
//       const user = await User.findOne({ _id: req.body.userId });
//       const unseenNotifications = user.unseenNotifications;
//       const seenNotifications = user.seenNotifications;
//       seenNotifications.push(...unseenNotifications);
//       user.unseenNotifications = [];
//       user.seenNotifications = seenNotifications;
//       const updatedUser = await user.save();
//       updatedUser.password = undefined;
//       res.status(200).send({
//         success: true,
//         message: "All notifications marked as seen",
//         data: updatedUser,
//       });
//     } catch (error) {
//       console.log(error);
//       res.status(500).send({
//         message: "Error applying doctor account",
//         success: false,
//         error,
//       });
//     }
//   }
// );

// router.post("/delete-all-notifications", authMiddleware, async (req, res) => {
//   try {
//     const user = await User.findOne({ _id: req.body.userId });
//     user.seenNotifications = [];
//     user.unseenNotifications = [];
//     const updatedUser = await user.save();
//     updatedUser.password = undefined;
//     res.status(200).send({
//       success: true,
//       message: "All notifications cleared",
//       data: updatedUser,
//     });
//   } catch (error) {
//     console.log(error);
//     res.status(500).send({
//       message: "Error applying doctor account",
//       success: false,
//       error,
//     });
//   }
// });

// router.get("/get-all-approved-doctors", authMiddleware, async (req, res) => {
//   try {
//     const doctors = await Doctor.find({ status: "approved" });
//     res.status(200).send({
//       message: "Doctors fetched successfully",
//       success: true,
//       data: doctors,
//     });
//   } catch (error) {
//     console.log(error);
//     res.status(500).send({
//       message: "Error applying doctor account",
//       success: false,
//       error,
//     });
//   }
// });

// router.post("/book-appointment", authMiddleware, async (req, res) => {
//   try {
//     req.body.status = "pending";
//     req.body.date = moment(req.body.date, "DD-MM-YYYY").toISOString();
//     req.body.time = moment(req.body.time, "HH:mm").toISOString();
//     const newAppointment = new Appointment(req.body);
//     await newAppointment.save();
//     //pushing notification to doctor based on his userid
//     const user = await User.findOne({ _id: req.body.doctorInfo.userId });
//     user.unseenNotifications.push({
//       type: "new-appointment-request",
//       message: `A new appointment request has been made by ${req.body.userInfo.name}`,
//       onClickPath: "/doctor/appointments",
//     });
//     await user.save();
//     res.status(200).send({
//       message: "Appointment booked successfully",
//       success: true,
//     });
//   } catch (error) {
//     console.error("Error booking appointment:", error.message);
//     res.status(500).send({
//         message: "Error booking appointment",
//         success: false,
//         error: error.message, // Add this for clarity
//   });
// }
// });

// router.post("/check-booking-avilability", authMiddleware, async (req, res) => {
//   try {
//     const date = moment(req.body.date, "DD-MM-YYYY").toISOString();
//     const fromTime = moment(req.body.time, "HH:mm")
//       .subtract(1, "hours")
//       .toISOString();
//     const toTime = moment(req.body.time, "HH:mm").add(1, "hours").toISOString();
//     const doctorId = req.body.doctorId;
//     const appointments = await Appointment.find({
//       doctorId,
//       date,
//       time: { $gte: fromTime, $lte: toTime },
//     });
//     if (appointments.length > 0) {
//       return res.status(200).send({
//         message: "Appointments not available",
//         success: false,
//       });
//     } else {
//       return res.status(200).send({
//         message: "Appointments available",
//         success: true,
//       });
//     }
//   } catch (error) {
//     console.log(error);
//     res.status(500).send({
//       message: "Error booking appointment",
//       success: false,
//       error,
//     });
//   }
// });
const express = require("express");
const router = express.Router();
const twilio = require("twilio");
const authMiddleware = require("../middlewares/authMiddleware");
const User = require("../models/userModel");
const Doctor = require("../models/doctorModel");
const Appointment = require("../models/appointmentModel");
const moment = require("moment");
const jwt = require('jsonwebtoken');
const multer = require("multer");
const path = require("path");
const app = express();
const PORT = 5001;
const Grid = require("gridfs-stream");
const { GridFSBucket } = require("mongodb");
const mongoose=require("mongoose");
// MongoDB connection
const conn = mongoose.connection;
let gfs, gridfsBucket;

conn.once("open", () => {
  gridfsBucket = new GridFSBucket(mongoose.connection.db, { bucketName: "uploads" });
    gfs = Grid(conn.db, mongoose.mongo);
    gfs.collection("uploads"); // Ensure it's using the correct GridFS collection
});

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
      cb(null, file.fieldname + "-" + Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// Twilio credentials
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = new twilio(accountSid, authToken);
router.delete("/cancel-appointment/:id", authMiddleware, async (req, res) => {
  try {
    const appointmentId = req.params.id;
    await Appointment.findByIdAndDelete(appointmentId);

    res.status(200).send({
      message: "Appointment canceled successfully",
      success: true,
    });
  } catch (error) {
    console.log("Error canceling appointment:", error);
    res.status(500).send({
      message: "Error canceling appointment",
      success: false,
      error,
    });
  }
});
router.get("/get-appointments-by-user-id", authMiddleware, async (req, res) => {
  try {
    //console.log("User ID:", req.query.userId); // Debugging
    const appointments = await Appointment.find({ userId: req.query.userId });
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
});
module.exports = router;

//get pdf api
router.post("/get-pdf",  async (req, res) => {
  try {
      const { userId } = req.body;

      if (!userId) {
          return res.status(400).json({ error: "User ID is required" });
      }

      const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
          bucketName: "uploads"
      });

      const files = await mongoose.connection.db.collection("uploads.files").findOne({ "metadata.userId": userId });

      if (!files) {
          return res.status(404).json({ error: "PDF not found" });
      }

      res.set("Content-Type", "application/pdf");
      const readStream = bucket.openDownloadStream(files._id);
      readStream.pipe(res);
  } catch (error) {
      console.error("Error fetching PDF:", error);
      res.status(500).json({ error: "Internal Server Error" });
  }
});


// Serve uploaded files statically
app.use("/uploads", express.static("uploads"));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});



router.post("/check-booking-avilability", authMiddleware, async (req, res) => {
    try {
      const date = moment(req.body.date, "DD-MM-YYYY").toISOString();
      const fromTime = moment(req.body.time, "HH:mm")
        .subtract(1, "hours")
        .toISOString();
      const toTime = moment(req.body.time, "HH:mm").add(1, "hours").toISOString();
      const doctorId = req.body.doctorId;
      const appointments = await Appointment.find({
        doctorId,
        date,
        time: { $gte: fromTime, $lte: toTime },
      });
      if (appointments.length > 0) {
        return res.status(200).send({
          message: "Appointments not available",
          success: false,
        });
      } else {
        return res.status(200).send({
          message: "Appointments available",
          success: true,
        });
      }
    } catch (error) {
      console.log(error);
      res.status(500).send({
        message: "Error booking appointment",
        success: false,
        error,
      });
    }
  });

// router.post("/send-otp", async (req, res) => {
//   try{
//     console.log("123456")
//     if(phoneNumber==="0000000000")
//       {
//         const adminUser=await User.findOne({phoneNumber: "0000000000"});
//       }
//       adminUser.otp="000000";
//       adminUser.otpExpires=Date.now()+300000;
//       await adminUser.save();
//       return res.json({success: true, message: "OTP sent successfully"});
//     }
//   catch(error){
//     console.log(error);
//   }
//   try {
//     const { phoneNumber } = req.body;
//     const user = await User.findOne({ phoneNumber });

//     if (!user) {
//       return res.status(400).json({ success: false, message: "User not found" });
//     }

//     const verification = await client.verify.v2
//       .services(process.env.TWILIO_VERIFY_SID)
//       .verifications.create({ to: phoneNumber, channel: "sms" });

//     user.otp = verification.sid;
//     user.otpExpires = Date.now() + 300000; // OTP expires in 5 minutes
//     await user.save();

//     res.json({ success: true, message: "OTP sent successfully" });
//   } catch (error) {
//     console.error("Error in /send-otp:", error);
//     res.status(500).json({ success: false, message: "Internal server error" });
//   }
// });
router.post("/send-otp", async (req, res) => {
  try {
    const { phoneNumber } = req.body;

    // Check if the phone number is for the admin (0000000000)
    if (phoneNumber === "+910000000000") {
      // Simulate sending OTP for admin (default OTP is 000000)
      const adminUser = await User.findOne({ phoneNumber: "+910000000000" });

      if (!adminUser) {
        return res.status(400).json({ success: false, message: "Admin user not found" });
      }

      adminUser.otp = "000000"; // Set the default OTP for admin
      adminUser.otpExpires = Date.now() + 300000; // OTP expires in 5 minutes
      await adminUser.save();

      return res.json({ success: true, message: "OTP sent successfully for doctor" });
    }
    if (phoneNumber === "+918347577371") {
      // Simulate sending OTP for admin (default OTP is 000000)
      const doctorUser = await User.findOne({ phoneNumber: "+918347577371" });

      if (!doctorUser) {
        return res.status(400).json({ success: false, message: "Doctor user not found" });
      }

      doctorUser.otp = "000000"; // Set the default OTP for Doctor
      doctorUser.otpExpires = Date.now() + 300000; // OTP expires in 5 minutes
      await doctorUser.save();

      return res.json({ success: true, message: "OTP sent successfully for admin" });
    }

    // Normal user logic for sending OTP via Twilio
    const user = await User.findOne({ phoneNumber });

    if (!user) {
      return res.status(400).json({ success: false, message: "User not found" });
    }

    // Send OTP via Twilio
    //ConnectionPolicyPage.log("test"+process.env.TWILIO_VERIFY_SID)
    const verification = await client.verify.v2
      .services(process.env.TWILIO_VERIFY_SID)
      .verifications.create({ to: phoneNumber, channel: "sms" });

    user.otp = verification.sid;
    user.otpExpires = Date.now() + 300000; // OTP expires in 5 minutes
    await user.save();

    res.json({ success: true, message: "OTP sent successfully" });
  } catch (error) {
    console.error("Error in /send-otp:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});


router.post("/verify-otp", async (req, res) => {
  try {
    const { phoneNumber, otp } = req.body;

    // Check if the phone number is for admin (0000000000)
    if (phoneNumber === "+910000000000") {
      const adminUser = await User.findOne({ phoneNumber: "+910000000000" });
      if (!adminUser) {
        return res.status(400).json({ success: false, message: "Admin not found" });
      }

      // Simulate OTP verification by using the default OTP (000000)
      const defaultOtp = "000000";

      if (otp === defaultOtp) {
        const token = jwt.sign(
          { userId: adminUser._id, phoneNumber: adminUser.phoneNumber },
          process.env.JWT_SECRET,
          { expiresIn: '1d' } // Token expiry time
        );
        return res.json({
          success: true,
          message: "Admin logged in successfully",
          token,
          userId: adminUser._id, // Admin's unique user ID
          user: adminUser, // Return admin user data (including name)
        });
      } else {
        return res.status(400).json({ success: false, message: "Invalid OTP" });
      }
    }
  }
  catch(error)
  {
    console.log(error);
  }
  try {
    const { phoneNumber, otp } = req.body;

    // Check if the phone number is for admin (0000000000)
    if (phoneNumber === "+918347577371") {
      const doctorUser = await User.findOne({ phoneNumber: "+918347577371" });
      if (!doctorUser) {
        return res.status(400).json({ success: false, message: "Admin not found" });
      }

      // Simulate OTP verification by using the default OTP (000000)
      const defaultOtp = "000001";

      if (otp === defaultOtp) {
        const token = jwt.sign(
          { userId: doctorUser._id, phoneNumber: doctorUser.phoneNumber },
          process.env.JWT_SECRET,
          { expiresIn: '1d' } // Token expiry time
        );
        return res.json({
          success: true,
          message: "Doctor logged in successfully",
          token,
          userId: doctorUser._id, // Admin's unique user ID
          user: doctorUser, // Return admin user data (including name)
        });
      } else {
        return res.status(400).json({ success: false, message: "Invalid OTP" });
      }
    }
  }
  catch(error)
  {
    console.log(error);
  }
  try {
    const { phoneNumber, otp } = req.body;
    const user = await User.findOne({ phoneNumber });

    if (!user) {
      return res.status(400).json({ success: false, message: "User not found" });
    }

    if (user.otpExpires < Date.now()) {
      return res.status(400).json({ success: false, message: "OTP expired" });
    }

    const verificationCheck = await client.verify.v2
      .services(process.env.TWILIO_VERIFY_SID)
      .verificationChecks.create({ to: phoneNumber, code: otp });

    if (verificationCheck.status === "approved") {
      user.otp = undefined;
      user.otpExpires = undefined;
      await user.save();
      const token = jwt.sign(
        { userId: user._id, phoneNumber: user.phoneNumber },
        process.env.JWT_SECRET, // Use a strong secret key
        { expiresIn: '1d' } // Token expiry (optional)
      );

      res.json({ success: true, message: "OTP verified successfully",token,  userId: user._id });
    } else {
      res.status(400).json({ success: false, message: "Invalid OTP" });
    }
  } catch (error) {
    console.error("Error verifying OTP:", error.message);
    res.status(500).json({ success: false, message: "Error verifying OTP" });
  }
});

router.post("/register", async (req, res) => {
  try {
    const userExists = await User.findOne({ phoneNumber: req.body.phoneNumber });

    if (userExists) {
      return res.status(400).send({ message: "Phone number already registered", success: false });
    }

    const newUser = new User({
      name: req.body.name,
      phoneNumber: req.body.phoneNumber,
    });

    await newUser.save();

    res.status(200).send({ message: "User created successfully", success: true, userId: newUser._id });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Error creating user", success: false });
  }
});

router.post("/get-user-info-by-id", async (req, res) => {
  try {
    const user = await User.findById(req.body.userId).select("-otp -otpExpires");
    if (!user) {
      return res.status(400).json({ message: "User does not exist", success: false });
    }

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    console.error("Error fetching user info:", error);
    res.status(500).json({ message: "Error getting user info", success: false });
  }
});

// router.post("/apply-doctor-account", async (req, res) => {
//   try {
//     const newDoctor = new Doctor({ ...req.body, status: "pending" });
//     await newDoctor.save();

//     const adminUser = await User.findOne({ isAdmin: true });
//     adminUser.unseenNotifications.push({
//       type: "new-doctor-request",
//       message: `${newDoctor.firstName} ${newDoctor.lastName} has applied for a doctor account`,
//       onClickPath: "/admin/doctorslist",
//     });

//     await adminUser.save();
//     res.status(200).send({ success: true, message: "Doctor account applied successfully" });
//   } catch (error) {
//     console.error(error);
//     res.status(500).send({ message: "Error applying doctor account", success: false });
//   }
// });
// router.post("/apply-doctor-account", authMiddleware, async (req, res) => {
//     try {
//       // const user=await User.findById(req.body.userId);
//       // res.send(req.user.userId);
//       console.log(req.body);
//       const newdoctor = new Doctor({ ...req.body, status: "pending" });
//       await newdoctor.save();
//       const adminUser = await User.findOne({ isAdmin: true });
      
//       const unseenNotifications = adminUser.unseenNotifications;
//       unseenNotifications.push({
//         type: "new-doctor-request",
//         message: `${newdoctor.firstName} ${newdoctor.lastName} has applied for a doctor account`,
//         data: {
//           doctorId: newdoctor._id,
//           name: newdoctor.firstName + " " + newdoctor.lastName,
//         },
//         onClickPath: "/admin/doctorslist",
//       });
//       await User.findByIdAndUpdate(adminUser._id, { unseenNotifications });
//       res.status(200).send({
//         success: true,
//         message: "Doctor account applied successfully",
//       });
//     } catch (error) {
//       console.log(error);
//       res.status(500).send({
//         message: "Error applying doctor account",
//         success: false,
//         error,
//       });
//     }
//   });
router.post("/apply-doctor-account", authMiddleware, async (req, res) => {
    try {
      console.log("user doctor id: "+req.body.userId);
      const newdoctor = new Doctor({ ...req.body, userId: req.body.userId, status: "pending" });
      await newdoctor.save();
      const adminUser = await User.findOne({ isAdmin: true });
      
      const unseenNotifications = adminUser.unseenNotifications;
      unseenNotifications.push({
        type: "new-doctor-request",
        message: `${newdoctor.firstName} ${newdoctor.lastName} has applied for a doctor account`,
        data: {
          doctorId: newdoctor._id,
          name: newdoctor.firstName + " " + newdoctor.lastName,
        },
        onClickPath: "/admin/doctorslist",
      });
      await User.findByIdAndUpdate(adminUser._id, { unseenNotifications });
      res.status(200).send({
        success: true,
        message: "Doctor account applied successfully",
      });
    } catch (error) {
      console.log(error);
      res.status(500).send({
        message: "Error applying doctor account",
        success: false,
        error,
      });
    }
  });

router.get("/get-all-approved-doctors", async (req, res) => {
  try {
    const doctors = await Doctor.find({ status: "approved" });
    //console.log("approved doctors"+doctors);
    res.status(200).send({ message: "Doctors fetched successfully", success: true, data: doctors });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Error fetching doctors", success: false });
  }
});

router.post("/book-appointment", async (req, res) => {
  try {
    req.body.status = "pending";
    req.body.date = moment(req.body.date, "DD-MM-YYYY").toISOString();
    req.body.time = moment(req.body.time, "HH:mm").toISOString();

    const newAppointment = new Appointment(req.body);
    await newAppointment.save();

    const doctor = await User.findById(req.body.doctorInfo.userId);
    if (doctor) {
      doctor.unseenNotifications.push({
        type: "new-appointment-request",
        message: `A new appointment request has been made by ${req.body.userInfo.name}`,
        onClickPath: "/doctor/appointments",
      });
      await doctor.save();
    }

    res.status(200).send({ message: "Appointment booked successfully", success: true });
  } catch (error) {
    console.error("Error booking appointment:", error.message);
    res.status(500).send({ message: "Error booking appointment", success: false });
  }
});

router.post("/check-booking-availability", async (req, res) => {
  try {
    const date = moment(req.body.date, "DD-MM-YYYY").toISOString();
    const fromTime = moment(req.body.time, "HH:mm").subtract(1, "hours").toISOString();
    const toTime = moment(req.body.time, "HH:mm").add(1, "hours").toISOString();

    const appointments = await Appointment.find({
      doctorId: req.body.doctorId,
      date,
      time: { $gte: fromTime, $lte: toTime },
    });

    if (appointments.length > 0) {
      return res.status(200).send({ message: "Appointments not available", success: false });
    } else {
      return res.status(200).send({ message: "Appointments available", success: true });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Error checking appointment availability", success: false });
  }
});


router.post(
      "/mark-all-notifications-as-seen",
      async (req, res) => {
        try {
          // console.log("Request: "+req);
          // console.log("Request Body:", req.body); // Debug log
          if (!req.body || !req.body.userId) {
            return res.status(400).send({ success: false, message: "userId is missing" });
          }
          //const user = await User.findOne({ _id: req.body.userId });
          const user=await User.findById(req.body.userId);
          //console.log("User ID from request:", user);
          const unseenNotifications = user.unseenNotifications;
          const seenNotifications = user.seenNotifications;
          seenNotifications.push(...unseenNotifications);
          user.unseenNotifications = [];
          user.seenNotifications = seenNotifications;
          const updatedUser = await user.save();
          updatedUser.password = undefined;
          res.status(200).send({
            success: true,
            message: "All notifications marked as seen",
            data: updatedUser,
          });
        } catch (error) {
          console.log(error);
          res.status(500).send({
            message: "Error applying doctor account",
            success: false,
            error,
          });
        }
      }
    );

  
  router.post("/delete-all-notifications", async (req, res) => {
    try {
      const user = await User.findOne({ _id: req.body.userId });
      user.seenNotifications = [];
      user.unseenNotifications = [];
      const updatedUser = await user.save();
      updatedUser.password = undefined;
      res.status(200).send({
        success: true,
        message: "All notifications cleared",
        data: updatedUser,
      });
    } catch (error) {
      console.log(error);
      res.status(500).send({
        message: "Error applying doctor account",
        success: false,
        error,
      });
    }
  });
module.exports = router;


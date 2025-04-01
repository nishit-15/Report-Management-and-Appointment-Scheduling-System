const mongoose = require("mongoose");
const MONGO_URL=process.env.MONGO_URL;
mongoose.connect(MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('Connected to MongoDB health database');
})
.catch((err) => {
  console.error('Error connecting to MongoDB', err);
});
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      default: "",
    },
    password: {
      type: String,
      default: "",
    },
    phoneNumber: {
      type: String,
      required: true,
      unique:true,
    },
    isDoctor: {
      type: Boolean,
      default: false,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    seenNotifications: {
      type: Array,
      default: [],
    },
    unseenNotifications: {
      type: Array,
      default: [],
    },
    otp: {
      type: String,
      default: "",
    },
    otpExpires: {
      type: Date,
      default: null,
    }
  },
  {
    timestamps: true,
    collection:'users',
  }
);

const userModel = mongoose.model("users", userSchema);

module.exports = userModel;

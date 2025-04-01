// const twilio = require("twilio");

// const client = new twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// const sendSMS = async (to, message) => {
//   try {
//     const response = await client.messages.create({
//       body: message,
//       from: process.env.TWILIO_PHONE_NUMBER, // Your Twilio number
//       to: to, // User's phone number
//     });
//     console.log("Message Sent:", response.sid);
//   } catch (error) {
//     console.error("Error sending SMS:", error);
//   }
// };

// module.exports = { sendSMS };

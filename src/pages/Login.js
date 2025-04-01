import { Button, Form, Input } from "antd";
import React from "react";
import {useState} from "react";
import toast from "react-hot-toast";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { hideLoading, showLoading } from "../redux/alertsSlice";
import { setUser } from "../redux/userSlice"; // Import your action to set user data

function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const sendOtp = async () => {
  //console.log("Sending OTP to:", phoneNumber); // Debugging log
  // try {
  //   dispatch(showLoading());

  //   // If admin logs in, bypass OTP request
  //   if (phoneNumber === "0000000000") {
  //     dispatch(hideLoading());
  //     toast.success("Admin logged in successfully");
  //     localStorage.setItem("userId");
  //     dispatch(setUser({ name: "Admin", phoneNumber: "00000000000", isAdmin: true })); 
  //     navigate("/"); // Redirect admin
  //     return;
  //   }
  // }
  // catch(error)
  // {
  //   console.log(error)
  // }

  try {
    dispatch(showLoading());
    const response = await axios.post("/api/user/send-otp", { phoneNumber });

    console.log("Response:", response.data); // Log the response from backend

    dispatch(hideLoading());
    if (response.data.success) {
      toast.success(response.data.message);
      setOtpSent(true);
    } else {
      toast.error(response.data.message);
    }
  } catch (error) {
    dispatch(hideLoading());
    console.error("Error sending OTP:", error.response?.data || error.message);
    toast.error("Something went wrong");
  }
};

  const verifyOtp = async () => {
    try {
      dispatch(showLoading());
      const response = await axios.post("/api/user/verify-otp", { phoneNumber, otp });
      dispatch(hideLoading());
      if (response.data.success) {
        toast.success(response.data.message);
        localStorage.setItem("token", response.data.token); 
        localStorage.setItem("userId", response.data.userId);  // Make sure you save the correct user ID
      const userData = response.data.user;
        dispatch(setUser(userData));
        navigate("/");
      } else {        
        toast.error(response.data.message);
      }
    } catch (error) {
      dispatch(hideLoading());
      toast.error("Something went wrong");
    }
  };
  
  // const onFinish = async (values) => {
  //   try {
  //     dispatch(showLoading());
  //     const response = await axios.post("/api/user/login", values);
  //     dispatch(hideLoading());
  //     if (response.data.success) {
  //       toast.success(response.data.message);
  //       localStorage.setItem("token", response.data.data);
  //       const userData = response.data.user; // Adjust based on your API response structure
  //       dispatch(setUser(userData));
  //       navigate("/Home");
  //     } else {
  //       toast.error(response.data.message);
  //     }
  //   } catch (error) {
  //     dispatch(hideLoading());
  //     toast.error("Something went wrong");
  //   }
  // };

  return (
    <div className="authentication">
      <div className="authentication-form card p-3">
        <Form layout="vertical" onFinish={otpSent ? verifyOtp : sendOtp}>
          <Form.Item label="Phone Number" name="phoneNumber" rules={[{ required: true }]}>
            <Input
              placeholder="Phone Number"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              disabled={otpSent}
            />
          </Form.Item>

          {otpSent && (
            <Form.Item label="OTP" name="otp" rules={[{ required: true }]}>
              <Input
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
            </Form.Item>
          )}

          <Button
            className="primary-button my-2 full-width-button"
            htmlType="submit"
          >
            {otpSent ? "VERIFY OTP" : "SEND OTP"}
          </Button>

          <Link to="/register" className="anchor mt-2">
            CLICK HERE TO REGISTER
          </Link>
        </Form>
      </div>
    </div>
  );
}

export default Login;




// import { Button, Form, Input } from "antd";
// import React from "react";
// import toast from "react-hot-toast";
// import { useSelector, useDispatch } from "react-redux";
// import { Link, useNavigate } from "react-router-dom";
// import axios from "axios";
// import { hideLoading, showLoading } from "../redux/alertsSlice";
// import { setUser } from "../redux/userSlice";

// function Login() {
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const onFinish = async (values) => {
//     try {
//       dispatch(showLoading());
//       const response = await axios.post("/api/user/login", values);
//       dispatch(hideLoading());
//       if (response.data.success) {
//         toast.success(response.data.message);
//         localStorage.setItem("token", response.data.data);
//         const userData = response.data.user;
//         dispatch(setUser(userData));
//         navigate("/");
//       } else {
//         toast.error(response.data.message);
//       }
//     } catch (error) {
//       dispatch(hideLoading());
//       toast.error("Something went wrong");
//     }
//   };

//   return (
//     <div className="authentication">
//       <div className="authentication-form card p-3">
//         {/* <h1 className="card-title">Welcome Back</h1> */}
//         <Form layout="vertical" onFinish={onFinish}>
//           <Form.Item label="Email" name="email">
//             <Input placeholder="Email" />
//           </Form.Item>
//           <Form.Item label="Password" name="password">
//             <Input placeholder="Password" type="password" />
//           </Form.Item>

          
//           <Button className="primary-button my-2 full-width-button" htmlType="submit">
//             LOGIN
//           </Button>

//           <Link to="/register" className="anchor mt-2">
//             CLICK HERE TO REGISTER
//           </Link>
         
//         </Form>
//       </div>
//     </div>
//   );
// }

// export default Login;


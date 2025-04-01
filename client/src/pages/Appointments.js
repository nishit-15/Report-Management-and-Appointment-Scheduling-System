// import React, { useEffect, useState } from "react";
// import { useDispatch } from "react-redux";
// import Layout from "../components/Layout";
// import { showLoading, hideLoading } from "../redux/alertsSlice";
// import { toast } from "react-hot-toast";
// import axios from "axios";
// import { Table } from "antd";
// import moment from "moment";

// function Appointments() {
//   const [appointments, setAppointments] = useState([]);
//   const dispatch = useDispatch();
//   const getAppointmentsData = async () => {
//     try {
//       dispatch(showLoading());
//       const resposne = await axios.get("/api/user/get-appointments-by-user-id", {
//         headers: {
//           Authorization: `Bearer ${localStorage.getItem("token")}`,
//         },
       
//       });
//       dispatch(hideLoading());
//       if (resposne.data.success) {
//         setAppointments(resposne.data.data);
//       }
//     } catch (error) {
//       dispatch(hideLoading());
//     }
//   };
//   const validateAppointmentTime = (record) => {
//     const appointmentTime = moment(record.time, "HH:mm");
//     const consultationStart = moment(record.doctorInfo.consultationStart, "HH:mm");
//     const consultationEnd = moment(record.doctorInfo.consultationEnd, "HH:mm");

//     if (appointmentTime.isBefore(consultationStart) || appointmentTime.isAfter(consultationEnd)) {
//       toast.error(`The selected time ${appointmentTime.format("HH:mm")} is outside the doctor's consultation hours of ${consultationStart.format("HH:mm")} to ${consultationEnd.format("HH:mm")}.`);
//       return false;
//     }
//     return true;
//   };
//   const columns = [
//     {
//         title: "Id",
//         dataIndex: "_id",
//     },
//     {
//       title: "Doctor",
//       dataIndex: "name",
//       render: (text, record) => (
//         <span>
//           {record.doctorInfo.firstName} {record.doctorInfo.lastName}
//         </span>
//       ),
//     },
//     {
//       title: "Phone",
//       dataIndex: "phoneNumber",
//       render: (text, record) => (
//         <span>
//           {record.doctorInfo.phoneNumber} 
//         </span>
//       ),
//     },
//     {
//       title: "Date & Time",
//       dataIndex: "createdAt",
//       render: (text, record) => (
//         <span>
//           {moment(record.date).format("DD-MM-YYYY")} {moment(record.time).format("HH:mm")}
//         </span>
//       ),
//     },
//     {
//         title: "Status",
//         dataIndex: "status",
//     }
//   ];
//   useEffect(() => {
//     getAppointmentsData();
//   }, []);
//   return  <Layout>
//   <h1 className="page-title">Appointments</h1>
//   <hr />
//   <Table columns={columns} dataSource={appointments} />
// </Layout>
// }

// export default Appointments;

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Layout from "../components/Layout";
import { showLoading, hideLoading } from "../redux/alertsSlice";
import { toast } from "react-hot-toast";
import axios from "axios";
import { Table, message, Modal } from "antd";
import moment from "moment";


function Appointments() {
  const { user } = useSelector((state) => state.user);
  const [appointments, setAppointments] = useState([]);
  const dispatch = useDispatch();
  const getAppointmentsData = async () => {
    console.log("hello hello hello");
    try {
      dispatch(showLoading());
      const response = await axios.get("/api/user/get-appointments-by-user-id", 
        {
        params: { userId: user._id },
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      //console.log("Api response"+response);
      dispatch(hideLoading());
      if (response.data.success) {
        setAppointments(response.data.data);
      }
    } catch (error) {
      dispatch(hideLoading());
    }
  };
  const cancelAppointment = (record) => {
    Modal.confirm({
      title: "Cancel Appointment",
      content: (
        <div>
          <p>Are you sure you want to cancel this appointment?</p>
          <p><strong>Doctor:</strong> {record.doctorInfo.firstName} {record.doctorInfo.lastName}</p>
          <p><strong>Time:</strong> {moment(record.date).format("DD-MM-YYYY")} at {moment(record.time).format("HH:mm")}</p>
        </div>
      ),
      okText: "Yes, Cancel",
      cancelText: "No",
      onOk: async () => {
        try {
          const response = await axios.delete(`/api/user/cancel-appointment/${record._id}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          });

          if (response.data.success) {
            message.success("Appointment canceled successfully!");
            setAppointments((prev) => prev.filter((appt) => appt._id !== record._id)); // Remove from UI
          } else {
            message.error("Failed to cancel appointment");
          }
        } catch (error) {
          console.error("Error canceling appointment:", error);
          message.error("Error canceling appointment");
        }
      },
    });
  };

  const columns = [
    // {
    //     title: "Id",
    //     dataIndex: "_id",
    // },
    {
      title: "Doctor",
      dataIndex: "name",
      render: (text, record) => (
        <span>
          {record.doctorInfo.firstName} {record.doctorInfo.lastName}
        </span>
      ),
    },
    {
      title: "Phone",
      dataIndex: "phoneNumber",
      render: (text, record) => (
        <span>
          {record.doctorInfo.phoneNumber} 
        </span>
      ),
    },
    {
      title: "Date & Time",
      dataIndex: "createdAt",
      render: (text, record) => (
        <span>
          {moment(record.date).format("DD-MM-YYYY")} {moment(record.time).format("HH:mm")}
        </span>
      ),
    },
    {
        title: "Status",
        dataIndex: "status",
    },
    {
      title: "Action",
      dataIndex: "action",
      render: (text, record) =>(
          <a
            onClick={() => cancelAppointment(record)}
          >
            Cancel
          </a>
        ),
    },

  ];
  useEffect(() => {
    getAppointmentsData();
  }, []);
  return  <Layout>
  <h1 className="page-title">Appointments</h1>
  <hr />
  <Table columns={columns} dataSource={appointments} />
</Layout>
}

export default Appointments;

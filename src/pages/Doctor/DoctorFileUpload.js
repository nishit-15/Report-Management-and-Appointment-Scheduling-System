import React, { useState } from "react";
import {
  Card,
  Form,
  Input,
  Button,
  Upload,
  message as antdMessage,
  Row,
  Col,
  Space,
} from "antd";
import {
  SearchOutlined,
  UploadOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import axios from "axios";

const DoctorFileUpload = ({ doctorId }) => {
  const [form] = Form.useForm();
  const [name, setName] = useState("");
  const [userId, setUserId] = useState("");
  const [file, setFile] = useState(null);
  const [responseMessage, setResponseMessage] = useState("");

  const searchUser = async () => {
    try {
      const response = await axios.get(`/api/doctor/search-user?name=${name}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setUserId(response.data.userId);
      if (response.data.userId) {
        //console.log("hala");
        setResponseMessage("User found successfully!");
        antdMessage.success("User found successfully!");
      } else {
        //console.log("halaerror");
        antdMessage.error("User not found");
      }
    } catch (error) {
      console.log(error);
      setResponseMessage("User not found");
    }
  };

  const uploadFile = async () => {
    if (!userId || !file) {
      setResponseMessage("Select user and file first");
      return;
    }

    const formData = new FormData();
    formData.append("pdf", file);
    formData.append("userId", userId);
    formData.append("doctorId", doctorId);

    try {
      await axios.post(
        "http://localhost:5000/api/doctor/upload-pdf",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setResponseMessage("File uploaded successfully");
    } catch (error) {
      setResponseMessage("Upload failed");
    }
  };

  return (
    // <div>
    //     <h2>Upload Patient Document</h2>
    //     <input
    //         type="text"
    //         placeholder="Enter user name"
    //         value={name}
    //         onChange={(e) => setName(e.target.value)}
    //     />
    //     <button onClick={searchUser}>Search</button>

    //     {userId && <p>User ID: {userId}</p>}

    //     <input type="file" onChange={(e) => setFile(e.target.files[0])} />
    //     <button onClick={uploadFile}>Upload PDF</button>

    //     {message && <p>{message}</p>}
    // </div>
    <div>
      {/* Search User Section */}
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        <Card title="Search User">
          <Form form={form} layout="vertical" onFinish={searchUser}>
            <Row gutter={16} align="middle">
              <Col flex="auto">
                <Form.Item
                  name="username"
                  label="User Name"
                  rules={[
                    { required: true, message: "Please enter the user name" },
                  ]}
                >
                  <Input
                    placeholder="Enter user name"
                    value={name}
                    onChange={(e) => setName(e.target.value)} // Ensure state updates
                  />
                </Form.Item>
              </Col>
              <Col>
                <Form.Item>
                  <Button type="primary" htmlType="submit">
                    Search
                  </Button>
                  {/* {message && <p>{message}</p>} */}
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Card>

        {/* Upload Document Section */}
        {userId && (
          <Card title="Upload Document">
            <Form layout="vertical">
              <Form.Item
                name="file"
                label="Upload PDF"
                valuePropName="fileList"
                getValueFromEvent={(e) => e.fileList}
                rules={[
                  { required: true, message: "Please upload a PDF file" },
                ]}
              >
                <Upload
                  accept=".pdf"
                  maxCount={1}
                  beforeUpload={(file) => {
                    setFile(file); // Save the selected file to state
                    return false; // Prevent auto-upload
                  }}
                >
                  <Button icon={<UploadOutlined />}>Select File</Button>
                </Upload>
              </Form.Item>
              <Button type="primary" onClick={uploadFile}>
                Upload
              </Button>
            </Form>
          </Card>
        )}
      </Space>
    </div>
  );
};

export default DoctorFileUpload;

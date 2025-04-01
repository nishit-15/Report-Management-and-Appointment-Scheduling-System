import React, { useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";

const ViewReport = ({ userId }) => {
    const { user } = useSelector((state) => state.user); // Get user from Redux
    //const userId = user?._id; // Get userId safely
    const [pdfUrl, setPdfUrl] = useState(null);
    // if (!userId) {
    //     return <p>User ID not found</p>;
    // }

    const fetchPDF = async () => {
        try {
            const userId = localStorage.getItem("userId");
            console.log(userId);
            
            const response = await axios.post(`http://localhost:5000/api/user/get-pdf`, 
                {userId},{
                responseType: "blob", // Important: Ensures we get binary data
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });

            // Create a blob URL for the PDF
            const url = window.URL.createObjectURL(new Blob([response.data], { type: "application/pdf" }));
            setPdfUrl(url);
        } catch (error) {
            console.error("Error fetching PDF:", error);
            alert("Failed to load PDF");
        }
    };

    return (
        <div>
            <h2>View Report</h2>
            <button onClick={fetchPDF}>Load Report</button>
            
            {pdfUrl && (
                <div>
                    <h3>PDF Preview:</h3>
                    <iframe src={pdfUrl} width="100%" height="500px" title="User Report"></iframe>
                </div>
            )}
        </div>
    );
};

export default ViewReport;

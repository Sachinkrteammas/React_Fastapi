import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Recording.css";
import Layout from "../layout"; 
import "../layout.css"; // Import styles
// import topLogo from "../assets/logo.png";
// import {
//   House,
//   Settings,
//   LogOut,
//   Captions,
//   AudioLines,
//   Terminal,
//   FileKey,
//   ChartNoAxesCombined,
// } from "lucide-react";

const Recordings = () => {
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadMessage, setUploadMessage] = useState("");



  const handleNavigation = (path) => {
    navigate(path);
  };

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
    setUploadMessage("");
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadMessage("Please select a file first.");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await axios.post("http://127.0.0.1:8095/upload-audio/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setUploadMessage(response.data.message);
      setSelectedFile(null);
      document.getElementById("fileInput").value = "";
    } catch (error) {
      setUploadMessage(error.response?.data?.detail || "Upload failed.");
    }
  };

  return (
    <Layout>
    
      <div className="main-content">
        
        <div className="recordings-box">
          <h2>Choose an Audio File</h2>
          <input
            type="file"
            accept="audio/mpeg,audio/wav"
            id="fileInput"
            className="browse-button"
            onChange={handleFileChange}
          />
          <button className="upload-button" onClick={handleUpload}>
            Upload
          </button>
          {uploadMessage && <p className="upload-message">{uploadMessage}</p>}
        </div>
      </div>
    </Layout>
  );
};

export default Recordings;


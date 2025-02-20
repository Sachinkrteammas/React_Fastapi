import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Recording.css";
import Layout from "../layout";
import "../layout.css"; // Import styles

const Recordings = () => {
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadMessage, setUploadMessage] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("English");
  const fileInputRef = useRef(null); // Use useRef to handle file input reset

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
      if (fileInputRef.current) {
        fileInputRef.current.value = ""; // Reset input field
      }
    } catch (error) {
      setUploadMessage(error.response?.data?.detail || "Upload failed.");
    }
  };

  return (
    <Layout>
      <div className="main-content">
        <div className="drop-record">
          <h1 className="word">Recordings</h1>
          <select value={selectedLanguage} onChange={(e) => setSelectedLanguage(e.target.value)}>
            <option value="English">English</option>
            <option value="Hindi">Hindi</option>
            <option value="Tamil">Tamil</option>
          </select>
        </div>

        <div className="recordings-box">
          <h2>Choose an Audio File</h2>
          <input
            type="file"
            accept="audio/mpeg,audio/wav"
            className="browse-button"
            onChange={handleFileChange}
            ref={fileInputRef} // Attach ref to input field
          />
          <button className="upload-button" onClick={handleUpload}>
            Upload
          </button>
          {uploadMessage && <p className="upload-message">{uploadMessage}</p>}
        </div>

        <div className="developer-box" >

        </div>
      </div>
    </Layout>
  );
};

export default Recordings;

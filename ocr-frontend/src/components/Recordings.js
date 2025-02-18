import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Recording.css"; 

import topLogo from "../assets/logo.png";
import {
  House,
  Settings,
  LogOut,
  Captions,
  AudioLines,
  Terminal,
  FileKey,
  ChartNoAxesCombined,
} from "lucide-react";

const Recordings = ({ onLogout }) => {
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadMessage, setUploadMessage] = useState("");

  const handleLogout = () => {
    localStorage.removeItem("token");
    sessionStorage.removeItem("user");
    onLogout();
    navigate("/");
  };

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
      document.getElementById("fileInput").value = "";
    } catch (error) {
      setUploadMessage(error.response?.data?.detail || "Upload failed.");
    }
  };

  return (
    <div className="dashboard-layout">
      {/* Top Navbar */}
      <div className="top-navbar">
        <img src={topLogo} alt="Company Logo" className="top-logo" />
      </div>

      {/* Main Content Layout */}
      <div className="content-layout">
        {/* Sidebar Navigation */}
        <div className="sidebar newsidebar">
          <button className="nav-button" onClick={() => handleNavigation("/")}>
            <House size={20} className="icon" /> Home
          </button>
          <button className="nav-button" onClick={() => handleNavigation("/Recordings")}>
            <AudioLines size={20} className="icon" /> Recordings
          </button>
          <button className="nav-button" onClick={() => handleNavigation("/Transcription")}>
            <Captions size={20} className="icon" /> Transcription
          </button>
          <button className="nav-button" onClick={() => handleNavigation("/Prompt")}>
            <Terminal size={20} className="icon" /> Prompt
          </button>
          <button className="nav-button" onClick={() => handleNavigation("/Settings")}>
            <Settings size={20} className="icon" /> Settings
          </button>
          <button className="nav-button" onClick={() => handleNavigation("/APIKey")}>
            <FileKey size={20} className="icon" /> API Key
          </button>
          <button className="nav-button" onClick={() => handleNavigation("/Analysis")}>
            <ChartNoAxesCombined size={20} className="icon" /> Analysis
          </button>
          <button className="nav-button logout-button" onClick={handleLogout}>
            <LogOut size={20} className="icon" /> Logout
          </button>
        </div>

        {/* Main Content Area */}
        <div className="main-content">
          <h2>Recordings</h2>
          <div className="recordings-box">
            <h2>Choose an Audio File</h2>
            <input type="file" accept="audio/mpeg,audio/wav" id="fileInput" className="browse-button" onChange={handleFileChange} />

            <button className="upload-button" onClick={handleUpload}>Upload</button>

            {uploadMessage && <p className="upload-message">{uploadMessage}</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Recordings;

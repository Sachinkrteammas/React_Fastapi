import React from "react";
import { useNavigate } from "react-router-dom";
import "./Recording.css"; // Import the CSS file

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

  const handleLogout = () => {
    localStorage.removeItem("token");
    sessionStorage.removeItem("user");
    onLogout();
    navigate("/");
  };

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <div className="dashboard-layout">
      {/* Top Navbar */}
      <div className="top-navbar">
        <img src={topLogo} alt="Company Logo" className="top-logo" />
      </div>

      {/* Main Content Layout */}
      <div className="content-layout">
        {/* Sidebar */}
        <div className="sidebar">
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
            <p>Choose Recordings</p>
            <button className="browse-button">Browse</button>
            <p>Or</p>
            <button className="upload-button">Upload</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Recordings;

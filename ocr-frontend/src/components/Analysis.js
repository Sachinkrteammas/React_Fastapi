import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./PromptPage.css"; // Import the new CSS file

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

const Analysis = ({ onLogout }) => {
  const navigate = useNavigate();
  const [name, setName] = useState("Sneha");
  const [keys, setKeys] = useState(["XXXXXXXXXXXX"]);
  const [newKey, setNewKey] = useState("");

  const addKey = () => {
    if (newKey.trim()) {
      setKeys([...keys, newKey]);
      setNewKey("");
    }
  };

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
          <button
            className="nav-button"
            onClick={() => handleNavigation("/Recordings")}
          >
            <AudioLines size={20} className="icon" /> Recordings
          </button>
          <button
            className="nav-button"
            onClick={() => handleNavigation("/Transcription")}
          >
            <Captions size={20} className="icon" /> Transcription
          </button>
          <button
            className="nav-button"
            onClick={() => handleNavigation("/Prompt")}
          >
            <Terminal size={20} className="icon" /> Prompt
          </button>
          <button
            className="nav-button"
            onClick={() => handleNavigation("/Settings")}
          >
            <Settings size={20} className="icon" /> Settings
          </button>
          <button
            className="nav-button"
            onClick={() => handleNavigation("/APIKey")}
          >
            <FileKey size={20} className="icon" /> API Key
          </button>
          <button
            className="nav-button"
            onClick={() => handleNavigation("/Analysis")}
          >
            <ChartNoAxesCombined size={20} className="icon" /> Analysis
          </button>
          <button className="nav-button logout-button" onClick={handleLogout}>
            <LogOut size={20} className="icon" /> Logout
          </button>
        </div>

        {/* Main Content */}
        <div className="main-content1">
          <div className="form-container">
            {/* Name Field */}
            <div className="form-group">
              <label>Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-field"
              />
            </div>

            {/* Key Section */}
            <div className="form-group">
              <label>Key</label>
              {keys.map((key, index) => (
                <input
                  key={index}
                  type="text"
                  value={key}
                  readOnly
                  className="input-field"
                />
              ))}
              <div className="input-group">
                <input
                  type="text"
                  value={newKey}
                  onChange={(e) => setNewKey(e.target.value)}
                  className="input-field"
                  placeholder="Enter new key"
                />
                <button onClick={addKey} className="add-key-btn">
                  Add key
                </button>
              </div>
            </div>

            {/* Value Field */}
            <div className="form-group">
              <label>Value</label>
              <input type="text" className="input-field" />
            </div>
          </div>

          {/* Right Display Section */}
          <div className="output-container">
            <h2>Created Prompt</h2>
            <div className="output-box"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analysis;

import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "./dashboard.css";

import topLogo from "./assets/logo.png";
import { Check, House, Settings, LogOut, Captions, AudioLines, Terminal, FileKey, ChartNoAxesCombined } from 'lucide-react';

const Dashboard = ({ onLogout }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    sessionStorage.removeItem("user");
    onLogout(); // This updates isLoggedIn state in App.js
    navigate("/"); // Redirect to login
  };

  return (
    <div className="dashboard-layout">
      {/* Top Navbar */}
      <div className="top-navbar">
        <img src={topLogo} alt="Company Logo" className="top-logo" />
      </div>

      {/* Main Content Layout (Sidebar + Content) */}
      <div className="content-layout">
        {/* Sidebar */}
        <div className="sidebar">
          <Link to="/" className="nav-button"><House size={20} className="icon" /> Home</Link>
          <Link to="/Recordings" className="nav-button"><AudioLines size={20} className="icon" /> Recordings</Link>
          <Link to="/Transcription" className="nav-button"><Captions size={20} className="icon" /> Transcription</Link>
          <Link to="/Prompt" className="nav-button"><Terminal size={20} className="icon" /> Prompt</Link>
          <Link to="/Settings" className="nav-button"><Settings size={20} className="icon" /> Settings</Link>
          <Link to="/APIKey" className="nav-button"><FileKey size={20} className="icon" /> API Key</Link>
          <Link to="/Analysis" className="nav-button"><ChartNoAxesCombined size={20} className="icon" /> Analysis</Link>
          <button className="nav-button logout-button" onClick={handleLogout}><LogOut size={20} className="icon" /> Logout</button>
        </div>

        {/* Main Content */}
        <div className="main-content">
          <h1 className="new">Recording Transcription</h1>
          <p><Check size={16} className="icon" /> Transcribe Recording</p>
          <p><Check size={16} className="icon" /> Service Analysis</p>
          <p><Check size={16} className="icon" /> Sales Analysis</p>
          <p><Check size={16} className="icon" /> Audit Call</p>
          <p><Check size={16} className="icon" /> Insights</p>
          <p><Check size={16} className="icon" /> Auto Tagging</p>
        </div>

        <div className="second-content">
          <h1 className="new">Addon’s API</h1>
          <p>Transcribe</p>
          <p>Upload</p>
          <p>Insights</p>
        </div>

        <div className="third-content">
          <h1 className="new">Learn</h1>
          <p>How to Upload</p>
          <p>API Usage</p>
          <p>Analysis Insights</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

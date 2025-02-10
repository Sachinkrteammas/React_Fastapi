import React from "react";
import { useNavigate } from "react-router-dom";
import "./dashboard.css";
import topLogo from "./assets/logo.png";
import { Check } from 'lucide-react';
import { House } from "lucide-react";
import { Settings } from 'lucide-react';
import { LogOut } from 'lucide-react';
import { Captions } from 'lucide-react';
import { AudioLines } from 'lucide-react';
import { Terminal } from 'lucide-react';

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
          <button className="nav-button"><House size={20} className="icon" />  Home</button>
          <button className="nav-button"><AudioLines size={20} className="icon" />  Recordings</button>
          <button className="nav-button"><Captions size={20} className="icon" />  Transcription</button>
          <button className="nav-button"><Terminal size={20} className="icon" />  Prompt</button>
          <button className="nav-button"><Settings size={20} className="icon" />  Settings</button>
          <button className="nav-button logout-button" onClick={handleLogout}><LogOut size={20} className="icon" />  Logout</button>
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
          <h1 className="new">Addon's API</h1>
          <p><Check size={16} className="icon" /> Transcribe</p>
          <p><Check size={16} className="icon" /> Upload</p>
          <p><Check size={16} className="icon" /> Insights</p>

          
        </div>
        <div className="third-content">
          <h1 className="new">Learn</h1>
          <p><Check size={16} className="icon" /> How to Upload</p>
          <p><Check size={16} className="icon" /> API Usage</p>
          <p><Check size={16} className="icon" /> Analysis Insights</p>
        </div>











      </div>
    </div>
  );
};

export default Dashboard;

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./dashboard.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import topLogo from "./assets/logo.png";
import { Check, House, Settings, LogOut, Captions, AudioLines, Terminal, FileKey, ChartNoAxesCombined } from "lucide-react";

const Dashboard = ({ onLogout }) => {
  const navigate = useNavigate();
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const handleLogout = () => {
    localStorage.removeItem("token");
    sessionStorage.removeItem("user");
    onLogout();
    navigate("/");
  };

  const handleNavigation = (path) => {
    navigate(path);
  };

  const handleDateChange = (date, type) => {
    if (type === "start") setStartDate(date);
    else setEndDate(date);
  };

  return (
    <div className="dashboard-layout">
      {/* Top Navbar */}
      <div className="top-navbar">
        <img src={topLogo} alt="Company Logo" className="top-logo" />
        <div className="top-text">
          <p>"Title to be decided"</p>
        </div>
      </div>

      {/* Main Content Layout (Sidebar + Content) */}
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
        <div className="flex-container">
          {/* Main Content */}
          <div className="main-content new123">
            <h1 className="new">Recording Transcription</h1>
            <p><Check size={16} className="icon" /> Transcribe Recording</p>
            <p><Check size={16} className="icon" /> Service Analysis</p>
            <p><Check size={16} className="icon" /> Sales Analysis</p>
            <p><Check size={16} className="icon" /> Audit Call</p>
            <p><Check size={16} className="icon" /> Insights</p>
            <p><Check size={16} className="icon" /> Auto Tagging</p>
          </div>

          <div className="main-content new12">
            <h1 className="new">Addon’s API</h1>
            <p>Transcribe</p>
            <p>Upload</p>
            <p>Insights</p>
          </div>

          <div className="main-content new1">
            <h1 className="new">Learn</h1>
            <p>How to Upload</p>
            <p>API Usage</p>
            <p>Analysis Insights</p>
          </div>

          {/* Usage Activity Section */}
          <div className="activity-section activity">
            <h4>Usage Activity</h4>
            <select>
              <option>Today</option>
              <option>Yesterday</option>
              <option>Week</option>
              <option>Month</option>
              <option>Custom</option>
            </select>

            <h4>Start Date</h4>
            <DatePicker className="datepic" selected={startDate} onChange={(date) => handleDateChange(date, "start")} />

            <h4>End Date</h4>
            <DatePicker className="datepic"  selected={endDate} onChange={(date) => handleDateChange(date, "end")} />
          </div>

          {/* Date Pickers */}

          {/* <div className="calender activity">
            <h4>Start Date</h4>
            <DatePicker selected={startDate} onChange={(date) => handleDateChange(date, "start")} />
          </div> */}
          {/* <div className="calender">
            <h4>End Date</h4>
            <DatePicker selected={endDate} onChange={(date) => handleDateChange(date, "end")} />
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

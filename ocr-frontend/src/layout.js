import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import topLogo from "./assets/logo.png";
import accountLogo from "./assets/account.png";
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

const Layout = ({ onLogout, children }) => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");

  useEffect(() => {
    const storedName = localStorage.getItem("username");
    setUsername(storedName ? storedName.split(" ")[0] : "");
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    sessionStorage.removeItem("user");
    if (onLogout) onLogout();
    navigate("/");
  };

  const handleNavigation = (path) => {
    navigate(path);
  };

  const menuItems = [
    { path: "/", label: "Home", Icon: House },
    { path: "/Recordings", label: "Recordings", Icon: AudioLines },
    { path: "/Transcription", label: "Transcription", Icon: Captions },
    { path: "/Prompt", label: "Prompt", Icon: Terminal },
    { path: "/Settings", label: "Settings", Icon: Settings },
    { path: "/APIKey", label: "API Key", Icon: FileKey },
    { path: "/Analysis", label: "Analysis", Icon: ChartNoAxesCombined },
  ];

  return (
    <div className="dashboard-layout5">
      {/* Top Navbar */}
      <div className="top-navbar">
        <img src={topLogo} alt="Company Logo" className="top-logo" />
        <div className="top-text">
          <p>"Title to be decided"</p>
        </div>
        <div className="account">
          <img src={accountLogo} alt="loginname" className="account-logo" />
          <span>{username}</span>
        </div>
      </div>

      {/* Main Content Layout (Sidebar + Content) */}
      <div className="content-layout5">
        {/* Sidebar */}
        <div className="sidebar5">
          {menuItems.map(({ path, label, Icon }) => (
            <button key={path} className="nav-button" onClick={() => handleNavigation(path)}>
              <Icon size={20} className="icon" /> {label}
            </button>
          ))}
          <button className="nav-button logout-button" onClick={handleLogout}>
            <LogOut size={20} className="icon" /> Logout
          </button>
        </div>
        {/* Main Content Area */}
        <div className="main-content">{children}</div>


      </div>
    </div>
  );
};

export default Layout;

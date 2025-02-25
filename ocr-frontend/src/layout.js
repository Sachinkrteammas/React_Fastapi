import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
  ChevronDown,
  ChevronRight,
  Search,
} from "lucide-react";

const Layout = ({ onLogout, children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState("");
  const [openMenus, setOpenMenus] = useState({});

  useEffect(() => {
    const storedName = localStorage.getItem("username");
    setUsername(storedName ? storedName.split(" ")[0] : "");
  }, []);

  useEffect(() => {
    // Keep submenu open if the current route is inside it
    menuItems.forEach(({ label, submenu }) => {
      if (submenu && submenu.some((item) => item.path === location.pathname)) {
        setOpenMenus((prev) => ({ ...prev, [label]: true }));
      }
    });
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("isLoggedIn");
    sessionStorage.removeItem("user");

    if (onLogout) onLogout(); // Update App.js state

    setTimeout(() => {
      window.location.href = "/"; // Ensure proper redirection
    }, 100);
  };

  // Toggle submenu when clicking the main menu item
  const toggleMenu = (menu) => {
    setOpenMenus((prev) => ({
      ...prev,
      [menu]: !prev[menu], // Toggle submenu state
    }));
  };

  // Navigate and keep submenu open
  const handleNavigation = (path, menu) => {
    navigate(path);
    if (menu) {
      setOpenMenus((prev) => ({
        ...prev,
        [menu]: true, // Ensure submenu stays open
      }));
    }
  };

  const menuItems = [
    { path: "/", label: "Home", Icon: House },
    { path: "/Recordings", label: "Recordings", Icon: AudioLines },
    { path: "/Transcription", label: "Transcription", Icon: Captions },
    { path: "/Prompt", label: "Prompt", Icon: Terminal },
    { path: "/Settings", label: "Settings", Icon: Settings },
    { path: "/APIKey", label: "API Key", Icon: FileKey },
    {
      label: "Analysis",
      Icon: ChartNoAxesCombined,
      submenu: [
        { path: "/Analysis", label: "Quality Performance" },
        // { path: "/QualityPerformance", label: "Quality Performance" },
        { path: "/FatalAnalysis", label: "Fatal Analysis" },
        { path: "/DetailAnalysis", label: "Detail Analysis" },
        { path: "/Search", label: "Search Lead", Icon: Search },
        { path: "/RawDownload", label: "Raw Download" },
        { path: "/RawDump", label: "Raw Dump" },
        { path: "/Potential", label: "Potential Escalation" },
      ],
    },
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
          {menuItems.map(({ path, label, Icon, submenu }) => (
            <div key={label}>
              {/* Main Menu Item */}
              <button
                className="nav-button"
                onClick={() => (submenu ? toggleMenu(label) : handleNavigation(path))}
              >
                <Icon size={20} className="icon" /> {label}
                {submenu && (openMenus[label] ? <ChevronDown size={16} /> : <ChevronRight size={16} />)}
              </button>

              {/* Submenu Items */}
              {submenu && openMenus[label] && (
                <div className="submenu">
                  {submenu.map(({ path, label }) => (
                    <button
                      key={path}
                      className={`sub-nav-button ${location.pathname === path ? "active" : ""}`}
                      onClick={() => handleNavigation(path, label)}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Logout Button */}
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

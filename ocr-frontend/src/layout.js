import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import topLogo from "./assets/logo.png";
import accountLogo from "./assets/account.png";
import { BASE_URL } from "./components/config";
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
  DollarSign,
  EyeOff,
  Phone,
  Boxes,
} from "lucide-react";

const iconMap = {
  House,
  Settings,
  LogOut,
  Captions,
  AudioLines,
  Terminal,
  FileKey,
  ChartNoAxesCombined,
  Search,
  DollarSign,
  EyeOff,
  Phone,
  Calling: Phone,
  Boxes,
};

const Layout = ({ onLogout, children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [username, setUsername] = useState("");
  const [menu, setMenu] = useState([]);
  const [openMenus, setOpenMenus] = useState(
    JSON.parse(localStorage.getItem("openMenus")) || {}
  );
  const [loading, setLoading] = useState(true);

  // Get username from localStorage
  useEffect(() => {
    const storedName = localStorage.getItem("username");
    setUsername(storedName ? storedName.split(" ")[0] : "");
  }, []);

  // Fetch and filter menu based on permissions
  useEffect(() => {
    const fetchMenu = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${BASE_URL}/menu`);
        if (!response.ok) throw new Error("Failed to fetch menu");
        const data = await response.json();

        const permissions = JSON.parse(localStorage.getItem("permissions") || "{}");

        // Always include Home
        let filteredMenu = data.filter(item => item.name === "Home");

        // Include Service/Sales if allowed
        if (permissions.service) {
          const serviceMenu = data.find(item => item.name === "Service");
          if (serviceMenu) filteredMenu.push(serviceMenu);
        }
        if (permissions.sales) {
          const salesMenu = data.find(item => item.name === "Sales");
          if (salesMenu) filteredMenu.push(salesMenu);
        }

        // Map icons
        const menuWithIcons = filteredMenu.map(item => ({
          ...item,
          Icon: iconMap[item.icon] || null,
        }));

        setMenu(menuWithIcons);
      } catch (error) {
        console.error("Failed to fetch menu:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMenu();
  }, []);

  // Persist open menus
  useEffect(() => {
    localStorage.setItem("openMenus", JSON.stringify(openMenus));
  }, [openMenus]);

  const toggleMenu = (menuName) => {
    setOpenMenus(prev => {
      const newState = { ...prev, [menuName]: !prev[menuName] };
      localStorage.setItem("openMenus", JSON.stringify(newState));
      return newState;
    });
  };

  const handleNavigation = (path, menuName) => {
    if (path) navigate(path);
    if (menuName) {
      setOpenMenus(prev => {
        const newState = { ...prev, [menuName]: true };
        localStorage.setItem("openMenus", JSON.stringify(newState));
        return newState;
      });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("openMenus");
    localStorage.removeItem("permissions");
    if (onLogout) onLogout();
    window.location.href = "/";
  };

  return (
    <div className="dashboard-layout5">
      {/* Top Navbar */}
      <div className="top-navbar">
        <img src={topLogo} alt="Company Logo" className="top-logo" />
        <div className="top-text">
          <p>Your Transcription & Analysis Hub!</p>
        </div>
        <div className="account">
          <img src={accountLogo} alt="loginname" className="account-logo" />
          <span>{username}</span>
        </div>
      </div>

      {/* Sidebar + Main Content */}
      <div className="content-layout5">
        <div className="sidebar5">
          {loading ? (
            <p>Loading menu...</p>
          ) : (
            menu.map(({ url, name, Icon, submenu }) => (
              <div key={name}>
                <button
                  className={`nav-button ${location.pathname === url ? "active" : ""}`}
                  title={submenu.length ? `Expand ${name} menu` : `Go to ${name}`}
                  onClick={() => (submenu.length ? toggleMenu(name) : handleNavigation(url))}
                >
                  {Icon && <Icon size={20} className="icon" />} {name}
                  {submenu.length > 0 &&
                    (openMenus[name] ? <ChevronDown size={16} /> : <ChevronRight size={16} />)}
                </button>

                {submenu.length > 0 && openMenus[name] && (
                  <div className="submenu">
                    {submenu.map(({ url, name, icon }) => {
                      const SubIcon = iconMap[icon] || null;
                      return (
                        <button
                          key={url}
                          className={`sub-nav-button ${location.pathname === url ? "active" : ""}`}
                          title={`Go to ${name}`}
                          onClick={() => handleNavigation(url, name)}
                        >
                          {SubIcon && <SubIcon size={16} className="icon" />} {name}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            ))
          )}

          {/* Separate Logout Button */}
          <button
            className="nav-button logout-button"
            title="Log out of your account"
            onClick={handleLogout}
          >
            <LogOut size={20} className="icon" /> Logout
          </button>
        </div>

        <div className="main-content">{children}</div>
      </div>
    </div>
  );
};

export default Layout;

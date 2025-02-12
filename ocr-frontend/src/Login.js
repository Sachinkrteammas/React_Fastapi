import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios"; // Import axios for API requests
import "./App.css";
import myImage from "./assets/image.jpg";
import logo from "./assets/logo.png";

const Login = ({ onLogin }) => {
  const navigate = useNavigate();
  const [email_id, setEmail] = useState(""); // Use 'email_id' to match backend
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(""); // Clear previous errors

    if (!email_id || !password) {
      setMessage("⚠️ Please enter both email and password.");
      return;
    }

    try {
      const response = await axios.post("http://127.0.0.1:9006/login", {
        email_id, // Send email_id (ensure your backend expects this)
        password
      });

      if (response.status === 200) {
        localStorage.setItem("token", response.data.token); // Store token
        onLogin(); // Call login state function
        navigate("/dashboard"); // Redirect to dashboard
      } else {
        setMessage("❌ Login failed. Please try again.");
      }
    } catch (error) {
      console.error("Login error:", error);
      setMessage("❌ Invalid email or password.");
    }
  };

  return (
    <div className="container1">
      {/* Left Section */}
      <div className="image-section">
        <img src={myImage} alt="Preview" className="image-preview" />
      </div>
      <div className="logo">
        <img src={logo} alt="Logo" className="logo-overlay" />
        <div className="welcome-text">Welcome to DialDesk</div>
      </div>

      {/* Right Section */}
      <div className="login-section">
        <h1>Glad to see you back!</h1>
        <h4>Login to continue.</h4>
        <p className="sub-text">Please enter your email and password.</p>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              value={email_id}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g., xyz@gmail.com"
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div><br />

          {message && <p className="error">{message}</p>}

          <button type="submit" className="login-button">Login</button>
        </form>

        <p>
          Don't have an account? <Link to="/signup">Sign up here</Link> |
          <Link to="/forgot-password/testtoken">Forgot Password?</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;

import React, { useState } from "react";
import './App.css'; // Assuming Login.js is inside src/
import myImage from './assets/image.jpg';
import logo from './assets/logo.png';
import { Link, useNavigate } from "react-router-dom";


const Login = ({ onLogin }) => {
  const navigate = useNavigate(); // Initialize navigate
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  

  const handleLogin = () => {
    localStorage.setItem("token", "user-auth-token"); // Simulating login
    onLogin(); // Updates isLoggedIn state in App.js
    navigate("/dashboard"); // Redirect to dashboard
  };

  

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill out both fields.");
    } else {
      setError("");
      onLogin(); // Call the function to update login state
    }
  };

  return (
    <div className="container1">
      {/* Left Section (Image) */}
      <div className="image-section">
        <img src={myImage} alt="Preview" className="image-preview" />
      </div>
      <div className="logo">
          <img src={logo} alt="Logo" className="logo-overlay" />
          <div className="welcome-text">Welcome to DialDesk</div>
      </div>

      {/* Right Section (Login) */}
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
              value={email}
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
              placeholder="XXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
              required
            />
          </div><br></br>
          {error && <p className="error">{error}</p>}
          <button type="submit" className="login-button">
            Login
          </button>
        </form>
        <p>
          Don't have an account? <Link to="/signup">Sign up here.........</Link>
          <Link to="/forgot-password/testtoken">Forgot Password?</Link>
        </p>


      </div>
    </div>
  );
};

export default Login;

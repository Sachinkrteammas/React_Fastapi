import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./App.css"; // Assuming Login.js is inside src/
import myImage from "./assets/image.jpg";
import logo from "./assets/logo.png";

const Signup = () => {
  const [formData, setFormData] = useState({
    name: "",
    contactNumber: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(""); // Clear error when user types
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    console.log("Signup Successful", formData);
    alert("Signup Successful!");
    // Proceed with API call or navigation
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

      {/* Right Section */}

      <div className="login-section">
        <h2>Signup</h2>
        <form onSubmit={handleSubmit}>
          <div className="input-group">

            <label htmlFor="name">Name:</label>
            <input
              type="text"
              name="name"
              placeholder="Name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="contactNumber">Contact Number:</label>
            <input
              type="text"
              id="contactNumber"
              name="contactNumber"
              placeholder="Contact Number"
              value={formData.contactNumber}  // Ensure the correct state key
              onChange={handleChange}
              required
            />
          </div>


          <div className="input-group">
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="confirmPassword">Confirm Password:</label>
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div><br></br>

          {error && <p className="error">{error}</p>}

          <button type="submit">Signup</button>
        </form>


        <p>
          Already have an account? <Link to="/">Login here</Link>
        </p>
      </div>

    </div>
  );
};

export default Signup;

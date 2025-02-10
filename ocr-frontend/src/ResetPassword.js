import React, { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import './App.css'; 
import myImage from './assets/image.jpg';
import logo from './assets/logo.png';

const ResetPassword = () => {
    const { token } = useParams(); // Get token from URL
    const navigate = useNavigate();
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [message, setMessage] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setMessage("❌ Passwords do not match!");
            return;
        }

        try {
            const response = await fetch("http://localhost:5000/api/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, password }),
            });

            const data = await response.json();
            if (response.ok) {
                setMessage("✅ Password reset successful! Redirecting...");
                setTimeout(() => navigate("/"), 2000);
            } else {
                setMessage(`❌ ${data.message || "Failed to reset password."}`);
            }
        } catch (error) {
            setMessage("❌ Server error. Please try again.");
        }
    };

    return (
        <div className="container1">
            {/* Left Section (Image) */}
            <div className="image-section">
                <img src={myImage} alt="Preview" className="image-preview" />
            </div>

            {/* Logo & Welcome Text */}
            <div className="logo">
                <img src={logo} alt="Logo" className="logo-overlay" />
                <div className="welcome-text">Welcome to DialDesk</div>
            </div>

            {/* Right Section (Reset Password Form) */}
            <div className="login-section">
                <h2>Reset Password</h2>
                
                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <input
                            type="password"
                            placeholder="New Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        /><br></br> {/* for break line */}
                        <input
                            type="password"
                            placeholder="Confirm Password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div><br></br> {/* for break line */}
                    <button type="submit">Reset Password</button>
                </form>

                {/* Message Display */}
                {message && <p className="message">{message}</p>}

                {/* Back to Login */}
                <p>
                    <Link to="/">Back to Login</Link>
                </p>
            </div>
        </div>
    );
};

export default ResetPassword;

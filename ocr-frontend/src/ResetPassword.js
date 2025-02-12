import React, { useState } from "react";
import { Link, useParams,useLocation, useNavigate } from "react-router-dom";
import './App.css';
import myImage from './assets/image.jpg';
import logo from './assets/logo.png';


const ResetPassword = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const email = location.state?.email || ""; // ✅ Ensure email is passed correctly

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [message, setMessage] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setMessage("❌ Passwords do not match!");
            return;
        }

        // ✅ Navigate to login page after successful reset
        setMessage("✅ Password reset successfully!");
        setTimeout(() => navigate("/"), 2000); // Redirect after 2 seconds
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
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        /><br></br> 
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

import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom"; 
import "./App.css";
import myImage from "./assets/image.jpg";
import logo from "./assets/logo.png";

const VerifyPassword = () => {
    const location = useLocation();
    const navigate = useNavigate(); 
    const [email] = useState(location.state?.email || ""); 
    const [otp, setOtp] = useState("");

    // ✅ Navigate to Reset Password Page After OTP Verification
    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Navigating to Reset Password page...");  // Debugging log
        navigate("/ResetPassword", { state: { email } });  // ✅ Ensure correct navigation
    };

    return (
        <div className="container1">
            <div className="image-section">
                <img src={myImage} alt="Preview" className="image-preview" />
            </div>

            <div className="logo">
                <img src={logo} alt="Logo" className="logo-overlay" />
                <div className="welcome-text">Welcome to DialDesk</div>
            </div>

            <div className="login-section">
                <h2>Verify OTP</h2>

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <input type="email" value={email} disabled />
                    </div>

                    <div className="input-group">
                        <input
                            type="text"
                            placeholder="Enter your OTP"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit">Verify OTP</button>
                </form>

                <p>
                    <Link to="/">Back to Login</Link>
                </p>
            </div>
        </div>
    );
};

export default VerifyPassword;

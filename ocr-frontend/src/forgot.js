import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./App.css";
import myImage from "./assets/image.jpg";
import logo from "./assets/logo.png";

const ForgotPassword = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!email) {
            alert("Please enter your email.");
            return;
        }

        // Navigate to the VerifyPassword page with email as state
        navigate("/verify", { state: { email } });
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
                <h2>Forgot Password</h2>

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <input
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit">Request Reset Link</button>
                </form>

                <p>
                    <Link to="/">Back to Login</Link>
                </p>
            </div>
        </div>
    );
};

export default ForgotPassword;

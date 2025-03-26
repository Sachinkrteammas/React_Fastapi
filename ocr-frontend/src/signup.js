import React, { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { Eye, EyeOff } from "lucide-react";
import "./App.css";
import myImage from "./assets/image.jpg";
import logo from "./assets/logo.png";
import { BASE_URL } from "./components/config";

const Signup = () => {
    const [formData, setFormData] = useState({
        username: "",
        email_id: "",
        contact_number: "",
        password: "",
        confirm_password: "",
        otp: ""
    });

    const [message, setMessage] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [otpSent, setOtpSent] = useState(false);
    const [otpVerified, setOtpVerified] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Function to Send OTP
    const handleSendOtp = async () => {
        setMessage("");
        if (!formData.email_id || !formData.contact_number) {
            setMessage("⚠️ Email and Contact Number are required for OTP.");
            return;
        }

        try {
            const response = await axios.post(`${BASE_URL}/send-otp`, {
                email_id: formData.email_id,
                contact_number: formData.contact_number
            });
            setOtpSent(true);
            setMessage(`✅ OTP sent to ${formData.email_id} and ${formData.contact_number}`);
        } catch (error) {
            setMessage("❌ Failed to send OTP. Try again.");
        }
    };

    // Function to Verify OTP
    const handleVerifyOtp = async () => {
        setMessage("");
        if (!formData.otp) {
            setMessage("⚠️ Enter OTP before verifying.");
            return;
        }

        try {
            const response = await axios.post(`${BASE_URL}/verify-otp`, {
                email_id: formData.email_id,
                contact_number: formData.contact_number,
                otp: formData.otp
            });

            if (response.data.success) {
                setOtpVerified(true);
                setMessage("✅ OTP verified. You can now set your password.");
            } else {
                setMessage("❌ Invalid OTP. Please try again.");
            }
        } catch (error) {
            setMessage("❌ OTP verification failed.");
        }
    };

    // Final Signup Submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!otpVerified) {
            setMessage("⚠️ Please verify OTP before signing up.");
            return;
        }

        if (formData.password !== formData.confirm_password) {
            setMessage("❌ Passwords do not match!");
            return;
        }

        try {
            const response = await axios.post(`${BASE_URL}/register`, formData);
            setMessage(`✅ ${response.data.detail || "Registration successful!"}`);
        } catch (error) {
            setMessage("❌ Registration failed.");
        }
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
                <h2>Signup</h2>
                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label htmlFor="username">Name:</label>
                        <input
                            type="text"
                            name="username"
                            placeholder="Name"
                            value={formData.username}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="input-group">
                        <label htmlFor="company">Company Name:</label>
                        <input
                            type="text"
                            name="company"
                            placeholder="Company Name"
                            value={formData.company}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label htmlFor="email_id">Email:</label>
                        <input
                            type="email"
                            name="email_id"
                            placeholder="Email"
                            value={formData.email_id}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label htmlFor="contact_number">Contact Number:</label>
                        <input
                            type="text"
                            name="contact_number"
                            placeholder="Contact Number"
                            value={formData.contact_number}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    {!otpSent ? (
                        <button type="button" onClick={handleSendOtp}>Send OTP</button>
                    ) : (
                        <div className="input-group">
                            <label htmlFor="otp">Enter OTP:</label>
                            <input
                                type="text"
                                name="otp"
                                placeholder="Enter OTP"
                                value={formData.otp}
                                onChange={handleChange}
                                required
                            />
                            <button type="button" onClick={handleVerifyOtp}>Verify OTP</button>
                        </div>
                    )}

                    {otpVerified && (
                        <>
                            <div className="input-group password-group">
                                <label htmlFor="password">Password:</label>
                                <div className="password-wrapper">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        placeholder="Password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                    />
                                    <span
                                        className="eye-icon"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </span>
                                </div>
                            </div>

                            <div className="input-group password-group">
                                <label htmlFor="confirm_password">Confirm Password:</label>
                                <div className="password-wrapper">
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        name="confirm_password"
                                        placeholder="Confirm Password"
                                        value={formData.confirm_password}
                                        onChange={handleChange}
                                        required
                                    />
                                    <span
                                        className="eye-icon"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    >
                                        {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </span>
                                </div>
                            </div>

                            <button type="submit">Signup</button>
                        </>
                    )}

                    {message && <p className="error">{message}</p>}

                </form>

                <p>
                    Already have an account? <Link to="/">Login here</Link>
                </p>
            </div>
        </div>
    );
};

export default Signup;

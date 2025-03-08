import React, { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { Eye, EyeOff } from "lucide-react"; // ✅ Import professional eye icons
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
        confirm_password: ""
    });

    const [message, setMessage] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");

        const { username, email_id, contact_number, password, confirm_password } = formData;

        if (!username || !email_id || !contact_number || !password || !confirm_password) {
            setMessage("⚠️ All fields are required.");
            return;
        }

        if (password !== confirm_password) {
            setMessage("❌ Passwords do not match!");
            return;
        }

        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(email_id)) {
            setMessage("❌ Invalid email format.");
            return;
        }

        if (!/^\d{10}$/.test(contact_number)) {
            setMessage("❌ Phone number must be exactly 10 digits.");
            return;
        }

        if (password.length < 6) {
            setMessage("❌ Password must be at least 6 characters long.");
            return;
        }

        try {
            const response = await axios.post(`${BASE_URL}/register`, formData);
            setMessage(`✅ ${response.data.detail || "Registration successful!"}`);
        } catch (error) {
            console.error("Registration error:", error);
            let errorMessage = "❌ Registration failed.";
            if (error.response?.data?.detail) {
                errorMessage = `❌ ${error.response.data.detail}`;
            } else if (error.code === "ECONNREFUSED") {
                errorMessage = "❌ Server not reachable. Check your API connection.";
            }
            setMessage(errorMessage);
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

                    {/* Password Field with Toggle Eye Icon */}
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

                    {/* Confirm Password Field with Toggle Eye Icon */}
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

                    <br />
                    {message && <p className="error">{message}</p>}

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

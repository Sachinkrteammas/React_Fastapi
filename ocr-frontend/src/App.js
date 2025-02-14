import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./Login";
import Signup from "./signup";
import ResetPassword from "./ResetPassword";
import Dashboard from "./dashboard";
import ForgotPassword from "./forgot";
import VerifyPassword from "./verify";
import APIKey from "./components/APIKey";
import Analysis from "./components/Analysis";
import Prompt from "./components/Prompt";
import Recordings from "./components/Recordings";
import Settings from "./components/Settings";
import Transcription from "./components/Transcription";





const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogout = () => {
    setIsLoggedIn(false);
    console.log("User logged out");
  };

  return (
    <Router>
      <Routes>
        {/* Login Page */}
        <Route
          path="/" element={isLoggedIn ? <Navigate to="/dashboard" /> : <Login onLogin={() => setIsLoggedIn(true)} />} />

        {/* Signup Route */}
        <Route path="/signup" element={<Signup />} />

        <Route path="/forgot-password/:token" element={<ForgotPassword />} />
        <Route path="/verify" element={<VerifyPassword />} />


        {/* Reset Password Route (Fixed Path) */}
        <Route path="/ResetPassword" element={<ResetPassword />} />

        {/* Protected Route: OCR Page (Requires Login) */}
        <Route
          path="/dashboard" element={isLoggedIn ? <Dashboard onLogout={() => setIsLoggedIn(false)} /> : <Navigate to="/" />} 
        />



        <Route path="/Recordings" element={<Recordings onLogout={handleLogout} />} />
        <Route path="/Transcription" element={<Transcription />} />
        <Route path="/prompt" element={<Prompt onLogout={handleLogout} />} />
        <Route path="/Settings" element={<Settings />} />
        <Route path="/APIKey" element={<APIKey />} />
        <Route path="/Analysis" element={<Analysis />} />
        {/* Catch-all route (redirect unknown paths to login) */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
};

export default App;

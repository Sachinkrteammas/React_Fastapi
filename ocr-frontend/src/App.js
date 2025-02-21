import React, { useState, useEffect } from "react";
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
import Search from "./components/Search";
import QualityPerformance from "./components/QualityPerformance";
import RawDump from "./components/RawDump";
import RawDownload from "./components/RawDownload";
import Fatal from "./components/FatalAnalysis";
import Details from "./components/DetailAnalysis";
import Potential from "./components/Potential";
import "./Pages.css";

const ProtectedRoute = ({ element, isLoggedIn }) => {
  return isLoggedIn ? element : <Navigate to="/" replace />;
};

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(
    localStorage.getItem("isLoggedIn") === "true"
  );

  useEffect(() => {
    localStorage.setItem("isLoggedIn", isLoggedIn);
  }, [isLoggedIn]);

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem("isLoggedIn"); // Clear login state
    localStorage.removeItem("token");
    sessionStorage.removeItem("user");
    console.log("User logged out");

    setTimeout(() => {
      window.location.href = "/"; // Ensure full redirect
    }, 100);
  };

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={isLoggedIn ? <Navigate to="/dashboard" replace /> : <Login onLogin={() => setIsLoggedIn(true)} />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password/:token" element={<ForgotPassword />} />
        <Route path="/verify" element={<VerifyPassword />} />
        <Route path="/ResetPassword" element={<ResetPassword />} />

        {/* Protected Routes */}
        <Route path="/dashboard" element={<ProtectedRoute isLoggedIn={isLoggedIn} element={<Dashboard onLogout={handleLogout} />} />} />
        <Route path="/Recordings" element={<ProtectedRoute isLoggedIn={isLoggedIn} element={<Recordings onLogout={handleLogout} />} />} />
        <Route path="/Transcription" element={<ProtectedRoute isLoggedIn={isLoggedIn} element={<Transcription onLogout={handleLogout}/>} />} />
        <Route path="/prompt" element={<ProtectedRoute isLoggedIn={isLoggedIn} element={<Prompt onLogout={handleLogout} />} />} />
        <Route path="/Settings" element={<ProtectedRoute isLoggedIn={isLoggedIn} element={<Settings onLogout={handleLogout}/>} />} />
        <Route path="/APIKey" element={<ProtectedRoute isLoggedIn={isLoggedIn} element={<APIKey onLogout={handleLogout}/>} />} />
        <Route path="/Analysis" element={<ProtectedRoute isLoggedIn={isLoggedIn} element={<Analysis onLogout={handleLogout}/>} />} />
        <Route path="/Search" element={<ProtectedRoute isLoggedIn={isLoggedIn} element={<Search onLogout={handleLogout}/>} />} />
        <Route path="/QualityPerformance" element={<ProtectedRoute isLoggedIn={isLoggedIn} element={<QualityPerformance onLogout={handleLogout}/>} />} />
        <Route path="/RawDump" element={<ProtectedRoute isLoggedIn={isLoggedIn} element={<RawDump onLogout={handleLogout}/>} />} />
        <Route path="/RawDownload" element={<ProtectedRoute isLoggedIn={isLoggedIn} element={<RawDownload onLogout={handleLogout}/>} />} />
        <Route path="/FatalAnalysis" element={<ProtectedRoute isLoggedIn={isLoggedIn} element={<Fatal onLogout={handleLogout}/>} />} />
        <Route path="/DetailAnalysis" element={<ProtectedRoute isLoggedIn={isLoggedIn} element={<Details onLogout={handleLogout}/>} />} />
        <Route path="/Potential" element={<ProtectedRoute isLoggedIn={isLoggedIn} element={<Potential onLogout={handleLogout}/>} />} />


        {/* Catch-all route (redirect unknown paths to login) */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;

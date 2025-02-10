import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
// import OCRScan from "./OCRScan";
import Login from "./Login";
import Signup from "./signup";
import ResetPassword from "./ResetPassword"; 
import Dashboard from "./dashboard";


const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <Router>
      <Routes>
        {/* Login Page */}
        <Route 
          path="/" element={isLoggedIn ? <Navigate to="/dashboard" /> : <Login onLogin={() => setIsLoggedIn(true)} />} />

        {/* Signup Route */}
        <Route path="/signup" element={<Signup />} />

        {/* Reset Password Route (Fixed Path) */}
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* Protected Route: OCR Page (Requires Login) */}
        <Route 
          path="/dashboard" element={isLoggedIn ? <Dashboard onLogout={() => setIsLoggedIn(false)} /> : <Navigate to="/" />} />

        {/* Catch-all route (redirect unknown paths to login) */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
};

export default App;

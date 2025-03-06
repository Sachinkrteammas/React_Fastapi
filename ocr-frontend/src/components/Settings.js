import React, { useState } from "react";
import Layout from "../layout"; 
import "../layout.css"; 
import "./Settings.css"

export default function Settings() {
  const [organizationName, setOrganizationName] = useState("");
  const [paymentInfo, setPaymentInfo] = useState("UPI");
  const [ratePerMin, setRatePerMin] = useState("");
  const [limit, setLimit] = useState("");

  const handleSave = () => {
    const settingsData = {
      organizationName,
      paymentInfo,
      ratePerMin,
      limit,
    };
    console.log("Saved Settings:", settingsData);
    alert("Settings saved successfully!");
  };

  return (
    <Layout>
      <h1>Settings</h1>
      <div className="settings-container">
        <label>Organization Name:</label>
        <input
          type="text"
          value={organizationName}
          onChange={(e) => setOrganizationName(e.target.value)}
          placeholder="Enter organization name"
        />

        <label>Payment Info:</label>
        <select value={paymentInfo} onChange={(e) => setPaymentInfo(e.target.value)}>
          <option value="UPI">UPI</option>
          <option value="Networking">NetBanking</option>
          <option value="Free">Free</option>
        </select>

        <label>Rate/Min:</label>
        <input
          type="number"
          value={ratePerMin}
          onChange={(e) => setRatePerMin(e.target.value)}
          placeholder="Enter rate per minute"
        />

        <label>Limit:</label>
        <input
          type="number"
          value={limit}
          onChange={(e) => setLimit(e.target.value)}
          placeholder="Enter limit"
        />

        <button onClick={handleSave}>Save</button>
      </div>
    </Layout>
  );
}

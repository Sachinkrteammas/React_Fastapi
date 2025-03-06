import React, { useState } from "react";
import Layout from "../layout"; // Import layout component
import "../layout.css"; // Import styles
import "./RawDown.css";

const RawDownload = () => {
  const [leadId, setLeadId] = useState("");
  const [data, setData] = useState([]);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [loading, setLoading] = useState(false);

  const formatDate = (date) => {
    return date.toISOString().split("T")[0]; // Convert Date to YYYY-MM-DD
  };

  const fetchCallQualityDetails = async () => {
    if (!startDate || !endDate) {
      alert("Please select both Start and End dates.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `http://127.0.0.1:8097/call_quality_assessments?client_id=375&start_date=${formatDate(
          startDate
        )}&end_date=${formatDate(endDate)}`
      );
      if (!response.ok) throw new Error("Failed to fetch data");

      const result = await response.json();

      const formattedData = result.map((item) => ({
        clientId: item.ClientId,
        callDate: item.CallDate,
        leadId: item.lead_id,
        agentName: item.User,
        scenario: item.scenario,
        scenario1: item.scenario1,
        scenario2: item.scenario2,
        scenario3: item.scenario3,
        Competitor_Name: item.Competitor_Name || "N/A",
        Customer_Connection: item.length_in_sec > 0 ? "true" : "false",
      }));

      setData(formattedData);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="Down-dashboard">
        <header className="header">
          <h3>DialDesk</h3>
          <div className="setheaderdivdetails">
            <label>
              <input
                type="date"
                value={formatDate(startDate)}
                onChange={(e) => setStartDate(new Date(e.target.value))}
              />
            </label>
            <label>
              <input
                type="date"
                value={formatDate(endDate)}
                onChange={(e) => setEndDate(new Date(e.target.value))}
              />
            </label>
            <label>
              <input
                className="setsubmitbtn"
                value={"Submit"}
                readOnly
                onClick={fetchCallQualityDetails}
              />
            </label>
          </div>
        </header>

        {/* Content Wrapper */}
        <div className={`content-wrapper ${loading ? "blurred" : ""}`}>
          <table>
            <thead>
              <tr>
                <th>ClientId</th>
                <th>CallDate</th>
                <th>Lead ID</th>
                <th>Agent Name</th>
                <th>Scenario</th>
                <th>Scenario1</th>
                <th>Scenario2</th>
                <th>Scenario3</th>
                <th>Competitor Name</th>
                <th>Customer Connection</th>
              </tr>
            </thead>
            <tbody>
              {data.length > 0 ? (
                data.map((row, index) => (
                  <tr key={index}>
                    <td>{row.clientId}</td>
                    <td>{row.callDate}</td>
                    <td>{row.leadId}</td>
                    <td>{row.agentName}</td>
                    <td>{row.scenario}</td>
                    <td>{row.scenario1}</td>
                    <td>{row.scenario2}</td>
                    <td>{row.scenario3}</td>
                    <td>{row.Competitor_Name}</td>
                    <td>{row.Customer_Connection}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="10" style={{ textAlign: "center" }}>
                    No data found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Loader Overlay */}
        {loading && (
          <div className="loader-overlay">
            <div className="windows-spinner"></div>
            <p className="Loading">Loading...</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default RawDownload;

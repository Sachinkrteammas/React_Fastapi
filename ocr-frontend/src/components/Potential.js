import React, { useState } from "react";
import { PieChart, Pie, Cell, Legend, Tooltip } from "recharts";
import Layout from "../layout"; // Import layout component
import "../layout.css"; // Import styles
import "./Potential.css";

const Potential = () => {
  const [clientId, setClientId] = useState("375");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [escalationData, setEscalationData] = useState(null);
  const [escalations, setEscalations] = useState([]);
  const [loading, setLoading] = useState(false); // ✅ Added loading state

  const pieChartData = [
    { name: "Top Negative Signals", value: 2, color: "#c0392b" },
    { name: "Social Media and Consumer Court Threat", value: 3, color: "#e74c3c" },
  ];

  const fetchCallQualityDetails = async () => {
    if (!clientId || !startDate || !endDate) {
      alert("Please enter Client ID and select Start and End dates.");
      return;
    }

    setLoading(true); // ✅ Start loading before fetching data

    try {
      const response = await fetch(
        `http://127.0.0.1:8097/call_quality_assessments?client_id=${clientId}&start_date=${startDate}&end_date=${endDate}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }

      const result = await response.json();

      if (result.length > 0) {
        setEscalationData(result[0]);
        setEscalations(result);
      } else {
        setEscalationData(null);
        setEscalations([]);
        alert("No escalation data found for selected criteria.");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false); // ✅ Stop loading after fetching data
    }
  };

  return (
    <Layout>
      {/* <div className="dashboard-container-po"> */}
      <div className={`dashboard-container-po ${loading ? "blurred" : ""}`}>
        {/* Header Section */}
        <header className="headerPo">
          <h3>DialDesk</h3>
          <div className="setheaderdivdetails">
          <label> 
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          </label>

          <label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
          </label>

          <input className="setsubmitbtn" value={"Submit"} readOnly onClick={fetchCallQualityDetails}/>
          </div>
            
        </header>

        {/* ✅ Show loading state */}
        
          <div className="content">
            {/* Left Section - Pie Chart */}
            <div className="chart-container">
              <h3 className="Po-text">Recent Escalation</h3>
              <PieChart width={250} height={250}>
                <Pie data={pieChartData} dataKey="value" outerRadius={80} fill="#8884d8" label>
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend
                  wrapperStyle={{
                    position: "absolute",
                    width: "210px",
                    height: "auto",
                    left: "215px",
                    bottom: "115px",
                    fontSize: "12px",
                  }}
                />
              </PieChart>

              {/* List of Recent Escalations */}
              <div className="scrollable-list">
                <div className="escalation-list">
                  {escalations.map((item, index) => (
                    <div key={index} className="escalations-items">
                      <p>{item.alert}</p>
                      <p>
                        <strong>{item.CallDate}</strong>
                      </p>
                      <p>
                        Lead ID: <strong>{item.lead_id}</strong>
                      </p>
                      <p>{item.Campaign}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Section - Escalation Table */}
            <div className="table-container">
              <h3 className="Po-text">Potential Escalation - Sensitive Cases</h3>
              {escalationData && (
                <table>
                  <tbody>
                    {Object.entries(escalationData).map(([key, value]) => (
                      <tr key={key}>
                        <td className="fields">{key}</td>
                        <td className="values">{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
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

export default Potential;

import React, { useState } from "react";
import { PieChart, Pie, Cell, Legend, Tooltip } from "recharts";
import Layout from "../layout"; // Import layout component
import "../layout.css"; // Import styles
import "./Potential.css";

const Potential = () => {
  const [clientId] = useState("375");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [escalationData, setEscalationData] = useState(null);
  const [escalations, setEscalations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pieChartData, setPieChartData] = useState([]);

  // const pieChartData = [
  //   { name: "Top Negative Signals", value: 2, color: "#c0392b" },
  //   {
  //     name: "Social Media and Consumer Court Threat",
  //     value: 3,
  //     color: "#e74c3c",
  //   },
  // ];

  const fetchCallQualityDetails = async () => {
    if (!clientId || !startDate || !endDate) {
      alert("Please enter Client ID and select Start and End dates.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `http://127.0.0.1:8097/potential_data_summarry?client_id=${clientId}&start_date=${startDate}&end_date=${endDate}`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.status}`);
      }

      const result = await response.json();
      console.log("Fetched data:", result);

      if (result.counts && Object.keys(result.counts).length > 0) {
        setEscalationData(result.counts);
        setEscalations(result.raw_dump);
        

        const { 
          social_media_threat = 0, 
          consumer_court_threat = 0, 
          potential_scam = 0, 
          abuse = 0, 
          threat = 0, 
          frustration = 0, 
          slang = 0, 
          sarcasm = 0 
        } = result.counts;
  
        
        const topNegativeSignals = social_media_threat + consumer_court_threat;
        const socialMediaThreats = potential_scam + abuse + threat + frustration + slang + sarcasm;
  
        
        setPieChartData([
          { name: "Top Negative Signals", value: topNegativeSignals, color: "#c0392b" },
          { name: "Social Media and Consumer Court Threat", value: socialMediaThreats, color: "#e74c3c" }
        ]);


      } else {
        setEscalationData(null);
        setEscalations([]);
        alert("No escalation data found for selected criteria.");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      alert("Error fetching data. Check the console for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className={`dashboard-container-po ${loading ? "blurred" : ""}`}>
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
            <input
              className="setsubmitbtn"
              type="button"
              value="Submit"
              onClick={fetchCallQualityDetails}
            />
          </div>
        </header>

        <div className="content">
          <div className="chart-container">
            <h3 className="Po-text">Recent Escalation</h3>
            <PieChart width={250} height={250}>
              <Pie data={pieChartData} dataKey="value" outerRadius={80} label>
                {pieChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend
                wrapperStyle={{
                  position: "absolute",
                  width: "210px",
                  left: "215px",
                  bottom: "115px",
                  fontSize: "12px",
                }}
              />
            </PieChart>

            {/* 🔹 Fixed Escalations List Rendering */}
            <div className="scrollable-list">
              <h3 className="Po-text">Recent Escalations</h3>
              {escalations.length > 0 ? (
                <div className="escalation-list">
                  {escalations.map((item, index) => (
                    <div key={index} className="escalations-items">
                      <p>
                      <p><strong>Call Date:</strong> {item.CallDate ? item.CallDate.split("T")[0] : "N/A"}</p>
                      </p>
                      <p>
                        <strong>Lead ID:</strong> {item.lead_id || "N/A"}
                      </p>
                      <p>
                        <strong>Campaign:</strong> {item.Campaign || "N/A"}
                      </p>
                      <p>
                        <strong>Negative Words:</strong>{" "}
                        {item.top_negative_words || "N/A"}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p>No escalations found.</p>
              )}
            </div>
          </div>

          {/* 🔹 Fixed Escalation Data Table */}
          <div className="table-container">
            <h3 className="Po-text">Potential Escalation - Sensitive Cases</h3>
            {Array.isArray(escalations) && escalations.length > 0 ? (
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Category</th>
                      <th>Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {escalations.map((item, index) =>
                      Object.entries(item).map(([key, value]) => (
                        <tr key={`${index}-${key}`}>
                          <td className="fields">{key.replace(/_/g, " ")}</td>
                          <td className="values">
                            {value !== null ? String(value) : "N/A"}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              <p>No data available.</p>
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

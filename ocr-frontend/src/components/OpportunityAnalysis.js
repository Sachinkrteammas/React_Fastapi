import React, { useState, useEffect } from "react";
import Layout from "../layout";
import "../layout.css";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import "./Opportunity.css";
import axios from "axios";
import { BASE_URL } from "./config";

export default function OpportunityAnalysis() {
  const [loading, setLoading] = useState(true);
  const [loading1, setLoading1] = useState(false);
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [endDate, setEndDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [moBreakdownData, setMoBreakdownData] = useState([]);
  const [moBreakupData, setMoBreakupData] = useState([]);
  const [nedEdBreakdown, setNedEdBreakdown] = useState([]);
  const [data, setData] = useState({});
  const [error, setError] = useState("");

  useEffect(() => {
    setTimeout(() => setLoading(false), 2000);
  }, []);

  useEffect(() => {
    fetchData();
  }, [startDate, endDate]);

  const fetchData = async () => {
    if (!startDate || !endDate) {
      setError("Please select date range.");
      return;
    }

    setError("");
    setLoading1(true);

    try {
      const response = await axios.get(`${BASE_URL}/franchise-opportunity-analysis`, {
        params: { start_date: startDate, end_date: endDate },
      });

      const resData = response.data;
      setData(resData);

      // === Workable vs Non-Workable Pie ===
      setMoBreakdownData([
        {
          name: "Workable",
          value: resData.Workable_vs_NonWorkable.Workable || 0,
          color: "#ff4500",
        },
        {
          name: "Non Workable",
          value: resData.Workable_vs_NonWorkable.NonWorkable || 0,
          color: "#ff1493",
        },
      ]);

      // === Objection Split Pie ===
      const objectionSplit = resData.Detailed_Franchise_Objection_Split || {};
      const formattedObjections = Object.entries(objectionSplit).map(
        ([key, value]) => ({
          name: key,
          value: value,
          color: "#" + Math.floor(Math.random() * 16777215).toString(16),
        })
      );
      setMoBreakupData(formattedObjections);

      // === Franchise Lead Data Completeness ===
      const completeness = resData.Franchise_Lead_Data_Completeness || {};
      const totalLeads = resData.Opportunity_Analysis_Franchise?.Total_Leads || 0;

      setNedEdBreakdown([
        {
          "NED/ED Category": "Complete Leads",
          "NED/ED-QS": "ED",
          "NED/ED Status": "Complete",
          Count: completeness.Complete_Leads || 0,
          Contribution: totalLeads
            ? ((completeness.Complete_Leads / totalLeads) * 100).toFixed(1)
            : 0,
        },
        {
          "NED/ED Category": "Incomplete Leads",
          "NED/ED-QS": "NED",
          "NED/ED Status": "Incomplete",
          Count: completeness.Incomplete_Leads || 0,
          Contribution: totalLeads
            ? ((completeness.Incomplete_Leads / totalLeads) * 100).toFixed(1)
            : 0,
        },
      ]);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to fetch data. Please try again.");
    } finally {
      setLoading1(false);
    }
  };

  if (loading) {
    return (
      <div className="zigzag-container">
        <div className="bar"></div>
        <div className="bar"></div>
        <div className="bar"></div>
        <div className="bar"></div>
        <div className="bar"></div>
      </div>
    );
  }

  return (
    <Layout heading="Opportunity Analysis">
      <div className={`dashboard-container ${loading1 ? "blurred" : ""}`}>
        <div className="dashboard-container-opportunity">
          <div className="header">
            <h5>AI-Enhanced Sales Strategy Dashboard</h5>
            <div className="salesheader">
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
              <label>
                <input
                  type="submit"
                  className="setsubmitbtn"
                  value="Submit"
                  onClick={fetchData}
                />
              </label>
            </div>
          </div>

          <div className="firstdivno">
            <div className="graphdiv">
              <div className="set-con">
                <h5 style={{ fontSize: "16px" }}>
                  Opportunity Analysis Franchise
                </h5>
                <div className="divide">
                  <div className="metric-card white">
                    <h5>Total Franchise Inquiries</h5>
                    <b>
                      {data.Opportunity_Analysis_Franchise?.Total_Leads || 0}
                    </b>
                  </div>
                  <div className="metric-card white">
                    <h5>Missed Conversions</h5>
                    <b>
                      {data.Opportunity_Analysis_Franchise?.Missed_Conversions ||
                        0}
                    </b>
                  </div>
                </div>
              </div>

              {/* Workable vs Non-Workable Pie */}
              <div className="chart-containernew1">
                <h5>Workable vs Non-Workable Franchise Leads</h5>
                <ResponsiveContainer width="100%" height={210}>
                  <PieChart>
                    <Pie
                      data={moBreakdownData}
                      dataKey="value"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                    >
                      {moBreakdownData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <ul className="chart-legend">
                  {moBreakdownData.map((entry, index) => (
                    <li key={index}>
                      <span
                        className="legend-bullet"
                        style={{ backgroundColor: entry.color }}
                      ></span>
                      {entry.name} ({entry.value})
                    </li>
                  ))}
                </ul>
              </div>

              {/* Detailed Franchise Objection Split Pie */}
              <div className="chart-containernew1">
                <h5>Detailed Franchise Objection Split</h5>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={moBreakupData}
                      dataKey="value"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                    >
                      {moBreakupData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <ul className="chart-legend">
                  {moBreakupData.map((entry, index) => (
                    <li key={index}>
                      <span
                        className="legend-bullet"
                        style={{ backgroundColor: entry.color }}
                      ></span>
                      {entry.name} ({entry.value})
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Tables */}
            <div className="tablediv">
              <div className="tables-container1">
                <div className="table-container1">
                  <table className="tablebody">
                    <thead>
                      <tr>
                        <th>Reason for Missed Franchise Sign-up</th>
                        <th>Count</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.Reason_for_Missed_Franchise_Signup
                        ? Object.entries(
                            data.Reason_for_Missed_Franchise_Signup
                          ).map(([reason, count], index) => (
                            <tr key={index}>
                              <td>{reason.replace(/_/g, " ")}</td>
                              <td>{count}</td>
                            </tr>
                          ))
                        : (
                          <tr>
                            <td colSpan="2" style={{ textAlign: "center" }}>
                              No data available
                            </td>
                          </tr>
                        )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="table-container2">
                <table className="tablebodysec">
                  <thead>
                    <tr>
                      <th>Franchise Lead Data Completeness</th>
                      <th>NED/ED-QS</th>
                      <th>NED/ED Status</th>
                      <th>Count</th>
                      <th>Contr%</th>
                    </tr>
                  </thead>
                  <tbody>
                    {nedEdBreakdown.length > 0 ? (
                      nedEdBreakdown.map((item, index) => (
                        <tr key={index}>
                          <td>{item["NED/ED Category"]}</td>
                          <td>{item["NED/ED-QS"]}</td>
                          <td>{item["NED/ED Status"]}</td>
                          <td>{item.Count}</td>
                          <td>{item.Contribution}%</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" style={{ textAlign: "center" }}>
                          No data available
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {loading1 && (
          <div className="loader-overlay">
            <div className="bar"></div>
            <div className="bar"></div>
            <div className="bar"></div>
            <div className="bar"></div>
            <div className="bar"></div>
          </div>
        )}
      </div>
    </Layout>
  );
}

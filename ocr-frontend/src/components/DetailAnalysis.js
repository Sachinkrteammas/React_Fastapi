import React, { useState, useEffect } from "react";
import "./Details.css";
import Layout from "../layout"; // Import layout component
import "../layout.css"; // Import styles
import { PieChart, Pie as RePie, Cell, Tooltip, Legend } from "recharts";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const data = [
  {
    name: "Vartika Mishra",
    category: "TQ",
    audit: 2,
    score: "100%",
    fatal: "0%",
    opening: "100%",
    soft: "100%",
    hold: "100%",
    resolution: "100%",
    closing: "100%",
  },
  {
    name: "Gaurav",
    category: "TQ",
    audit: 3,
    score: "100%",
    fatal: "0%",
    opening: "100%",
    soft: "100%",
    hold: "100%",
    resolution: "100%",
    closing: "100%",
  },
  {
    name: "Prashanjit Sarkar",
    category: "TQ",
    audit: 4,
    score: "97%",
    fatal: "0%",
    opening: "100%",
    soft: "94%",
    hold: "100%",
    resolution: "100%",
    closing: "100%",
  },
  {
    name: "Pallavi Ray",
    category: "MQ",
    audit: 4,
    score: "93%",
    fatal: "0%",
    opening: "100%",
    soft: "92%",
    hold: "88%",
    resolution: "100%",
    closing: "100%",
  },
  {
    name: "Rekha Sharma",
    category: "MQ",
    audit: 3,
    score: "92%",
    fatal: "0%",
    opening: "89%",
    soft: "89%",
    hold: "100%",
    resolution: "100%",
    closing: "100%",
  },
  {
    name: "Manish",
    category: "BQ",
    audit: 5,
    score: "79%",
    fatal: "0%",
    opening: "67%",
    soft: "70%",
    hold: "100%",
    resolution: "100%",
    closing: "67%",
  },
  {
    name: "Shweta",
    category: "BQ",
    audit: 5,
    score: "77%",
    fatal: "0%",
    opening: "75%",
    soft: "75%",
    hold: "75%",
    resolution: "88%",
    closing: "75%",
  },
  {
    name: "Lovely Supriya",
    category: "BQ",
    audit: 4,
    score: "77%",
    fatal: "0%",
    opening: "75%",
    soft: "75%",
    hold: "75%",
    resolution: "88%",
    closing: "75%",
  },
  {
    name: "Shahid",
    category: "BQ",
    audit: 5,
    score: "68%",
    fatal: "0%",
    opening: "60%",
    soft: "73%",
    hold: "60%",
    resolution: "60%",
    closing: "100%",
  },
];
// const queryData = [
//   { name: "Short Call/Blank Call", count: 5 },
//   { name: "Order Status", count: 4 },
//   { name: "Customer wants company details", count: 3 },
//   { name: "Query Related to COD Services", count: 2 },
//   { name: "Customer Wants to Update Contact Details", count: 1 },
// ];

// const complaintData = [
//   { name: "Damage Product Received", count: 6 },
//   { name: "Wrong Product Delivered/Missing Item", count: 3 },
//   { name: "Refund Rejected/Coupon", count: 2 },
//   { name: "Payment Debited but Order Not Created", count: 1 },
//   { name: "Delivered Product Complaint", count: 1 },
// ];

const COLORS = ["#4CAF50", "#66BB6A", "#81C784", "#A5D6A7", "#C8E6C9"];
const RED_COLORS = ["#E53935", "#EF5350", "#E57373", "#EF9A9A", "#FFCDD2"];

// 3rd page data
const datadaywise = [
  {
    date: "Feb 28, 2025",
    audit: 33,
    cqScore: "85%",
    fatalCount: 0,
    fatal: "0%",
    opening: "82%",
    softSkills: "85%",
    hold: "75%",
    resolution: "86%",
    closing: "94%",
  },
  {
    date: "Feb 27, 2025",
    audit: 343,
    cqScore: "76%",
    fatalCount: 19,
    fatal: "3%",
    opening: "69%",
    softSkills: "76%",
    hold: "75%",
    resolution: "73%",
    closing: "88%",
  },
  {
    date: "Feb 26, 2025",
    audit: 299,
    cqScore: "76%",
    fatalCount: 12,
    fatal: "4%",
    opening: "72%",
    softSkills: "76%",
    hold: "72%",
    resolution: "71%",
    closing: "88%",
  },
  {
    date: "Feb 25, 2025",
    audit: 275,
    cqScore: "75%",
    fatalCount: 20,
    fatal: "4%",
    opening: "72%",
    softSkills: "73%",
    hold: "72%",
    resolution: "71%",
    closing: "86%",
  },
  {
    date: "Feb 24, 2025",
    audit: 267,
    cqScore: "73%",
    fatalCount: 14,
    fatal: "5%",
    opening: "68%",
    softSkills: "73%",
    hold: "73%",
    resolution: "73%",
    closing: "87%",
  },
  {
    date: "Feb 23, 2025",
    audit: 280,
    cqScore: "78%",
    fatalCount: 8,
    fatal: "4%",
    opening: "75%",
    softSkills: "79%",
    hold: "73%",
    resolution: "73%",
    closing: "89%",
  },
  {
    date: "Feb 22, 2025",
    audit: 274,
    cqScore: "75%",
    fatalCount: 12,
    fatal: "3%",
    opening: "73%",
    softSkills: "77%",
    hold: "73%",
    resolution: "74%",
    closing: "86%",
  },
  {
    date: "Feb 21, 2025",
    audit: 248,
    cqScore: "78%",
    fatalCount: 7,
    fatal: "3%",
    opening: "78%",
    softSkills: "79%",
    hold: "77%",
    resolution: "74%",
    closing: "92%",
  },
  {
    date: "Feb 20, 2025",
    audit: 295,
    cqScore: "79%",
    fatalCount: 8,
    fatal: "3%",
    opening: "79%",
    softSkills: "80%",
    hold: "77%",
    resolution: "76%",
    closing: "90%",
  },
  {
    date: "Feb 19, 2025",
    audit: 346,
    cqScore: "78%",
    fatalCount: 11,
    fatal: "3%",
    opening: "73%",
    softSkills: "77%",
    hold: "77%",
    resolution: "73%",
    closing: "90%",
  },
  {
    date: "Feb 18, 2025",
    audit: 141,
    cqScore: "77%",
    fatalCount: 5,
    fatal: "3%",
    opening: "75%",
    softSkills: "79%",
    hold: "78%",
    resolution: "73%",
    closing: "89%",
  },
  {
    date: "Feb 17, 2025",
    audit: 327,
    cqScore: "76%",
    fatalCount: 17,
    fatal: "2%",
    opening: "78%",
    softSkills: "75%",
    hold: "73%",
    resolution: "70%",
    closing: "88%",
  },
  {
    date: "Feb 16, 2025",
    audit: 325,
    cqScore: "77%",
    fatalCount: 12,
    fatal: "3%",
    opening: "76%",
    softSkills: "78%",
    hold: "72%",
    resolution: "73%",
    closing: "90%",
  },
  {
    date: "Feb 15, 2025",
    audit: 467,
    cqScore: "78%",
    fatalCount: 18,
    fatal: "3%",
    opening: "77%",
    softSkills: "80%",
    hold: "75%",
    resolution: "73%",
    closing: "90%",
  },
  {
    date: "Feb 14, 2025",
    audit: 522,
    cqScore: "77%",
    fatalCount: 24,
    fatal: "5%",
    opening: "78%",
    softSkills: "79%",
    hold: "77%",
    resolution: "70%",
    closing: "88%",
  },
];

// 4th page data
const dataweek = [
  {
    week: "Week 1",
    audit: "2,861",
    cqScore: "77%",
    fatalCount: 109,
    fatal: "4%",
    opening: "76%",
    softSkills: "78%",
    hold: "77%",
    resolution: "74%",
    closing: "90%",
  },
  {
    week: "Week 2",
    audit: "3,557",
    cqScore: "78%",
    fatalCount: 126,
    fatal: "4%",
    opening: "76%",
    softSkills: "76%",
    hold: "78%",
    resolution: "74%",
    closing: "90%",
  },
  {
    week: "Week 3",
    audit: "2,182",
    cqScore: "78%",
    fatalCount: 72,
    fatal: "3%",
    opening: "76%",
    softSkills: "79%",
    hold: "79%",
    resolution: "74%",
    closing: "90%",
  },
  {
    week: "Week 4",
    audit: "1,699",
    cqScore: "75%",
    fatalCount: 88,
    fatal: "5%",
    opening: "72%",
    softSkills: "77%",
    hold: "75%",
    resolution: "74%",
    closing: "87%",
  },
];

const DetailAnalysis = () => {
  
  const [stats, setStats] = useState(null);
 

  const [auditData, setAuditData] = useState([]);

  const [dateRange, setDateRange] = useState([null, null]);
 
  const [selectedScenario, setSelectedScenario] = useState(""); 
  const [selectedAgent, setSelectedAgent] = useState(""); 


  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [scenarios, setScenarios] = useState([]);
  const [queryData, setQueryData] = useState([]);
  const [complaintData, setComplaintData] = useState([]);
  const [requestData, setRequestData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const clientId = 375;
  const [complaintData1, setComplaintData1] = useState([]);
  const [requestData1, setRequestData1] = useState([]);
  const [queryData1, setQueryData1] = useState([]);
  const [agentData, setAgentData] = useState([]);
  const [daywiseData, setDatadaywise] = useState([]);

  

  
  const COLORS = ["#4caf50", "#26a69a", "#ffca28", "#f57c00", "#d32f2f"];

  
  const fetchScenarios = async () => {
    if (!startDate || !endDate) {
      alert("Please select both start and end dates.");
      return;
    }
  
    setLoading(true);
    setError(null);
  
    try {
      if (!clientId) {
        throw new Error("Client ID is missing!");
      }
  
      // API URLs
      const url1 = `http://127.0.0.1:8097/top_scenarios_with_counts?client_id=${clientId}&start_date=${startDate}&end_date=${endDate}&limit=5`;
      const url2 = `http://127.0.0.1:8097/agent_performance_summary?client_id=${clientId}&start_date=${startDate}&end_date=${endDate}`;
      const url3 = `http://127.0.0.1:8097/day_performance_summary?client_id=${clientId}&start_date=${startDate}&end_date=${endDate}`;
  
      // Fetch all APIs in parallel with error handling
      const results = await Promise.allSettled([
        fetch(url1).then((res) => res.ok ? res.json() : Promise.reject(res.status)),
        fetch(url2).then((res) => res.ok ? res.json() : Promise.reject(res.status)),
        fetch(url3).then((res) => res.ok ? res.json() : Promise.reject(res.status)),
      ]);
  
      // Check API responses
      const data1 = results[0].status === "fulfilled" ? results[0].value : null;
      const data2 = results[1].status === "fulfilled" ? results[1].value : null;
      const data3 = results[2].status === "fulfilled" ? results[2].value : null;
  
      console.log("API Response 1 (Scenarios):", data1);
      console.log("API Response 2 (Agent Performance):", data2);
      console.log("API Response 3 (Day-wise Performance):", data3);
  
      // Process first API response (Scenario Data)
      const queryData = data1?.Query || [];
      const complaintData = data1?.Complaint || [];
      const requestData = data1?.Request || [];
  
      // Transform data for PieChart
      const queryData1 = queryData.map((item) => ({
        name: item.Reason,
        count: item.Count,
      }));
  
      const complaintData1 = complaintData.map((item) => ({
        name: item.Reason,
        count: item.Count,
      }));
  
      const requestData1 = requestData.map((item) => ({
        name: item.Reason,
        count: item.Count,
      }));
  
      // Process second API response (Agent Performance Data)
      const agentData = data2 || [];
  
      // Process third API response (Day-wise Performance Data)
      const daywiseData = Array.isArray(data3)
        ? data3.map((item) => ({
            date: item["Call Date"] || "N/A",
            audit: item["Audit Count"] || "N/A",
            cqScore: item["CQ Score%"] || "N/A",
            fatalCount: item["Fatal Count"] || "N/A",
            fatal: item["Fatal%"] || "N/A",
            opening: item["Opening Score%"] || "N/A",
            softSkills: item["Soft Skills Score%"] || "N/A",
            hold: item["Hold Procedure Score%"] || "N/A",
            resolution: item["Resolution Score%"] || "N/A",
            closing: item["Closing Score%"] || "N/A",
          }))
        : [];
  
      // Efficient single state update
      setQueryData(queryData);
      setQueryData1(queryData1);
      setComplaintData(complaintData);
      setComplaintData1(complaintData1);
      setRequestData(requestData);
      setRequestData1(requestData1);
      setAgentData(agentData);
      setDatadaywise(daywiseData);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError(`Failed to load data: ${error}`);
    } finally {
      setLoading(false);
    }
  };
  
  
  
  


  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8097/details_count");
        if (!response.ok) throw new Error("Failed to fetch statistics");

        const data = await response.json();
        setStats(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

   // Show loading message until all data is fetched
   if (loading) {
    return (
      <div className="loader-container">
        <div className="windows-spinner"></div>
        <p className="Loading">Loading...</p>
      </div>
    );
  }

  return (
    <Layout>
      <div className="dashboard-container-de">
        {/* Header Section */}
        <header className="header">
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
            <input className="setsubmitbtn" value={"Submit"} readOnly onClick={fetchScenarios}/>
          </div>
        </header>

        {/* Main Content */}
        <div className="content-flex">
          {/* Left Section */}
          <div className="left-section-de">
            {/* Stats Boxes */}
            <div className="stats-flex">
              {stats?.cq_score !== undefined ? (
                <>
                  <div className="stat-card">CQ Score {stats.cq_score}%</div>
                  <div className="stat-card">Audit Count {stats.audit_cnt}</div>
                  <div className="stat-card">
                    Fatal Count {stats.fatal_count}
                  </div>
                  <div className="stat-card">
                    Fatal% {stats.fatal_percentage}%
                  </div>
                </>
              ) : (
                <p></p> // Show loading until data is fetched
              )}
            </div>
            <div className="top-issues-container">
              {/* Top 5 Queries */}
              <h4>Top 5 - Query</h4>
              <div className="issue-card">
              <div className="issue-card-container">
              <table>
            <thead>
              <tr>
                <th>Query Type</th>
                <th>Count</th>
              </tr>
            </thead>
            <tbody>
              {queryData.length > 0 ? (
                queryData.map((query, index) => (
                  <tr key={index}>
                    <td>{query.Reason}</td>
                    <td className="count">{query.Count}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="2">No data available</td>
                </tr>
              )}
            </tbody>
          </table>
                </div>

                <div className="chart-detail">
                  <PieChart width={250} height={330}>
                    <RePie
                      data={queryData1}
                      dataKey="count"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label
                    >
                      {queryData1.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </RePie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </div>
              </div>

              {/* Top 5 Complaints */}
              <h4>Top 5 - Complaint</h4>
              <div className="issue-card">
                <div className="issue-card-container">
                <table>
            <thead>
              <tr>
                <th>Complaint Type</th>
                <th>Count</th>
              </tr>
            </thead>
            <tbody>
              {complaintData.length > 0 ? (
                complaintData.map((complaint, index) => (
                  <tr key={index}>
                    <td>{complaint.Reason}</td>
                    <td className="count">{complaint.Count}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="2">No data available</td>
                </tr>
              )}
            </tbody>
          </table>
                </div>
                <div className="chart-detail">
                  <PieChart width={250} height={330}>
                    <RePie
                      data={complaintData1}
                      dataKey="count"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label
                    >
                      {complaintData1.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </RePie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </div>
              </div>

              {/* Top 5 Requests */}
              <h4>Top 5 - Request</h4>
              <div className="issue-card">
                <div className="issue-card-container">
                <table>
            <thead>
              <tr>
                <th>Request Type</th>
                <th>Count</th>
              </tr>
            </thead>
            <tbody>
              {requestData.length > 0 ? (
                requestData.map((request, index) => (
                  <tr key={index}>
                    <td>{request.Reason}</td>
                    <td className="count">{request.Count}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="2">No data available</td>
                </tr>
              )}
            </tbody>
          </table>
                </div>
                <div className="chart-detail">
                  <PieChart width={250} height={330}>
                    <RePie
                      data={requestData1}
                      dataKey="count"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label
                    >
                      {requestData1.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </RePie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </div>
              </div>
            </div>
          </div>

          {/* Right Section */}
          <div className="right-section-de">
            <div className="stats-flex-right">
              {stats?.query !== undefined ? (
                <>
                  <div className="stat-card">Query Count {stats.query}</div>
                  <div className="stat-card">
                    Complaint Count {stats.Complaint}
                  </div>
                  <div className="stat-card">Request Count {stats.Request}</div>
                  <div className="stat-card">Sale Done Count {stats.sale}</div>
                </>
              ) : (
                <p>Loading...</p>
              )}
            </div>

            {/* Day Wise / Audit Count */}
            <div className="table-card-de">
              <h4>Day Wise / Audit Count</h4>
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Complaint</th>
                    <th>Query</th>
                    <th>Request</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Feb-28</td>
                    <td className="count">18</td>
                    <td className="count">14</td>
                    <td className="count">1</td>
                    <td className="count">33</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Weekly Audit Count */}
            <div className="table-card-de audit-table">
              <h4>Week & Scenario Wise Audit Count</h4>
              <table>
                <thead>
                  <tr>
                    <th>Week</th>
                    <th>Query</th>
                    <th>Complaint</th>
                    <th>Request</th>
                    <th>Sale Done</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {auditData.map((row, index) => (
                    <tr key={index}>
                      <td>{row.week}</td>
                      <td className="percentage green">{row.query}%</td>
                      <td className="percentage red">{row.complaint}%</td>
                      <td className="percentage green">{row.request}%</td>
                      <td className="percentage">{row.saleDone}%</td>
                      <td>{row.total}</td>
                    </tr>
                  ))}
                </tbody>

                <tr className="total-row">
                  <td>Grand total</td>
                  <td className="percentage green">42%</td>
                  <td className="percentage red">55%</td>
                  <td className="percentage green">3%</td>
                  <td className="percentage">0%</td>
                  <td>33</td>
                </tr>
              </table>
            </div>
          </div>
        </div>

        {/* 2nd page */}

        <div className="cq-container">
          <h4>Agent & Parameter Wise CQ Score%</h4>
          <div className="filters">
            <DatePicker
              selected={startDate}
              onChange={(update) => setDateRange(update)}
              startDate={startDate}
              endDate={endDate}
              selectsRange
              className="date-picker"
              placeholderText="MM-DD-YYYY "
            />
            <select
              className="scenario-dropdown"
              value={selectedScenario}
              onChange={(e) => setSelectedScenario(e.target.value)}
            >
              <option value="">Select Scenario Wise</option>
              <option value="Scenario 1">Scenario 1</option>
              <option value="Scenario 2">Scenario 2</option>
              <option value="Scenario 3">Scenario 3</option>
            </select>
          </div>

          <table className="cq-table">
              <thead>
                <tr>
                  {agentData.length > 0 &&
                    Object.keys(agentData[0]).map((key, index) => (
                      <th key={index}>{key}</th>
                    ))}
                </tr>
              </thead>
              <tbody>
                {agentData.length > 0 ? (
                  agentData.map((row, index) => (
                    <tr key={index}>
                      {Object.values(row).map((value, i) => (
                        <td key={i}>{value}</td>
                      ))}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="10">No data available</td>
                  </tr>
                )}
              </tbody>
            </table>
        </div>

        {/* 3rd page */}
        <div className="daywise-container">
          <h4>Day Wise Quality Performance</h4>
          <div className="filters">
            <DatePicker
              selected={startDate}
              onChange={(update) => setDateRange(update)}
              startDate={startDate}
              endDate={endDate}
              selectsRange
              className="date-picker"
              placeholderText="MM-DD-YYYY "
            />
            <select
              className="dropdown"
              value={selectedScenario}
              onChange={(e) => setSelectedScenario(e.target.value)}
            >
              <option value="">Select Scenario Wise</option>
              <option value="Scenario 1">Scenario 1</option>
              <option value="Scenario 2">Scenario 2</option>
            </select>
            <select
              className="dropdown"
              value={selectedAgent}
              onChange={(e) => setSelectedAgent(e.target.value)}
            >
              <option value="">Select Agent Name</option>
              <option value="Agent 1">Agent 1</option>
              <option value="Agent 2">Agent 2</option>
            </select>
          </div>

          <table className="daywise-table">
  <thead>
    <tr>
      <th>Date</th>
      <th>Audit Count</th>
      <th>CQ Score%</th>
      <th>Fatal Count</th>
      <th>Fatal%</th>
      <th>Opening Score%</th>
      <th>Soft Skills Score%</th>
      <th>Hold Procedure Score%</th>
      <th>Resolution Score%</th>
      <th>Closing Score%</th>
    </tr>
  </thead>
  <tbody>
    {daywiseData.length > 0 ? (
      daywiseData.map((row, index) => (
        <tr key={index}>
          <td>{row.date}</td>
          <td>{row.audit}</td>
          <td>{row.cqScore}</td>
          <td>{row.fatalCount}</td>
          <td>{row.fatal}</td>
          <td>{row.opening}</td>
          <td>{row.softSkills}</td>
          <td>{row.hold}</td>
          <td>{row.resolution}</td>
          <td>{row.closing}</td>
        </tr>
      ))
    ) : (
      <tr>
        <td colSpan="10">No data available</td>
      </tr>
    )}
  </tbody>
</table>
        </div>

        {/* 4th page */}
        <div className="weekwise-container">
          <h4>Week Wise Quality Performance</h4>
          <div className="filters">
            <DatePicker
              selected={startDate}
              onChange={(update) => setDateRange(update)}
              startDate={startDate}
              endDate={endDate}
              selectsRange
              className="date-picker"
              placeholderText="MM-DD-YYYY "
            />
            <select
              className="dropdown"
              value={selectedScenario}
              onChange={(e) => setSelectedScenario(e.target.value)}
            >
              <option value="">Select Scenario Wise</option>
              <option value="Scenario 1">Scenario 1</option>
              <option value="Scenario 2">Scenario 2</option>
            </select>
            <select
              className="dropdown"
              value={selectedAgent}
              onChange={(e) => setSelectedAgent(e.target.value)}
            >
              <option value="">Select Agent Name</option>
              <option value="Agent 1">Agent 1</option>
              <option value="Agent 2">Agent 2</option>
            </select>
          </div>

          <table className="weekwise-table">
            <thead>
              <tr>
                <th>Week</th>
                <th>Audit Count</th>
                <th>CQ Score%</th>
                <th>Fatal Count</th>
                <th>Fatal%</th>
                <th>Opening Score%</th>
                <th>Soft Skills Score%</th>
                <th>Hold Procedure Score%</th>
                <th>Resolution Score%</th>
                <th>Closing Score%</th>
              </tr>
            </thead>
            <tbody>
              {dataweek.map((row, index) => (
                <tr key={index}>
                  <td>{row.week}</td>
                  <td>{row.audit}</td>
                  <td>{row.cqScore}</td>
                  <td>{row.fatalCount}</td>
                  <td>{row.fatal}</td>
                  <td>{row.opening}</td>
                  <td>{row.softSkills}</td>
                  <td>{row.hold}</td>
                  <td>{row.resolution}</td>
                  <td>{row.closing}</td>
                </tr>
              ))}
              <tr className="total-row">
                <td>Grand total</td>
                <td>10,299</td>
                <td>77%</td>
                <td>395</td>
                <td>4%</td>
                <td>75%</td>
                <td>79%</td>
                <td>77%</td>
                <td>74%</td>
                <td>89%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
};

export default DetailAnalysis;

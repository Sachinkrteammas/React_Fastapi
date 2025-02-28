import React, { useState,useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Analysis.css";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
// import "./Analysis.css";
import Layout from "../layout"; // Import layout component
import "../layout.css"; // Import styles
import { Doughnut } from "react-chartjs-2";
import "chart.js/auto";
const Analysis = () => {
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem("token");
    sessionStorage.removeItem("user");
    navigate("/");
  };
  const handleNavigation = (path) => {
    navigate(path);
  };

  // const pieData = [
  //   { name: "Excellent", value: 13.6, color: "#4CAF50" },
  //   { name: "Good", value: 142, color: "#8BC34A" },
  //   { name: "Below Average", value: 21, color: "#F44336" },
  //   { name: "Average", value: 21, color: "#990000" },
  // ];

  const pieData1 = [
    { name: "Top Negative Signals", value: 2, color: "#d32f2f" },
  ];

  const topNegativeSignals = [
    { category: "Abuse", count: 0 },
    { category: "Threat", count: 0 },
    { category: "Frustration", count: 2 },
    { category: "Slang", count: 0 },
  ];

  const barData = [
    { date: "Feb 8", score: 76, target: 95 },
    { date: "Feb 9", score: 82, target: 95 },
    { date: "Feb 10", score: 76, target: 95 },
    { date: "Feb 11", score: 76, target: 95 },
    { date: "Feb 12", score: 78, target: 95 },
    { date: "Feb 13", score: 79, target: 95 },
    { date: "Feb 14", score: 80, target: 95 },
  ];

  const data = [
    { name: "Frustration", value: 2, color: "#B71C1C" }, // Dark Red
    { name: "Abuse", value: 0, color: "#E57373" }, // Light Red
    { name: "Threat", value: 0, color: "#FF9800" }, // Orange
    { name: "Slang", value: 0, color: "#64B5F6" }, // Blue
    { name: "Sarcasm", value: 0, color: "#81C784" }, // Green
  ];

  const [dateRange, setDateRange] = useState({
    from: "Feb 8, 2025",
    to: "Feb 14, 2025",
  });

  const barChartData = {
    labels: ["Feb 25", "Jan 25", "Dec 24"],
    datasets: [
      {
        label: "Frustration",
        backgroundColor: "orange",
        data: [123, 167, 33],
      },
      {
        label: "Threat",
        backgroundColor: "blue",
        data: [57, 92, 39],
      },
    ],
  };

  const monthWiseData = [
    {
      name: "Dec '24",
      Frustration: 33,
      Threat: 39,
      Slang: 3,
      Abuse: 0,
      Sarcasm: 0,
    },
    {
      name: "Jan '25",
      Frustration: 167,
      Threat: 92,
      Slang: 29,
      Abuse: 0,
      Sarcasm: 3,
    },
    {
      name: "Feb '25",
      Frustration: 123,
      Threat: 57,
      Slang: 1,
      Abuse: 0,
      Sarcasm: 0,
    },
  ];
  const lastTwoDaysData = [
    { name: "Feb 17, 2025", Frustration: 9, Threat: 1 },
    { name: "Feb 18, 2025", Frustration: 1, Threat: 1 },
  ];

  const doughnutChartData = {
    labels: ["Amazon", "Flipkart", "BuyZone Attwin", "Smiths", "Cuemath"],
    datasets: [
      {
        data: [21, 14, 7, 7, 14],
        backgroundColor: ["blue", "green", "red", "purple", "orange"],
      },
    ],
  };


  // api connect
  
  const [auditData, setAuditData] = useState(null);
  const [pieData, setPieData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAuditData = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8097/audit_count");
        const data = await response.json();
        setAuditData(data);

        // Update pie chart data dynamically
        setPieData([
          { name: "Excellent", value: data.excellent, color: "#4CAF50" },
          { name: "Good", value: data.good, color: "#8BC34A" },
          { name: "Average", value: data.avg_call, color: "#990000" },
          { name: "Below Average", value: data.b_avg, color: "#F44336" },
        ]);
      } catch (error) {
        console.error("Error fetching audit data:", error);
      }
    };

    const fetchCategories = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8097/call_length_categorization");
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        console.error("Error fetching call length data:", error);
      }
    };

    const fetchData = async () => {
      await Promise.all([fetchAuditData(), fetchCategories()]);
      setLoading(false); // Set loading false only after both fetch calls
    };

    fetchData();
  }, []);

  // Show loading message until all data is fetched
  if (loading) {
    return <p>Loading...</p>;
  }
  
  return (
    <Layout>
      <div className="dashboard-container">
        <header className="header">
          <h3>BELLAVITA</h3>
          {/* <div className="date-picker">Feb 19, 2025 - Feb 20, 2025</div> */}
          <div className="setdate">
            <label>
              <input type="date" />
            </label>
            <label>
              <input type="date" />
            </label>
            <label>
              <input type="submit" value="Submit" />
            </label>
          </div>
        </header>
        <div className="callandache">
          <div className="categorization">
            <div className="cqscore">
            <div className="card-container">
      {[
        { title: "CQ Score", value: `${auditData.cq_score}%`, color: "text-red-600" },
        { title: "Fatal CQ Score", value: "84%", color: "text-green-600" }, // Static for now
        { title: "Audit Count", value: auditData.audit_cnt, color: "text-blue-600" },
        { title: "Excellent Call", value: auditData.excellent, color: "text-purple-600" },
        { title: "Good Call", value: auditData.good, color: "text-green-600" },
        { title: "Average Call", value: auditData.avg_call, color: "text-yellow-600" },
        { title: "Below Call", value: auditData.b_avg, color: "text-gray-600" },
      ].map((card, index) => (
        <div key={index} className="card">
          <h6>{card.title}</h6>
          <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
        </div>
      ))}
    </div>
            </div>

            <div className="catoopening">
            <div className="cato">
      <p>Achet Categorization</p>
      <table className="performer">
        <thead>
          <tr>
            <th>Category</th>
            <th>Audit Count</th>
            <th>Fatal%</th>
            <th>CQ Score%</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((item, index) => (
            <tr key={index} className={item["ACH Category"] === "Grand Total" ? "font-bold" : ""}>
              <td>{item["ACH Category"]}</td>
              <td>{item["Audit Count"]}</td>
              <td>{item["Fatal%"]}</td>
              <td>{item["Score%"]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
              <div className="opening">
                <div className="soft-skills-container softskill">
                  {[
                    { title: "Opening", value: "60%" },
                    { title: "Soft Skills", value: "69%" },
                    { title: "Hold Procedure", value: "68%" },
                    { title: "Resolution", value: "59%" },
                    { title: "Closing", value: "78%" },
                    { title: "Average Score", value: "67%" },
                  ].map((skill, index) => (
                    <div key={index} className="soft-skill-row">
                      <span className="soft-skill-title">{skill.title}</span>
                      <span className="soft-skill-value">{skill.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="callwise">
            <h5>Call Wise</h5>
            <PieChart width={400} height={300}>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                label
              >
                {pieData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </div>
        </div>

        {/* performer and target */}

        <div className="performertarget">
          <div className="topperformer">
            <p>Top 5 Performer</p>
            <table className="performer1">
              <thead>
                <tr>
                  <th>Agent Name</th>
                  <th>Audit Count</th>
                  <th>CQ%</th>
                  <th>Fatal Count</th>
                  <th>Fatal%</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Gaurav</td>
                  <td>7</td>
                  <td>92%</td>
                  <td>0</td>
                  <td>0%</td>
                </tr>
              </tbody>
              <tbody>
                <tr>
                  <td>Sachin</td>
                  <td>7</td>
                  <td>92%</td>
                  <td>0</td>
                  <td>0%</td>
                </tr>
              </tbody>
              <tbody>
                <tr>
                  <td>Gaurav</td>
                  <td>7</td>
                  <td>92%</td>
                  <td>0</td>
                  <td>0%</td>
                </tr>
              </tbody>
              <tbody>
                <tr>
                  <td>Gaurav</td>
                  <td>7</td>
                  <td>92%</td>
                  <td>0</td>
                  <td>0%</td>
                </tr>
              </tbody>
              <tbody>
                <tr>
                  <td>Gaurav</td>
                  <td>7</td>
                  <td>92%</td>
                  <td>0</td>
                  <td>0%</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="targetwize">
            <div className="chart-box graph">
              <div className="setheight">
              <p>Target Vs CQ Score</p>

              <BarChart width={467} height={238} data={barData}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="score" fill="#2196F3" />
                <Bar dataKey="target" fill="#4CAF50" />
              </BarChart>
            </div>
            </div>
          </div>
        </div>

        <div className="potensialtop">
          <div className="potensial">
          <div className="left-section">
          <p>Potential Escalation - Sensitive Cases</p>
          <div className="escalation-box">
            <div className="escalation-item">
              <span>Social Media and Consumer Court Threat</span>
              <span className="count">0</span>
            </div>
            <div className="escalation-item">
              <span>Potential Scam</span>
              <span className="count">0</span>
            </div>
          </div>

          <p>Recent Escalation</p>
          <div className="chart-containernew">
            <PieChart width={300} height={300}>
              <Pie
                data={pieData1}
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#d32f2f"
                dataKey="value"
                label
              >
                {pieData1.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </div>
        </div>

          </div>
          <div className="topclass">

          <div className="right-section">
          <p>Top Negative Signals</p>
          <div className="negative-signals">
            {topNegativeSignals.map((item, index) => (
              <div key={index} className="signal-box">
                <span>{item.category}</span>
                <span className="count">{item.count}</span>
              </div>
            ))}
          </div>

          <p>Social Media and Consumer Court Threat</p>
          <div className="data-table">
            <p>No data</p>
          </div>

          <p>Top Negative Signals</p>
          <table className="negative-signals-table">
            <thead>
              <tr>
                <th>Scenario</th>
                <th>Sub Scenario</th>
                <th>Top Negative Signals</th>
                <th>Count</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Complaint</td>
                <td>Delivered Product Complaint</td>
                <td>Frustration</td>
                <td>1</td>
              </tr>
              <tr>
                <td>Complaint</td>
                <td>Order Delay</td>
                <td>Frustration</td>
                <td>1</td>
              </tr>
              <tr>
                <td colSpan="3">
                  <strong>Grand Total</strong>
                </td>
                <td>2</td>
              </tr>
            </tbody>
          </table>

          <p>Protetional Scam</p>
          <div className="data-table">
            <p>No data</p>
          </div>
        </div>
          </div>

        </div>
        
        <div className="social-media">
        <div className="section-box">
          <h5>Social Media and Consumer Court Threat</h5>
          <div className="section-content">
            <div className="alert-box">
              <p>
                <b>Feb 13</b> - Lead ID (123456) - Customer mentioned consumer
                court due to dissatisfaction.
              </p>
              <p>
                <b>Feb 12</b> - Lead ID (654321) - Customer mentioned social
                media escalation.
              </p>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Call Date</th>
                  <th>Social Media</th>
                  <th>Consumer Court</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Feb 13, 2025</td>
                  <td>1</td>
                  <td>3</td>
                  <td>4</td>
                </tr>
                <tr>
                  <td>Feb 12, 2025</td>
                  <td>3</td>
                  <td>4</td>
                  <td>7</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        </div>
        <div className="partialscan">

        <div className="section-box">
          <h5>Potential Scam</h5>
          <div className="section-content">
            <div className="alert-box">
              <p>
                <b>Feb 10</b> - Lead ID (987654) - Customer reported fraudulent
                activity.
              </p>
              <p>
                <b>Feb 09</b> - Lead ID (456789) - Suspicious transaction
                flagged.
              </p>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Call Date</th>
                  <th>System Manipulation</th>
                  <th>Financial Fraud</th>
                  <th>Collusion</th>
                  <th>Policy Communication</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Feb 10, 2025</td>
                  <td>2</td>
                  <td>1</td>
                  <td>0</td>
                  <td>1</td>
                  <td>4</td>
                </tr>
                <tr>
                  <td>Feb 09, 2025</td>
                  <td>0</td>
                  <td>1</td>
                  <td>1</td>
                  <td>0</td>
                  <td>2</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        </div>

        <div className="topnegative">

        <div className="section">
          <div className="alerts">
            <h5>Top Negative Signals</h5>
            <div className="alert-box">
              Frustration - Delay, disappointment (Lead ID: 11023039)
            </div>
            <div className="alert-box">
              Threat - Fraud, case (Lead ID: 11023093)
            </div>
          </div>
        </div>

        <div className="chart-box1">
          <h5>Month Wise</h5>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthWiseData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="Frustration" stackId="a" fill="#FF7F50" />
              <Bar dataKey="Threat" stackId="a" fill="#1E90FF" />
              <Bar dataKey="Slang" stackId="a" fill="#32CD32" />
              <Bar dataKey="Abuse" stackId="a" fill="#8B0000" />
              <Bar dataKey="Sarcasm" stackId="a" fill="#FF1493" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-box2">
          <h5>Last 2 Days</h5>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={lastTwoDaysData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="Frustration" stackId="a" fill="#FF7F50" />
              <Bar dataKey="Threat" stackId="a" fill="#1E90FF" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        </div>

        <div className="Competitordiv">

        <div className="competitor-table">
          <h5>Competitor Analysis</h5>
          <table>
            <thead>
              <tr>
                <th>Competitor</th>
                <th>Count</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Amazon</td>
                <td>3</td>
              </tr>
              <tr>
                <td>Flipkart</td>
                <td>2</td>
              </tr>
              <tr>
                <td>BuyZone Attwin</td>
                <td>1</td>
              </tr>
              <tr>
                <td>BuyZone Attwin</td>
                <td>1</td>
              </tr>
              <tr>
                <td>BuyZone Attwin</td>
                <td>1</td>
              </tr>
              <tr>
                <td>BuyZone Attwin</td>
                <td>1</td>
              </tr>
              <tr>
                <td>BuyZone Attwin</td>
                <td>1</td>
              </tr>
              <tr>
                <td>BuyZone Attwin</td>
                <td>1</td>
              </tr>
              <tr>
                <td>Flipkart</td>
                <td>2</td>
              </tr>
              <tr>
                <td>Flipkart</td>
                <td>2</td>
              </tr>
              <tr>
                <td>Flipkart</td>
                <td>2</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="section">
          <div className="chart-container">
            <Doughnut data={doughnutChartData} />
          </div>
        </div>
        </div>
        





        
      </div>
    </Layout>
  );
};

export default Analysis;

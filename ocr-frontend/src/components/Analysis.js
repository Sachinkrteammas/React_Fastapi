import React, { useState } from "react";
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

  const pieData = [
    { name: "Excellent", value: 13.6, color: "#4CAF50" },
    { name: "Good", value: 42, color: "#8BC34A" },
    { name: "Below Average", value: 42, color: "#F44336" },
  ];

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

  return (
    <Layout>
      <div className="dashboard-container">
        <header className="header">
          <h3>BELLAVITA</h3>
          {/* <div className="date-picker">Feb 19, 2025 - Feb 20, 2025</div> */}
          <div>
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
                  { title: "CQ Score", value: "80%", color: "text-red-600" },
                  {
                    title: "Fatal CQ Score",
                    value: "84%",
                    color: "text-green-600",
                  },
                  { title: "Audit Count", value: "81", color: "text-blue-600" },
                  {
                    title: "Excellent Call",
                    value: "34",
                    color: "text-purple-600",
                  },
                  {
                    title: "Excellent Call",
                    value: "34",
                    color: "text-purple-600",
                  },
                  {
                    title: "Excellent Call",
                    value: "34",
                    color: "text-purple-600",
                  },
                  {
                    title: "Excellent Call",
                    value: "34",
                    color: "text-purple-600",
                  },
                ].map((card, index) => (
                  <div key={index} className="card">
                    <h6>{card.title}</h6>
                    <p className={`text-2xl font-bold ${card.color}`}>
                      {card.value}
                    </p>
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
                      <th>ACHT</th>
                      <th>Audit Count</th>
                      <th>Fatal Count</th>
                      <th>CQ Score%</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Short (&lt;60 sec)</td>
                      <td>00:00:33</td>
                      <td>10</td>
                      <td>0</td>
                      <td>96%</td>
                    </tr>
                  </tbody>
                  <tbody>
                    <tr>
                      <td>Short (&lt;60 sec)</td>
                      <td>00:00:33</td>
                      <td>10</td>
                      <td>0</td>
                      <td>96%</td>
                    </tr>
                  </tbody>
                  <tbody>
                    <tr>
                      <td>Short (&lt;60 sec)</td>
                      <td>00:00:33</td>
                      <td>10</td>
                      <td>0</td>
                      <td>96%</td>
                    </tr>
                  </tbody>
                  <tbody>
                    <tr>
                      <td>Short (&lt;60 sec)</td>
                      <td>00:00:33</td>
                      <td>10</td>
                      <td>0</td>
                      <td>96%</td>
                    </tr>
                  </tbody>

                  <tbody>
                    <tr>
                      <td>Grand Total</td>
                      <td>00:00:13</td>
                      <td>82</td>
                      <td>4</td>
                      <td>80%</td>
                    </tr>
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


        
      </div>
    </Layout>
  );
};

export default Analysis;

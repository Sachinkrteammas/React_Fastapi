import React, { useState, useEffect } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,

} from "recharts";
import { FunnelChart, Funnel, LabelList } from "recharts";
import "./SalesDashboard.css"; // Import CSS
import Layout from "../layout";
import "../layout.css";

// Data for Pie Charts
const successData = [
  { name: "Opening Success", value: 18.1, color: "#4CAF50" },
  { name: "Offering Success", value: 14.5, color: "#FF5722" },
  { name: "Context Success", value: 64.2, color: "#FFC107" },
  { name: "Sale Done", value: 10.5, color: "#e90886" },
];

const rejectedData = [
  { name: "Opening Rejected", value: 17.7, color: "#4CAF50" },
  { name: "Offering Rejected", value: 17.7, color: "#FF5722" },
  { name: "Context Rejected", value: 64.2, color: "#FFC107" },
];

// Data for Bar Charts (Funnels)
const cstFunnelData = [
  { name: "Total Calls", value: 24511, color: "#4682B4" },
  { name: "Opening Pitched", value: 20571, color: "#CD5C5C" },
  { name: "Context Pitched", value: 20475, color: "#3CB371" },
  { name: "Offer Pitched", value: 4468, color: "rgb(111 101 49)" },
  { name: "Sale Made", value: 919, color: "rgb(126 101 149)" }
];

const crtFunnelData = [
  { name: "Opening Rejected", value: 3940,color: "#4682B4" },
  { name: "Context Rejected", value: 96, color: "#CD5C5C" },
  { name: "Offering Rejected", value: 16103, color: "#3CB371" },
  { name: "POD", value: 3549, color: "rgb(111 101 49)" },
];

export default function SalesDashboard() {
  //loading code start===>
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split("T")[0]);

  useEffect(() => {

    setTimeout(() => {
      setLoading(false);
    }, 2000);
  }, []);

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
  //loading code end==>
  return (
    <Layout>
      <div className="dashboard-container">
        <div className="header">
          <h5>AI-Enhanced Sales Strategy Dashboard</h5>
          <div className="salesheader">
            <label>
              <input
                type="date"
                name="start_date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </label>
            <label>
              <input
                type="date"
                name="end_date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
              />
            </label>
            <label>
              <input type="submit" class="setsubmitbtn" value="Submit" />
            </label>
          </div>
        </div>

        {/* 1️⃣ Key Metrics */}
        <div className="metric-container">
          {/* CST Card */}
          <div className="metric-card green-met">
            <h3>CST</h3>
            <div className="metrics">
              <div>
                <b>24,511</b>
                <p>Total Calls</p>
              </div>
              <div>
                <b>20,571</b>
                <p>OPS</p>
              </div>
              <div>
                <b>4,468</b>
                <p>Offer Success</p>
              </div>
              <div>
                <b>576</b>
                <p>Sale Done</p>
              </div>
              <div>
                <b>3.8%</b>
                <p>Success Rate</p>
              </div>
            </div>
          </div>

          {/* CRT Card */}
          <div className="metric-card blue-met">
            <h3>CRT</h3>
            <div className="metrics">
              <div>
                <b>3,940</b>
                <p>OR</p>
              </div>
              <div>
                <b>96</b>
                <p>CR</p>
              </div>
              <div>
                <b>16,103</b>
                <p>OPR</p>
              </div>
              <div>
                <b>3,549</b>
                <p>POR</p>
              </div>
              <div>
                <b>96.3%</b>
                <p>Failure Rate</p>
              </div>
            </div>
          </div>
        </div>

        {/* 2️⃣ Success Calls Breakdown */}
        {/* 2️⃣ Success Calls Breakdown (SCB) */}
        <div className="fullbodydiv">
          <div className="block1div">
            <div className="chart-container">
              <h2 className="scb_rcb_fontclass">Success Calls Breakdown (SCB)</h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={successData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                  >
                    {successData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>

              {/* 📌 Custom Legend with Bullet Points */}
              <ul className="legend">
                {successData.map((entry, index) => (
                  <li key={index}>
                    <span
                      className="bullet"
                      style={{ backgroundColor: entry.color }}
                    ></span>
                    {entry.name} - {entry.value}%
                  </li>
                ))}
              </ul>
            </div>

            {/* 3️⃣ Rejected Calls Breakdown */}
            {/* 3️⃣ Rejected Calls Breakdown (RCB) */}
            <div className="chart-container">
              <h2 className="cst_crt_fontclass">CST Funnel</h2>
              <div className="funnel">
                {cstFunnelData.map((item, index) => (
                  <div
                    key={index}
                    className="funnel-item"
                    style={{
                      backgroundColor: item.color,
                      width: `${100 - index * 12}%`, // Decreasing width for pyramid effect
                    }}
                  >
                    {item.name}: {item.value}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 4️⃣ CST Funnel */}
          <div className="block2div">
            {/* 3️⃣ Rejected Calls Breakdown (RCB) */}
            <div className="chart-container">
              <h2 className="scb_rcb_fontclass">Rejected Calls Breakdown (RCB)</h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={rejectedData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                  >
                    {rejectedData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>

              {/* 📌 Custom Bullet Legend */}
              <ul className="legend">
                {rejectedData.map((entry, index) => (
                  <li key={index}>
                    <span
                      className="bullet"
                      style={{ backgroundColor: entry.color }}
                    ></span>
                    {entry.name} - {entry.value}%
                  </li>
                ))}
              </ul>
            </div>

            {/* 5️⃣ CRT Funnel */}
            <div className="chart-container">
              <h2 className="cst_crt_fontclass">CRT Funnel</h2>
              <div className="funnel">
                {crtFunnelData.map((item, index) => (
                  <div
                    key={index}
                    className="funnel-item"
                    style={{
                      backgroundColor: item.color,
                      width: `${100 - index * 12}%`, // Decreasing width for pyramid effect
                    }}
                  >
                    {item.name}: {item.value}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

import React, { useState } from "react";
import Layout from "../layout";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const PTPAnalysis = () => {
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [endDate, setEndDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const containerStyle = {
    backgroundColor: "#0f1b2b",
    color: "white",
    minHeight: "100vh",
    padding: "24px",
    fontFamily: "sans-serif",
  };

  const cardStyle = (bgColor) => ({
    backgroundColor: bgColor,
    padding: "16px",
    borderRadius: "8px",
    textAlign: "center",
  });

  const sectionStyle = {
    backgroundColor: "rgb(31, 41, 55)",
    padding: "16px",
    borderRadius: "8px",
    color: "white",
  };

  const sectionStylenew = {
    backgroundColor: "#f9fafb",
    padding: "16px",
    borderRadius: "8px",
    color: "black",
  };

  const tableStyle = {
    width: "100%",
    borderCollapse: "collapse",
    color: "#1d2024",
    fontSize: "14px",
  };

  const thTdStyle = {
    borderBottom: "1px solid #374151",
    padding: "5px",
    textAlign: "left",
  };

  const barData = [
    { confidence: "0-25", count: 100 },
    { confidence: "26-50", count: 200 },
    { confidence: "51-75", count: 300 },
    { confidence: "76-100", count: 150 },
  ];

  const barColors = ["#f87171", "#fbbf24", "#34d399", "#60a5fa"];

  const pieData = [
    { name: "Positive", value: 10 },
    { name: "Neutral", value: 35 },
    { name: "Negative", value: 20 },
  ];

  const pieColors = ["#34d399", "#facc15", "#f87171"];

  return (
    <Layout>
      <div style={containerStyle}>
        <h2
          style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "16px" }}
        >
          PTP Analysis Dashboard
        </h2>

        {/* Filters */}
        {/* <div style={{ display: "flex", gap: "12px", marginBottom: "20px" }}>
          <select style={sectionStyle}>
            <option>Date Range</option>
          </select>
          <select style={sectionStyle}>
            <option>Agent</option>
          </select>
          <select style={sectionStyle}>
            <option>Region</option>
          </select>
          <select style={sectionStyle}>
            <option>Confidence Score</option>
          </select>
          <button
            style={{
              backgroundColor: "#fbbf24",
              color: "black",
              fontWeight: "600",
              padding: "10px",
              borderRadius: "8px",
              border: "none",
            }}
          >
            Apply Filters
          </button>
        </div> */}
        <div
          style={{
            display: "flex",
            gap: "12px",
            marginBottom: "20px",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", gap: "8px" }}>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              style={{
                padding: "10px",
                borderRadius: "8px",
                border: "1px solid #ccc",
                backgroundColor: "#f9fafb",
                fontWeight: "500",
              }}
            />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              style={{
                padding: "10px",
                borderRadius: "8px",
                border: "1px solid #ccc",
                backgroundColor: "#f9fafb",
                fontWeight: "500",
              }}
            />
          </div>

          <select style={sectionStylenew}>
            <option>Agent</option>
          </select>
          <select style={sectionStylenew}>
            <option>Region</option>
          </select>

          <button
            style={{
              backgroundColor: "#fbbf24",
              color: "black",
              fontWeight: "600",
              padding: "10px",
              borderRadius: "8px",
              border: "none",
            }}
          >
            Apply Filters
          </button>
        </div>

        {/* Stats */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "16px",
            marginBottom: "20px",
          }}
        >
          <div style={cardStyle("#1e88e5")}>
            <div style={{ fontSize: "24px", fontWeight: "bold" }}>1,250</div>
            <div>Total PTPs Collected</div>
          </div>
          <div style={cardStyle("#e53935")}>
            <div style={{ fontSize: "24px", fontWeight: "bold" }}>370</div>
            <div>
              High-Risk PTPs
              <br />
              (Low Confidence)
            </div>
          </div>
          <div style={cardStyle("#43a047")}>
            <div style={{ fontSize: "24px", fontWeight: "bold" }}>710</div>
            <div>
              Genuine PTPs
              <br />
              (High Confidence)
            </div>
          </div>
          <div style={cardStyle("#fb8c00")}>
            <div style={{ fontSize: "24px", fontWeight: "bold" }}>540</div>
            <div>
              Follow-Up Call
              <br />
              Priority Cases
            </div>
          </div>
        </div>

        {/* Charts */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "16px",
            marginBottom: "20px",
          }}
        >
          <div style={sectionStyle}>
            <div style={{ fontWeight: "600", marginBottom: "8px" }}>
              PTP Confidence Distribution
            </div>
            <div
              style={{
                height: "200px",
                backgroundColor: "#374151",
                borderRadius: "6px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <BarChart width={350} height={200} data={barData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="confidence" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count">
                  {barData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={barColors[index % barColors.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </div>
          </div>
          <div style={sectionStyle}>
            <div style={{ fontWeight: "600", marginBottom: "8px" }}>
              Sentiment & Language Insights
            </div>
            <div
              style={{
                height: "200px",
                backgroundColor: "#374151",
                borderRadius: "6px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <PieChart width={350} height={200}>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={70}
                  fill="#8884d8"
                  dataKey="value"
                  label
                  // label={({ name, percent }) => `${name} - ${(percent * 100).toFixed(0)}%`}
                >
                  {pieData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={pieColors[index % pieColors.length]}
                    />
                  ))}
                </Pie>
                <Legend />
              </PieChart>
            </div>
          </div>
        </div>

        {/* Tables */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "16px",
          }}
        >
          <div style={sectionStyle}>
            <div style={{ fontWeight: "600", marginBottom: "8px" }}>
              Detailed AI-Powered PTP Insights
            </div>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thTdStyle}>Date</th>
                  <th style={thTdStyle}>Agent</th>
                  <th style={thTdStyle}>Customer Name</th>
                  <th style={thTdStyle}>Sentiment</th>
                  <th style={thTdStyle}>Confidence</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={thTdStyle}>25 Apr.</td>
                  <td style={thTdStyle}>John D.</td>
                  <td style={thTdStyle}>Ramesh</td>
                  <td style={thTdStyle}>Neutral</td>
                  <td style={thTdStyle}>42%</td>
                </tr>
                <tr>
                  <td style={thTdStyle}>25 Apr.</td>
                  <td style={thTdStyle}>Priya S.</td>
                  <td style={thTdStyle}>Anita</td>
                  <td style={thTdStyle}>Positive</td>
                  <td style={thTdStyle}>37</td>
                </tr>

                <tr>
                  <td style={thTdStyle}>25 Apr.</td>
                  <td style={thTdStyle}>Priya S.</td>
                  <td style={thTdStyle}>Anita</td>
                  <td style={thTdStyle}>Positive</td>
                  <td style={thTdStyle}>37</td>
                </tr>

                <tr>
                  <td style={thTdStyle}>25 Apr.</td>
                  <td style={thTdStyle}>Priya S.</td>
                  <td style={thTdStyle}>Anita</td>
                  <td style={thTdStyle}>Positive</td>
                  <td style={thTdStyle}>37</td>
                </tr>

                <tr>
                  <td style={thTdStyle}>25 Apr.</td>
                  <td style={thTdStyle}>Priya S.</td>
                  <td style={thTdStyle}>Anita</td>
                  <td style={thTdStyle}>Positive</td>
                  <td style={thTdStyle}>37</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Agent-Wise PTP Accuracy Table */}
          <div style={sectionStyle}>
            <div style={{ fontWeight: "600", marginBottom: "8px" }}>
              Agent-Wise PTP Accuracy
            </div>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thTdStyle}>Agent</th>
                  <th style={thTdStyle}>Total PTPs</th>
                  <th style={thTdStyle}>Avg Accuracy</th>
                  <th style={thTdStyle}>Failed PTPs</th>
                  <th style={thTdStyle}>AV%</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={thTdStyle}>John D.</td>
                  <td style={thTdStyle}>500</td>
                  <td style={thTdStyle}>80%</td>
                  <td style={thTdStyle}>50</td>
                  <td style={thTdStyle}>90%</td>
                </tr>
                <tr>
                  <td style={thTdStyle}>Priya S.</td>
                  <td style={thTdStyle}>620</td>
                  <td style={thTdStyle}>85%</td>
                  <td style={thTdStyle}>40</td>
                  <td style={thTdStyle}>94%</td>
                </tr>
                <tr>
                  <td style={thTdStyle}>Anita K.</td>
                  <td style={thTdStyle}>450</td>
                  <td style={thTdStyle}>78%</td>
                  <td style={thTdStyle}>60</td>
                  <td style={thTdStyle}>87%</td>
                </tr>

                <tr>
                  <td style={thTdStyle}>Anita K.</td>
                  <td style={thTdStyle}>450</td>
                  <td style={thTdStyle}>78%</td>
                  <td style={thTdStyle}>60</td>
                  <td style={thTdStyle}>87%</td>
                </tr>

                <tr>
                  <td style={thTdStyle}>Anita K.</td>
                  <td style={thTdStyle}>450</td>
                  <td style={thTdStyle}>78%</td>
                  <td style={thTdStyle}>60</td>
                  <td style={thTdStyle}>87%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PTPAnalysis;

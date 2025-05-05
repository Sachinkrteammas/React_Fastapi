import React, { useState } from "react";
import Layout from "../layout";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const cardStyle = {
  backgroundColor: "#1f2937",
  borderRadius: "16px",
  padding: "16px",
  color: "white",
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
};

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
  gap: "16px",
};

const titleStyle = {
  fontSize: "18px",
  fontWeight: "600",
  marginBottom: "8px",
};

const sectionStyle = {
  backgroundColor: "#f9fafb",
  padding: "10px",
  borderRadius: "8px",
};

const Insight = () => {
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split("T")[0]);

  const data1 = [
    { name: "Call 1", Calm: 40, Angry: 20 },
    { name: "Call 2", Calm: 50, Angry: 30 },
    { name: "Call 3", Calm: 45, Angry: 35 },
    { name: "Call 4", Calm: 60, Angry: 25 },
    { name: "Call 5", Calm: 55, Angry: 40 },
  ];

  const ptpData = [
    { label: "Positive", value: 20, color: "#3b82f6" },
    { label: "Negative", value: 15, color: "#c39b12" },
    { label: "Critical", value: 10, color: "#e74c3c" },
  ];

  const ptpDataDispute = [
    { label: "Positive", value: 10, color: "#3b82f6" },
    { label: "Negative", value: 10, color: "#f97316" },
    { label: "Critical", value: 5, color: "#c7cf1a" },
    { label: "yellow", value: 10, color: "#c39b12" },
  ];

  return (
    <Layout>
      <div style={{ backgroundColor: "#0f172a", minHeight: "100vh", padding: "16px" }}>
        <h4 style={{ fontSize: "20px", fontWeight: "600", color: "white", marginBottom: "16px" }}>
          AI Collections Analysis Dashboard
        </h4>

        {/* Filters */}
        <div style={{ display: "flex", gap: "35px", marginBottom: "20px", alignItems: "center" }}>
          <div style={{ display: "flex", gap: "30px" }}>
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

          <select style={sectionStyle}>
            <option>Agent</option>
          </select>
          <select style={sectionStyle}>
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

        {/* Dashboard Grid */}
        <div style={gridStyle}>
          <Card title="Promise to Pay (PTP) Analysis">
            <PieChart data={ptpData} />
            <div style={{ marginTop: "8px", fontSize: "14px", color: "#d1d5db" }}>
              <p>🔵 Positive - 20%</p>
              <p>🟡 Negative - 15%</p>
              <p>🔴 Critical - 10%</p>
            </div>
          </Card>

          <Card title="Intent Classification">
            <div style={{ maxWidth: "420px" }}>
              <BarLabel label="Willing but Delayed" percent={70} color="#c39b12" />
              <BarLabel label="Unwilling" percent={40} color="#e74c3c" />
              <BarLabel label="Can't Pay" percent={50} color="#facc15" />
            </div>
          </Card>

          <Card title="Root Cause Detection">
            <BarLabel label="Cash Flow Issues" percent={80} color="#3b82f6" />
            <BarLabel label="Job Loss" percent={50} color="#c39b12" />
            <BarLabel label="Dispute" percent={30} color="#f97316" />
            <BarLabel label="Other" percent={20} color="#f97316" />
          </Card>

            
          <Card title="Detect agent-forced PTPs">
            <AgentForcedPTPChart />
          </Card>

          <Card title="Escalation Risk Alerts">
            <BarLabel label="'I'll complain'" percent={70} color="#11d6ed" />
            <BarLabel label="'going to consumer court'" percent={65} color="#facc15" />
            <BarLabel label="''I tweet this''" percent={45} color="#c39b12" />
          </Card>

          <Card title="Dispute Management">
            <PieChart data={ptpDataDispute} />
            <ul style={{ fontSize: "14px", color: "#d1d5db", marginTop: "8px"  }}>
              <li>I've already paid</li>
              <li>Wrong charges</li>
              <li>False promises</li>
              <li>Reversal pending</li>
              <li>Not my account</li>
            </ul>
          </Card>

          <Card title="Agent Behavior Monitoring">
            <BarLabel label="Harsh Tone" percent={50} color="#11d6ed" />
            <BarLabel label="False Promises" percent={60} color="#c39b12" />
            <BarLabel label="Threatening Tone" percent={70} color="#f97316" />
          </Card>

          <Card title="Emotional & Sentiment Analysis">
  <div style={{ width: "100%", height: "200px", marginTop: "16px" }}>
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data1}>
        <CartesianGrid stroke="#374151" strokeDasharray="3 3" />
        <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
        <YAxis stroke="#9ca3af" fontSize={12} />
        <Tooltip />
        <Line type="monotone" dataKey="Calm" stroke="#3b82f6" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="Frustrated" stroke="#facc15" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="Angry" stroke="#ef4444" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="Resigned" stroke="#9ca3af" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  </div>
  <div style={{ fontSize: "12px", marginTop: "8px", color: "#9ca3af", textAlign: "center" }}>
    Calm, Frustrated, Angry, Resigned
  </div>
</Card>


          <Card title="Collection Funnel Optimization">
            <HeatmapPlaceholder />
          </Card>
        </div>
      </div>
    </Layout>
  );
};

// Reusable Card
const Card = ({ title, children }) => (
  <div style={cardStyle}>
    <h2 style={titleStyle}>{title}</h2>
    {children}
  </div>
);

// Thicker Bar with Label
const BarLabel = ({ label, percent, color }) => (
  <div style={{ marginBottom: "16px" }}>
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        fontSize: "14px",
        color: "#d1d5db",
        marginBottom: "4px",
      }}
    >
      <span>{label}</span>
      {/* <span>{percent}%</span> */}
    </div>
    <div
      style={{
        width: "100%",
        height: "24px",
        backgroundColor: "#374151",
        borderRadius: "12px",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          width: `${percent}%`,
          height: "100%",
          backgroundColor: color,
          borderRadius: "12px 0 0 12px",
        }}
      />
    </div>
  </div>
);

// Pie Chart
const PieChart = ({ data }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  let gradient = "";
  let cumulativePercent = 0;

  data.forEach((item) => {
    const start = cumulativePercent;
    const percent = (item.value / total) * 100;
    cumulativePercent += percent;
    gradient += `${item.color} ${start}% ${start + percent}%, `;
  });

  gradient = gradient.slice(0, -2);

  return (
    <div style={{ position: "relative", width: "160px", height: "150px", margin: "0 auto" }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          background: `conic-gradient(${gradient})`,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: "20%",
          borderRadius: "50%",
          backgroundColor: "#1f2937",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          fontWeight: "bold",
          fontSize: "18px",
        }}
      >
        {total}%
      </div>
    </div>
  );
};

// Line Chart
const AgentForcedPTPChart = () => {
  const data = [
    { name: "Mon", value: 30 },
    { name: "Tue", value: 50 },
    { name: "Wed", value: 40 },
    { name: "Thu", value: 70 },
    { name: "Fri", value: 60 },
    { name: "Sat", value: 80 },
    { name: "Sun", value: 90 },
  ];

  return (
    <div style={{ width: "100%", height: "200px", marginTop: "16px" }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid stroke="#374151" strokeDasharray="3 3" />
          <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
          <YAxis stroke="#9ca3af" fontSize={12} />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#ef4444"
            strokeWidth={2}
            dot={{ r: 3 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};


// Dummy Heatmap
const HeatmapPlaceholder = () => (
  <div
    style={{
      display: "grid",
      gridTemplateColumns: "repeat(5, 1fr)",
      gap: "4px",
      marginTop: "8px",
    }}
  >
    {[...Array(10)].map((_, i) => (
      <div
        key={i}
        style={{
          height: "24px",
          borderRadius: "4px",
          backgroundColor:
            i % 3 === 0 ? "#3b82f6" : i % 2 === 0 ? "#f97316" : "#facc15",
        }}
      />
    ))}
  </div>
);

export default Insight;

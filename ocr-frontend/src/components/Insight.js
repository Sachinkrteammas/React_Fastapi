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
    padding: "16px",
    borderRadius: "8px",
  };



const Insight = () => {
    const [startDate, setStartDate] = useState(
        new Date().toISOString().split("T")[0]
      );
      const [endDate, setEndDate] = useState(
        new Date().toISOString().split("T")[0]
      );
  const data1 = [
    { name: "Call 1", Calm: 40, Angry: 20 },
    { name: "Call 2", Calm: 50, Angry: 30 },
    { name: "Call 3", Calm: 45, Angry: 35 },
    { name: "Call 4", Calm: 60, Angry: 25 },
    { name: "Call 5", Calm: 55, Angry: 40 },
  ];
  return (
    <Layout>
      <div
        style={{
          backgroundColor: "#0f172a",
          minHeight: "100vh",
          padding: "16px",
        }}
      >
        <h4
          style={{
            fontSize: "20px",
            fontWeight: "600",
            color: "#3b82f6",
            marginBottom: "16px",
          }}
        >
          AI Collections Analysis Dashboard
        </h4>
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


        <div style={gridStyle}>
          <Card title="Promise to Pay (PTP) Analysis">
            <PieChart percentage={45} />
            <div
              style={{ marginTop: "8px", fontSize: "14px", color: "#d1d5db" }}
            >
              <p>🔵 Positive - 25%</p>
              <p>🟠 Negative - 15%</p>
            </div>
          </Card>

          <Card title="Intent Classification">
            <BarLabel
              label="'Willing but Delayed'"
              percent={70}
              color="#3b82f6"
            />
            <BarLabel label="'Unwilling'" percent={40} color="#ef4444" />
            <BarLabel label="'Can't Pay'" percent={50} color="#facc15" />
          </Card>

          <Card title="Root Cause Detection">
            <BarLabel label="Cash Flow Issues" percent={80} color="#3b82f6" />
            <BarLabel label="Job Loss" percent={50} color="#f97316" />
            <BarLabel label="Dispute" percent={30} color="#ef4444" />
            <BarLabel label="Other" percent={20} color="#9ca3af" />
          </Card>

          <Card title="Detect agent-forced PTPs">
            <AgentForcedPTPChart />
          </Card>

          <Card title="Escalation Risk Alerts">
            <BarLabel label="'I'll complain'" percent={70} color="#3b82f6" />
            <BarLabel
              label="'going to consumer court'"
              percent={65}
              color="#facc15"
            />
            <BarLabel label="'I tweet this'" percent={45} color="#f97316" />
          </Card>

          <Card title="Dispute Management">
            <PieChart percentage={35} />
            <ul
              style={{ fontSize: "14px", color: "#d1d5db", marginTop: "8px" }}
            >
              <li>I've already paid</li>
              <li>Wrong charges</li>
              <li>False promises</li>
              <li>Reversal pending</li>
              <li>Not my account</li>
            </ul>
          </Card>

          <Card title="Agent Behavior Monitoring">
            <BarLabel label="Harsh Tone" percent={50} color="#ef4444" />
            <BarLabel label="False Promises" percent={60} color="#facc15" />
            <BarLabel label="Threatening Tone" percent={70} color="#f97316" />
          </Card>

          <Card title="Emotional & Sentiment Analysis">
            <ResponsiveContainer width="100%" height={100}>
              <LineChart data={data1}>
                <CartesianGrid stroke="#374151" strokeDasharray="3 3" />
                <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
                <YAxis stroke="#9ca3af" fontSize={12} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="Calm"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="Frustrated"
                  stroke="#facc15"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="Angry"
                  stroke="#ef4444"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="Resigned"
                  stroke="#9ca3af"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
            <div
              style={{ fontSize: "12px", marginTop: "8px", color: "#9ca3af" }}
            >
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

const Card = ({ title, children }) => (
  <div style={cardStyle}>
    <h2 style={titleStyle}>{title}</h2>
    {children}
  </div>
);

const BarLabel = ({ label, percent, color }) => (
  <div style={{ marginBottom: "12px" }}>
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        fontSize: "14px",
        color: "#d1d5db",
      }}
    >
      <span>{label}</span>
      <span>{percent}%</span>
    </div>
    <div
      style={{
        width: "100%",
        backgroundColor: "#374151",
        height: "8px",
        borderRadius: "8px",
      }}
    >
      <div
        style={{
          width: `${percent}%`,
          backgroundColor: color,
          height: "8px",
          borderRadius: "8px",
        }}
      />
    </div>
  </div>
);

const PieChart = ({ percentage }) => (
  <div
    style={{
      position: "relative",
      width: "96px",
      height: "96px",
      margin: "0 auto",
    }}
  >
    <div
      style={{
        position: "absolute",
        inset: 0,
        borderRadius: "50%",
        background: `conic-gradient(#facc15 ${percentage}%, #3b82f6 0)`,
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
      {percentage}%
    </div>
  </div>
);

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
    <ResponsiveContainer width="100%" height={100}>
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
  );
};

const LineGraphPlaceholder = () => (
  <div
    style={{
      height: "100px",
      background: "linear-gradient(to right, #ef4444, #b91c1c)",
      opacity: 0.5,
      borderRadius: "8px",
    }}
  />
);

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

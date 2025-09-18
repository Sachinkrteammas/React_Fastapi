import React, { useState, useEffect } from "react";
import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import Layout from "../layout";
import "../layout.css";
import "./Estimated.css";
import { BASE_URL } from "./config";

export default function EstimatedNpsCsat() {
  const gaugeColors = ["#FF6B6B", "#FFD93D", "#3FC1C9"];

  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split("T")[0]);
  const [dailySummary, setDailySummary] = useState([]);
  const [npsData, setNpsData] = useState([]);
  const [csatData, setCsatData] = useState([]);
  const [pieData, setPieData] = useState([]);
  const [trendData, setTrendData] = useState([]);

  useEffect(() => {
    setTimeout(() => setLoading(false), 2000);
  }, []);

  const fetchMetrics = () => {
    setLoading(true);
    fetch(`${BASE_URL}/franchise-feedback-metrics?start_date=${startDate}&end_date=${endDate}`)
      .then((res) => res.json())
      .then((data) => {
        // NPS & CSAT gauge data
        setNpsData([{ value: data.Franchise_Prospect_Loyalty_NPS.nps_score || 0 }]);
        setCsatData([{ value: data.Franchise_Pitch_Satisfaction_CSAT.csat_score || 0 }]);

        // Pie chart data
        setPieData([
          { name: "Positive", value: data.Franchise_Prospect_Sentiment.positive || 0, color: "#0088FE" },
          { name: "Negative", value: data.Franchise_Prospect_Sentiment.negative || 0, color: "#FF4081" },
          { name: "Neutral", value: data.Franchise_Prospect_Sentiment.neutral || 0, color: "#FFA500" },
        ]);

        // Daily feedback table
        setDailySummary(data.Daily_Franchise_Call_Feedback_Summary || []);

        // Day-wise sentiment trend
        // Transform API trend array into format suitable for LineChart
        const trendForChart = data.Franchise_Prospect_Sentiment_Trend.map((row) => ({
          date: row.date,
          Improving: row.Improving,
          Worsening: row.Worsening,
          Stable: row.Stable,
          None: row.None,
        }));
        setTrendData(trendForChart);
      })
      .catch((err) => console.error("Error fetching metrics:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchMetrics();
  }, [startDate, endDate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchMetrics();
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
    <Layout heading="Estimated NPS & CSAT">
      <div className="dashboard-container">
        <div className="header">
          <h5>AI-Enhanced Sales Strategy Dashboard</h5>
          <div className="salesheader">
            <label>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
            </label>
            <label>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
            </label>
            <label>
              <input type="button" className="setsubmitbtn" value="Submit" onClick={handleSubmit} />
            </label>
          </div>
        </div>

        <h4 style={{ fontSize: "16px" }}>Estimated NPS & CSAT</h4>
        <div className="dashboard-grid">
          {/* NPS Gauge */}
          <div className="widget">
            <h5 className="leftside">Franchise Prospect Loyalty (NPS)</h5>
            <ResponsiveContainer width="100%" height={150}>
              <PieChart>
                <Pie
                  data={npsData}
                  dataKey="value"
                  cx="50%"
                  cy="100%"
                  innerRadius={60}
                  outerRadius={100}
                  startAngle={180}
                  endAngle={0}
                >
                  <Cell fill={gaugeColors[0]} />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <p className="gauge-label">{npsData[0]?.value}</p>
          </div>

          {/* CSAT Gauge */}
          <div className="widget">
            <h5 className="leftside">Franchise Pitch Satisfaction (CSAT)</h5>
            <ResponsiveContainer width="100%" height={150}>
              <PieChart>
                <Pie
                  data={csatData}
                  dataKey="value"
                  cx="50%"
                  cy="100%"
                  innerRadius={60}
                  outerRadius={100}
                  startAngle={180}
                  endAngle={0}
                >
                  <Cell fill={gaugeColors[2]} />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <p className="gauge-label">{csatData[0]?.value}%</p>
          </div>

          {/* Sentiment Pie */}
          <div className="widget">
            <h5 className="leftside">Franchise Prospect Sentiment (Positive/Negative/Neutral)</h5>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ percent }) => `${(percent * 100).toFixed(1)}%`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>

            <ul className="feedback-legend">
              {pieData.map((item, index) => (
                <li key={index} style={{ color: item.color }}>
                  <span className="legend-box" style={{ backgroundColor: item.color }}></span>
                  {item.name}
                </li>
              ))}
            </ul>
          </div>

          {/* Daily Feedback Table */}
          <div className="widget full-width">
            <h3 className="leftside">Daily Franchise Call Feedback Summary</h3>
            <table>
              <thead>
                <tr>
                  <th>Call Date</th>
                  <th>Feedback Summary</th>
                </tr>
              </thead>
              <tbody>
                {dailySummary.map((row, idx) => (
                  <tr key={idx}>
                    <td>{new Date(row.date).toDateString()}</td>
                    <td>{row.feedback_summary}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Sentiment Trend Line */}
          <div className="widget full-width">
            <h3 className="leftside">Franchise Prospect Sentiment Trend</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={trendData}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="Improving" stroke="#00C49F" strokeWidth={2} />
                <Line type="monotone" dataKey="Stable" stroke="#FFBB28" strokeWidth={2} />
                <Line type="monotone" dataKey="Worsening" stroke="#FF8042" strokeWidth={2} />
                <Line type="monotone" dataKey="None" stroke="#8884d8" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </Layout>
  );
}

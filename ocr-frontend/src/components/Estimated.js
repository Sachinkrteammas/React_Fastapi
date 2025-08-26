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

export default function Estimated() {


  const gaugeColors = ["#FF6B6B", "#FFD93D", "#3FC1C9"];




  //loading code start===>
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split("T")[0]);
  const [metrics, setMetrics] = useState([]);
  const [grandTotal, setGrandTotal] = useState(null);


    const [npsData, setNpsData] = useState([]);
    const [csatData, setCsatData] = useState([]);
    const [pieData, setPieData] = useState([]);
    const [trendData, setTrendData] = useState([]);

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  }, []);



const fetchMetrics = () => {
  setLoading(true); // start loading
  fetch(
    `${BASE_URL}/metrics/daily?start_date=${startDate}&end_date=${endDate}&grand_total=true`
  )
    .then((res) => res.json())
    .then((data) => {
      // table data
      setMetrics(data.data || []);

      // grand total row
      setGrandTotal(data.grand_total || null);

      // dynamic chart data
      setNpsData([{ value: data.grand_total?.NPS_Score || 0 }]);
      setCsatData([{ value: data.grand_total?.CSAT_Score || 0 }]);
//      setPieData(data.pie_data || []);
setPieData([
  { name: "Positive", value: data.grand_total?.Promoter_Count || 0, color: "#0088FE" },
  { name: "Negative", value: data.grand_total?.Detractor_Count || 0, color: "#FF4081" },
  { name: "Neutral",  value: data.grand_total?.Passive_Count   || 0, color: "#FFA500" },
]);
      setTrendData(data.trend_list || []);
    })
    .catch((err) => console.error("Error fetching metrics:", err))
    .finally(() => {
      setLoading(false); // stop loading
    });
};


    useEffect(() => {
      fetchMetrics();
    }, []);


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
  //loading code end==>

  return (
    <Layout heading="Title to be decided">
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
              <input
                type="button"
                className="setsubmitbtn"
                value="Submit"
                onClick={handleSubmit}
              />
            </label>
          </div>
        </div>
        <h4 style={{fontSize:"16px"}}>Estimated NPS & CSAT</h4>

        <div className="dashboard-grid">
          {/* NPS Gauge Chart */}
          <div className="widget">
            <h5 className="leftside">Net Promoter Score (NPS)</h5>
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
            <p className="gauge-label">{npsData[0].value}</p>
          </div>

          {/* CSAT Gauge Chart */}
          <div className="widget">
            <h5 className="leftside">Customer Satisfaction (CSAT)</h5>
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
            <p className="gauge-label">{csatData[0].value}%</p>
          </div>

          {/* Feedback Breakdown */}
          <div className="widget">
            <h5 className="leftside">Feedback Status Breakdown</h5>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, percent }) =>
                    ` ${(percent * 100).toFixed(1)}%`
                  } // Shows labels inside the graph
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>

            {/* Display Legend as List */}
            <ul className="feedback-legend">
              {pieData.map((item, index) => (
                <li key={index} style={{ color: item.color }}>
                  <span
                    className="legend-box"
                    style={{ backgroundColor: item.color }}
                  ></span>
                  {item.name}
                </li>
              ))}
            </ul>
          </div>

          {/* NPS and CSAT Analysis Table */}
            <div className="widget full-width" style={{ width: "100%" }}>
              <h3 className="leftside">NPS and CSAT Analysis</h3>
              <table>
                <thead>
                  <tr>
                    <th>Call Date</th>
                    <th>Detractor Count</th>
                    <th>Passive Count</th>
                    <th>Promoter Count</th>
                    <th>NPS Score</th>
                    <th>CSAT Score</th>
                    <th>Total Feedback</th>
                  </tr>
                </thead>
                <tbody>
                  {metrics.map((row, idx) => (
                    <tr key={idx}>
                      <td>{row.Calldate ? new Date(row.Calldate).toDateString() : "—"}</td>
                      <td className="detractor">{row.Detractor_Count}</td>
                      <td className="passive">{row.Passive_Count}</td>
                      <td className="promoter">{row.Promoter_Count}</td>
                      <td className="nps">{row.NPS_Score}</td>
                      <td className="csat">{row.CSAT_Score}%</td>
                      <td className="total-feedback">{row.Total_Feedbacks}</td>
                    </tr>
                  ))}
                  {grandTotal && (
                    <tr className="grand-total">
                      <td><b>Grand Total</b></td>
                      <td>{grandTotal.Detractor_Count}</td>
                      <td>{grandTotal.Passive_Count}</td>
                      <td>{grandTotal.Promoter_Count}</td>
                      <td>{grandTotal.NPS_Score}</td>
                      <td>{grandTotal.CSAT_Score}%</td>
                      <td>{grandTotal.Total_Feedbacks}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

          {/* NPS and CSAT Trend */}
          <div className="widget full-width" style={{ width: "100%" }}>
            <h3 className="leftside">NPS and CSAT Day Wise Trend</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={trendData}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="NPS"
                  stroke="#FF0000"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="CSAT"
                  stroke="#FFA500"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </Layout>
  );
}

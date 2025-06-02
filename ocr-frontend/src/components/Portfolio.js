//import React from 'react';
//import Layout from "../layout";
//import "../layout.css";
//
//function Portfolio() {
//  return (
//    <Layout heading="Title to be decided">
//      <div style={{ padding: '2rem', fontSize: '2rem' }}>
//        Hello Portfolio
//      </div>
//    </Layout>
//  );
//}
//
//export default Portfolio;



import React, { useState,useEffect } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar, ResponsiveContainer,
} from 'recharts';
import "./Portfolio.css";
import Layout from "../layout";
import "../layout.css";


const ptpData = [
  { month: 'Jan', PTP: 1500, RTP: 500 },
  { month: 'Feb', PTP: 2000, RTP: 700 },
  { month: 'Mar', PTP: 2500, RTP: 900 },
  { month: 'Apr', PTP: 2200, RTP: 800 },
  { month: 'May', PTP: 3000, RTP: 1200 },
  { month: 'Jun', PTP: 3500, RTP: 1400 },
  { month: 'Sep', PTP: 5000, RTP: 2000 },
  { month: 'Dec', PTP: 6000, RTP: 2800 },
];

const ptpByAgent = [
  { name: 'Alex', ptp: 3600 },
  { name: 'Sarah', ptp: 3000 },
  { name: 'John', ptp: 2400 },
  { name: 'Jennifer', ptp: 2000 },
  { name: 'Michael', ptp: 1600 },
];

const customerData = [
  { id: 'C1234', agent: 'John', date: '2025-05-20', amount: '$5,200', status: 'Fulfilled' },
  { id: 'C1245', agent: 'Alex', date: '2025-05-20', amount: '$3,000', status: 'Fulfilled' },
  { id: 'C1236', agent: 'John', date: '2025-05-20', amount: '$5,500', status: 'Pending' },
  { id: 'C1237', agent: 'Jonice', date: '2025-05-20', amount: '$2,200', status: 'Fulfilled' },
  { id: 'C1258', agent: 'Carl', date: '2025-05-20', amount: '$5,500', status: 'Fulfilled' },
  { id: 'C1236', agent: 'Sarah', date: '2025-04-12', amount: '$5,200', status: 'Pending' },
];

const Portfolio = () => {
 const [startDate, setStartDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [endDate, setEndDate] = useState(
    new Date().toISOString().split("T")[0]
  );
const sectionStyle = {
  backgroundColor: "#f9fafb",
  padding: "10px",
  borderRadius: "8px",
};

const fetchPtpData = async () => {
console.log(startDate,endDate,"=========date wise data")
};

  return (
  <Layout heading="Title to be decided">
    <div className="dashboard">
      <h1>Collection Calls Portfolio Analysis</h1>

      <div
          style={{
            display: "flex",
            gap: "35px",
            marginBottom: "20px",
            alignItems: "center",
          }}
        >
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
            onClick={fetchPtpData }
          >
            Apply Filters
          </button>
        </div>

      <div className="cards">
        <Card title="Total Calls" value="10,482" />
        <Card title="PTP Fulfillment %" value="75.5%" />
        <Card title="Total RTP" value="1.150" />
      </div>

      <div className="charts">
        <div className="chart-box">
          <h2>PTP and RTP Trends</h2>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={ptpData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="PTP" stroke="#007bff" />
              <Line type="monotone" dataKey="RTP" stroke="#28a745" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-box">
          <h2>PTP by Agent</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={ptpByAgent} layout="vertical">
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" />
              <Tooltip />
              <Bar dataKey="ptp" fill="#007bff" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="table-section">
        <h2>Customer Data</h2>
        <table>
          <thead>
            <tr>
              <th>Customer ID</th>
              <th>Agent</th>
              <th>Call Date</th>
              <th>Promised Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {customerData.map((row) => (
              <tr key={row.id}>
                <td>{row.id}</td>
                <td>{row.agent}</td>
                <td>{row.date}</td>
                <td>{row.amount}</td>
                <td>
                  <span className={`status ${row.status.toLowerCase()}`}>
                    {row.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
    </Layout>
  );
};

const Card = ({ title, value }) => {
  let backgroundColor = "rgb(251, 140, 0)"; // default

  if (title === "Total Calls") {
    backgroundColor = "rgb(67, 160, 71)"; // green
  } else if (title === "PTP Fulfillment %") {
    backgroundColor = "rgb(229, 57, 53)"; // red
  }

  return (
    <div className="card" style={{ backgroundColor }}>
      <p className="card-title" style={{ color: "black" }}>{title}</p>
      <p className="card-value">{value}</p>
    </div>
  );
};


export default Portfolio;


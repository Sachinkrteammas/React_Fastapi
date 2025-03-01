import React, { useState } from "react";
import "./Details.css";
import Layout from "../layout"; // Import layout component
import "../layout.css"; // Import styles
import { PieChart, Pie as RePie, Cell, Tooltip, Legend } from "recharts";

const queryData = [
  { name: "Short Call/Blank Call", count: 5 },
  { name: "Order Status", count: 4 },
  { name: "Customer wants company details", count: 3 },
  { name: "Query Related to COD Services", count: 2 },
  { name: "Customer Wants to Update Contact Details", count: 1 },
];

const complaintData = [
  { name: "Damage Product Received", count: 6 },
  { name: "Wrong Product Delivered/Missing Item", count: 3 },
  { name: "Refund Rejected/Coupon", count: 2 },
  { name: "Payment Debited but Order Not Created", count: 1 },
  { name: "Delivered Product Complaint", count: 1 },
];

const COLORS = ["#4CAF50", "#66BB6A", "#81C784", "#A5D6A7", "#C8E6C9"];
const RED_COLORS = ["#E53935", "#EF5350", "#E57373", "#EF9A9A", "#FFCDD2"];


const DetailAnalysis = () => {
  const [auditData, setAuditData] = useState([
    {
      week: "Week 4",
      query: 42,
      complaint: 55,
      request: 3,
      saleDone: 0,
      total: 33
    }
  ]);

  const [queryData] = useState([
    { name: "Short Call/Blank Call", count: 5 },
    { name: "Order Status", count: 4 },
    { name: "Customer wants company details", count: 3 },
    { name: "Query Related to COD Services", count: 2 },
    { name: "Customer Wants to Update Contact", count: 1 }
  ]);

  // Data for Complaints
  const [complaintData] = useState([
    { name: "Damaged Product Received", count: 5 },
    { name: "Wrong Product Delivered/Missing Item", count: 3 },
    { name: "Refund Related/Coupon", count: 2 },
    { name: "Payment debited but order not created", count: 1 },
    { name: "Delivered Product Complaint", count: 1 }
  ]);

  // Data for Requests
  const [requestData] = useState([
    { name: "Reship on Damage/Missing/Wrong Product", count: 1 }
  ]);

  // Colors for Pie Charts
  const COLORS = ["#4caf50", "#26a69a", "#ffca28", "#f57c00", "#d32f2f"];

  return (
    <Layout>
      <div className="dashboard-container-de">
        {/* Header Section */}
        <div className="header">

          <div className="date-picker-container">
            <input type="date" className="date-picker" />

          </div>
        </div>



        {/* Main Content */}
        <div className="content-flex">
          {/* Left Section */}
          <div className="left-section-de">
            {/* Stats Boxes */}
            <div className="stats-flex">
              {["CQ Score 84.6%", "Audit Count 33", "Fatal Count 0", "Fatal% 0%"].map((stat, index) => (
                <div key={index} className="stat-card">
                  {stat}
                </div>
              ))}
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
                      {queryData.map((query, index) => (
                        <tr key={index}>
                          <td>{query.name}</td>
                          <td className="count">{query.count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>


                <div className="chart-detail">
                  <PieChart width={250} height={330}>
                    <RePie
                      data={queryData}
                      dataKey="count"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label
                    >
                      {queryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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
                      {complaintData.map((complaint, index) => (
                        <tr key={index}>
                          <td>{complaint.name}</td>
                          <td className="count">{complaint.count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="chart-detail">
                  <PieChart width={250} height={330}>
                    <RePie
                      data={complaintData}
                      dataKey="count"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label
                    >
                      {complaintData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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
                      {requestData.map((request, index) => (
                        <tr key={index}>
                          <td>{request.name}</td>
                          <td className="count">{request.count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="chart-detail">
                  <PieChart width={250} height={330}>
                    <RePie
                      data={requestData}
                      dataKey="count"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label
                    >
                      {requestData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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
              {["Query Count 14", "Complaint Count 18", "Request Count 1", "Sale Done Count 0"].map((stat, index) => (
                <div key={index} className="stat-card">
                  {stat}
                </div>
              ))}
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
                  <tr className="total-row">
                    <td>Grand total</td>
                    <td className="percentage green">42%</td>
                    <td className="percentage red">55%</td>
                    <td className="percentage green">3%</td>
                    <td className="percentage">0%</td>
                    <td>33</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DetailAnalysis;

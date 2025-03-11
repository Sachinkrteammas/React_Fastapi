import React from "react";
import Layout from "../layout"; // Import layout component
import "../layout.css"; // Import styles
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import "./Opportunity.css";

const moBreakdownData = [
  { name: "Non Workable", value: 65, color: "#ff1493" },
  { name: "Workable", value: 35, color: "#ff4500" },
];

const moBreakupData = [
  { name: "No Need", value: 74.7, color: "#6a5acd" },
  { name: "Product Disinterest", value: 11.2, color: "#00ced1" },
  { name: "Negative Experience", value: 10.4, color: "#ff6347" },
  { name: "Budget Constraint", value: 3.7, color: "#ffd700" },
];

export default function Opportunity() {
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
                //   value={formData.start_date}
                //   onChange={handleChange}
                required
              />
            </label>
            <label>
              <input
                type="date"
                name="end_date"
                //   value={formData.end_date}
                //   onChange={handleChange}
                required
              />
            </label>
            <label>
              <input type="submit" class="setsubmitbtn" value="Submit" />
            </label>
          </div>
        </div>

        <div className="firstdivno">
          <div className="graphdiv">
            <div className="divide">
              <div className="metric-card white">
                <h5>Total Opportunities</h5>
                <b>4,468</b>
              </div>
              <div className="metric-card white">
                <h5>MO Count</h5>
                <b>3,549</b>
              </div>
            </div>
            {/* Charts Section */}
            <div className="charts-containermew">
              {/* MO Breakdown */}
              <div className="chart-containernew">
                <h5>MO Breakdown</h5>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={moBreakdownData}
                      dataKey="value"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                    >
                      {moBreakdownData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>

                {/* Bullet Legend List */}
                <ul className="chart-legend">
                  {moBreakdownData.map((entry, index) => (
                    <li key={index}>
                      <span
                        className="legend-bullet"
                        style={{ backgroundColor: entry.color }}
                      ></span>
                      {entry.name} ({entry.value})
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="chart-containernew">
              <h3>MO Breakup</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={moBreakupData}
                    dataKey="value"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                  >
                    {moBreakupData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>

              {/* Bullet Legend List */}
              <ul className="chart-legend">
                {moBreakupData.map((entry, index) => (
                  <li key={index}>
                    <span
                      className="legend-bullet"
                      style={{ backgroundColor: entry.color }}
                    ></span>
                    {entry.name} ({entry.value})
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="tablediv">
            <div className="tables-container1">
              {/* First Table - MO Category */}
              <div className="table-container1">
                <h3>MO Category</h3>
                <table className="tablebody">
                  <thead>
                    <tr>
                      <th>MO Category</th>
                      <th>Observations & Insights</th>
                      <th>Count</th>
                      <th>Contr%</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Price Sensitivity</td>
                      <td>Possible to convert with discounts.</td>
                      <td>43</td>
                      <td>38%</td>
                    </tr>
                    <tr>
                      <td>Budget Constraint</td>
                      <td>Future potential lead, needs follow-up.</td>
                      <td>33</td>
                      <td>29%</td>
                    </tr>
                    <tr>
                      <td>Trust Concerns</td>
                      <td>Major barrier; provide secure payment options.</td>
                      <td>13</td>
                      <td>12%</td>
                    </tr>
                    <tr>
                      <td>Logistic Concern</td>
                      <td>Fulfillment error; needs rectification.</td>
                      <td>13</td>
                      <td>12%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="table-container2">
              <h3>NED/ED Category</h3>
              <table className="tablebody">
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Observations</th>
                    <th>Status</th>
                    <th>Count</th>
                    <th>Contr%</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Price Sensitivity</td>
                    <td>Liked the product but wants a better deal.</td>
                    <td>Workable</td>
                    <td>43</td>
                    <td>1%</td>
                  </tr>
                  <tr>
                    <td>Budget Constraint</td>
                    <td>Wants to buy later.</td>
                    <td>Workable</td>
                    <td>34</td>
                    <td>1%</td>
                  </tr>
                  <tr>
                    <td>Negative Experience</td>
                    <td>Perfume too strong.</td>
                    <td>Workable</td>
                    <td>22</td>
                    <td>1%</td>
                  </tr>
                  <tr>
                    <td>Trust Concerns</td>
                    <td>Doesn't trust online payments.</td>
                    <td>Workable</td>
                    <td>13</td>
                    <td>0%</td>
                  </tr>
                  <tr>
                    <td>Product Disinterest</td>
                    <td>Not Interested in Perfumes.</td>
                    <td>Non Workable</td>
                    <td>340</td>
                    <td>11%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

import React, { useState } from "react";
import DatePicker from "react-datepicker";
import { PieChart, Pie, Cell, Legend, Tooltip } from "recharts";
import "react-datepicker/dist/react-datepicker.css";
import Layout from "../layout"; // Import layout component
import "../layout.css"; // Import styles
// import { Layout } from "lucide-react";
import "./Potential.css";

const Potential = () => {
  // Date State
  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;

  // Sample Data for Table
  const escalationData = {
    "Call Date": "28-Feb-25",
    "Lead ID": "12631818",
    "Agent Name": "Lovely Supriya",
    "Phone No": "9984743388",
    "Alert": "Social Media and Consumer Court Threat",
    "Sensetive Word Used": "social media",
    "Negative Word": "dissatisfied, comparison to Amazon",
    "Scenario": "Complaint",
    "Sub Scenario": "Wrong Product Delivered/Missing",
    "Sensitive word context":
      "The customer mentioned comparing the company to platforms like Amazon and Flipkart...",
    "Area for Improvement":
      "The agent did not provide a satisfactory resolution...",
    "Top Negative Signals": "Threat",
    "Transcribe_Text":
      "Good morning welcome to bhaarti. This is how may I help you...",
  };

  // Sample Data for Pie Chart
  const pieChartData = [
    { name: "Top Negative Signals", value: 2, color: "#c0392b" },
    { name: "Social Media and Consumer Court Threat", value: 3, color: "#e74c3c" },
  ];

  return (
    <Layout>
      <div className="dashboard-container-po">
        {/* Header Section */}
        <header className="headerPo">
          <h3>BELLAVITA</h3>
          <div className="search-container">
            <input
              type="text"
              className="po-search-bar"
              placeholder="Search Lead Id..."
            />
            {/* <div className="filters">
              <div className="filter-item"> */}
            {/* <label>Start Date - End Date</label> */}
            <DatePicker
              selected={startDate}
              onChange={(update) => setDateRange(update)}
              startDate={startDate}
              endDate={endDate}
              selectsRange
              className="po-date-picker"
              placeholderText="MM-DD-YYYY "
            />
            {/* </div>
            </div> */}
              <button className="po-search-button" style={{ marginTop: "0%" }}>Search</button>
          </div>



        </header>

        <div className="content">
          {/* Left Section - Pie Chart */}
          <div className="chart-container">
            <h3 className="Po-text">Recent Escalation</h3>
            <PieChart width={250} height={250}>
              <Pie
                data={pieChartData}
                dataKey="value"
                outerRadius={80}
                fill="#8884d8"
                label
              >
                {pieChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend
                wrapperStyle={{
                  position: "absolute",
                  width: "210px",
                  height: "auto",
                  left: "215px",
                  bottom: "115px",
                  fontSize: "12px",
                }}
              />
            </PieChart>

            {/* List of Recent Escalations */}
            <div className="scrollable-list">
              <div className="escalation-list">

                <div className="escalations-items">
                  <p>Top Negative Signals</p>
                  <p><strong>Feb-28</strong></p>
                  <p>Lead ID: <strong>12631850</strong></p>
                  <p>Customer dissatisfaction with the brand and delivery partner.</p>
                </div>
                <div className="escalations-items">
                  <p>Social Media and Consumer Court Threat</p>
                  <p><strong>Feb-28</strong></p>
                  <p>Lead ID: <strong>12631848</strong></p>
                  <p>Customer mentioned posting about issues on social media.</p>
                </div>

                {/* Scrollable items start here */}

                <div className="escalations-items">
                  <p>Social Media and Consumer Court Threat</p>
                  <p><strong>Feb-28</strong></p>
                  <p>Lead ID: <strong>12631848</strong></p>
                  <p>Customer mentioned posting about issues on social media.</p>
                </div>
                <div className="escalations-items">
                  <p>Social Media and Consumer Court Threat</p>
                  <p><strong>Feb-28</strong></p>
                  <p>Lead ID: <strong>12631848</strong></p>
                  <p>Customer mentioned posting about issues on social media.</p>
                </div>
              </div>
            </div>

          </div>

          {/* Right Section - Escalation Table */}
          <div className="table-container">
            <h3 className="Po-text">Potential Escalation - Sensitive Cases</h3>
            <table>
              <tbody>
                {Object.entries(escalationData).map(([key, value]) => (
                  <tr key={key}>
                    <td className="fields">{key}</td>
                    <td className="values">{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Potential;

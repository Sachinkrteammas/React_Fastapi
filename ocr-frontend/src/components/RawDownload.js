import React, { useState } from "react";
import Layout from "../layout"; // Import layout component
import "../layout.css"; // Import styles
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./RawDown.css";

const RawDownload = () => {
  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;
  const [selectedAgent, setSelectedAgent] = useState("");

  const data = [
    {
      clientId: 375,
      callDate: "28-Feb-25",
      leadId: 12618848,
      agentName: "Prashanjit Sarkar",
      scenario: "Query",
      scenario1: "Short Call/Blank Call",
      scenario2: "Blank Call",
      scenario3: "MCN",
      Competitor_Name: " ",
      Customer_Connection: "false",

    },
    {
      clientId: 375,
      callDate: "28-Feb-25",
      leadId: 12623108,
      agentName: "Pallavi Ray",
      scenario: "Complaint",
      scenario1: "Customer Wants to Update his contact details on hi",
      scenario2: "Refund Related/Coupon",
      scenario3: "Corrections required in Email ID",
      Competitor_Name: " ",
      Customer_Connection: "true",
    },
    {
      clientId: 375,
      callDate: "28-Feb-25",
      leadId: 12623106,
      agentName: "Gaurav",
      scenario: "Complaint",
      scenario1: "Payment debited but order not created",
      scenario2: "Tech Error",
      scenario3: "BVO-Admin",
      Competitor_Name: " ",
      Customer_Connection: "false",
    },
    {
      clientId: 375,
      callDate: "28-Feb-25",
      leadId: 12618852,
      agentName: "Lovely Supriya",
      scenario: "Query",
      scenario1: "Short Call/Blank Call",
      scenario2: "Blank Call",
      scenario3: "MCN",
      Competitor_Name: " ",
      Customer_Connection: "true",
    },
  ];

  return (
    <Layout>
      <div className="Down-dashboard">
        <header className="headerDown">
          <h3>BELLAVITA</h3>
          <div className="filters">
            <div className="filter-item">
              <label>Start Date - End Date</label>
              <DatePicker
                selected={startDate}
                onChange={(update) => setDateRange(update)}
                startDate={startDate}
                endDate={endDate}
                selectsRange
                className="date-picker"
                placeholderText="MM-DD-YYYY"
              />
            </div>


            {/* End Date */}
            {/* <div className="filter-item">
              <label>End Date</label>
              <DatePicker
                selected={endDate}
                onChange={(date) => setEndDate(date)}
                className="date-picker"
                selectsEnd
                startDate={startDate}
                endDate={endDate}
                minDate={startDate}
              />
            </div> */}

            <div className="filter-item">
              <label>Agent Username</label>
              <select onChange={(e) => setSelectedAgent(e.target.value)} className="dropdown">
                <option value="">Select Agent</option>
                <option value="Prashanjit Sarkar">Prashanjit Sarkar</option>
                <option value="Pallavi Ray">Pallavi Ray</option>
                <option value="Gaurav">Gaurav</option>
              </select>
            </div>
          </div>

        </header>




        <table>
          <thead>
            <tr>
              <th>ClientId</th>
              <th>CallDate</th>
              <th>Lead ID</th>
              <th>Agent Name</th>
              <th>Scenario</th>
              <th>Scenario1</th>
              <th>Scenario2</th>
              <th>Scenario3</th>
              <th>Competitor_Name</th>
              <th>Customer_Connection</th>

            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr key={index}>
                <td>{row.clientId}</td>
                <td>{row.callDate}</td>
                <td>{row.leadId}</td>
                <td>{row.agentName}</td>
                <td>{row.scenario}</td>
                <td>{row.scenario1}</td>
                <td>{row.scenario2}</td>
                <td>{row.scenario3}</td>
                <td>{row.Competitor_Name}</td>
                <td>{row.Customer_Connection}</td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  );
};
export default RawDownload;
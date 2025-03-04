import React, { useState } from "react";
import Layout from "../layout"; // Import layout component
import "../layout.css"; // Import styles
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./RawDown.css";

const RawDownload = () => {
  const [leadId, setLeadId] = useState("");
  const [data, setData] = useState([]);
  const [startDate, setStartDate] = useState(""); // Stores as string
  const [endDate, setEndDate] = useState(""); // Stores as string

  // const data = [
  //   {
  //     clientId: 375,
  //     callDate: "28-Feb-25",
  //     leadId: 12618848,
  //     agentName: "Prashanjit Sarkar",
  //     scenario: "Query",
  //     scenario1: "Short Call/Blank Call",
  //     scenario2: "Blank Call",
  //     scenario3: "MCN",
  //     Competitor_Name: " ",
  //     Customer_Connection: "false",

  //   },
  //   {
  //     clientId: 375,
  //     callDate: "28-Feb-25",
  //     leadId: 12623108,
  //     agentName: "Pallavi Ray",
  //     scenario: "Complaint",
  //     scenario1: "Customer Wants to Update his contact details on hi",
  //     scenario2: "Refund Related/Coupon",
  //     scenario3: "Corrections required in Email ID",
  //     Competitor_Name: " ",
  //     Customer_Connection: "true",
  //   },
  //   {
  //     clientId: 375,
  //     callDate: "28-Feb-25",
  //     leadId: 12623106,
  //     agentName: "Gaurav",
  //     scenario: "Complaint",
  //     scenario1: "Payment debited but order not created",
  //     scenario2: "Tech Error",
  //     scenario3: "BVO-Admin",
  //     Competitor_Name: " ",
  //     Customer_Connection: "false",
  //   },
  //   {
  //     clientId: 375,
  //     callDate: "28-Feb-25",
  //     leadId: 12618852,
  //     agentName: "Lovely Supriya",
  //     scenario: "Query",
  //     scenario1: "Short Call/Blank Call",
  //     scenario2: "Blank Call",
  //     scenario3: "MCN",
  //     Competitor_Name: " ",
  //     Customer_Connection: "true",
  //   },
  // ];

  const fetchCallQualityDetails = async () => {
    if (!startDate || !endDate) {
      alert("Please select both Start and End dates.");
      return;
    }

    try {
      const response = await fetch(
        `http://127.0.0.1:8097/call_quality_assessments?client_id=375&start_date=${startDate}&end_date=${endDate}`
      );
      const result = await response.json();

      // Transform API response to match table structure
      const formattedData = result.map((item) => ({
        clientId: item.ClientId,
        callDate: item.CallDate, // Keeping original format
        leadId: item.lead_id,
        agentName: item.User, // Assuming "User" is the agent name
        scenario: item.scenario,
        scenario1: item.scenario1,
        scenario2: item.scenario2,
        scenario3: item.scenario3,
        Competitor_Name: item.Competitor_Name || "N/A",
        Customer_Connection: item.length_in_sec > 0 ? "true" : "false",
      }));

      setData(formattedData);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  // useEffect(() => {
  //   fetchCallQualityDetails(); // Initial fetch (can be removed if unnecessary)
  // }, []);


  return (
    <Layout>
      <div className="Down-dashboard">
      <header className="header">
      <h3>Dial Desk</h3>


  <label>Start Date: </label>
  <input
    type="date"
    value={startDate}
    onChange={(e) => setStartDate(e.target.value)}
  />

  <label>End Date: </label>
  <input
    type="date"
    value={endDate}
    onChange={(e) => setEndDate(e.target.value)}
  />

  <button className="setbotton" onClick={fetchCallQualityDetails}>
    Submit
  </button>
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
            <th>Competitor Name</th>
            <th>Customer Connection</th>
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
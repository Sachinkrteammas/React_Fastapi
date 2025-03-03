import React, { useState } from "react";
import Layout from "../layout"; // Import layout component
import "../layout.css"; // Import styles
import "./Search.css";


const Search = () => {
  // Mock Data (Replace with API response)
  const [data] = useState({
    CallDate: "28-Feb-25",
    "Lead ID": "12618840",
    "Agent Name": "Rekha Sharma",
    "Competitor Name": "",
    "Customer Concern Acknowledged": "false",
    "Professionalism Maintained": "false",
    "Assurance Or Appreciation Provided": "false",
    "Express Empathy": "false",
    "Pronunciation And Clarity": "false",
    "Enthusiasm And No Fumbling": "false",
    "Active Listening": "false",
    "Politeness And No Sarcasm": "false",
    "Proper Grammar": "false",
    "Accurate Issue Probing": "false",
    "Proper Hold Procedure": "false",
    "Proper Transfer And Language": "false",
    "Address Recorded Completely": "false",
    "Correct And Complete Information": "false",
    "Proper Call Closure": "false",
    "Sensitive Word Used": "None",
    "Area for Improvement": "",
  });


  return (
    <Layout>
      <div className="containers">
        {/* Header Section */}
        <header className="header">
          <h3>BELLAVITA</h3>

          <div className="search-container-se">
            <input
              type="text"
              className="search-bar"
              placeholder="Search Lead Id..."
            />
            <button className="search-button-se ">Search</button>
          </div>

        </header>


        {/* Table Section */}
        <div className="tables-container">
          <table>
            <tbody>
              {Object.entries(data).map(([key, value]) => (
                <tr key={key}>
                  <td className="field">{key}</td>
                  <td className="value">{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>


    </Layout>
  );
};

export default Search;
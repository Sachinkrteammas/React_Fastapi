import React, { useState, useEffect } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import "./SalesDashboard.css";
import Layout from "../layout";
import "../layout.css";
import { BASE_URL } from "./config";

export default function SecondDashboard() {
  const [loading, setLoading] = useState(true);
  const [loading1, setLoading1] = useState(false);
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [endDate, setEndDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [callSummary, setCallSummary] = useState({});
  const [successData, setSuccessData] = useState([]);
  const [rejectedData, setRejectedData] = useState([]);

  useEffect(() => {
    setTimeout(() => setLoading(false), 2000);
  }, []);

  useEffect(() => {
    fetchSalesData();
  }, [startDate, endDate]);

  const fetchSalesData = async () => {
    setLoading1(true);
    try {
      const [summaryResponse, breakdownResponse] = await Promise.all([
        fetch(
          `${BASE_URL}/franchise-call-summary?start_date=${startDate}&end_date=${endDate}`
        ),
        fetch(
          `${BASE_URL}/franchise-call-breakdown?start_date=${startDate}&end_date=${endDate}`
        ),
      ]);

      if (!summaryResponse.ok || !breakdownResponse.ok) {
        throw new Error("Failed to fetch data");
      }

      const summaryResult = await summaryResponse.json();
      setCallSummary(summaryResult);

      const breakdownResult = await breakdownResponse.json();

      // ✅ Success Breakdown
      const success = breakdownResult["Success_Call_Breakdown"] || {};
      setSuccessData([
        { name: "Offer Accepted", value: success.Offer_Accepted ?? 0, color: "#4CAF50" },
        { name: "Budget OK", value: success.Budget_OK ?? 0, color: "#2196F3" },
        { name: "Docs Shared", value: success.Docs_Shared ?? 0, color: "#FFC107" },
        { name: "Meeting Fixed", value: success.Meeting_Fixed ?? 0, color: "#9C27B0" },
        { name: "Converted on Call", value: success.Converted_on_Call ?? 0, color: "#FF5722" },
      ]);

      // ❌ Reject Breakdown
      const reject = breakdownResult["Reject_Call_Breakdown"] || {};
      setRejectedData([
        { name: "Investment Concern", value: reject.Investment_Concern ?? 0, color: "#F44336" },
        { name: "Trust Issue", value: reject.Trust_Issue ?? 0, color: "#FF9800" },
        { name: "Language Barrier", value: reject.Language_Barrier ?? 0, color: "#03A9F4" },
        { name: "Wrong Number", value: reject.Wrong_Number ?? 0, color: "#795548" },
      ]);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading1(false);
    }
  };

  // ✅ Dynamic Funnel Data
  const cstFunnelData = [
    { name: "Total Connected", value: callSummary?.CRT_Isha_to_Manage?.Total_Connected ?? 0, color: "#4682B4" },
    { name: "Total Interested", value: callSummary?.CRT_Isha_to_Manage?.Total_Interested ?? 0, color: "#CD5C5C" },
    { name: "WhatsApp Asked", value: callSummary?.CRT_Isha_to_Manage?.Asked_for_Details_WhatsApp ?? 0, color: "#3CB371" },
    { name: "Meeting Scheduled", value: callSummary?.CRT_Isha_to_Manage?.Meeting_Scheduled ?? 0, color: "rgb(111 101 49)" },
    { name: "Not Interested", value: callSummary?.CRT_Isha_to_Manage?.Not_Interested ?? 0, color: "#FF6347" },
    { name: "Meeting CRM", value: callSummary?.CRT_Isha_to_Manage?.Meeting_Schedule_CRM ?? 0, color: "#9C27B0" },
  ];

  const crtFunnelData = [
    { name: "Total Connected", value: callSummary?.Fabonow_Team_CRT?.Total_Connected ?? 0, color: "#4682B4" },
    { name: "Total Interested", value: callSummary?.Fabonow_Team_CRT?.Total_Interested ?? 0, color: "#CD5C5C" },
    { name: "Not Interested", value: callSummary?.Fabonow_Team_CRT?.Not_Interested ?? 0, color: "#FF6347" },
    { name: "Brochure Discussed", value: callSummary?.Fabonow_Team_CRT?.Brochure_Proposal_Discussed ?? 0, color: "#3CB371" },
    { name: "Conversion", value: callSummary?.Fabonow_Team_CRT?.Conversion ?? 0, color: "rgb(111 101 49)" },
  ];

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
    <Layout heading="Franchise Call Dashboard">
      <div className={`dashboard-container ${loading ? "blurred" : ""}`}>
        <div className="header">
          <h5>AI-Enhanced Franchise Call Dashboard</h5>
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
                type="submit"
                className="setsubmitbtn"
                value="Submit"
                onClick={fetchSalesData}
              />
            </label>
          </div>
        </div>

        {/* 1️⃣ CST & CRT Cards */}
        <div className="metric-container">
          <div className="metric-card green-met">
            <h4>CST (CRT)</h4>
            <div className="metrics">
              <div><b>{callSummary?.CRT_Isha_to_Manage?.Total_Connected ?? 0}</b><p>Total Connected</p></div>
              <div><b>{callSummary?.CRT_Isha_to_Manage?.Total_Interested ?? 0}</b><p>Total Interested</p></div>
              <div><b>{callSummary?.CRT_Isha_to_Manage?.Asked_for_Details_WhatsApp ?? 0}</b><p>WhatsApp Asked</p></div>
              <div><b>{callSummary?.CRT_Isha_to_Manage?.Meeting_Scheduled ?? 0}</b><p>Meeting Scheduled</p></div>
              <div><b>{callSummary?.CRT_Isha_to_Manage?.Not_Interested ?? 0}</b><p>Not Interested</p></div>
              <div><b>{callSummary?.CRT_Isha_to_Manage?.Meeting_Schedule_CRM ?? 0}</b><p>Meeting CRM</p></div>
            </div>
          </div>

          <div className="metric-card blue-met">
            <h4>CRT (Fabonow Team)</h4>
            <div className="metrics">
              <div><b>{callSummary?.Fabonow_Team_CRT?.Total_Connected ?? 0}</b><p>Total Connected</p></div>
              <div><b>{callSummary?.Fabonow_Team_CRT?.Total_Interested ?? 0}</b><p>Total Interested</p></div>
              <div><b>{callSummary?.Fabonow_Team_CRT?.Not_Interested ?? 0}</b><p>Not Interested</p></div>
              <div><b>{callSummary?.Fabonow_Team_CRT?.Brochure_Proposal_Discussed ?? 0}</b><p>Brochure Discussed</p></div>
              <div><b>{callSummary?.Fabonow_Team_CRT?.Conversion ?? 0}</b><p>Conversion</p></div>
            </div>
          </div>
        </div>

        {/* 2️⃣ Success + Reject Breakdown Charts */}
        <div className="fullbodydiv">
          <div className="block1div">
            <div className="chart-container">
              <h3>Success Calls Breakdown (SCB)</h3>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={successData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70}>
                    {successData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <ul className="legend">
                {successData.map((entry, index) => (
                  <li key={index}><span className="bullet" style={{ backgroundColor: entry.color }}></span>{entry.name}</li>
                ))}
              </ul>
            </div>

            <div className="chart-container">
              <h3>CST Funnel</h3>
              <div className="funnel">
                {cstFunnelData.map((item, index) => (
                  <div
                    key={index}
                    className="funnel-item"
                    style={{
                      backgroundColor: item.color,
                      width: `${100 - index * 12}%`,
                    }}
                  >
                    {item.name}: {item.value}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="block2div">
            <div className="chart-container">
              <h3>Rejected Calls Breakdown (RCB)</h3>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={rejectedData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70}>
                    {rejectedData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <ul className="legend">
                {rejectedData.map((entry, index) => (
                  <li key={index}><span className="bullet" style={{ backgroundColor: entry.color }}></span>{entry.name}</li>
                ))}
              </ul>
            </div>

            <div className="chart-container">
              <h3>CRT Funnel</h3>
              <div className="funnel">
                {crtFunnelData.map((item, index) => (
                  <div
                    key={index}
                    className="funnel-item"
                    style={{
                      backgroundColor: item.color,
                      width: `${100 - index * 12}%`,
                    }}
                  >
                    {item.name}: {item.value}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {loading1 && (
          <div className="loader-overlay">
            <div className="bar"></div>
            <div className="bar"></div>
            <div className="bar"></div>
            <div className="bar"></div>
            <div className="bar"></div>
          </div>
        )}
      </div>
    </Layout>
  );
}

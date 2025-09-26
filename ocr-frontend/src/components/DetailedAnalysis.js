import React, { useState, useEffect } from "react";
import Layout from "../layout";
import "../layout.css";
import "./DetailSales.css";
import { BASE_URL } from "./config";

export default function DetailedAnalysis() {
  const [loading, setLoading] = useState(true);
  const [loading1, setLoading1] = useState(false);
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [endDate, setEndDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  // State
  const [callSummary, setCallSummary] = useState({});
  const [contactAnalysisData, setContactAnalysisData] = useState([]); // OP
  const [contactData, setContactData] = useState([]); // Context
  const [discountData, setdiscountData] = useState([]); // Offer Pitch
  const [objectionData, setObjectionData] = useState([]); // POS Breakdown
  const [subcategoryData, setSubcategoryData] = useState([]); // Subcategory
  const [agentPitchData, setAgentPitchData] = useState([]); // Agent Rebuttals

  useEffect(() => {
    setTimeout(() => setLoading(false), 1500);
  }, []);

  useEffect(() => {
    fetchSalesData();
  }, [startDate, endDate]);

  const fetchSalesData = async () => {
    setLoading1(true);
    try {
      // 1. Call Summary
      const summaryRes = await fetch(
        `${BASE_URL}/franchise-call-summary?start_date=${startDate}&end_date=${endDate}`
      );
      const summaryResult = await summaryRes.json();
      setCallSummary(summaryResult);

      // 2. OP Analysis
      const opRes = await fetch(
        `${BASE_URL}/franchise-pitch-conversion-metrics?start_date=${startDate}&end_date=${endDate}`
      );
      const opResult = await opRes.json();
      setContactAnalysisData(opResult.Franchise_Pitch_Conversion_Metrics || []);

      // 3. Context Setting
      const contextRes = await fetch(
        `${BASE_URL}/franchise-context-metrics?start_date=${startDate}&end_date=${endDate}`
      );
      const contextResult = await contextRes.json();
      setContactData(contextResult.Franchise_Context_Metrics || []);

      // 4. Offer Pitch
      const offerRes = await fetch(
        `${BASE_URL}/franchise-offer-metrics?start_date=${startDate}&end_date=${endDate}`
      );
      const offerResult = await offerRes.json();
      setdiscountData(offerResult.Franchise_Offer_Metrics || []);

      // 5. Objection / Subcategory / Agent Rebuttals
      const objectionRes = await fetch(
        `${BASE_URL}/franchise-objections-metrics?start_date=${startDate}&end_date=${endDate}`
      );
      const objectionResult = await objectionRes.json();
      setObjectionData(objectionResult.POS_Breakdown || []);
      setSubcategoryData(objectionResult.POS_Subcategory_Breakdown || []);
      setAgentPitchData(objectionResult.Agent_Rebuttals || []);
    } catch (err) {
      console.error("Error fetching sales data:", err);
      setCallSummary({});
      setContactAnalysisData([]);
      setContactData([]);
      setdiscountData([]);
      setObjectionData([]);
      setSubcategoryData([]);
      setAgentPitchData([]);
    } finally {
      setLoading1(false);
    }
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
    <Layout heading="AI-Enhanced Sales Strategy Dashboard">
      <div className={`dashboard-container ${loading ? "blurred" : ""}`}>
        {/* Date Filters */}
        <div className="header">
          <h5>AI-Enhanced Sales Strategy Dashboard</h5>
          <div className="salesheader">
            <label> <input type="date" name="start_date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required /> </label> <label> <input type="date" name="end_date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required /> </label> <label> <input type="submit" class="setsubmitbtn" value="Submit" onClick={fetchSalesData} /> </label>
          </div>
        </div>

        {/* ====== Call Summary (unchanged) ====== */}
        <div className="metric-container">
          <div className="metric-card green-met">
            <h4>CST (CRT ISPARK)</h4>
            <div className="metrics">
              <div>
                <b>{callSummary?.CRT_Isha_to_Manage?.Total_Connected ?? 0}</b>
                <p>Total Connected</p>
              </div>
              <div>
                <b>{callSummary?.CRT_Isha_to_Manage?.Total_Interested ?? 0}</b>
                <p>Total Interested</p>
              </div>
              <div>
                <b>{callSummary?.CRT_Isha_to_Manage?.Asked_for_Details_WhatsApp ?? 0}</b>
                <p>WhatsApp Asked</p>
              </div>
              <div>
                <b>{callSummary?.CRT_Isha_to_Manage?.Meeting_Scheduled ?? 0}</b>
                <p>Meeting Scheduled</p>
              </div>
              <div><b>{callSummary?.CRT_Isha_to_Manage?.Not_Interested ?? 0}</b><p>Not Interested</p></div>
              <div>
                <b>{callSummary?.CRT_Isha_to_Manage?.Meeting_Schedule_CRM ?? 0}</b>
                <p>Meeting CRM</p>
              </div>
            </div>
          </div>

          <div className="metric-card blue-met">
            <h4>CRT (Fabonow Team)</h4>
            <div className="metrics">
              <div>
                <b>{callSummary?.Fabonow_Team_CRT?.Total_Connected ?? 0}</b>
                <p>Total Connected</p>
              </div>
              <div>
                <b>{callSummary?.Fabonow_Team_CRT?.Total_Interested ?? 0}</b>
                <p>Total Interested</p>
              </div>
              <div><b>{callSummary?.Fabonow_Team_CRT?.Not_Interested ?? 0}</b><p>Not Interested</p></div>
              <div>
                <b>{callSummary?.Fabonow_Team_CRT?.Brochure_Proposal_Discussed ?? 0}</b>
                <p>Brochure Discussed</p>
              </div>
              <div>
                <b>{callSummary?.Fabonow_Team_CRT?.Conversion ?? 0}</b>
                <p>Conversion</p>
              </div>
            </div>
          </div>
        </div>

        {/* ====== OP Analysis ====== */}
        <div className="sales-section" style={{height:"400px",overflowY:"auto"}}>
          <h2 className="sales-title">OP Analysis</h2>
          <h3 className="sales-subtitle">OP Category Wise Success</h3>
          <table className="sales-table">
            <thead>
              <tr>
                <th>Franchise Opening Pitch Style</th>
                <th>Total Records</th>
                <th>Qualified Leads Generated (Isha)</th>
                <th>Lead Qualification %</th>
                <th>Prospects Engaged</th>
                <th>Engagement %</th>
                <th>Franchise Deals Closed (Fabonow Sales Team)</th>
                <th>Franchise Conversion % (Fabonow Sales Team)</th>
              </tr>
            </thead>
            <tbody>
              {contactAnalysisData.length > 0 ? (
                contactAnalysisData.map((row, idx) => (
                  <tr key={idx}>
                    <td>{row.Franchise_Opening_Pitch_Style}</td>
                    <td>{row.Total_Records}</td>
                    <td>{row.Qualified_Leads_Yes}</td>
                    <td>{row.Avg_Lead_Qualification_Pct}%</td>
                    <td>{row.Total_Prospects_Engaged}</td>
                    <td>{row.Avg_Engagement_Pct}%</td>
                    <td>{row.Total_Deals_Closed}</td>
                    <td>{row.Avg_Franchise_Conversion_Pct}%</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" style={{ textAlign: "center" }}>
                    No data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ====== Context Setting ====== */}
        <div className="sales-section" style={{height:"400px",overflowY:"auto"}}>
          <h2 className="sales-title">Context Setting Analysis</h2>
          <table className="sales-table">
            <thead>
              <tr>
                <th>Franchise Context Setting Type</th>
                <th>Total Records</th>
                <th>Prospect Feedback Before Franchise Offer</th>
                <th>Combined Franchise Pitch</th>
                <th>Skipped Context Setting</th>
              </tr>
            </thead>
            <tbody>
              {contactData.length > 0 ? (
                contactData.map((row, idx) => (
                  <tr key={idx}>
                    <td>{row.Franchise_Context_Setting_Type}</td>
                    <td>{row.Total_Records}</td>
                    <td>{row.Prospect_Feedback_Before_Offer_Yes}</td>
                    <td>{row.Combined_Pitch_Yes}</td>
                    <td>{row.Skipped_Context_Yes}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: "center" }}>
                    No data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ====== Offer Pitch ====== */}
        <div className="sales-section" style={{height:"400px",overflowY:"auto"}}>
          <h2 className="sales-title">Offered Pitch Analysis</h2>
          <table className="sales-table">
            <thead>
              <tr>
                <th>Franchise Offer Type</th>
                <th>No Offer/Discount Provided</th>
                <th>Qualified Leads from This Pitch</th>
                <th>Lead Qualification % by Offer Type</th>
                <th>Engaged Prospects by Offer Type</th>
                <th>Franchise Deals Closed (Sales Team)</th>
                <th>Franchise Conversion % by Offer Type</th>
              </tr>
            </thead>
            <tbody>
              {discountData.length > 0 ? (
                discountData.map((row, idx) => (
                  <tr key={idx}>
                    <td>{row.Franchise_Offer_Type}</td>
                    <td>{row.No_Offer_or_Discount_Provided}</td>
                    <td>{row.Qualified_Leads_from_This_Pitch}</td>
                    <td>{row.Lead_Qualification_Pct_by_Offer_Type}%</td>
                    <td>{row.Engaged_Prospects_by_Offer_Type}</td>
                    <td>{row.Franchise_Deals_Closed_Sales_Team}</td>
                    <td>{row.Franchise_Conversion_Pct_by_Offer_Type}%</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: "center" }}>
                    No data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ====== Customer Objection Analysis ====== */}
        <div className="sales-section" style={{ height: "400px", overflowY: "auto" }}>
          <h2 className="sales-title">Customer Objection Analysis</h2>
          <h3 className="sales-subtitle">POS Breakdown</h3>
          <table className="sales-table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Total Franchise Objections Raised</th>
                <th>Resolved Objections %</th>
                <th>Unresolved Objections %</th>
                <th>Franchise Conversion After Rebuttal</th>
              </tr>
            </thead>
            <tbody>
              {objectionData.length > 0 ? (
                objectionData.map((row, idx) => (
                  <tr key={idx}>
                    <td>{row.Category}</td>
                    <td>{row.Total_Objections}</td>
                    <td style={{ color: "green", fontWeight: "bold" }}>
                      {row.Resolved_Percentage}%
                    </td>
                    <td style={{ color: "red", fontWeight: "bold" }}>
                      {row.Unresolved_Percentage}%
                    </td>
                    <td>{row.Conversion_After_Rebuttal}%</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: "center" }}>
                    No data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ====== POS Subcategory Breakdown ====== */}
        <div className="sales-section" style={{ height: "400px", overflowY: "auto" }}>
          <h3 className="sales-title">POS Subcategory Breakdown</h3>
          <table className="sales-table">
            <thead>
              <tr>
                <th>SubCategory</th>
                <th>Total Franchise Objections Raised</th>
                <th>Resolved Objections %</th>
                <th>Unresolved Objections %</th>
                <th>Franchise Conversion After Rebuttal</th>
              </tr>
            </thead>
            <tbody>
              {subcategoryData.length > 0 ? (
                subcategoryData.map((row, idx) => (
                  <tr key={idx}>
                    <td>{row.SubCategory}</td>
                    <td>{row.Total_Objections}</td>
                    <td style={{ color: "green", fontWeight: "bold" }}>
                      {row.Resolved_Percentage}%
                    </td>
                    <td style={{ color: "red", fontWeight: "bold" }}>
                      {row.Unresolved_Percentage}%
                    </td>
                    <td>{row.Conversion_After_Rebuttal}%</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: "center" }}>
                    No data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ====== Agent Rebuttals ====== */}
        <div className="sales-section" style={{ height: "400px", overflowY: "auto" }}>
          <h3 className="sales-title">Agent Pitch Top Conversion</h3>
          <table className="sales-table">
            <thead>
              <tr>
                <th>Rebuttal Category</th>
                <th>Total Franchise Objections Raised</th>
                <th>Resolved Objections %</th>
                <th>Unresolved Objections %</th>
                <th>Franchise Conversion After Rebuttal</th>
              </tr>
            </thead>
            <tbody>
              {agentPitchData.length > 0 ? (
                agentPitchData.map((row, idx) => (
                  <tr key={idx}>
                    <td>{row.Rebuttal_Category}</td>
                    <td>{row.Total_Objections}</td>
                    <td style={{ color: "green", fontWeight: "bold" }}>
                      {row.Resolved_Percentage}%
                    </td>
                    <td style={{ color: "red", fontWeight: "bold" }}>
                      {row.Unresolved_Percentage}%
                    </td>
                    <td>{row.Conversion_After_Rebuttal}%</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: "center" }}>
                    No data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
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

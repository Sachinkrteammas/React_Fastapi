import React, { useState } from "react";
import Layout from "../layout"; // Import layout component
import "../layout.css"; // Import styles
import "./RawDown.css";
import { BASE_URL } from "./config";
import * as XLSX from "xlsx";
const RawExport = () => {
  const [leadId, setLeadId] = useState("");
  const [data, setData] = useState([]);
  const [dataExcel, setDataExcel] = useState([]);

  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [loading, setLoading] = useState(false);

  const formatDate = (date) => {
    return date.toISOString().split("T")[0]; // Convert Date to YYYY-MM-DD
  };

  const fetchCallQualityDetails = async () => {
      if (!startDate || !endDate) {
        alert("Please select both Start and End dates.");
        return;
      }

      setLoading(true);

      try {
        const response = await fetch(
          `${BASE_URL}/raw_data?start_date=${formatDate(startDate)}&end_date=${formatDate(endDate)}`
        );
        if (!response.ok) throw new Error("Failed to fetch data");

        const result = await response.json();

        // Map all API fields for table view
        const formattedData = result.map((item) => ({
          call_id: item.call_id,
          campaign_id: item.campaign_id,
          external_ref: item.external_ref,
          agent_name: item.agent_name,
          customer_phone: item.customer_phone,
          occurred_at: item.occurred_at,
          language: item.language,
          // Truncate for table only
          raw_transcript: item.raw_transcript
            ? item.raw_transcript.length > 30
              ? item.raw_transcript.substring(0, 30) + "..."
              : item.raw_transcript
            : "No Transcript",
          ai_output_json: item.ai_output_json
            ? item.ai_output_json.length > 30
              ? item.ai_output_json.substring(0, 30) + "..."
              : item.ai_output_json
            : "None",
          CRT_Isha_Total_Connected: item.CRT_Isha_Total_Connected,
          CRT_Isha_Total_Interested: item.CRT_Isha_Total_Interested,
          CRT_Isha_Asked_for_Details_WhatsApp: item.CRT_Isha_Asked_for_Details_WhatsApp,
          CRT_Isha_Meeting_Scheduled: item.CRT_Isha_Meeting_Scheduled,
          CRT_Isha_Not_Interested: item.CRT_Isha_Not_Interested,
          CRT_Isha_Meeting_Schedule_CRM: item.CRT_Isha_Meeting_Schedule_CRM,
          Fabonow_Total_Connected: item.Fabonow_Total_Connected,
          Fabonow_Total_Interested: item.Fabonow_Total_Interested,
          Fabonow_Not_Interested: item.Fabonow_Not_Interested,
          Fabonow_Brochure_Proposal_Discussed: item.Fabonow_Brochure_Proposal_Discussed,
          Fabonow_Conversion: item.Fabonow_Conversion,
          Franchise_Opportunity_Analysis: item.Franchise_Opportunity_Analysis,
          Workable_vs_NonWorkable: item.Workable_vs_NonWorkable,
          Reason_for_Missed_Franchise_Signup: item.Reason_for_Missed_Franchise_Signup,
          Detailed_Franchise_Objection_Split_JSON: item.Detailed_Franchise_Objection_Split_JSON,
          Franchise_Lead_Data_Completeness: item.Franchise_Lead_Data_Completeness,
          Franchise_Prospect_Loyalty: item.Franchise_Prospect_Loyalty,
          Franchise_Pitch_Satisfaction: item.Franchise_Pitch_Satisfaction,
          Franchise_Prospect_Sentiment: item.Franchise_Prospect_Sentiment,
          Daily_Franchise_Call_Feedback_Summary: item.Daily_Franchise_Call_Feedback_Summary,
          Franchise_Prospect_Sentiment_Trend: item.Franchise_Prospect_Sentiment_Trend,
          Franchise_Opening_Pitch_Style: item.Franchise_Opening_Pitch_Style,
          Qualified_Leads_Generated_Isha: item.Qualified_Leads_Generated_Isha,
          Lead_Qualification_Pct: item.Lead_Qualification_Pct,
          Prospects_Engaged: item.Prospects_Engaged,
          Engagement_Pct: item.Engagement_Pct,
          Franchise_Deals_Closed_Fabonow_Sales: item.Franchise_Deals_Closed_Fabonow_Sales,
          Franchise_Conversion_Pct_Fabonow_Sales: item.Franchise_Conversion_Pct_Fabonow_Sales,
          Franchise_Context_Setting_Type: item.Franchise_Context_Setting_Type,
          Prospect_Feedback_Before_Franchise_Offer: item.Prospect_Feedback_Before_Franchise_Offer,
          Combined_Franchise_Pitch: item.Combined_Franchise_Pitch,
          Skipped_Context_Setting: item.Skipped_Context_Setting,
          Franchise_Offer_Type: item.Franchise_Offer_Type,
          No_Offer_or_Discount_Provided: item.No_Offer_or_Discount_Provided,
          Qualified_Leads_from_This_Pitch: item.Qualified_Leads_from_This_Pitch,
          Lead_Qualification_Pct_by_Offer_Type: item.Lead_Qualification_Pct_by_Offer_Type,
          Engaged_Prospects_by_Offer_Type: item.Engaged_Prospects_by_Offer_Type,
          Franchise_Deals_Closed_Sales_Team: item.Franchise_Deals_Closed_Sales_Team,
          Franchise_Conversion_Pct_by_Offer_Type: item.Franchise_Conversion_Pct_by_Offer_Type,
          Customer_Objection_Category: item.Customer_Objection_Category,
          Customer_Objection_SubCategory: item.Customer_Objection_SubCategory,
          Agent_Rebuttal_Category: item.Agent_Rebuttal_Category,
          Agent_Rebuttal_SubCategory: item.Agent_Rebuttal_SubCategory,
          ObjectionCount: item.ObjectionCount,
          ResolvedObjectionPerc: item.ResolvedObjectionPerc,
          ConversionAfterRebuttal: item.ConversionAfterRebuttal,
          created_at: item.created_at
            ? new Date(item.created_at).toISOString().split("T")[0]
            : null
      }));

        // Excel export keeps full text
      const formattedDataExcel = result.map(
          ({ CustomerDisinterest_JSON, CustomerObjections_JSON, AgentRebuttals_JSON, ...rest }) => ({
            ...rest
          })
      );

      setData(formattedData); // table view
      setDataExcel(formattedDataExcel); // full text for Excel
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
  };



  const downloadExcel = (dataExcel) => {
    if (dataExcel.length === 0) {
      alert("No data available to export.");
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(dataExcel);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Call Data");

    XLSX.writeFile(workbook, "call_data.xlsx");
  };

  return (
    <Layout heading="Title to be decided">
      <div className="Down-dashboard">
        <header className="header">
          <h3>DialDesk</h3>
          <div className="setheaderdivdetails" style={{marginLeft:"260px"}}>
            <label>
              <input
                type="date"
                value={formatDate(startDate)}
                onChange={(e) => setStartDate(new Date(e.target.value))}
              />
            </label>
            <label>
              <input
                type="date"
                value={formatDate(endDate)}
                onChange={(e) => setEndDate(new Date(e.target.value))}
              />
            </label>
            <label>
              <input
                className="setsubmitbtn"
                value={"Submit"}
                readOnly
                onClick={fetchCallQualityDetails}
              />
            </label>
            <label>
            {data.length > 0 && (
            <input
              className="setsubmitbtn"
              onClick={() => downloadExcel(dataExcel)}
              value={"Excel Export"}
              readOnly
              style={{
                cursor:"pointer",
                width: "110px"
              }}
            />

          )}
            </label>
          </div>
        </header>

        {/* Content Wrapper */}
        <div
          className={`content-wrapper ${loading ? "blurred" : ""}`}
          style={{ overflowY: "auto", maxHeight: "630px" }}
        >

          {/* Table */}
          <table>
            <thead
              style={{
                position: "sticky",
                top: 0,
                backgroundColor: "#fff",
                zIndex: 2,
              }}
            >
              <tr>
                {data.length > 0 &&
                  Object.keys(data[0]).map((key) => <th key={key}>{key}</th>)}
              </tr>
            </thead>
            <tbody>
              {data.length > 0 ? (
                data.map((row, index) => (
                  <tr key={index}>
                    {Object.values(row).map((value, i) => (
                      <td key={i}>{value !== null ? value : "N/A"}</td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="100%" style={{ textAlign: "center" }}>
                    No data found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {loading && (
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
};

export default RawExport;

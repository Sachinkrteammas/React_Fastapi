import React, { useState } from "react";
import Layout from "../layout";
import "../layout.css";
import * as XLSX from "xlsx";
import { BASE_URL } from "./config";
// import "./RawSales.css";

export default function RawSales() {
  const [salesData, setSalesData] = useState([]);
  const [dataExcel, setDataExcel] = useState([]);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [endDate, setEndDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  // Function to fetch data from the API when user clicks Submit
  const fetchSalesData = async () => {
    setLoading(true);
    try {
      const clientId = localStorage.getItem("client_id");
      const response = await fetch(
        `${BASE_URL}/get_call_dump_sales?client_id=${clientId}&start_date=${startDate}&end_date=${endDate}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }

      const result = await response.json();

      // Format data dynamically
      const formattedData = result.map((item) => ({
        id: item.id,
        clientId: item.client_id,
        campaignId: item.campaign_id,
        callDate: item.CallDate ? item.CallDate.split("T")[0] : "N/A",
        startEpoch: item.start_epoch,
        endEpoch: item.end_epoch,
        mobileNo: item.MobileNo,
        leadId: item.LeadID,
        agentName: item.AgentName,
        competitorName: item.CompetitorName || "N/A",
        opening: item.Opening || 0,
        offered: item.Offered || 0,
        objectionHandling: item.ObjectionHandling || 0,
        prepaidPitch: item.PrepaidPitch || 0,
        upsellingEfforts: item.UpsellingEfforts || 0,
        offerUrgency: item.OfferUrgency || 0,
        sensitiveWordUsed: item.SensitiveWordUsed || "None",
        sensitiveWordContext: item.SensitiveWordContext || "None",
        areaForImprovement: item.AreaForImprovement || "None",
        transcribeText: item.TranscribeText
          ? item.TranscribeText.length > 20
            ? item.TranscribeText.substring(0, 20) + "..."
            : item.TranscribeText
          : "No Transcript Available",
        category: item.Category || "N/A",
        subCategory: item.SubCategory || "N/A",
        productOffering: item.ProductOffering || "N/A",
        discountType: item.DiscountType || "N/A",
        feedback: item.Feedback || "N/A",
        entrydate: item.entrydate || "N/A",
      }));

      const formattedDataExcel = result.map((item) => ({
        id: item.id,
        clientId: item.client_id,
        campaignId: item.campaign_id,
        callDate: item.CallDate ? item.CallDate.split("T")[0] : "N/A",
        startEpoch: item.start_epoch,
        endEpoch: item.end_epoch,
        mobileNo: item.MobileNo,
        leadId: item.LeadID,
        agentName: item.AgentName,
        competitorName: item.CompetitorName || "N/A",
        opening: item.Opening || 0,
        offered: item.Offered || 0,
        objectionHandling: item.ObjectionHandling || 0,
        prepaidPitch: item.PrepaidPitch || 0,
        upsellingEfforts: item.UpsellingEfforts || 0,
        offerUrgency: item.OfferUrgency || 0,
        sensitiveWordUsed: item.SensitiveWordUsed || "None",
        sensitiveWordContext: item.SensitiveWordContext || "None",
        areaForImprovement: item.AreaForImprovement || "None",
        transcribeText: item.TranscribeText || "No Transcript",
        category: item.Category || "N/A",
        subCategory: item.SubCategory || "N/A",
        productOffering: item.ProductOffering || "N/A",
        discountType: item.DiscountType || "N/A",
        feedback: item.Feedback || "N/A",
        entrydate: item.entrydate || "N/A",
      }));

      setSalesData(formattedData);
      setDataExcel(formattedDataExcel);
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
  
      XLSX.writeFile(workbook, "call_data_sale.xlsx");
    };

  return (
    <Layout>
      <div className="header">
        <h5>AI-Enhanced Sales Strategy Dashboard</h5>
        <div className="salesheader" style={{ marginTop: -40 }}
        >
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
            <button className="setsubmitbtn" onClick={fetchSalesData}>
              Submit
            </button>
          </label>
          <label>
            {salesData.length > 0 && (
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
      </div>

      {/* Show Loading Indicator */}
      {loading && (
        <div className="zigzag-container">
          <div className="bar"></div>
          <div className="bar"></div>
          <div className="bar"></div>
          <div className="bar"></div>
          <div className="bar"></div>
        </div>
      )}

      {/* Table Section (Show only if data is available) */}
      {salesData.length > 0 && (
        <div
          className="table-container_sales"
          style={{
            overflowX: "auto",
            maxHeight: "650px",
            width: "100%",
            overflowY: "auto",
          }}
        >
          <table className="sales-table" style={{ fontSize: "16px" }}>
            <thead
              style={{
                position: "sticky",
                top: 0,
                backgroundColor: "#fff",
                //zIndex: 2,
              }}
            >
              <tr>
                {Object.keys(salesData[0]).map((col, index) => (
                  <th key={index}>{col.replace(/([A-Z])/g, " $1").trim()}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {salesData.map((row, index) => (
                <tr key={index} className="table-row">
                  {Object.keys(row).map((col, colIndex) => (
                    <td key={colIndex}>{row[col] || "N/A"}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Layout>
  );
}

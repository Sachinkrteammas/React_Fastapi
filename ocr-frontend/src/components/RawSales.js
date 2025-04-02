import React, { useState,useEffect } from "react";
import Layout from "../layout";
import "../layout.css";
import * as XLSX from "xlsx";
import { BASE_URL } from "./config";
// import "./RawSales.css";

export default function RawSales() {
  const [salesData, setSalesData] = useState([]);
  const [dataExcel, setDataExcel] = useState([]);
  
  const [loading1, setLoading1] = useState(false);
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [endDate, setEndDate] = useState(
    new Date().toISOString().split("T")[0]
  );

 

  // Function to fetch data from the API when user clicks Submit
  const fetchSalesData = async () => {
    setLoading1(true);
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
        callDate: item.CallDate ? item.CallDate.split("T")[0] : "N/A",
        empId: item.AgentName,
        competitorName: item.CompetitorName || "N/A",
        clientId: item.client_id,
        campaignId: item.campaign_id,
        startEpoch: item.start_epoch,
        endEpoch: item.end_epoch,
        mobileNo: item.MobileNo,
        leadId: item.LeadID,
        opening: Number(item.Opening) || 0,
        offered: Number(item.Offered) || 0,
        objectionHandling: Number(item.ObjectionHandling) || 0,
        prepaidPitch: Number(item.PrepaidPitch) || 0,
        upsellingEfforts: Number(item.UpsellingEfforts) || 0,
        offerUrgency: Number(item.OfferUrgency) || 0,
        sensitiveWordUsed: item.SensitiveWordUsed || "None",
        sensitiveWordContext: item.SensitiveWordContext || "None",
        areaForImprovement: item.AreaForImprovement || "None",
        transcribeText: item.TranscribeText ? item.TranscribeText.length > 20
          ? item.TranscribeText.substring(0, 20) + "..."
          : item.TranscribeText
          : "No Transcript Available",
        topNegativeWordsByAgent: item.TopNegativeWordsByAgent || "None",
        topNegativeWordsByCustomer: item.TopNegativeWordsByCustomer || "None",
        lengthSec: item.LengthSec || "None",
        startTime: item.StartTime || "None",
        endTime: item.EndTime || "None",
        callDisposition: item.CallDisposition || "None",
        openingRejected: Number(item.OpeningRejected) || 0,
        offeringRejected: Number(item.OfferingRejected) || 0,
        afterListeningOfferRejected: Number(item.AfterListeningOfferRejected) || 0,
        saleDone: Number(item.SaleDone) || 0,
        notInterestedReasonCallContext: item.NotInterestedReasonCallContext || "None",
        notInterestedBucketReason: item.NotInterestedBucketReason || "None",
        openingPitchContext: item.OpeningPitchContext ? item.OpeningPitchContext.length > 20
          ? item.OpeningPitchContext.substring(0, 20) + "..."
          : item.OpeningPitchContext
          : "No Transcript Available",
        offeredPitchContext: item.OfferedPitchContext ? item.OfferedPitchContext.length > 20
          ? item.OfferedPitchContext.substring(0, 20) + "..."
          : item.OfferedPitchContext
          : "No Transcript Available",
        objectionHandlingContext: item.ObjectionHandlingContext ? item.ObjectionHandlingContext.length > 20
          ? item.ObjectionHandlingContext.substring(0, 20) + "..."
          : item.ObjectionHandlingContext
          : "No Transcript Available",
        prepaidPitchContext: item.PrepaidPitchContext ? item.PrepaidPitchContext.length > 20
        ? item.PrepaidPitchContext.substring(0, 20) + "..."
        : item.PrepaidPitchContext
        : "No Transcript Available",
        fileName: item.FileName || "None",
        status: item.Status || "None",
        category: item.Category || "N/A",
        subCategory: item.SubCategory || "N/A",
        customerObjectionCategory: item.CustomerObjectionCategory || "None",
        customerObjectionSubCategory: item.CustomerObjectionSubCategory || "None",
        agentRebuttalCategory: item.AgentRebuttalCategory || "None",
        agentRebuttalSubCategory: item.AgentRebuttalSubCategory || "None",
        productOffering: item.ProductOffering || "N/A",
        discountType: item.DiscountType || "N/A",
        openingPitchCategory: item.OpeningPitchCategory || "None",
        contactSettingContext: item.ContactSettingContext ? item.ContactSettingContext.length > 20
          ? item.ContactSettingContext.substring(0, 20) + "..."
          : item.ContactSettingContext
          : "No Transcript Available",
        contactSettingCategory: item.ContactSettingCategory || "None",
        contactSetting2: item.ContactSetting2 || "None",
        feedbackCategory: item.Feedback_Category || "None",
        feedbackContext: item.FeedbackContext ? item.FeedbackContext.length > 20
          ? item.FeedbackContext.substring(0, 20) + "..."
          : item.FeedbackContext
          : "No Transcript Available",
        feedback: item.Feedback || "N/A",
        age: item.Age || "None",
        consumptionType: item.ConsumptionType || "None",
        ageOfConsumption: item.AgeofConsumption || "None",
        reasonForQuitting: item.ReasonforQuitting || "None",
        entryDate: item.entrydate || "N/A"
      }));

      const formattedDataExcel = result.map((item) => ({
        id: item.id,
        callDate: item.CallDate ? item.CallDate.split("T")[0] : "N/A",
        EmpId: item.AgentName,
        competitorName: item.CompetitorName || "N/A",
        clientId: item.client_id,
        campaignId: item.campaign_id,
        startEpoch: item.start_epoch,
        endEpoch: item.end_epoch,
        mobileNo: item.MobileNo,
        leadId: item.LeadID,
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
        topNegativeWordsByAgent: item.TopNegativeWordsByAgent || "None",
        topNegativeWordsByCustomer: item.TopNegativeWordsByCustomer || "None",
        lengthSec: item.LengthSec || "None",
        startTime: item.StartTime || "None",
        endTime: item.EndTime || "None",
        callDisposition: item.CallDisposition || "None",
        openingRejected: item.OpeningRejected || 0,
        offeringRejected: item.OfferingRejected || 0,
        afterListeningOfferRejected: item.AfterListeningOfferRejected || 0,
        saleDone: item.SaleDone || 0,
        notInterestedReasonCallContext: item.NotInterestedReasonCallContext || "None",
        notInterestedBucketReason: item.NotInterestedBucketReason || "None",
        openingPitchContext: item.OpeningPitchContext || "None",
        offeredPitchContext: item.OfferedPitchContext || "None",
        objectionHandlingContext: item.ObjectionHandlingContext || "None",
        prepaidPitchContext: item.PrepaidPitchContext || "None",
        fileName: item.FileName || "None",
        status: item.Status || "None",
        category: item.Category || "N/A",
        subCategory: item.SubCategory || "N/A",
        customerObjectionCategory: item.CustomerObjectionCategory || "None",
        customerObjectionSubCategory: item.CustomerObjectionSubCategory || "None",
        agentRebuttalCategory: item.AgentRebuttalCategory || "None",
        agentRebuttalSubCategory: item.AgentRebuttalSubCategory || "None",
        productOffering: item.ProductOffering || "N/A",
        discountType: item.DiscountType || "N/A",
        openingPitchCategory: item.OpeningPitchCategory || "None",
        contactSettingContext: item.ContactSettingContext || "None",
        contactSettingCategory: item.ContactSettingCategory || "None",
        contactSetting2: item.ContactSetting2 || "None",
        feedbackCategory: item.Feedback_Category || "None",
        feedbackContext: item.FeedbackContext || "None",
        feedback: item.Feedback || "N/A",
        age: item.Age || "None",
        consumptionType: item.ConsumptionType || "None",
        ageOfConsumption: item.AgeofConsumption || "None",
        reasonForQuitting: item.ReasonforQuitting || "None",
        entrydate: item.entrydate || "N/A"
      }));


      setSalesData(formattedData);
      setDataExcel(formattedDataExcel);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading1(false);
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
      <div className={`dashboard-container ${loading1 ? "blurred" : ""}`}>
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
                    cursor: "pointer",
                    width: "110px"
                  }}
                />

              )}
            </label>
          </div>
        </div>



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
            <table className="sales-table" style={{ fontSize: "13px" }}>
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

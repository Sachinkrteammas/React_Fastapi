import React, { useState, useEffect } from "react";
import Layout from "../layout"; // Import layout component
import "../layout.css"; // Import styles
import "./DetailSales.css";
import { BASE_URL } from "./config";

export default function DetailSales() {
  //loading code start===>
  const [loading, setLoading] = useState(true);
  const [loading1, setLoading1] = useState(false);
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split("T")[0]);
  const [callSummary, setCallSummary] = useState({});

  useEffect(() => {

    setTimeout(() => {
      setLoading(false);
    }, 2000);
  }, []);


  const fetchSalesData = async () => {
    setLoading1(true);
    try {
      const clientId = localStorage.getItem("client_id");
      const response = await fetch(
        `${BASE_URL}/call_summary_sales?client_id=${clientId}&start_date=${startDate}&end_date=${endDate}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }
      const result = await response.json();

      // ✅ Ensure result.call_summary is not null
      setCallSummary(result.call_summary || {});
    } catch (error) {
      console.error("Error fetching data:", error);
      setCallSummary({});
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
  //loading code end==>


  return (
    <Layout>
      <div className={`dashboard-container ${loading ? "blurred" : ""}`}>
        <div className="header">
          <h5>AI-Enhanced Sales Strategy Dashboard</h5>
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
              <input type="submit" class="setsubmitbtn" value="Submit" onClick={fetchSalesData} />
            </label>
          </div>
        </div>

        <div className="metric-container">
          {/* CST Card */}
          <div className="metric-card green-met">
            <h3>CST</h3>
            <div className="metricschanges">
              <div>
                <b>{callSummary?.total_calls ?? 0}</b>
                <p>Total Calls</p>
              </div>
              <div>
                <b>{callSummary?.exclude_opening_rejected ?? 0}</b>
                <p>OPS</p>
              </div>
              <div>
                <b>{callSummary?.exclude_context_opening_rejected ?? 0}</b>
                <p>cps</p>
              </div>
              <div>
                <b>{callSummary?.exclude_context_opening_offering_rejected ?? 0}</b>
                <p>Offer Success</p>
              </div>
              <div>
                <b>{callSummary?.sale_done_count ?? 0}</b>
                <p>Sale Done</p>
              </div>
              <div>
                <b>{callSummary?.sale_success_rate ?? 0}%</b>
                <p>Success Rate</p>
              </div>
            </div>
          </div>

          {/* CRT Card */}
          <div className="metric-card blue-met">
            <h3>CRT</h3>
            <div className="metricschanges">
              <div>
                <b>{callSummary?.include_opening_rejected ?? 0}</b>
                <p>OR</p>
              </div>
              <div>
                <b>{callSummary?.include_context_rejected ?? 0}</b>
                <p>CR</p>
              </div>
              <div>
                <b>{callSummary?.offering_rejected_count ?? 0}</b>
                <p>OPR</p>
              </div>
              <div>
                <b>{callSummary?.post_offer_rejected_count ?? 0}</b>
                <p>POR</p>
              </div>
              <div>
                <b>{callSummary?.failure_rate ?? 0}%</b>
                <p>Failure Rate</p>
              </div>
            </div>
          </div>
        </div>


        {/* OP Analysis Section */}
        <div className="sales-section">
          <h2 className="sales-title">OP Analysis</h2>
          <h3 className="sales-subtitle">OP Category Wise Success</h3>
          <table className="sales-table">
            <thead>
              <tr>
                <th>Opening Pitch Category</th>
                <th>Total Calls</th>
                <th>OPS Count</th>
                <th>OPS%</th>
                <th>OR Count</th>
                <th>OR%</th>
                <th>Sale Count</th>
                <th>Conversion%</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>New Pitch A</td>
                <td className="greenclr">157</td>
                <td>135</td>
                <td className="green-cell">86%</td>
                <td>22</td>
                <td className="red-cell">14%</td>
                <td>8</td>
                <td className="green-cell">5%</td>
              </tr>
              <tr>
                <td>New Pitch D</td>
                <td className="greenclrnew">59</td>
                <td>46</td>
                <td className="green-cell">78%</td>
                <td>13</td>
                <td className="red-cell">22%</td>
                <td>1</td>
                <td className="green-cell">3%</td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <td>Grand total</td>
                <td>10,197</td>
                <td>8,513</td>
                <td>83%</td>
                <td>1,684</td>
                <td>17%</td>
                <td>296</td>
                <td>3%</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Context Setting Analysis */}
        <div className="sales-section">
          <h3 className="sales-subtitle">Context Setting Analysis</h3>
          <table className="sales-table">
            <thead>
              <tr>
                <th>Context Setting Category</th>
                <th>Total Calls</th>
                <th>OPS Count</th>
                <th>OPS%</th>
                <th>OR Count</th>
                <th>OR%</th>
                <th>Sale Count</th>
                <th>Conversion%</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Feedback First Approach</td>
                <td className="greenclr">4,514</td>
                <td>3,220</td>
                <td className="green-cell">71%</td>
                <td>1,294</td>
                <td className="red-cell">29%</td>
                <td>127</td>
                <td className="green-cell">3%</td>
              </tr>
              <tr>
                <td>Dual Approach: Feedback & Offer</td>
                <td className="greenclrnew">903</td>
                <td>667</td>
                <td className="green-cell">74%</td>
                <td>236</td>
                <td className="red-cell">26%</td>
                <td>119</td>
                <td className="green-cell">13%</td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <td>Grand total</td>
                <td>5,833</td>
                <td>4,190</td>
                <td>72%</td>
                <td>1,943</td>
                <td>28%</td>
                <td>270</td>
                <td>5%</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Offered Pitch Analysis */}
        <div className="sales-section">
          <h2 className="sales-title">Offered Pitch Analysis</h2>
          <table className="sales-table">
            <thead>
              <tr>
                <th>Discount Type</th>
                <th>Total Offered</th>
                <th>OR Count</th>
                <th>OR%</th>
                <th>OS Count</th>
                <th>OS%</th>
                <th>Sale Count</th>
                <th>Conversion%</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Rs. 299 discount</td>
                <td className="greenclr">1,080</td>
                <td>604</td>
                <td className="red-cell">56%</td>
                <td>476</td>
                <td className="green-cell">44%</td>
                <td>96</td>
                <td className="green-cell">9%</td>
              </tr>
              <tr>
                <td>Limited-time offer</td>
                <td className="greenclrnew">882</td>
                <td>414</td>
                <td className="red-cell">47%</td>
                <td>468</td>
                <td className="green-cell">53%</td>
                <td>60</td>
                <td className="green-cell">7%</td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <td>Grand total</td>
                <td>2,599</td>
                <td>1,281</td>
                <td>49%</td>
                <td>1,309</td>
                <td>51%</td>
                <td>267</td>
                <td>10%</td>
              </tr>
            </tfoot>
          </table>
        </div>


        {/* Customer Objection Analysis */}
        <div className="sales-section">
          <h2 className="sales-title">Customer Objection Analysis</h2>
          <h3 className="sales-subtitle">POS Breakdown</h3>
          <table className="sales-table">
            <thead>
              <tr>
                <th>Main Objection Field</th>
                <th>Agent Rebuttal</th>
                <th>Objection Count</th>
                <th>Failed Rebuttal %</th>
                <th>Failed Rebuttal</th>
                <th>Successful Rebuttal %</th>
                <th>Successful Rebuttal</th>
                <th>Conversion %</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Not Interested in Perfumes</td>
                <td>Provide Other Product Variety</td>
                <td className="greenclr">390</td>
                <td className="red-cell">96%</td>
                <td>375</td>
                <td className="green-cell">4%</td>
                <td>15</td>
                <td className="green-cell">4%</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* POS Breakdown */}
        <div className="sales-section">
          <h3 className="sales-subtitle">POS Subcategory Breakdown</h3>
          <table className="sales-table">
            <thead>
              <tr>
                <th>Objection Subcategory</th>
                <th>Objection Count</th>
                <th>Failed Rebuttal %</th>
                <th>Failed Rebuttal</th>
                <th>Successful Rebuttal %</th>
                <th>Successful Rebuttal</th>
                <th>Conversion %</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Already has too many perfumes</td>
                <td className="greenclr">1,180</td>
                <td className="red-cell">94%</td>
                <td>1,108</td>
                <td className="green-cell">6%</td>
                <td>72</td>
                <td className="green-cell">6%</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Rebuttal Breakdown */}
        <div className="sales-section">
          <h3 className="sales-subtitle">Rebuttal Breakdown</h3>
          <table className="sales-table">
            <thead>
              <tr>
                <th>Agent Rebuttal Pitch</th>
                <th>Objection Count</th>
                <th>Failed Rebuttal %</th>
                <th>Failed Rebuttal</th>
                <th>Successful Rebuttal %</th>
                <th>Successful Rebuttal</th>
                <th>Conversion %</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Old Pitch</td>
                <td className="greenclr">1,742</td>
                <td className="red-cell">91%</td>
                <td>1,591</td>
                <td className="green-cell">9%</td>
                <td>151</td>
                <td className="green-cell">9%</td>
              </tr>
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

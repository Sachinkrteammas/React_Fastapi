import React, { useState, useEffect } from "react";
import Layout from "../layout"; // Import layout component
import "../layout.css"; // Import styles
import "./DetailSales.css";
import { BASE_URL } from "./config";

export default function DetailSales() {
  //loading code start===>
  const [loading, setLoading] = useState(true);
  const [loading1, setLoading1] = useState(false);
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [endDate, setEndDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [callSummary, setCallSummary] = useState({});
  const [contactAnalysisData, setContactAnalysisData] = useState([]);
  const [contactData, setContactData] = useState([]);
  const [discountData, setdiscountData] = useState([]);
  const [objectionData, setObjectionData] = useState([]);
  const [subcategoryData, setSubcategoryData] = useState([]);
  const [agentPitchData, setAgentPitchData] = useState([]);

  

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  }, []);

  const fetchSalesData = async () => {
  setLoading1(true);
  try {
    const clientId = localStorage.getItem("client_id");

    // Call Summary
    const summaryRes = await fetch(
      `${BASE_URL}/call_summary_sales?client_id=${clientId}&start_date=${startDate}&end_date=${endDate}`
    );
    if (!summaryRes.ok) throw new Error("Failed to fetch call summary");
    const summaryResult = await summaryRes.json();
    setCallSummary(summaryResult.call_summary || {});

    // Opening Pitch Analysis
    const opRes = await fetch(
      `${BASE_URL}/op_analysis_sales?client_id=${clientId}&start_date=${startDate}&end_date=${endDate}`
    );
    if (!opRes.ok) throw new Error("Failed to fetch OP analysis");
    const opResult = await opRes.json();
    setContactAnalysisData(opResult || []);

    // Contact Analysis
    const contactRes = await fetch(
      `${BASE_URL}/contact_analysis_sales?client_id=${clientId}&start_date=${startDate}&end_date=${endDate}`
    );
    if (!contactRes.ok) throw new Error("Failed to fetch contact analysis");
    const contactResult = await contactRes.json();
    setContactData(contactResult || []);

    // Discount Analysis
    const discountRes = await fetch(
      `${BASE_URL}/discount_analysis_sales?client_id=${clientId}&start_date=${startDate}&end_date=${endDate}`
    );
    if (!discountRes.ok) throw new Error("Failed to fetch discount analysis");
    const discountResult = await discountRes.json();
    setdiscountData(discountResult || []);

    // Objection vs Rebuttal Analysis
    const objectionRes = await fetch(
      `${BASE_URL}/objection_vs_rebuttal_analysis?client_id=${clientId}&start_date=${startDate}&end_date=${endDate}`
    );
    if (!objectionRes.ok) throw new Error("Failed to fetch objection data");
    const objectionResult = await objectionRes.json();
    setObjectionData(objectionResult || []);

    // Objection Subcategory Analysis
    const subcategoryRes = await fetch(
      `${BASE_URL}/objection_subcategory_analysis?client_id=${clientId}&start_date=${startDate}&end_date=${endDate}`
    );
    if (!subcategoryRes.ok) throw new Error("Failed to fetch subcategory data");
    const subcategoryResult = await subcategoryRes.json();
    setSubcategoryData(subcategoryResult || []);

    // ✅ Agent Pitch Top Conversion
    const pitchRes = await fetch(
      `${BASE_URL}/agent_pitch_top_conversion?client_id=${clientId}&start_date=${startDate}&end_date=${endDate}&pitch_level=category&min_calls=20&top_n=10`
    );
    if (!pitchRes.ok) throw new Error("Failed to fetch agent pitch data");
    const pitchResult = await pitchRes.json();
    setAgentPitchData(pitchResult || []);

  } catch (error) {
    console.error("Error fetching sales data:", error);
    setCallSummary({});
    setContactAnalysisData([]);
    setContactData([]);
    setdiscountData([]);
    setObjectionData([]);
    setSubcategoryData([]);
    setAgentPitchData([]);  // reset if error
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
    <Layout heading="Title to be decided">
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
              <input
                type="submit"
                class="setsubmitbtn"
                value="Submit"
                onClick={fetchSalesData}
              />
            </label>
          </div>
        </div>

        <div className="metric-container">
          {/* CST Card */}
          <div className="metric-card green-met">
            <h3 style={{ fontSize: "16px" }}>CST</h3>
            <div className="metricschanges">
              <div style={{marginTop:"10px"}}>
                <b>{callSummary?.total_calls ?? 0}</b>
                <p>Total Calls</p>
              </div>
              <div style={{marginTop:"10px"}}>
                <b>{callSummary?.exclude_opening_rejected ?? 0}</b>
                <p>OPS</p>
              </div>
              <div style={{marginTop:"10px"}}>
                <b>{callSummary?.exclude_context_opening_rejected ?? 0}</b>
                <p>cps</p>
              </div>
              <div style={{marginTop:"10px"}}>
                <b>
                  {callSummary?.exclude_context_opening_offering_rejected ?? 0}
                </b>
                <p>Offer Success</p>
              </div>
              <div style={{marginTop:"10px"}}>
                <b>{callSummary?.sale_done_count ?? 0}</b>
                <p>Sale Done</p>
              </div>
              <div style={{marginTop:"10px"}}>
                <b>{callSummary?.sale_success_rate ?? 0}%</b>
                <p>Success Rate</p>
              </div>
            </div>
          </div>

          {/* CRT Card */}
          <div className="metric-card blue-met">
            <h3 style={{ fontSize: "16px" }}>CRT</h3>
            <div className="metricschanges">
              <div style={{marginTop:"10px"}}>
                <b>{callSummary?.include_opening_rejected ?? 0}</b>
                <p>OR</p>
              </div>
              <div style={{marginTop:"10px"}}>
                <b>{callSummary?.include_context_rejected ?? 0}</b>
                <p>CR</p>
              </div>
              <div style={{marginTop:"10px"}}>
                <b>{callSummary?.offering_rejected_count ?? 0}</b>
                <p>OPR</p>
              </div>
              <div style={{marginTop:"10px"}}>
                <b>{callSummary?.post_offer_rejected_count ?? 0}</b>
                <p>POR</p>
              </div>
              <div style={{marginTop:"10px"}}>
                <b>{callSummary?.failure_rate ?? 0}%</b>
                <p>Failure Rate</p>
              </div>
            </div>
          </div>
        </div>

        {/* OP Analysis Section */}
        <div className="sales-section" style={{height:"450px",overflowY:"auto"}}>
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

            {contactAnalysisData && contactAnalysisData.length > 0 ? (
              <>
                <tbody>
                  {contactAnalysisData
                    .filter(
                      (row) => row["Opening Pitch Category"] !== "Grand Total"
                    )
                    .map((row, idx) => (
                      <tr key={idx}>
                        <td>{row["Opening Pitch Category"]}</td>
                        <td>{row["Total Calls"]}</td>
                        <td>{row["OPS Count"]}</td>
                        <td>{row["OPS%"]}%</td>
                        <td>{row["OR Count"]}</td>
                        <td>{row["OR%"]}%</td>
                        <td>{row["Sale Count"]}</td>
                        <td>{row["Conversion%"]}%</td>
                      </tr>
                    ))}
                </tbody>

                <tfoot>
                  {contactAnalysisData
                    .filter(
                      (row) => row["Opening Pitch Category"] === "Grand Total"
                    )
                    .map((total, idx) => (
                      <tr key={`contact-total-${idx}`}>
                        <td>Grand Total</td>
                        <td>{total["Total Calls"]}</td>
                        <td>{total["OPS Count"]}</td>
                        <td>{total["OPS%"]}%</td>
                        <td>{total["OR Count"]}</td>
                        <td>{total["OR%"]}%</td>
                        <td>{total["Sale Count"]}</td>
                        <td>{total["Conversion%"]}%</td>
                      </tr>
                    ))}
                </tfoot>
              </>
            ) : (
              <tbody>
                <tr>
                  <td
                    colSpan="8"
                    style={{ textAlign: "center", color: "#888" }}
                  >
                    No data available
                  </td>
                </tr>
              </tbody>
            )}
          </table>
        </div>

        {/* Context Setting Analysis */}
        <div className="sales-section" style={{height:"450px",overflowY:"auto"}}>
          <h3 className="sales-subtitle">Context Setting Analysis</h3>
          <table className="sales-table">
            <thead>
              <tr>
                <th>Contact Pitch Category</th>
                <th>Total Calls</th>
                <th>OPS Count</th>
                <th>OPS%</th>
                <th>OR Count</th>
                <th>OR%</th>
                <th>Sale Count</th>
                <th>Conversion%</th>
              </tr>
            </thead>
            {contactData.length > 0 ? (
              <>
                <tbody>
                  {contactData
                    .filter(
                      (row) => row["Contact Pitch Category"] !== "Grand Total"
                    )
                    .map((row, idx) => (
                      <tr key={idx}>
                        <td>{row["Contact Pitch Category"]}</td>
                        <td>{row["Total Calls"]}</td>
                        <td>{row["OPS Count"]}</td>
                        <td>{row["OPS%"]}%</td>
                        <td>{row["OR Count"]}</td>
                        <td>{row["OR%"]}%</td>
                        <td>{row["Sale Count"]}</td>
                        <td>{row["Conversion%"]}%</td>
                      </tr>
                    ))}
                </tbody>
                <tfoot>
                  {contactData
                    .filter(
                      (row) => row["Contact Pitch Category"] === "Grand Total"
                    )
                    .map((total, idx) => (
                      <tr key={`contact-total-${idx}`}>
                        <td>Grand Total</td>
                        <td>{total["Total Calls"]}</td>
                        <td>{total["OPS Count"]}</td>
                        <td>{total["OPS%"]}%</td>
                        <td>{total["OR Count"]}</td>
                        <td>{total["OR%"]}%</td>
                        <td>{total["Sale Count"]}</td>
                        <td>{total["Conversion%"]}%</td>
                      </tr>
                    ))}
                </tfoot>
              </>
            ) : (
              <tbody>
                <tr>
                  <td
                  colSpan="8"
                  style={{ textAlign: "center", color: "#888" }}
                  >
                    No data available
                  </td>
                </tr>
              </tbody>
            )}
          </table>
        </div>

        {/* Offered Pitch Analysis */}
        <div className="sales-section" style={{height:"450px",overflowY:"auto"}}>
          <h2 className="sales-title">Offered Pitch Analysis</h2>
          <table className="sales-table">
            <thead>
              <tr>
                <th>Discount Type</th>
                <th>Total Calls</th>
                <th>OPS Count</th>
                <th>OPS%</th>
                <th>OR Count</th>
                <th>OR%</th>
                <th>Sale Count</th>
                <th>Conversion%</th>
              </tr>
            </thead>
            {discountData.length > 0 ? (
              <>
                <tbody>
                  {discountData
                    .filter(
                      (row) => row["Discount Type"] !== "Grand Total"
                    )
                    .map((row, idx) => (
                      <tr key={idx}>
                        <td>{row["Discount Type"]}</td>
                        <td>{row["Total Calls"]}</td>
                        <td>{row["OPS Count"]}</td>
                        <td>{row["OPS%"]}%</td>
                        <td>{row["OR Count"]}</td>
                        <td>{row["OR%"]}%</td>
                        <td>{row["Sale Count"]}</td>
                        <td>{row["Conversion%"]}%</td>
                      </tr>
                    ))}
                </tbody>
                <tfoot>
                  {discountData
                    .filter(
                      (row) => row["Discount Type"] === "Grand Total"
                    )
                    .map((total, idx) => (
                      <tr key={`contact-total-${idx}`}>
                        <td>Grand Total</td>
                        <td>{total["Total Calls"]}</td>
                        <td>{total["OPS Count"]}</td>
                        <td>{total["OPS%"]}%</td>
                        <td>{total["OR Count"]}</td>
                        <td>{total["OR%"]}%</td>
                        <td>{total["Sale Count"]}</td>
                        <td>{total["Conversion%"]}%</td>
                      </tr>
                    ))}
                </tfoot>
              </>
            ) : (
              <tbody>
                <tr>
                  <td
                  colSpan="8"
                  style={{ textAlign: "center", color: "#888" }}
                  >
                    No data available
                  </td>
                </tr>
              </tbody>
            )}
          </table>
        </div>

        {/* Customer Objection Analysis */}
<div className="sales-section" style={{ height: "450px", overflowY: "auto" }}>
  <h2 className="sales-title">Customer Objection Analysis</h2>
  <h3 className="sales-subtitle">POS Breakdown</h3>

  <table className="sales-table" style={{ width: "100%", borderCollapse: "collapse" }}>
    <thead>
      <tr>
        <th style={{ position: "sticky", top: 0, zIndex: 1 }}>Main Objection</th>
        <th style={{ position: "sticky", top: 0, zIndex: 1 }}>Agent Rebuttal</th>
        <th style={{ position: "sticky", top: 0, zIndex: 1 }}>Objection Count</th>
        <th style={{ position: "sticky", top: 0, zIndex: 1 }}>Failed Rebuttal %</th>
        <th style={{ position: "sticky", top: 0, zIndex: 1 }}>Failed Rebuttal</th>
        <th style={{ position: "sticky", top: 0, zIndex: 1 }}>Successful Rebuttal %</th>
        <th style={{ position: "sticky", top: 0, zIndex: 1 }}>Successful Rebuttal</th>
        <th style={{ position: "sticky", top: 0, zIndex: 1 }}>Conversion %</th>
      </tr>
    </thead>

    {objectionData.length > 0 ? (
      <>
        <tbody>
          {objectionData
            .filter((row) => row["Main Objection"] !== "Grand Total")
            .map((row, idx) => (
              <tr key={idx}>
                <td>{row["Main Objection"]}</td>
                <td>{row["Agent Rebuttal"]}</td>
                <td className="greenclr">{row["Objection Count"]}</td>
                <td className="red-cell">{row["Failed Rebuttal %"]}%</td>
                <td>{row["Failed Rebuttal"]}</td>
                <td className="green-cell">{row["Successful Rebuttal %"]}%</td>
                <td>{row["Successful Rebuttal"]}</td>
                <td className="green-cell">{row["Conversion%"]}%</td>
              </tr>
            ))}
        </tbody>

        {/* If API returns a Grand Total row */}
        <tfoot>
          {objectionData
            .filter((row) => row["Main Objection"] === "Grand Total")
            .map((total, idx) => (
              <tr key={`objection-total-${idx}`}>
                <td colSpan="2">Grand Total</td>
                <td>{total["Objection Count"]}</td>
                <td>{total["Failed Rebuttal %"]}%</td>
                <td>{total["Failed Rebuttal"]}</td>
                <td>{total["Successful Rebuttal %"]}%</td>
                <td>{total["Successful Rebuttal"]}</td>
                <td>{total["Conversion%"]}%</td>
              </tr>
            ))}
        </tfoot>
      </>
    ) : (
      <tbody>
        <tr>
          <td colSpan="8" style={{ textAlign: "center", color: "#888" }}>
            No data available
          </td>
        </tr>
      </tbody>
    )}
  </table>
</div>


        {/* POS Subcategory Breakdown */}
    <div className="sales-section" style={{ height: "450px", overflowY: "auto" }}>
      <h3 className="sales-subtitle">POS Subcategory Breakdown</h3>

      <table
        className="sales-table"
        style={{ width: "100%", borderCollapse: "collapse" }}
      >
        <thead>
          <tr>
            <th style={{ position: "sticky", top: 0, zIndex: 1 }}>Objection Subcategory</th>
            <th style={{ position: "sticky", top: 0, zIndex: 1 }}>Objection Count</th>
            <th style={{ position: "sticky", top: 0, zIndex: 1 }}>Failed Rebuttal %</th>
            <th style={{ position: "sticky", top: 0, zIndex: 1 }}>Failed Rebuttal</th>
            <th style={{ position: "sticky", top: 0, zIndex: 1 }}>Successful Rebuttal %</th>
            <th style={{ position: "sticky", top: 0, zIndex: 1 }}>Successful Rebuttal</th>
            <th style={{ position: "sticky", top: 0, zIndex: 1 }}>Conversion %</th>
          </tr>
        </thead>

        {subcategoryData.length > 0 ? (
          <tbody>
            {subcategoryData.map((row, idx) => (
              <tr key={idx}>
                <td>{row.Objection}</td>
                <td className="greenclr">{row["Objection Count"]}</td>
                <td className="red-cell">{row["Failed Rebuttal %"]}%</td>
                <td>{row["Failed Rebuttal"]}</td>
                <td className="green-cell">{row["Successful Rebuttal %"]}%</td>
                <td>{row["Successful Rebuttal"]}</td>
                <td className="green-cell">{row["Conversion%"]}%</td>
              </tr>
            ))}
          </tbody>
        ) : (
          <tbody>
            <tr>
              <td colSpan="7" style={{ textAlign: "center", color: "#888" }}>
                No data available
              </td>
            </tr>
          </tbody>
        )}
      </table>
    </div>



        {/* Rebuttal Breakdown */}
        <div className="sales-section" style={{ height: "450px", overflowY: "auto" }}>
          <h3 className="sales-subtitle">Agent Pitch Top Conversion</h3>

          <table className="sales-table" style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ position: "sticky", top: 0, zIndex: 1 }}>Agent Rebuttal Pitch</th>
                <th style={{ position: "sticky", top: 0, zIndex: 1 }}>Objection Count</th>
                <th style={{ position: "sticky", top: 0, zIndex: 1 }}>Failed Rebuttal %</th>
                <th style={{ position: "sticky", top: 0, zIndex: 1 }}>Failed Rebuttal</th>
                <th style={{ position: "sticky", top: 0, zIndex: 1 }}>Successful Rebuttal %</th>
                <th style={{ position: "sticky", top: 0, zIndex: 1 }}>Successful Rebuttal</th>
                <th style={{ position: "sticky", top: 0, zIndex: 1 }}>Conversion %</th>
              </tr>
            </thead>

            {agentPitchData.length > 0 ? (
              <tbody>
                {agentPitchData.map((row, idx) => (
                  <tr key={idx}>
                    <td>{row["Agent Rebuttal Pitch"]}</td>
                    <td className="greenclr">{row["Objection Count"]}</td>
                    <td className="red-cell">{row["Failed Rebuttal %"]}%</td>
                    <td>{row["Failed Rebuttal"]}</td>
                    <td className="green-cell">{row["Successful Rebuttal %"]}%</td>
                    <td>{row["Successful Rebuttal"]}</td>
                    <td className="green-cell">{row["Conversion%"]}%</td>
                  </tr>
                ))}
              </tbody>
            ) : (
              <tbody>
                <tr>
                  <td colSpan="7" style={{ textAlign: "center", color: "#888" }}>
                    No data available
                  </td>
                </tr>
              </tbody>
            )}
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

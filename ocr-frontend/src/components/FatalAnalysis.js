import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import Layout from "../layout";
import "../layout.css";
import "./FatalAnalysis.css";

const Fatal = () => {
  const dayWiseData = [
    { date: "Feb 19, 2025", fatal: 11 },
    { date: "Feb 20, 2025", fatal: 5 },
  ];

  const topContributors = [
    { name: "Gaurav", audit: 53, fatal: 3, fatalPercent: "6%" },
    { name: "Vartika Mishra", audit: 28, fatal: 2, fatalPercent: "7%" },
    { name: "Karan Solanki", audit: 64, fatal: 2, fatalPercent: "3%" },
    { name: "Arushi", audit: 50, fatal: 2, fatalPercent: "4%" },
    { name: "Rekha Sharma", audit: 59, fatal: 2, fatalPercent: "3%" },
  ];

  const scenarioData = [
    {
      date: "Feb-20",
      queryFatal: 0,
      complaintFatal: 3,
      requestFatal: 0,
      saleDoneFatal: 0,
      total: 3,
    },
    {
      date: "Feb-19",
      queryFatal: 7,
      complaintFatal: 4,
      requestFatal: 0,
      saleDoneFatal: 0,
      total: 11,
    },
  ];

  // Dummy data for Week & Scenario Wise Fatal Count
  const weekScenarioData = [
    {
      week: "Week 3",
      queryFatal: "50%",
      complaintFatal: "50%",
      requestFatal: "0%",
      saleDoneFatal: "0%",
      total: 16,
    },
  ];


  const data = [
    { agent: "Vartika Mishra", auditCount: 28, cqScore: 70, fatalCount: 2, fatalPercentage: "7%", belowAvgCall: "64%", avgCalls: "14%", goodCalls: "7%", excellentCalls: "14%" },
    { agent: "Gaurav", auditCount: 53, cqScore: 81, fatalCount: 3, fatalPercentage: "6%", belowAvgCall: "42%", avgCalls: "2%", goodCalls: "23%", excellentCalls: "34%" },
    { agent: "Arushi", auditCount: 50, cqScore: 80, fatalCount: 2, fatalPercentage: "4%", belowAvgCall: "42%", avgCalls: "2%", goodCalls: "14%", excellentCalls: "42%" },
    { agent: "Rekha Sharma", auditCount: 59, cqScore: 78, fatalCount: 2, fatalPercentage: "3%", belowAvgCall: "41%", avgCalls: "0%", goodCalls: "17%", excellentCalls: "39%" },
    { agent: "Pallavi Ray", auditCount: 30, cqScore: 71, fatalCount: 1, fatalPercentage: "3%", belowAvgCall: "60%", avgCalls: "13%", goodCalls: "10%", excellentCalls: "17%" },
    { agent: "Karan Solanki", auditCount: 64, cqScore: 81, fatalCount: 2, fatalPercentage: "3%", belowAvgCall: "47%", avgCalls: "3%", goodCalls: "11%", excellentCalls: "39%" },
    { agent: "Ashwani", auditCount: 71, cqScore: 72, fatalCount: 3, fatalPercentage: "3%", belowAvgCall: "58%", avgCalls: "1%", goodCalls: "8%", excellentCalls: "31%" },
    { agent: "Prashanjit Sarkar", auditCount: 48, cqScore: 83, fatalCount: 1, fatalPercentage: "2%", belowAvgCall: "42%", avgCalls: "0%", goodCalls: "10%", excellentCalls: "48%" },
    { agent: "Shweta", auditCount: 58, cqScore: 81, fatalCount: 1, fatalPercentage: "2%", belowAvgCall: "47%", avgCalls: "5%", goodCalls: "16%", excellentCalls: "33%" },
    { agent: "Manish", auditCount: 16, cqScore: 78, fatalCount: 0, fatalPercentage: "0%", belowAvgCall: "69%", avgCalls: "0%", goodCalls: "8%", excellentCalls: "23%" },
    { agent: "Sandhya Yadav", auditCount: 34, cqScore: 78, fatalCount: 0, fatalPercentage: "0%", belowAvgCall: "53%", avgCalls: "3%", goodCalls: "12%", excellentCalls: "32%" },
  ];

  return (
    <Layout>
      <div className="dashboard-container">
        <header className="header">
          <h3>BELLAVITA</h3>
          {/* <div className="date-picker">Feb 19, 2025 - Feb 20, 2025</div> */}
          <div>
            <label>
              <input type="date" />
            </label>
            <label>
              <input type="date" />
            </label>
            <label>
              <input type="submit" value="Submit" />
            </label>
          </div>
        </header>

        <div className="leftbody">
          <div className="stats">
            <div className="stat-box">
              <h6>CQ Score%</h6>
              <p className="score">78.2%</p>
              <span className="negative">↓ -17.7%</span>
            </div>
            <div className="stat-box">
              <h6>Audit Count</h6>
              <p className="score">511</p>
            </div>
            <div className="stat-box">
              <h6>Fatal Count</h6>
              <p className="score">16</p>
            </div>
            <div className="stat-box">
              <h6>Fatal%</h6>
              <p className="score">3%</p>
            </div>
          </div>

          <div className="top-contributors">
            <h5>Top 5 Fatal Contributors</h5>
            <table>
              <thead>
                <tr>
                  <th>Agent Name</th>
                  <th>Audit Count</th>
                  <th>Fatal Count</th>
                  <th>Fatal%</th>
                </tr>
              </thead>
              <tbody>
                {topContributors.map((agent, index) => (
                  <tr key={index}>
                    <td>{agent.name}</td>
                    <td>{agent.audit}</td>
                    <td>{agent.fatal}</td>
                    <td className="highlight">{agent.fatalPercent}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="chart-section">
            <h5>Day Wise Fatal%</h5>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={dayWiseData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="fatal" fill="#0088FE" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rightbody">
          {/*  right code */}
          {/* <div className="card"> */}
            <h5 className="text-center">Scenario Wise Fatal Count</h5>

            <div className="stats">
            <div className="stat-box">
              <h6>query Fatal</h6>
              <p className="score">8</p>
            </div>
            <div className="stat-box">
              <h6>complaint Fatal</h6>
              <p className="score">8</p>
            </div>
            <div className="stat-box">
              <h6>request Fatal</h6>
              <p className="score">0</p>
            </div>
            <div className="stat-box">
              <h6>sale Done Fatal</h6>
              <p className="score">0</p>
            </div>
          </div>

            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Query Fatal</th>
                  <th>Complaint Fatal</th>
                  <th>Request Fatal</th>
                  <th>Sale Done Fatal</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {scenarioData.map((row, index) => (
                  <tr key={index}>
                    <td>{row.date}</td>
                    <td className={row.queryFatal > 0 ? "highlight" : ""}>
                      {row.queryFatal}
                    </td>
                    <td className={row.complaintFatal > 0 ? "highlight" : ""}>
                      {row.complaintFatal}
                    </td>
                    <td className={row.requestFatal > 0 ? "highlight" : ""}>
                      {row.requestFatal}
                    </td>
                    <td className={row.saleDoneFatal > 0 ? "highlight" : ""}>
                      {row.saleDoneFatal}
                    </td>
                    <td className="bold">{row.total}</td>
                  </tr>
                ))}
              </tbody>

              <tfoot>
                <tr>
                  <td>Grand Total</td>
                  <td className="bold">
                    {scenarioData.reduce((sum, row) => sum + row.queryFatal, 0)}
                  </td>
                  <td className="bold">
                    {scenarioData.reduce(
                      (sum, row) => sum + row.complaintFatal,
                      0
                    )}
                  </td>
                  <td className="bold">
                    {scenarioData.reduce(
                      (sum, row) => sum + row.requestFatal,
                      0
                    )}
                  </td>
                  <td className="bold">
                    {scenarioData.reduce(
                      (sum, row) => sum + row.saleDoneFatal,
                      0
                    )}
                  </td>
                  <td className="bold">
                    {scenarioData.reduce((sum, row) => sum + row.total, 0)}
                  </td>
                </tr>
              </tfoot>
            </table>
          {/* </div> */}

          {/* Week & Scenario Wise Fatal Count */}
          {/* <div className="card"> */}
            <h5 className="text-center">Week & Scenario Wise Fatal Count</h5>
            <table>
              <thead>
                <tr>
                  <th>Week</th>
                  <th>Query Fatal</th>
                  <th>Complaint Fatal</th>
                  <th>Request Fatal</th>
                  <th>Sale Done Fatal</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {weekScenarioData.map((row, index) => (
                  <tr key={index}>
                    <td>{row.week}</td>
                    <td className={row.queryFatal !== "0%" ? "highlight" : ""}>
                      {row.queryFatal}
                    </td>
                    <td
                      className={row.complaintFatal !== "0%" ? "highlight" : ""}
                    >
                      {row.complaintFatal}
                    </td>
                    <td
                      className={row.requestFatal !== "0%" ? "highlight" : ""}
                    >
                      {row.requestFatal}
                    </td>
                    <td
                      className={row.saleDoneFatal !== "0%" ? "highlight" : ""}
                    >
                      {row.saleDoneFatal}
                    </td>
                    <td className="bold">{row.total}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td>Grand Total</td>
                  <td className="bold">50%</td>
                  <td className="bold">50%</td>
                  <td className="bold">0%</td>
                  <td className="bold">0%</td>
                  <td className="bold">16</td>
                </tr>
              </tfoot>
            </table>
          {/* </div> */}
        </div>

        {/* footer */}

        <div className="full-width">

        <h4>Agent Wise Performance</h4>
      <table>
        <thead>
          <tr>
            <th>Agent Name</th>
            <th>Audit Count</th>
            <th>CQ Score%</th>
            <th>Fatal Count</th>
            <th>Fatal%</th>
            <th>Below Average Call</th>
            <th>Average Calls</th>
            <th>Good Calls</th>
            <th>Excellent Calls</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr key={index}>
              <td>{row.agent}</td>
              <td>{row.auditCount}</td>
              <td className={row.cqScore > 60 ? "low-score" : ""}>{row.cqScore}%</td>
              <td>{row.fatalCount}</td>
              <td>{row.fatalPercentage}</td>
              <td>{row.belowAvgCall}</td>
              <td>{row.avgCalls}</td>
              <td>{row.goodCalls}</td>
              <td>{row.excellentCalls}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td><strong>Grand Total</strong></td>
            <td><strong>511</strong></td>
            <td><strong>78%</strong></td>
            <td><strong>16</strong></td>
            <td><strong>3%</strong></td>
            <td><strong>49%</strong></td>
            <td><strong>4%</strong></td>
            <td><strong>13%</strong></td>
            <td><strong>35%</strong></td>
          </tr>
        </tfoot>
      </table>
        </div>


      </div>
    </Layout>
  );
};

export default Fatal;

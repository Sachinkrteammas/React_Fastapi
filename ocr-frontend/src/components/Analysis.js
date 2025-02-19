import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from "recharts";
import "./Analysis.css";
import Layout from "../layout"; // Import layout component
import "../layout.css"; // Import styles


const Analysis = () => {
    const navigate = useNavigate();
    const handleLogout = () => {
        localStorage.removeItem("token");
        sessionStorage.removeItem("user");
        navigate("/");
    };
    const handleNavigation = (path) => {
        navigate(path);
    };

    const pieData = [
        { name: "Excellent", value: 13.6, color: "#4CAF50" },
        { name: "Good", value: 42, color: "#8BC34A" },
        { name: "Below Average", value: 42, color: "#F44336" }
    ];

    const barData = [
        { date: "Feb 8", score: 76, target: 95 },
        { date: "Feb 9", score: 82, target: 95 },
        { date: "Feb 10", score: 76, target: 95 },
        { date: "Feb 11", score: 76, target: 95 },
        { date: "Feb 12", score: 78, target: 95 },
        { date: "Feb 13", score: 79, target: 95 },
        { date: "Feb 14", score: 80, target: 95 }
    ];

    return (
        <Layout>


        <div className="dashboard-container">
            <div className="card-container">
                {[
                    { title: "CQ Score%", value: "80%", color: "text-red-600" },
                    { title: "Without Fatal CQ Score%", value: "84%", color: "text-green-600" },
                    { title: "Audit Count", value: "81", color: "text-blue-600" },
                    { title: "Excellent Call", value: "34", color: "text-purple-600" },
                    { title: "Excellent Call", value: "34", color: "text-purple-600" },
                    { title: "Excellent Call", value: "34", color: "text-purple-600" },
                    { title: "Excellent Call", value: "34", color: "text-purple-600" },
                ].map((card, index) => (
                    <div key={index} className="card">
                        <h2>{card.title}</h2>
                        <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
                    </div>
                ))}
            </div>
            <div className="chart-container2">
                <div className="chart-box bar_chart">
                    <h2>Call Wise</h2>
                    <PieChart width={400} height={300}>
                        <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label>
                            {pieData.map((entry, index) => (
                                <Cell key={index} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                    </PieChart>
                </div>
            </div>

            <div className="chart-container3">
                <div className="chart-box achet">
                    <h2>Achet Categorization</h2>
                    <table className="performer">
                        <thead>
                            <tr>
                                <th>Category</th>
                                <th>ACHT</th>
                                <th>Audit Count</th>
                                <th>Fatal Count</th>
                                <th>CQ Score%</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Short (&lt;60 sec)</td>
                                <td>00:00:33</td>
                                <td>10</td>
                                <td>0</td>
                                <td>96%</td>
                            </tr>
                        </tbody>
                        <tbody>
                            <tr>
                                <td>Short (&lt;60 sec)</td>
                                <td>00:00:33</td>
                                <td>10</td>
                                <td>0</td>
                                <td>96%</td>
                            </tr>
                        </tbody>
                        <tbody>
                            <tr>
                                <td>Short (&lt;60 sec)</td>
                                <td>00:00:33</td>
                                <td>10</td>
                                <td>0</td>
                                <td>96%</td>
                            </tr>
                        </tbody>
                        <tbody>
                            <tr>
                                <td>Short (&lt;60 sec)</td>
                                <td>00:00:33</td>
                                <td>10</td>
                                <td>0</td>
                                <td>96%</td>
                            </tr>
                        </tbody>


                    </table>
                </div>

            </div>

            <div className="soft-skills-container softskill">
                {[
                    { title: "Opening", value: "60%" },
                    { title: "Soft Skills", value: "69%" },
                    { title: "Hold Procedure", value: "68%" },
                    { title: "Resolution", value: "59%" },
                    { title: "Closing", value: "78%" },
                    { title: "Average Score", value: "67%" }
                ].map((skill, index) => (
                    <div key={index} className="soft-skill-row">
                        <span className="soft-skill-title">{skill.title}</span>
                        <span className="soft-skill-value">{skill.value}</span>
                    </div>
                ))}
            </div>

            
            

            <div className="chart-container4">
                <div className="chart-box">
                    <h2>Top 5 Performer</h2>
                    <table className="performer">
                        <thead>
                            <tr>
                                <th>Agent Name</th>
                                <th>Audit Count</th>
                                <th>CQ%</th>
                                <th>Fatal Count</th>
                                <th>Fatal%</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Gaurav</td>
                                <td>7</td>
                                <td>92%</td>
                                <td>0</td>
                                <td>0%</td>
                            </tr>
                        </tbody>
                        <tbody>
                            <tr>
                                <td>Sachin</td>
                                <td>7</td>
                                <td>92%</td>
                                <td>0</td>
                                <td>0%</td>
                            </tr>
                        </tbody>
                        <tbody>
                            <tr>
                                <td>Gaurav</td>
                                <td>7</td>
                                <td>92%</td>
                                <td>0</td>
                                <td>0%</td>
                            </tr>
                        </tbody>
                        <tbody>
                            <tr>
                                <td>Gaurav</td>
                                <td>7</td>
                                <td>92%</td>
                                <td>0</td>
                                <td>0%</td>
                            </tr>
                        </tbody>
                        <tbody>
                            <tr>
                                <td>Gaurav</td>
                                <td>7</td>
                                <td>92%</td>
                                <td>0</td>
                                <td>0%</td>
                            </tr>
                        </tbody>
                        <tbody>
                            <tr>
                                <td>Gaurav</td>
                                <td>7</td>
                                <td>92%</td>
                                <td>0</td>
                                <td>0%</td>
                            </tr>
                        </tbody>
                        
                    </table>
                </div>
            </div>

            <div className="chart-container1">

                <div className="chart-box graph">
                    <h2>Target Vs CQ Score</h2>
                    <BarChart width={450} height={300} data={barData}>
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="score" fill="#2196F3" />
                        <Bar dataKey="target" fill="#4CAF50" />
                    </BarChart>
                </div>
            </div>
        </div>
        </Layout>
    )

}

export default Analysis;








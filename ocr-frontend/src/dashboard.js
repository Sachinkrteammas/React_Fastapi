import React, { useState,useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./dashboard.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Check} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend} from "recharts";
import Layout from "./layout"; 
import "./layout.css";
import { BASE_URL } from "./components/config";
import axios from "axios";

const Dashboard = () => {
  const navigate = useNavigate();
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split("T")[0]);
  const [dateOption, setDateOption] = useState("Today");
  const [isCustom, setIsCustom] = useState(false);
  const [barData, setBarData] = useState([]);
  const firstname=localStorage.getItem("username");
  const username =firstname? firstname.split(" ")[0] : "";
  const user_id = localStorage.getItem("id");
  const [totalMinutes, setTotalMinutes] = useState("00.00");
  
  
  const handleLogout = () => {
    localStorage.removeItem("token");
    sessionStorage.removeItem("user");
    // onLogout();
    navigate("/");
  };


  const handleNavigation = (path) => {
    navigate(path);
  };


  const handleSubmit = async () => {
    try {
        console.log("Fetching data for:", startDate, "to", endDate);

        const response = await fetch(`${BASE_URL}/get-audio-stats/`, {
            method: "POST", // Use POST instead of GET
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                from_date: startDate,
                to_date: endDate
            }),
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch data. Status: ${response.status}`);
        }

        const result = await response.json();

        if (result.status === "success") {
            console.log("API Response:", result.data);

            const formattedData = result.data.map(item => ({
                date: new Date(item.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }), // Format date
                Upload: item.upload || 0,       // Ensure numeric value
                Transcribe: item.transcribe || 0 // Ensure numeric value
            }));

            setBarData(formattedData); // Update bar chart data
        } else {
            console.error("API Error:", result);
        }
    } catch (error) {
        console.error("Error fetching data:", error);
    }
};





  const handleDateChange = (date, type) => {
    if (!date) return; // Ensure date is not null

    const formattedDate = date.toISOString().split("T")[0]; // Convert to YYYY-MM-DD

    if (type === "start") setStartDate(formattedDate);
    else setEndDate(formattedDate);
  };

  const handleDateOptionChange = (event) => {
    const option = event.target.value;
    setDateOption(option);
    setIsCustom(option === "Custom");

    let today = new Date();
    let newStartDate = today;
    let newEndDate = today;

    if (option === "Today") {
      newStartDate = new Date();
      newEndDate = new Date();
    } else if (option === "Yesterday") {
      newStartDate = new Date();
      newStartDate.setDate(today.getDate() - 1);
      newEndDate = new Date();
    } else if (option === "Week") {
      newStartDate = new Date();
      newStartDate.setDate(today.getDate() - 7);
      newEndDate = new Date();
    } else if (option === "Month") {
      newStartDate = new Date();
      newStartDate.setMonth(today.getMonth() - 1);
      newEndDate = new Date();
    }

    setStartDate(newStartDate.toISOString().split("T")[0]);
    setEndDate(newEndDate.toISOString().split("T")[0]);
  };


  useEffect(() => {
    if (!user_id) return; // Ensure user_id exists

    const fetchTotalMinutes = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/calculate_limit/`, {
          params: { user_id },
        });
        setTotalMinutes(response.data.total_minutes);
      } catch (error) {
        console.error("Error fetching total minutes:", error);
      }
    };

    fetchTotalMinutes();
  }, [user_id]);


  return (
    <Layout>

        <div className="flex-container">
          <div>
            <h6 style={{fontFamily:"Arial"}}>You are on the FREE plan which has a monthly data extraction limit of 30 minutes. You've processed a total of {totalMinutes} minute so far this month.</h6>
          </div>
          {/* Main Content */}
          <div className="main-content new123">
            <h1 className="new">Recording Transcription</h1>
            <p><Check size={16} className="icon" /> Transcribe Recording</p>
            <p><Check size={16} className="icon" /> Service Analysis</p>
            <p><Check size={16} className="icon" /> Sales Analysis</p>
            <p><Check size={16} className="icon" /> Audit Call</p>
            <p><Check size={16} className="icon" /> Insights</p>
            <p><Check size={16} className="icon" /> Auto Tagging</p>
          </div>

          <div className="main-content new12">
            <h1 className="new">Addon’s API</h1>
            <p>Transcribe</p>
            <p>Upload</p>
            <p>Insights</p>
          </div>

          <div className="main-content new1">
            <h1 className="new">Learn</h1>
            <p>How to Upload</p>
            <p>API Usage</p>
            <p>Analysis Insights</p>
          </div>

          {/* Usage Activity Section */}
          <div className="activity-section activity">
            <h4>Usage Activity</h4>
            <select className="predate1" value={dateOption} onChange={handleDateOptionChange}>
            
              <option>Today</option>
              <option>Yesterday</option>
              <option>Week</option>
              <option>Month</option>
              <option>Custom</option>
            </select>

            <h4>Start Date</h4>
            <DatePicker className="datepic" selected={startDate} onChange={(date) => handleDateChange(date, "start")} readOnly={!isCustom} dateFormat="yyyy-MM-dd"  portalId="root"/>

            <h4>End Date</h4>
            <DatePicker className="datepic" selected={endDate} onChange={(date) => handleDateChange(date, "end")} readOnly={!isCustom} dateFormat="yyyy-MM-dd"  portalId="root"/>

            <button className="submit" onClick={handleSubmit}>Submit</button>

          </div>


          <div className=" notifi">
            <h1 className="new">Notifications</h1>
            <p>Our new project is currently in the pipeline and progressing well.
The development team is working on the project, which is in the pipeline.
We have several exciting initiatives in the pipeline for this quarter.
The upcoming project in the pipeline will revolutionize our workflow.
There are multiple enhancements in the pipeline to improve system efficiency.
A new feature is in the pipeline, set to launch next month.
We are actively discussing a project that is in the pipeline.</p>

          </div>

          {barData.length > 0 && (
            <div className="range-chart">
              <h1 className="r-text">Usage Activity Chart</h1>
              
              <BarChart width={450} height={300} data={barData}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="Upload" fill="#2196F3" />
                <Bar dataKey="Transcribe" fill="#4CAF50" />
              </BarChart>
            </div>
          )}



        </div>
      
    </Layout>
  );
};

export default Dashboard;

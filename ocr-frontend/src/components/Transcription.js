import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Layout from "../layout";
import "../layout.css";
import "./Transcription.css";
import { BASE_URL } from "./config";

const Transcription = ({ onLogout }) => {
  const navigate = useNavigate();
  const [startDate, setStartDate] =  useState(new Date().toISOString().split("T")[0]);
  const [endDate, setEndDate] =  useState(new Date().toISOString().split("T")[0]);
  const [dateOption, setDateOption] = useState("Today");
  const [isCustom, setIsCustom] = useState(false);
  const [dateBy, setDateBy] = useState("Document Date");
  const [bucket, setBucket] = useState("Active");
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 6;
  const audioRef = useRef(null);

  const firstname = localStorage.getItem("username");
  const username = firstname ? firstname.split(" ")[0] : "";

  const handleLogout = () => {
    localStorage.removeItem("token");
    sessionStorage.removeItem("user");
    onLogout();
    navigate("/");
  };

  useEffect(() => {
    const fetchRecordings = async () => {
      try {
        const response = await fetch(`${BASE_URL}/recordings/`);
        const result = await response.json();
        setData(result);
        setTotalPages(Math.ceil(result.length / itemsPerPage));
      } catch (error) {
        console.error("Error fetching recordings:", error);
      }
    };

    fetchRecordings();
  }, []);

  const nextPage = () => {
    if (page < totalPages) {
      setPage(page + 1);
    }
  };

  const prevPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  const startIndex = (page - 1) * itemsPerPage;
  // const currentItems = data.slice(startIndex, startIndex + itemsPerPage);
  const currentItems = Array.isArray(data) ? data.slice(startIndex, startIndex + itemsPerPage) : [];


  const handleDateChange = (date, type) => {
    if (!date) return; 

    const formattedDate = date.toISOString().split("T")[0]; 

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

  const handleView = async () => {
    console.log("Fetching data from", startDate, "to", endDate);
  
    try {
      const response = await fetch(`${BASE_URL}/recordings_datewise/?start_date=${startDate}&end_date=${endDate}`);
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error("Error fetching filtered recordings:", error);
    }
  };

  return (
    <Layout>
      <div className="dateboard">
        <div className="date-page1">
          <h1 className="word">Pre Set</h1>
          <select
            className="predate"
            value={dateOption}
            onChange={handleDateOptionChange} // Enable date pickers when "Custom" is selected
            
          >
            <option>Today</option>
            <option>Yesterday</option>
            <option>Week</option>
            <option>Month</option>
            <option>Custom</option>
          </select>

          <h1 className="word1">Start Date</h1>
          <DatePicker
            className="datepic1"
            selected={startDate}
            onChange={(date) => handleDateChange(date, "start")}
            disabled={!isCustom} // Enable only if "Custom" is selected
            dateFormat="yyyy-MM-dd"
            portalId="root"
          />

          <h1 className="word1">End Date</h1>
          <DatePicker
            className="datepic1"
            selected={endDate}
            onChange={(date) => handleDateChange(date, "end")}
            disabled={!isCustom}
            dateFormat="yyyy-MM-dd"
            portalId="root"
          />

          <h1 className="word">Date by</h1>
          <select className="predate" value={dateBy} onChange={(e) => setDateBy(e.target.value)}>
            <option>Document Date</option>
            <option>Created Date</option>
          </select>

          <h1 className="word">Bucket</h1>
          <select className="predate" value={bucket} onChange={(e) => setBucket(e.target.value)}>
            <option>Active</option>
            <option>Not Viewed</option>
            <option>Archived</option>
            <option>All</option>
          </select>

          <button className="view" style={{ marginLeft: "10px", height: "30px" }} onClick={handleView}>View</button>
        </div>

        <div className="table-containers1">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Preview</th>
                <th>Recording Date</th>
                <th>Recording File</th>
                <th>Category</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((item, index) => (
                <tr key={index}>
                  <td>{item.preview}</td>
                  <td>{item.recordingDate}</td>
                  <td>
                    <audio className="audio-controls" controls>
                      <source src={`/audio/${item.file}`} type={item.file.endsWith(".wav") ? "audio/mpeg" : "audio/wav"} />
                      Your browser does not support the audio element.
                    </audio>
                  </td>
                  <td>{item.category}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="pagination">
          <button onClick={prevPage} disabled={page === 1} className="pagination-button">
            Previous
          </button>
          <span className="page-info">Page {page} of {totalPages}</span>
          <button onClick={nextPage} disabled={page === totalPages} className="pagination-button">
            Next
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default Transcription;

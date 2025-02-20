import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Layout from "../layout";
import "../layout.css";
import "./Transcription.css";

const Transcription = ({ onLogout }) => {
  const navigate = useNavigate();
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [dateOption, setDateOption] = useState("Today");
  const [isCustom, setIsCustom] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 6; // Set items per page dynamically

  const firstname = localStorage.getItem("username");
  const username = firstname ? firstname.split(" ")[0] : "";

  const handleLogout = () => {
    localStorage.removeItem("token");
    sessionStorage.removeItem("user");
    onLogout();
    navigate("/");
  };

  const data = [
    { preview: "🔍", recordingDate: "2024-02-19", file: "recording1.mp4", category: "Interview" },
    { preview: "🔍", recordingDate: "2024-02-18", file: "recording2.mp4", category: "Lecture" },
    { preview: "🔍", recordingDate: "2024-02-17", file: "recording3.mp4", category: "Podcast" },
    { preview: "🔍", recordingDate: "2024-02-17", file: "recording4.mp4", category: "Podcast" },
    { preview: "🔍", recordingDate: "2024-02-17", file: "recording5.mp4", category: "Podcast" },
    { preview: "🔍", recordingDate: "2024-02-17", file: "recording6.mp4", category: "Lecture" },
    { preview: "🔍", recordingDate: "2024-05-17", file: "recording7.mp4", category: "Podcast" },
    { preview: "🔍", recordingDate: "2024-02-17", file: "recording8.mp4", category: "Podcast" },
    { preview: "🔍", recordingDate: "2024-02-17", file: "recording9.mp4", category: "Podcast" },
    { preview: "🔍", recordingDate: "2024-02-18", file: "recording10.mp4", category: "Lecture" },
    { preview: "🔍", recordingDate: "2024-02-19", file: "recording1.mp4", category: "Interview" },
    { preview: "🔍", recordingDate: "2024-02-18", file: "recording2.mp4", category: "Lecture" },
    { preview: "🔍", recordingDate: "2024-02-17", file: "recording3.mp4", category: "Podcast" },
    { preview: "🔍", recordingDate: "2024-02-17", file: "recording4.mp4", category: "Podcast" },
    { preview: "🔍", recordingDate: "2024-02-17", file: "recording5.mp4", category: "Podcast" },
    { preview: "🔍", recordingDate: "2024-02-17", file: "recording6.mp4", category: "Lecture" },
    { preview: "🔍", recordingDate: "2024-05-17", file: "recording7.mp4", category: "Podcast" },
    { preview: "🔍", recordingDate: "2024-02-17", file: "recording8.mp4", category: "Podcast" },
    { preview: "🔍", recordingDate: "2024-02-17", file: "recording9.mp4", category: "Podcast" },
    { preview: "🔍", recordingDate: "2024-02-18", file: "recording10.mp4", category: "Lecture" },
    { preview: "🔍", recordingDate: "2024-02-19", file: "recording1.mp4", category: "Interview" },
    { preview: "🔍", recordingDate: "2024-02-18", file: "recording2.mp4", category: "Lecture" },
    { preview: "🔍", recordingDate: "2024-02-17", file: "recording3.mp4", category: "Podcast" },
    { preview: "🔍", recordingDate: "2024-02-17", file: "recording4.mp4", category: "Podcast" },
    { preview: "🔍", recordingDate: "2024-02-17", file: "recording5.mp4", category: "Podcast" },
    { preview: "🔍", recordingDate: "2024-02-17", file: "recording6.mp4", category: "Lecture" },
    { preview: "🔍", recordingDate: "2024-05-17", file: "recording7.mp4", category: "Podcast" },
    { preview: "🔍", recordingDate: "2024-02-17", file: "recording8.mp4", category: "Podcast" },
    { preview: "🔍", recordingDate: "2024-02-17", file: "recording9.mp4", category: "Podcast" },
    { preview: "🔍", recordingDate: "2024-02-18", file: "recording10.mp4", category: "Lecture" },
    { preview: "🔍", recordingDate: "2024-02-19", file: "recording1.mp4", category: "Interview" },
    { preview: "🔍", recordingDate: "2024-02-18", file: "recording2.mp4", category: "Lecture" },
    { preview: "🔍", recordingDate: "2024-02-17", file: "recording3.mp4", category: "Podcast" },
    { preview: "🔍", recordingDate: "2024-02-17", file: "recording4.mp4", category: "Podcast" },
    { preview: "🔍", recordingDate: "2024-02-17", file: "recording5.mp4", category: "Podcast" },
    { preview: "🔍", recordingDate: "2024-02-17", file: "recording6.mp4", category: "Lecture" },
    { preview: "🔍", recordingDate: "2024-05-17", file: "recording7.mp4", category: "Podcast" },
    { preview: "🔍", recordingDate: "2024-02-17", file: "recording8.mp4", category: "Podcast" },
    { preview: "🔍", recordingDate: "2024-02-17", file: "recording9.mp4", category: "Podcast" },
    { preview: "🔍", recordingDate: "2024-02-18", file: "recording10.mp4", category: "Lecture" },
  ];

  useEffect(() => {
    setTotalPages(Math.ceil(data.length / itemsPerPage));
  }, [data]);

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

  // Slice data for pagination
  const startIndex = (page - 1) * itemsPerPage;
  const currentItems = data.slice(startIndex, startIndex + itemsPerPage);

  return (
    <Layout>
      <div className="dateboard">
        <div className="date-page1">
          <h1 className="word">Pre Set</h1>
          <select className="predate" value={dateOption} onChange={(e) => setDateOption(e.target.value)}>
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
            onChange={(date) => setStartDate(date)}
            readOnly={!isCustom}
            dateFormat="yyyy-MM-dd"
          />

          <h1 className="word1">End Date</h1>
          <DatePicker
            className="datepic1"
            selected={endDate}
            onChange={(date) => setEndDate(date)}
            readOnly={!isCustom}
            dateFormat="yyyy-MM-dd"
          />

          <h1 className="word">Date by</h1>
          <select className="predate" value={dateOption} onChange={(e) => setDateOption(e.target.value)}>
            <option>Document Date</option>
            <option>Created Date</option>
          </select>

          <h1 className="word">Bucket</h1>
          <select className="predate" value={dateOption} onChange={(e) => setDateOption(e.target.value)}>
            <option>Active</option>
            <option>Not Viewed</option>
            <option>Archived</option>
            <option>All</option>
          </select>

          <button className="view" style={{ marginTop: "3rem" }}>View</button>
        </div>

        {/* Table with Paginated Data */}
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Preview</th>
                <th>Recording Date</th>
                <th>File</th>
                <th>Category</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((item, index) => (
                <tr key={index}>
                  <td>{item.preview}</td>
                  <td>{item.recordingDate}</td>
                  <td className="file-link">{item.file}</td>
                  <td>{item.category}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
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

import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Recording.css";
import Layout from "../layout";
import "../layout.css"; // Import styles

const Recordings = () => {
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadMessage, setUploadMessage] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("Language Choice");
  const [generatedKey, setGeneratedKey] = useState(""); // State for storing the generated key
  const fileInputRef = useRef(null); // Use useRef to handle file input reset

  const handleNavigation = (path) => {
    navigate(path);
  };

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
    setUploadMessage("");
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadMessage("Please select a file first.");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await axios.post("http://127.0.0.1:8095/upload-audio/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setUploadMessage(response.data.message);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = ""; // Reset input field
      }
    } catch (error) {
      setUploadMessage(error.response?.data?.detail || "Upload failed.");
    }
  };

  // Function to generate a random key
  const handleGenerateKey = () => {
    const newKey = Math.random().toString(36).substring(2, 12).toUpperCase(); // Generate a random alphanumeric key
    setGeneratedKey(newKey);
  };

  return (
    <Layout>
      <div className="record-content">
        <h1 className="wordrec">Recordings</h1>
        <div className="drop-record">

          <select value={selectedLanguage} onChange={(e) => setSelectedLanguage(e.target.value)}>
            <option value="Language Choice">Language Choice</option>
            <option value="English">English</option>
            <option value="Hindi">Hindi</option>
            <option value="Tamil">Tamil</option>
            <option value="Kannada">Kannada</option>
          </select>
        </div>
        <h2 className="chword">Choose an Audio File</h2>
        <div className="recordings-box">
          {/* <h2 className="chword">Choose an Audio File</h2> */}
          <input
            type="file"
            accept="audio/mpeg,audio/wav"
            className="browse-button"
            onChange={handleFileChange}
            ref={fileInputRef} // Attach ref to input field
          />
          <button className="upload-button" onClick={handleUpload}>
            Upload
          </button>
          {uploadMessage && <p className="upload-message">{uploadMessage}</p>}
        </div>

        <div className="developer-container">
          <h1 className="worddev">Developer Code</h1>
          <div className="developer-box">


          </div>
          <div className="generate-container">
            <input
              type="text"
              value={generatedKey}
              readOnly
              className="key-input"
            />

            <button
              className="copy-key-button"
              onClick={() => navigator.clipboard.writeText(generatedKey)}
              disabled={!generatedKey} // Disable if no key is generated
            >
              Copy
            </button>
            <button className="generate-key-button" onClick={handleGenerateKey}>
              Generate Key
            </button>
          </div>
        </div>

      </div>

    </Layout>
  );
};

export default Recordings;

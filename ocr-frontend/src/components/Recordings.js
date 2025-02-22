import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Recording.css";
import Layout from "../layout";
import "../layout.css";

const Recordings = () => {
  const navigate = useNavigate();
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadMessage, setUploadMessage] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [generatedKey, setGeneratedKey] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (event) => {
    setSelectedFiles((prevFiles) => [
      ...prevFiles,
      ...Array.from(event.target.files),
    ]);
    setUploadMessage("");
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      setUploadMessage("Please select at least one file.");
      return;
    }

    if (!selectedLanguage || !selectedCategory) {
      setUploadMessage("Please select both language and category.");
      return;
    }

    setUploading(true);
    let successCount = 0;
    let failedFiles = [];

    for (const file of selectedFiles) {
      const formData = new FormData();
      formData.append("files", file);
      formData.append("language", selectedLanguage);
      formData.append("category", selectedCategory);

      try {
        await axios.post("http://127.0.0.1:8097/upload-audio/", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        successCount++;
      } catch (error) {
        failedFiles.push(file.name);
      }
    }

    if (successCount > 0 && failedFiles.length === 0) {
      setUploadMessage(`${successCount} file(s) uploaded successfully!`);
    } else if (successCount > 0 && failedFiles.length > 0) {
      setUploadMessage(
        `${successCount} file(s) uploaded successfully. Failed: ${failedFiles.join(
          ", "
        )}`
      );
    } else {
      setUploadMessage("All file uploads failed.");
    }

    setUploading(false);
    setSelectedFiles([]);
    setSelectedLanguage("");
    setSelectedCategory("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const userid = localStorage.getItem("id");

  const handleGenerateKey = async () => {
    if (!userid) {
      setUploadMessage("User ID not found. Please log in.");
      return;
    }

    try {
      const response = await axios.post(
        "http://127.0.0.1:8097/generate-key/",
        { user_id: parseInt(userid) }, // Send user_id as JSON
        { headers: { "Content-Type": "application/json" } }
      );

      setGeneratedKey(response.data.key);
    } catch (error) {
      setUploadMessage("Failed to generate key.");
    }
  };
  return (
    <Layout>
      <div className="record-content">
        <h1 className="wordrec">Recordings</h1>

        {/* Language & Category Dropdowns */}
        <div className="drop-record">
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
          >
            <option value="">Select Language</option>
            <option value="English">English</option>
            <option value="Hindi">Hindi</option>
            <option value="Tamil">Tamil</option>
            <option value="Kannada">Kannada</option>
          </select>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">Select Category</option>
            <option value="Sales">Sales</option>
            <option value="Service">Service</option>
          </select>
        </div>

        <h2 className="chword">Choose Audio Files</h2>

        {/* File Input & Upload Button */}
        <div className="recordings-box">
          <input
            type="file"
            accept="audio/mpeg,audio/wav"
            multiple
            className="browse-button"
            onChange={handleFileChange}
            ref={fileInputRef}
          />
          <button
            className="upload-button"
            onClick={handleUpload}
            disabled={uploading}
          >
            {uploading ? "Uploading..." : "Upload"}
          </button>
          {uploadMessage && <p className="upload-message">{uploadMessage}</p>}
        </div>

        <div className="developer-container">
          <h1 className="worddev">Developer Code</h1>
          <div className="developer-box">
            <div className="curl-div">
              curl -X 'POST' 'http://127.0.0.1:8095/upload-audio-curl/' \ -H
              "Authorization: Bearer YOUR_SECRET_TOKEN" \ -H 'Content-Type:
              multipart/form-data' \ -F 'files=@/path/to/audio1.mp3' \ -F
              'files=@/path/to/audio2.wav' \ -F 'language=English' \ -F
              'category=Sales'
            </div>
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
              disabled={!generatedKey}
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

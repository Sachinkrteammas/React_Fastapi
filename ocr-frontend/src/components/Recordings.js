import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Recording.css";
import Layout from "../layout";
import "../layout.css";
import { Copy, CopyCheck, CloudUpload } from "lucide-react";
import { BASE_URL } from "./config";

const Recordings = () => {
  const navigate = useNavigate();
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadMessage, setUploadMessage] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [generatedKey, setGeneratedKey] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const user_id = localStorage.getItem("id");
  const [totalMinutes, setTotalMinutes] = useState("00.00");
  const set_limit = Number(localStorage.getItem("set_limit")) || 0;

  const isLimitExceeded = totalMinutes > set_limit;

  const curlCommand = `curl -X 'POST' 'http://127.0.0.1:8097/upload-audio-curl/' \\
-H "Authorization: Bearer YOUR_SECRET_TOKEN" \\
-H 'Content-Type: multipart/form-data' \\
-F 'files=@/path/to/audio1.mp3' \\
-F 'files=@/path/to/audio2.wav' \\
-F 'language=English' \\
-F 'category=Sales' \\
-F 'user_id=12'`;

  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(curlCommand);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleUpload = async (filesToUpload = selectedFiles) => {
    if (filesToUpload.length === 0) {
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

    for (const file of filesToUpload) {
      const formData = new FormData();
      formData.append("files", file);
      formData.append("language", selectedLanguage);
      formData.append("category", selectedCategory);
      formData.append("user_id", user_id);

      try {
        await axios.post(`${BASE_URL}/upload-audio/`, formData, {
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
        `${successCount} file(s) uploaded successfully. Failed: ${failedFiles.join(", ")}`
      );
    } else {
      setUploadMessage("All file uploads failed.");
    }

    setUploading(false);
    setSelectedFiles([]);
  };

  const handleGenerateKey = async () => {
    if (!user_id) {
      setUploadMessage("User ID not found. Please log in.");
      return;
    }

    try {
      const response = await axios.post(
        `${BASE_URL}/generate-key/`,
        { user_id: parseInt(user_id) },
        { headers: { "Content-Type": "application/json" } }
      );

      setGeneratedKey(response.data.key);
    } catch (error) {
      setUploadMessage("Failed to generate key.");
    }
  };

  useEffect(() => {
    if (!user_id) return;

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

  const handleDrop = (e) => {
    e.preventDefault();
    if (isLimitExceeded) return;

    const files = Array.from(e.dataTransfer.files).filter((file) =>
      ["audio/mpeg", "audio/wav"].includes(file.type)
    );

    if (files.length === 0) {
      setUploadMessage("Only MP3 or WAV files are allowed.");
      return;
    }

    setSelectedFiles(files);
    handleUpload(files);
  };

  const handleFileInputChange = (e) => {
    const files = Array.from(e.target.files).filter((file) =>
      ["audio/mpeg", "audio/wav"].includes(file.type)
    );

    if (files.length === 0) {
      setUploadMessage("Only MP3 or WAV files are allowed.");
      return;
    }

    setSelectedFiles(files);
    handleUpload(files);
  };

  return (
    <Layout>
      <div className="record-dash">
        <div className="record-content">
          <h1 className="wordrec">Recordings</h1>

          {/* Dropdowns */}
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

          {/* Upload Section */}
          <h2 className="chword">Upload Audio Files</h2>
          <div
            className={`recordings-box ${isLimitExceeded ? "blurred" : ""} ${uploading ? "uploading" : ""}`}
            onDragOver={(e) => {
              e.preventDefault();
              e.dataTransfer.dropEffect = "copy";
            }}
            onDrop={handleDrop}
          >
            <div
              className="drag-content"
              onClick={() => !isLimitExceeded && fileInputRef.current.click()}
              style={{ cursor: isLimitExceeded ? "not-allowed" : "pointer" }}
            >
              <CloudUpload size={40} color="#555" />
              <p className="drag-hint">
                {uploading ? "Uploading..." : "Click or drag and drop files here"}
              </p>
              <input
                type="file"
                accept=".mp3,.wav"
                multiple
                ref={fileInputRef}
                onChange={handleFileInputChange}
                style={{ display: "none" }}
              />
            </div>

            {uploadMessage && <p className="upload-message">{uploadMessage}</p>}
            {isLimitExceeded && (
              <p style={{ color: "red" }}>Limit exceeded! Upgrade your plan.</p>
            )}
          </div>

          {/* Developer Section */}
          <div className={`developer-container ${isLimitExceeded ? "blurred" : ""}`}>
            <h1 className="worddev">Developer Code</h1>
            <div className="developer-box">
              <div className="curl-div">
                <code className="curlcode">{curlCommand}</code>
                <button
                  onClick={copyToClipboard}
                  className="clipcopy"
                  disabled={isLimitExceeded}
                >
                  {copied ? <CopyCheck size={18} /> : <Copy size={18} />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Recordings;

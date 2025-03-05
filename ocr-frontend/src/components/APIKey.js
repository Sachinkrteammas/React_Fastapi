import React, { useState, useEffect } from "react";
import Layout from "../layout";
import "../layout.css";
import "./APIKey.css";
import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:8097"; // Use env variable for API URL

export default function APIKey() {
  const [apiKeys, setApiKeys] = useState([]);
  const [generatedKey, setGeneratedKey] = useState("");
  const [uploadMessage, setUploadMessage] = useState("");

  const userid = localStorage.getItem("id"); // Get user ID from local storage

  
  const fetchAPIKeys = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/get-keys`);
  
      if (response.data.length > 0) {
       
        const sortedKeys = response.data.sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );
  
        
        const latestActiveKey = sortedKeys.find((key) => key.status === "Active");
  
        
        if (latestActiveKey) {
          const updatedKeys = sortedKeys.map((key) =>
            key.api_key === latestActiveKey.api_key
              ? key 
              : { ...key, status: "Inactive" } 
          );
          setApiKeys(updatedKeys);
        } else {
          setApiKeys(sortedKeys); 
        }
      } else {
        setApiKeys([]); 
      }
    } catch (error) {
      console.error("Error fetching API keys:", error);
    }
  };
  


 
  const handleGenerateKey = async () => {
    if (!userid) {
      setUploadMessage("User ID not found. Please log in.");
      return;
    }

    try {
      setUploadMessage(""); 

      const response = await axios.post(
        `${API_BASE_URL}/generate-key/`,
        { user_id: userid },
        { headers: { "Content-Type": "application/json" } }
      );

      setGeneratedKey(response.data.key);
      setUploadMessage("API key generated successfully!");

 
      setTimeout(() => {
        fetchAPIKeys();
      }, 500);
    } catch (error) {
      setUploadMessage("Failed to generate key.");
    }
  };

  useEffect(() => {
    fetchAPIKeys();
  }, [generatedKey]);

  return (
    <Layout>
      <h1>API Key Management</h1>

      {/* Display success/error message */}
      {uploadMessage && <p>{uploadMessage}</p>}

      {/* Display generated key */}
      <input
        type="text"
        placeholder="Generated key will appear here"
        value={generatedKey}
        readOnly
      />
      <button onClick={handleGenerateKey}>Generate Key</button>

      {/* API Key Table */}
      <table border="1">
        <thead>
          <tr>
            <th>Key</th>
            <th>Date</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {apiKeys.length > 0 ? (
            apiKeys.map((key, index) => (
              <tr key={index}>
                <td>{key.api_key}</td>
                <td>{new Date(key.created_at).toLocaleString()}</td>
                <td>{key.status}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3">No API keys found</td>
            </tr>
          )}
        </tbody>
      </table>
    </Layout>
  );
}

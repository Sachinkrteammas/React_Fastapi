import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./PromptPage.css";
import Layout from "../layout"; // Import layout component
import "../layout.css"; // Import styles


const PromptPage = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [keyValuePairs, setKeyValuePairs] = useState({});
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");
  const firstname = localStorage.getItem("username");
  const username = firstname ? firstname.split(" ")[0] : "";
  const defaultPrompt = "Please analyze the following conversation between an agent and a customer " +
    "and extract the details in the provided JSON format. If any field is not " +
    "explicitly mentioned or does not apply, return 'None' for that field. " +
    "Ensure the output strictly adheres to the JSON structure and addresses all " +
    "fields. Do not infer or guess beyond the conversation's content.";


  const handleLogout = () => {
    localStorage.removeItem("token");
    sessionStorage.removeItem("user");
    // onLogout();
    navigate("/");
  };

  const handleNavigation = (path) => {
    navigate(path);
  };

  const addKey = () => {
    if (newKey.trim() === "" || newValue.trim() === "") {
      alert("Both key and value are required.");
      return;
    }

    setKeyValuePairs((prevPairs) => ({
      ...prevPairs,
      [newKey]: newValue,
    }));

    // Clear input fields
    setNewKey("");
    setNewValue("");
  };

  return (
    <Layout>
      {/* Main Content */}
      <div className="main-content1">
        <div className="form-container">

          <div className="form-group">
            {/* Name Field */}
            <p>Name</p>
            <div className="input-group">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-field"
              />
            </div>

            {/* Key-Value Input Section */}

            <p>Key</p>
            <div className="input-group">
              <input
                type="text"
                value={newKey}
                onChange={(e) => setNewKey(e.target.value)}
                className="input-field"
                placeholder="Enter new key"
              />
            </div>



            {/* Value Field */}
            <div className="form-group">
              <p>Value</p>
              <input
                type="text"
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                className="input-field"
                placeholder="Enter value"
              />
            </div>
            <button onClick={addKey} className="add-key-btn">
              Add key
            </button>
            <button className="add-key-btn">
              Submit
            </button>


          </div>
        </div>

        {/* Right Display Section */}
        <div className="output-container">
          <h1 className="new">Created Prompt</h1>

          <textarea
            className="outbox"
            name="text"
            placeholder="Generated JSON"
            value={
              Object.keys(keyValuePairs).length > 0
                ? `${defaultPrompt}\n\n${JSON.stringify(keyValuePairs, null, 2)}`
                : defaultPrompt
            }
            readOnly
          />


        </div>
      </div>
    </Layout>

  );
};

export default PromptPage;

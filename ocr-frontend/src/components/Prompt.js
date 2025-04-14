import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios"; // Import axios
import "./PromptPage.css";
import Layout from "../layout";
import "../layout.css";
import { BASE_URL } from "./config";
import TooltipHelp from './TooltipHelp';


const PromptPage = () => {
  const navigate = useNavigate();
  const [name, setName] = useState(""); // Prompt name
  const [keyValuePairs, setKeyValuePairs] = useState({}); // Stores key-value pairs
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const id = localStorage.getItem("id"); // ClientId from localStorage

  const defaultPrompt =
    "Please analyze the following conversation between an agent and a customer " +
    "and extract the details in the provided JSON format. If any field is not " +
    "explicitly mentioned or does not apply, return 'None' for that field. " +
    "Ensure the output strictly adheres to the JSON structure and addresses all " +
    "fields. Do not infer or guess beyond the conversation's content.";

  // Convert key-value pairs into a string format
  const generatePromptString = () => {
    const keyValueString =
      Object.keys(keyValuePairs).length > 0
        ? `\n\nAdditional Details:\n${JSON.stringify(keyValuePairs, null, 2)}`
        : "";
    return defaultPrompt + keyValueString;
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      alert("Please enter a prompt name.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await axios.post(`${BASE_URL}/prompts/`, {
        ClientId: parseInt(id, 10), // Convert id to integer
        PromptName: name,
        prompt: generatePromptString(), // Send prompt as a string (NOT JSON)
      });

      if (response.status === 200) {
        setMessage("Prompt saved successfully!");
        setName(""); // Reset input fields
        setKeyValuePairs({});
      } else {
        setMessage(`Error: ${response.data.detail || "Failed to save prompt"}`);
      }
    } catch (error) {
      setMessage("Server error. Please try again later.");
      console.error("Error submitting prompt:", error);
    }

    setLoading(false);
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

    setNewKey("");
    setNewValue("");
  };

  const handleKeyBlur = () => {
    if (newKey.trim() !== "") {
      setNewValue(`Extract ${newKey} in this conversation`);
    }
  };

  return (
    <Layout heading="Title to be decided">
      <div className="main-content1">
        <div className="form-container">
          <div className="form-group">
            <p>
              Prompt Name
              <span style={{ marginLeft: '45px' }}>
                <TooltipHelp message="The Prompt Name is just a title you give to your custom prompt so you can easily recognize or organize it later." />
              </span>
            </p>
            <div className="input-group">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-field"
                placeholder="Enter prompt name"
              />
            </div>

            <p>
              Key
              <span style={{ marginLeft: '117px' }}>
                <TooltipHelp message="A key is like a label or title for a specific piece of information you want to extract." />
              </span>
            </p>

            <div className="input-group">
              <input
                type="text"
                value={newKey}
                onChange={(e) => setNewKey(e.target.value)}
                onBlur={handleKeyBlur}
                className="input-field"
                placeholder="Enter new key"
              />
            </div>

            <p>
              Suggested Value
              <span style={{ marginLeft: '25px' }}>
                <TooltipHelp message="The suggested value is a hint or example to show what kind of answer you're expecting for that key." />
              </span>
            </p>

            <div className="input-group">
              <input
                type="text"
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                className="input-field"
                placeholder="Enter value"
              />
            </div>

            <button onClick={addKey} className="add-key-btn">
              Add Key
            </button>

            <button onClick={handleSubmit} className="add-key-btn" disabled={loading}>
              {loading ? "Submitting..." : "Submit"}
            </button>

            {message && <p className="message">{message}</p>}
          </div>
        </div>

        <div className="output-container">
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <h1 className="new">Created Prompt</h1>
            <TooltipHelp message="This is the final generated prompt based on your input." />
          </div>
          <textarea
            className="outbox"
            name="text"
            placeholder="Generated Prompt"
            value={generatePromptString()}
            readOnly
          />
        </div>


      </div>
    </Layout >
  );
};

export default PromptPage;

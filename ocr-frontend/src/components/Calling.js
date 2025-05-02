import React, { useState, useEffect, useRef } from "react";
import Layout from "../layout";
import "../layout.css";

const Calling = () => {
  const [openDropdown, setOpenDropdown] = useState(null);
  const [phoneNumbers, setPhoneNumbers] = useState({
    Sales: "",
    Services: "",
    Collection: "",
  });

  const dropdownRef = useRef(null);

  const sections = ["Sales", "Services", "Collection"];

  const handleInputChange = (section, value) => {
    setPhoneNumbers((prev) => ({ ...prev, [section]: value }));
  };

  const handleCall = (section) => {
    alert(`📞 Calling ${phoneNumbers[section] || "unknown"} from ${section}`);
  };

  const toggleDropdown = (section) => {
    setOpenDropdown(openDropdown === section ? null : section);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <Layout heading="Calling">
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "3rem 1rem",
          background: "linear-gradient(to right, rgb(15, 27, 43))",
          minHeight: "calc(100vh - 100px)",
        }}
      >
        <h2
          style={{
            fontSize: "2rem",
            marginBottom: "2rem",
            color: "rgb(236 243 255)",
          }}
        >
          Contact Sections
        </h2>

        <div
          style={{
            display: "flex",
            gap: "5rem",
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          {sections.map((section) => (
            <div
              key={section}
              style={{ position: "relative", textAlign: "center" }}
              ref={openDropdown === section ? dropdownRef : null}
            >
              <button
                onClick={() => toggleDropdown(section)}
                style={{
                  padding: "0.75rem 2rem",
                  background: "rgb(62 60 145)",
                  color: "white",
                  border: "none",
                  borderRadius: "0.75rem",
                  fontSize: "1rem",
                  fontWeight: "bold",
                  cursor: "pointer",
                  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                }}
              >
                {section}
              </button>

              {openDropdown === section && (
                <div
                  style={{
                    position: "absolute",
                    top: "3.5rem",
                    left: section === "Sales" ? "100%" : "50%",
                    transform: "translateX(-50%)",
                    background: "#ffffff",
                    border: "1px solid #cbd5e1",
                    borderRadius: "0.75rem",
                    padding: "1rem",
                    zIndex: 100,
                    width: "250px",
                    boxShadow: "0 8px 16px rgba(0,0,0,0.1)",
                  }}
                >
                  <input
                    type="tel"
                    placeholder="Enter phone number"
                    value={phoneNumbers[section]}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (/^\d{0,10}$/.test(value)) {
                        handleInputChange(section, value);
                      }
                    }}
                    style={{
                      width: "100%",
                      padding: "0.5rem",
                      borderRadius: "0.5rem",
                      border: "1px solid #94a3b8",
                      marginBottom: "0.75rem",
                      fontSize: "1rem",
                    }}
                  />

                  <button
                    onClick={() => handleCall(section)}
                    style={{
                      width: "100%",
                      padding: "0.6rem",
                      background: "rgb(109 183 158)",
                      color: "#fff",
                      fontWeight: "bold",
                      border: "none",
                      borderRadius: "0.5rem",
                      fontSize: "1rem",
                      cursor: "pointer",
                    }}
                  >
                    📞 Call
                  </button>
                </div>
              )}
            </div>
          ))}

          {/* Corrected this div */}
          <div
  style={{
    minHeight: "500px",
    minWidth: "500px",
    backgroundColor: "#afafa3",
    padding: "10px",
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
    marginLeft: "auto",
    marginRight: "auto",
    marginTop: "40px",
    borderRadius: "12px",
    
  }}
>
  {/* Transcribe Box */}
  <div
    style={{
      backgroundColor: "rgb(55, 65, 81)",
      padding: "10px",
      borderRadius: "10px",
    }}
  >
    <h4
      style={{
        textAlign: "center",
        color: "white",
        marginBottom: "10px",
      }}
    >
      Transcribe
    </h4>

    <div
      style={{
        backgroundColor: "white",
        minHeight: "200px",
        width: "100%",
        borderRadius: "8px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
        padding: "1rem",
      }}
    >
      Transcribe data here
    </div>
  </div>

  {/* Audit Box */}
  <div
    style={{
      backgroundColor: "rgb(55, 65, 81)",
      padding: "10px",
      borderRadius: "10px",
    }}
  >
    <h4
      style={{
        textAlign: "center",
        color: "white",
        marginBottom: "10px",
      }}
    >
      Audit
    </h4>

    <div
      style={{
        backgroundColor: "white",
        minHeight: "200px",
        width: "100%",
        borderRadius: "8px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
        padding: "1rem",
      }}
    >
      Audit data here
    </div>
  </div>
</div>

        </div>
      </div>
    </Layout>
  );
};

export default Calling;

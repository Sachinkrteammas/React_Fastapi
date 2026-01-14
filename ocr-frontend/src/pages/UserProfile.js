import React, { useEffect, useState } from "react";
import axios from "axios";
import Layout from "../layout";
import { BASE_URL } from "../components/config";

const UserProfile = () => {
  const [connectionUri, setConnectionUri] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState(""); // success | error

  /* ---------------- FETCH CURRENT VALUE ---------------- */
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/users/profile`, {
          withCredentials: true,
        });
        setConnectionUri(res.data.connection_uri || "");
      } catch (err) {
        setStatus("error");
        setMessage("Failed to load connection URI");
      }
    };

    fetchProfile();
  }, []);

  /* ---------------- UPDATE CONNECTION URI ---------------- */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setStatus("");

    try {
      await axios.put(
        `${BASE_URL}/users/connection-uri`,
        { connection_uri: connectionUri },
        { withCredentials: true }
      );

      setStatus("success");
      setMessage("Connection URI updated successfully");
    } catch (err) {
      setStatus("error");
      setMessage("Failed to update connection URI");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container-fluid py-3">

        {/* HEADER */}
        <div className="mb-4">
          <h3 className="fw-bold">User Profile</h3>
          <p className="text-muted">
            Manage your connection configuration
          </p>
        </div>

        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-6">

            <div className="shadow-sm">
              <div className="card-header fw-semibold">
                Connection Settings
              </div>

              <div className="card-body">
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">
                      Connection URI
                    </label>
                    <textarea
                      className="form-control"
                      rows={4}
                      placeholder="wss://example.com:1234"
                      value={connectionUri}
                      onChange={(e) => setConnectionUri(e.target.value)}
                      required
                    />
                    <div className="form-text">
                      Used to connect with your WebSocket or AI service
                    </div>
                  </div>

                  {/* STATUS MESSAGE */}
                  {message && (
                    <div
                      className={`alert ${
                        status === "success"
                          ? "alert-success"
                          : "alert-danger"
                      } py-2`}
                    >
                      {message}
                    </div>
                  )}

                  <div className="d-flex justify-content-end">
                    <button
                      type="submit"
                      className="btn btn-primary px-4"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span
                            className="spinner-border spinner-border-sm me-2"
                            role="status"
                          />
                          Saving...
                        </>
                      ) : (
                        "Save Changes"
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>

          </div>
        </div>

      </div>
    </Layout>
  );
};

export default UserProfile;

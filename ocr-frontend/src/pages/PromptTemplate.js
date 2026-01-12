import React, { useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL } from "../components/config";
import Layout from "../layout";
import "../layout.css";

const API_URL = `${BASE_URL}/prompt-schema`;

const PromptTemplate = () => {
  const [schemas, setSchemas] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const client_id = localStorage.getItem("client_id"); // ✅ client_id

  const [form, setForm] = useState({
    label: "",
    data_type: "string",
    boolean_options: "",
    description: "",
  });

  useEffect(() => {
    fetchSchemas();
  }, []);

  const fetchSchemas = async () => {
    const res = await axios.get(API_URL, {
      params: { client_id },
    });
    setSchemas(res.data);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "data_type" && value !== "boolean"
        ? { boolean_options: "" }
        : {}),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.label) {
      alert("Label is required");
      return;
    }

    if (form.data_type === "boolean" && !form.boolean_options) {
      alert("Enter comma-separated options (e.g. yes,no)");
      return;
    }

    const payload = {
      ...form,
      client_id, // ✅ always send client_id
    };

    if (editingId) {
      await axios.put(`${API_URL}/${editingId}`, payload);
    } else {
      await axios.post(API_URL, payload);
    }

    resetForm();
    fetchSchemas();
  };

  const handleEdit = (row) => {
    setForm({
      label: row.label,
      data_type: row.data_type,
      boolean_options: row.boolean_options || "",
      description: row.description || "",
    });
    setEditingId(row.id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this field?")) return;
    await axios.delete(`${API_URL}/${id}`);
    fetchSchemas();
  };

  const resetForm = () => {
    setForm({
      label: "",
      data_type: "string",
      boolean_options: "",
      description: "",
    });
    setEditingId(null);
  };

  return (
    <Layout>
      <div className="container-fluid px-2 py-2">

        {/* ---------- HEADER ---------- */}
        <div className="mb-4">
          <h3 className="fw-bold mb-1">Prompt Template Schema</h3>
          <p className="text-muted">
            Configure client-specific dynamic prompt fields
          </p>
        </div>

        {/* ---------- FORM ---------- */}
        <div className="shadow-sm mb-4">
          <div className="card-header bg-light fw-semibold">
            {editingId ? "Edit Field" : "Add New Field"}
          </div>

          <div className="card-body">
            <form className="row g-3" onSubmit={handleSubmit}>

              <div className="col-md-4">
                <label className="form-label">Label *</label>
                <input
                  type="text"
                  name="label"
                  value={form.label}
                  onChange={handleChange}
                  className="form-control"
                />
              </div>

              <div className="col-md-3">
                <label className="form-label">Data Type</label>
                <select
                  name="data_type"
                  value={form.data_type}
                  onChange={handleChange}
                  className="form-select"
                >
                  <option value="string">String</option>
                  <option value="number">Number</option>
                  <option value="boolean">Boolean</option>
                </select>
              </div>

              {form.data_type === "boolean" && (
                <div className="col-md-4">
                  <label className="form-label">
                    Boolean Options (comma separated)
                  </label>
                  <input
                    type="text"
                    name="boolean_options"
                    value={form.boolean_options}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="yes,no / true,false / 1,0"
                  />
                </div>
              )}

              <div className="col-md-6">
                <label className="form-label">Description</label>
                <input
                  type="text"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="Explain what this field represents"
                />
              </div>

              <div className="col-md-3 d-flex align-items-end gap-2">
                <button className="btn btn-primary w-100">
                  {editingId ? "Update" : "Add"}
                </button>
                {editingId && (
                  <button
                    type="button"
                    className="btn btn-outline-secondary w-100"
                    onClick={resetForm}
                  >
                    Cancel
                  </button>
                )}
              </div>

            </form>
          </div>
        </div>

        {/* ---------- TABLE ---------- */}
        <div className="shadow-sm">
          <div className="card-header bg-light fw-semibold">
            Existing Prompt Fields
          </div>

          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-dark">
                <tr>
                  <th>Label</th>
                  <th>Type</th>
                  <th>Options</th>
                  <th>Description</th>
                  <th style={{ width: 160 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {schemas.length ? (
                  schemas.map((row) => (
                    <tr key={row.id}>
                      <td className="fw-semibold">{row.label}</td>
                      <td>
                        <span className="badge bg-secondary">
                          {row.data_type}
                        </span>
                      </td>
                      <td>
                        {row.data_type === "boolean" ? (
                          <span className="badge bg-info">
                            {row.boolean_options}
                          </span>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td>{row.description || "-"}</td>
                      <td>
                        <button
                          className="btn btn-sm btn-outline-warning me-2"
                          onClick={() => handleEdit(row)}
                        >
                          ✏ Edit
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDelete(row.id)}
                        >
                          🗑 Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center text-muted py-4">
                      No prompt schema found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </Layout>
  );
};

export default PromptTemplate;

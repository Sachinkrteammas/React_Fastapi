import React, { useEffect, useState } from "react";
import axios from "axios";
import Layout from "../layout";
import { BASE_URL } from "../components/config";

const clientId = localStorage.getItem("client_id");

const buildSectionTree = (sections) => {
  const map = {};
  const roots = [];

  sections.forEach((s) => {
    map[s.id] = { ...s, children: [] };
  });

  sections.forEach((s) => {
    if (s.parent_section_id) {
      map[s.parent_section_id]?.children.push(map[s.id]);
    } else {
      roots.push(map[s.id]);
    }
  });

  return roots;
};


const PromptSchemaManager = () => {
  const [sections, setSections] = useState([]);
  const [fields, setFields] = useState([]);
  const [options, setOptions] = useState([]);
  const [expandedSection, setExpandedSection] = useState(null);

  const [editingField, setEditingField] = useState(null);
  const [editingOption, setEditingOption] = useState(null);


  const [promptPreview, setPromptPreview] = useState("");

  const [selectedField, setSelectedField] = useState(null);
  const [newOption, setNewOption] = useState({
      option_value: "",
      option_label: ""
  });


  const [newField, setNewField] = useState({
    section_id: "",
    field_key: "",
    label: "",
    data_type: "string",
    description: "",
    required: false
  });

  const [newSection, setNewSection] = useState({
      section_key: "",
      title: "",
      description: "",
      parent_section_id: null,
      sort_order: 0
  });


  useEffect(() => {
    loadSections();
  }, []);

  const loadSections = async () => {
    const res = await axios.get(`${BASE_URL}/prompt-sections/${clientId}`);
    setSections(res.data);
  };

  const loadFields = async (sectionId) => {
    setExpandedSection(sectionId);
    setSelectedField(null);
    setOptions([]);

    setNewSection((prev) => ({
        ...prev,
        parent_section_id: sectionId
    }));

    const res = await axios.get(
      `${BASE_URL}/prompt-fields/${clientId}/${sectionId}`
    );
    setFields(res.data);
  };

  const loadOptions = async (fieldId) => {
    const res = await axios.get(
      `${BASE_URL}/prompt-field-options/${fieldId}`
    );
    setOptions(res.data);
  };

  const handleFieldChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewField((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const createField = async () => {
    if (!newField.section_id || !newField.field_key || !newField.label) {
      alert("Required fields missing");
      return;
    }

    await axios.post(`${BASE_URL}/prompt-fields`, {
      client_id: clientId,
      ...newField
    });

    setNewField({
      section_id: "",
      field_key: "",
      label: "",
      data_type: "string",
      description: "",
      required: false
    });

    loadFields(newField.section_id);
  };


  const createSection = async () => {
      if (!newSection.section_key) {
        alert("Section key is required");
        return;
      }

      await axios.post(`${BASE_URL}/prompt-sections`, {
        client_id: clientId,
        ...newSection
      });

      setNewSection({
        section_key: "",
        title: "",
        description: "",
        parent_section_id: null,
        sort_order: 0
      });

      loadSections();
  };

  const createOption = async () => {
      if (!selectedField || !newOption.option_value) return;

      await axios.post(`${BASE_URL}/prompt-field-options`, {
        field_id: selectedField.id,
        ...newOption
      });

      setNewOption({ option_value: "", option_label: "" });
      loadOptions(selectedField.id);
  };


  const loadPromptPreview = async () => {
      const res = await axios.get(
        `${BASE_URL}/prompt-preview/${clientId}`
      );
      setPromptPreview(res.data.preview);
  };


  const updateField = async () => {
      if (!editingField) return;

      await axios.put(
        `${BASE_URL}/prompt-fields/${editingField.id}`,
        editingField
      );

      setEditingField(null);
      loadFields(expandedSection);
  };


  const deleteField = async (fieldId) => {
      if (!window.confirm("Delete this field? Options will also be deleted.")) return;

      await axios.delete(`${BASE_URL}/prompt-fields/${fieldId}`);
      loadFields(expandedSection);
  };


  const updateOption = async () => {
      if (!editingOption) return;

      await axios.put(
        `${BASE_URL}/prompt-field-options/${editingOption.id}`,
        editingOption
      );

      setEditingOption(null);
      loadOptions(selectedField.id);
  };


  const deleteOption = async (optionId) => {
      if (!window.confirm("Delete this option?")) return;

      await axios.delete(`${BASE_URL}/prompt-field-options/${optionId}`);
      loadOptions(selectedField.id);
  };


  const savePromptConfig = async () => {
      try {
        await axios.post(
          `${BASE_URL}/prompt-configs/${clientId}`
        );

        alert("Prompt TOML saved successfully");
      } catch (err) {
        console.error(err);
        alert("Failed to save prompt");
      }
  };


  const SectionNode = ({
      node,
      level = 0,
      expandedSection,
      onSelect
  }) => {
      const [open, setOpen] = useState(true);
      const hasChildren = node.children.length > 0;

      return (
        <>
          <li
            className={`list-group-item d-flex align-items-center ${
              expandedSection === node.id ? "bg-light" : ""
            }`}
            style={{
              paddingLeft: `${level * 20 + 12}px`,
              cursor: "pointer"
            }}
            onClick={() => onSelect(node.id)}
          >
            {hasChildren && (
              <span
                className="me-2 text-muted"
                onClick={(e) => {
                  e.stopPropagation();
                  setOpen(!open);
                }}
              >
                {open ? "▾" : "▸"}
              </span>
            )}

            <strong>{node.section_key}</strong>

            {node.title && (
              <span className="text-muted small ms-2">
                ({node.title})
              </span>
            )}
          </li>

          {open &&
            node.children.map((child) => (
              <SectionNode
                key={child.id}
                node={child}
                level={level + 1}
                expandedSection={expandedSection}
                onSelect={onSelect}
              />
            ))}
        </>
      );
  };


  return (
    <Layout>
      <div className="container-fluid py-3">

        {/* HEADER */}
        <div className="mb-4">
          <h3 className="fw-bold">Dynamic Prompt Schema</h3>
          <p className="text-muted">
            Configure AI prompts per client dynamically
          </p>
        </div>

        {/* SECTION LIST */}
        <div className="row">

          {/* LEFT: Sections */}
          <div className="col-md-4">

          {/* ADD SECTION */}
          <div className="shadow-sm mb-3">
            <div className="card-header fw-semibold">
              Add Section
            </div>
            <div className="card-body">
              <input
                className="form-control mb-2"
                placeholder="section_key (call_quality)"
                value={newSection.section_key}
                onChange={(e) =>
                  setNewSection({ ...newSection, section_key: e.target.value })
                }
              />

              <input
                className="form-control mb-2"
                placeholder="Title"
                value={newSection.title}
                onChange={(e) =>
                  setNewSection({ ...newSection, title: e.target.value })
                }
              />

              <textarea
                className="form-control mb-2"
                placeholder="Description"
                value={newSection.description}
                onChange={(e) =>
                  setNewSection({ ...newSection, description: e.target.value })
                }
              />

              <select
                  className="form-select mb-2"
                  value={newSection.parent_section_id || ""}
                  onChange={(e) =>
                    setNewSection({
                      ...newSection,
                      parent_section_id: e.target.value
                        ? Number(e.target.value)
                        : null
                    })
                  }
              >
                  <option value="">Root Section</option>
                  {sections.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.section_key}
                    </option>
                  ))}
              </select>


              <button
                className="btn btn-primary w-100"
                onClick={createSection}
              >
                Add Section
              </button>
            </div>
          </div>

          {/* SECTION LIST */}
          <div className="shadow-sm">
            <div className="card-header fw-semibold">
              Prompt Sections
            </div>
            <ul className="list-group list-group-flush">
              {buildSectionTree(sections).map((root) => (
                <SectionNode
                  key={root.id}
                  node={root}
                  expandedSection={expandedSection}
                  onSelect={loadFields}
                />
              ))}
            </ul>
          </div>

        </div>


          {/* RIGHT: Fields */}
          <div className="col-md-8">

            {/* ADD FIELD */}
            <div className="shadow-sm mb-3">
              <div className="card-header fw-semibold">
                Add Prompt Field
              </div>

              <div className="card-body row g-2">
                <div className="col-md-4">
                  <label className="form-label">Section</label>
                  <select
                    className="form-select"
                    name="section_id"
                    value={newField.section_id}
                    onChange={handleFieldChange}
                  >
                    <option value="">Select</option>
                    {sections.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.section_key}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-md-4">
                  <label className="form-label">Field Key</label>
                  <input
                    className="form-control"
                    name="field_key"
                    value={newField.field_key}
                    onChange={handleFieldChange}
                    placeholder="whisper_initial_prompt"
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label">Label</label>
                  <input
                    className="form-control"
                    name="label"
                    value={newField.label}
                    onChange={handleFieldChange}
                  />
                </div>

                <div className="col-md-3">
                  <label className="form-label">Type</label>
                  <select
                    className="form-select"
                    name="data_type"
                    value={newField.data_type}
                    onChange={handleFieldChange}
                  >
                    <option value="string">String</option>
                    <option value="text">Text</option>
                    <option value="number">Number</option>
                    <option value="boolean">Boolean</option>
                    <option value="list">List</option>
                    <option value="json">JSON</option>
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-control"
                    name="description"
                    value={newField.description}
                    onChange={handleFieldChange}
                  />
                </div>

                <div className="col-md-3 d-flex align-items-center">
                  <div className="form-check mt-4">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      name="required"
                      checked={newField.required}
                      onChange={handleFieldChange}
                    />
                    <label className="form-check-label">
                      Required
                    </label>
                  </div>
                </div>

                <div className="col-md-3">
                  <button
                    className="btn btn-primary w-100 mt-4"
                    onClick={createField}
                  >
                    Add Field
                  </button>
                </div>
              </div>
            </div>

            {/* FIELD LIST */}
            <div className="shadow-sm">
              <div className="card-header fw-semibold">
                Fields
              </div>

              <table className="table table-hover mb-0">
                <thead className="table-dark">
                  <tr>
                    <th>Key</th>
                    <th>Type</th>
                    <th>Required</th>
                    <th>Description</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {fields.length ? (
                    fields.map((f) => (
                      <tr
                          key={f.id}
                          style={{ cursor: "pointer" }}
                          onClick={() => {
                            if (["list", "boolean"].includes(f.data_type)) {
                              setSelectedField(f);
                              loadOptions(f.id);
                            } else {
                              setSelectedField(null);
                              setOptions([]);
                            }
                          }}
                      >
                          <td>
                            {editingField?.id === f.id ? (
                              <input
                                className="form-control form-control-sm"
                                value={editingField.field_key}
                                onChange={(e) =>
                                  setEditingField({ ...editingField, field_key: e.target.value })
                                }
                              />
                            ) : (
                              f.field_key
                            )}
                          </td>

                          <td>
                            <span className="badge bg-secondary">{f.data_type}</span>
                          </td>

                          <td>
                            {f.required ? (
                              <span className="badge bg-success">Yes</span>
                            ) : (
                              <span className="badge bg-secondary">No</span>
                            )}
                          </td>

                          <td>
                            {editingField?.id === f.id ? (
                              <textarea
                                className="form-control form-control-sm"
                                value={editingField.description || ""}
                                onChange={(e) =>
                                  setEditingField({ ...editingField, description: e.target.value })
                                }
                              />
                            ) : (
                              f.description || "-"
                            )}
                          </td>

                          <td className="text-end">
                            {editingField?.id === f.id ? (
                              <>
                                <button
                                  className="btn btn-sm btn-success me-1"
                                  onClick={updateField}
                                >
                                  Save
                                </button>
                                <button
                                  className="btn btn-sm btn-secondary"
                                  onClick={() => setEditingField(null)}
                                >
                                  Cancel
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  className="btn btn-sm btn-outline-primary me-1"
                                  onClick={() => setEditingField(f)}
                                >
                                  Edit
                                </button>
                                <button
                                  className="btn btn-sm btn-outline-danger"
                                  onClick={() => deleteField(f.id)}
                                >
                                  Delete
                                </button>
                              </>
                            )}
                          </td>
                      </tr>

                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="text-center text-muted py-4">
                        Select a section to view fields
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              {selectedField && (
                  <div className="shadow-sm mt-3">
                    <div className="card-header fw-semibold">
                      Options – {selectedField.field_key}
                    </div>

                    <div className="card-body">
                      <div className="row g-2 mb-3">
                        <div className="col-md-4">
                          <input
                            className="form-control"
                            placeholder="value"
                            value={newOption.option_value}
                            onChange={(e) =>
                              setNewOption({ ...newOption, option_value: e.target.value })
                            }
                          />
                        </div>

                        <div className="col-md-4">
                          <input
                            className="form-control"
                            placeholder="label (optional)"
                            value={newOption.option_label}
                            onChange={(e) =>
                              setNewOption({ ...newOption, option_label: e.target.value })
                            }
                          />
                        </div>

                        <div className="col-md-4">
                          <button
                            className="btn btn-primary w-100"
                            onClick={createOption}
                          >
                            Add Option
                          </button>
                        </div>
                      </div>

                      <ul className="list-group">
                          {options.map((o) => (
                            <li
                              key={o.id}
                              className="list-group-item d-flex justify-content-between align-items-center"
                            >
                              {editingOption?.id === o.id ? (
                                <>
                                  <input
                                    className="form-control form-control-sm me-2"
                                    value={editingOption.option_value}
                                    onChange={(e) =>
                                      setEditingOption({
                                        ...editingOption,
                                        option_value: e.target.value
                                      })
                                    }
                                  />
                                  <button
                                    className="btn btn-sm btn-success me-1"
                                    onClick={updateOption}
                                  >
                                    Save
                                  </button>
                                  <button
                                    className="btn btn-sm btn-secondary"
                                    onClick={() => setEditingOption(null)}
                                  >
                                    Cancel
                                  </button>
                                </>
                              ) : (
                                <>
                                  <span>{o.option_label || o.option_value}</span>
                                  <div>
                                    <button
                                      className="btn btn-sm btn-outline-primary me-1"
                                      onClick={() => setEditingOption(o)}
                                    >
                                      Edit
                                    </button>
                                    <button
                                      className="btn btn-sm btn-outline-danger"
                                      onClick={() => deleteOption(o.id)}
                                    >
                                      Delete
                                    </button>
                                  </div>
                                </>
                              )}
                            </li>
                          ))}
                      </ul>
                    </div>
                  </div>
              )}



              <div className="shadow-sm mt-4">
                  <div className="card-header fw-semibold d-flex justify-content-between align-items-center">
                      <span>Prompt Preview (TOML)</span>

                      <div>
                        <button
                          className="btn btn-sm btn-outline-primary me-2"
                          onClick={loadPromptPreview}
                        >
                          Refresh
                        </button>

                        <button
                          className="btn btn-sm btn-success"
                          onClick={savePromptConfig}
                        >
                          Save Prompt
                        </button>
                      </div>
                  </div>

                  <div className="card-body">
                    <pre
                      className="bg-dark text-light p-3 rounded small"
                      style={{ maxHeight: 400, overflow: "auto" }}
                    >
                {promptPreview || "# No preview yet"}
                    </pre>
                  </div>
              </div>

            </div>

          </div>
        </div>

      </div>
    </Layout>
  );
};

export default PromptSchemaManager;

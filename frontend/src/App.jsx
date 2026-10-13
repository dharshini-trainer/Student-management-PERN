import { useEffect, useState } from "react";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api/students";

const emptyForm = {
  name: "",
  email: "",
  age: "",
  department: ""
};

function App() {
  const [students, setStudents] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function loadStudents() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(API);

      if (!response.ok) {
        throw new Error("Failed to load student records.");
      }

      const data = await response.json();
      setStudents(data);
    } catch (err) {
      setError(
        "Cannot connect to the backend. Make sure your Express server is running on port 5000."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStudents();
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previousForm) => ({
      ...previousForm,
      [name]: value
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (
      !form.name.trim() ||
      !form.email.trim() ||
      !form.age ||
      !form.department.trim()
    ) {
      setError("Please fill in all fields.");
      return;
    }

    const age = Number(form.age);

    if (!Number.isInteger(age) || age < 1 || age > 120) {
      setError("Age must be a whole number between 1 and 120.");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(
        editingId ? `${API}/${editingId}` : API,
        {
          method: editingId ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            name: form.name.trim(),
            email: form.email.trim(),
            age,
            department: form.department.trim()
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to save student.");
      }

      setForm(emptyForm);
      setEditingId(null);
      setSuccess(
        editingId
          ? "Student updated successfully!"
          : "Student added successfully!"
      );

      await loadStudents();
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  function handleEdit(student) {
    setEditingId(student.id);
    setForm({
      name: student.name,
      email: student.email,
      age: String(student.age),
      department: student.department
    });
    setError("");
    setSuccess("");

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  }

  async function handleDelete(id) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this student?"
    );

    if (!confirmed) {
      return;
    }

    setError("");
    setSuccess("");

    try {
      const response = await fetch(`${API}/${id}`, {
        method: "DELETE"
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete student.");
      }

      if (editingId === id) {
        setEditingId(null);
        setForm(emptyForm);
      }

      setSuccess("Student deleted successfully!");
      await loadStudents();
    } catch (err) {
      setError(err.message || "Unable to delete student.");
    }
  }

  function handleCancel() {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setSuccess("");
  }

  return (
    <div className="app-background min-vh-100 py-4 py-md-5">
      <div className="container">
        <header className="text-center mb-5">
          <div className="display-4 mb-2">🎓</div>
          <h1 className="fw-bold text-primary">
            Student Management System
          </h1>
          <p className="text-secondary mb-0">
            Manage your student records easily
          </p>
        </header>

        {error && (
          <div className="alert alert-danger alert-dismissible" role="alert">
            {error}
            <button
              type="button"
              className="btn-close"
              aria-label="Close"
              onClick={() => setError("")}
            />
          </div>
        )}

        {success && (
          <div className="alert alert-success alert-dismissible" role="alert">
            {success}
            <button
              type="button"
              className="btn-close"
              aria-label="Close"
              onClick={() => setSuccess("")}
            />
          </div>
        )}

        <div className="card shadow-sm border-0 mb-4">
          <div className="card-header bg-primary text-white py-3">
            <h4 className="mb-0">
              {editingId ? "✏️ Edit Student" : "➕ Add New Student"}
            </h4>
          </div>

          <div className="card-body p-4">
            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label htmlFor="name" className="form-label fw-semibold">
                    Full Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    className="form-control"
                    name="name"
                    placeholder="Enter student name"
                    value={form.name}
                    onChange={handleChange}
                    maxLength={100}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label htmlFor="email" className="form-label fw-semibold">
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    className="form-control"
                    name="email"
                    placeholder="Enter email address"
                    value={form.email}
                    onChange={handleChange}
                    maxLength={150}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label htmlFor="age" className="form-label fw-semibold">
                    Age
                  </label>
                  <input
                    id="age"
                    type="number"
                    className="form-control"
                    name="age"
                    placeholder="Enter age"
                    min="1"
                    max="120"
                    step="1"
                    value={form.age}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label
                    htmlFor="department"
                    className="form-label fw-semibold"
                  >
                    Department
                  </label>
                  <select
                    id="department"
                    className="form-select"
                    name="department"
                    value={form.department}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Department</option>
                    <option value="CSE">Computer Science (CSE)</option>
                    <option value="CSBS">
                      Computer Science and Business Systems (CSBS)
                    </option>
                    <option value="IT">Information Technology (IT)</option>
                    <option value="ECE">
                      Electronics and Communication (ECE)
                    </option>
                    <option value="EEE">
                      Electrical and Electronics (EEE)
                    </option>
                    <option value="Mechanical">Mechanical</option>
                    <option value="Civil">Civil</option>
                    <option value="AI & DS">AI & Data Science</option>
                  </select>
                </div>
              </div>

              <div className="d-flex flex-wrap gap-2 mt-4">
                <button
                  type="submit"
                  className="btn btn-primary px-4"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        aria-hidden="true"
                      />
                      Saving...
                    </>
                  ) : editingId ? (
                    "Update Student"
                  ) : (
                    "Add Student"
                  )}
                </button>

                {editingId && (
                  <button
                    type="button"
                    className="btn btn-outline-secondary px-4"
                    onClick={handleCancel}
                    disabled={saving}
                  >
                    Cancel
                  </button>
                )}

                <button
                  type="button"
                  className="btn btn-outline-primary"
                  onClick={loadStudents}
                  disabled={loading}
                >
                  Refresh Records
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="card shadow-sm border-0">
          <div className="card-header bg-white py-3">
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-2">
              <h4 className="mb-0">📋 Student Records</h4>
              <span className="badge rounded-pill text-bg-primary fs-6">
                Total: {students.length}
              </span>
            </div>
          </div>

          <div className="card-body p-0">
            {loading ? (
              <div className="text-center py-5">
                <div
                  className="spinner-border text-primary"
                  role="status"
                >
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="text-secondary mt-2 mb-0">
                  Loading student records...
                </p>
              </div>
            ) : students.length === 0 ? (
              <div className="text-center py-5 px-3">
                <div className="display-5 mb-3">📚</div>
                <h5>No Students Found</h5>
                <p className="text-secondary mb-0">
                  Add your first student using the form above.
                </p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th className="px-3">ID</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Age</th>
                      <th>Department</th>
                      <th className="text-center px-3">Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {students.map((student) => (
                      <tr key={student.id}>
                        <td className="px-3 fw-semibold">{student.id}</td>
                        <td>{student.name}</td>
                        <td>{student.email}</td>
                        <td>{student.age}</td>
                        <td>
                          <span className="badge text-bg-light border">
                            {student.department}
                          </span>
                        </td>
                        <td className="px-3">
                          <div className="d-flex justify-content-center gap-2">
                            <button
                              type="button"
                              className="btn btn-sm btn-warning"
                              onClick={() => handleEdit(student)}
                              aria-label={`Edit ${student.name}`}
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              className="btn btn-sm btn-danger"
                              onClick={() => handleDelete(student.id)}
                              aria-label={`Delete ${student.name}`}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="card-footer bg-white text-secondary small">
            Student records are stored in your PostgreSQL database.
          </div>
        </div>

        <footer className="text-center text-secondary mt-4 small">
          Student Management System · Built with React, Bootstrap, Express
          and PostgreSQL
        </footer>
      </div>
    </div>
  );
}

export default App;

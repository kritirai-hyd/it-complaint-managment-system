"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import Image from "next/image";
import {
  FiHome,
  FiUsers,
  FiSettings,
  FiAlertCircle,
  FiCheckCircle,
  FiClock,
  FiRefreshCw,
} from "react-icons/fi";
import "./admin.css";

const AdminDashboard = () => {
  const { data: session, status } = useSession();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assignments, setAssignments] = useState({});
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");
  const [expandedRow, setExpandedRow] = useState(null);

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/complaint?admin=true");
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to load complaints");
      setComplaints(data.complaints || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const engineers = [
      { name: "Couponszone", email: "info@couponszone.coin" },
    { name: "Anada Rai", email: "anada@gmail.com" },
    { name: "Suraj Bhardwaj", email: "suraj@example.com" },
    { name: "Vikash Gupta", email: "vikash@example.com" },
    { name: "Tek Chand", email: "tek@example.com" },
    { name: "Abhishek Shah", email: "abhishek@example.com" },
    { name: "Prashanto", email: "prashanto@example.com" },
    { name: "Aadarsh Dubey", email: "aadarsh@example.com" },
    { name: "Gaurav Choudary", email: "gaurav@example.com" },
    { name: "Rahul Kumar", email: "rahul@example.com" },
  ];

  const toggleExpand = (cid) => {
    setExpandedRow((prev) => (prev === cid ? null : cid));
  };

  const handleEngineerSelect = (e, complaintId) => {
    const [name, email] = e.target.value.split("|");
    setAssignments((prev) => ({
      ...prev,
      [complaintId]: { name, email },
    }));
  };

  const handleAssign = async (mongoId, complaintId) => {
    const assignData = assignments[complaintId];
    if (!assignData?.name || !assignData?.email) {
      alert("⚠️ Please enter both engineer name and email.");
      return;
    }
    try {
      const res = await fetch(`/api/complaint/${mongoId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "In Progress",
          assignedTo: assignData.name.trim(),
          assignedToEmail: assignData.email.trim().toLowerCase(),
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Assignment failed");
      }
      alert("✅ Complaint assigned successfully");
      fetchComplaints();
    } catch (err) {
      console.error("Assignment Error:", err);
      alert("❌ " + err.message);
    }
  };

  const getStatusBadge = (status) => {
    switch (status.toLowerCase()) {
      case "pending":
        return (
          <span className="status-badge status-pending">
            <FiClock /> Pending
          </span>
        );
      case "in progress":
        return (
          <span className="status-badge status-in-progress">
            <FiRefreshCw /> In Progress
          </span>
        );
      case "resolved":
        return (
          <span className="status-badge status-resolved">
            <FiCheckCircle /> Resolved
          </span>
        );
      default:
        return <span className="status-badge">{status}</span>;
    }
  };

  const filteredComplaints = complaints.filter((complaint) => {
    const statusMatch =
      activeTab === "all" ||
      complaint.status.toLowerCase() === activeTab.toLowerCase();
    const searchMatch =
      searchTerm === "" ||
      Object.values(complaint).some(
        (value) =>
          value &&
          value.toString().toLowerCase().includes(searchTerm.toLowerCase())
      );
    return statusMatch && searchMatch;
  });

  if (status === "loading") {
    return (
      <div className="loading-overlay">
        <div className="spinner"></div>
        <p>Loading session...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="unauthorized">
        <h2>Access Denied</h2>
        <p>You must be logged in to view this page.</p>
        <Link href="/login" className="btn btn-primary">
          Go to Login
        </Link>
      </div>
    );
  }

  return (
    <div className="a-dashboard">
      {/* Sidebar */}
      <aside className="a-sidebar">
        <div className="logo">
          <span>Admin</span>
        </div>
        <nav>
          <Link href="/admin" className="active">
            <i><FiHome /></i><span>Dashboard</span>
          </Link>
          <Link href="/admin/login">
            <i><FiUsers /></i><span>Manager</span>
          </Link>
          <Link href="/admin/login">
            <i><FiUsers /></i><span>Engineer Management</span>
          </Link>
        </nav>
        <div className="sidebar-footer">
          <div className="user-profile">
            {session.user.image ? (
              <Image
                src={session.user.image}
                width={40}
                height={40}
                alt="User"
                className="user-avatar"
              />
            ) : (
              <div className="user-avatar-placeholder">👤</div>
            )}
            <div className="user-details">
              <strong>{session.user.name}</strong>
              <span>Admin</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main">
        <header className="header">
          <h1>All Complaints</h1>
          <div className="header-actions">
            <div className="search-bar">
              <input
                type="text"
                placeholder="Search complaints..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button className="search-btn">
                <svg width="16" height="16" viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </button>
            </div>
            <div className="user-info">
              <span>Welcome back, <strong>{session.user.name}</strong></span>
            </div>
          </div>
        </header>

        <div className="content-header">
          <h2>Complaints Overview</h2>
          <div className="tabs">
            {["all", "pending", "in progress", "resolved"].map((tab) => (
              <button
                key={tab}
                className={activeTab === tab ? "active" : ""}
                onClick={() => setActiveTab(tab)}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="stats-cards">
          <div className="stat-card"><h3>Total Complaints</h3><p>{complaints.length}</p></div>
          <div className="stat-card"><h3>Pending</h3><p>{complaints.filter((c) => c.status === "Pending").length}</p></div>
          <div className="stat-card"><h3>In Progress</h3><p>{complaints.filter((c) => c.status === "In Progress").length}</p></div>
          <div className="stat-card"><h3>Resolved</h3><p>{complaints.filter((c) => c.status === "Resolved").length}</p></div>
        </div>

        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading complaints...</p>
          </div>
        ) : filteredComplaints.length === 0 ? (
          <div className="empty-state">
            <FiAlertCircle size={48} />
            <h3>No complaints found</h3>
            <p>There are currently no complaints matching your criteria.</p>
            <button onClick={fetchComplaints} className="btn btn-primary">
              <FiRefreshCw /> Refresh
            </button>
          </div>
        ) : (
          <div className="complaint-table-container">
            <div className="complaint-table-wrapper">
              <table className="complaint-table">
                <thead>
                  <tr>
                    <th>Complaint ID</th>
                    <th>Customer</th>
                    <th>Title</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Assigned To</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredComplaints.map((complaint) => {
                    const id = complaint._id;
                    const compId = complaint.complaintId || id;
                    const assignment = {
                      name: assignments[compId]?.name || "",
                      email: assignments[compId]?.email || "",
                    };
                    if (
                      complaint.status === "Resolved" ||
                      complaint.status === "In Progress"
                    ) {
                      return (
                        <tr key={id}>
                          <td className="font-mono">Complaint ID: {compId}</td>
                          <td>
                            <div className="customer-cell">
                              <strong>{complaint.name}</strong>
                              <span>{complaint.phone || "—"}</span>
                            </div>
                          </td>
                          <td>{complaint.title || "—"}</td>
                          <td>{complaint.complaintType || "—"}</td>
                          <td>{getStatusBadge(complaint.status)}</td>
                          <td>{complaint.assignedTo || "—"}</td>
                          <td>—</td>
                        </tr>
                      );
                    }
                    return (
                      <React.Fragment key={id}>
                        <tr>
                          <td className="font-mono">Complaint ID: {compId}</td>
                          <td>
                            <div className="customer-cell">
                              <strong>{complaint.name}</strong>
                              <span>{complaint.phone || "—"}</span>
                            </div>
                          </td>
                          <td>{complaint.title || "—"}</td>
                          <td>{complaint.complaintType || "—"}</td>
                          <td>{getStatusBadge(complaint.status)}</td>
                          <td>{complaint.assignedTo || "Unassigned"}</td>
                          <td>
                            <div className="assignment-form">
                              <select
                                value={
                                  assignment.name && assignment.email
                                    ? `${assignment.name}|${assignment.email}`
                                    : ""
                                }
                                onChange={(e) =>
                                  handleEngineerSelect(e, compId)
                                }
                                className="form-select"
                              >
                                <option value="" hidden>Select Engineer</option>
                                {engineers.map((eng) => (
                                  <option
                                    key={eng.email}
                                    value={`${eng.name}|${eng.email}`}
                                  >
                                    {eng.name}
                                  </option>
                                ))}
                              </select>
                              <button
                                onClick={() => handleAssign(id, compId)}
                                className="btn btn-primary btn-sm"
                                disabled={!assignment.name || !assignment.email}
                              >
                                Assign
                              </button>
                              <button
                                onClick={() => toggleExpand(compId)}
                                className="btn btn-primary btn-sm"
                                style={{ backgroundColor: "#5da827ff" }}
                              >
                                {expandedRow === compId
                                  ? "Hide Details"
                                  : "View Details"}
                              </button>
                            </div>
                          </td>
                        </tr>
                        {expandedRow === compId && (
                          <tr className="bg-gray-100">
                            <td colSpan={7} className="p-4">
                              <strong>Description:</strong>{" "}
                              {complaint.description || "—"}
                              <br />
                              <br />
                              <strong>Attachments:</strong>{" "}
                              {complaint.attachments &&
                              complaint.attachments.length > 0 ? (
                                <ul>
                                  {complaint.attachments.map((file) => (
                                    <li key={file._id}>
                                      <a
                                        href={file.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                      >
                                        {file.name}
                                      </a>
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                "—"
                              )}
                              <br />
                              <br />
                              <strong>Company Address:</strong>{" "}
                              {complaint.companyAddress || "—"}
                              <br />
                              <br />
                              <strong>Location:</strong>{" "}
                              {complaint.location || "—"}
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;

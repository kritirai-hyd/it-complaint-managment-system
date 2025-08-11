"use client";
import { FiHome, FiUsers } from "react-icons/fi";
import React, { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import "./Engineer.css";
import Link from "next/link";
import Image from "next/image";

const EngineerDashboard = () => {
  const { data: session, status } = useSession();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submittingId, setSubmittingId] = useState(null);
  const [expandedComplaint, setExpandedComplaint] = useState(null);

  const fetchComplaints = useCallback(async (engineerName) => {
    if (!engineerName) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/complaint/engineer?name=${encodeURIComponent(engineerName)}`);
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to fetch complaints.");
      setComplaints(data.complaints || []);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const engineerName = session?.user?.name?.trim();
    if (engineerName) {
      fetchComplaints(engineerName);
    }
  }, [session, fetchComplaints]);

  const handleAction = async (complaintId, action, engineerMessage) => {
    if (!complaintId || isNaN(complaintId)) return alert("Invalid complaint ID.");
    if (!engineerMessage?.trim()) return alert("Please enter a message.");

    setSubmittingId(complaintId);
    try {
      const res = await fetch(`/api/complaint/resolve-reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: complaintId,
          status: action === "resolve" ? "Resolved" : "Rejected",
          engineerMessage,
        }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Failed to update complaint.");

      alert(`Complaint ${action === "resolve" ? "resolved" : "rejected"} successfully.`);
      fetchComplaints(session.user.name.trim());
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setSubmittingId(null);
      setExpandedComplaint(null);
    }
  };

  const toggleExpandComplaint = (id) => {
    setExpandedComplaint(expandedComplaint === id ? null : id);
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: "badge-pending",
      "in progress": "badge-in-progress",
      resolved: "badge-resolved",
      rejected: "badge-rejected",
    };
    return statusMap[status?.toLowerCase()] || "badge-default";
  };

  if (status === "loading") return <div className="loading-screen">Loading session...</div>;
  if (!session) return <div className="auth-error">You are not logged in.</div>;

  return (
    <>
      <div className="e-dashboard">
        <aside className="a-sidebar">
          <div className="logo">
            <span>Engineer Dashboard</span>
          </div>

          <nav>
            <Link href="/admin" className="active">
              <i>
                <FiHome />
              </i>
              <span>Dashboard</span>
            </Link>
            <Link href="/admin/login">
              <i>
                <FiUsers />
              </i>
              <span>Manager</span>
            </Link>
            <Link href="/admin/login">
              <i>
                <FiUsers />
              </i>
              <span>Engineer Management</span>
            </Link>
          </nav>

          <div className="sidebar-footer">
            <div className="user-profile">
              {/* Render Image only if valid src exists */}
              {session.user.image ? (
                <Image
                  src={session.user.image}
                  width={40}
                  height={40}
                  alt="User"
                  className="user-avatar"
                />
              ) : (
                <div className="user-avatar-placeholder"> {/* Optional fallback */} </div>
              )}

              <div className="user-details">
                <strong>{session.user.name}</strong>
                <span>Admin</span>
              </div>
            </div>
          </div>
        </aside>

        <div className="engineer-dashboard-container">
          <header className="dashboard-header">
            <h1>Engineer Dashboard</h1>
            <div className="user-info">
              <span className="welcome-message">Welcome, {session.user.name}</span>
              <span className="user-role">Engineer</span>
            </div>
          </header>

          <main className="dashboard-content">
            {loading && (
              <div className="loading-overlay">
                <div className="spinner"></div>
                <p>Loading complaints...</p>
              </div>
            )}

            {error && (
              <div className="error-alert">
                <span className="error-icon">⚠️</span>
                <p>{error}</p>
                <button
                  onClick={() => fetchComplaints(session.user.name.trim())}
                  className="retry-btn"
                >
                  Retry
                </button>
              </div>
            )}

            {!loading && !error && complaints.length === 0 && (
              <div className="empty-state">
                <img
                  src="/empty-state.svg"
                  alt="No complaints"
                  className="empty-state-image"
                />
                <h3>No complaints assigned to you</h3>
                <p>When new complaints are assigned, they'll appear here.</p>
              </div>
            )}

            {!loading && complaints.length > 0 && (
              <div className="complaints-container">
                <div className="complaints-header">
                  <h3>Your Assigned Complaints</h3>
                  <span className="badge-count">{complaints.length} total</span>
                </div>

                <div className="complaints-list">
                  {complaints.map((complaint, index) => {
                    const complaintId = complaint.complaintid ?? index; // fallback key
                    const isInProgress = (complaint.status || "").toLowerCase() === "in progress";
                    const isExpanded = expandedComplaint === complaintId;
                    const isSubmitting = submittingId === complaintId;

                    return (
                      <div
                        key={complaintId}
                        className={`complaint-card ${isExpanded ? "expanded" : ""}`}
                      >
                        <div
                          className="complaint-summary"
                          onClick={() => toggleExpandComplaint(complaintId)}
                        >
                          <div className="complaint-id">ID: {complaint.complaintId ?? "N/A"}</div>
                          <div className="complaint-type">{complaint.complaintType || "—"}</div>
                          
                          <div className={`complaint-status ${getStatusBadge(complaint.status)}`}>
                            {complaint.status || "—"}
                          </div>
                          <div className="complaint-actions">
                            {isInProgress ? (
                              <button
                                className="action-indicator"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleExpandComplaint(complaintId);
                                }}
                              >
                                Action Required
                              </button>
                            ) : (
                              <span className="no-action">View Details</span>
                            )}
                          </div>
                        </div>

                        {isExpanded && (
                          <div className="complaint-details">
                            <div className="detail-row">
                              <span className="detail-label">Name:</span>
                              <span>{complaint.name || "—"}</span>
                            </div>
                            <div className="detail-row">
                              <span className="detail-label">Phone:</span>
                              <span>{complaint.phone || "—"}</span>
                            </div>
                              <div className="detail-row">
                              <span className="detail-label">Title:</span>
                              <span>{complaint.title || "—"}</span>
                            </div>
                            <div className="detail-row">
                              <span className="detail-label">Description:</span>
                              <p className="complaint-description">
                                {complaint.description || "No description provided."}
                              </p>
                            </div>
  <div className="detail-row">
                              <span className="detail-label">Attachments:</span>
                              <div className="complaint-description">
                                {complaint.attachments &&
                              complaint.attachments.length > 0 ? (
                                <ul>
                                  {complaint.attachments.map((file) => (
                                    <li
                                      key={file._id}
                                      style={{ listStyle: "none" }}
                                    >
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
                              )}{" "}
                              </div>
                            </div>

                            {isInProgress && (
                              <form
                                className="action-form"
                                onSubmit={(e) => {
                                  e.preventDefault();
                                  const engineerMessage = e.target.engineerMessage.value.trim();
                                  const action = e.nativeEvent.submitter.value;
                                  handleAction(complaintId, action, engineerMessage);
                                }}
                              >
                                <div className="form-group">
                                  <label htmlFor={`message-${complaintId}`}>
                                    Resolution Notes
                                  </label>
                                  <textarea
                                    id={`message-${complaintId}`}
                                    name="engineerMessage"
                                    placeholder="Enter your response or resolution details..."
                                    required
                                    disabled={isSubmitting}
                                    rows={3}
                                  />
                                </div>

                                <div className="action-buttons">
                                  <button
                                    type="submit"
                                    value="resolve"
                                    className="btn-resolve"
                                    disabled={isSubmitting}
                                  >
                                    {isSubmitting ? (
                                      <span className="btn-loader"></span>
                                    ) : (
                                      "Resolve Complaint"
                                    )}
                                  </button>
                                  <button
                                    type="submit"
                                    value="reject"
                                    className="btn-reject"
                                    disabled={isSubmitting}
                                  >
                                    {isSubmitting ? (
                                      <span className="btn-loader"></span>
                                    ) : (
                                      "Reject Complaint"
                                    )}
                                  </button>
                                </div>
                              </form>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </>
  );
};

export default EngineerDashboard;

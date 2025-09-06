"use client";
import { FiHome, FiUsers, FiMenu, FiX, FiLogOut, FiMessageSquare, FiFile, FiCheckCircle, FiXCircle, FiFilter, FiChevronDown, FiChevronUp } from "react-icons/fi";
import React, { useEffect, useState, useCallback } from "react";
import { useSession, signOut } from "next-auth/react";
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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

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
      const res = await fetch(`/api/complaint/resolve-reject/`, {
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

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
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

  const filteredComplaints = complaints.filter(complaint => {
    if (activeFilter === "all") return true;
    return complaint.status?.toLowerCase() === activeFilter.toLowerCase();
  });

  const statusCounts = {
    all: complaints.length,
    pending: complaints.filter(c => c.status?.toLowerCase() === "pending").length,
    "in progress": complaints.filter(c => c.status?.toLowerCase() === "in progress").length,
    resolved: complaints.filter(c => c.status?.toLowerCase() === "resolved").length,
    rejected: complaints.filter(c => c.status?.toLowerCase() === "rejected").length,
  };

  if (status === "loading") return <div className="loading-screen">Loading session...</div>;
  if (!session) return <div className="auth-error">You are not logged in.</div>;

  return (
    <>
      <div className="e-dashboard">
        {/* Mobile Header */}
        <header className="mobile-header">
          <button className="menu-toggle" onClick={toggleSidebar}>
            {sidebarOpen ? <FiX /> : <FiMenu />}
          </button>
          <h1>Engineer Dashboard</h1>
          <div className="user-avatar-mobile">
            {session.user.image ? (
              <Image
                src={session.user.image}
                width={36}
                height={36}
                alt="User"
                className="avatar-image"
              />
            ) : (
              <div className="avatar-placeholder">
                {session.user.name?.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        </header>

        {/* Overlay for mobile when sidebar is open */}
        {sidebarOpen && <div className="sidebar-overlay" onClick={toggleSidebar}></div>}

        <aside className={`a-sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
          <div className="logo">
            <span>Engineer Dashboard</span>
          </div>

          <nav>
            <Link href="/engineer" className="active" onClick={() => setSidebarOpen(false)}>
              <i>
                <FiHome />
              </i>
              <span>Dashboard</span>
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
                <div className="user-avatar-placeholder">
                  {session.user.name?.charAt(0).toUpperCase()}
                </div>
              )}

              <div className="user-details">
                <strong>{session.user.name}</strong>
                <span>Engineer</span>
              </div>
            </div>
            <button className="logout-btn" onClick={() => signOut()}>
              <FiLogOut />
              <span>Logout</span>
            </button>
          </div>
        </aside>

        <div className="engineer-dashboard-container">
          <header className="dashboard-header">
            <div className="header-content">
              <h1>Welcome, {session.user.name}</h1>
              <p>Here are your assigned complaints</p>
            </div>
            <div className="stats-container">
              <div className="stat-card">
                <span className="stat-number">{complaints.length}</span>
                <span className="stat-label">Total Complaints</span>
              </div>
              <div className="stat-card">
                <span className="stat-number">{statusCounts["in progress"]}</span>
                <span className="stat-label">Require Action</span>
              </div>
            </div>
          </header>

          <main className="dashboard-content">
            {/* Mobile Filter Toggle */}
           

            {/* Status Filters */}
            <div className={`filters-container ${showFilters ? 'filters-visible' : ''}`}>
              <button 
                className={`filter-btn ${activeFilter === "all" ? "active" : ""}`}
                onClick={() => {
                  setActiveFilter("all");
                  setShowFilters(false);
                }}
              >
                All ({statusCounts.all})
              </button>
              <button 
                className={`filter-btn ${activeFilter === "pending" ? "active" : ""}`}
                onClick={() => {
                  setActiveFilter("pending");
                  setShowFilters(false);
                }}
              >
                Pending ({statusCounts.pending})
              </button>
              <button 
                className={`filter-btn ${activeFilter === "in progress" ? "active" : ""}`}
                onClick={() => {
                  setActiveFilter("in progress");
                  setShowFilters(false);
                }}
              >
                In Progress ({statusCounts["in progress"]})
              </button>
              <button 
                className={`filter-btn ${activeFilter === "resolved" ? "active" : ""}`}
                onClick={() => {
                  setActiveFilter("resolved");
                  setShowFilters(false);
                }}
              >
                Resolved ({statusCounts.resolved})
              </button>
              <button 
                className={`filter-btn ${activeFilter === "rejected" ? "active" : ""}`}
                onClick={() => {
                  setActiveFilter("rejected");
                  setShowFilters(false);
                }}
              >
                Rejected ({statusCounts.rejected})
              </button>
            </div>

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

            {!loading && !error && filteredComplaints.length === 0 && (
              <div className="empty-state">
                <div className="empty-icon">
                  <FiFile />
                </div>
                <h3>No complaints found</h3>
                <p>There are no complaints matching your current filter.</p>
              </div>
            )}

            {!loading && filteredComplaints.length > 0 && (
              <div className="complaints-container">
                <div className="complaints-header">
                  <h3>Your Assigned Complaints</h3>
                  <span className="badge-count">{filteredComplaints.length} shown</span>
                </div>

                <div className="complaints-list">
                  {filteredComplaints.map((complaint, index) => {
                    const complaintId = complaint.complaintId ?? index;
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
                          <div className="complaint-meta">
                            <div className="complaint-id">ID: {complaint.complaintId ?? "N/A"}</div>
                            <div className="complaint-type">{complaint.complaintType || "—"}</div>
                          </div>
                          
                          <div className="complaint-status-container">
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
                        </div>

                        {isExpanded && (
                          <div className="complaint-details">
                            <div className="detail-grid">
                              <div className="detail-item">
                                <span className="detail-label">Name:</span>
                                <span>{complaint.name || "—"}</span>
                              </div>
                              <div className="detail-item">
                                <span className="detail-label">Phone:</span>
                                <span>{complaint.phone || "—"}</span>
                              </div>
                              <div className="detail-item">
                                <span className="detail-label">Title:</span>
                                <span>{complaint.title || "—"}</span>
                              </div>
                              <div className="detail-item full-width">
                                <span className="detail-label">Description:</span>
                                <p className="complaint-description">
                                  {complaint.description || "No description provided."}
                                </p>
                              </div>
                              <div className="detail-item full-width">
                                <span className="detail-label">Attachments:</span>
                                <div className="attachments-list">
                                  {complaint.attachments && complaint.attachments.length > 0 ? (
                                    complaint.attachments.map((file) => (
                                      <a
                                        key={file._id}
                                        href={file.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="attachment-link"
                                      >
                                        <FiFile />
                                        {file.name}
                                      </a>
                                    ))
                                  ) : (
                                    "—"
                                  )}
                                </div>
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
                                    <FiMessageSquare />
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
                                      <>
                                        <FiCheckCircle />
                                        Resolve
                                      </>
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
                                      <>
                                        <FiXCircle />
                                        Reject
                                      </>
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
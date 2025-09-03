"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import './Manager.css';

import {
  FiHome,
  FiUsers,
  FiAlertCircle,
  FiClock,
  FiRefreshCw,
  FiCheckCircle,
  FiXCircle,
  FiPlay,
  FiChevronDown,
  FiChevronUp,
  FiFilter,
  FiSearch,
  FiSettings,
  FiLogOut,
  FiGrid,
  FiList
} from "react-icons/fi";

// Helper component to render status badges
const StatusBadge = ({ status }) => {
  switch (status) {
    case "Pending":
      return (
        <span className="status-badge status-pending" aria-label="Pending">
          <FiClock /> Pending
        </span>
      );
    case "In Progress":
      return (
        <span className="status-badge status-in-progress" aria-label="In Progress">
          <FiRefreshCw /> In Progress
        </span>
      );
    case "Resolved":
      return (
        <span className="status-badge status-resolved" aria-label="Resolved">
          <FiCheckCircle /> Resolved
        </span>
      );
    case "Rejected":
      return (
        <span className="status-badge status-rejected" aria-label="Rejected">
          <FiXCircle /> Rejected
        </span>
      );
    default:
      return <span className="status-badge">Unknown</span>;
  }
};

const ManagerDashboard = () => {
  const { data: session, status } = useSession();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [expandedComplaint, setExpandedComplaint] = useState(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState("table"); // 'table' or 'card'

  // Debounce search input to improve performance
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);


  const fetchComplaints = useCallback(async () => {
    setLoading(true);

    try {
      const params = new URLSearchParams();
      params.append("manager", "true");

      const res = await fetch(`/api/complaint?${params.toString()}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("API Error:", res.status, text);
        throw new Error("Failed to fetch complaints");
      }

      const data = await res.json();
      setComplaints(data.complaints || []);
    } catch (err) {
      console.error("Fetch Error:", err);
      alert("❌ Could not load complaints.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  // Filter complaints by status
  const resolvedComplaints = complaints.filter(
    (c) => c.status === "Resolved"
  );
  const rejectedComplaints = complaints.filter(
    (c) => c.status === "Rejected"
  );
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


  // Toggle complaint details open/close
  const toggleComplaintDetails = (id) => {
    setExpandedComplaint(expandedComplaint === id ? null : id);
  };

  // Filter complaints by search term and status filter
  const filteredComplaints = complaints.filter((complaint) => {
    const searchText = debouncedSearch.toLowerCase();
    const matchesSearch =
      complaint.name?.toLowerCase().includes(searchText) ||
      complaint.complaintid?.toString().includes(searchText) ||
      complaint.complaintType?.toLowerCase().includes(searchText) ||
      complaint.assignedTo?.toLowerCase().includes(searchText);

    const matchesStatus = statusFilter === "All" || complaint.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (status === "loading") return <div className="loading-screen">Loading session...</div>;

  if (!session) {
    return (
      <div className="unauthorized">
        <div className="unauthorized-card" role="alert" aria-live="assertive">
          <FiAlertCircle size={48} className="text-danger" />
          <h2>Access Denied</h2>
          <p>You must be logged in to view this page.</p>
          <Link href="/login" className="btn btn-primary" aria-label="Go to Login page">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Sidebar Navigation */}
      <aside className="sidebar" aria-label="Sidebar Navigation">
        <div className="sidebar-header">
          <div className="logo">
            <span>Manager Dashboard</span>
          </div>
        </div>

        <nav className="sidebar-nav" aria-label="Main navigation">
          <Link href="/admin" className="nav-link active" aria-current="page">
            <i className="nav-icon">
              <FiHome />
            </i>
            <span>Dashboard</span>
          </Link>
          <Link href="/manager/login" className="nav-link">
            <i className="nav-icon">
              <FiUsers />
            </i>
            <span>Manager</span>
          </Link>
          <Link href="/manager/engineer" className="nav-link">
            <i className="nav-icon">
              <FiUsers />
            </i>
            <span>Engineers</span>
          </Link>
        </nav>

        {/* Sidebar Footer - User info and Logout */}
        <div className="sidebar-footer">
          <div className="user-profile" aria-label="User Profile">
            <Image
              src={session.user.image || ""}
              width={40}
              height={40}
              alt={`${session.user.name} avatar`}
              className="user-avatar"
            />
            <div className="user-details">
              <strong>{session.user.name}</strong>
              <span>Manager</span>
            </div>
          </div>
          <Link href="/logout" className="logout-btn" aria-label="Sign Out">
            <FiLogOut /> Sign Out
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content" role="main">
        <header className="content-header">
          <h1 tabIndex={-1}>Complaint Management</h1>
        </header>

        {/* Controls: Search, Filter, View Mode */}
        <div className="dashboard-controls">
          <div className="search-bar">
            <FiSearch className="search-icon" aria-hidden="true" />
            <input
              type="search"
              placeholder="Search complaints..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Search complaints"
              disabled={loading}
            />
          </div>

          <div className="filter-dropdown">
            <button
              className="filter-toggle"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              aria-haspopup="listbox"
              aria-expanded={isFilterOpen}
              aria-label="Filter complaints by status"
              disabled={loading}
            >
              <FiFilter /> {statusFilter} {isFilterOpen ? <FiChevronUp /> : <FiChevronDown />}
            </button>
            {isFilterOpen && (
              <div className="filter-options" role="listbox" tabIndex={-1}>
                {["All", "Pending", "In Progress", "Resolved", "Rejected"].map((status) => (
                  <button
                    key={status}
                    onClick={() => {
                      setStatusFilter(status);
                      setIsFilterOpen(false);
                    }}
                    role="option"
                    aria-selected={statusFilter === status}
                    className={statusFilter === status ? "active" : ""}
                  >
                    {status}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="view-mode-toggle" role="group" aria-label="Toggle view mode">
            <button
              onClick={() => setViewMode("table")}
              aria-pressed={viewMode === "table"}
              aria-label="Table view"
              disabled={loading}
              className={viewMode === "table" ? "active" : ""}
            >
              <FiGrid /> Table
            </button>
            <button
              onClick={() => setViewMode("card")}
              aria-pressed={viewMode === "card"}
              aria-label="Card view"
              disabled={loading}
              className={viewMode === "card" ? "active" : ""}
            >
              <FiList /> Card
            </button>
          </div>
        </div>

        {/* Complaints Listing */}
        <div className="complaints-container" aria-live="polite" aria-relevant="additions removals">
          {loading ? (
            <div className="loading-state" role="status" aria-live="polite">
              <div className="spinner" aria-hidden="true"></div>
              <p>Loading complaints...</p>
            </div>
          ) : filteredComplaints.length === 0 ? (
            <div className="empty-state" role="alert" aria-live="assertive">
              <FiAlertCircle size={48} aria-hidden="true" />
              <h3>No complaints found</h3>
              <p>Try adjusting your search or filter criteria.</p>
              <button
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("All");
                }}
                className="btn btn-primary"
                aria-label="Reset filters"
              >
                Reset Filters
              </button>
            </div>
          ) : viewMode === "table" ? (
            <div className="table-responsive">
              <table className="complaints-table" role="table" aria-label="Complaints table">
                <thead>
                  <tr>
                    <th scope="col">ID</th>
                    <th scope="col">Customer</th>
                    <th scope="col">Phone</th>
                    <th scope="col">Type</th>
                    <th scope="col">Status</th>
                    <th scope="col">Assigned To</th>
                    <th scope="col">Created At</th>
                    <th scope="col">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredComplaints.map((complaint) => (
                    <React.Fragment key={complaint._id}>
                      <tr>
                        <td>#{complaint.complaintid || complaint._id}</td>
                        <td>{complaint.name}</td>
                        <td>{complaint.phone || "—"}</td>
                        <td>{complaint.complaintType || "—"}</td>
                        <td>
                          <StatusBadge status={complaint.status} />
                        </td>
                        <td>{complaint.assignedTo || "Unassigned"}</td>
                        <td>{new Date(complaint.createdAt).toLocaleDateString()}</td>
                        <td>
                          <button
                            onClick={() => toggleComplaintDetails(complaint._id)}
                            className="btn btn-sm btn-details"
                            aria-expanded={expandedComplaint === complaint._id}
                            aria-controls={`complaint-details-${complaint._id}`}
                            aria-label={`Toggle details for complaint #${complaint.complaintid || complaint._id}`}
                            disabled={loading}
                          >
                            {expandedComplaint === complaint._id ? <FiChevronUp /> : <FiChevronDown />} Details
                          </button>
                        </td>
                      </tr>
                      {expandedComplaint === complaint._id && (
                        <tr className="details-row" id={`complaint-details-${complaint._id}`}>
                          <td colSpan="8">
                            <div className="complaint-details">
                              <div className="detail-section">
                                <h4>Description</h4>
                                <p>{complaint.description || "No description provided"}</p>
                              </div>
                              <div className="detail-grid">
                                <div>
                                  <h4>Account Number</h4>
                                  <p>{complaint.accountNumber || "—"}</p>
                                </div>
                                <div>
                                  <h4>User Email</h4>
                                  <p>{complaint.userEmail || "—"}</p>
                                </div>
                                <div>
                                  <h4>Priority</h4>
                                  <p>{complaint.priority || "—"}</p>
                                </div>
                                <div>
                                  <h4>Last Updated</h4>
                                  <p>{new Date(complaint.updatedAt).toLocaleString()}</p>
                                </div>
                              </div>
                              {complaint.engineerMessage && (
                                <div className="detail-section">
                                  <h4>Engineer Message</h4>
                                  <p>{complaint.engineerMessage}</p>
                                </div>
                              )}
                              {complaint.resolutionMessage && (
                                <div className="detail-section">
                                  <h4>Resolution Message</h4>
                                  <p>{complaint.resolutionMessage}</p>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="complaints-list">
              {filteredComplaints.map((complaint) => (
                <div
                  key={complaint._id}
                  className="complaint-card"
                  aria-expanded={expandedComplaint === complaint._id}
                >
                  <div
                    className="complaint-header"
                    onClick={() => toggleComplaintDetails(complaint._id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        toggleComplaintDetails(complaint._id);
                      }
                    }}
                    aria-controls={`complaint-details-card-${complaint._id}`}
                    aria-expanded={expandedComplaint === complaint._id}
                  >
                    <div className="complaint-id">#{complaint.complaintid || complaint._id}</div>
                    <div className="complaint-customer">
                      <strong>{complaint.name}</strong>
                      <span>{complaint.phone || "—"}</span>
                    </div>
                    <div className="complaint-type">{complaint.complaintType || "—"}</div>
                    <div className="complaint-status">
                      <StatusBadge status={complaint.status} />
                    </div>
                    <div className="complaint-assigned">{complaint.assignedTo || "Unassigned"}</div>
                    <div className="complaint-toggle">
                      {expandedComplaint === complaint._id ? <FiChevronUp /> : <FiChevronDown />}
                    </div>
                  </div>

                  {expandedComplaint === complaint._id && (
                    <div
                      className="complaint-details"
                      id={`complaint-details-card-${complaint._id}`}
                      tabIndex={-1}
                    >
                      <div className="detail-row">
                        <span className="detail-label">Description:</span>
                        <p className="detail-value">{complaint.description || "No description provided"}</p>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Account Number:</span>
                        <span className="detail-value">{complaint.accountNumber || "—"}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">User Email:</span>
                        <span className="detail-value">{complaint.userEmail || "—"}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Priority:</span>
                        <span className="detail-value">{complaint.priority || "—"}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Created At:</span>
                        <span className="detail-value">{new Date(complaint.createdAt).toLocaleString()}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Last Updated:</span>
                        <span className="detail-value">{new Date(complaint.updatedAt).toLocaleString()}</span>
                      </div>
                      {complaint.engineerMessage && (
                        <div className="detail-row">
                          <span className="detail-label">Engineer Message:</span>
                          <span className="detail-value">{complaint.engineerMessage}</span>
                        </div>
                      )}
                      {complaint.resolutionMessage && (
                        <div className="detail-row">
                          <span className="detail-label">Resolution Message:</span>
                          <span className="detail-value">{complaint.resolutionMessage}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ManagerDashboard;

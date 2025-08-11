"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import './Manager.css'
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
  FiLogOut
} from "react-icons/fi";


const ManagerDashboard = () => {
  const { data: session, status } = useSession();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [expandedComplaint, setExpandedComplaint] = useState(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState("table"); // 'table' or 'card'

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/complaint");
      if (!res.ok) throw new Error("Failed to fetch complaints");
      const data = await res.json();
      setComplaints(data.complaints || []);
    } catch (err) {
      console.error(err);
      alert("❌ Failed to load complaints.");
    } finally {
      setLoading(false);
    }
  };

  const updateComplaintStatus = async (id, newStatus) => {
    try {
      const res = await fetch(`/api/complaint/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to update complaint");
      fetchComplaints(); // Refresh the list
    } catch (err) {
      console.error(err);
      alert("❌ Failed to update complaint.");
    }
  };

  const toggleComplaintDetails = (id) => {
    setExpandedComplaint(expandedComplaint === id ? null : id);
  };

  const filteredComplaints = complaints.filter(complaint => {
    const matchesSearch = 
      complaint.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.complaintid?.toString().includes(searchTerm.toLowerCase()) ||
      complaint.complaintType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.assignedTo?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "All" || complaint.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (status === "loading") return <div className="loading-screen">Loading session...</div>;

  if (!session) {
    return (
      <div className="unauthorized">
        <div className="unauthorized-card">
          <FiAlertCircle size={48} className="text-danger" />
          <h2>Access Denied</h2>
          <p>You must be logged in to view this page.</p>
          <Link href="/login" className="btn btn-primary">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo">
            <span>Manager Dashboard</span>
          </div>
        </div>
        
        <nav className="sidebar-nav">
          <Link href="/admin" className="nav-link active">
            <i className="nav-icon"><FiHome /></i>
            <span>Dashboard</span>
          </Link>
          <Link href="/manager/login" className="nav-link">
            <i className="nav-icon"><FiUsers /></i>
            <span>Manager</span>
          </Link>
          <Link href="/manager/engineer" className="nav-link">
            <i className="nav-icon"><FiUsers /></i>
            <span>Engineers</span>
          </Link>
        </nav>
        
        <div className="sidebar-footer">
          <div className="user-profile">
            <Image
              src={session.user.image || "/default-avatar.png"}
              width={40}
              height={40}
              alt="User"
              className="user-avatar"
            />
            <div className="user-details">
              <strong>{session.user.name}</strong>
              <span>Manager</span>
            </div>
          </div>
          <Link href="/logout" className="logout-btn">
            <FiLogOut /> Sign Out
          </Link>
        </div>
      </aside>

      <main className="main-content">
        <header className="content-header">
          <h1>Complaint Management</h1>
       
        </header>

        <div className="dashboard-controls">
          <div className="search-bar">
            <FiSearch className="search-icon" />
            <input 
              type="text" 
              placeholder="Search complaints..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="filter-dropdown">
            <button 
              className="filter-toggle"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
            >
              <FiFilter /> {statusFilter} {isFilterOpen ? <FiChevronUp /> : <FiChevronDown />}
            </button>
            {isFilterOpen && (
              <div className="filter-options">
                <button onClick={() => { setStatusFilter("All"); setIsFilterOpen(false); }}>All</button>
                <button onClick={() => { setStatusFilter("Pending"); setIsFilterOpen(false); }}>Pending</button>
                <button onClick={() => { setStatusFilter("In Progress"); setIsFilterOpen(false); }}>In Progress</button>
                <button onClick={() => { setStatusFilter("Resolved"); setIsFilterOpen(false); }}>Resolved</button>
                <button onClick={() => { setStatusFilter("Rejected"); setIsFilterOpen(false); }}>Rejected</button>
              </div>
            )}
          </div>
        </div>

        <div className="complaints-container">
          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading complaints...</p>
            </div>
          ) : filteredComplaints.length === 0 ? (
            <div className="empty-state">
              <FiAlertCircle size={48} />
              <h3>No complaints found</h3>
              <p>Try adjusting your search or filter criteria.</p>
              <button onClick={() => { setSearchTerm(""); setStatusFilter("All"); }} className="btn btn-primary">
                Reset Filters
              </button>
            </div>
          ) : viewMode === "table" ? (
            <div className="table-responsive">
              <table className="complaints-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Customer</th>
                    <th>Phone</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Assigned To</th>
                    <th>Created At</th>
                    <th>Actions</th>
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
                          {complaint.status === "Pending" && (
                            <span className="status-badge status-pending">
                              <FiClock /> Pending
                            </span>
                          )}
                          {complaint.status === "In Progress" && (
                            <span className="status-badge status-in-progress">
                              <FiRefreshCw /> In Progress
                            </span>
                          )}
                          {complaint.status === "Resolved" && (
                            <span className="status-badge status-resolved">
                              <FiCheckCircle /> Resolved
                            </span>
                          )}
                          {complaint.status === "Rejected" && (
                            <span className="status-badge status-rejected">
                              <FiXCircle /> Rejected
                            </span>
                          )}
                        </td>
                        <td>{complaint.assignedTo || "Unassigned"}</td>
                        <td>{new Date(complaint.createdAt).toLocaleDateString()}</td>
                        <td>
                          <button 
                            onClick={() => toggleComplaintDetails(complaint._id)}
                            className="btn btn-sm btn-details"
                          >
                            {expandedComplaint === complaint._id ? <FiChevronUp /> : <FiChevronDown />} Details
                          </button>
                        </td>
                      </tr>
                      {expandedComplaint === complaint._id && (
                        <tr className="details-row">
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
                <div key={complaint._id} className="complaint-card">
                  <div className="complaint-header" onClick={() => toggleComplaintDetails(complaint._id)}>
                    <div className="complaint-id">#{complaint.complaintid || complaint._id}</div>
                    <div className="complaint-customer">
                      <strong>{complaint.name}</strong>
                      <span>{complaint.phone || "—"}</span>
                    </div>
                    <div className="complaint-type">{complaint.complaintType || "—"}</div>
                    <div className="complaint-status">
                      {complaint.status === "Pending" && (
                        <span className="status-badge status-pending">
                          <FiClock /> Pending
                        </span>
                      )}
                      {complaint.status === "In Progress" && (
                        <span className="status-badge status-in-progress">
                          <FiRefreshCw /> In Progress
                        </span>
                      )}
                      {complaint.status === "Resolved" && (
                        <span className="status-badge status-resolved">
                          <FiCheckCircle /> Resolved
                        </span>
                      )}
                      {complaint.status === "Rejected" && (
                        <span className="status-badge status-rejected">
                          <FiXCircle /> Rejected
                        </span>
                      )}
                    </div>
                    <div className="complaint-assigned">
                      {complaint.assignedTo || "Unassigned"}
                    </div>
                    <div className="complaint-toggle">
                      {expandedComplaint === complaint._id ? <FiChevronUp /> : <FiChevronDown />}
                    </div>
                  </div>

                  {expandedComplaint === complaint._id && (
                    <div className="complaint-details">
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
                      <div className="complaint-actions">
                        {complaint.status === "Pending" && (
                          <button
                            onClick={() => updateComplaintStatus(complaint._id, "In Progress")}
                            className="btn btn-action btn-start"
                          >
                            <FiPlay /> Start Work
                          </button>
                        )}
                        {complaint.status === "In Progress" && (
                          <button
                            onClick={() => updateComplaintStatus(complaint._id, "Resolved")}
                            className="btn btn-action btn-resolve"
                          >
                            <FiCheckCircle /> Mark Resolved
                          </button>
                        )}
                        {(complaint.status === "Pending" || complaint.status === "In Progress") && (
                          <button
                            onClick={() => updateComplaintStatus(complaint._id, "Rejected")}
                            className="btn btn-action btn-reject"
                          >
                            <FiXCircle /> Reject
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="stats-summary">
          <div className="stat-card">
            <div className="stat-value">{complaints.length}</div>
            <div className="stat-label">Total Complaints</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{complaints.filter(c => c.status === "Pending").length}</div>
            <div className="stat-label">Pending</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{complaints.filter(c => c.status === "In Progress").length}</div>
            <div className="stat-label">In Progress</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{complaints.filter(c => c.status === "Resolved").length}</div>
            <div className="stat-label">Resolved</div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ManagerDashboard;
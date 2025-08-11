"use client";
import React from "react";
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useSession, signOut } from "next-auth/react";
import {
  FiTrash2,
  FiPaperclip,
  FiCheckCircle,
  FiAlertCircle,
  FiClock,
  FiChevronDown,
  FiChevronUp,
  FiPlus,
  FiLogOut,
  FiSearch,
  FiUser,
  FiHome,
  FiList,
  FiX,
  FiArrowLeft,
} from "react-icons/fi";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import "./UserDashboard.css";
// Constants moved outside component to prevent recreation on every render
const FIELD_MAPPINGS = {
  Name: { required: true, maxLength: 100 },
  Email: { required: true, maxLength: 100 },
  "Phone Number": { required: true, maxLength: 10, pattern: /^[0-9]{10}$/ },
  "Complaint Type": {
    required: true,
    options: ["Hardware", "Software", "Network"],
  },
  "Complaint Sub-Type": {
    required: false,
    options: {
      Hardware: [
        "Hard Disk Issue",
        "Motherboard Issue",
        "Keyboard Problem",
        "Monitor Issue",
      ],
      Software: [
        "Addmobe Issue",
        "MS Office Related",
        "Operating System",
        "Application Crash",
      ],
      Network: [
        "WiFi Not Working",
        "LAN Not Working",
        "Connection Drops",
        "Slow Speed",
      ],
    },
  },
  Location: {
    required: true,
    options: ["Delhi", "Noida"],
    branches: {
      Noida: ["PLOT NO - 56, 6C, C Block, Phase 2, C Block, Sector 62, Noida"],
      Delhi: ["70A/32, 3rd floor, Rama Road, Kirti Nagar, Delhi-110015"],
    },
  },
  "Company Name": { required: true },
  Title: { required: true, maxLength: 200 },
  Description: { required: true, maxLength: 2000 },
};
const STATUS_CONFIG = {
  pending: {
    text: "Pending",
    color: "#F59E0B",
    icon: <FiClock />,
  },
  in_progress: {
    text: "In Progress",
    color: "#3B82F6",
    icon: <FiClock />,
  },
  resolved: {
    text: "Resolved",
    color: "#10B981",
    icon: <FiCheckCircle />,
  },
  rejected: {
    text: "Rejected",
    color: "#EF4444",
    icon: <FiAlertCircle />,
  },
};
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_FILE_COUNT = 5;
const ALLOWED_FILE_TYPES = ["image/jpeg", "image/png", "application/pdf"];
// Custom Hook for debouncing
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
};
// Memoized LoadingSpinner component to prevent unnecessary re-renders
const LoadingSpinner = React.memo(() => (
  <div className="spinner-container">
    <div className="spinner"></div>
    <p>Loading...</p>
  </div>
));
// Memoized StatusBadge component
const StatusBadge = React.memo(({ status }) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  return (
    <span
      className="status-badge"
      style={{
        backgroundColor: `${config.color}20`,
        color: config.color,
        borderColor: config.color,
      }}
    >
      {config.icon}
      {config.text}
    </span>
  );
});
// Memoized ComplaintCard component with optimized handlers
const ComplaintCard = React.memo(
  ({ complaint }) => {
    const formatComplaintId = useCallback((id) => {
      return id ? `#${id.toString().slice(-6).toUpperCase()}` : "#N/A";
    }, []);
    const formatDate = useCallback((dateString) => {
      if (!dateString) return "N/A";
      const options = {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      };
      return new Date(dateString).toLocaleDateString("en-US", options);
    }, []);
    const statusConfig = useMemo(
      () => ({
        pending: {
          color: "rgb(245, 158, 11)",
          bgColor: "rgba(245, 158, 11, 0.125)",
          icon: <FiClock />,
        },
        in_progress: {
          color: "rgb(59, 130, 246)",
          bgColor: "rgba(59, 130, 246, 0.125)",
          icon: <FiClock />,
        },
        resolved: {
          color: "rgb(16, 185, 129)",
          bgColor: "rgba(16, 185, 129, 0.125)",
          icon: <FiCheckCircle />,
        },
        rejected: {
          color: "rgb(239, 68, 68)",
          bgColor: "rgba(239, 68, 68, 0.125)",
          icon: <FiAlertCircle />,
        },
      }),
      []
    );
    const status = complaint.status || "pending";
      const currentStatus = statusConfig[status];
    return (
      <div className="complaint-card">
        <div className="card-header">
          <div className="header-content">
            <h3>{complaint.title || "Untitled Complaint"}</h3>
            <div className="card-meta">
              <div className="complaint-id">
                {complaint.complaintId || "Untitled Complaint".complaintId}
              </div>
              <span className="complaint-date">
                {formatDate(complaint.createdAt)}
              </span>
       <div
            className="complaint-status"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              backgroundColor: currentStatus?.bgColor || "#f3f4f6",
              color: currentStatus?.color || "#374151",
              padding: "4px 8px",
              borderRadius: "4px",
              fontWeight: 500,
              marginLeft: "auto",
            }}
          >
            {currentStatus?.icon}
            {status.replace("_", " ")}
          </div>
            </div>
          </div>
        </div>
        <AnimatePresence>
          <motion.div
            className="card-body"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="complaint-details">
              <div className="detail-row">
                <span className="detail-label">Type:</span>
                <span className="detail-value">
                  {complaint["complaintType"] || "Not specified"}
                  {complaint["complaintSubType"] &&
                    ` (${complaint["complaintSubType"]})`}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Location:</span>
                <span className="detail-value">
                  {complaint.location || "Not specified"}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Branch:</span>
                <span className="detail-value">
                  {complaint["companyAddress"] || "Not specified"}
                </span>
              </div>
              <div className="detail-row full-width">
                <span className="detail-label">Description:</span>
                <p className="detail-value">
                  {complaint.description || "No description provided"}
                </p>
              </div>
              {complaint.attachments?.length > 0 && (
                <div className="detail-row full-width">
                  <span className="detail-label">Attachments:</span>
                  <div className="attachments-list">
                    {complaint.attachments.map((file, index) => (
                      <a
                        key={index}
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="attachment-item"
                      >
                        <FiPaperclip />
                        {file.name}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    );
  },
  (prevProps, nextProps) => {
    // Custom comparison function to prevent unnecessary re-renders
    return (
      prevProps.expanded === nextProps.expanded &&
      prevProps.complaint.complaintId === nextProps.complaint.complaintId &&
      prevProps.complaint.status === nextProps.complaint.status
    );
  }
);
const UserDashboard = () => {
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState("history");
  const [form, setForm] = useState({
    Name: "",
    Email: "",
    "Phone Number": "",
    "Complaint Type": "",
    "Complaint Sub-Type": "",
    Location: "",
    "Company Name": "",
    Title: "",
    Description: "",
    assignedTo: "",
  assignedToEmail: "",
  engineerMessage: ""
  });
  const [files, setFiles] = useState([]);
  const [loadingForm, setLoadingForm] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [submittedComplaint, setSubmittedComplaint] = useState(null);
  const [errors, setErrors] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [loadingComplaints, setLoadingComplaints] = useState(false);
  const [fetchError, setFetchError] = useState("");
  const [expandedComplaint, setExpandedComplaint] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const fileInputRef = useRef(null);
  // Initialize form with user data
  useEffect(() => {
    if (session?.user) {
      setForm((prev) => ({
        ...prev,
        Name: session.user.name || "",
        Email: session.user.email || "",
      }));
    }
  }, [session]);
  // Fetch complaints from database
  const fetchComplaints = useCallback(async () => {
    if (!session?.user?.email) return;
    setLoadingComplaints(true);
    setFetchError("");
    try {
      const res = await fetch(
        `/api/complaint?email=${encodeURIComponent(session.user.email)}`
      );
      if (!res.ok) throw new Error("Failed to fetch complaints");
      const data = await res.json();
      const complaintsArray = Array.isArray(data) ? data : data.complaints;
      if (!Array.isArray(complaintsArray)) {
        throw new Error("Invalid data format from server");
      }
      // Sort by creation date (newest first)
      const sorted = complaintsArray.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setComplaints(sorted);
    } catch (err) {
      console.error("Error fetching complaints:", err);
      setFetchError(err.message);
    } finally {
      setLoadingComplaints(false);
    }
  }, [session]);
  // Load complaints when tab changes to history
  useEffect(() => {
    if (activeTab === "history") {
      fetchComplaints();
    }
  }, [activeTab, fetchComplaints]);
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    // Phone number validation
    if (name === "Phone Number" && (!/^\d*$/.test(value) || value.length > 10))
      return;
    setForm((prev) => {
      const updated = {
        ...prev,
        [name]: value,
      };
      // Reset dependent fields
      if (name === "Complaint Type") updated["Complaint Sub-Type"] = "";
      if (name === "Location") updated["Company Name"] = "";
      return updated;
    });
  }, []);
  const clearField = useCallback((fieldName) => {
    setForm((prev) => {
      const updated = {
        ...prev,
        [fieldName]: "",
      };
      // Reset dependent fields
      if (fieldName === "Complaint Type") updated["Complaint Sub-Type"] = "";
      if (fieldName === "Location") updated["Company Name"] = "";
      return updated;
    });
  }, []);
  const handleFileChange = useCallback(
    (e) => {
      if (!e.target.files) return;
      const selected = Array.from(e.target.files)
        .slice(0, MAX_FILE_COUNT - files.length)
        .filter(
          (file) =>
            file.size <= MAX_FILE_SIZE && ALLOWED_FILE_TYPES.includes(file.type)
        );
      setFiles((prev) => [...prev, ...selected]);
    },
    [files.length]
  );
  const removeFile = useCallback((index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);
  const validateForm = useCallback(() => {
    const newErrors = [];
    Object.entries(FIELD_MAPPINGS).forEach(([field, rules]) => {
      if (rules.required && !form[field]) {
        newErrors.push(`${field} is required`);
      }
    });
    if (files.length > MAX_FILE_COUNT) {
      newErrors.push(`Maximum ${MAX_FILE_COUNT} files allowed`);
    }
    setErrors(newErrors);
    return newErrors.length === 0;
  }, [form, files]);
const handleSubmit = useCallback(async (e) => {
  e.preventDefault();
  setLoadingForm(true);
  setErrors([]);
  
  if (!validateForm()) {
    setLoadingForm(false);
    return;
  }

  try {
    const formData = new FormData();
    
    // Append all form fields
    Object.entries(form).forEach(([key, value]) => {
      formData.append(key, value);
    });

    // Append each file separately
    files.forEach((file) => {
      formData.append("files", file); // Changed from "file" to "files"
    });

    const res = await fetch("/api/complaint", {
      method: "POST",
      body: formData, // No headers needed for FormData
    });
        
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || "Failed to submit complaint");
        }
        const result = await res.json();
        setSubmittedComplaint(result);
        setSuccessMsg(`Complaint submitted successfully!`);
        setShowSuccessModal(true);
        resetForm();
        await fetchComplaints();
      } catch (err) {
        console.error("Error submitting complaint:", err);
        setErrors([err.message]);
      } finally {
        setLoadingForm(false);
      }
    },
    [form, files, validateForm, fetchComplaints]
  );
  const resetForm = useCallback(() => {
    setForm({
      Name: session?.user?.name || "",
      Email: session?.user?.email || "",
      "Phone Number": "",
      "Complaint Type": "",
      "Complaint Sub-Type": "",
      Location: "",
      "Company Name": "",
      Title: "",
      Description: "",
       assignedTo: "",
    assignedToEmail: "",
    engineerMessage: ""
    });
    setFiles([]);
    setErrors([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [session]);
  // Filter complaints based on search and status
  const filteredComplaints = useMemo(() => {
    return complaints.filter((complaint) => {
      // Status filter
      if (statusFilter !== "all" && complaint.status !== statusFilter)
        return false;
      // Search term
      if (debouncedSearchTerm) {
        const term = debouncedSearchTerm.toLowerCase();
        return (
          complaint.Title?.toLowerCase().includes(term) ||
          complaint.Description?.toLowerCase().includes(term) ||
          complaint.complaintId?.toLowerCase().includes(term)
        );
      }
      return true;
    });
  }, [complaints, debouncedSearchTerm, statusFilter]);
  // Get company name options based on selected location
  const companyNameOptions = useMemo(() => {
    if (!form.Location) return [];
    return FIELD_MAPPINGS.Location.branches[form.Location] || [];
  }, [form.Location]);
  const toggleComplaintExpand = useCallback((complaintId) => {
    setExpandedComplaint((prev) => (prev === complaintId ? null : complaintId));
  }, []);
  if (status === "loading") return <LoadingSpinner />;
  if (status === "unauthenticated")
    return (
      <div className="auth-error">
        <FiAlertCircle />
        <h2>Access Denied</h2>
        <p>Please sign in to access the dashboard</p>
        <Link href="/login">Sign In</Link>
      </div>
    );
  return (
    <div className="dashboard-container">
      {/* Success Modal */}
      <AnimatePresence>
        {showSuccessModal && (
          <motion.div
            className="success-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowSuccessModal(false)}
          >
            <motion.div
              className="success-modal"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <FiCheckCircle className="success-icon" />
              <h3>Complaint Submitted Successfully!</h3>
              <p>Your complaint has been registered with reference ID:</p>
              <div className="complaint-id">
                {submittedComplaint.complaintId || "Untitled Complaint".complaintId }
                
              </div>
              <p>We'll get back to you soon with updates.</p>
              <div className="modal-actions">
                <button
                  onClick={() => {
                    setShowSuccessModal(false);
                    setActiveTab("history");
                  }}
                  className="view-complaints-btn"
                >
                  View My Complaints
                </button>
                <button
                  onClick={() => setShowSuccessModal(false)}
                  className="close-modal-btn"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>
            {" "}
            <FiHome className="logo-icon" /> &nbsp; Complaint Portal
          </h2>
          <div className="user-profile">
            <div className="avatar">
              {session?.user?.image ? (
                <Image
                  src={session.user.image}
                  alt="User"
                  width={40}
                  height={40}
                  priority
                />
              ) : (
                <FiUser className="default-avatar" />
              )}
            </div>
            <div>
              <p className="username">{session?.user?.name}</p>
              <p className="user-email">{session?.user?.email}</p>
            </div>
          </div>
        </div>
        <nav className="sidebar-nav">
          <button
            className={`new-complaint-btn ${
              activeTab === "new" ? "active" : ""
            }`}
            onClick={() => {
              setActiveTab("new");
              resetForm();
            }}
          >
            <FiPlus /> Register New Complaint
          </button>
          <button
            className={`nav-link ${activeTab === "history" ? "active" : ""}`}
            onClick={() => setActiveTab("history")}
          >
            <FiList /> My Complaints
          </button>
        </nav>
        <button
          className="logout-btn"
          onClick={() => signOut({ callbackUrl: "/login" })}
        >
          <FiLogOut /> Sign Out
        </button>
      </aside>
      {/* Main Content */}
      <main className="main-content">
        {activeTab === "new" ? (
          <div className="form-container">
            <div className="form-header">
              <button
                className="back-button"
                onClick={() => setActiveTab("history")}
              >
                <FiArrowLeft /> Back to Complaints
              </button>
              <h2>Register New Complaint</h2>
            </div>
            {errors.length > 0 && (
              <div className="alert-error">
                <FiAlertCircle />
                <div>
                  <h3>Submission Errors</h3>
                  <ul>
                    {errors.map((e, i) => (
                      <li key={i}>{e}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                {/* Personal Information Section */}
                <div className="form-section span-2">
                  <h3>Personal Information</h3>
                  <div className="section-grid">
                    <div className="form-field">
                      <label>
                        Name
                        <span className="required">*</span>
                      </label>
                      <input
                        type="text"
                        name="Name"
                        value={form.Name}
                        onChange={handleChange}
                        required
                        maxLength={100}
                        placeholder="Enter your name..."
                      />
                    </div>
                    <div className="form-field">
                      <label>
                        Email
                        <span className="required">*</span>
                      </label>
                      <input
                        type="email"
                        name="Email"
                        value={form.Email}
                        onChange={handleChange}
                        required
                        maxLength={100}
                        placeholder="Enter your email..."
                      />
                    </div>
                    <div className="form-field">
                      <label>
                        Phone Number
                        <span className="required">*</span>
                      </label>
                      <div className="input-with-clear">
                        <input
                          type="tel"
                          name="Phone Number"
                          value={form["Phone Number"]}
                          onChange={handleChange}
                          required
                          maxLength={10}
                          pattern="^[0-9]{10}$"
                          placeholder="Enter 10-digit phone number..."
                        />
                        {form["Phone Number"] && (
                          <button
                            type="button"
                            className="clear-input"
                            onClick={() => clearField("Phone Number")}
                            aria-label="Clear phone number"
                          >
                            <FiX />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Complaint Details Section */}
                <div className="form-section span-2">
                  <h3>Complaint Details</h3>
                  <div className="section-grid">
                    <div className="form-field">
                      <label>
                        Complaint Type
                        <span className="required">*</span>
                      </label>
                      <div className="select-with-clear">
                        <select
                          name="Complaint Type"
                          value={form["Complaint Type"]}
                          onChange={handleChange}
                          required
                        >
                          <option value="">Select Complaint Type</option>
                          {FIELD_MAPPINGS["Complaint Type"].options.map(
                            (opt) => (
                              <option key={opt} value={opt}>
                                {opt}
                              </option>
                            )
                          )}
                        </select>
                        {form["Complaint Type"] && (
                          <button
                            type="button"
                            className="clear-select"
                            onClick={() => clearField("Complaint Type")}
                            aria-label="Clear complaint type"
                          >
                            <FiX />
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="form-field">
                      <label>Complaint Sub-Type</label>
                      <div className="select-with-clear">
                        <select
                          name="Complaint Sub-Type"
                          value={form["Complaint Sub-Type"]}
                          onChange={handleChange}
                          disabled={!form["Complaint Type"]}
                        >
                          <option value="">Select Sub-Type</option>
                          {form["Complaint Type"] &&
                            FIELD_MAPPINGS["Complaint Sub-Type"].options[
                              form["Complaint Type"]
                            ]?.map((opt) => (
                              <option key={opt} value={opt}>
                                {opt}
                              </option>
                            ))}
                        </select>
                        {form["Complaint Sub-Type"] && (
                          <button
                            type="button"
                            className="clear-select"
                            onClick={() => clearField("Complaint Sub-Type")}
                            aria-label="Clear complaint sub-type"
                          >
                            <FiX />
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="form-field">
                      <label>
                        Location
                        <span className="required">*</span>
                      </label>
                      <div className="select-with-clear">
                        <select
                          name="Location"
                          value={form.Location}
                          onChange={handleChange}
                          required
                        >
                          <option value="">Select Location</option>
                          {FIELD_MAPPINGS.Location.options.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                        {form.Location && (
                          <button
                            type="button"
                            className="clear-select"
                            onClick={() => clearField("Location")}
                            aria-label="Clear location"
                          >
                            <FiX />
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="form-field">
                      <label>
                        Company Name
                        <span className="required">*</span>
                      </label>
                      <div className="select-with-clear">
                        <select
                          name="Company Name"
                          value={form["Company Name"]}
                          onChange={handleChange}
                          required
                          disabled={!form.Location}
                        >
                          <option value="">Select Branch</option>
                          {companyNameOptions.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                        {form["Company Name"] && (
                          <button
                            type="button"
                            className="clear-select"
                            onClick={() => clearField("Company Name")}
                            aria-label="Clear company name"
                          >
                            <FiX />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                {/* Complaint Description Section */}
                <div className="form-section span-2">
                  <h3>Complaint Description</h3>
                  <div className="section-grid">
                    <div className="form-field">
                      <label>
                        Title
                        <span className="required">*</span>
                      </label>
                      <input
                        type="text"
                        name="Title"
                        value={form.Title}
                        onChange={handleChange}
                        required
                        maxLength={200}
                        placeholder="Enter complaint title..."
                      />
                    </div>
                    <div className="form-field span-2">
                      <label>
                        Description
                        <span className="required">*</span>
                      </label>
                      <textarea
                        name="Description"
                        value={form.Description}
                        onChange={handleChange}
                        required
                        rows={5}
                        maxLength={2000}
                        placeholder="Describe your complaint in detail..."
                      />
                    </div>
                  </div>
                </div>
                {/* File upload */}
                <div className="form-section span-2">
                  <h3>Attachments</h3>
                  <div className="form-field">
                    <label>Upload Files (max {MAX_FILE_COUNT} files)</label>
                    <div className="file-upload">
                      <label className="file-upload-btn">
                        <input
                          type="file"
                          multiple
                          onChange={handleFileChange}
                          accept={ALLOWED_FILE_TYPES.join(",")}
                          disabled={files.length >= MAX_FILE_COUNT}
                          ref={fileInputRef}
                        />
                        <FiPaperclip /> Choose Files
                      </label>
                      <p className="file-hint">
                        Allowed: JPG, PNG, PDF (max{" "}
                        {MAX_FILE_SIZE / 1024 / 1024}MB each)
                      </p>
                      {files.length > 0 && (
                        <div className="file-preview">
                          {files.map((file, i) => (
                            <div key={i} className="file-item">
                              <div className="file-info">
                                <FiPaperclip />
                                <span className="file-name" title={file.name}>
                                  {file.name.length > 30
                                    ? `${file.name.substring(
                                        0,
                                        15
                                      )}...${file.name.substring(
                                        file.name.length - 10
                                      )}`
                                    : file.name}
                                </span>
                                <span className="file-size">
                                  ({(file.size / 1024).toFixed(1)}KB)
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() => removeFile(i)}
                                className="remove-file-btn"
                                aria-label={`Remove file ${file.name}`}
                              >
                                <FiX />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                {/* Submit button */}
                <div className="form-actions span-2">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="reset-btn"
                  >
                    Reset Form
                  </button>
                  <button
                    type="submit"
                    disabled={loadingForm}
                    className="submit-btn"
                  >
                    {loadingForm ? (
                      <>
                        <div className="spinner"></div>
                        Submitting...
                      </>
                    ) : (
                      "Submit Complaint"
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        ) : (
          <div className="history-container">
            <header>
              <h1>My Complaints</h1>
              <div className="search-filter">
                <div className="search-bar">
                  <FiSearch />
                  <input
                    type="text"
                    placeholder="Search complaints..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="status-filters">
                  <button
                    className={statusFilter === "all" ? "active" : ""}
                    onClick={() => setStatusFilter("all")}
                    aria-label="Show all complaints"
                  >
                    All
                  </button>
                  {Object.entries(STATUS_CONFIG).map(([status, config]) => (
                    <button
                      key={status}
                      className={statusFilter === status ? "active" : ""}
                      onClick={() => setStatusFilter(status)}
                      style={{ color: config.color }}
                      aria-label={`Show ${status} complaints`}
                    >
                      {config.icon}
                      {config.text}
                    </button>
                  ))}
                </div>
              </div>
            </header>
            {loadingComplaints ? (
              <LoadingSpinner />
            ) : fetchError ? (
              <div className="error-message">
                <FiAlertCircle />
                <p>{fetchError}</p>
                <button onClick={fetchComplaints}>Retry</button>
              </div>
            ) : filteredComplaints.length === 0 ? (
              <div className="empty-state">
                <p>
                  {searchTerm
                    ? "No matching complaints found"
                    : "You haven't submitted any complaints yet"}
                </p>
                <button
                  className="new-complaint-btn"
                  onClick={() => {
                    setActiveTab("new");
                    resetForm();
                  }}
                >
                  <FiPlus /> Register New Complaint
                </button>
              </div>
            ) : (
              <div className="complaints-grid">
                {filteredComplaints.map((complaint) => (
                  <ComplaintCard
                    key={complaint.complaintId}
                    complaint={complaint}
                    expanded={expandedComplaint === complaint.complaintId}
                    onToggleExpand={() =>
                      toggleComplaintExpand(complaint.complaintId)
                    }
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};
export default UserDashboard;

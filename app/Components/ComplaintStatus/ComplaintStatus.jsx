"use client";
import React, { useState } from "react";
import "./ComplaintStatus.css";

const StatusBox = ({ status }) => {
  const getColor = () => {
    switch (status) {
      case "Pending":
        return "#f39c12";
      case "In Progress":
        return "#3498db";
      case "Resolved":
        return "#2ecc71";
      default:
        return "#7f8c8d";
    }
  };

  return (
    <div className="status-box" style={{ backgroundColor: getColor() }}>
      <div className="dot" />
      <span>{status}</span>
    </div>
  );
};

const CheckStatus = () => {
  const [complaintId, setComplaintId] = useState("");
  const [statusData, setStatusData] = useState(null);
  const [error, setError] = useState("");

  const handleCheck = async () => {
    if (!complaintId.trim()) {
      setError("Please enter a complaint ID.");
      setStatusData(null);
      return;
    }

    try {
      const response = await fetch(`/api/complaint/${complaintId}`);
      if (!response.ok) {
        throw new Error("Complaint not found.");
      }

      const data = await response.json();
      setStatusData({
        status: data.status,
        message: `Complaint titled "${data.title}" is currently ${data.status}.`,
      });
      setError("");
    } catch (err) {
      setStatusData(null);
      setError(err.message);
    }
  };

  return (
    <div className="status-page">
      <div className="status-container">
        <h2>🔎 Check Complaint Status</h2>

        <label htmlFor="complaintId">Complaint ID</label>
        <input
          type="text"
          id="complaintId"
          value={complaintId}
          onChange={(e) => setComplaintId(e.target.value)}
          placeholder="Enter your complaint ID"
        />

        <button onClick={handleCheck}>Check Status</button>

        {error && <p className="error-message">{error}</p>}

        {statusData && (
          <div className="status-section">
            <StatusBox status={statusData.status} />
            <p className="status-message">{statusData.message}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckStatus;

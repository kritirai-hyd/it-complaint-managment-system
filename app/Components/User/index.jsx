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

// ... (rest of the imports and constants remain the same)

const UserDashboard = () => {
  // ... (state and other variables remain the same)

  return (
    <div className="dashboard-container">
      <div className="mobile-header">
        <button className="menu-toggle" onClick={toggleSidebar} aria-label="Toggle menu">
          {isSidebarOpen ? <FiX /> : <FiList />}
        </button>
        <h2>
          <FiHome className="logo-icon" />
          Complaint Portal
        </h2>
        <div className="mobile-user">
          {session?.user?.image ? (
            <Image
              src={session.user.image}
              alt="User"
              width={36}
              height={36}
              priority
            />
          ) : (
            <FiUser className="default-avatar" />
          )}
        </div>
      </div>
      
      {/* Sidebar Overlay */}
      <div 
        className={`sidebar-overlay ${isSidebarOpen ? 'active' : ''}`}
        onClick={closeSidebar}
      />
      
      {/* Updated Sidebar with close button */}
      <aside className={`sidebar ${isSidebarOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-header-top">
            <h2>
              <FiHome className="logo-icon" /> Complaint Portal
            </h2>
            <button className="sidebar-close" onClick={closeSidebar} aria-label="Close sidebar">
              <FiX />
            </button>
          </div>
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
            className={`new-complaint-btn ${activeTab === "new" ? "active" : ""}`}
            onClick={() => handleNavClick("new")}
          >
            <FiPlus /> Register New Complaint
          </button>
          <button
            className={`nav-link ${activeTab === "history" ? "active" : ""}`}
            onClick={() => handleNavClick("history")}
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

      {/* ... (rest of the component remains the same) */}
    </div>
  );
};

export default UserDashboard;
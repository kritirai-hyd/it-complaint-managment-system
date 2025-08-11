"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Link from "next/link";
import "../../assets/register.css";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    oldPassword: "",
  });

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.oldPassword) {
      setMessage("Passwords do not match.");
      setMessageType("error");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post("/api/register", formData);
      setMessage("Registered successfully!");
  
    } catch (err) {
      setMessage(err.response?.data?.error || "Registration failed.");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  const isFormValid =
    formData.name &&
    formData.email &&
    formData.phone &&
    formData.password &&
    formData.oldPassword;

  return (
    <div className="register-container">
      <div className="register-card">
        <div className="register-header">
     <h2>Create User Account</h2>
      </div>
      <form onSubmit={handleSubmit} className="register-form">
        <div className="form-group">
        <label htmlFor="name">Name</label>
        <input
          name="name"
          id="name"
          required
           placeholder="Enter your full name"
          value={formData.name}
          onChange={handleChange}
        />
</div>
  <div className="form-group">
        <label htmlFor="email">Email</label>
        <input
          type="email"
          name="email"
          id="email"
          placeholder="Enter your email"
          required
          value={formData.email}
          onChange={handleChange}
        /></div>
  <div className="form-group">
        <label htmlFor="phone">Phone</label>
        <input
          name="phone"
          id="phone"
             placeholder="Enter your phone number"
          required
          value={formData.phone}
          onChange={handleChange}
        /></div>
  <div className="form-group">
        <label htmlFor="password">Password</label>
        <input
          type="password"
          name="password"
          id="password"
             placeholder="Create a password (min 6 characters)"
          required
          value={formData.password}
          onChange={handleChange}
        /></div>
  <div className="form-group">
        <label htmlFor="oldPassword">Confirm Password</label>
        <input
          type="password"
          name="oldPassword"
          id="oldPassword"
           placeholder="Confirm your password"
          required
          value={formData.oldPassword}
          onChange={handleChange}
        />
</div>
        {message && (
          <p className={messageType === "success" ? "success-message" : "error-message"}>
            {message}
          </p>
        )}

        <button type="submit" className="register-button" disabled={!isFormValid || loading}>
          {loading ? "Registering..." : "Register"}
        </button>
      </form>

      <div className="login-link">
        Already have an account? <Link href="/login">Login here</Link>
      </div>
      </div>
    </div>
  );
};

export default Register;

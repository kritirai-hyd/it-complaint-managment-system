"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Link from "next/link";
import "./AdminRegister.css";

const AdminRegister = () => {
  const router = useRouter();
  const otpInputRef = useRef(null);
  
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "",
    otp: ""
  });
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [resendDisabled, setResendDisabled] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (step === 2 && otpInputRef.current) {
      otpInputRef.current.focus();
      startResendCooldown();
    }
  }, [step]);

  useEffect(() => {
    let interval = null;
    if (resendDisabled && resendTimer > 0) {
      interval = setInterval(() => setResendTimer((t) => t - 1), 1000);
    } else if (resendTimer === 0) {
      setResendDisabled(false);
      setResendTimer(30);
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [resendDisabled, resendTimer]);

  useEffect(() => {
    if (loading) {
      const interval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, step === 1 ? 50 : 90));
      }, 300);
      return () => clearInterval(interval);
    } else {
      setProgress(0);
    }
  }, [loading, step]);

  const startResendCooldown = () => {
    setResendDisabled(true);
    setResendTimer(30);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setMessage({ text: "", type: "" });
  };

  const validateForm = () => {
    if (!formData.name || !formData.email || !formData.phone || 
        !formData.password || !formData.confirmPassword || !formData.role) {
      setMessage({ text: "All fields are required.", type: "error" });
      return false;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setMessage({ text: "Passwords do not match.", type: "error" });
      return false;
    }
    
    if (formData.password.length < 6) {
      setMessage({ text: "Password must be at least 6 characters.", type: "error" });
      return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setMessage({ text: "Please enter a valid email address.", type: "error" });
      return false;
    }
    
    const phoneRegex = /^[0-9]{10,15}$/;
    if (!phoneRegex.test(formData.phone)) {
      setMessage({ text: "Please enter a valid phone number.", type: "error" });
      return false;
    }
    
    return true;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: "", type: "" });

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      const res = await axios.post("/api/admin/request-otp", {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role: formData.role
      });

      if (res.status === 200) {
        setStep(2);
        setMessage({ text: "OTP sent to your email. Please verify.", type: "success" });
      } else {
        setMessage({ text: res.data?.error || "Registration failed.", type: "error" });
      }
    } catch (err) {
      setMessage({ 
        text: err.response?.data?.error || "An error occurred during registration.", 
        type: "error" 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: "", type: "" });

    if (!formData.otp || !/^\d{6}$/.test(formData.otp.trim())) {
      setMessage({ text: "Please enter a valid 6-digit OTP.", type: "error" });
      setLoading(false);
      return;
    }

    try {
      const res = await axios.post("/api/admin/verify-otp", {
        email: formData.email,
        otp: formData.otp
      });

      if (res.status === 200) {
        setProgress(100);
        setMessage({ text: "Registration successful! Redirecting to login...", type: "success" });
        
        // Redirect to login after a short delay
        setTimeout(() => {
          router.push("/admin/login");
        }, 2000);
      } else {
        setMessage({ text: res.data?.error || "OTP verification failed.", type: "error" });
      }
    } catch (err) {
      setMessage({ 
        text: err.response?.data?.error || "An error occurred during OTP verification.", 
        type: "error" 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendDisabled) return;
    setLoading(true);
    setMessage({ text: "", type: "" });

    try {
      const res = await axios.post("/api/admin/request-otp", {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role: formData.role
      });

      if (res.status === 200) {
        setMessage({ text: "New OTP sent to your email.", type: "success" });
        startResendCooldown();
      } else {
        setMessage({ text: res.data?.error || "Failed to resend OTP.", type: "error" });
      }
    } catch (err) {
      setMessage({ 
        text: err.response?.data?.error || "An error occurred while resending OTP.", 
        type: "error" 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setStep(1);
    setMessage({ text: "", type: "" });
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <div className="progress-bar" style={{ width: `${progress}%` }}></div>
        
        <div className="register-header">
          <h2>{step === 1 ? "Create Admin Account" : "Verify Email"}</h2>
          <p className="subtitle">
            {step === 1 ? "Join us today!" : `Enter the code sent to ${formData.email}`}
          </p>
        </div>

        {message.text && (
          <div className={`message ${message.type}-message`}>
            {message.text}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleRegister} className="register-form">
            <div className="form-group">
              <label>Full Name</label>
              <input
                name="name"
                required
                value={formData.name}
                placeholder="Enter your full name"
                onChange={handleChange}
                disabled={loading}
              />
            </div>
            
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                placeholder="Enter your email"
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>
            
            <div className="form-group">
              <label>Phone Number</label>
              <input
                name="phone"
                required
                value={formData.phone}
                placeholder="Enter your phone number"
                onChange={handleChange}
                disabled={loading}
              />
            </div>
            
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                placeholder="Create a password (min 6 characters)"
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>
            
            <div className="form-group">
              <label>Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                placeholder="Confirm your password"
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>
            
            <div className="form-group">
              <label>Role</label>
              <select
                name="role"
                required
                value={formData.role}
                onChange={handleChange}
                disabled={loading}
              >
                <option value="">-- Select Role --</option>
                <option value="admin">Admin</option>
                <option value="manager">Manager</option>
                <option value="engineer">Engineer</option>
              </select>
            </div>
            
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Sending OTP...
                </>
              ) : (
                'Continue'
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP} className="register-form">
            <div className="form-group">
              <label>Verification Code</label>
              <input
                name="otp"
                type="text"
                maxLength={6}
                required
                ref={otpInputRef}
                value={formData.otp}
                onChange={handleChange}
                inputMode="numeric"
                pattern="\d{6}"
                autoComplete="one-time-code"
                placeholder="Enter 6-digit OTP"
                disabled={loading}
                className="otp-input"
              />
            </div>
            
            <div className="button-group">
              <button type="submit" disabled={loading} className="btn-primary">
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Verifying...
                  </>
                ) : (
                  'Verify & Create Account'
                )}
              </button>
              
              <button
                type="button"
                onClick={handleBack}
                disabled={loading}
                className="btn-secondary"
              >
                Back
              </button>
            </div>
            
            <div className="resend-container">
              <button
                type="button"
                onClick={handleResendOTP}
                disabled={resendDisabled || loading}
                className="resend-button"
              >
                Resend OTP {resendDisabled ? `(${resendTimer}s)` : ""}
              </button>
            </div>
            
            <p className="otp-note">
              Didn't receive the code? Check your spam folder or try again.
            </p>
          </form>
        )}

        <div className="login-link">
          Already have an account? <Link href="/admin/login">Login here</Link>
        </div>
      </div>
    </div>
  );
};

export default AdminRegister;
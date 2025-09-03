"use client";

import React, { useState, useEffect, useRef } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import userImg from "../../assets/images/user.png";
import "./Login.css";

const UnifiedLogin = () => {
  const router = useRouter();
  const otpInputRef = useRef(null);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "",
    otp: "",
  });

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [resendDisabled, setResendDisabled] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);

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

  const startResendCooldown = () => {
    setResendDisabled(true);
    setResendTimer(30);
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setMessage({ text: "", type: "" });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: "", type: "" });

    const role = formData.role.toLowerCase();

    if (!formData.email || !formData.password || !formData.role) {
      setMessage({ text: "All fields are required.", type: "error" });
      setLoading(false);
      return;
    }

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email: formData.email.trim(),
        password: formData.password.trim(),
        role,
      });

      if (res?.error) {
        if (res.error.includes("OTP_REQUIRED")) {
          setStep(2);
          setMessage({ text: "OTP sent to your email. Please check your inbox.", type: "info" });
          setFormData((prev) => ({ ...prev, otp: "" }));
        } else {
          throw new Error(res.error);
        }
      } else if (res?.ok) {
        router.push(`/${role}/dashboard`);
      }
    } catch (err) {
      setMessage({ text: err.message || "Login failed.", type: "error" });
      setFormData((prev) => ({ ...prev, password: "" }));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setMessage({ text: "", type: "" });

    if (!formData.email || !formData.password || !formData.role || !formData.otp) {
      setMessage({ text: "All fields including OTP are required.", type: "error" });
      return;
    }
    if (!/^\d{6}$/.test(formData.otp.trim())) {
      setMessage({ text: "OTP must be 6 digits.", type: "error" });
      return;
    }

    setLoading(true);
    try {
      const res = await signIn("credentials", {
        redirect: false,
        email: formData.email.trim(),
        password: formData.password.trim(),
        role: formData.role.toLowerCase(),
        otp: formData.otp.trim(),
      });

      if (res?.error) {
        throw new Error(res.error);
      }
      if (res?.ok) {
        router.push(`/${formData.role.toLowerCase()}/dashboard`);
      }
    } catch (err) {
      setMessage({ text: err.message || "OTP verification failed.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendDisabled) return;
    setLoading(true);
    setMessage({ text: "", type: "" });
    setFormData((prev) => ({ ...prev, otp: "" }));

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email: formData.email.trim(),
        password: formData.password.trim(),
        role: formData.role.toLowerCase(),
      });

      if (res?.error && res.error.includes("OTP_REQUIRED")) {
        setMessage({ text: "New OTP sent to your email.", type: "info" });
        startResendCooldown();
      } else if (res?.error) {
        throw new Error(res.error);
      }
    } catch (err) {
      setMessage({ text: err.message || "Failed to resend OTP.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setStep(1);
    setFormData((prev) => ({ ...prev, otp: "", password: "" }));
    setMessage({ text: "", type: "" });
  };

  return (
    <div className="dashboard">
      <div className="main">
        <header className="header">
          <h1>Backend Login Dashboard</h1>
          <div className="user-info">
            <span>Welcome, Backend Login</span>
            <Image src={userImg} width={40} height={40} alt="User" />
          </div>
        </header>

        <div className="login-container" style={{ maxWidth: 400, margin: "auto" }}>
          <h2>{step === 1 ? "Backend Login" : "Verify OTP"}</h2>

          {step === 1 && (
            <form onSubmit={handleLogin}>
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
              />

              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
              />

              <label htmlFor="role">Role</label>
              <select
                id="role"
                name="role"
                required
                value={formData.role}
                onChange={handleChange}
                disabled={step === 2} // prevent role change during OTP
              >
                <option value="">-- Select Role --</option>
                <option value="admin">Admin</option>
                <option value="manager">Manager</option>
                <option value="engineer">Engineer</option>
                <option value="user">User</option>
              </select>

              {message.text && (
                <p
                  style={{
                    color: message.type === "error" ? "red" : message.type === "info" ? "blue" : "black",
                    marginTop: "10px",
                  }}
                  role="alert"
                >
                  {message.text}
                </p>
              )}

              <button type="submit" disabled={loading} style={{ marginTop: "15px" }}>
                {loading ? "Logging in..." : "Login"}
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleVerifyOTP}>
              <label htmlFor="otp">Enter OTP</label>
              <input
                id="otp"
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
              />

              {message.text && (
                <p
                  style={{
                    color: message.type === "error" ? "red" : message.type === "info" ? "blue" : "black",
                    marginTop: "10px",
                  }}
                  role="alert"
                >
                  {message.text}
                </p>
              )}

              <div style={{ marginTop: "15px" }}>
                <button type="submit" disabled={loading}>
                  {loading ? "Verifying..." : "Verify OTP"}
                </button>
                <button
                  type="button"
                  onClick={handleBack}
                  disabled={loading}
                  style={{ marginLeft: "10px" }}
                >
                  Back
                </button>
              </div>

              <div style={{ marginTop: "10px" }}>
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={resendDisabled || loading}
                >
                  Resend OTP {resendDisabled ? `(${resendTimer}s)` : ""}
                </button>
              </div>
            </form>
          )}

          <p style={{ marginTop: "20px" }}>
            Don't have an account?{" "}
            <Link href="/auth/register" style={{ color: "#0070f3" }}>
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default UnifiedLogin;

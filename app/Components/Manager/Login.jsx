"use client";
import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import "../Admin/Login.css"; // Ensure this path is correct
import a from '../../assets/images/user.png'
import Image from "next/image";
const ManagerLogin = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { email, password, role } = formData;

    if (!email || !password || !role) {
      setError("All fields are required.");
      return;
    }

    setLoading(true);
    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
      role: role.toLowerCase(),
    });
    setLoading(false);

    if (res?.ok) {
      setSuccess("Login successful! Redirecting...");
      const redirectMap = {
        admin: "/admin/dashboard",
        engineer: "/engineer/dashboard",
         manager: "/manager/dashboard",
      };
      setTimeout(() => {
        router.push(redirectMap[role.toLowerCase()] || "/");
      }, 1000);
    } else {
      setError(res?.error || "Login failed. Check your credentials.");
      setFormData((prev) => ({ ...prev, password: "" }));
    }
  };

  return (
    <div className="dashboard">
      {/* Sidebar */}
      <aside className="sidebar">
        <h2 className="logo">Backend Login Dashboard</h2>
        <nav>
         
          <a href="/admin/login" className="active">Admin</a>
          <a href="/manager/login">Manager</a>
          <a href="/engineer/login">Engineer</a>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="main">
        <header className="header">
          <h1>Backend Login Dashboard</h1>
          <div className="user-info">
            <span>Welcome, Manager</span>
            <Image src={a} width={40} height={40}  alt="User" />
          </div>
        </header>

        {/* Login Form */}
        <div className="login-container">
          <h2>Manager Login</h2>
          <form onSubmit={handleSubmit}>
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
            >
              <option value="">-- Select Role --</option>
              <option value="admin">Admin</option>
                            <option value="manager">Manager</option>
              <option value="engineer">Engineer</option>
              
            </select>

            {error && <p style={{ color: "red" }}>{error}</p>}
            {success && <p style={{ color: "green" }}>{success}</p>}

            <button type="submit" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          {/* <div className="register-link">
            Don't have an account? <Link href="/manager/register">Register here</Link>
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default ManagerLogin;

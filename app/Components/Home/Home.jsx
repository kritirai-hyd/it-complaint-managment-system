"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import "./Home.css";
import Login from "../User/Login";

const Main = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const router = useRouter();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { email, password } = formData;

    if (!email || !password) {
      setError("All fields are required.");
      return;
    }

    setLoading(true);

    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    setLoading(false);

    if (res?.ok) {
      setSuccess("Login successful! Redirecting...");
      setTimeout(() => {
        router.push("/user/dashboard");
      }, 1000);
    } else {
      setError(res?.error || "Login failed. Please check your credentials.");
      setFormData((prev) => ({ ...prev, password: "" }));
    }
  };

  const isFormValid = formData.email && formData.password;

  return (
    <div className="login-page">
      {/* Header / Navbar */}
      <header className="header">
        <div className="logo-container">
     
          <h1 className="logo-text">IT Complaint Management</h1>
        </div>
        <nav className="nav">
          <ul className="nav-list">
            <li className="nav-item">
              <Link href="/register" className="nav-link">
                Register
              </Link>
            </li>
            <li className="nav-item">
              <Link href="/check-status" className="nav-link">
                Check Complaint Status
              </Link>
            </li>
          </ul>
        </nav>
      </header>

      {/* Main Content */}

        {/* Login Form */}
        
      <Login />

        {/* Illustration */}
      

    </div>
  );
};

export default Main;
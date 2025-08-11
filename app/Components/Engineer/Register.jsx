"use client";
import { React, useState} from 'react'
import { useRouter } from 'next/navigation';
import axios from 'axios';
import '../../assets/register.css';
const EngineerRegister = () => {
  const [ formData, setFromatData ] = useState({ name: "", email: "", phone: "", password: "", oldPassword: "", role: "" });
  const [ message, setMessage ] = useState("");
  const router = useRouter();
  const handleChange = (e) => {
    setFromatData({...formData, [e.target.name]: e.target.value});
    setMessage("");
  }
const handlesubmit = async (e) => {
  e.preventDefault();
  try{
    const res = await axios.post("/api/engineer", formData);
     setMessage("Register Sucessfully");
     setTimeout(() => router.push("/engineer/login"), 5000)
  }catch(err){
    setMessage(err.response?.data?.error || "Registation Failed");
  }
}
  return ( 
    <>
      <div className="register-container">
        <div className="register-card">
          <div className="register-header">
            <h2>Create Engineer Account</h2>
          </div>
        </div>
        <form onSubmit={handlesubmit} className="register-form">
          <div className="form-group">
            <label>Name</label>
            <input
              name="name"
              required
              value={formData.name}
              placeholder="Enter your full name"
              onChange={handleChange}
            />
          </div>{" "}
          <div className="form-group">
            {" "}
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              placeholder="Enter your email"
              onChange={handleChange}
              required
            />
          </div>{" "}
          <div className="form-group">
            <label>Phone</label>
            <input
              name="phone"
              required
              value={formData.phone}
              placeholder="Enter your phone number"
              onChange={handleChange}
            />
          </div>{" "}
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              placeholder="Create a password (min 6 characters)"
              onChange={handleChange}
              required
            />
          </div>{" "}
           <div className="form-group">
          <label>Confirm Password</label>
          <input
            type="password"
            name="oldPassword"
            value={formData.oldPassword}
            placeholder="Confirm your password"
            onChange={handleChange}
            required
          /></div>
          <div className="form-group">
            {" "}
            <label>Role</label>
            <select
              name="role"
              required
              value={formData.role}
              onChange={handleChange}
            >
              <option value>-- Select Role --</option>

              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
              <option value="engineer">Engineer</option>
            </select>
          </div>
          {message && <p className="message">{message}</p>}
          <button type="submit" className="register-button">
            Register
          </button>
        </form>
        <div className="login-link">
          Already have an account? <a href="/admin/login">Login here</a>
        </div>
      </div>


    </>
  )
}

export default EngineerRegister
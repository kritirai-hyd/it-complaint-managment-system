// src/components/RegisterPage.js
'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './Register.module.css';

export default function Register() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'user',
    otp: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [progress, setProgress] = useState(0);
  const otpInputRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    if (step === 2 && otpInputRef.current) {
      otpInputRef.current.focus();
    }
  }, [step]);

  useEffect(() => {
    // Simulate progress for demo purposes
    if (loading) {
      const interval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 300);
      return () => clearInterval(interval);
    } else {
      setProgress(0);
    }
  }, [loading]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', type: '' });

    try {
      const res = await fetch('/api/register/request-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          password: form.password
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setStep(2);
        setMessage({ text: 'OTP sent to your email. Please verify.', type: 'success' });
      } else {
        setMessage({ text: data.error || 'Registration failed.', type: 'error' });
      }
    } catch (error) {
      setMessage({ text: 'An error occurred.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };
const handleVerifyOTP = async (e) => {
  e.preventDefault();
  setLoading(true);
  setMessage({ text: '', type: '' });
  setProgress(10);

  try {
    const res = await fetch('/api/register/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: form.email,
        otp: form.otp,
        name: form.name,
        phone: form.phone,
        password: form.password,
      }),
    });

    const data = await res.json();

    if (res.ok) {
      setProgress(100);
      setMessage({ text: 'Registration successful. Redirecting...', type: 'success' });
      setTimeout(() => {
        router.push('/login');
      }, 1500);
    } else {
      setMessage({ text: data.error || 'OTP verification failed.', type: 'error' });
    }
  } catch (error) {
    setMessage({ text: 'An error occurred.', type: 'error' });
  } finally {
    setLoading(false);
  }
};


  const handleResendOTP = async () => {
    setMessage({ text: '', type: '' });
    setLoading(true);

    try {
      const res = await fetch('/api/register/request-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          password: form.password
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage({ text: 'New OTP sent to your email.', type: 'success' });
      } else {
        setMessage({ text: data.error || 'Failed to resend OTP.', type: 'error' });
      }
    } catch (error) {
      setMessage({ text: 'Error occurred while resending OTP.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.registerContainer}>
      <div className={styles.registerCard}>
        <div className={styles.progressBar} style={{ width: `${progress}%` }}></div>
        
        <div className={styles.cardHeader}>
          <h2 className={styles.title}>{step === 1 ? 'Create Account' : 'Verify Email'}</h2>
          <p className={styles.subtitle}>
            {step === 1 ? 'Join us today!' : `Enter the code sent to ${form.email}`}
          </p>
        </div>

        {message.text && (
          <div className={`${styles.message} ${message.type === 'success' ? styles.success : styles.error}`}>
            {message.text}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleRegister} className={styles.form}>
            <div className={styles.inputGroup}>
              <input 
                name="name" 
                placeholder="Full Name" 
                onChange={handleChange} 
                required 
                disabled={loading}
              />
            </div>
            
            <div className={styles.inputGroup}>
              <input 
                name="email" 
                placeholder="Email Address" 
                type="email" 
                onChange={handleChange} 
                required 
                disabled={loading}
              />
            </div>
            
            <div className={styles.inputGroup}>
              <input 
                name="phone" 
                placeholder="Phone Number" 
                onChange={handleChange} 
                required 
                disabled={loading}
              />
            </div>
            
            <div className={styles.inputGroup}>
              <input 
                name="password" 
                type="password" 
                placeholder="Password" 
                onChange={handleChange} 
                required 
                disabled={loading}
              />
            </div>
            
            <button type="submit" disabled={loading} className={styles.btnPrimary}>
              {loading ? (
                <>
                  <span className={styles.spinner}></span>
                  Sending OTP...
                </>
              ) : (
                'Continue'
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP} className={styles.form}>
            <div className={styles.otpContainer}>
              <input
                name="otp"
                placeholder="• • • • • •"
                onChange={handleChange}
                value={form.otp}
                ref={otpInputRef}
                maxLength={6}
                inputMode="numeric"
                required
                disabled={loading}
                className={styles.otpInput}
              />
            </div>
            
            <button type="submit" disabled={loading} className={styles.btnPrimary}>
              {loading ? (
                <>
                  <span className={styles.spinner}></span>
                  Verifying...
                </>
              ) : (
                'Verify & Create Account'
              )}
            </button>
            
            <button
              type="button"
              onClick={handleResendOTP}
              disabled={loading}
              className={styles.btnSecondary}
            >
              {loading ? 'Sending...' : 'Resend Code'}
            </button>
            
            <p className={styles.otpNote}>
              Didn't receive the code? Check your spam folder or try again in 60 seconds.
            </p>
          </form>
        )}

        <div className={styles.cardFooter}>
          <p>
            Already have an account? <Link href="/login" className={styles.link}>Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
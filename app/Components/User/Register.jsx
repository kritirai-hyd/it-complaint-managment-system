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
    confirmPassword: '',
    otp: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [progress, setProgress] = useState(0);
  const [countdown, setCountdown] = useState(0);
  const otpInputRef = useRef(null);
  const router = useRouter();

  // Focus on OTP input on step 2
  useEffect(() => {
    if (step === 2 && otpInputRef.current) {
      otpInputRef.current.focus();
    }
  }, [step]);

  // Countdown timer for OTP resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Simulate progress
  useEffect(() => {
    if (loading) {
      const interval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90));
      }, 300);
      return () => clearInterval(interval);
    } else {
      setProgress(0);
    }
  }, [loading]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    if (form.password.length < 8) {
      setMessage({ text: 'Password must be at least 8 characters.', type: 'error' });
      return false;
    }

    if (form.password !== form.confirmPassword) {
      setMessage({ text: 'Passwords do not match.', type: 'error' });
      return false;
    }

    const phoneRegex = /^\d{10,15}$/;
    if (!phoneRegex.test(form.phone)) {
      setMessage({ text: 'Enter a valid phone number.', type: 'error' });
      return false;
    }

    return true;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });

    if (!validateForm()) return;

    setLoading(true);

    try {
      const res = await fetch('/api/register/request-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          password: form.password,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setStep(2);
        setForm((prev) => ({ ...prev, otp: '' }));
        setMessage({ text: 'OTP sent to your email. Please verify.', type: 'success' });
        setCountdown(60); // Start 60-second countdown
      } else {
        setMessage({ text: data.error || 'Registration failed.', type: 'error' });
      }
    } catch (error) {
      setMessage({ text: 'An error occurred. Please try again.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setProgress(10);
    setMessage({ text: '', type: '' });

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
        setTimeout(() => router.push('/login'), 1500);
      } else {
        setMessage({ text: data.error || 'OTP verification failed.', type: 'error' });
      }
    } catch (error) {
      setMessage({ text: 'An error occurred during OTP verification.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (countdown > 0) return;
    
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
          password: form.password,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setForm((prev) => ({ ...prev, otp: '' }));
        setMessage({ text: 'New OTP sent to your email.', type: 'success' });
        setCountdown(60); // Reset countdown
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
          <div className={styles.stepIndicator}>
            <div className={`${styles.step} ${step >= 1 ? styles.active : ''}`}>
              <span>1</span>
            </div>
            <div className={styles.stepLine}></div>
            <div className={`${styles.step} ${step >= 2 ? styles.active : ''}`}>
              <span>2</span>
            </div>
          </div>
          
          <h2 className={styles.title}>{step === 1 ? 'Create Account' : 'Verify Email'}</h2>
          <p className={styles.subtitle}>
            {step === 1 ? 'Join us today!' : `Enter the code sent to ${form.email}`}
          </p>
        </div>

        {message.text && (
          <div className={`${styles.message} ${message.type === 'success' ? styles.success : styles.error}`}>
            <span className={styles.messageIcon}>
              {message.type === 'success' ? '✓' : '!'}
            </span>
            {message.text}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleRegister} className={styles.form}>
            <div className={styles.inputGroup}>
              <label htmlFor="name">Full Name</label>
              <input
                id="name"
                name="name"
                placeholder="Enter your full name"
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                name="email"
                placeholder="Enter your email"
                type="email"
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="phone">Phone Number</label>
              <input
                id="phone"
                name="phone"
                placeholder="Enter your phone number"
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="password">Password</label>
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Create a strong password"
                onChange={handleChange}
                required
                disabled={loading}
              />
              {form.password && (
                <div className={styles.passwordStrength}>
                  <div className={`${styles.strengthBar} ${
                    form.password.length < 8 ? styles.weak : 
                    form.password.length < 12 ? styles.medium : styles.strong
                  }`}></div>
                  <span className={styles.strengthText}>
                    {form.password.length < 8 ? 'Weak' : 
                     form.password.length < 12 ? 'Medium' : 'Strong'}
                  </span>
                </div>
              )}
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                placeholder="Confirm your password"
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>

            <div className={styles.inputGroupCheckbox}>
              <input
                type="checkbox"
                id="showPassword"
                checked={showPassword}
                onChange={() => setShowPassword((prev) => !prev)}
              />
              <label htmlFor="showPassword">Show Password</label>
            </div>

            <button type="submit" disabled={loading} className={styles.btnPrimary}>
              {loading ? (
                <>
                  <span className={styles.spinner}></span> Sending OTP...
                </>
              ) : (
                'Continue'
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP} className={styles.form}>
            <div className={styles.otpContainer}>
              <label>Verification Code</label>
              <input
                name="otp"
                placeholder="• • • • • •"
                onChange={handleChange}
                value={form.otp}
                ref={otpInputRef}
                maxLength={6}
                inputMode="numeric"
                pattern="[0-9]*"
                required
                disabled={loading}
                className={styles.otpInput}
              />
              <p className={styles.otpHint}>Enter the 6-digit code sent to your email</p>
            </div>

            <button type="submit" disabled={loading} className={styles.btnPrimary}>
              {loading ? (
                <>
                  <span className={styles.spinner}></span> Verifying...
                </>
              ) : (
                'Verify & Create Account'
              )}
            </button>

            <button
              type="button"
              onClick={handleResendOTP}
              disabled={loading || countdown > 0}
              className={styles.btnSecondary}
            >
              {loading ? 'Sending...' : countdown > 0 ? `Resend in ${countdown}s` : 'Resend Code'}
            </button>

            <p className={styles.otpNote}>
              Didn't receive the code? Check your spam folder or try again.
            </p>
          </form>
        )}

        <div className={styles.cardFooter}>
          <p>
            Already have an account?{' '}
            <Link href="/login" className={styles.link}>
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
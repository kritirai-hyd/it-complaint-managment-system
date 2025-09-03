'use client';

import { useState, useEffect, useRef } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import styles from './Login.module.css';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const otpRef = useRef(null);

  // Auto-focus OTP input when step 2 begins
  useEffect(() => {
    if (step === 2 && otpRef.current) {
      otpRef.current.focus();
    }
  }, [step]);

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    // Build signIn payload
    const credentials = {
      redirect: false,
      email: email.trim(),
      password,
      role,
      ...(step === 2 && { otp: otp.trim() }),
    };

    const res = await signIn('credentials', credentials);
    setLoading(false);

    if (res?.error) {
      try {
        const err = JSON.parse(res.error);

        // Server says OTP is required
        if (err.code === 'OTP_REQUIRED') {
          setStep(2);
          setMessage('✅ OTP sent to your email. Please enter it below.');
        } else {
          setMessage(`❌ ${err.message || 'Login failed'}`);
        }
      } catch {
        setMessage(`❌ ${res.error}`);
      }
    } else {
  // Redirect based on selected role
  switch (role) {
    case 'admin':
      router.push('/admin/dashboard');
      break;
    case 'manager':
      router.push('/manager/dashboard');
      break;
    case 'engineer':
      router.push('/engineer/dashboard');
      break;
    default:
      router.push('/'); // fallback
  }
}
  };

  // Resend OTP manually
  const handleResendOtp = async () => {
    setLoading(true);
    setMessage('');

    const res = await fetch('/api/auth/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim(), role }),
    });

    const data = await res.json();
    setLoading(false);

    if (res.ok) {
      setMessage('✅ OTP resent to your email.');
    } else {
      setMessage(`❌ ${data?.error || 'Failed to resend OTP.'}`);
    }
  };

  return (
    <div className={styles.dashboardContainer}>
      <div className={styles.mainContent}>
        <header className={styles.dashboardHeader}>
          <h1>Backend Login Portal </h1>
          <div className={styles.userInfo}>
            <span>Secure Backend Login Portal </span>
            <div className={styles.userAvatar}>
              <div className={styles.avatarPlaceholder}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
        </header>

        <div className={styles.loginCard}>
          <div className={styles.cardHeader}>
            <h2>Backend Login Portal </h2>
            <p>{step === 1 ? 'Enter your credentials' : 'Verify your identity'}</p>
          </div>

          <form onSubmit={handleSubmit} className={styles.loginForm}>
            {step === 1 && (
              <div className={styles.formStep}>
                <div className={styles.inputGroup}>
                  <label htmlFor="email">Email Address</label>
                  <input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label htmlFor="password">Password</label>
                  <input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label htmlFor="role">Role</label>
                  <select
                    id="role"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    required
                    disabled={loading}
                  >
                    <option value="">Select your role</option>
                    <option value="admin">Admin</option>
                    <option value="manager">Manager</option>
                    <option value="engineer">Engineer</option>
                  </select>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className={styles.formStep}>
                <div className={styles.otpInstructions}>
                  <div className={styles.otpIcon}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                      <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p>We've sent a 6-digit verification code to your email address.</p>
                </div>

                <div className={styles.inputGroup}>
                  <label htmlFor="otp">Verification Code</label>
                  <input
                    ref={otpRef}
                    id="otp"
                    type="text"
                    placeholder="Enter 6-digit code"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    maxLength={6}
                    inputMode="numeric"
                    pattern="\d{6}"
                    required
                    disabled={loading}
                  />
                </div>

                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={loading}
                  className={styles.resendButton}
                >
                  {loading ? 'Resending...' : 'Resend Code'}
                </button>
              </div>
            )}

            {message && (
              <div className={`${styles.message} ${message.includes('❌') ? styles.error : styles.success}`}>
                {message.replace('✅', '').replace('❌', '')}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={styles.submitButton}
            >
              {loading ? (
                <span className={styles.buttonLoading}>
                  <span className={styles.spinner}></span>
                  {step === 1 ? 'Logging in...' : 'Verifying...'}
                </span>
              ) : step === 1 ? 'Login' : 'Verify Code'}
            </button>
          </form>

          <div className={styles.cardFooter}>
            <p>Having trouble signing in? <a href="admin/register">Register here</a></p>
          </div>
        </div>

        <div className={styles.dashboardFooter}>
          <p>© {new Date().getFullYear()} Admin Portal. All rights reserved.</p>
          <div className={styles.footerLinks}>
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">Help</a>
          </div>
        </div>
      </div>
    </div>
  );
}
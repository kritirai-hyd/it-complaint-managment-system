'use client';

import { useState, useRef, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import styles from './Login.module.css';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const otpRef = useRef(null);

  // Focus OTP input when OTP step is active
  useEffect(() => {
    if (step === 2 && otpRef.current) {
      otpRef.current.focus();
    }
  }, [step]);

  // Handle login or OTP verification
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

const res = await signIn('credentials', {
  redirect: false,
  email: email.trim(),
  password,
  role: 'user', // ✅ Always send user role
  ...(step === 2 ? { otp: otp.trim() } : {}),
});


    setLoading(false);

    if (res?.error) {
      try {
        const errObj = JSON.parse(res.error);
        if (errObj.code === 'OTP_REQUIRED') {
          setStep(2);
          setMessage('✅ OTP sent to your email. Please enter it below.');
        } else {
          setMessage(errObj.message || '❌ Login failed.');
        }
      } catch {
        setMessage(res.error);
      }
    } else {
router.push('/user/dashboard');
    }
  };

  // Send OTP manually
  const handleAskOtp = async () => {
    setLoading(true);
    setMessage('');

    const res = await fetch('/api/auth/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
   body: JSON.stringify({ email: email.trim(), role: 'user' }),
    });

    const data = await res.json();
    setLoading(false);

    if (res.ok) {
      setStep(2); // Move to OTP step immediately
      setMessage('✅ OTP sent to your email. Please enter it below.');
    } else {
      setMessage(data?.error || '❌ Failed to send OTP.');
    }
  };

const handleResendOtp = async () => {
  setLoading(true);
  setMessage('');

  const res = await fetch('/api/auth/send-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: email.trim(), role: 'user' }), // ✅ FIXED
  });

  const data = await res.json();
  setLoading(false);

  if (res.ok) {
    setMessage('✅ OTP resent. Check your inbox.');
  } else {
    setMessage(data?.error || '❌ Failed to resend OTP.');
  }
};

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginCard}>
        <div className={styles.loginHeader}>
      <h2>User Login</h2>
          <p>Welcome back! Please enter your details to sign in.</p>
        </div>

        <form onSubmit={handleLogin} className={styles.loginForm}>
          {/* Step 1 Inputs */}
          {step === 1 && (
            <>
              <div className={styles.inputGroup}>
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
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
                />
              </div>

           

              <button
                type="button"
                onClick={handleAskOtp}
                disabled={!email || loading}
                className={styles.otpLink}
              >
                {loading ? 'Sending OTP...' : 'Send OTP to Email'}
              </button>
            </>
          )}

          {/* Step 2 - OTP Input */}
          {step === 2 && (
            <div className={styles.otpContainer}>
              <div className={styles.otpHeader}>
                <h3>Verification Required</h3>
                <p>We've sent a 6-digit code to your email</p>
              </div>
              
              <div className={styles.inputGroup}>
                <label htmlFor="otp">Enter verification code</label>
                <input
                  ref={otpRef}
                  id="otp"
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength={6}
                  pattern="\d{6}"
                  inputMode="numeric"
                  required
                />
              </div>
              
              <div className={styles.otpResend}>
                <p>Didn't receive the code?</p>
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={loading}
                >
                  {loading ? 'Sending...' : 'Resend code'}
                </button>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={styles.submitButton}
          >
            {loading
              ? step === 1
                ? 'Logging in...'
                : 'Verifying...'
              : step === 1
              ? 'Login'
              : 'Verify & Login'}
          </button>

          {/* Message Output */}
          {message && (
            <div className={`${styles.message} ${message.toLowerCase().includes('success') || message.includes('✅') ? styles.success : styles.error}`}>
              {message}
            </div>
          )}
        </form>
            <div className={styles.cardFooter}>
            <p>Having trouble signing in? <a href="/register">Register here</a></p>
          </div>
      </div>
    </div>
  );
}
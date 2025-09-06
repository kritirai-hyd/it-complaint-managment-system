'use client';

import { useState, useEffect, useRef } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import styles from './Login.module.css';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1); // 1: Login, 2: OTP, 3: Forgot Password
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [fade, setFade] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const otpRef = useRef(null);
  const router = useRouter();

  // Check if form is valid for step 1
  useEffect(() => {
    if (step === 1) {
      const isValid = email.trim() !== '' && password.trim() !== '' && role !== '';
      setIsFormValid(isValid);
    }
  }, [email, password, role, step]);

  // Handle OTP auto-focus
  useEffect(() => {
    if (step === 2 && otpRef.current) {
      otpRef.current.focus();
      if (countdown === 0) setCountdown(30);
    }
  }, [step]);

  // Countdown timer for OTP resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Step transition with fade effect
  const transitionStep = (newStep) => {
    setFade(true);
    setTimeout(() => {
      setStep(newStep);
      setFade(false);
    }, 300);
  };

  // Handle login / OTP verification
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const res = await signIn('credentials', {
      redirect: false,
      email: email.trim(),
      password: password.trim(),
      role,
      ...(step === 2 && { otp: otp.trim() }),
    });

    setLoading(false);

    if (res?.error) {
      try {
        const err = JSON.parse(res.error);
        if (err.code === 'OTP_REQUIRED') {
          transitionStep(2);
          setMessage('✅ OTP sent to your email.');
        } else {
          setMessage(`❌ ${err.message || 'Login failed.'}`);
        }
      } catch {
        setMessage(`❌ ${res.error}`);
      }
    } else {
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
          router.push('/');
      }
    }
  };

  // Forgot password handler
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const res = await fetch('/api/auth/admin-forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();
    setLoading(false);

    if (res.ok) {
      setMessage('✅ Reset link sent to your email.');
    } else {
      setMessage(data.error || '❌ Failed to send reset link.');
    }
  };

  // Resend OTP
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
    setCountdown(30);

    if (res.ok) {
      setMessage('✅ OTP resent to your email.');
    } else {
      setMessage(`❌ ${data?.error || 'Failed to resend OTP.'}`);
    }
  };

  const renderForm = () => {
    if (step === 1) {
      return (
        <>
          <div className={styles.inputGroup}>
            <label>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
              disabled={loading}
            />
          </div>

          <div className={styles.inputGroup}>
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
              disabled={loading}
            />
        
          </div>

          <div className={styles.inputGroup}>
            <label>Role</label>
       <select
  value={role}
  onChange={(e) => setRole(e.target.value)}
  required
  disabled={loading} // this disables the select when loading === true
>
  <option value="" disabled>Select your role</option>
  <option value="admin">Admin</option>
  <option value="manager">Manager</option>
  <option value="engineer">Engineer</option>
</select>

          </div>
    <div className={styles.forgotPasswordContainer}>
              <button
                type="button"
                className={styles.forgotPasswordLink}
                onClick={() => transitionStep(3)}
                disabled={loading}
              >
                Forgot Password?
              </button>
            </div>
          <button
            type="submit"
            disabled={loading || !isFormValid}
            className={`${styles.submitButton} ${!isFormValid ? styles.disabledButton : ''}`}
          >
            {loading ? (
              <span className={styles.buttonLoading}>
                <span className={styles.spinner}></span>
                Sending OTP in email...
              </span>
            ) : (
              'Verify OTP'
            )}
          </button>
        </>
      );
    }

    if (step === 2) {
      return (
        <>
          <div className={styles.otpInstructions}>
            <div className={styles.otpIcon}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z" clipRule="evenodd" />
              </svg>
            </div>
            <p>We've sent a 6-digit verification code to your email</p>
          </div>

          <div className={styles.inputGroup}>
            <label>Enter 6-digit OTP</label>
            <input
              ref={otpRef}
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              maxLength={6}
              inputMode="numeric"
              placeholder="123456"
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={styles.submitButton}
          >
            {loading ? (
              <span className={styles.buttonLoading}>
                <span className={styles.spinner}></span>
                Verifying...
              </span>
            ) : (
              'Verify & Login'
            )}
          </button>

          <button
            type="button"
            onClick={handleResendOtp}
            className={styles.resendButton}
            disabled={loading || countdown > 0}
          >
            {loading ? 'Resending...' : countdown > 0 ? `Resend in ${countdown}s` : 'Resend OTP'}
          </button>

          <button
            type="button"
            className={styles.backToLogin}
            onClick={() => transitionStep(1)}
            disabled={loading}
          >
            Back to Login
          </button>
        </>
      );
    }

    if (step === 3) {
      return (
        <>
          <div className={styles.otpInstructions}>
            <div className={styles.otpIcon}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-2.625 6c-.54 0-.828.419-.936.634a1.96 1.96 0 00-.189.866c0 .298.059.605.189.866.108.215.395.634.936.634.54 0 .828-.419.936-.634.13-.26.189-.568.189-.866 0-.298-.059-.605-.189-.866-.108-.215-.395-.634-.936-.634zm4.314.634c.108-.215.395-.634.936-.634.54 0 .828.419.936.634.13.26.189.568.189.866 0 .298-.059.605-.189.866-.108.215-.395.634-.936.634-.54 0-.828-.419-.936-.634a1.96 1.96 0 01-.189-.866c0-.298.059-.605.189-.866zm2.023 6.828a.75.75 0 10-1.06-1.06 3.75 3.75 0 01-5.304 0 .75.75 0 00-1.06 1.06 5.25 5.25 0 007.424 0z" clipRule="evenodd" />
              </svg>
            </div>
            <p>Enter your email address and we'll send you a password reset link</p>
          </div>

          <div className={styles.inputGroup}>
            <label>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={styles.submitButton}
          >
            {loading ? (
              <span className={styles.buttonLoading}>
                <span className={styles.spinner}></span>
                Sending...
              </span>
            ) : (
              'Send Reset Link'
            )}
          </button>

          <button
            type="button"
            className={styles.backToLogin}
            onClick={() => transitionStep(1)}
            disabled={loading}
          >
            Back to Login
          </button>
        </>
      );
    }
  };

  return (
    <div className={styles.dashboardContainer}>      <div className={styles.mainContent}>
        <header className={styles.dashboardHeader}>
          <h1>Backend Login Portal</h1>
          <div className={styles.userInfo}>
            <span>Secure Backend Login Portal</span>
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
            <h2>
              {step === 1 && 'Admin Login'}
              {step === 2 && 'Verify Your Identity'}
              {step === 3 && 'Forgot Password'}
            </h2>
            <p>
              {step === 1 && 'Enter your credentials to access the dashboard.'}
              {step === 2 && 'Enter the OTP sent to your email.'}
              {step === 3 && 'Enter your email to reset your password.'}
            </p>
          </div>

          <form
            onSubmit={step === 3 ? handleForgotPassword : handleSubmit}
            className={`${styles.loginForm} ${fade ? styles.fadeOut : styles.fadeIn}`}
          >
            {renderForm()}

            {message && (
              <div className={`${styles.message} ${message.includes('✅') ? styles.success : styles.error}`}>
                {message.replace('✅', '').replace('❌', '')}
              </div>
            )}
          </form>

       
        </div>
      </div>

      <footer className={styles.dashboardFooter}>
        <p>© {new Date().getFullYear()} Admin Portal. All rights reserved.</p>
        <div className={styles.footerLinks}>
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Service</a>
          <a href="#">Contact Support</a>
        </div>
      </footer>
    </div>
  );
}
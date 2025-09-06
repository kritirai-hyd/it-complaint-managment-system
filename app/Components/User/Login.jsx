'use client';

import { useState, useRef, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import styles from './Login.module.css';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1); // 1: Login, 2: OTP, 3: Forgot Password
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [fade, setFade] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [isFormValid, setIsFormValid] = useState(false);
  const otpRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    // Check if both email and password are filled
    setIsFormValid(email.trim() !== '' && password.trim() !== '');
  }, [email, password]);

  useEffect(() => {
    if (step === 2 && otpRef.current) otpRef.current.focus();
    
    // Start countdown when OTP is sent
    if (step === 2 && countdown === 0) {
      setCountdown(30);
    }
  }, [step]);

  useEffect(() => {
    // Countdown timer for OTP resend
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const transitionStep = (newStep) => {
    setFade(true);
    setTimeout(() => {
      setStep(newStep);
      setFade(false);
    }, 300);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const res = await signIn('credentials', {
      redirect: false,
      email,
      password,
      role: 'user',
      ...(step === 2 && { otp }),
    });

    setLoading(false);

    if (res?.error) {
      try {
        const err = JSON.parse(res.error);
        if (err.code === 'OTP_REQUIRED') {
          transitionStep(2);
          setMessage('✅ OTP sent to your email.');
        } else {
          setMessage(err.message || '❌ Login failed.');
        }
      } catch {
        setMessage(res.error || '❌ Unexpected error.');
      }
    } else {
      router.push('/user/dashboard');
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const res = await fetch('/api/auth/user-forgot-password', {
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

  const handleResendOtp = async () => {
    setLoading(true);
    setMessage('');

    const res = await fetch('/api/auth/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, role: 'user' }),
    });

    const data = await res.json();
    setLoading(false);
    setCountdown(30); // Reset countdown

    if (res.ok) {
      setMessage('✅ OTP resent. Check your email.');
    } else {
      setMessage(data.error || '❌ Could not resend OTP.');
    }
  };

  const renderForm = () => {
    if (step === 1) {
      return (
        <div className={`${styles.formStep} ${fade ? styles.fadeOut : styles.fadeIn}`}>
          <div className={styles.inputGroup}>
            <label htmlFor="email">Email</label>
            <input 
              id="email"
              type="email" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              required 
              placeholder="Enter your email"
              disabled={loading}
            />
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="password">Password</label>
            <input 
              id="password"
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              required 
              placeholder="Enter your password"
              disabled={loading}
            />
          </div>
          <button 
            type="button" 
            onClick={() => transitionStep(3)} 
            className={styles.forgotPasswordLink}
            disabled={loading}
          >
            Forgot Password?
          </button>
          <button 
            type="submit" 
            disabled={loading || !isFormValid} 
            className={`${styles.submitButton} ${!isFormValid ? styles.inactiveButton : ''}`}
          >
            {loading ? (
              <div className={styles.buttonLoading}>
                <div className={styles.spinner}></div>
                <span>Verifying...</span>
              </div>
            ) : 'Verify OTP'}
          </button>
        </div>
      );
    }

    if (step === 2) {
      return (
        <div className={`${styles.formStep} ${fade ? styles.fadeOut : styles.fadeIn}`}>
          <div className={styles.otpHeader}>
            <h3>Enter Verification Code</h3>
            <p>We've sent a 6-digit code to your email</p>
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="otp">Verification Code</label>
            <input
              id="otp"
              ref={otpRef}
              type="text"
              maxLength={6}
              inputMode="numeric"
              value={otp}
              onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
              required
              placeholder="Enter 6-digit code"
              className={styles.otpInput}
              disabled={loading}
            />
          </div>
          <div className={styles.otpResend}>
            <p>Didn't receive the code?</p>
            <button 
              type="button" 
              onClick={handleResendOtp} 
              disabled={loading || countdown > 0}
              className={countdown > 0 ? styles.countdownActive : ''}
            >
              {loading ? 'Sending...' : 
               countdown > 0 ? `Resend in ${countdown}s` : 'Resend Code'}
            </button>
          </div>
          <button 
            type="submit" 
            disabled={loading} 
            className={styles.submitButton}
          >
            {loading ? (
              <div className={styles.buttonLoading}>
                <div className={styles.spinner}></div>
                <span>Verifying OTP...</span>
              </div>
            ) : 'Verify & Continue'}
          </button>
          <button 
            type="button" 
            onClick={() => transitionStep(1)} 
            className={styles.backToLogin}
            disabled={loading}
          >
            Back to Login
          </button>
        </div>
      );
    }

    if (step === 3) {
      return (
        <div className={`${styles.formStep} ${fade ? styles.fadeOut : styles.fadeIn}`}>
          <div className={styles.forgotPasswordHeader}>
            <h3>Reset Your Password</h3>
            <p>Enter your email to receive a reset link</p>
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="reset-email">Email</label>
            <input 
              id="reset-email"
              type="email" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
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
              <div className={styles.buttonLoading}>
                <div className={styles.spinner}></div>
                <span>Sending reset link...</span>
              </div>
            ) : 'Send Reset Link'}
          </button>
          <button 
            type="button" 
            onClick={() => transitionStep(1)} 
            className={styles.backToLogin}
            disabled={loading}
          >
            Back to Login
          </button>
        </div>
      );
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginCard}>
        <div className={styles.loginHeader}>
          <h2>
            {step === 1 && 'Welcome Back'}
            {step === 2 && 'Verify Your Account'}
            {step === 3 && 'Reset Password'}
          </h2>
          <p>
            {step === 1 && 'Sign in to access your account'}
            {step === 2 && 'Enter the code sent to your email'}
            {step === 3 && 'We\'ll help you get back into your account'}
          </p>
        </div>
        
        <form onSubmit={step === 3 ? handleForgotPassword : handleLogin} className={styles.loginForm}>
          {renderForm()}
          {message && (
            <div className={`${styles.message} ${message.includes('✅') ? styles.success : styles.error}`}>
              {message}
            </div>
          )}
        </form>
        
        <div className={styles.cardFooter}>
          <p>Don't have an account? <a href="/register">Sign up</a></p>
        </div>
      </div>
    </div>
  );
}
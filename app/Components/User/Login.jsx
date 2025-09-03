'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import './Login.css';
import Link from 'next/link';
export default function LoginPage() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ 
    email: '', 
    password: '', 
    otp: '',
    role: 'user'
  });
  const [message, setMessage] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const otpInputRef = useRef(null);

  useEffect(() => {
    if (step === 2 && otpInputRef.current) {
      otpInputRef.current.focus();
    }
  }, [step]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });
    setLoading(true);

    try {
      const res = await signIn('credentials', {
        redirect: false,
        email: form.email.trim(),
        password: form.password.trim(),
        role: form.role,
      });

      if (res?.error) {
        if (res.error.includes('OTP_REQUIRED')) {
          setStep(2);
          setMessage({ 
            text: 'We sent a 6-digit OTP to your email. Please check your inbox.', 
            type: 'info' 
          });
          return;
        }
        throw new Error(res.error);
      }

      if (res?.ok) {
        router.push(`/${form.role}/dashboard`);
      }
    } catch (error) {
      setMessage({ 
        text: error.message || 'Login failed. Please try again.', 
        type: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });
    setLoading(true);

    try {
      const res = await signIn('credentials', {
        redirect: false,
        email: form.email.trim(),
        password: form.password.trim(),
        role: form.role,
        otp: form.otp.trim(),
      });

      if (res?.error) {
        throw new Error(res.error);
      }

      if (res?.ok) {
        router.push(`/${form.role}/dashboard`);
      }
    } catch (error) {
      setMessage({ 
        text: error.message || 'OTP verification failed', 
        type: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setMessage({ text: '', type: '' });
    setLoading(true);
    setForm(prev => ({ ...prev, otp: '' }));

    try {
      const res = await signIn('credentials', {
        redirect: false,
        email: form.email.trim(),
        password: form.password.trim(),
        role: form.role,
      });

      if (res?.error && res.error.includes('OTP_REQUIRED')) {
        setMessage({ 
          text: 'New OTP sent to your email.', 
          type: 'info' 
        });
      } else if (res?.error) {
        throw new Error(res.error);
      }
    } catch (error) {
      setMessage({ 
        text: error.message || 'Failed to resend OTP', 
        type: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1 className="login-title">
            {step === 1 ? 'Welcome Back' : 'Verify Your Identity'}
          </h1>
          <p className="login-subtitle">
            {step === 1 ? 'Sign in to your account' : 'Enter your verification code'}
          </p>
        </div>

        <div className="login-content">
          {message.text && (
            <div className={`message message-${message.type}`}>
              {message.text}
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label htmlFor="email" className="form-label">Email Address</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="your@email.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="password" className="form-label">Password</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  required
                  className="form-input"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
              >
                {loading ? (
                  <>
                    <svg className="spinner" style={{ width: '1rem', height: '1rem' }} viewBox="0 0 24 24">
                      <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </>
                ) : (
                  'Sign in'
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP}>
              <div className="form-group">
                <label htmlFor="otp" className="form-label">Verification Code</label>
                <input
                  id="otp"
                  name="otp"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="Enter 6-digit code"
                  value={form.otp}
                  onChange={handleChange}
                  required
                  maxLength={6}
                  ref={otpInputRef}
                  className="form-input otp-input"
                />
                <p style={{ marginTop: '0.25rem', fontSize: '0.75rem', color: '#6b7280' }}>
                  Enter the verification code sent to your email
                </p>
              </div>

              <div className="flex-buttons">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  disabled={loading}
                  className="btn btn-secondary"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary"
                >
                  {loading ? (
                    <>
                      <svg className="spinner" style={{ width: '1rem', height: '1rem' }} viewBox="0 0 24 24">
                        <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Verifying...
                    </>
                  ) : (
                    'Verify'
                  )}
                </button>
              </div>

              <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={loading}
                  style={{ 
                    background: 'none',
                    border: 'none',
                    color: '#4361ee',
                    fontWeight: '500',
                    fontSize: '0.875rem',
                    cursor: 'pointer'
                  }}
                >
                  Didn't receive a code? Resend OTP
                </button>
              </div>
            </form>
          )}


        </div>

        <div className="login-footer">
          <p className="footer-text">
            {step === 1 ? (
              <>
                Don't have an account?{' '}
                <Link href="/register" className="footer-link">Register</Link>
              </>
            ) : (
              'Having trouble with verification? Contact support'
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './reset.module.css';

export default function ResetPasswordPage({ params }) {
  const { token } = params;
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    // Validate passwords match
    if (password !== confirmPassword) {
      setMessage('❌ Passwords do not match.');
      setLoading(false);
      return;
    }

    // Validate password strength
    if (password.length < 8) {
      setMessage('❌ Password must be at least 8 characters long.');
      setLoading(false);
      return;
    }

    const res = await fetch(`/api/auth/user-reset-password/${token}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });

    const data = await res.json();
    setLoading(false);

    if (res.ok) {
      setMessage('✅ Password reset successful. Redirecting to login...');
      setSubmitted(true);
      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } else {
      setMessage(data.error || '❌ Reset failed. The link may have expired.');
    }
  };

  return (
    <div className={styles.resetContainer}>
      <div className={styles.resetCard}>
        <div className={styles.resetHeader}>
          <h2>Reset Your Password</h2>
          <p>
            {!submitted 
              ? 'Create a new password for your account' 
              : 'Your password has been successfully reset'
            }
          </p>
        </div>

        {!submitted ? (
          <form onSubmit={handleReset} className={styles.resetForm}>
            <div className={styles.inputGroup}>
              <label htmlFor="password">New Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your new password"
                required
                minLength="8"
              />
              <div className={styles.passwordStrength}>
                <div className={`${styles.strengthBar} ${password.length >= 1 ? styles.weak : ''} ${password.length >= 4 ? styles.medium : ''} ${password.length >= 8 ? styles.strong : ''}`}></div>
                <span className={styles.strengthText}>
                  {password.length === 0 ? '' : 
                   password.length < 4 ? 'Weak' : 
                   password.length < 8 ? 'Medium' : 'Strong'}
                </span>
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your new password"
                required
                minLength="8"
              />
              {confirmPassword && password !== confirmPassword && (
                <p className={styles.errorText}>Passwords do not match</p>
              )}
            </div>

            <button 
              type="submit" 
              disabled={loading || password !== confirmPassword || password.length < 8}
              className={styles.submitButton}
            >
              {loading ? (
                <div className={styles.buttonLoader}></div>
              ) : 'Reset Password'}
            </button>
          </form>
        ) : (
          <div className={styles.successContainer}>
            <div className={styles.successAnimation}>
              <svg className={styles.checkmark} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
                <circle className={styles.checkmarkCircle} cx="26" cy="26" r="25" fill="none"/>
                <path className={styles.checkmarkCheck} fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
              </svg>
            </div>
            <p className={styles.successText}>Your password has been successfully reset!</p>
            <p className={styles.redirectText}>You will be redirected to the login page shortly.</p>
            <button 
              onClick={() => router.push('/login')} 
              className={styles.loginButton}
            >
              Go to Login Now
            </button>
          </div>
        )}

        {message && (
          <div className={`${styles.message} ${message.includes('✅') ? styles.success : styles.error}`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
}
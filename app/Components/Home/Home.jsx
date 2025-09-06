// src/app/page.jsx (or .tsx)
'use client';

import React, { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './Home.module.css'; // Import the CSS module
import Footer from '../Footer/Footer';
import Login from '../User/Login';

const Main = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const router = useRouter();

  // Check screen size on mount and resize
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { email, password } = formData;

    if (!email || !password) {
      setError('All fields are required.');
      return;
    }

    setLoading(true);

    const res = await signIn('credentials', {
      redirect: false,
      email,
      password,
    });

    setLoading(false);

    if (res?.ok) {
      setSuccess('Login successful! Redirecting...');
      setTimeout(() => {
        router.push('/user/dashboard');
      }, 1000);
    } else {
      setError(res?.error || 'Login failed. Please check your credentials.');
      setFormData((prev) => ({ ...prev, password: '' }));
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const isFormValid = formData.email && formData.password;

  return (
    <div className={styles.loginPage}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContainer}>
          {/* Logo */}
          <div className={styles.logoContainer}>
            <Link href="/" className={styles.logoLink}>
              <h1 className={styles.logoText}>IT Complaint Management</h1>
            </Link>
          </div>

          {/* Navigation (Desktop) */}
          <nav className={styles.nav}>
            <ul className={styles.navList}>
              <li className={styles.navItem}>
                <Link href="/login" className={`${styles.navLink} ${styles.ctaButton}`}>
                  Login
                </Link>
              </li>
              <li className={styles.navItem}>
                <Link href="/register" className={`${styles.navLink} ${styles.ctaButton}`}>
                  Register
                </Link>
              </li>
            </ul>
          </nav>

          {/* Hamburger (Mobile Only) */}
          <button 
            className={`${styles.mobileMenuButton} ${isMobileMenuOpen ? styles.open : ''}`}
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
          >
            <span />
            <span />
            <span />
          </button>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobile && isMobileMenuOpen && (
          <div className={styles.mobileMenu}>
            <Link href="/login" className={styles.mobileNavLink} onClick={toggleMobileMenu}>
              Login
            </Link>
            <Link href="/register" className={styles.mobileNavLink} onClick={toggleMobileMenu}>
              Register
            </Link>
          </div>
        )}
      </header>


    <Login />


<Footer />
    </div>
  );
};

export default Main;
// src/app/page.jsx (or .tsx)
'use client';

import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './Home.module.css'; // Import the CSS module
import Login from '../User/Login'; // Assuming this is another component
import Footer from '../Footer/Footer'; // Assuming this is another component

const Main = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const router = useRouter();

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

  const isFormValid = formData.email && formData.password;

  return (
    <div className={styles.loginPage}>
      {/* Header / Navbar */}
      <header className={styles.header}>
        <div className={styles.logoContainer}>
          <h1 className={styles.logoText}>IT Complaint Management</h1>
        </div>
        <nav className={styles.nav}>
          <ul className={styles.navList}>
            <li className={styles.navItem}>
              <Link href="/login" className={styles.navLink}>
                Login
              </Link>
            </li>
            <li className={styles.navItem}>
              <Link href="/register" className={styles.navLink}>
                Register
              </Link>
            </li>
          </ul>
        </nav>
      </header>

      {/* Assuming the Login component is imported and styled separately */}
      <Login />

      {/* Assuming the Footer component is imported and styled separately */}
      <Footer />
    </div>
  );
};

export default Main;
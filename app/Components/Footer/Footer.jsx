"use client";

import React from 'react';
import Link from 'next/link';
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaTwitter, FaFacebook, FaLinkedin, FaGithub, FaShieldAlt, FaWrench } from 'react-icons/fa';
import styles from './Footer.module.css';

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContainer}>
    
        <div className={styles.footerBottom}>
          <p className={styles.para}>&copy; 2025 IT Complaint Management System. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
const sendEmail = require('./ForgetsendEmail');

/**
 * Sends a password reset email with a reset link.
 * @param {string} email - Recipient email
 * @param {string} resetToken - Password reset token
 */
const sendResetPasswordEmail = async (email, resetToken) => {
  if (!email) throw new Error('Email is required to send reset password email');
  if (!resetToken) throw new Error('Reset token is required');

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const resetLink = `${baseUrl}/reset-password/${resetToken}`;

  const subject = 'Password Reset Request';
  const html = `
    <p>Hello,</p>
    <p>You requested to reset your password.</p>
    <p>Please click the link below to set a new password. This link will expire in 1 hour.</p>
    <p><a href="${resetLink}">${resetLink}</a></p>
    <p>If you did not request this, please ignore this email.</p>
    <br />
    <p>Best regards,<br />Your App Team</p>
  `;

  await sendEmail(email, subject, html);
};

module.exports = sendResetPasswordEmail;

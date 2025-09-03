export function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function sendOTP(email, otp) {
  // Dummy function - replace with actual email/SMS logic
  console.log(`Sending OTP ${otp} to ${email}`);
}

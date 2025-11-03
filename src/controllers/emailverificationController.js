const {  User } = require('../models');
const { Op } = require('sequelize');
const transporter = require('../config/transporter')

const createEmailVerificationOtp = async (user) => {
  const otpCode = (Math.floor(100000 + Math.random() * 900000)).toString();
  const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

  // Save OTP directly to User now ab mujhy 
  user.otpCode = otpCode;
  user.otpExpiresAt = otpExpiresAt;
  user.otpVerifiedAt = null;
  await user.save();

    //  send otpCode via email using nodemailer
  await transporter.sendMail({
    from: `"No Reply" <${process.env.EMAIL_USER}>`,
    to: user.email,
    subject: "Email Verification OTP",
    text: `Your OTP code is: ${otpCode}. It expires in 10 minutes.`,
    html: `<p>Your OTP code is: <b>${otpCode}</b></p><p>This code expires in 10 minutes.</p>`
  });

  console.log(`OTP sent to ${user.email}: ${otpCode}`);
};

// Verify OTP 
const verifyEmailOtp = async (req, res) => {
  const { email, otpCode } = req.body;

  try {
    const user = await User.findOne({ where: { email } });
    console.log("User found:", user)
    if (!user) return res.status(404).json({ message: 'User not found.' });
    
     if (
      !user.otpCode ||
      user.otpCode !== otpCode ||
      user.otpExpiresAt < new Date()
    ) {
      return res.status(400).json({ message: 'Invalid or expired OTP.' });
    }

    user.isEmailVerified = true;
    user.otpVerifiedAt = new Date();
    user.otpCode = null; // clear OTP
    user.otpExpiresAt = null;
    await user.save();

    res.status(200).json({ message: 'Email verified successfully.' });
  } catch (err) {
    console.error("Verify Email Error:", err);
    res.status(500).json({ message: 'Server error during OTP verification.' });
  }
};


// send otp
const sendOtp = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ message: 'User not found.' });

    await createEmailVerificationOtp(user);
    res.status(200).json({ message: 'OTP sent successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error while sending OTP.' });
  }
};


// resend otp
const resendOtp = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ message: 'User not found.' });

    await createEmailVerificationOtp(user);
    res.status(200).json({ message: 'OTP resent successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error while resending OTP.' });
  }
};

module.exports = {
  createEmailVerificationOtp,
  verifyEmailOtp,
  resendOtp,
  sendOtp
};

const { User } = require('../models');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const transporter = require('../config/transporter');
const { response } = require('express');


const generateOtp = () => (Math.floor(100000 + Math.random() * 900000)).toString();

// otpHandler may aik validation lagao k agar otp send hoa va hy or valid bhi hy tu new otp sent na hoo may nay ya lagai thi daykho k kya is may hy ??

const otpHandler = async (req, res) => {
  const { email, type, otpCode } = req.body;

  if (!email || !type) {
    return res.status(400).json({ message: 'Email and type are required.' });
  }

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ message: 'User not found.' });

    // ----------- VERIFY OTP -----------
    if (otpCode) {
      if (
        !user.otpCode ||
        user.otpCode.toString() !== otpCode.toString() ||
        user.otpExpiresAt < new Date() ||
        user.otpType !== type
      ) {
        return res.status(400).json({ message: 'Invalid or expired OTP.' });
      }

      user.otpVerifiedAt = new Date();
      user.otpCode = null;
      user.otpExpiresAt = null;

      let response = {  message:'OTP verified successfuly' };

      if (type === 'email_verification') {
        user.isEmailVerified = true;
      }

      if (type === 'password_reset') {
        const token = crypto.randomBytes(32).toString('hex');
        user.token = token;
        user.tokenExpiresAt = new Date(Date.now() + 15 * 60 * 1000);
        response.tempToken = token;
      }

      await user.save();
      return res.status(200).json({
        success: true,
        response
      }
      );
    }

    // ----------- SEND OTP (only if expired or not set) -----------
    if (!user.otpCode || user.otpExpiresAt < new Date() || user.otpType !== type) {
      const newOtp = generateOtp();
      user.otpCode = newOtp;
      user.otpType = type;
      user.otpExpiresAt = new Date(Date.now() + 60 * 1000); // 60 sec expiry
      user.otpVerifiedAt = null;
      await user.save();

      await transporter.sendMail({
        from: `"No Reply" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: `Your OTP for ${type}`,
        html: `<p>Your OTP code is: <b>${newOtp}</b></p><p>This code expires in 60 seconds.</p>`
      });

      return res.status(200).json({ 
        success: true,
        message: 'OTP sent successfully.' });
    }

    // ----------- Prevent Resend if OTP is still valid -----------
    return res.status(200).json({ 
      success: true,
      message: 'OTP already sent. Please check your email.' });

  } catch (err) {
    console.error("OTP Handler Error:", err);
    res.status(500).json({ 
      success: false,
      message: 'Server error while processing OTP.' });
  }
};



const resetPassword = async (req, res) => {
  const { tempToken, newPassword } = req.body;

  if (!tempToken || !newPassword) {
    return res.status(400).json({ 
      success: false,
      message: 'Token and new password are required.' });
  }

  try {
    const user = await User.findOne({ where: { token: tempToken } });
    if (!user || user.tokenExpiresAt < new Date()) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid or expired token.' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    user.token = null;
    user.tokenExpiresAt = null;
    await user.save();

    res.status(200).json({ 
      success: true,
      message: 'Password has been reset successfully.' 
    });
  } catch (err) {
    console.error("Reset Password Error:", err);
    res.status(500).json({ 
      success: false,
      message: 'Server error while resetting password.' });
  }
};



module.exports = { otpHandler, resetPassword };




// how to add a value in enum values in pgadmin 
// agar nahi hoo sakta then migration k through new columnbana hoo ga or existing valy ko drop tu uss ki sequelize ki migration file bana k doo 
// may nay model may selected add kar tu dia hy magar migration k time nahi kiya tha jis ki vaja say nahii hoo raha ya 
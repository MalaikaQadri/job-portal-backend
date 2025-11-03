const { User } = require('../models');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const transporter = require('../config/transporter');
// forgotPassword
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user) return res.status(404).json({ message: 'User not found' });

    // Generate token
    const token = crypto.randomBytes(32).toString('hex');
    const tokenExpiresAt = new Date(Date.now() + 3600000); // 1 hour

    // Save token
    user.token = token;
    user.tokenExpiresAt = tokenExpiresAt;
    await user.save();

    const resetURL = `${process.env.CLIENT_URL}/reset-password/${token}`;

    // Send email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset',
      html: `<p>Click <a href="${resetURL}">here</a> to reset your Job Portal password.</p>`
    });

    res.json({ message: 'Password reset email sent' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// resetPassword
const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const user = await User.findOne({ where: { token } });

    if (!user || user.tokenExpiresAt < new Date()) {
      return res.status(400).json({ message: 'Token expired or invalid' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    user.password = hashedPassword;
    user.token = null;
    user.tokenExpiresAt = null;
    await user.save();

    res.json({ message: 'Password has been reset successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



module.exports = { forgotPassword, resetPassword };





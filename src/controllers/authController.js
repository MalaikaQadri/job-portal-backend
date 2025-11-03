const bcrypt = require('bcryptjs');
const { User  } = require('../models');
const speakeasy = require("speakeasy")
const generateToken = require('../utils/generateToken');
const { otpHandler } = require('../controllers/otpController');


const registerUser = async (req, res) => {
  const { fullName, username, email, password, role,isEmailVerified } = req.body;

  try {
    if (!fullName || !username || !email || !password) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      fullName,
      username,
      email,
      password: hashedPassword,
      role,
      isEmailVerified,
    });

    await otpHandler(
      { body: { email: user.email, type: 'email_verification' } },
      { status: () => ({ json: () => {} }) } 
    );

    const token = generateToken(user.toJSON());

    res.status(201).json({
      id: user.id,
      fullName: user.fullName,
      username: user.username,
      email: user.email,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
      token,
      message: 'User registered. OTP sent to email for verification.',
      success: true
    });

  } catch (error) {
    console.error('Register Error:', error);
    res.status(500).json({ message: 'Server error during registration.' });
  }
};



// login 1


// const loginUser = async (req, res) => {
//     const { email, password } = req.body;
//     try {
//     const user = await User.findOne({ where: { email } });
//     if (!user) {
//         return res.status(400).json({ message: 'Invalid email or password.' });
//     }
//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) {
//     return res.status(401).json({ message: 'Invalid email or password.' });
//     }

//     // Check 2FA enabled
//      const twoFactor = await User.findOne({ where: { id: user.id } });
//     if (twoFactor && twoFactor.isEnabled) {
//       if (!token) {
//         return res.status(403).json({ 
//           message: "2FA code required", 
//           require2FA: true 
//         });
//       }
//       const verified = speakeasy.totp.verify({
//         secret: twoFactor.secret,
//         encoding: "base32",
//         token,
//         window: 1,
//       });

//       if (!verified) {
//         return res.status(400).json({ message: "Invalid or expired 2FA code" });
//       }
//     }
//     // Generate token
//     const token = generateToken(user.toJSON());


//     res.status(200).json({
//       success: true,
//     message: 'Login successful',
//     user: {
//     id: user.id,
//     fullName: user.fullName,
//     username: user.username,
//     email: user.email,
//     role: user.role,
//            },
//            token: token,
//     });
//     } 
//     catch (error) {
//     console.error('Login Error:', error);
//     console.error(error.stack);
//     res.status(500).json({ message: 'Server error during login.' });
//     }
// };






const getUserProfile = async (req, res) => {
  try {
    console.log(req.user);
     if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Unauthorized: User not authenticated' });
    }

    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(404).json({ message: 'User noooooot found.' });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error('Get Profile Error:', error);
    res.status(500).json({ message: 'Server errrrrrrrrrrror.' });
  }
};


const loginUser = async (req, res) => {
  const { email, password, token } = req.body;

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    if (user.status !== "active") {
      return res.status(403).json({
        success: false,
        message: "Your account is inactive or banned. Please contact admin.",
      });
    }

    if (password && !token) {
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: "Invalid email or password.",
        });
      }

      if (user.is2FAEnabled) {
        return res.status(200).json({
          success: false,
          message: "2FA code required.",
          is2FAEnabled: true,
          step: "2fa_verification",
          user: {
            id: user.id,
            email: user.email,
            fullName: user.fullName,
            role: user.role,
            isEmailVerified: user.isEmailVerified
          },
        });
      }

      if (!user.isEmailVerified) {
      return res.status(200).json({
        success: false,
        message: "Your email is not verified.",
        user:{
          id:user.id,
          fullName: user.fullName,
          email: user.email,
          isEmailVerified: user.isEmailVerified,
          is2FAEnabled: user.is2FAEnabled,
        }
      });
       }

      const jwtToken = generateToken(user.toJSON());
      return res.status(200).json({
        success: true,
        message: "Login successful.",
        is2FAEnabled: false,
        user: {
          id: user.id,
          fullName: user.fullName,
          username: user.username,
          email: user.email,
          role: user.role,
          status: user.status,
          isEmailVerified: user.isEmailVerified
        },
        token: jwtToken,
      });
    }

    if (token && !password) {
      if (!user.is2FAEnabled) {
        return res.status(400).json({
          success: false,
          message: "2FA not enabled for this account.",
        });
      }

      const verified = speakeasy.totp.verify({
        secret: user.secret,
        encoding: "base32",
        token,
        window: 1,
      });

      if (!verified) {
        return res.status(400).json({
          success: false,
          message: "Invalid or expired 2FA code.",
        });
      }

      const jwtToken = generateToken(user.toJSON());
      return res.status(200).json({
        success: true,
        message: "Login successful.",
        is2FAEnabled: true,
        user: {
          id: user.id,
          fullName: user.fullName,
          username: user.username,
          email: user.email,
          role: user.role,
          status: user.status,
          isEmailVerified: user.isEmailVerified
        },
        token: jwtToken,
      });
    }

    return res.status(400).json({
      success: false,
      message: "Invalid request format.",
    });

  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during login.",
    });
  }
};


module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
};



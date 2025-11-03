// // require('dotenv').config();
// // const axios = require("axios");
// // const { OAuthAccount, User } = require("../models");
// // const jwt = require("jsonwebtoken");
 
// // const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
// // const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
// // const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;
// // const FRONTEND_DASHBOARD_URL = process.env.FRONTEND_DASHBOARD_URL;

// // const googleLogin = (req, res) => {
// //   console.log("Google callback triggered", req.query);

// //   const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=profile email`;
// //   res.redirect(url);
// // };

// // // STEP 2 — Handle callback from Google
// // const googleCallback = async (req, res) => {
// //   console.log("Google callback triggered", req.query);

// //   const { code } = req.query;
// //   try {
// //     // Exchange code for access token
// //     const tokenResponse = await axios.post("https://oauth2.googleapis.com/token", {
// //       client_id: CLIENT_ID,
// //       client_secret: CLIENT_SECRET,
// //       code,
// //       redirect_uri: REDIRECT_URI,
// //       grant_type: "authorization_code",
// //     });

// //     const { access_token } = tokenResponse.data;

// //     // Fetch Google profile
// //     const { data: profile } = await axios.get("https://www.googleapis.com/oauth2/v1/userinfo?alt=json", {
// //       headers: { Authorization: `Bearer ${access_token}` },
// //     });

// //     // Check if account exists
// //     let oauthAccount = await OAuthAccount.findOne({ where: { providerId: profile.id, provider: "google" } });

// //     if (!oauthAccount) {
// //       // If no OAuthAccount, create a new User + OAuthAccount
// //       const user = await User.create({
// //         name: profile.name,
// //         email: profile.email,
// //         role: "applicant", // Default role
// //       });

// //       oauthAccount = await OAuthAccount.create({
// //         userId: user.id,
// //         provider: "google",
// //         providerId: profile.id,
// //         email: profile.email,
// //       });
// //     }

// //     // Generate JWT token for session
// //     const token = jwt.sign({ id: oauthAccount.userId }, process.env.JWT_SECRET, { expiresIn: process.env.TOKEN_EXPIRE });

// //     // Redirect to frontend dashboard with token in query
// //     return res.redirect(`${FRONTEND_DASHBOARD_URL}?token=${token}`);
// //   } catch (err) {
// //     console.error("Google Auth Error:", err.response?.data || err.message);
// //     return res.redirect(`${process.env.FRONTEND_DASHBOARD_URL}/login?error=google_auth_failed`);

// //     // return res.redirect("/login?error=google_auth_failed");
// //   }
// // };

// // module.exports = { googleLogin, googleCallback }


// require("dotenv").config();
// const axios = require("axios");
// const jwt = require("jsonwebtoken");
// const { OAuthAccount, User } = require("../models");

// const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
// const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
// const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;

// // Step 1 — Redirect user to Google login
// const googleLogin = (req, res) => {
//   const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=profile email`;
//   res.redirect(url);
// };

// // Step 2 — Handle Google callback (no redirect)
// const googleCallback = async (req, res) => {
//   const { code } = req.query;
//   try {
//     // Exchange authorization code for tokens
//     const tokenResponse = await axios.post("https://oauth2.googleapis.com/token", {
//       client_id: CLIENT_ID,
//       client_secret: CLIENT_SECRET,
//       code,
//       redirect_uri: REDIRECT_URI,
//       grant_type: "authorization_code",
//     });

//     const { access_token } = tokenResponse.data;

//     // Fetch Google profile
//     const { data: profile } = await axios.get("https://www.googleapis.com/oauth2/v1/userinfo?alt=json", {
//       headers: { Authorization: `Bearer ${access_token}` },
//     });

//     // Find or create OAuthAccount + User
//     let oauthAccount = await OAuthAccount.findOne({
//       where: { providerId: profile.id, provider: "google" },
//     });

//     let user;

//     if (!oauthAccount) {
//       user = await User.create({
//         fullName: profile.name,
//         email: profile.email,
//         role: "applicant",
//         isEmailVerified: true,
//       });

//       oauthAccount = await OAuthAccount.create({
//         userId: user.id,
//         provider: "google",
//         providerId: profile.id,
//         email: profile.email,
//       });
//     } else {
//       user = await User.findByPk(oauthAccount.userId);
//     }

//     // Generate JWT token
//     const token = jwt.sign(
//       { id: user.id, email: user.email, role: user.role },
//       process.env.JWT_SECRET,
//       { expiresIn: process.env.TOKEN_EXPIRE || "7d" }
//     );

//     // ✅ Instead of redirecting, return JSON response
//     return res.status(200).json({
//       success: true,
//       message: "Google login successful",
//       token,
//       user: {
//         id: user.id,
//         fullName: user.fullName,
//         email: user.email,
//         role: user.role,
//       },
//     });

//   } catch (err) {
//     console.error("Google Auth Error:", err.response?.data || err.message);
//     return res.status(500).json({
//       success: false,
//       message: "Google authentication failed",
//       error: err.response?.data || err.message,
//     });
//   }
// };

// module.exports = { googleLogin, googleCallback };


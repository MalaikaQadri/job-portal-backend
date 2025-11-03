require("dotenv").config();
const { OAuth2Client } = require("google-auth-library");
const jwt = require("jsonwebtoken");
const { User, OAuthAccount } = require("../models");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const googleLogin = async (req, res) => {
  try {
    // const { idToken } = req.body;
    const idToken = req.body.idToken || req.body.token;


    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub, name, email } = payload; 

    let user = await User.findOne({ where: { email } });

    if (!user) {
      user = await User.create({
        fullName: name,
        email,
        role: "applicant",
        isEmailVerified: true,
        password: "provided_by_google",
        // title: "Not Provided",
        // experience: "N/A",
        // education: "N/A",
        // personalwebsite: "https://example.com",
        // phoneNumber: "0000000000",
      });

      await OAuthAccount.create({
        userId: user.id,
        provider: "google",
        providerId: sub,
        email,
      });
    }

    const appToken = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.TOKEN_EXPIRE  }
    );

    return res.status(200).json({
      success: true,
      message: "Google login successful",
      token: appToken,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Google authentication process failed:", error);
    return res
      .status(401)
      .json({ success: false, message: "Google authentication failed." });
  }
};

module.exports = { googleLogin };

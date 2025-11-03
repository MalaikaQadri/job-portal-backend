const speakeasy = require("speakeasy");
const qrcode = require("qrcode");
const { User } = require("../models");

const enable2FA = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const userId = req.user.id;

    // Generate new secret
    const secret = speakeasy.generateSecret({
      name: "Job Portal (2FA)",
    });

    // Update User with secret + enable 2FA
    await User.update(
      {
        secret: secret.base32,
        is2FAEnabled: true,
      },
      { where: { id: userId } }
    );

    // Generate QR code
    const qrCodeDataURL = await qrcode.toDataURL(secret.otpauth_url);

    res.json({
      success: true,
      message: "2FA enabled successfully",
      qrCode: qrCodeDataURL,
      secret: secret.base32, 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to enable 2FA" });
  }
};

// Verify 2FA Token (when logging in)
const verify2FA = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const { token } = req.body;
    const userId = req.user.id;

    const user = await User.findByPk(userId);

    if (!user || !user.is2FAEnabled) {
      return res.status(400).json({ error: "2FA is not enabled" });
    }

    const verified = speakeasy.totp.verify({
      secret: user.secret,
      encoding: "base32",
      token,
      window: 1, // allows ±30s clock drift
    });

    if (!verified) {
      return res.status(400).json({ error: "Invalid or expired token" });
    }

    res.json({
      success: true, 
      message: "2FA verification successful" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to verify 2FA" });
  }
};


const disable2FA = async (req, res) => {
  console.log('Disable 2FA req.user =',req.user);
  try {
    if (!req.user || !req.user.id) {
      console.warn("disable2FA: missing req.user", req.user);
      return res.status(401).json({ error: "User not authenticated" });
    }

    const userId = req.user.id;
    console.log("disable2FA: request by userId =", userId);

    // find user instance (returns null if not found)
    const user = await User.findByPk(userId);
    if (!user) {
      console.warn("disable2FA: user not found with id", userId);
      return res.status(404).json({ error: "User not found" });
    }

    // if 2FA already disabled, respond clearly
    if (!user.is2FAEnabled) {
      return res.status(400).json({ error: "2FA is already disabled" });
    }

    // clear the secret and backup codes, disable flag
    user.secret = "";
    user.is2FAEnabled = false;
    user.twofaBackupcode = [];
    await user.save(); // save instance -> reliable 

    return res.json({
      success: true,
       message: "2FA disabled successfully" });
  } catch (error) {
    console.error("disable2FA error:", error);
    return res.status(500).json({ error: "Failed to disable 2FA" });
  }
};


const get2FAStatus = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ success: false, error: "User not authenticated" });
    }

    const userId = req.user.id;

    const user = await User.findByPk(userId, {
      attributes: ["is2FAEnabled"]
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found"
      });
    }

    res.status(200).json({
      success: true,
      is2FAEnabled: user.is2FAEnabled
    });
  } catch (error) {
    console.error("Error fetching 2FA status:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch 2FA status"
    });
  }
};


module.exports = { enable2FA, verify2FA, disable2FA, get2FAStatus };



























// const speakeasy = require("speakeasy");
// const qrcode = require("qrcode");
// const { User } = require("../models");

// // Enable 2FA (Generate Secret + QR Code) 
// const enable2FA = async (req, res) => {
//   try {
//     console.log(req.user)
//     if (!req.user || !req.user.id) {
//       return res.status(401).json({ error: "User not authenticated" });
//     }
//     // const userId = req.user.id;

//     const userId = req.user.id; // assuming user is authenticated
//     const secret = speakeasy.generateSecret({
//       name: "Job Portal (2FA)",
//     });
//     // Save secret in DB
//     let twoFactor = await User.findOne({ where: { userId } });
//     if (!twoFactor) {
//       twoFactor = await User.create({
//         userId,
//         secret: secret.base32,
//          is2FAEnabled: true,
//       });
//     } else {
//       await twoFactor.update({
//         secret: secret.base32,
//          is2FAEnabled: true,
//       });
//     }

//      //  Update Users table too
//     await User.update(
//       { is2FAEnabled: true },
//       { where: { id: userId } }
//     );

//     // Generate QR Code for user to scan
//     const qrCodeDataURL = await qrcode.toDataURL(secret.otpauth_url);

//     res.json({
//       message: "2FA enabled successfully",
//       qrCode: qrCodeDataURL,
//       secret: secret.base32, // you can hide this in production
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Failed to enable 2FA" });
//   }
// };

// //  Verify 2FA Token (when logging in)
// const verify2FA = async (req, res) => {
//   try {
//      if (!req.user || !req.user.id) {
//       return res.status(401).json({ error: "User not authenticated" });
//     }

//     const { token } = req.body;
//     const userId = req.user.id;

//     const twoFactor = await User.findOne({ where: { userId } });
//     if (!twoFactor || !twoFactor.isEnabled) {
//       return res.status(400).json({ error: "2FA is not enabled" });
//     }

//     const verified = speakeasy.totp.verify({
//       secret: twoFactor.secret,
//       encoding: "base32",
//       token,
//       window: 1, // allow ±30s clock drift
//     });

//     if (!verified) {
//       return res.status(400).json({ error: "Invalid or expired token" });
//     }

//     res.json({ message: "2FA verification successful" });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Failed to verify 2FA" });
//   }
// };

// //  Disable 2FA
// const disable2FA = async (req, res) => {
//   try {
    
//     if (!req.user || !req.user.id) {
//       return res.status(401).json({ error: "User not authenticated" });
//     }

//     const userId = req.user.id;

//      const deleted = await User.destroy({ where: { userId } });

//     if (!deleted) {
//       return res.status(404).json({ message: "No 2FA found for this user" });
//     }
//    await User.update(
//   { is2FAEnabled: false },
//   { where: { id: userId } }
// );
//     res.json({ message: "2FA disabled successfully" });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Failed to disable 2FA" });
//   }
// };

// module.exports = { enable2FA, verify2FA, disable2FA }





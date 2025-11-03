// middleware/verifyFirebaseToken.js
const admin = require('../config/firebaseAdmin');

async function verifyFirebaseToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization || '';
    // Expect: "Bearer <idToken>"
    const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    // verifies and decodes ID token
    const decoded = await admin.auth().verifyIdToken(token, true); // second arg: checkRevoked (optional)
    // If you pass true, you should handle revoked tokens (catch auth/token-revoked)
    req.firebaseUser = decoded; // contains uid, email, firebase.sign_in_provider etc.
    next();
  } catch (err) {
    console.error('Firebase token verification failed:', err);
    return res.status(401).json({ message: 'Invalid or expired Firebase token' });
  }
}

module.exports = {verifyFirebaseToken};

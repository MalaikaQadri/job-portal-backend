// controllers/socialAuthController.js
const { User, OAuthAccount } = require('../models'); // assume index.js exports models
// const { generateUniqueCricketUsername } = require('../utils/username'); // your helper
// const { createProfileImage } = require('../services/imageService'); // placeholder
const jwt = require('jsonwebtoken'); // or your existing token service

async function linkOAuthAccount(userId, provider, providerId, email) {
  const [oauth, created] = await OAuthAccount.findOrCreate({
    where: { provider, providerId },
    defaults: { userId, provider, providerId, email },
  });

  if (!created && oauth.userId !== userId) {

    oauth.userId = userId;
    oauth.email = email || oauth.email;
    await oauth.save();
  }
  return oauth;
}

const socialLogin = async (req, res) => {
  try {

    const firebaseUser = req.firebaseUser;
    if (!firebaseUser || !firebaseUser.email) {
      return res.status(400).json({ message: 'Invalid Firebase user data' });
    }
    const email = firebaseUser.email;
    const provider = firebaseUser.firebase?.sign_in_provider || 'firebase';
    const providerId = firebaseUser.uid; 

    let user = await User.findOne({ where: { email } });

    if (user) {

      await linkOAuthAccount(user.id, provider, providerId, email);

      if (user.is_deactivated) {
        user.is_deactivated = false;
        await user.save();
      }

      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '30d' });
      return res.status(200).json({ token, id: user.id, message: 'Sign-in success' });
    }


    const name = firebaseUser.name || firebaseUser.displayName || 'User';
    const [firstName = '', lastName = ''] = name.split(' ', 2);



    const username = await generateUniqueCricketUsername(name);

    const newUser = await User.create({
      fullName: name,
      username,
      email,
      isEmailVerified: true,
      firebase_uid: providerId,
      provider: provider,

    });

    await linkOAuthAccount(newUser.id, provider, providerId, email);

    const token = jwt.sign({ id: newUser.id }, process.env.JWT_SECRET, { expiresIn: '30d' });
    return res.status(200).json({ token, id: newUser.id, message: 'Signup success' });

  } catch (err) {
    console.error('socialLogin error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};


module.exports = { socialLogin }
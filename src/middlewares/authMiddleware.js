const jwt = require('jsonwebtoken');
const { User } = require("../models")



// --------Authorize Middleware----------
const authorize = async (req, res, next) => {
  console.log(req.user);
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Token missing" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // req.user = { id: decoded.id }

    const user = await User.findByPk(decoded.id);
    if (!user) return res.status(401).json({ error: "Invalid token user" });

    req.user = {
      ...user.toJSON(),id:user.id,
    }; 
    next();
  } catch (err) {
    console.log("Auth Error:", err)
    return res.status(401).json({ error: "Unauthorized" });
  }
};

// ------------isAdmin-------------
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ error: 'Access denied. Admins only.' });
  }
};

// -----------isRecruiter ----------------
const isRecruiter = (req, res, next) => {
  if (req.user && req.user.role === 'recruiter') {
    next();
  } else {
    res.status(403).json({ error: 'Access denied. Recruiters only.' });
  }
};

// ---------------isApplicant--------------
const isApplicant = (req, res, next) => {
  if (req.user && req.user.role === 'applicant') {
    next();
  } else {
    res.status(403).json({ error: 'Access denied. Applicants only.' });
  }
};

// Optional: Match user to resource (example: only allow user to update their own profile)
// const isSelfOrAdmin = (req, res, next) => {
//   const requestedUserId = req.params.id;

//   if (req.user && (req.user.id == requestedUserId || req.user.role === 'admin')) {
//     next();
//   } else {
//     res.status(403).json({ error: 'Access denied. Not your resource.' });
//   }
// };


module.exports = { authorize, isAdmin, isRecruiter, isApplicant  };


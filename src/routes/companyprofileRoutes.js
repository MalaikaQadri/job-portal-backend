const express = require('express');
const router = express.Router();
const { getRecruiterProfile, updateRecruiterProfile,getRecruiterProfileById,getRecruiterProffile } = require('../controllers/companyprofileController');
const { authorize } = require('../middlewares/authMiddleware');





// Get recruiter profile  
router.get('/profile', authorize, getRecruiterProfile);
router.get('/proffile', authorize, getRecruiterProffile);
router.get('/profile/:id', authorize, getRecruiterProfileById);

// Update recruiter profile
router.put('/profile', authorize, updateRecruiterProfile);

module.exports = router; 




 


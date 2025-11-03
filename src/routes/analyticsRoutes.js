const express = require("express");
const router = express.Router();
const { getAnalytics, getRecruiterStats, getApplicantsStats } = require("../controllers/analyticsController");
const { isAdmin, authorize } = require("../middlewares/authMiddleware");
const { getAdminAnalytics }= require('../controllers/adminController');

// router.get("/analytics", authorize , isAdmin, getAnalytics);
router.get("/adminAnalytics", authorize , isAdmin, getAdminAnalytics);

router.get("/recruiterStats", authorize, getRecruiterStats);
router.get("/applicantStats", authorize, getApplicantsStats);



module.exports = router;

const express = require("express");
const router = express.Router();
const { matchResumeWithJob, matchResumeToJob } = require("../controllers/resumeMatchScoreController");
const { authorize } = require("../middlewares/authMiddleware");


router.get("/jobs/:jobId/match", authorize, matchResumeWithJob);
router.post("/match-resume", matchResumeToJob);

module.exports = router;




const express = require('express');
const router = express.Router();
const { applyJob, getJobApplications, updateApplicationStatus, getMyApplications, getJobApplicationsForRecruiter, getJobApplicationDetail } = require('../controllers/applicationController');
const { authorize, isRecruiter, isApplicant } = require('../middlewares/authMiddleware');


// applicant
router.post('/jobs/:jobId/apply', authorize, isApplicant , applyJob);
router.get('/my-applications', authorize, isApplicant , getMyApplications);

// recruiter 
router.get('/jobs/:jobId/applications/:applicationId', authorize, isRecruiter, getJobApplicationDetail);

router.put('/applications/:applicationId/status', authorize, isRecruiter , updateApplicationStatus);

router.get('/recruiter/jobs/:jobId/applicants', authorize, isRecruiter, getJobApplicationsForRecruiter);

module.exports = router; 
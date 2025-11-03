const express = require('express');
const router = express.Router();
const {updateReportedJob, getReportedJobById,  getRecruiterOnlyJobs, getJobsOnAdmin,updateJobApprovalStatus, createJobPending, deleteJob, getJobById, updateJob,getJobs, expireJobs, getJobDetails, getRecruiterJobs } = require('../controllers/jobpostController');
const { authorize } = require('../middlewares/authMiddleware');



router.post('/createJob', authorize, createJobPending);

router.put('/jobs/:jobId/approval', authorize, updateJobApprovalStatus) // admin only
router.get('/getJobsOnAdmin', getJobsOnAdmin)
router.get('/jobs/recruiterOnlyjobs', authorize,  getRecruiterOnlyJobs);
router.get('/jobs/recruiter/reported/:jobId', authorize,  getReportedJobById );
router.put('/jobs/recruiter/reported/:jobId', authorize, updateReportedJob );

router.get('/', getJobs);
router.get('/getJobDetail/:id', getJobDetails);

router.get('/recruiter/job', authorize ,getRecruiterJobs);

router.get('/:id', getJobById);
router.put('/:id', updateJob);

router.delete('/:id', authorize ,deleteJob);

router.put('/expire-jobs/:id', expireJobs );

module.exports = router;







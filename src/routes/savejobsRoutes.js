const express = require('express');
const router = express.Router();
const { removeSavedJob,  saveJob,getMySavedJobs  } = require('../controllers/savedjobsController');
const {authorize} = require('../middlewares/authMiddleware'); 

router.post('/', authorize, saveJob);

router.get('/', authorize, getMySavedJobs);
// router.get('/mm', authorize, getMySavedJJobs);

router.delete('/:jobId', authorize, removeSavedJob);

module.exports = router;


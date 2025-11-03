const express = require('express');
const router = express.Router();
const {  filterJobs, deleteJob} = require('../controllers/jobfilterController');

router.get('/filter/search',filterJobs);

router.delete('/:id',deleteJob);

module.exports = router;

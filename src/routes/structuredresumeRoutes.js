const express = require('express');
const router = express.Router();
const { createResume, getResume, updateResume, deleteResume, getResumeById } = require('../controllers/structureresumeController');
const { authorize } = require('../middlewares/authMiddleware');

router.post('/resume', authorize , createResume);

router.put('/resume',authorize, updateResume);

router.get('/resume',authorize, getResume);

router.delete('/resume/:userId',authorize, deleteResume);

router.get('/resume/:userId',getResumeById )


module.exports = router;

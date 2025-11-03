const express = require('express');
const router = express.Router();
const { uploadResumePdf, uploadProfilePic, uploadBannerImage } = require('../controllers/imageController');
const { uploadImage, uploadResume } = require('../middlewares/upload');
const { authorize } = require('../middlewares/authMiddleware');
 

router.post('/upload/profilepic',authorize, uploadImage.single("profilepic"), uploadProfilePic);
router.post('/upload/bannerImage',authorize, uploadImage.single("bannerImage"), uploadBannerImage);
router.post('/upload/resume',authorize, uploadResume.single("resume"), uploadResumePdf);


module.exports = router;

 
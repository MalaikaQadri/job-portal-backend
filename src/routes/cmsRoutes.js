const express = require("express");
const router = express.Router();
const { getAboutUs, createAboutUs, updateAboutUs, deleteAboutUs } = require('../controllers/aboutUsController');
const { getContactUs, deleteContactUs, createContactUs, updateContactUs } = require('../controllers/contactUsCntroller');
const { createFAQ , deleteFAQ, getAllFAQs, updateFAQ  } = require('../controllers/faqController');


// -------------
router.post('/aboutUs' , createAboutUs);
router.put('/aboutUs', updateAboutUs);
router.delete('/aboutUs', deleteAboutUs);
router.get('/aboutUs', getAboutUs);

// ----------------
router.post('/contactUs' , createContactUs);
router.put('/contactUs', updateContactUs);
router.delete('/contactUs', deleteContactUs);
router.get('/contactUs', getContactUs);

// --------------------------
router.post('/faq', createFAQ);
router.get('/faq', getAllFAQs);
router.delete('/faq/:id', deleteFAQ);
router.put('/faq/:id', updateFAQ);




module.exports = router;




const express = require('express');
const router = express.Router();
const {createIndustry, getIndustries, deleteIndustry} = require('../controllers/industryController');

router.post('/', createIndustry);
router.get('/', getIndustries);
router.delete('/:id', deleteIndustry);

module.exports = router;



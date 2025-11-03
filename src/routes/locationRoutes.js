const express = require('express');
const router = express.Router();
const {createLocation, getLocation, deleteLocation} = require('../controllers/locationController');

router.post('/', createLocation);
router.get('/', getLocation);
router.delete('/:id', deleteLocation);

module.exports = router;



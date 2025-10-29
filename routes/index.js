const express = require('express');
const countryController = require('../controllers/countryController');

const router = express.Router();

// Country routes
router.post('/countries/refresh', countryController.refresh.bind(countryController));
router.get('/countries/image', countryController.getImage.bind(countryController));
router.get('/countries/:name', countryController.getOne.bind(countryController));
router.delete('/countries/:name', countryController.delete.bind(countryController));
router.get('/countries', countryController.getAll.bind(countryController));

// Status route
router.get('/status', countryController.getStatus.bind(countryController));

module.exports = router;
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getAppliances, getPropertyAppliances, createAppliance, updateAppliance, deleteAppliance } = require('../controllers/applianceController');

router.use(protect);
router.get('/', getAppliances);
router.get('/property/:propertyId', getPropertyAppliances);
router.post('/', createAppliance);
router.put('/:id', updateAppliance);
router.delete('/:id', deleteAppliance);

module.exports = router;

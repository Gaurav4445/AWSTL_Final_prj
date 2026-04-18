const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getRecords, getPropertyRecords, createRecord, updateRecord, deleteRecord, getDashboardStats } = require('../controllers/recordController');

router.use(protect);
router.get('/', getRecords);
router.get('/stats/dashboard', getDashboardStats);
router.get('/property/:propertyId', getPropertyRecords);
router.post('/', createRecord);
router.put('/:id', updateRecord);
router.delete('/:id', deleteRecord);

module.exports = router;
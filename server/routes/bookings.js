const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getBookings, getPropertyBookings, createBooking, updateBooking, deleteBooking } = require('../controllers/bookingController');

router.use(protect);
router.get('/', getBookings);
router.get('/property/:propertyId', getPropertyBookings);
router.post('/', createBooking);
router.put('/:id', updateBooking);
router.delete('/:id', deleteBooking);

module.exports = router;

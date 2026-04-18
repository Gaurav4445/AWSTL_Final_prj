const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getProperties, getProperty, createProperty, updateProperty, deleteProperty } = require('../controllers/propertyController');

router.use(protect);
router.get('/', getProperties);
router.get('/:id', getProperty);
router.post('/', createProperty);
router.put('/:id', updateProperty);
router.delete('/:id', deleteProperty);

module.exports = router;
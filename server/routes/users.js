// routes/users.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { 
  register, 
  login, 
  getMe, 
  updateUser 
} = require('../controllers/userController');

router.post('/register', register);
router.post('/login', login);

router.use(protect);
router.get('/me', getMe);
router.put('/me', updateUser);

module.exports = router;
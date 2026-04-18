// routes/tasks.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { 
  getTasks, 
  getPropertyTasks, 
  getTask, 
  createTask, 
  updateTask, 
  deleteTask, 
  getTemplateTasks 
} = require('../controllers/taskController');

// Public route for templates
router.get('/templates', getTemplateTasks);

// Protected routes
router.use(protect);

router.get('/', getTasks);
router.get('/:id', getTask);
router.get('/property/:propertyId', getPropertyTasks);
router.post('/', createTask);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);

module.exports = router;
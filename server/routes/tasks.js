const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getTasks, getPropertyTasks, getTask, createTask, updateTask, deleteTask, getTemplateTasks } = require('../controllers/taskController');

router.get('/templates', getTemplateTasks);
router.use(protect);
router.get('/', getTasks);
router.get('/property/:propertyId', getPropertyTasks);
router.get('/:id', getTask);
router.post('/', createTask);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);

module.exports = router;
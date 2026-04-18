// controllers/taskController.js
const Task = require('../models/Task');

// Get all tasks for a user
exports.getTasks = async (req, res, next) => {
  try {
    const tasks = await Task.find({ userId: req.userId });
    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks,
    });
  } catch (error) {
    next(error);
  }
};

// Get tasks for specific property
exports.getPropertyTasks = async (req, res, next) => {
  try {
    const tasks = await Task.find({
      userId: req.userId,
      propertyId: req.params.propertyId,
    });
    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks,
    });
  } catch (error) {
    next(error);
  }
};

// Get single task
exports.getTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, error: 'Task not found' });
    }
    res.status(200).json({ success: true, data: task });
  } catch (error) {
    next(error);
  }
};

// Create task
exports.createTask = async (req, res, next) => {
  try {
    req.body.userId = req.userId;
    const task = await Task.create(req.body);
    res.status(201).json({ success: true, data: task });
  } catch (error) {
    next(error);
  }
};

// Update task
exports.updateTask = async (req, res, next) => {
  try {
    let task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, error: 'Task not found' });
    }
    if (task.userId.toString() !== req.userId) {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }

    task = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({ success: true, data: task });
  } catch (error) {
    next(error);
  }
};

// Delete task
exports.deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, error: 'Task not found' });
    }
    if (task.userId.toString() !== req.userId) {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }

    await Task.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};

// Get template tasks (predefined common maintenance tasks)
exports.getTemplateTasks = async (req, res, next) => {
  try {
    const templates = await Task.find({ isTemplate: true });
    
    // If no templates exist in DB, return some default ones
    if (templates.length === 0) {
      const defaultTemplates = [
        {
          name: "Change AC Filter",
          description: "Replace or clean the air filter in split/window AC",
          category: "AC/Cooling",
          frequency: "Monthly",
          estimatedCost: 300,
          currency: "INR",
          isTemplate: true
        },
        {
          name: "Clean Water Tank",
          description: "Drain and clean overhead water tank",
          category: "Water Systems",
          frequency: "Quarterly",
          estimatedCost: 800,
          currency: "INR",
          isTemplate: true
        },
        {
          name: "Check Electrical Wiring",
          description: "Inspect switches, MCB, and wiring for safety",
          category: "Electrical",
          frequency: "Bi-Annual",
          estimatedCost: 500,
          currency: "INR",
          isTemplate: true
        },
        {
          name: "Service AC Unit",
          description: "Full AC servicing including gas check",
          category: "AC/Cooling",
          frequency: "Quarterly",
          estimatedCost: 1500,
          currency: "INR",
          isTemplate: true
        },
        {
          name: "Pest Control Spray",
          description: "General pest control for home",
          category: "Pest Control",
          frequency: "Quarterly",
          estimatedCost: 600,
          currency: "INR",
          isTemplate: true
        },
        {
          name: "Clean Bathroom Drains",
          description: "Unclog and clean drains to prevent blockage",
          category: "Plumbing",
          frequency: "Monthly",
          estimatedCost: 200,
          currency: "INR",
          isTemplate: true
        }
      ];
      
      return res.status(200).json({
        success: true,
        count: defaultTemplates.length,
        data: defaultTemplates,
        note: "Default templates loaded (no templates saved in DB yet)"
      });
    }

    res.status(200).json({
      success: true,
      count: templates.length,
      data: templates,
    });
  } catch (error) {
    next(error);
  }
};
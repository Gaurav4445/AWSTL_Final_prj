const Task = require('../models/Task');

const normalizeTaskPayload = (payload = {}, existingTask = null) => {
  const normalized = { ...payload };

  if (typeof normalized.title === 'string' && !normalized.name) {
    normalized.name = normalized.title;
  }
  delete normalized.title;

  if (Object.prototype.hasOwnProperty.call(normalized, 'dueDate')) {
    normalized.nextDueDate = normalized.dueDate || null;
  }
  delete normalized.dueDate;

  const completed = Object.prototype.hasOwnProperty.call(normalized, 'completed')
    ? !!normalized.completed
    : existingTask?.completed;

  if (typeof completed === 'boolean') {
    normalized.completed = completed;
    normalized.completedAt = completed ? existingTask?.completedAt || new Date() : null;
  }

  if (normalized.estimatedCost !== undefined) {
    normalized.estimatedCost = Number(normalized.estimatedCost) || 0;
  }

  return normalized;
};

const serializeTask = (taskDoc) => {
  const task = taskDoc.toObject ? taskDoc.toObject() : taskDoc;
  return {
    ...task,
    dueDate: task.nextDueDate || null,
    status: task.completed ? 'Completed' : 'Pending',
  };
};

exports.getTasks = async (req, res, next) => {
  try {
    const tasks = await Task.find({ userId: req.userId }).populate('propertyId', 'name city').sort({ nextDueDate: 1, createdAt: -1 });
    res.status(200).json({ success: true, count: tasks.length, data: tasks.map(serializeTask) });
  } catch (err) { next(err); }
};

exports.getPropertyTasks = async (req, res, next) => {
  try {
    const tasks = await Task.find({ userId: req.userId, propertyId: req.params.propertyId }).populate('propertyId', 'name city').sort({ nextDueDate: 1, createdAt: -1 });
    res.status(200).json({ success: true, count: tasks.length, data: tasks.map(serializeTask) });
  } catch (err) { next(err); }
};

exports.getTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id).populate('propertyId', 'name city');
    if (!task) return res.status(404).json({ success: false, error: 'Task not found' });
    if (task.userId.toString() !== req.userId)
      return res.status(403).json({ success: false, error: 'Not authorized' });
    res.status(200).json({ success: true, data: serializeTask(task) });
  } catch (err) { next(err); }
};

exports.createTask = async (req, res, next) => {
  try {
    const payload = normalizeTaskPayload(req.body);
    payload.userId = req.userId;
    const task = await Task.create(payload);
    await task.populate('propertyId', 'name city');
    res.status(201).json({ success: true, data: serializeTask(task) });
  } catch (err) { next(err); }
};

exports.updateTask = async (req, res, next) => {
  try {
    let task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ success: false, error: 'Task not found' });
    if (task.userId.toString() !== req.userId)
      return res.status(403).json({ success: false, error: 'Not authorized' });

    const payload = normalizeTaskPayload(req.body, task);
    task = await Task.findByIdAndUpdate(req.params.id, payload, { new: true, runValidators: true }).populate('propertyId', 'name city');
    res.status(200).json({ success: true, data: serializeTask(task) });
  } catch (err) { next(err); }
};

exports.deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ success: false, error: 'Task not found' });
    if (task.userId.toString() !== req.userId)
      return res.status(403).json({ success: false, error: 'Not authorized' });
    await Task.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, data: {} });
  } catch (err) { next(err); }
};

exports.getTemplateTasks = async (req, res, next) => {
  try {
    const templates = [
      { name: 'AC Filter Clean', category: 'AC/Cooling', frequency: 'Monthly', estimatedCost: 300, description: 'Clean or replace split/window AC filter' },
      { name: 'AC Full Service', category: 'AC/Cooling', frequency: 'Quarterly', estimatedCost: 1500, description: 'Full AC servicing including gas top-up check' },
      { name: 'Overhead Tank Cleaning', category: 'Water Systems', frequency: 'Quarterly', estimatedCost: 800, description: 'Drain, scrub and refill overhead water tank' },
      { name: 'RO Service', category: 'RO/Water Purifier', frequency: 'Bi-Annual', estimatedCost: 700, description: 'Replace filters and membrane in RO purifier' },
      { name: 'Geyser Check', category: 'Electrical', frequency: 'Annual', estimatedCost: 400, description: 'Inspect heating element and thermostat' },
      { name: 'Electrical Wiring Check', category: 'Electrical', frequency: 'Annual', estimatedCost: 500, description: 'Inspect MCB, switches and wiring for safety' },
      { name: 'Plumbing Inspection', category: 'Plumbing', frequency: 'Bi-Annual', estimatedCost: 400, description: 'Check taps, flush tanks, pipes for leaks' },
      { name: 'Drain Cleaning', category: 'Plumbing', frequency: 'Monthly', estimatedCost: 200, description: 'Unclog bathroom and kitchen drains' },
      { name: 'Pest Control', category: 'Pest Control', frequency: 'Quarterly', estimatedCost: 600, description: 'General pest control spray for home' },
      { name: 'Termite Treatment', category: 'Pest Control', frequency: 'Annual', estimatedCost: 2000, description: 'Anti-termite treatment for wooden furniture and floors' },
      { name: 'Inverter Battery Check', category: 'Generator/Inverter', frequency: 'Quarterly', estimatedCost: 300, description: 'Check water level and terminals of inverter battery' },
      { name: 'LPG Cylinder Booking', category: 'Gas/LPG', frequency: 'Monthly', estimatedCost: 950, description: 'Book gas cylinder refill' },
      { name: 'Deep Cleaning', category: 'Cleaning', frequency: 'Bi-Annual', estimatedCost: 2500, description: 'Full home deep cleaning including kitchen and bathrooms' },
      { name: 'CCTV/Security Check', category: 'Security', frequency: 'Bi-Annual', estimatedCost: 500, description: 'Test cameras, door locks, and intercom' },
    ];
    res.status(200).json({ success: true, count: templates.length, data: templates });
  } catch (err) { next(err); }
};

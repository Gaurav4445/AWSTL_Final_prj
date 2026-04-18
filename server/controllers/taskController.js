const Task = require('../models/Task');

exports.getTasks = async (req, res, next) => {
  try {
    const tasks = await Task.find({ userId: req.userId }).populate('propertyId', 'name city');
    res.status(200).json({ success: true, count: tasks.length, data: tasks });
  } catch (err) { next(err); }
};

exports.getPropertyTasks = async (req, res, next) => {
  try {
    const tasks = await Task.find({ userId: req.userId, propertyId: req.params.propertyId });
    res.status(200).json({ success: true, count: tasks.length, data: tasks });
  } catch (err) { next(err); }
};

exports.getTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ success: false, error: 'Task not found' });
    res.status(200).json({ success: true, data: task });
  } catch (err) { next(err); }
};

exports.createTask = async (req, res, next) => {
  try {
    req.body.userId = req.userId;
    const task = await Task.create(req.body);
    res.status(201).json({ success: true, data: task });
  } catch (err) { next(err); }
};

exports.updateTask = async (req, res, next) => {
  try {
    let task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ success: false, error: 'Task not found' });
    if (task.userId.toString() !== req.userId)
      return res.status(403).json({ success: false, error: 'Not authorized' });
    task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.status(200).json({ success: true, data: task });
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
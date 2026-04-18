const User = require('../models/User');
const jwt = require('jsonwebtoken');

const signToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

exports.register = async (req, res, next) => {
  try {
    const { name, email, phone, password, city, state } = req.body;
    if (!name || !email || !phone || !password)
      return res.status(400).json({ success: false, error: 'Please provide all required fields' });

    if (await User.findOne({ email }))
      return res.status(400).json({ success: false, error: 'User already exists' });

    const user = await User.create({ name, email, phone, password, city: city || '', state: state || '' });
    const token = signToken(user._id);
    res.status(201).json({ success: true, token, user: { id: user._id, name: user.name, email: user.email, phone: user.phone, city: user.city, state: user.state } });
  } catch (err) { next(err); }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, error: 'Please provide email and password' });

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ success: false, error: 'Invalid credentials' });

    const token = signToken(user._id);
    res.status(200).json({ success: true, token, user: { id: user._id, name: user.name, email: user.email, phone: user.phone, city: user.city, state: user.state } });
  } catch (err) { next(err); }
};

exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });
    res.status(200).json({ success: true, data: user });
  } catch (err) { next(err); }
};

exports.updateUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.userId, req.body, { new: true, runValidators: true });
    res.status(200).json({ success: true, data: user });
  } catch (err) { next(err); }
};
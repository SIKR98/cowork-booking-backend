const { asyncHandler } = require('../utils/asyncHandler');
const { AppError } = require('../utils/AppError');
const authService = require('../services/auth.service');

const register = asyncHandler(async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) throw new AppError('username and password are required', 400, 'VALIDATION_ERROR');
  const user = await authService.register({ username, password });
  res.status(201).json({ user });
});

const login = asyncHandler(async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) throw new AppError('username and password are required', 400, 'VALIDATION_ERROR');
  const result = await authService.login({ username, password });
  res.json(result);
});

module.exports = { register, login };

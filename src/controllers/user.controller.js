const { asyncHandler } = require('../utils/asyncHandler');
const userService = require('../services/user.service');

const listUsers = asyncHandler(async (req, res) => {
  const users = await userService.getAllUsers();
  res.json({ users });
});

const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await userService.deleteUser(id);
  res.status(204).send();
});

module.exports = {
  listUsers,
  deleteUser,
};
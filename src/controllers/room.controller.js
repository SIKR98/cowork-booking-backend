const { asyncHandler } = require('../utils/asyncHandler');
const roomService = require('../services/room.service');

const listRooms = asyncHandler(async (req, res) => {
  const rooms = await roomService.getAllRooms();
  res.json({ rooms });
});

const createRoom = asyncHandler(async (req, res) => {
  const { name, capacity, type } = req.body || {};
  const room = await roomService.createRoom({ name, capacity, type });
  res.status(201).json({ room });
});

const updateRoom = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, capacity, type } = req.body || {};

  const room = await roomService.updateRoom(id, { name, capacity, type });
  res.json({ room });
});

const deleteRoom = asyncHandler(async (req, res) => {
  const { id } = req.params;

  await roomService.deleteRoom(id);
  res.status(204).send();
});

module.exports = { listRooms, createRoom, updateRoom, deleteRoom };
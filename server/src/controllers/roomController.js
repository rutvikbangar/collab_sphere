import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { Room } from "../models/room.model.js"

export const createRoom = asyncHandler(async (req,res) => {
    const { roomName } = req.body;
    const user = req.user;

    if (!roomName) {
      throw new ApiError(400, "Room name is required");
    }

    const room = await Room.create({
      roomName: roomName,
      createdBy: user._id,
      members: [user._id]
    });

    if (!room) {
      throw new ApiError(500, "Failed to create room");
    }

    return res.status(200).json(new ApiResponse(200, room, "Room created successfully"));
});

export const fetchMyRooms = asyncHandler(async (req, res) => {
  const user = req.user;

  const rooms = await Room.find({ createdBy: user._id });

  return res
    .status(200)
    .json(new ApiResponse(200, rooms, "Rooms fetched successfully"));
});

export const fetchAllRooms = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const rooms = await Room.find({
    $or: [
      { createdBy: userId },
      { members: userId }
    ]
  });

  return res.status(200).json(new ApiResponse(200, rooms, "Rooms fetched successfully"));
});

import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { Room } from "../models/room.model.js"

import { User } from "../models/user.model.js";

export const addMemberToRoom = asyncHandler(async (req, res) => {
  const { roomId } = req.params;
  const { email } = req.body;
  const inviterId = req.user._id;

  if (!email) {
    throw new ApiError(400, "User email is required");
  }

  // check if the person inviting is a member
  const room = await Room.findById(roomId);
  if (!room) {
    throw new ApiError(404, "Room not found");
  }
  if (!room.members.includes(inviterId)) {
    throw new ApiError(403, "You are not a member of this room");
  }

  // Find the user to be added
  const userToAdd = await User.findOne({ email });
  if (!userToAdd) {
    throw new ApiError(404, "User with this email does not exist");
  }

  // Check if the user is already a member
  if (room.members.includes(userToAdd._id)) {
    throw new ApiError(409, "User is already a member of this room");
  }

  // Add the user to the members
  room.members.addToSet(userToAdd._id);
  await room.save();

  return res.status(200).json(new ApiResponse(200, room, "Member added successfully"));
});


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

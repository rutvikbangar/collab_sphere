import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { File } from "../models/files.model.js";
import cloudinary from "../utils/cloudinary.js";
import fs from "fs";

export const uploadFile = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, "File is required");
  }

  const { roomId } = req.body;
  const userId = req.user._id;

const result = await cloudinary.uploader.upload(req.file.path, {
  resource_type: "raw", 
  folder: "collab_sphere_files",
  use_filename: true,
  unique_filename: false
});

  fs.unlinkSync(req.file.path); // Clean up temp file

  const newFile = await File.create({
    roomId,
    url: result.secure_url,
    public_id: result.public_id,
    fileName: req.file.originalname,
    uploadedBy: userId,
  });

  return res.status(201).json(new ApiResponse(201, newFile, "File uploaded successfully"));
});

export const deleteFile = asyncHandler(async (req, res) => {
  const { fileId } = req.params;
  const userId = req.user._id;

  const file = await File.findById(fileId);

  if (!file) {
    throw new ApiError(404, "File not found");
  }

  if (file.uploadedBy.toString() !== userId.toString()) {
    throw new ApiError(403, "You are not authorized to delete this file");
  }

  await cloudinary.uploader.destroy(file.public_id, { resource_type: "raw" });
  await File.findByIdAndDelete(fileId);

  return res.status(200).json(new ApiResponse(200, {}, "File deleted successfully"));
});

export const getRoomFiles = asyncHandler(async (req, res) => {
  const { roomId } = req.params;
  const files = await File.find({ roomId }).populate('uploadedBy', 'name');
  return res.status(200).json(new ApiResponse(200, files, "Files fetched successfully"));
});
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

  // Ensure filename has .pdf extension
  let fileName = req.file.originalname;
  if (!fileName.toLowerCase().endsWith('.pdf')) {
    fileName = `${fileName}.pdf`;
  }

  const result = await cloudinary.uploader.upload(req.file.path, {
    resource_type: "raw",
    folder: "collab_sphere_files",
    use_filename: true,
    unique_filename: false,
    type: "upload",
  });

  fs.unlinkSync(req.file.path); // Clean up temp file

  // Create download URL with fl_attachment flag (without filename in URL)
  let downloadUrl = result.secure_url;
  
  // Add fl_attachment transformation (correct format)
  if (downloadUrl.includes('/upload/')) {
    // Just add fl_attachment, not with filename
    downloadUrl = downloadUrl.replace('/upload/', '/upload/fl_attachment/');
  }


  const newFile = await File.create({
    roomId,
    url: downloadUrl,
    public_id: result.public_id,
    fileName: fileName, // Store filename with .pdf extension in DB
    uploadedBy: userId,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, newFile, "File uploaded successfully"));
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

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "File deleted successfully"));
});

export const getRoomFiles = asyncHandler(async (req, res) => {
  const { roomId } = req.params;
  const files = await File.find({ roomId }).populate("uploadedBy", "name");
  
  // Ensure all file URLs have the download flag
  const filesWithDownloadUrls = files.map(file => {
    const fileObj = file.toObject();
    
    // Ensure filename has .pdf extension
    if (!fileObj.fileName.toLowerCase().endsWith('.pdf')) {
      fileObj.fileName = `${fileObj.fileName}.pdf`;
    }
    
    // Check if URL already has fl_attachment, if not add it
    if (!fileObj.url.includes('fl_attachment')) {
      if (fileObj.url.includes('/upload/')) {
        fileObj.url = fileObj.url.replace('/upload/', '/upload/fl_attachment/');
      }
    }
    
    return fileObj;
  });
  
  return res
    .status(200)
    .json(new ApiResponse(200, filesWithDownloadUrls, "Files fetched successfully"));
});
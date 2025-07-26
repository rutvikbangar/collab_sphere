import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import { Stroke } from "../models/strokes.model.js";
import {ApiResponse} from "../utils/ApiResponse.js"
import mongoose from "mongoose";
// 3 or 20
export const saveStrokes = asyncHandler(async (req,res) => {
    const {roomId,strokesId,points,color,tool,width} = req.body;
    if(!roomId || !strokesId || !points || !color || !tool || !width){
        throw new ApiError(400,"All fields are required");
    }
    if (!Array.isArray(points) || !points.every(p => typeof p === 'number')) {
    throw new ApiError(400, "Points must be an array of numbers");
    }

    await Stroke.create({roomId:new mongoose.Types.ObjectId(roomId),
        strokeId:strokesId,points:points,tool:tool,color:color,strokeWidth:width});
    
    return res.status(200).json(new ApiResponse(200,{},"strokes saved"));
})

export const deleteStrokes = asyncHandler(async (req,res) => {
    const {roomId} = req.params;
    if (!roomId) {
        throw new ApiError(400, "roomId is required");
    }

    await Stroke.deleteMany({ roomId });
    return res.status(200).json(new ApiResponse(200,{},"strokes deleted"));
})

export const fetchStrokes = asyncHandler(async (req, res) => {
    const { roomId } = req.params;

    if (!roomId) {
        throw new ApiError(400, "roomId is required");
    }

    const strokes = await Stroke.find({ roomId }).sort({ createdAt: 1 });

    return res.status(200).json(new ApiResponse(200, strokes));
});
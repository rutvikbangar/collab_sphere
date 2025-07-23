import mongoose, { Schema } from "mongoose";

const strokeSchema = new Schema({
  roomId: {
    type: Schema.Types.ObjectId,
    ref: "Room",
    required: true,
    index: true
  },
  strokeId: {
    type: String,  // use uuid on frontend
    required: true,
    unique: true
  },
  points: [Number], // [x1, y1, x2, y2, ...]
  color: String,
  strokeWidth: Number,
  tool: {
    type: String,
    enum: ['pen', 'eraser'],
    default: 'pen'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export const Stroke = mongoose.model('Stroke', strokeSchema);

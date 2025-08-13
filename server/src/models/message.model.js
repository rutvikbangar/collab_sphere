import mongoose, { Schema } from "mongoose";

const messageSchema = new Schema({
  roomId: {
    type: Schema.Types.ObjectId,
    ref: "Room",
    required: true,
    index: true
  },
  sender: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  message: {
    type: String,
    required: true
  }
}, { timestamps: true });

export const Message = mongoose.model('Message', messageSchema);
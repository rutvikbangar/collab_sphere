import mongoose,{Schema} from "mongoose";

const roomSchema = new Schema({
    roomName:{
        type:String,
        required:true
    },
    createdBy:{
        type:Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    members: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }
    ],
},{timestamps:true});

export const Room = mongoose.model('Room',roomSchema);
import mongoose,{Schema} from "mongoose";
import jwt from "jsonwebtoken"

const userSchema = new Schema(
    {
        name : {
            type: String,
            required: true,
            trim:true,
        },
        email:{
            type: String,
            required:true,
            unique:true,
            trim:true,
            index:true
        },
        avatar:{
            type:String
        },
        joinedRooms:[
            {
                type:Schema.Types.ObjectId,
                ref:'Room'
            }
        ]
    },{timestamps:true}
);

userSchema.methods.generateAccessToken = function(){
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            name: this.username,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

export const User = mongoose.model("User",userSchema);

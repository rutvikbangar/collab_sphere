import mongoose,{Schema} from "mongoose";

const otpTokenSchema = new Schema(
    {
        email:{
            type:String,
            required:true,
        },
        otp:{
            type:String,
            required:true
        },
        expiresAt: { type: Date, required: true },
    }
);

export const OtpToken = mongoose.model('OtpToken', otpTokenSchema);
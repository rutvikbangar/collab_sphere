import nodemailer from "nodemailer"
import { OtpToken } from "../models/otpToken.model.js"
import {User} from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

export const sentOtp = asyncHandler(async (req, res) => {
    const { email } = req.body;

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await OtpToken.create({ email: email, otp: otp, expiresAt: expiresAt });

    // create transporter
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL,
            pass: process.env.APP_PASSWORD
        }
    });

    const mailOptions = {
        from: process.env.EMAIL,
        to: email,
        subject: 'Your Login OTP',
        text: `Your OTP is ${otp}. It expires in 5 minutes.`,
    };
    await transporter.sendMail(mailOptions);

    res.json({ message: 'OTP sent successfully' });

})

export const verifyOtp = asyncHandler(async (req, res) => {
    const { email, otp, registerFlag } = req.body;

    const user = await User.findOne({ email });

    //  Block if already registered but trying to re-register
    if (user && registerFlag) {
        throw new ApiError(409, "User already registered. Please log in.");
    }

    //  Block if not registered and not trying to register (login attempt)
    if (!user && !registerFlag) {
        throw new ApiError(404, "User is not registered");
    }

    const entry = await OtpToken.findOne({ email, otp });
    if (!entry) {
        throw new ApiError(400, "Invalid OTP");
    }

    if (entry.expiresAt < new Date()) {
        await OtpToken.deleteOne({ email, otp });
        throw new ApiError(400, "OTP expired");
    }

    await OtpToken.deleteOne({ email, otp });

    //  Registration flow
    if (registerFlag) {
        return res.status(200).json(
            new ApiResponse(200, { isEmail: true }, "OTP verified successfully")
        );
    }

    //  Login flow
    const accessToken = user.generateAccessToken();
    return res.status(200).json(
        new ApiResponse(200, { user, accessToken }, "OTP verified successfully")
    );
});

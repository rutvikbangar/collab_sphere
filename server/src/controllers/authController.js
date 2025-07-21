import nodemailer from "nodemailer"
import { OtpToken } from "../models/otpToken.model.js"
import crypto from "crypto"
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
    const { email, otp } = req.body;

    const entry = await OtpToken.findOne({ email: email, otp: otp });
    if (!entry) {
        throw new ApiError(400, "Invalid otp");
    }
    if (entry.expiresAt < new Date()) {
        await OtpToken.deleteOne({ email: email, otp: otp });
        throw new ApiError(400, "Otp expired");
    }

    await OtpToken.deleteOne({ email: email, otp: otp });
    // sign in feature is remaining
    return res.status(200).json(new ApiResponse(200, {}, "otp verified successfully"));
});
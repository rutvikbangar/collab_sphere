import nodemailer from "nodemailer"
import { OtpToken } from "../models/otpToken.model.js"
import crypto from "crypto"

export const sentOtp = async (req, res) => {
    const { email } = req.body;

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    try {
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
    } catch (error) {
        console.log("Failed to send otp ", error);
    }

}
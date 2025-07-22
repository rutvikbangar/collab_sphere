import {User} from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"


export const registerUser = asyncHandler(async (req, res) => {
    const { name, email } = req.body;
    // authenticate email first 
    // flow is
    // send-otp ---> verify-otp ---> call registeruser
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw new ApiError(409, "User already registered");
    }

    const newUser = await User.create({ name, email });

    const { _id, name: username, email: userEmail } = newUser;
    return res.status(201).json(
        new ApiResponse(201, {
            user: { _id, username, email: userEmail }
        }, "User registered successfully")
    );
});

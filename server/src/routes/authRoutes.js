import { Router } from "express";
import { sentOtp,verifyOtp } from "../controllers/authController.js";

const router = Router();

router.route("/send-otp").post(sentOtp);
router.route("/verify-otp").post(verifyOtp);

export default router;
import { Router } from "express";
import { sentOtp } from "../controllers/authController.js";

const router = Router();

router.route("/send-otp").post(sentOtp);

export default router;
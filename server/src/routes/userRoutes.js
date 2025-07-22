import { registerUser } from "../controllers/userController.js";
import { Router } from "express";

const router = Router();

router.route("/register").post(registerUser);

export default router
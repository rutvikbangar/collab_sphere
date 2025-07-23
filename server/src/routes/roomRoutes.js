import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { createRoom, fetchAllRooms, fetchMyRooms } from "../controllers/roomController.js";

const router = Router();

router.use(verifyJWT);

router.route("/create-room").post(createRoom);
router.route("/my-rooms").get(fetchMyRooms);
router.route("/").get(fetchAllRooms);

export default router;
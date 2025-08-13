import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { createRoom, fetchAllRooms, fetchMyRooms,addMemberToRoom } from "../controllers/roomController.js";

const router = Router();

router.use(verifyJWT);

router.route("/create-room").post(createRoom);
router.route("/my-rooms").get(fetchMyRooms);
router.route("/").get(fetchAllRooms);
router.route("/:roomId/members").post(addMemberToRoom);

export default router;
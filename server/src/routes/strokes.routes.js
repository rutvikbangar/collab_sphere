// stroke.routes.js or strokes.routes.js
import { Router } from "express";
import { saveStrokes,deleteStrokes,fetchStrokes } from "../controllers/strokes.controller.js";
 

const router = Router();


router.post("/save", saveStrokes);
router.delete("/delete/:roomId", deleteStrokes);
router.get("/:roomId", fetchStrokes);

export default router;

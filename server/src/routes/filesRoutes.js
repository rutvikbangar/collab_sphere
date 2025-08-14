import { Router } from "express";
import multer from "multer";
import { uploadFile, deleteFile, getRoomFiles } from "../controllers/filesController.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error("Only PDF files are allowed"), false);
  }
};

const upload = multer({ dest: "uploads/", fileFilter });

router.use(verifyJWT);

router.route("/upload").post(upload.single("file"), uploadFile);
router.route("/:fileId").delete(deleteFile);
router.route("/room/:roomId").get(getRoomFiles);


export default router;
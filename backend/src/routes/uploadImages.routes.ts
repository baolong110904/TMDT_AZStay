import { Router } from "express";
import multer from "multer";
import path from "path";
import { uploadAvatarController } from "../controllers/uploadImages.controllers";

const router = Router();

// Cấu hình multer để lưu file tạm
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../../uploads/tmp")); // thư mục tạm
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// Route upload avatar
router.post("/avatar", upload.single("avatar"), uploadAvatarController);

<<<<<<< Updated upstream
<<<<<<< Updated upstream
export default router;
=======
// export default router;
>>>>>>> Stashed changes
=======
// export default router;
>>>>>>> Stashed changes

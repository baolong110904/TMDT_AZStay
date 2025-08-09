import { Router } from 'express';
import { upload } from '../middlewares/upload.middlewares';
import { uploadAvatarController } from '../services/uploadImages.service';

const router = Router();

router.post('/upload-avatar', upload.single('avatar'), uploadAvatarController);

export default router;
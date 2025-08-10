import express from 'express';

// controllers
import * as AuthenticationControllers from '../controllers/authentication.controllers';
import * as ImagesControllers from '../controllers/uploadImages.controllers';

// middlewares
import { authenticateJWT, authorizeRoles } from '../middlewares/auth.middlewares';
import { upload } from '../middlewares/upload.middlewares';

const router = express.Router();

export const Roles = {
  ADMIN: '1',
  CUSTOMER: '2',
  PROPERTY_OWNER: '3',
};

// 1. sign up
router.post('/signup', AuthenticationControllers.signUp);
// 2. login
router.post('/login', AuthenticationControllers.login);
// 3. send otp to users
router.post('/sendotp', AuthenticationControllers.sendOtpToUser); 
// 4. verify otp and generate tokens
router.post('/verifyotp', AuthenticationControllers.verifyOtpAndGenerateToken); 
// 5. change password
router.post('/changepw', authenticateJWT('password_reset'), /*authorizeRoles(Roles.ADMIN, Roles.CUSTOMER, Roles.PROPERTY_OWNER),*/ AuthenticationControllers.changePassword); 
// 6. upload/update avatar
router.post('/upload-avatar', upload.single('avatar'), ImagesControllers.uploadAvatarController); // user avatar upload

export default router;

/*

*/
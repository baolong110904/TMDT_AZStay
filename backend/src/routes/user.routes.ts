import express from 'express';

// controllers
import * as AuthenticationControllers from '../controllers/authentication.controllers';
import * as ImagesControllers from '../controllers/uploadImages.controllers';
import * as PropertyControllers from '../controllers/property.controllers';
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
router.post('/send-otp', AuthenticationControllers.sendOtpToUser); 
// 4. verify otp and generate tokens
router.post('/verify-otp', AuthenticationControllers.verifyOtpAndGenerateToken); 
// 5. change password
router.post('/change-password', authenticateJWT('password_reset'), /*authorizeRoles(Roles.ADMIN, Roles.CUSTOMER, Roles.PROPERTY_OWNER),*/ AuthenticationControllers.changePassword); 
// 6. upload/update avatar
router.post('/upload-avatar', upload.single('avatar'), ImagesControllers.uploadAvatarController); // user avatar upload
// 7. create and upload images of property that they want to host
router.post('/create-property', upload.array('images'), PropertyControllers.createProperty);

export default router;
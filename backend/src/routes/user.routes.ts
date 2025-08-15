import express from 'express';

// controllers
import * as AuthenticationControllers from '../controllers/authentication.controllers';
import * as ImagesControllers from '../controllers/uploadImages.controllers';
import * as PropertyControllers from '../controllers/property.controllers';
// middlewares
import { authenticateJWT, authorizeRoles, Roles } from '../middlewares/auth.middlewares';
import { upload } from '../middlewares/upload.middlewares';


const router = express.Router();


// 1. sign up
router.post('/signup', AuthenticationControllers.signUp);
// 2. login
router.post('/login', AuthenticationControllers.login);
// 3. send otp to users
router.post('/send-otp', AuthenticationControllers.sendOtpToUser); 
// 4. verify otp and generate tokens
router.post('/verify-otp', AuthenticationControllers.verifyOtpAndGenerateToken); 
// 5. change password
router.post('/change-password', authenticateJWT('password_reset'), authorizeRoles(Roles.ADMIN, Roles.CUSTOMER, Roles.PROPERTY_OWNER, Roles.PROPERTY_OWNER_AND_CUSTOMER), AuthenticationControllers.changePassword); 
// 6. upload/update avatar
router.post('/upload-avatar', 
            authenticateJWT('access'), 
            authorizeRoles(Roles.ADMIN, Roles.PROPERTY_OWNER, Roles.CUSTOMER, Roles.PROPERTY_OWNER_AND_CUSTOMER), 
            upload.single('avatar'), 
            ImagesControllers.uploadAvatarController); // user avatar upload
// 7. create and upload images of property that they want to host
router.post('/create-property', 
            authenticateJWT('access'),
            authorizeRoles(Roles.PROPERTY_OWNER, Roles.CUSTOMER, Roles.PROPERTY_OWNER_AND_CUSTOMER), 
            upload.array('images'),
            PropertyControllers.createProperty);

export default router;
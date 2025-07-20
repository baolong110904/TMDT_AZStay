import express from 'express';
import { 
  signUp,
  login,
  sendOtpToUser,
  verifyOtpAndGenerateToken,
  changePassword
} from '../controllers/user.controllers';

import { authenticateJWT, authorizeRoles } from '../middlewares/auth.middlewares';

const router = express.Router();

export const Roles = {
  ADMIN: '1',
  CUSTOMER: '2',
  PROPERTY_OWNER: '3',
};

// 1. sign up
router.post('/signup', signUp);
// 2. login
router.post('/login', login);
// 3. send otp to users
router.post('/sendotp', sendOtpToUser); 
// 4. verify otp and generate tokens
router.post('/verifyotp', verifyOtpAndGenerateToken); 
// 5. change password
router.post('/changepw', authenticateJWT('password_reset'), /*authorizeRoles(Roles.ADMIN, Roles.CUSTOMER, Roles.PROPERTY_OWNER),*/ changePassword); 

export default router;

/*

*/
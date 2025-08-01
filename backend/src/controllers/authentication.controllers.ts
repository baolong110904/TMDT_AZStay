import { Request, Response } from 'express';
import jwt, {SignOptions} from 'jsonwebtoken';
import Bcrypt from "bcrypt";

// written function
import { ENV } from '../config/environtment.config';
import { 
  checkEmailExists,
  createUser,
  createOAuthProvider,
  createOTP,
  verifyOTP,
  deleteOTP,
  updateNewPassword,
  getUserById,

} from '../dao/user.dao'; // orm
import * as constraints from '../utils/constraint.utils'; // checking info constraints
import { sendEmail } from '../utils/sendEmail.utils'; // sending email fucntion
import { supabase } from '../utils/supabase.utils'; // oauth provider

// jwt secret key
const JWT_SECRET = ENV.JWT_SECRET;

// signing up
export const signUp = async (req: Request, res: Response) => {
  const {
    email,
    password,
    gender,
    phone,
    role,
    dob,
    name,
  } = req.body;
  try {
    const existingEmail = await checkEmailExists(email);
    const parsedDob = new Date(dob);

    if (existingEmail) {
      return res.status(409).json({ error: 'Email is already in use' });
    }

    // Validate các trường đầu vào
    if (!constraints.isValidEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    if (!constraints.isValidDob(parsedDob)) {
      return res.status(400).json({ error: 'Invalid date of birth' });
    }

    if (!constraints.isValidGender(gender)) {
      return res.status(400).json({ error: 'Gender must be "Male" or "Female"' });
    }

    if (!constraints.isValidVietnamPhoneNumber(phone)) {
      return res.status(400).json({ error: 'Invalid Vietnamese phone number' });
    }

    if (!name || typeof name !== 'string' || name.length < 2) {
      return res.status(400).json({ error: 'Invalid name' });
    }

    if (![2, 3].includes(Number(role))) {
      return res.status(400).json({ error: 'Invalid role ID (must be 2 or 3)' });
    }

    const hashedPassword = await Bcrypt.hash(password, 10);

    const user = await createUser(
      email, 
      hashedPassword, 
      name,
      gender,
      phone,
      parsedDob,
      role
    );

    await sendEmail(
      email,
      'Welcome to AZStay!',
      `<h3>Hi ${name},</h3>
      <p>Your account has been created successfully.</p>
      <p>Enjoying our bidding services ❤️</p>
      `
    );

    // Generate JWT token
    const payload = {
      userId: user.user_id, 
      role: user.role_id,   
    };
    const signOptions: SignOptions = {
      expiresIn: '1h',
    };
    const token = jwt.sign(payload, JWT_SECRET, signOptions);

    return res.status(201).json({
      message: 'Signup successful. Email sent.',
      userId: user.user_id, 
      token,
      user: {
        id: user.user_id,   
        name: user.name,
        email: user.email,
        gender: user.gender,
        phone: user.phone,
        role: user.role_id, 
        dob: user.dob,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Signup failed' });
  }
};

// login (token last for 1 hour)
export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const user = await checkEmailExists(email);
    if (!user || !user.hashed_password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const match = await Bcrypt.compare(password, user.hashed_password);
    if (!match) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const payload = {
      sub: user.user_id,
      email: user.email,
      role: user.role_id,
      name: user.name,
      type: 'access',
    };


    const signOptions: SignOptions = {
      expiresIn: '1h',
    };

    const token = jwt.sign(payload, JWT_SECRET, signOptions);

    res.json({
      token,
      user: {
        user_id: user.user_id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        gender: user.gender,
        dob: user.dob,
        role_id: user.role_id,
        oauth_provider: user.oauth_provider,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login failed' });
  }
};

// send otp code to user email
export const sendOtpToUser = async (req: Request, res: Response) => {
  const { email } = req.body;

  try {
    const user = await checkEmailExists(email);
    if (!user) {
      return res.status(404).json({ message: 'Email not found' });
    }
    const otp = await createOTP(user.user_id);

    await sendEmail(
      email,
      'Reset Password OTP',
      `<p>Your OTP is <strong>${otp}</strong>. It will expire in 15 minutes.</p>`
    );

    return res.json({ message: 'OTP sent to email' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Send otp to user failed' });
  }

};

// verify otp and gen token (valid for 15 mins) 
export const verifyOtpAndGenerateToken = async (req: Request, res: Response) => {
  const { email, otp } = req.body;
  try {      
    const user = await getUserById(email);

    if (!user) {
      return res.status(404).json({ message: 'Email not found' });
    }

    const otpRecord = await verifyOTP(user.user_id, otp);

    if (!otpRecord) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    await deleteOTP(otpRecord.otp_id);

    const payload = {
      user_id: user.user_id,
      type: 'password_reset' // token type: password reset
    }

    const signOptions: SignOptions = {
      expiresIn: '15m'
    }
    const token = jwt.sign( payload, JWT_SECRET, signOptions);
    
    return res.json({ token, message: 'OTP verified, token generated' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Verify otp and generate token' });
  }
};

export const changePassword = async (req: Request, res: Response) => {
  const userId = (req as any).user.user_id;
  const { newPassword } = req.body;
  
  try {
    const user = await getUserById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const hashed = await Bcrypt.hash(newPassword, 10);
    await updateNewPassword(userId, hashed);
    
    return res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    return res.status(500).json({ message: 'Error while trying to change user password'});
  }
};

// signup using facebook integration
export async function testFacebookLogin() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'facebook',
    options: {
      redirectTo: window.location.origin, // Đảm bảo trùng với Redirect URI trong Meta Developer
    },
  })

  if (error) {
    console.error('Login failed:', error.message)
  } else {
    console.log('Redirecting to Facebook login...')
  }
}
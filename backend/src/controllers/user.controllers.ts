import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import Bcrypt from "bcrypt";

// written function
import { ENV } from '../config/environtment.config';
import { 
  checkEmailExists,
  createUser,
  createOAuthProvider
} from '../dao/user.dao';
import * as constraints from '../utils/constraint.utils';
import { sendEmail } from '../utils/sendEmail.utils';

const JWT_SECRET = ENV.JWT_SECRET;

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
      `<h3>Hi ${email},</h3><p>Your account has been created successfully.</p>`
    );

    return res.status(201).json({ message: 'Signup successful. Email sent.' });  
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Signup failed' });
  }
};

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

    const token = jwt.sign({ userId: user.user_id }, JWT_SECRET, { expiresIn: '1d' });

    res.json({ token, userId: user.user_id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login failed' });
  }
};
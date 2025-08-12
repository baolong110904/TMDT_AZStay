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
  
} from '../dao/user.dao';
import fs from 'fs';
import * as constraints from '../utils/constraint.utils';
import { sendEmail } from '../utils/sendEmail.utils';

const JWT_SECRET = ENV.JWT_SECRET;


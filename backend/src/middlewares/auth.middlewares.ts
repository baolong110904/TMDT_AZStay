import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { ENV } from '../config/environtment.config';
interface AuthRequest extends Request {
  user?: any;
}

export const authenticateJWT = (expectedType: string) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Access token missing' });
    }

    const token = authHeader.split(' ')[1];

    try {
      const decoded = jwt.verify(token, ENV.JWT_SECRET) as JwtPayload;
      if (decoded.type !== expectedType) {
        return res.status(403).json({ error: `Expected token type '${expectedType}'` });
      }

      req.user = decoded;
      next();
    } catch (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
  };
};

export const authorizeRoles = (...allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    const user = req.user;
    if (!user || !allowedRoles.includes(user.role)) {
      return res.status(403).json({ error: 'Forbidden: insufficient role' });
    }
    next();
  };
};

export const verifyToken = authenticateJWT('access');

export type { AuthRequest };
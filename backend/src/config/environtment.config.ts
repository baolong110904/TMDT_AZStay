import dotenv from 'dotenv';

dotenv.config();

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Environment variable "${name}" is not set.`);
  }
  return value;
}

export const ENV = {
  // NODE_ENV: process.env.NODE_ENV || 'development',
  DATABASE_URL: requireEnv('DATABASE_URL'),
  DB_SSL: process.env.DB_SSL === 'true',
  PORT: parseInt(process.env.PORT || '5000', 10),
  JWT_SECRET: requireEnv('JWT_SECRET') as string,
  JWT_EXPIRED_TIME: requireEnv('JWT_EXPIRED_TIME'),
  
  // SMTP configs
  SMTP_HOST: 'smtp.gmail.com',
  SMTP_PORT: 465, // cổng đúng cho SMTP Gmail SSL
  SMTP_USER: requireEnv('SMTP_USER'),
  SMTP_PASS: requireEnv('SMTP_PASS'),

  // supabse
  SUPABASE_KEY: requireEnv('SUPABASE_KEY'),
  SUPABASE_URL: requireEnv('SUPABASE_URL'),

  // cloudinary
  CLOUDINARY_API_SECRET: requireEnv('CLOUDINARY_API_SECRET'),
  CLOUDINARY_API_KEY: requireEnv('CLOUDINARY_API_KEY'),
};

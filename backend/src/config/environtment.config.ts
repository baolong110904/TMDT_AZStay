import dotenv from 'dotenv';

dotenv.config();

function requireEnv(name: string): string{ // checking if value in env file is set or not
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
  JWT_SECRET: requireEnv('JWT_SECRET'),
  PORT: parseInt(process.env.PORT || '5000', 10),
};
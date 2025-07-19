import { Pool } from 'pg';
import { ENV } from './environtment.config';

const pool = new Pool({
  connectionString: ENV.DATABASE_URL,
  ssl: ENV.DB_SSL ? { rejectUnauthorized: false } : undefined,
});

pool.on('connect', () => {
  console.log('Connected to PostgreSQL');
});

export default pool;

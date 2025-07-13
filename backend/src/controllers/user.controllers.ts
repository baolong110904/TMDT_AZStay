import { Request, Response } from "express";
import pool from '../config/db.config'

export const getAllUsers = async (_req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM user');
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong' });
  }
};
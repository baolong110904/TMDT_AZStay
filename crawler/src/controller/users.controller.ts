import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany();
    res.json(users);
  } catch (error) {
    console.error('GET /users error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const createUser = async (req: Request, res: Response) => {
  try {
    const { email, name, password } = req.body;
    const user = await prisma.user.create({
      data: { email, name, password },
    });
    res.status(201).json(user);
  } catch (error) {
    console.error('POST /users error:', error);
    res.status(400).json({ error: 'Failed to create user' });
  }
};

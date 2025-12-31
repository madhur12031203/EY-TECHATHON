import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import { pool } from '../db/client';
import { logger } from '../config/logger';

const router = Router();

// Minimal auth: no password hashing/checking (schema has no password column).
// We create/find a user by email and return a session token.

router.post('/auth/register', async (req: Request, res: Response) => {
  const { name, email, phone, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters' });
  }

  try {
    // Check if user exists
    const existing = await pool.query('SELECT id, email, name, phone FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(200).json({
        message: 'User already exists',
        user: existing.rows[0],
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const result = await pool.query(
      'INSERT INTO users (email, name, phone, password_hash) VALUES ($1, $2, $3, $4) RETURNING id, email, name, phone',
      [email, name || null, phone || null, passwordHash]
    );

    return res.status(201).json({
      message: 'Registration successful',
      user: result.rows[0],
    });
  } catch (error) {
    logger.error('Register error', error);
    return res.status(500).json({ message: 'Registration failed' });
  }
});

router.post('/auth/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    const result = await pool.query('SELECT id, email, name, phone, password_hash FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found. Please register.' });
    }

    const user = result.rows[0];
    const matches = user.password_hash ? await bcrypt.compare(password, user.password_hash) : false;

    if (!matches) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = uuidv4(); // simple session token
    return res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
      },
    });
  } catch (error) {
    logger.error('Login error', error);
    return res.status(500).json({ message: 'Login failed' });
  }
});

export default router;


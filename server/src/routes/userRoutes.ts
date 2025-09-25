import express, { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// --- USER DATA ---
interface User {
  _id: string;
  name: string;
  email: string;
  password: string;
}
export const users: User[] = [];

// --- NOTIFICATION DATA ---
interface Notification {
  _id: string;
  userId: string;
  message: string;
  read: boolean;
  createdAt: Date;
}
export let notifications: Notification[] = [];

// --- HELPER FUNCTIONS ---
const generateToken = (id: string) => {
  return jwt.sign({ id }, 'your_jwt_secret', { expiresIn: '30d' });
};

// --- ROUTES ---

// @desc    Register a new user
router.post('/', asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password } = req.body;
  const userExists = users.find((user) => user.email === email);
  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  const user: User = {
    _id: (users.length + 1).toString(),
    name,
    email,
    password: hashedPassword,
  };
  users.push(user);
  res.status(201).json({ _id: user._id, name: user.name, email: user.email, token: generateToken(user._id) });
}));

// @desc    Auth user & get token
router.post('/login', asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = users.find((user) => user.email === email);
  if (user && (await bcrypt.compare(password, user.password))) {
    res.json({ _id: user._id, name: user.name, email: user.email, token: generateToken(user._id) });
  } else {
    res.status(401).json({ message: 'Invalid email or password' });
  }
}));

// @desc    Get user profile
router.get('/profile', protect, asyncHandler(async (req: Request, res: Response) => {
  const user = users.find(u => u._id === req.user.id);
  if (user) {
    res.json({ _id: user._id, name: user.name, email: user.email });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
}));

// @desc    Get user notifications
// @route   GET /api/users/notifications
// @access  Private
router.get('/notifications', protect, asyncHandler(async (req: Request, res: Response) => {
    const userNotifications = notifications
        .filter(n => n.userId === req.user.id)
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    res.json(userNotifications);
}));

// @desc    Mark notifications as read
// @route   POST /api/users/notifications/read
// @access  Private
router.post('/notifications/read', protect, asyncHandler(async (req: Request, res: Response) => {
    notifications.forEach(n => {
        if (n.userId === req.user.id) {
            n.read = true;
        }
    });
    res.status(200).json({ message: 'Notifications marked as read' });
}));

export default router;
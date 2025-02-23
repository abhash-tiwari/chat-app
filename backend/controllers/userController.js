import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { UserService } from '../services/userService.js';

export class UserController {
  constructor() {
    this.userService = new UserService();
  }

  signup = async (req, res) => {
    try {
      const { name, email, phoneNumber, password } = req.body;

      if (!name || !email || !phoneNumber || !password) {
        return res.status(400).json({ error: 'All fields are required' });
      }

      const existingUser = await this.userService.findByEmailOrPhone(email, phoneNumber);
      if (existingUser) {
        return res.status(400).json({ error: 'User already exists' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await this.userService.createUser({
        name,
        email,
        phoneNumber,
        password: hashedPassword,
      });

      const token = jwt.sign(
        { id: user._id, email: user.email },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );

      res.status(201).json({ user, token });
    } catch (error) {
      res.status(500).json({ error: 'Error creating user' });
    }
  };

  login = async (req, res) => {
    try {
      const { email, password } = req.body;

      const user = await this.userService.findByEmail(email);
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const token = jwt.sign(
        { id: user._id, email: user.email },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );

      res.json({ user, token });
    } catch (error) {
      res.status(500).json({ error: 'Error logging in' });
    }
  };

  searchUsers = async (req, res) => {
    try {
      const { query } = req.query;
      const users = await this.userService.searchUsers(query);
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: 'Error searching users' });
    }
  };

  updateOnlineStatus = async (req, res) => {
    try {
      const { userId } = req.params;
      const { isOnline } = req.body;

      await this.userService.updateOnlineStatus(userId, isOnline);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Error updating online status' });
    }
  };
}

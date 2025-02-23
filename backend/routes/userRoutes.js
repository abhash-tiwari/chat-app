import express from 'express';
import { UserController } from '../controllers/userController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();
const userController = new UserController();

router.post('/signup', userController.signup);
router.post('/login', userController.login);
router.get('/search', auth, userController.searchUsers);
router.put('/:userId/status', auth, userController.updateOnlineStatus);

export default router;

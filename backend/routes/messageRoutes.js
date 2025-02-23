import express from 'express';
import { MessageController } from '../controllers/messageController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();
const messageController = new MessageController();

router.post('/', auth, messageController.sendMessage);
router.get('/:userId/:otherUserId', auth, messageController.getMessages);
router.put('/:messageId/deliver', auth, messageController.markAsDelivered);

export default router;

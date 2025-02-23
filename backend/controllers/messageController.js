import { MessageService } from '../services/messageService.js';

export class MessageController {
  constructor() {
    this.messageService = new MessageService();
  }

  sendMessage = async (req, res) => {
    try {
      const { senderId, receiverId, content } = req.body;
      const message = await this.messageService.createMessage({
        sender: senderId,
        receiver: receiverId,
        content,
      });
      res.status(201).json(message);
    } catch (error) {
      res.status(500).json({ error: 'Error sending message' });
    }
  };

  getMessages = async (req, res) => {
    try {
      const { userId, otherUserId } = req.params;
      const messages = await this.messageService.getMessages(userId, otherUserId);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: 'Error getting messages' });
    }
  };

  markAsDelivered = async (req, res) => {
    try {
      const { messageId } = req.params;
      await this.messageService.markAsDelivered(messageId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Error marking message as delivered' });
    }
  };
}

import { Message } from '../models/Message.js';

export class MessageService {
  async createMessage(messageData) {
    return await Message.create(messageData);
  }

  async getMessages(userId, otherUserId) {
    return await Message.find({
      $or: [
        { sender: userId, receiver: otherUserId },
        { sender: otherUserId, receiver: userId }
      ]
    }).sort({ timestamp: 1 });
  }

  async markAsDelivered(messageId) {
    return await Message.findByIdAndUpdate(messageId, {
      delivered: true
    });
  }

  async getUndeliveredMessages(userId) {
    return await Message.find({
      receiver: userId,
      delivered: false
    });
  }
}

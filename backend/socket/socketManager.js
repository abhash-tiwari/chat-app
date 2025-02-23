import { Server } from 'socket.io';
import { UserService } from '../services/userService.js';
import { MessageService } from '../services/messageService.js';

export class SocketManager {
  constructor(io) {
    this.io = io;
    this.userService = new UserService();
    this.messageService = new MessageService();
  }

  handleConnection(socket) {
    console.log('Client connected:', socket.id);

    socket.on('register', async (data) => {
      socket.data = { userId: data.userId };
      await this.userService.updateOnlineStatus(data.userId, true);
      this.io.emit('userOnline', { userId: data.userId });

      // Send offline messages
      const undeliveredMessages = await this.messageService.getUndeliveredMessages(data.userId);
      undeliveredMessages.forEach((message) => {
        socket.emit('message', {
          from: message.sender,
          content: message.content,
          timestamp: message.timestamp
        });
      });
    });

    socket.on('message', async (data) => {
      const message = await this.messageService.createMessage({
        sender: socket.data.userId,
        receiver: data.to,
        content: data.content
      });

      // Find receiver's socket
      const receiverSocket = Array.from(this.io.sockets.sockets.values()).find(
        (s) => s.data?.userId === data.to
      );

      if (receiverSocket) {
        receiverSocket.emit('message', {
          from: socket.data.userId,
          content: data.content,
          timestamp: message.timestamp
        });
        await this.messageService.markAsDelivered(message._id);
      }
    });

    socket.on('disconnect', async () => {
      if (socket.data?.userId) {
        await this.userService.updateOnlineStatus(socket.data.userId, false);
        this.io.emit('userOffline', { userId: socket.data.userId });
      }
    });
  }
}

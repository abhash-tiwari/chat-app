import { User } from '../models/User.js';

export class UserService {
  async createUser(userData) {
    return await User.create(userData);
  }

  async findByEmail(email) {
    return await User.findOne({ email });
  }

  async findByEmailOrPhone(email, phoneNumber) {
    return await User.findOne({
      $or: [{ email }, { phoneNumber }]
    });
  }

  async searchUsers(query) {
    return await User.find({
      $or: [
        { email: new RegExp(query, 'i') },
        { phoneNumber: new RegExp(query, 'i') },
        { name: new RegExp(query, 'i') }
      ]
    }).select('-password');
  }

  async updateOnlineStatus(userId, isOnline) {
    return await User.findByIdAndUpdate(userId, {
      isOnline,
      lastSeen: isOnline ? undefined : new Date()
    });
  }
}

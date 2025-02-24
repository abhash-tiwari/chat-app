const API_URL = "http://localhost:5000"

export const api = {
  async signup(data) {
    const response = await fetch(`${API_URL}/api/users/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Signup failed');
    return response.json();
  },

  async login(data) {
    const response = await fetch(`${API_URL}/api/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Login failed');
    return response.json();
  },

  async searchUsers(query, token) {
    const response = await fetch(`${API_URL}/api/users/search?query=${query}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Search failed');
    return response.json();
  },

  async getMessages(userId, otherId, token) {
    const response = await fetch(`${API_URL}/api/messages/${userId}/${otherId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to get messages');
    return response.json();
  }
};
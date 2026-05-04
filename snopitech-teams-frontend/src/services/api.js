const API_URL = 'http://localhost:8081/api';

export const api = {
  // Auth
  async login(email, password) {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return res.json();
  },

  // Teams
  async getTeams(userId) {
    const res = await fetch(`${API_URL}/teams/user/${userId}`);
    return res.json();
  },

  async createTeam(name, description, userId) {
    const res = await fetch(`${API_URL}/teams`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description, userId })
    });
    return res.json();
  },

  // Channels
  async getChannels(teamId) {
    const res = await fetch(`${API_URL}/channels/team/${teamId}`);
    return res.json();
  },

  async createChannel(name, description, teamId, userId, type = 'PUBLIC') {
    const res = await fetch(`${API_URL}/channels`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description, teamId, userId, type })
    });
    return res.json();
  },

  // Messages
  async getMessages(channelId) {
    const res = await fetch(`${API_URL}/messages/channel/${channelId}`);
    return res.json();
  },

  async sendMessage(channelId, userId, content) {
    const res = await fetch(`${API_URL}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ channelId, userId, content })
    });
    return res.json();
  }
};
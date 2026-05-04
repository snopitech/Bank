/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable no-empty */
/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useNavigate } from 'react-router-dom';

const API_URL = 'http://localhost:8081/api';

function Dashboard({ user, onLogout }) {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [channels, setChannels] = useState([]);
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [showCreateTeam, setShowCreateTeam] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamDesc, setNewTeamDesc] = useState('');
  const [showCreateChannel, setShowCreateChannel] = useState(false);
  const [newChannelName, setNewChannelName] = useState('');
  const [showDirectMessages, setShowDirectMessages] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [dmMessages, setDmMessages] = useState([]);
  const [newDmMessage, setNewDmMessage] = useState('');
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [stompClient, setStompClient] = useState(null);
  const [wsConnected, setWsConnected] = useState(false);
  const [typingUsers, setTypingUsers] = useState({});
  const [pendingFile, setPendingFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);

  // ========== ALL FUNCTIONS DECLARED FIRST ==========

  async function loadUsers() {
    try {
      const res = await fetch(`${API_URL}/direct/users`);
      const data = await res.json();
      const otherUsers = data.filter(u => u.id !== user.userId);
      setUsers(otherUsers);
      setFilteredUsers(otherUsers);
    } catch (err) {
      console.error(err);
    }
  }

  async function loadTeams() {
    try {
      const res = await fetch(`${API_URL}/teams/user/${user.userId}`);
      const data = await res.json();
      setTeams(data);
      if (data.length > 0) {
        setSelectedTeam(data[0]);
        loadChannels(data[0].id);
      }
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  }

  async function loadChannels(teamId) {
    try {
      const res = await fetch(`${API_URL}/channels/team/${teamId}`);
      const data = await res.json();
      setChannels(data);
      if (data.length > 0) {
        setSelectedChannel(data[0]);
        loadMessages(data[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function loadMessages(channelId) {
    try {
      const res = await fetch(`${API_URL}/messages/channel/${channelId}`);
      const data = await res.json();
      setMessages(data);
    } catch (err) {
      console.error(err);
    }
  }

  async function loadConversation(otherUserId) {
    try {
      const res = await fetch(`${API_URL}/direct/conversation/${user.userId}/${otherUserId}`);
      const data = await res.json();
      setDmMessages(data);
    } catch (err) {
      console.error(err);
    }
  }

  // ========== DELETE MESSAGE (works for both Channel and DM) ==========
  async function handleDeleteMessage(messageId, isDirect = false) {
    if (!window.confirm('Are you sure you want to delete this message?')) return;
    
    try {
      // Different endpoints for channel vs direct messages
      const url = isDirect 
        ? `${API_URL}/direct/messages/${messageId}?userId=${user.userId}`
        : `${API_URL}/messages/${messageId}?userId=${user.userId}`;
      
      const response = await fetch(url, {
        method: 'DELETE'
      });
      const data = await response.json();
      if (data.success) {
        if (isDirect && selectedUser) {
          loadConversation(selectedUser.id);
        } else if (selectedChannel) {
          loadMessages(selectedChannel.id);
        }
      } else {
        alert(data.error || 'Failed to delete message');
      }
    } catch (err) {
      console.error('Delete error:', err);
      alert('Failed to delete message');
    }
  }

  // ========== EDIT MESSAGE (works for both Channel and DM) ==========
  async function handleEditMessage(isDirect = false) {
    if (!editContent.trim() || !editingMessage) return;
    
    try {
      // Different endpoints for channel vs direct messages
      const url = isDirect
        ? `${API_URL}/direct/messages/${editingMessage.id}`
        : `${API_URL}/messages/${editingMessage.id}`;
      
      const response = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.userId,
          content: editContent
        })
      });
      const data = await response.json();
      if (data.success) {
        setShowEditModal(false);
        setEditingMessage(null);
        setEditContent('');
        if (isDirect && selectedUser) {
          loadConversation(selectedUser.id);
        } else if (selectedChannel) {
          loadMessages(selectedChannel.id);
        }
      } else {
        alert(data.error || 'Failed to edit message');
      }
    } catch (err) {
      console.error('Edit error:', err);
      alert('Failed to edit message');
    }
  }

  async function sendMessage() {
    if (pendingFile && selectedChannel) {
      const formData = new FormData();
      formData.append('file', pendingFile);
      formData.append('userId', user.userId);
      
      try {
        const response = await fetch(`${API_URL}/messages/${selectedChannel.id}/upload`, {
          method: 'POST',
          body: formData
        });
        const data = await response.json();
        if (data.success) {
          loadMessages(selectedChannel.id);
          setPendingFile(null);
          setFilePreview(null);
        }
      } catch (err) {
        console.error('Upload error:', err);
        alert('Failed to upload file');
      }
      return;
    }
    
    if (!newMessage.trim() || !selectedChannel) return;

    if (wsConnected && stompClient) {
      stompClient.publish({
        destination: '/app/chat.sendMessage',
        body: JSON.stringify({
          type: 'CHAT',
          channelId: selectedChannel.id,
          userId: user.userId,
          userFirstName: user.firstName,
          userLastName: user.lastName,
          content: newMessage
        })
      });
      setNewMessage('');
    } else {
      try {
        const response = await fetch(`${API_URL}/messages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            channelId: selectedChannel.id,
            userId: user.userId,
            content: newMessage
          })
        });
        const data = await response.json();
        if (data.success) {
          setNewMessage('');
          loadMessages(selectedChannel.id);
        }
      } catch (err) {
        console.error('Error sending message:', err);
      }
    }
  }

  async function sendDirectMessage() {
    if (!newDmMessage.trim() || !selectedUser) return;

    try {
      const response = await fetch(`${API_URL}/direct/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: user.userId,
          receiverId: selectedUser.id,
          content: newDmMessage
        })
      });
      const data = await response.json();
      if (data.success) {
        setNewDmMessage('');
        loadConversation(selectedUser.id);
      }
    } catch (err) {
      console.error('Error sending direct message:', err);
    }
  }

  async function createTeam() {
    if (!newTeamName.trim()) return;
    await fetch(`${API_URL}/teams`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newTeamName, description: newTeamDesc, userId: user.userId })
    });
    setNewTeamName('');
    setNewTeamDesc('');
    setShowCreateTeam(false);
    loadTeams();
  }

  async function createChannel() {
    if (!newChannelName.trim() || !selectedTeam) return;
    await fetch(`${API_URL}/channels`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newChannelName, description: '', teamId: selectedTeam.id, userId: user.userId, type: 'PUBLIC' })
    });
    setNewChannelName('');
    setShowCreateChannel(false);
    loadChannels(selectedTeam.id);
  }

  function searchUsers(term) {
    if (!term.trim()) {
      setFilteredUsers(users);
      return;
    }
    const lowerTerm = term.toLowerCase();
    const filtered = users.filter(u => 
      u.firstName.toLowerCase().includes(lowerTerm) ||
      u.lastName.toLowerCase().includes(lowerTerm) ||
      `${u.firstName} ${u.lastName}`.toLowerCase().includes(lowerTerm)
    );
    setFilteredUsers(filtered);
  }

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    setPendingFile(file);
    
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFilePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
    }
    
    event.target.value = null;
  };

  const startVideoCall = () => {
    if (showDirectMessages && selectedUser) {
      navigate('/video-call', {
        state: {
          callType: 'dm',
          recipientId: selectedUser.id,
          recipientName: `${selectedUser.firstName} ${selectedUser.lastName}`,
          recipientFirstName: selectedUser.firstName,
          recipientLastName: selectedUser.lastName,
          callerId: user.userId,
          callerName: `${user.firstName} ${user.lastName}`,
          callerFirstName: user.firstName,
          callerLastName: user.lastName
        }
      });
    } else if (selectedChannel && !showDirectMessages) {
      navigate('/video-call', {
        state: {
          callType: 'channel',
          channelId: selectedChannel.id,
          channelName: selectedChannel.name,
          callerId: user.userId,
          callerName: `${user.firstName} ${user.lastName}`
        }
      });
    } else {
      navigate('/video-call');
    }
  };

  const handleLogout = async () => {
    try {
      await fetch(`${API_URL}/users/${user.userId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'OFFLINE' })
      });
    } catch (err) {
      console.error('Failed to update status:', err);
    }
    localStorage.removeItem('teams_user');
    onLogout();
  };

  const sendTyping = () => {
    if (stompClient && wsConnected && selectedChannel) {
      stompClient.publish({
        destination: '/app/chat.typing',
        body: JSON.stringify({
          type: 'TYPING',
          channelId: selectedChannel.id,
          userId: user.userId,
          userFirstName: user.firstName,
          userLastName: user.lastName
        })
      });
    }
  };

  // ========== USE EFFECTS ==========

  useEffect(() => {
    loadTeams();
    loadUsers();
  }, []);

  useEffect(() => {
    if (!selectedChannel) return;

    const client = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8081/ws'),
      debug: (str) => {},
      reconnectDelay: 5000,
      onConnect: () => {
        setWsConnected(true);
        console.log('WebSocket connected');

        client.subscribe(`/topic/channel/${selectedChannel.id}`, (message) => {
          const msg = JSON.parse(message.body);
          if (msg.type === 'CHAT') {
            setMessages(prev => [...prev, {
              id: msg.messageId,
              userId: msg.userId,
              content: msg.content,
              createdAt: msg.timestamp,
              isEdited: msg.isEdited || false,
              messageType: 'TEXT',
              user: {
                firstName: msg.userFirstName,
                lastName: msg.userLastName
              }
            }]);
          }
        });

        client.subscribe(`/topic/channel/${selectedChannel.id}/typing`, (message) => {
          const data = JSON.parse(message.body);
          if (data.userId !== user.userId) {
            setTypingUsers(prev => ({
              ...prev,
              [data.userId]: { name: data.userFirstName, typing: true }
            }));
            setTimeout(() => {
              setTypingUsers(prev => ({
                ...prev,
                [data.userId]: { ...prev[data.userId], typing: false }
              }));
            }, 1500);
          }
        });

        setStompClient(client);
      },
      onStompError: (error) => {
        console.error('WebSocket error:', error);
      }
    });

    client.activate();

    return () => {
      if (client && client.active) {
        try {
          client.deactivate();
        } catch (e) {}
      }
    };
  }, [selectedChannel]);

  if (loading) {
    return <div style={styles.loading}>Loading...</div>;
  }

  return (
    <div style={styles.container}>
      {/* LEFT SIDEBAR - TEAMS */}
      <div style={styles.teamsSidebar}>
        <div style={styles.teamsHeader}>💬</div>
        <div style={styles.teamsList}>
          {teams.map(team => (
            <div
              key={team.id}
              onClick={() => {
                setSelectedTeam(team);
                setShowDirectMessages(false);
                setSelectedUser(null);
                loadChannels(team.id);
              }}
              style={{
                ...styles.teamIcon,
                background: selectedTeam?.id === team.id && !showDirectMessages ? '#2b2b2b' : '#3c3c3c'
              }}
            >
              {team.name?.charAt(0) || 'T'}
            </div>
          ))}
          <div onClick={() => setShowCreateTeam(true)} style={styles.addTeamIcon}>+</div>
        </div>
        <div style={styles.userSection}>
          <div style={styles.userAvatar}>{user.firstName?.charAt(0)}{user.lastName?.charAt(0)}</div>
          <button onClick={handleLogout} style={styles.logoutBtn}>🚪</button>
        </div>
      </div>

      {/* MIDDLE SIDEBAR - CHANNELS & DIRECT MESSAGES */}
      <div style={styles.channelsSidebar}>
        <div style={styles.teamInfo}>
          <h2 style={styles.teamName}>{selectedTeam?.name || 'Snopitech'}</h2>
        </div>

        <div style={styles.channelsSection}>
          <div style={styles.sectionHeader}>
            <span>📢 CHANNELS</span>
            <button onClick={() => setShowCreateChannel(true)} style={styles.addBtn}>+</button>
          </div>
          {channels.map(channel => (
            <div
              key={channel.id}
              onClick={() => {
                setSelectedChannel(channel);
                setShowDirectMessages(false);
                setSelectedUser(null);
                loadMessages(channel.id);
              }}
              style={{
                ...styles.channelItem,
                background: selectedChannel?.id === channel.id && !showDirectMessages ? '#e8e8e8' : 'transparent',
                fontWeight: selectedChannel?.id === channel.id && !showDirectMessages ? '600' : '400'
              }}
            >
              # {channel.name}
            </div>
          ))}
        </div>

        <div style={styles.directMessagesSection}>
          <div style={styles.sectionHeader}>
            <span>💬 DIRECT MESSAGES</span>
          </div>

          <input
            type="text"
            placeholder="🔍 Search users..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              searchUsers(e.target.value);
            }}
            style={styles.searchInput}
          />

          {filteredUsers.length === 0 ? (
            <div style={styles.noResults}>No users found</div>
          ) : (
            filteredUsers.map(otherUser => (
              <div
                key={otherUser.id}
                onClick={() => {
                  setSelectedUser(otherUser);
                  setShowDirectMessages(true);
                  setSelectedChannel(null);
                  loadConversation(otherUser.id);
                }}
                style={{
                  ...styles.directMessageItem,
                  background: selectedUser?.id === otherUser.id && showDirectMessages ? '#e8e8e8' : 'transparent',
                  fontWeight: selectedUser?.id === otherUser.id && showDirectMessages ? '600' : '400'
                }}
              >
                <span>💬</span> {otherUser.firstName} {otherUser.lastName}
              </div>
            ))
          )}
        </div>
      </div>

      {/* MAIN CHAT AREA - CHANNELS */}
      <div style={styles.chatArea}>
        {selectedChannel && !showDirectMessages ? (
          <>
            <div style={styles.chatHeader}>
              <div>
                <h1 style={styles.chatTitle}># {selectedChannel.name}</h1>
                <p style={styles.chatDesc}>{selectedChannel.description || 'Channel conversation'}</p>
              </div>
              <div style={styles.actionButtons}>
                <button onClick={startVideoCall} style={styles.iconBtn}>📹</button>
              </div>
            </div>

            <div style={styles.messagesArea}>
              {messages.length === 0 ? (
                <p style={styles.emptyMessages}>No messages yet. Say hello!</p>
              ) : (
                messages.map(msg => {
                  const firstName = msg.user?.firstName || 'User';
                  const lastName = msg.user?.lastName || '';
                  const fullName = lastName ? `${firstName} ${lastName}` : firstName;
                  const initial = firstName.charAt(0) || '?';
                  const fileName = msg.content?.replace('📎 ', '');
                  
                  return (
                    <div key={msg.id} style={styles.messageRow}>
                      <div style={styles.messageAvatar}>{initial}</div>
                      <div style={styles.messageContent}>
                        <div style={styles.messageHeader}>
                          <strong>{fullName}</strong>
                          <span style={styles.messageTime}>
                            {new Date(msg.createdAt).toLocaleTimeString()}
                            {msg.isEdited && <span style={styles.editedBadge}> (edited)</span>}
                          </span>
                          <div style={styles.messageActions}>
                            <button 
                              onClick={() => {
                                setEditingMessage(msg);
                                setEditContent(msg.content);
                                setShowEditModal(true);
                              }}
                              style={styles.editBtn}
                              title="Edit message"
                            >
                              ✏️
                            </button>
                            <button 
                              onClick={() => handleDeleteMessage(msg.id, false)}
                              style={styles.deleteBtn}
                              title="Delete message"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                        {msg.messageType === 'FILE' ? (
                          <a 
                            href={`http://localhost:8081/api/uploads/${fileName}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={styles.fileDownload}
                          >
                            📎 {fileName}
                          </a>
                        ) : (
                          <div style={styles.messageText}>{msg.content}</div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}

              {Object.values(typingUsers).some(t => t.typing) && (
                <div style={styles.typingIndicator}>
                  {Object.values(typingUsers).filter(t => t.typing).map(t => t.name).join(', ')} is typing...
                </div>
              )}
            </div>

            <div style={styles.inputArea}>
              {filePreview && (
                <div style={styles.filePreview}>
                  <img src={filePreview} alt="Preview" style={styles.previewImage} />
                  <button 
                    onClick={() => { setPendingFile(null); setFilePreview(null); }} 
                    style={styles.removePreviewBtn}
                  >
                    ✕
                  </button>
                </div>
              )}
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleFileUpload}
              />
              <button onClick={() => fileInputRef.current.click()} style={styles.attachBtn}>📎</button>
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={() => sendTyping()}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Type a message..."
                style={styles.messageInput}
              />
              <button onClick={sendMessage} style={styles.sendBtn}>Send</button>
            </div>
          </>
        ) : showDirectMessages && selectedUser ? (
          <>
            <div style={styles.chatHeader}>
              <div>
                <h1 style={styles.chatTitle}>💬 {selectedUser.firstName} {selectedUser.lastName}</h1>
                <p style={styles.chatDesc}>Direct message</p>
              </div>
              <div style={styles.actionButtons}>
                <button onClick={startVideoCall} style={styles.iconBtn}>📹</button>
              </div>
            </div>

            <div style={styles.messagesArea}>
              {dmMessages.length === 0 ? (
                <p style={styles.emptyMessages}>No messages yet. Say hello!</p>
              ) : (
                dmMessages.map(msg => {
                  const isSender = msg.senderId === user.userId;
                  const otherUser = isSender ? user : selectedUser;
                  const fullName = `${otherUser.firstName} ${otherUser.lastName}`;
                  const initial = otherUser.firstName?.charAt(0) || '?';

                  return (
                    <div key={msg.id} style={styles.messageRow}>
                      <div style={styles.messageAvatar}>{initial}</div>
                      <div style={styles.messageContent}>
                        <div style={styles.messageHeader}>
                          <strong>{fullName}</strong>
                          <span style={styles.messageTime}>
                            {new Date(msg.createdAt).toLocaleTimeString()}
                            {msg.isEdited && <span style={styles.editedBadge}> (edited)</span>}
                          </span>
                          {/* Only show edit/delete buttons for the sender */}
                          {isSender && (
                            <div style={styles.messageActions}>
                              <button 
                                onClick={() => {
                                  setEditingMessage(msg);
                                  setEditContent(msg.content);
                                  setShowEditModal(true);
                                }}
                                style={styles.editBtn}
                                title="Edit message"
                              >
                                ✏️
                              </button>
                              <button 
                                onClick={() => handleDeleteMessage(msg.id, true)}
                                style={styles.deleteBtn}
                                title="Delete message"
                              >
                                🗑️
                              </button>
                            </div>
                          )}
                        </div>
                        <div style={styles.messageText}>{msg.content}</div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div style={styles.inputArea}>
              <input
                type="text"
                value={newDmMessage}
                onChange={(e) => setNewDmMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendDirectMessage()}
                placeholder={`Message @${selectedUser.firstName}...`}
                style={styles.messageInput}
              />
              <button onClick={sendDirectMessage} style={styles.sendBtn}>Send</button>
            </div>
          </>
        ) : (
          <div style={styles.emptyChat}>Select a channel or start a direct message</div>
        )}
      </div>

      {/* Edit Message Modal */}
      {showEditModal && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <h3>Edit Message</h3>
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              style={styles.editTextarea}
              rows={3}
            />
            <div style={styles.modalButtons}>
              <button onClick={() => {
                const isDirect = showDirectMessages && selectedUser !== null;
                handleEditMessage(isDirect);
              }} style={styles.saveBtn}>Save</button>
              <button onClick={() => setShowEditModal(false)} style={styles.cancelBtn}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Create Team Modal */}
      {showCreateTeam && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <h3>Create Team</h3>
            <input
              type="text"
              placeholder="Team Name"
              value={newTeamName}
              onChange={(e) => setNewTeamName(e.target.value)}
              style={styles.modalInput}
            />
            <input
              type="text"
              placeholder="Description"
              value={newTeamDesc}
              onChange={(e) => setNewTeamDesc(e.target.value)}
              style={styles.modalInput}
            />
            <div style={styles.modalButtons}>
              <button onClick={createTeam} style={styles.modalCreate}>Create</button>
              <button onClick={() => setShowCreateTeam(false)} style={styles.modalCancel}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Create Channel Modal */}
      {showCreateChannel && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <h3>Create Channel</h3>
            <input
              type="text"
              placeholder="Channel Name"
              value={newChannelName}
              onChange={(e) => setNewChannelName(e.target.value)}
              style={styles.modalInput}
            />
            <div style={styles.modalButtons}>
              <button onClick={createChannel} style={styles.modalCreate}>Create</button>
              <button onClick={() => setShowCreateChannel(false)} style={styles.modalCancel}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { display: 'flex', height: '100vh', fontFamily: 'Segoe UI, sans-serif', backgroundColor: '#f5f5f5' },
  teamsSidebar: { width: '72px', backgroundColor: '#202124', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0' },
  teamsHeader: { fontSize: '28px', marginBottom: '24px' },
  teamsList: { flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' },
  teamIcon: { width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: 'bold', color: 'white', cursor: 'pointer' },
  addTeamIcon: { width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#3c3c3c', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', color: 'white', cursor: 'pointer' },
  userSection: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' },
  userAvatar: { width: '40px', height: '40px', backgroundColor: '#667eea', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 'bold', color: 'white' },
  logoutBtn: { background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#aaa' },
  channelsSidebar: { width: '260px', backgroundColor: '#f9f9f9', borderRight: '1px solid #e0e0e0', display: 'flex', flexDirection: 'column' },
  teamInfo: { padding: '24px 16px', borderBottom: '1px solid #e0e0e0' },
  teamName: { fontSize: '18px', margin: 0, color: '#333' },
  channelsSection: { flex: 1, padding: '16px' },
  sectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', fontWeight: '600', color: '#888', marginBottom: '12px' },
  addBtn: { background: 'none', border: 'none', fontSize: '16px', cursor: 'pointer', color: '#888' },
  channelItem: { padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', color: '#333', marginBottom: '2px' },
  directMessagesSection: { padding: '16px', borderTop: '1px solid #e0e0e0', marginTop: '16px' },
  directMessageItem: { padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', color: '#333', marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '8px' },
  searchInput: { width: '100%', padding: '8px 12px', marginBottom: '12px', border: '1px solid #ddd', borderRadius: '20px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' },
  noResults: { padding: '12px', textAlign: 'center', color: '#999', fontSize: '12px' },
  chatArea: { flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: 'white' },
  chatHeader: { padding: '20px 24px', borderBottom: '1px solid #e0e0e0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  chatTitle: { fontSize: '20px', margin: 0, color: '#333' },
  chatDesc: { fontSize: '12px', margin: '4px 0 0', color: '#666' },
  actionButtons: { display: 'flex', gap: '12px' },
  iconBtn: { background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', padding: '8px', borderRadius: '4px' },
  messagesArea: { flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '16px' },
  messageRow: { display: 'flex', gap: '12px', alignItems: 'flex-start' },
  messageAvatar: { width: '36px', height: '36px', backgroundColor: '#667eea', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 'bold', color: 'white', flexShrink: 0 },
  messageContent: { flex: 1 },
  messageHeader: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' },
  messageTime: { fontSize: '11px', color: '#999' },
  editedBadge: { fontSize: '10px', color: '#999', marginLeft: '4px', fontStyle: 'italic' },
  messageActions: { display: 'flex', gap: '8px', marginLeft: 'auto' },
  editBtn: { background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', color: '#667eea', padding: '2px 4px', borderRadius: '4px' },
  deleteBtn: { background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', color: '#ef4444', padding: '2px 4px', borderRadius: '4px' },
  messageText: { fontSize: '14px', color: '#333', lineHeight: '1.4' },
  fileDownload: { fontSize: '14px', color: '#667eea', cursor: 'pointer', textDecoration: 'underline', padding: '4px 0', display: 'inline-block' },
  emptyMessages: { textAlign: 'center', color: '#999', marginTop: '40px' },
  typingIndicator: { padding: '8px 16px', fontSize: '12px', color: '#666', fontStyle: 'italic' },
  inputArea: { padding: '16px 24px', borderTop: '1px solid #e0e0e0', display: 'flex', gap: '12px', alignItems: 'center', position: 'relative' },
  filePreview: { position: 'absolute', bottom: '70px', left: '20px', background: '#fff', border: '1px solid #ddd', borderRadius: '8px', padding: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: '8px' },
  previewImage: { width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px' },
  removePreviewBtn: { width: '20px', height: '20px', borderRadius: '50%', background: '#ef4444', color: 'white', border: 'none', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  attachBtn: { background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', padding: '8px' },
  messageInput: { flex: 1, padding: '10px 16px', border: '1px solid #e0e0e0', borderRadius: '24px', fontSize: '14px', outline: 'none' },
  sendBtn: { padding: '8px 20px', backgroundColor: '#667eea', color: 'white', border: 'none', borderRadius: '20px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' },
  emptyChat: { flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#999' },
  loading: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '18px' },
  modal: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modalContent: { backgroundColor: 'white', padding: '24px', borderRadius: '8px', width: '400px' },
  editTextarea: { width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd', marginBottom: '16px', fontSize: '14px', fontFamily: 'inherit' },
  modalInput: { width: '100%', padding: '10px', marginBottom: '12px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box' },
  modalButtons: { display: 'flex', gap: '12px', justifyContent: 'flex-end' },
  modalCreate: { padding: '8px 16px', backgroundColor: '#667eea', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' },
  saveBtn: { padding: '8px 16px', backgroundColor: '#22c55e', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' },
  cancelBtn: { padding: '8px 16px', backgroundColor: '#ccc', color: '#333', border: 'none', borderRadius: '4px', cursor: 'pointer' },
};

export default Dashboard;
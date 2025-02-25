import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar } from '../components/Avatar';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { socket } from '../utils/socket';
import { api } from '../utils/api';
import logo from '../assets/image 66.png'


export const Chat = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [conversations, setConversations] = useState({});
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      navigate('/');
      return;
    }

    const user = JSON.parse(userData);
    setUser(user);

    fetchUsers();

    socket.auth = { token };
    socket.connect();

    socket.emit('register', { userId: user._id });

    socket.on('message', (data) => {
      setConversations(prev => ({
        ...prev,
        [data.from]: [...(prev[data.from] || []), {
          _id: Date.now(),
          content: data.content,
          sender: data.from,
          timestamp: data.timestamp
        }]
      }));
    });

    socket.on('userOnline', ({ userId }) => {
      setUsers(prev =>
        prev.map(u => (u._id === userId ? { ...u, isOnline: true } : u))
      );
    });

    socket.on('userOffline', ({ userId }) => {
      setUsers(prev =>
        prev.map(u => (u._id === userId ? { ...u, isOnline: false } : u))
      );
    });

    // return () => {
    //   socket.disconnect();
    // };

    return () => {
      socket.off('message');
      socket.off('userOnline');
      socket.off('userOffline');
      socket.disconnect();
    };
    
  }, []);

  useEffect(() => {
    if (selectedUser && user) {
      fetchMessageHistory();
    }
  }, [selectedUser, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversations]);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const users = await api.searchUsers(searchQuery, token);
      setUsers(users);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(fetchUsers, 500);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);
  

  const fetchMessageHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `/api/messages/${user._id}/${selectedUser._id}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      const messages = await response.json();
      
      setConversations(prev => ({
        ...prev,
        [selectedUser._id]: messages
      }));
    } catch (error) {
      console.error('Failed to fetch message history:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedUser) return;
    
    try {
      const messageData = {
        to: selectedUser._id,
        content: newMessage.trim()
      };

      socket.emit('message', messageData);
      
      setConversations(prev => ({
        ...prev,
        [selectedUser._id]: [...(prev[selectedUser._id] || []), {
          _id: Date.now(),
          content: newMessage,
          sender: user._id,
          timestamp: new Date()
        }]
      }));

      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleSearch = async (e) => {
    setSearchQuery(e.target.value);
    fetchUsers();
  };

  return (
    <div className="flex h-screen bg-[#8BABD8] p-7">
      {/* Left Sidebar */}
      <div className="w-80 border-r flex flex-col bg-white">
        {/* App Header */}
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center space-x-2">
          <img src={logo} alt="" />
          </div>
          <Avatar name={user?.name || ''} isOnline={true} />
        </div>

        {/* Search Bar */}
        <div className="p-4">
          <Input
            placeholder="Search"
            value={searchQuery}
            onChange={handleSearch}
            className="bg-gray-100"
            prefix={
              <svg className="w-5 h-5 text-gray-400" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            }
          />
        </div>

        {/* User List */}
        <div className="flex-1 overflow-y-auto">
          {users.filter(u => u._id !== user?._id).map(user => (
            <div
              key={user._id}
              onClick={() => setSelectedUser(user)}
              className={`flex items-center p-4 cursor-pointer hover:bg-gray-50 ${
                selectedUser?._id === user._id ? 'bg-gray-100' : ''
              }`}
            >
              <Avatar name={user.name} isOnline={user.isOnline} />
              <div className="ml-3 flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900 truncate">{user.name}</span>
                </div>
                <p className="text-sm text-gray-500 truncate">
                  {user.isOnline ? 'Online' : 'Offline'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-[#E6EDF7]">
        {selectedUser ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b bg-white flex items-center">
              <Avatar name={selectedUser.name} isOnline={selectedUser.isOnline} />
              <div className="ml-3">
                <div className="font-medium">{selectedUser.name}</div>
                <div className="text-sm text-gray-500">
                  {selectedUser.isOnline ? 'Online' : 'Offline'}
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4">
              {(conversations[selectedUser._id] || []).map(message => (
                <div
                  key={message._id}
                  className={`flex ${
                    message.sender === user?._id ? 'justify-end' : 'justify-start'
                  } mb-4`}
                >
                  <div
                    className={`max-w-xs px-4 py-2 rounded-lg ${
                      message.sender === user?._id
                        ? 'bg-blue-500 text-white'
                        : 'bg-white'
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 bg-white">
              <div className="flex items-center space-x-2">
                <Input
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  className="flex-1"
                />
                <Button onClick={sendMessage}>
                  Send
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Select a user to start chatting
          </div>
        )}
      </div>
    </div>
  );
};
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar } from '../components/Avatar';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { socket } from '../utils/socket';
import { api } from '../utils/api';
import logo from '../assets/image 66.png';

export const Chat = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [conversations, setConversations] = useState({});
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef(null);
  const [showProfileSidebar, setShowProfileSidebar] = useState(false);
  const [profileUser, setProfileUser] = useState(null);
  const [showLeftSidebar, setShowLeftSidebar] = useState(true);

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
      
      if (window.innerWidth < 768) {
        setShowLeftSidebar(false);
      }
    }
  }, [selectedUser, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversations]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setShowLeftSidebar(true);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  const openProfileSidebar = (userToShow) => {
    setProfileUser(userToShow);
    setShowProfileSidebar(true);
  };

  const closeProfileSidebar = () => {
    setShowProfileSidebar(false);
  };

  const handleLogout = () => {
    socket.disconnect();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const toggleLeftSidebar = () => {
    setShowLeftSidebar(!showLeftSidebar);
  };

  const ProfileSidebar = ({ user, onClose }) => {
    const sidebarRef = useRef(null);
    
    useEffect(() => {
      const handleClickOutside = (event) => {
        if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
          onClose();
        }
      };
      
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, [onClose]);
    
    if (!user) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-30 z-30" onClick={onClose}>
        <div 
          ref={sidebarRef}
          className="fixed inset-y-0 right-0 w-72 bg-white shadow-lg z-40 flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-4 border-b flex justify-between items-center">
            <div></div>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-800"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          
          <div className="flex flex-col items-center justify-center pt-8 px-4">
            <div className="flex justify-center w-full mb-4">
              <Avatar name={user.name[0]} isOnline={user.isOnline} size="large" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mt-2 text-center">{user.name}</h3>
            <p className="text-sm text-gray-500 mt-1 text-center">{user.email || user.name.toLowerCase().replace(' ', '') + "@example.com"}</p>
            
            <div className="w-full mt-6 text-center">
              <p className="text-sm text-gray-500">
                {user.isOnline ? "Online" : "Offline"}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const HamburgerIcon = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
    </svg>
  );

  const BackIcon = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
    </svg>
  );

  return (
    <div className="flex h-screen bg-[#8BABD8] p-0 md:p-7 relative overflow-hidden">
      <button 
        onClick={handleLogout}
        className="absolute top-4 right-4 bg-white p-2 rounded-full shadow-md hover:bg-gray-100 z-20"
        title="Logout"
      >
        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
        </svg>
      </button>

      {/* Left Sidebar */}
      <div 
        className={`${
          showLeftSidebar ? 'translate-x-0' : '-translate-x-full'
        } transition-transform duration-300 w-full md:w-80 md:translate-x-0 fixed md:static inset-y-0 left-0 z-20 border-r flex flex-col bg-white`}
      >
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <img src={logo} alt="" />
          </div>
          <div onClick={() => openProfileSidebar(user)} className="cursor-pointer">
            <Avatar name={user?.name?.[0] || ''} isOnline={true} />
          </div>
        </div>

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

        <div className="flex-1 overflow-y-auto">
          {users.filter(u => u._id !== user?._id).map(u => (
            <div
              key={u._id}
              onClick={() => setSelectedUser(u)}
              className={`flex items-center p-4 cursor-pointer hover:bg-gray-50 ${
                selectedUser?._id === u._id ? 'bg-gray-100' : ''
              }`}
            >
              <div onClick={(e) => {
                e.stopPropagation();
                openProfileSidebar(u);
              }} className="cursor-pointer">
                <Avatar name={u.name[0]} isOnline={u.isOnline} />
              </div>
              <div className="ml-3 flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900 truncate">{u.name}</span>
                </div>
                <p className="text-sm text-gray-500 truncate">
                  {u.isOnline ? 'Online' : 'Offline'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className={`flex-1 flex flex-col bg-[#E6EDF7] h-full w-full`}>
        {selectedUser ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b bg-white flex items-center">
              <button 
                onClick={toggleLeftSidebar}
                className="mr-2 md:hidden text-gray-600"
              >
                {showLeftSidebar ? <BackIcon /> : <HamburgerIcon />}
              </button>
              <div onClick={() => openProfileSidebar(selectedUser)} className="cursor-pointer">
                <Avatar name={selectedUser.name[0]} isOnline={selectedUser.isOnline} />
              </div>
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
                <div className="w-full">
                <Input
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  className="w-full"
                />
                </div>
                <Button onClick={sendMessage}>
                  Send
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500 p-4">
            <button 
              onClick={toggleLeftSidebar}
              className="absolute top-4 left-4 md:hidden p-2 bg-white rounded-full shadow-md"
            >
              <HamburgerIcon />
            </button>
            Select a user to start chatting
          </div>
        )}
      </div>
      
      {showProfileSidebar && (
        <ProfileSidebar 
          user={profileUser} 
          onClose={closeProfileSidebar} 
        />
      )}
    </div>
  );
};
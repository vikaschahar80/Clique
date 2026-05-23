import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import api from '../../lib/axios';
import ChatWindow from './ChatWindow';

const MyChats = () => {
  const [chats, setChats] = useState([]);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Get user from local storage
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    fetchChats();
  }, []);

  const fetchChats = async () => {
    try {
      const response = await api.get('/api/chats');
      if (response.data.success) {
        setChats(response.data.chats);
        if (response.data.chats.length > 0) {
          setSelectedMatch(response.data.chats[0]);
        }
      }
    } catch (error) {
      console.error("Failed to fetch chats", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnmatch = (chatId) => {
    const updatedChats = chats.filter((chat) => chat._id !== chatId);
    setChats(updatedChats);
    if (updatedChats.length > 0) {
      setSelectedMatch(updatedChats[0]);
    } else {
      setSelectedMatch(null);
    }
  };

  const filteredMatches = chats.filter((chat) =>
    chat.user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading chats...</div>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
      {/* Matches List */}
      <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="font-semibold mb-3">Messages</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search matches..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {chats.length === 0 ? (
            <div className="p-4 text-center text-gray-500 text-sm">
              No matches yet. Keep swiping!
            </div>
          ) : null}
          {filteredMatches.map((chat) => (
            <button
              key={chat._id}
              onClick={() => setSelectedMatch(chat)}
              className={`w-full p-4 flex items-center gap-3 hover:bg-gray-50 transition-colors border-b border-gray-100 ${
                selectedMatch?._id === chat._id ? 'bg-cyan-50' : ''
              }`}
            >
              <div className="relative">
                <img
                  src={chat.user.photo}
                  alt={chat.user.name}
                  className="size-12 rounded-full object-cover"
                />
                <div className="absolute bottom-0 right-0 size-3.5 bg-green-500 border-2 border-white rounded-full" />
              </div>
              <div className="flex-1 text-left min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium truncate">{chat.user.name}</span>
                  <span className="text-xs text-gray-500">
                    {chat.updatedAt ? new Date(chat.updatedAt).toLocaleDateString() : ''}
                  </span>
                </div>
                <p className="text-sm text-gray-600 truncate">
                  {chat.lastMessage ? chat.lastMessage.text : 'Start a conversation'}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Window Component */}
      <ChatWindow selectedMatch={selectedMatch} user={user} onUnmatch={handleUnmatch} />
    </div>
  )
}

export default MyChats;

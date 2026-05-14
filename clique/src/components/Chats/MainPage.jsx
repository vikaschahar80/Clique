import React from 'react'
import { useState } from 'react';
import { MessageCircle, Heart, Users } from 'lucide-react';
import MyChats from './MyChats';
import { Likes } from './Likes';
import { Groups } from './Groups';
import logo from '/Images/Logo.png';
const MainPage = () => {
  const [activeTab, setActiveTab] = useState('chats');
  return (
    <div className="size-full flex flex-col bg-gradient-to-br from-cyan-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <img src={logo} alt="Clique" className="size-12" />
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent">
              Clique
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Connect with Clique
            </p>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white border-b border-gray-200 px-6 shadow-sm">
        <div className="max-w-7xl mx-auto">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('chats')}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition-all relative ${activeTab === 'chats'
                ? 'text-cyan-600'
                : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              <MessageCircle className="size-5" />
              <span>My Chats</span>
              {activeTab === 'chats' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-500 to-blue-600" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('likes')}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition-all relative ${activeTab === 'likes'
                ? 'text-cyan-600'
                : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              <Heart className="size-5" />
              <span>Likes</span>
              {activeTab === 'likes' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-500 to-blue-600" />
              )}
            </button>


          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto p-6">
          {activeTab === 'chats' && <MyChats />}
          {activeTab === 'likes' && <Likes />}
          
        </div>
      </main>
    </div>
  )
}

export default MainPage

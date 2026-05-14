import { useState, useEffect, useRef } from 'react';
import { ProfileCard } from './ProfileCard';
import { ExitMenu } from './ExitMenu';
import { 
  Users, 
  MessageCircle, 
  LogOut, 
  User, 
  ShieldCheck, 
  ChevronRight,
  LayoutGrid,
  Map,
  SlidersHorizontal
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import logo2 from '/Images/Logo2.png';
import api from '../lib/axios';
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { NearbyMap } from './NearbyMap';

export function Dashboard({ user, onSignOut }) {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(null);
  const [likedProfiles, setLikedProfiles] = useState([]);
  const [viewMode, setViewMode] = useState('cards'); // 'cards' | 'map'
  
  // State for menus
  const [showExitMenu, setShowExitMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  
  const userMenuRef = useRef(null);
  const navigate = useNavigate();

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const response = await api.get('/api/profiles');
        if (response.data.success) {
          setProfiles(response.data.profiles);
        }
      } catch (error) {
        console.error("Failed to fetch profiles:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfiles();
  }, []);

  const currentProfile = profiles[currentIndex];

  const handleLike = async (likeType = 'DATING') => {
    if (currentProfile) {
      try {
        const response = await api.post('/api/connections/like', { 
          receiverId: parseInt(currentProfile.id),
          likeType 
        });
        if (response.data.match) {
          toast.success("It's a match! 🎉", {
            description: `You matched with ${currentProfile.name}`,
          });
        }
        setLikedProfiles([...likedProfiles, currentProfile.id]);
        setDirection('right');
        setTimeout(() => nextProfile(), 300);
      } catch (error) {
        if (error.response?.status === 429) {
          toast.error("Daily Limit Reached", {
            description: error.response.data.message,
            icon: "🛑"
          });
        } else {
          toast.error("Something went wrong");
        }
      }
    }
  };

  const handlePass = async () => {
    if (currentProfile) {
      try {
        await api.post('/api/connections/pass', { receiverId: parseInt(currentProfile.id) });
      } catch (error) {
        console.error("Error passing profile:", error);
      }
      setDirection('left');
      setTimeout(() => nextProfile(), 300);
    }
  };

  const nextProfile = () => {
    setDirection(null);
    if (currentIndex < profiles.length) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
      </div>
    );
  }

  // Common Header Content for both states
  const renderHeaderIcons = () => (
    <div className="flex items-center gap-2">
      <button onClick={() => navigate('/chats')} className="p-2.5 hover:bg-slate-100 rounded-full transition-colors relative">
        <MessageCircle className="w-6 h-6 text-slate-600" />
        <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
      </button>

      <button onClick={() => navigate('/groups')} className="p-2.5 hover:bg-slate-100 rounded-full transition-colors">
        <LayoutGrid className="w-6 h-6 text-slate-600" />
      </button>

      {/* Map / Cards toggle */}
      <button
        onClick={() => setViewMode(v => v === 'cards' ? 'map' : 'cards')}
        className={`p-2.5 rounded-full transition-colors ${
          viewMode === 'map'
            ? 'bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-md'
            : 'hover:bg-slate-100 text-slate-600'
        }`}
        title={viewMode === 'map' ? 'Switch to Cards' : 'Switch to Map'}
      >
        {viewMode === 'map' ? <SlidersHorizontal className="w-5 h-5" /> : <Map className="w-5 h-5" />}
      </button>

      {/* Profile/User Dropdown Menu */}
      <div className="relative" ref={userMenuRef}>
        <button 
          onClick={() => setShowUserMenu(!showUserMenu)} 
          className={`p-2.5 rounded-full transition-colors ${showUserMenu ? 'bg-slate-200' : 'hover:bg-slate-100'}`}
        >
          <Users className="w-6 h-6 text-slate-600" />
        </button>

        <AnimatePresence>
          {showUserMenu && (
            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-0 mt-2 w-72 bg-white border border-slate-200 rounded-2xl shadow-xl z-[60] overflow-hidden"
            >
              {/* User Info Section */}
              <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                    {user?.name?.charAt(0) || 'U'}
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-sm font-bold text-slate-900 truncate">{user?.fullName || 'User Name'}</p>
                    <p className="text-xs text-slate-500 truncate">{user?.email || 'user@example.com'}</p>
                  </div>
                </div>
              </div>

              {/* Menu Actions */}
              <div className="p-2">
                <button 
                  onClick={() => { navigate('/edit-profile'); setShowUserMenu(false); }}
                  className="w-full flex items-center justify-between px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-100 rounded-xl transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <User className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
                    <span>View & Edit Profile</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300" />
                </button>

                <button 
                  onClick={() => { navigate('/verify'); setShowUserMenu(false); }}
                  className="w-full flex items-center justify-between px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-100 rounded-xl transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="w-4 h-4 text-cyan-500" />
                    <span className="font-medium text-cyan-700">Verify Your Account</span>
                  </div>
                  <div className="bg-cyan-100 text-[10px] px-2 py-0.5 rounded text-cyan-700 font-bold">PRO</div>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <button
        onClick={() => setShowExitMenu(true)}
        className="p-2.5 hover:bg-red-50 rounded-full transition-colors text-slate-600 hover:text-red-600"
      >
        <LogOut className="w-6 h-6" />
      </button>
    </div>
  );

  if (!currentProfile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Users className="w-10 h-10 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">That's everyone for now!</h2>
          <p className="text-slate-500 mb-8">You've seen all verified profiles. Check back later for new matches.</p>
          <button onClick={() => setCurrentIndex(0)} className="px-6 py-2 bg-white border border-slate-300 rounded-full text-slate-700 font-medium hover:bg-slate-50 transition-colors">
            Review Profiles Again
          </button>
        </div>

        <div className="fixed top-0 left-0 right-0 p-4 flex justify-between items-center border-b border-slate-200 bg-white/80 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <img src={logo2} alt="Clique" className="h-8 w-8" />
            <span className="font-bold text-slate-900">Clique</span>
          </div>
          {renderHeaderIcons()}
        </div>

        <ExitMenu isOpen={showExitMenu} onClose={() => setShowExitMenu(false)} onLogout={onSignOut} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20 overflow-x-hidden">
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-200/50">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={logo2} alt="Clique" className="h-8 w-8 rounded-lg" />
            <span className="font-bold text-xl tracking-tight text-slate-900">Clique</span>
          </div>
          {renderHeaderIcons()}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {viewMode === 'map' ? (
          <NearbyMap onViewProfile={(id) => {
            // Find the profile in our list and jump to it
            const idx = profiles.findIndex(p => p.id === id);
            if (idx !== -1) { setCurrentIndex(idx); setViewMode('cards'); }
          }} />
        ) : (
          <div className="relative min-h-[600px]">
            <AnimatePresence mode="popLayout">
              <motion.div
                key={currentProfile.id}
                initial={{ opacity: 0, x: direction === 'left' ? -200 : direction === 'right' ? 200 : 0, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: direction === 'left' ? -200 : direction === 'right' ? 200 : 0, scale: 0.95 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="touch-none"
              >
                <ProfileCard profile={currentProfile} onLike={handleLike} onPass={handlePass} />
              </motion.div>
            </AnimatePresence>
          </div>
        )}

        {likedProfiles.length > 0 && !likedProfiles.includes(currentProfile?.id) && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
            <div className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg border border-slate-200">
              <span className="text-pink-500">❤️</span>
              <span className="text-xs font-medium text-slate-700">{likedProfiles.length} liked</span>
            </div>
          </div>
        )}
      </main>

      <ExitMenu isOpen={showExitMenu} onClose={() => setShowExitMenu(false)} onLogout={onSignOut} />
    </div>
  );
}
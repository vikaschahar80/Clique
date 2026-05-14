import { useState, useEffect } from 'react';
import { Heart, X, MessageCircle, Info } from 'lucide-react';
import api from '../../lib/axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export function Likes() {
  const [likes, setLikes] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchLikes();
  }, []);

  const fetchLikes = async () => {
    try {
      const response = await api.get('/api/connections/likes');
      if (response.data.success) {
        setLikes(response.data.profiles);
      }
    } catch (error) {
      console.error("Failed to fetch likes", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLikeBack = async (id) => {
    try {
      const response = await api.post('/api/connections/like', { receiverId: parseInt(id) });
      if (response.data.match) {
        toast.success("It's a match! You can now chat.");
        setLikes(likes.filter(l => l.id !== id));
      }
    } catch (error) {
      console.error("Error liking back", error);
      toast.error("Failed to connect");
    }
  };

  const handlePass = async (id) => {
    try {
      await api.post('/api/connections/pass', { receiverId: parseInt(id) });
      setLikes(likes.filter(l => l.id !== id));
    } catch (error) {
      console.error("Error passing", error);
    }
  };

  if (loading) {
    return <div className="text-center py-10 text-gray-500">Loading likes...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl p-6 shadow-lg">
        <div className="flex items-center gap-3 mb-2">
          <Heart className="size-8 fill-white" />
          <h2 className="text-2xl font-bold">People Who Liked You</h2>
        </div>
        <p className="text-cyan-100">
          {likes.length} people are waiting for you!
        </p>
      </div>

      {/* Likes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {likes.length === 0 ? (
          <div className="col-span-full text-center text-gray-500 py-10">
            No pending likes. Keep swiping!
          </div>
        ) : null}
        {likes.map((profile) => (
          <div
            key={profile.id}
            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow group"
          >
            {/* Profile Image */}
            <div className="relative">
              <img
                src={profile.photos[0]}
                alt={profile.name}
                className="w-full h-64 object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                <h3 className="text-white font-semibold text-xl">
                  {profile.name}
                </h3>
              </div>
            </div>

            {/* Profile Info */}
            <div className="p-4">
              {/* Action Buttons */}
              <div className="flex gap-2 mt-2">
                <button 
                  onClick={() => handleLikeBack(profile.id)}
                  className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-2.5 rounded-lg hover:opacity-90 transition-opacity font-medium"
                >
                  <Heart className="size-4 fill-white" />
                  Like Back
                </button>
                <button 
                  onClick={() => handlePass(profile.id)}
                  className="p-2.5 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <X className="size-5 text-gray-600" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Info Card */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
        <Info className="size-5 text-blue-600 mt-0.5 flex-shrink-0" />
        <div>
          <h4 className="font-semibold text-blue-900 mb-1">How Likes Work</h4>
          <p className="text-sm text-blue-800">
            When you like someone back, you'll instantly match and can start chatting!
          </p>
        </div>
      </div>
    </div>
  );
}
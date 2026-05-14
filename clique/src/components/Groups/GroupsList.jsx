import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, TrendingUp, Users, ArrowLeft } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import api from '../../lib/axios';

export function GroupsList() {
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newGroup, setNewGroup] = useState({ name: '', handle: '', description: '' });

  const fetchGroups = async (query = '') => {
    try {
      setLoading(true);
      const res = await api.get(`/api/groups${query ? `?q=${query}` : ''}`);
      if (res.data.success) {
        setGroups(res.data.groups);
      }
    } catch (error) {
      toast.error("Failed to load groups");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchGroups(searchQuery);
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!newGroup.handle.startsWith('@')) {
      toast.error("Handle must start with @");
      return;
    }
    try {
      const res = await api.post('/api/groups', newGroup);
      if (res.data.success) {
        toast.success("Group created successfully!");
        setShowCreateModal(false);
        fetchGroups();
        navigate(`/groups/${res.data.group.handle}`);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create group");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 flex justify-center pb-24">
      <div className="w-full max-w-4xl space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate('/dashboard')} className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Dashboard
          </Button>
          <h1 className="text-2xl font-bold text-slate-900 font-clash">Public Groups</h1>
          <Button onClick={() => setShowCreateModal(true)} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" /> Create Group
          </Button>
        </div>

        <form onSubmit={handleSearch} className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <Input 
            placeholder="Search groups by name or handle..." 
            className="pl-10 h-12 text-lg rounded-xl border-slate-200 focus:ring-blue-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>

        <div className="space-y-4">
          <div className="flex items-center gap-2 text-slate-600 font-medium">
            <TrendingUp className="w-5 h-5" />
            <span>{searchQuery ? 'Search Results' : 'Trending Groups'}</span>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-slate-200 animate-pulse rounded-xl" />)}
            </div>
          ) : groups.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {groups.map(group => (
                <Card 
                  key={group._id} 
                  className="hover:shadow-md transition-shadow cursor-pointer border-slate-200"
                  onClick={() => navigate(`/groups/${group.handle}`)}
                >
                  <CardContent className="p-5 flex items-start justify-between">
                    <div className="space-y-1">
                      <h3 className="font-bold text-lg text-slate-900">{group.name}</h3>
                      <p className="text-blue-600 text-sm font-medium">{group.handle}</p>
                      <p className="text-slate-500 text-sm line-clamp-2">{group.description}</p>
                    </div>
                    <div className="flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-full text-slate-600 text-sm font-medium">
                      <Users className="w-4 h-4" />
                      {group.memberCount}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 text-slate-500">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p>No groups found. Create the first one!</p>
            </div>
          )}
        </div>
      </div>

      {/* Create Group Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"
          >
            <div className="p-6 space-y-4">
              <h2 className="text-xl font-bold text-slate-900">Create New Group</h2>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Group Name</label>
                  <Input 
                    placeholder="e.g. Hiking Enthusiasts" 
                    value={newGroup.name}
                    onChange={e => setNewGroup({...newGroup, name: e.target.value})}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Unique Handle</label>
                  <Input 
                    placeholder="e.g. @hiking-nyc" 
                    value={newGroup.handle}
                    onChange={e => setNewGroup({...newGroup, handle: e.target.value})}
                  />
                  <p className="text-[10px] text-slate-500">Must start with @ and be unique</p>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Description</label>
                  <textarea 
                    className="w-full min-h-[100px] p-3 rounded-lg border border-slate-200 text-sm"
                    placeholder="What is this group about?"
                    value={newGroup.description}
                    onChange={e => setNewGroup({...newGroup, description: e.target.value})}
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <Button variant="outline" className="flex-1" onClick={() => setShowCreateModal(false)}>Cancel</Button>
                <Button className="flex-1 bg-blue-600" onClick={handleCreateGroup}>Create Group</Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

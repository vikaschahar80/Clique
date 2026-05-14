import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Plus, UserCheck, MessageSquare, Info } from 'lucide-react';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { GroupMemberCard } from './GroupMemberCard';
import { toast } from 'sonner';
import api from '../../lib/axios';

export function GroupDetail() {
  const { handle } = useParams();
  const navigate = useNavigate();
  const [group, setGroup] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);
  const currentUser = JSON.parse(localStorage.getItem('user'));

  const fetchGroupDetails = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/api/groups/${handle}`);
      if (res.data.success) {
        setGroup(res.data.group);
        setMembers(res.data.members);
      }
    } catch (error) {
      toast.error("Group not found");
      navigate('/groups');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroupDetails();
  }, [handle]);

  const handleJoinLeave = async () => {
    try {
      setIsJoining(true);
      const res = await api.post(`/api/groups/${handle}/join`);
      if (res.data.success) {
        toast.success(res.data.isMember ? `Joined ${group.name}!` : `Left ${group.name}`);
        fetchGroupDetails();
      }
    } catch (error) {
      toast.error("Failed to update membership");
    } finally {
      setIsJoining(false);
    }
  };

  const handleLikeMember = async (member, likeType) => {
    try {
      const response = await api.post('/api/connections/like', { 
        receiverId: parseInt(member.id), 
        likeType 
      });

      if (response.data.match) {
        toast.success(`It's a match! 🎉 You matched with ${member.name}`, {
          description: "Check your messages to start chatting!",
        });
      } else {
        toast.success(`Liked ${member.name} as ${likeType.toLowerCase()}!`);
      }
    } catch (error) {
      if (error.response?.status === 429) {
        toast.error("Daily limit reached", {
          description: "You've sent 10 likes today. Come back tomorrow!",
        });
      } else {
        toast.error("Failed to send like");
      }
    }
  };

  if (loading || !group) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
    </div>
  );

  const isMember = currentUser && group.members ? group.members.includes(currentUser.id) : false;

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Button variant="ghost" onClick={() => navigate('/groups')} className="mb-4 -ml-2 text-slate-500 hover:text-slate-900">
            <ArrowLeft className="w-4 h-4 mr-2" /> All Groups
          </Button>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="bg-blue-600 text-white p-3 rounded-2xl">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-slate-900 font-clash">{group.name}</h1>
                  <p className="text-blue-600 font-medium">{group.handle}</p>
                </div>
              </div>
              <p className="text-slate-600 max-w-2xl">{group.description}</p>
              <div className="flex items-center gap-4 text-sm text-slate-500 font-medium pt-2">
                <span className="flex items-center gap-1.5">
                  <Users className="w-4 h-4" />
                  {group.memberCount} Members
                </span>
                <span className="flex items-center gap-1.5 text-blue-600">
                  <Info className="w-4 h-4" />
                  Public Group
                </span>
              </div>
            </div>

            <Button 
              onClick={handleJoinLeave} 
              disabled={isJoining}
              variant={isMember ? "outline" : "default"}
              className={`h-12 px-8 rounded-xl text-base font-bold ${!isMember ? 'bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200' : ''}`}
            >
              {isJoining ? (
                <div className="animate-spin h-5 w-5 border-2 border-current rounded-full border-t-transparent"></div>
              ) : isMember ? (
                <><UserCheck className="w-5 h-5 mr-2" /> Joined</>
              ) : (
                <><Plus className="w-5 h-5 mr-2" /> Join Group</>
              )}
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 mt-8">
        <Tabs defaultValue="members" className="w-full">
          <TabsList className="bg-slate-200/50 p-1 rounded-xl mb-6">
            <TabsTrigger value="members" className="flex-1 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Members</TabsTrigger>
            <TabsTrigger value="chat" className="flex-1 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <MessageSquare className="w-4 h-4 mr-2" /> Group Chat
            </TabsTrigger>
          </TabsList>

          <TabsContent value="members" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {members.map(member => (
                <GroupMemberCard 
                  key={member.id} 
                  member={member} 
                  onLike={handleLikeMember}
                  currentUserId={currentUser.id}
                />
              ))}
            </div>
            {members.length === 0 && (
              <div className="text-center py-20 text-slate-500">
                <Users className="w-12 h-12 mx-auto mb-4 opacity-10" />
                <p>No members found in this group.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="chat" className="mt-0">
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-4">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
                <MessageSquare className="w-8 h-8 text-slate-300" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Group Chat coming soon!</h3>
                <p className="text-slate-500 text-sm max-w-xs mx-auto">
                  Connect with individual members for now by sending them a Friend or Dating request.
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

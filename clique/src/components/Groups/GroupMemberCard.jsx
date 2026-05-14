import { Heart, UserPlus, MapPin, CheckCircle2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { motion } from 'framer-motion';

export function GroupMemberCard({ member, onLike, currentUserId }) {
  const isMe = member.id === currentUserId.toString();

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-4 hover:shadow-sm transition-shadow">
      <div className="relative">
        <img 
          src={member.photos?.[0] || "https://placehold.co/150x150?text=U"} 
          alt={member.name}
          className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-sm"
        />
        <div className="absolute -bottom-1 -right-1 bg-green-500 w-4 h-4 rounded-full border-2 border-white"></div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1">
          <h4 className="font-bold text-slate-900 truncate">{member.name}, {member.age}</h4>
          <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 fill-blue-50" />
        </div>
        <div className="flex items-center text-slate-500 text-xs gap-1">
          <MapPin className="w-3 h-3" />
          <span className="truncate">{member.city}</span>
        </div>
      </div>

      {!isMe && (
        <div className="flex gap-2">
          <button 
            onClick={() => onLike(member, 'FRIENDSHIP')}
            className="p-2.5 bg-slate-50 hover:bg-blue-50 text-slate-600 hover:text-blue-600 rounded-xl transition-colors group"
            title="Like as Friend"
          >
            <UserPlus className="w-5 h-5 group-hover:scale-110 transition-transform" />
          </button>
          <button 
            onClick={() => onLike(member, 'DATING')}
            className="p-2.5 bg-slate-50 hover:bg-rose-50 text-slate-600 hover:text-rose-600 rounded-xl transition-colors group"
            title="Like for Dating"
          >
            <Heart className="w-5 h-5 group-hover:scale-110 transition-transform" />
          </button>
        </div>
      )}

      {isMe && (
        <Badge variant="secondary" className="bg-slate-100 text-slate-500 border-none">You</Badge>
      )}
    </div>
  );
}

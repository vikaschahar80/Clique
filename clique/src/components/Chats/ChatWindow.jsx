import React, { useState, useEffect, useRef } from 'react';
import { Send, MoreVertical, Video, Phone, PhoneOff, UserX } from 'lucide-react';
import api from '../../lib/axios';
import { io } from 'socket.io-client';

const isProduction = import.meta.env.PROD;
let ENDPOINT = import.meta.env.VITE_API_URL;

const isVercel = typeof window !== 'undefined' && window.location && window.location.hostname.includes('vercel.app');

if (isVercel) {
  ENDPOINT = 'https://clique-tubd.onrender.com';
} else if (!ENDPOINT || ENDPOINT.trim() === '' || ENDPOINT === '/' || ENDPOINT.includes('.vercel.app')) {
  ENDPOINT = isProduction ? "https://clique-tubd.onrender.com" : "http://localhost:3000";
}
let socket, selectedChatCompare;

export default function ChatWindow({ selectedMatch, user, onUnmatch }) {
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [socketConnected, setSocketConnected] = useState(false);
  const messagesEndRef = useRef(null);

  // Unmatch & Dropdown States
  const [showDropdown, setShowDropdown] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const dropdownRef = useRef(null);

  // WebRTC States
  const [stream, setStream] = useState(null);
  const [receivingCall, setReceivingCall] = useState(false);
  const [caller, setCaller] = useState('');
  const [callerName, setCallerName] = useState('');
  const [callerSignal, setCallerSignal] = useState(null);
  const [callAccepted, setCallAccepted] = useState(false);
  const [isCalling, setIsCalling] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  
  const myVideo = useRef(null);
  const userVideo = useRef(null);
  const connectionRef = useRef(null);

  const peerConfig = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };

  // Handle click outside dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const confirmUnmatch = async () => {
    try {
      const { data } = await api.post(`/api/chats/${selectedMatch._id}/unmatch`);
      if (data.success) {
        setShowConfirmModal(false);
        setShowDropdown(false);
        if (onUnmatch) {
          onUnmatch(selectedMatch._id);
        }
      }
    } catch (error) {
      console.error("Failed to unmatch user", error);
      alert("Failed to unmatch. Please try again.");
    }
  };

  useEffect(() => {
    socket = io(ENDPOINT);
    socket.emit("setup", user);
    socket.on("connected", () => setSocketConnected(true));
    
    socket.on("message received", (newMessageReceived) => {
      if (
        !selectedChatCompare ||
        selectedChatCompare._id !== newMessageReceived.chatId
      ) {
        // notification logic can go here
      } else {
        setMessages((prev) => [...prev, newMessageReceived]);
      }
    });

    // WebRTC Signaling Events
    socket.on('callUser', (data) => {
      setReceivingCall(true);
      setCaller(data.from);
      setCallerName(data.name);
      setCallerSignal(data.signal);
    });

    socket.on('callEnded', () => {
      setCallEnded(true);
      if (connectionRef.current) connectionRef.current.close();
      setReceivingCall(false);
      setIsCalling(false);
      setCallAccepted(false);
      if (stream) stream.getTracks().forEach(track => track.stop());
    });

    return () => {
      socket.disconnect();
      if (stream) stream.getTracks().forEach(track => track.stop());
    };
  }, [user]);

  useEffect(() => {
    if (selectedMatch) {
      fetchMessages();
      selectedChatCompare = selectedMatch;
      
      // Reset call states on match change
      setReceivingCall(false);
      setIsCalling(false);
      setCallAccepted(false);
      setCallEnded(false);
      if (connectionRef.current) connectionRef.current.close();
    }
  }, [selectedMatch]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchMessages = async () => {
    if (!selectedMatch) return;
    try {
      const { data } = await api.get(`/api/chats/${selectedMatch._id}/messages`);
      if (data.success) {
        setMessages(data.messages);
        socket.emit("join chat", selectedMatch._id);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleSendMessage = async () => {
    if (messageInput.trim()) {
      try {
        const text = messageInput;
        setMessageInput('');
        
        const { data } = await api.post(`/api/chats/${selectedMatch._id}/messages`, {
          text
        });
        
        if (data.success) {
          const newMsg = data.message;
          socket.emit("new message", newMsg);
          setMessages([...messages, newMsg]);
        }
      } catch (error) {
        console.error("Error sending message", error);
      }
    }
  };

  // --- WebRTC Call Logic ---

  const initStream = async () => {
    if (stream) return stream;
    try {
      const currentStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setStream(currentStream);
      if (myVideo.current) myVideo.current.srcObject = currentStream;
      return currentStream;
    } catch (err) {
      console.error("Failed to get local stream", err);
      alert("Microphone/Camera permission denied.");
      return null;
    }
  };

  const setupPeer = (currentStream, isInitiator) => {
    const peer = new RTCPeerConnection(peerConfig);
    connectionRef.current = peer;

    currentStream.getTracks().forEach(track => peer.addTrack(track, currentStream));

    peer.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('iceCandidate', { candidate: event.candidate, chatId: selectedMatch._id });
      }
    };

    peer.ontrack = (event) => {
      if (userVideo.current) userVideo.current.srcObject = event.streams[0];
    };

    socket.on('iceCandidate', async (candidate) => {
      try { await peer.addIceCandidate(new RTCIceCandidate(candidate)); } catch(e) { console.error(e) }
    });

    return peer;
  };

  const callUser = async () => {
    const currentStream = await initStream();
    if (!currentStream) return;
    setIsCalling(true);

    const peer = setupPeer(currentStream, true);

    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);

    socket.emit('callUser', {
      userToCall: selectedMatch.user.id,
      signalData: offer,
      from: user.id,
      name: user.fullName,
      chatId: selectedMatch._id
    });

    socket.on('callAccepted', async (signal) => {
      setCallAccepted(true);
      await peer.setRemoteDescription(new RTCSessionDescription(signal));
    });
  };

  const answerCall = async () => {
    setCallAccepted(true);
    const currentStream = await initStream();
    if (!currentStream) return;

    const peer = setupPeer(currentStream, false);

    await peer.setRemoteDescription(new RTCSessionDescription(callerSignal));
    const answer = await peer.createAnswer();
    await peer.setLocalDescription(answer);

    socket.emit('answerCall', { signal: answer, chatId: selectedMatch._id });
  };

  const leaveCall = () => {
    setCallEnded(true);
    setIsCalling(false);
    setReceivingCall(false);
    setCallAccepted(false);
    if (connectionRef.current) connectionRef.current.close();
    socket.emit('endCall', { chatId: selectedMatch._id });
    if (stream) stream.getTracks().forEach(track => track.stop());
    setStream(null);
  };

  if (!selectedMatch) {
    return (
      <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col items-center justify-center text-gray-500">
        Select a match to start chatting
      </div>
    );
  }

  return (
    <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col relative">
      {/* Unmatch Confirmation Modal */}
      {showConfirmModal && (
        <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-gray-100 flex flex-col items-center text-center animate-in zoom-in-95 duration-200">
            <div className="size-12 rounded-full bg-red-50 flex items-center justify-center text-red-500 mb-4">
              <UserX className="size-6" />
            </div>
            <h3 className="text-lg font-semibold text-gray-950 mb-2">Unmatch with {selectedMatch.user.name}?</h3>
            <p className="text-sm text-gray-500 mb-6 font-normal">
              This will permanently delete your chat and message history. You won't be able to contact them again.
            </p>
            <div className="flex w-full gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-2.5 px-4 border border-gray-200 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmUnmatch}
                className="flex-1 py-2.5 px-4 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors shadow-sm"
              >
                Unmatch
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Call UI Overlay */}
      {(isCalling || callAccepted || receivingCall) && !callEnded && (
        <div className="absolute inset-0 bg-gray-900 z-50 flex flex-col items-center justify-center p-4">
          <div className="flex w-full h-full gap-4 relative justify-center">
            {/* Remote Video */}
            {callAccepted && (
              <video 
                playsInline 
                ref={userVideo} 
                autoPlay 
                className="w-full h-full object-cover rounded-xl bg-black"
              />
            )}
            
            {/* Local Video */}
            {(isCalling || callAccepted) && (
              <video 
                playsInline 
                muted 
                ref={myVideo} 
                autoPlay 
                className={`object-cover rounded-xl bg-gray-800 shadow-xl border-2 border-gray-700 ${callAccepted ? 'absolute bottom-4 right-4 w-32 h-48 z-10' : 'w-full h-full'}`}
              />
            )}
            
            {/* Call Controls & Status */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              {!callAccepted && isCalling && (
                <div className="text-white text-xl font-semibold mb-8">Calling {selectedMatch.user.name}...</div>
              )}
              
              {!callAccepted && receivingCall && !isCalling && (
                <div className="flex flex-col items-center gap-4 bg-gray-800/80 p-8 rounded-2xl pointer-events-auto backdrop-blur-sm">
                  <div className="text-white text-xl font-semibold">{callerName} is calling...</div>
                  <div className="flex gap-4">
                    <button 
                      onClick={answerCall}
                      className="px-6 py-3 bg-green-500 text-white rounded-full font-medium hover:bg-green-600 transition-colors"
                    >
                      Answer
                    </button>
                    <button 
                      onClick={leaveCall}
                      className="px-6 py-3 bg-red-500 text-white rounded-full font-medium hover:bg-red-600 transition-colors"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* End Call Button */}
            {(isCalling || callAccepted) && (
              <button 
                onClick={leaveCall}
                className="absolute bottom-8 left-1/2 -translate-x-1/2 p-4 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors pointer-events-auto shadow-lg"
              >
                <PhoneOff className="size-6" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Chat Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src={selectedMatch.user.photo}
              alt={selectedMatch.user.name}
              className="size-10 rounded-full object-cover"
            />
            <div className="absolute bottom-0 right-0 size-3 bg-green-500 border-2 border-white rounded-full" />
          </div>
          <div>
            <h3 className="font-semibold">{selectedMatch.user.name}</h3>
            <p className="text-xs text-gray-500">Active now</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={callUser} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <Phone className="size-5 text-gray-600" />
          </button>
          <button onClick={callUser} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <Video className="size-5 text-gray-600" />
          </button>
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setShowDropdown(!showDropdown)} 
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <MoreVertical className="size-5 text-gray-600" />
            </button>
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-lg py-1.5 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                <button
                  onClick={() => {
                    setShowConfirmModal(true);
                    setShowDropdown(false);
                  }}
                  className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2 font-medium"
                >
                  <UserX className="size-4" />
                  Unmatch User
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message._id || Math.random()}
            className={`flex ${message.senderId === user.id ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[70%] ${
                message.senderId === user.id
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white'
                  : 'bg-gray-100 text-gray-900'
              } rounded-2xl px-4 py-2 shadow-sm`}
            >
              <p className="break-words">{message.text}</p>
              <span
                className={`text-[10px] ${
                  message.senderId === user.id ? 'text-cyan-100' : 'text-gray-500'
                } mt-1 block text-right`}
              >
                {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Type a message..."
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
          />
          <button
            onClick={handleSendMessage}
            className="p-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-full hover:shadow-md hover:scale-105 transition-all disabled:opacity-50"
            disabled={!messageInput.trim()}
          >
            <Send className="size-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

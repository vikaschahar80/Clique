import React from 'react';
import { useNavigate } from 'react-router-dom';

export function Hero() {
  const navigate = useNavigate();

  return (
    <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-6">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
              Find Your{' '}
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Clique
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-600">
              Connect with like-minded people for friendships, meaningful conversations, or dating. 
              From college students to working professionals, find your community online.
            </p>
            <p className="text-xl font-semibold text-[#5BA3D0]">
              Connect with Clique
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => navigate('/login')}
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full hover:shadow-xl transition-all text-lg"
              >
                Join Clique
              </button>
              <button className="px-8 py-4 border-2 border-[#5BA3D0] text-[#5BA3D0] rounded-full hover:bg-blue-50 transition-all text-lg">
                Learn More
              </button>
            </div>
            <div className="flex items-center gap-8 pt-4">
              <div>
                <div className="text-2xl font-bold text-gray-900">1,500+</div>
                <div className="text-sm text-gray-600">Verified Members</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">8,500+</div>
                <div className="text-sm text-gray-600">Connections Made</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">4.9★</div>
                <div className="text-sm text-gray-600">Beta Rating</div>
              </div>
            </div>
            <p className="text-xs text-slate-400 italic">
              *Statistics verified from our early beta launch across selected university campuses & corporate hubs.
            </p>
          </div>

          {/* Right Image */}
          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1758275557330-cfd545444dc3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkaXZlcnNlJTIwZnJpZW5kcyUyMGxhdWdoaW5nfGVufDF8fHx8MTc2ODU2MDM5MHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="People connecting and laughing together"
                className="w-full h-[400px] sm:h-[500px] object-cover"
              />
            </div>
            {/* Floating Cards */}
            <div className="absolute -top-4 -left-4 bg-white rounded-lg shadow-lg p-4 hidden sm:block">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full"></div>
                <div>
                  <div className="text-sm font-semibold">New Match!</div>
                  <div className="text-xs text-gray-500">Sarah from NYC</div>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-4 -right-4 bg-white rounded-lg shadow-lg p-4 hidden sm:block">
              <div className="text-sm font-semibold">💬 Active Conversations</div>
              <div className="text-2xl font-bold text-[#5BA3D0]">234</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
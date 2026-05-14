import { UserPlus, Search, MessageSquare, Sparkles } from 'lucide-react';

export function HowItWorks() {
  const steps = [
    {
      icon: UserPlus,
      title: 'Create Your Profile',
      description: 'Sign up and tell us about yourself, your interests, and what you\'re looking for.',
    },
    {
      icon: Search,
      title: 'Discover People',
      description: 'Browse through profiles of students and professionals who match your vibe.',
    },
    {
      icon: MessageSquare,
      title: 'Start Connecting',
      description: 'Send messages, join group chats, or have one-on-one conversations.',
    },
    {
      icon: Sparkles,
      title: 'Build Relationships',
      description: 'Form lasting friendships, find romantic partners, or just have great conversations.',
    },
  ];

  return (
    <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            How It Works
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Getting started is simple. Follow these steps to start building meaningful connections.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              {/* Connection Line (desktop only) */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-[calc(50%+2rem)] w-[calc(100%-4rem)] h-0.5 bg-gradient-to-r from-[#5BA3D0] to-[#4A7C9D]"></div>
              )}
              
              <div className="relative bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#5BA3D0] to-[#4A7C9D] flex items-center justify-center mb-4 mx-auto">
                  <step.icon className="w-8 h-8 text-white" />
                </div>
                <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-[#4A7C9D] font-bold">
                  {index + 1}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2 text-center">
                  {step.title}
                </h3>
                <p className="text-gray-600 text-center">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
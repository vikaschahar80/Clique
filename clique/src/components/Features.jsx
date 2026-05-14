import { Users, Heart, MessageCircle, Briefcase, GraduationCap, Coffee } from 'lucide-react';

export function Features() {
  const features = [
    {
      icon: Users,
      title: 'Make Friends',
      description: 'Connect with people who share your interests, hobbies, and values.',
      color: 'from-[#5BA3D0] to-[#4A7C9D]',
    },
    {
      icon: Heart,
      title: 'Find Love',
      description: 'Meet potential partners with similar goals and relationship expectations.',
      color: 'from-pink-500 to-rose-500',
    },
    {
      icon: MessageCircle,
      title: 'Be Heard',
      description: 'Find someone who truly listens. Share your thoughts in a safe space.',
      color: 'from-purple-500 to-indigo-500',
    },
    {
      icon: GraduationCap,
      title: 'For Students',
      description: 'Connect with fellow students, study buddies, and campus friends.',
      color: 'from-[#5BA3D0] to-[#4A7C9D]',
    },
    {
      icon: Briefcase,
      title: 'For Professionals',
      description: 'Network with working professionals and expand your social circle.',
      color: 'from-[#6BB5DC] to-[#5BA3D0]',
    },
    {
      icon: Coffee,
      title: 'Meet Up',
      description: 'Take your online connections offline with safe meetup features.',
      color: 'from-purple-600 to-pink-500',
    },
  ];

  return (
    <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Everything You Need to{' '}
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Connect
            </span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Whether you're looking for friendship, romance, or just someone to talk to, 
            Clique has you covered.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group p-6 rounded-2xl border border-gray-200 hover:border-transparent hover:shadow-xl transition-all duration-300"
            >
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <feature.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
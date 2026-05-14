// import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';

export function Community() {
  const audiences = [
    {
      title: 'College Students',
      description: 'Connect with fellow students from your campus or across the country. Find study partners, roommates, or friends who share your major.',
      image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2xsZWdlJTIwc3R1ZGVudHMlMjBzdHVkeWluZ3xlbnwxfHx8fDE3Njg2MjQyNjl8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      stats: ['30K+ Students', '500+ Universities', '1000+ Study Groups'],
    },
    {
      title: 'Working Professionals',
      description: 'Expand your network beyond the office. Meet professionals in your industry or explore new interests with people who understand your busy schedule.',
      image: 'https://images.unsplash.com/photo-1761949119766-ce7870c38bd2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b3VuZyUyMHByb2Zlc3Npb25hbHMlMjBuZXR3b3JraW5nfGVufDF8fHx8MTc2ODYyNDI2OXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      stats: ['20K+ Professionals', '100+ Industries', '500+ Networking Events'],
    },
  ];

  return (
    <section id="community" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            A Community for{' '}
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Everyone
            </span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            No matter where you are in life, there's a place for you in Clique.
          </p>
        </div>

        <div className="space-y-12">
          {audiences.map((audience, index) => (
            <div
              key={index}
              className={`grid md:grid-cols-2 gap-8 items-center ${
                index % 2 === 1 ? 'md:flex-row-reverse' : ''
              }`}
            >
              <div className={index % 2 === 1 ? 'md:order-2' : ''}>
                <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                  {audience.title}
                </h3>
                <p className="text-lg text-gray-600 mb-6">
                  {audience.description}
                </p>
                <div className="flex flex-wrap gap-4 mb-6">
                  {audience.stats.map((stat, statIndex) => (
                    <div
                      key={statIndex}
                      className="px-4 py-2 bg-blue-100 text-[#4A7C9D] rounded-full"
                    >
                      {stat}
                    </div>
                  ))}
                </div>
                <button className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full hover:shadow-lg transition-all">
                  Join {audience.title.split(' ')[0]}s
                </button>
              </div>
              <div className={index % 2 === 1 ? 'md:order-1' : ''}>
                <div className="rounded-2xl overflow-hidden shadow-xl">
                  <img
                    src={audience.image}
                    alt={audience.title}
                    className="w-full h-[300px] sm:h-[400px] object-cover"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
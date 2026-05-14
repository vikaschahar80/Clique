import { Star } from 'lucide-react';

export function Testimonials() {
  const testimonials = [
    {
      name: 'Sarah M.',
      role: 'College Student',
      image: 'https://ui-avatars.com/api/?name=Sarah+M&background=5BA3D0&color=fff&size=80',
      text: 'I moved to a new city for college and felt so alone. Clique helped me find an amazing group of friends who share my love for hiking and photography!',
      rating: 5,
    },
    {
      name: 'James K.',
      role: 'Software Engineer',
      image: 'https://ui-avatars.com/api/?name=James+K&background=4A7C9D&color=fff&size=80',
      text: 'As someone who works remotely, it was hard to meet new people. Through Clique, I found a great community of tech professionals and even met my girlfriend!',
      rating: 5,
    },
    {
      name: 'Maya P.',
      role: 'Graduate Student',
      image: 'https://ui-avatars.com/api/?name=Maya+P&background=5BA3D0&color=fff&size=80',
      text: 'The listening feature is incredible. Sometimes you just need someone to talk to without judgment. Clique provided that safe space for me.',
      rating: 5,
    },
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            What Our Users Say
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Real stories from real people who found their community through Clique.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="flex items-center gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-gray-700 mb-6 italic">"{testimonial.text}"</p>
              <div className="flex items-center gap-3">
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full"
                />
                <div>
                  <div className="font-semibold text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-gray-600">{testimonial.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
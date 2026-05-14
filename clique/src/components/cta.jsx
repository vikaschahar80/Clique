// import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';

export function CTA() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#5BA3D0] to-[#4A7C9D] p-8 sm:p-12 lg:p-16">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <img
              src="https://images.unsplash.com/photo-1626606776792-bcb8b30e3a3e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZW9wbGUlMjB0YWxraW5nJTIwY2FmZXxlbnwxfHx8fDE3Njg2MjQyNjl8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
              alt="Background"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="relative text-center max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
              Ready to Find Your Clique?
            </h2>
            <p className="text-lg sm:text-xl text-white/90 mb-8">
              Join thousands of students and professionals who are already making meaningful connections. 
              Your next best friend, partner, or confidant is just a click away.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-8 py-4 bg-white text-purple-600 rounded-full hover:shadow-2xl transition-all text-lg font-semibold">
                Sign Up Free
              </button>
              <button className="px-8 py-4 border-2 border-white text-white rounded-full hover:bg-white/10 transition-all text-lg font-semibold">
                Download App
              </button>
            </div>
            <p className="text-sm text-white/75 mt-6">
              No credit card required • Free forever • Join in 2 minutes
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
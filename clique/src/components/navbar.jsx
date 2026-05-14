import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import logo from '/Images/Logo.png'
import { useNavigate } from 'react-router-dom';
export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
const navigate = useNavigate();
  // Placeholder logo URL - replace with your actual local file later
//   const logoSrc = logo;
return (
    <nav className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm z-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <img onClick={()=>{navigate('/')}} src={logo} alt="Clique Logo" className="h-10 w-auto" />
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-gray-700 hover:text-[#5BA3D0] transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="text-gray-700 hover:text-[#5BA3D0] transition-colors">
              How It Works
            </a>
            <a href="#community" className="text-gray-700 hover:text-[#5BA3D0] transition-colors">
              Community
            </a>
            <button onClick={() => navigate('/login')} className="px-6 py-2 bg-gradient-to-r from-[#5BA3D0] to-[#4A7C9D] text-white rounded-full hover:shadow-lg transition-all">
              Get Started
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 space-y-4">
            <a
              href="#features"
              className="block text-gray-700 hover:text-[#5BA3D0] transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="block text-gray-700 hover:text-[#5BA3D0] transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              How It Works
            </a>
            <a
              href="#community"
              className="block text-gray-700 hover:text-[#5BA3D0] transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Community
            </a>
            <button className="w-full px-6 py-2 bg-gradient-to-r from-[#5BA3D0] to-[#4A7C9D] text-white rounded-full hover:shadow-lg transition-all">
              Get Started
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
import React from 'react';
import { Link } from 'react-router-dom';
import { User } from 'lucide-react';

const Navbar: React.FC = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 bg-gradient-to-b from-teal-500 to-teal-600 text-white z-10">
      <div className="px-4 py-3 flex items-center justify-between relative">
        {/* Centered Logo */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <span className="text-xl font-bold tracking-tight text-orange-500 bg-white rounded-lg px-4 py-1 shadow-sm -rotate-3">Moments</span>
        </div>
        {/* Invisible placeholder for left alignment */}
        <div className="w-10 h-10" />
        {/* Profile Icon on the right */}
        <Link 
          to="/profile" 
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
          aria-label="Profile"
        >
          <User size={24} />
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
import React from 'react';
import { Link } from 'react-router-dom';
import { Aperture } from 'lucide-react';
import 'material-symbols/outlined.css';

const Navbar: React.FC = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 bg-primary text-white z-10">
      <div className="px-4 py-3 sm:py-4 md:py-5 flex items-center justify-between relative">
        {/* Centered Logo */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="px-6 py-2 -rotate-3 hover:rotate-0 transition-transform duration-200">
            <div className="flex items-center text-2xl sm:text-3xl md:text-4xl font-roboto-flex font-bold tracking-tight text-white">
              m
              <Aperture 
                className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 -mt-1 mx-[1px] text-orange-500" 
                strokeWidth={2.5}
              />
              ments
            </div>
          </div>
        </div>
        {/* Invisible placeholder for left alignment */}
        <div className="w-10 h-10 md:w-12 md:h-12" />
        {/* Settings Icon on the right */}
        <Link 
          to="/profile" 
          className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
          aria-label="Settings"
        >
          <span 
            className="material-symbols-outlined"
            style={{ 
              fontSize: '28px',
              fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' -25, 'opsz' 24"
            }}
          >
            settings
          </span>
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
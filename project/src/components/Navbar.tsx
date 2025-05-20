import React from 'react';
import { Link } from 'react-router-dom';
import { User } from 'lucide-react';

const Navbar: React.FC = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 bg-orange text-white z-10 shadow-sm">
  <div className="px-4 py-3 flex items-center justify-between">
    <h1 className="text-xl font-bold tracking-tight">Moments</h1>
    <Link 
      to="/profile" 
      className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-orange-400 transition-colors"
      aria-label="Profile"
    >
      <User size={24} />
    </Link>
  </div>
</nav>

  );
};

export default Navbar;
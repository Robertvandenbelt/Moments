import React from 'react';
import { Link } from 'react-router-dom';

const FloatingActionButton: React.FC = () => {
  return (
    <Link
      to="/create"
      className="fixed bottom-4 md:bottom-8 left-1/2 -translate-x-1/2 md:left-32 md:translate-x-0 lg:left-60 z-50 h-14 w-14 bg-primary text-on-primary rounded-[16px] shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center hover:scale-105 active:scale-95"
      aria-label="Add Moment"
    >
      <span
        className="material-symbols-outlined"
        style={{ fontSize: 28, fontVariationSettings: `'FILL' 1, 'wght' 500, 'GRAD' -25, 'opsz' 24` }}
      >
        add
      </span>
    </Link>
  );
};

export default FloatingActionButton; 
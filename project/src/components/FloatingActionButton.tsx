import React from 'react';
import { Link } from 'react-router-dom';

const FloatingActionButton: React.FC = () => {
  return (
    <Link
      to="/create"
      className="fixed bottom-4 md:bottom-8 left-1/2 -translate-x-1/2 md:left-32 md:translate-x-0 lg:left-60 z-50 h-10 px-4 bg-primary text-on-primary rounded-[12px] shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 hover:scale-105 active:scale-95 font-roboto-flex text-sm font-medium"
      aria-label="New moment"
      style={{ minWidth: '96px' }}
    >
      <span
        className="material-symbols-outlined"
        style={{ fontSize: 24, fontVariationSettings: `'FILL' 1, 'wght' 500, 'GRAD' -25, 'opsz' 24` }}
      >
        add
      </span>
      New moment
    </Link>
  );
};

export default FloatingActionButton; 
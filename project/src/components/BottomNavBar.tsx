import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const navItems = [
  { label: 'Timeline', icon: 'home', to: '/timeline' },
  { label: 'Add Moment', icon: 'add', to: '/create' },
  { label: 'Settings', icon: 'settings', to: '/profile' },
];

const BottomNavBar: React.FC = () => {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-surface shadow-lg border-t border-outline-variant flex justify-around items-center h-20 md:hidden">
      {navItems.map((item, idx) => {
        const isActive = location.pathname === item.to || (item.to === '/timeline' && location.pathname === '/');
        // Only show label for 'Add Moment' on mobile
        const showLabel = idx === 1;
        return (
          <Link
            key={item.to}
            to={item.to}
            className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${isActive ? 'text-primary' : 'text-on-surface-variant'}`}
            aria-label={item.label}
          >
            <span
              className="material-symbols-outlined"
              style={{ fontSize: 28, fontVariationSettings: `'FILL' ${isActive ? 1 : 0}, 'wght' 500, 'GRAD' -25, 'opsz' 24` }}
            >
              {item.icon}
            </span>
            {/* Show label only for Add Moment on mobile, all labels on md+ */}
            <span className={`text-xs mt-1 font-roboto-flex font-medium ${showLabel ? '' : 'hidden'} md:inline`}>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};

export default BottomNavBar; 
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const navItems = [
  { label: 'Timeline', icon: 'home', to: '/timeline' },
  { label: 'Settings', icon: 'settings', to: '/profile' },
];

const SidebarNav: React.FC = () => {
  const location = useLocation();

  return (
    <nav className="hidden md:fixed md:inset-y-0 md:left-0 md:z-40 md:flex md:flex-col md:w-24 lg:w-56 bg-surface border-r border-outline-variant shadow-lg">
      <div className="flex flex-col items-center lg:items-start gap-2 py-8 w-full h-full">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to || (item.to === '/timeline' && location.pathname === '/');
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex flex-col lg:flex-row items-center lg:items-center gap-1 w-full px-2 py-3 rounded-lg transition-colors duration-150 ${isActive ? 'bg-primary/10 text-primary' : 'text-on-surface-variant hover:bg-surface-container-highest'}`}
              aria-label={item.label}
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: 28, fontVariationSettings: `'FILL' ${isActive ? 1 : 0}, 'wght' 500, 'GRAD' -25, 'opsz' 24` }}
              >
                {item.icon}
              </span>
              <span className="hidden lg:inline text-base font-roboto-flex font-medium ml-2">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default SidebarNav; 
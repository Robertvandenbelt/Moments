import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from '../../services/supabase';
import { useAuth } from '../../context/AuthContext';
import 'material-symbols/outlined.css';

const LogoutButton: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { refreshUser } = useAuth();

  const handleLogout = async () => {
    setLoading(true);
    try {
      await signOut();
      await refreshUser(); // Refresh auth state
      navigate('/login', { replace: true }); // Use replace to prevent back navigation
    } catch (error) {
      console.error('Error logging out:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="group relative flex items-center gap-2 px-6 h-12 bg-primary hover:bg-primary/90 active:bg-primary/80 transition-colors text-white text-label-large font-roboto-flex rounded-full disabled:bg-on-surface/12 disabled:text-on-surface/38 disabled:shadow-none"
    >
      {/* State layer */}
      <div className="absolute inset-0 rounded-full bg-white opacity-0 group-hover:opacity-[0.08] group-active:opacity-[0.12] transition-opacity duration-200" />
      {/* Content container */}
      <span className="material-symbols-outlined"
        style={{ 
          fontSize: '20px',
          fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' -25, 'opsz' 24"
        }}
      >
        logout
      </span>
      {loading ? 'Logging out...' : 'Log out'}
    </button>
  );
};

export default LogoutButton;
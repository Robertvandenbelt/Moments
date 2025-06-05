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
      className="group relative w-full h-10 bg-primary-action hover:shadow-level2 active:shadow-level1 transition-all duration-200 text-white text-label-large font-roboto-flex rounded-full disabled:bg-on-surface/12 disabled:text-on-surface/38 disabled:shadow-none"
    >
      {/* State layer */}
      <div className="absolute inset-0 rounded-full bg-white opacity-0 group-hover:opacity-[0.08] group-active:opacity-[0.12] transition-opacity duration-200" />
      
      {/* Content container */}
      <div className="relative flex items-center justify-center gap-2">
        <span className="material-symbols-outlined"
          style={{ 
            fontSize: '18px',
            fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' -25, 'opsz' 24"
          }}
        >
          logout
        </span>
        {loading ? 'Logging out...' : 'Log out'}
      </div>
    </button>
  );
};

export default LogoutButton;
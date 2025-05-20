import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from '../../services/supabase';
import { useAuth } from '../../context/AuthContext';

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
      className="w-full bg-orange-500 hover:bg-orange-600 transition-colors text-white text-xl font-medium py-3 px-4 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-70"
    >
      {loading ? 'Logging out...' : 'Log out'}
    </button>
  );
};

export default LogoutButton;
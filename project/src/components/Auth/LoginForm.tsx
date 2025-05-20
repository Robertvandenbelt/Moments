import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { signIn } from '../../services/supabase';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

type LoginFormProps = {
  isJoin?: boolean;
};

const LoginForm: React.FC<LoginFormProps> = ({ isJoin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { refreshUser } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signIn(email, password);
      await refreshUser();
      
      // If we're in a join flow, extract the board ID from the URL
      const boardId = location.pathname.split('/join/')[1];
      if (boardId) {
        navigate(`/join/${boardId}`, { replace: true });
      } else {
        navigate('/timeline', { replace: true });
      }
    } catch (err: any) {
      setError(err.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  const textColorClass = isJoin ? 'text-gray-900' : 'text-white';

  return (
    <div className="w-full">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl mb-4">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="email" className={`block text-base font-medium ${textColorClass} mb-2`}>
            Email address
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="w-full px-4 py-3 rounded-xl bg-white text-gray-800 border border-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
        
        <div>
          <label htmlFor="password" className={`block text-base font-medium ${textColorClass} mb-2`}>
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            className="w-full px-4 py-3 rounded-xl bg-white text-gray-800 border border-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-orange-500 hover:bg-orange-600 transition-colors text-white text-base font-medium py-3 px-4 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-70"
        >
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
      
      {!isJoin && (
        <div className="mt-8 text-center">
          <Link to="/signup" className="text-white hover:text-orange-200 text-lg transition-colors">
            Or create a new account
          </Link>
        </div>
      )}
    </div>
  );
};

export default LoginForm;
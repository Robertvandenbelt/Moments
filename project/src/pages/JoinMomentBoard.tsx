import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMomentBoard } from '../services/supabase';
import { MomentBoard } from '../lib/types';
import LoginForm from '../components/Auth/LoginForm';
import SignupForm from '../components/Auth/SignupForm';
import MomentBoardSnippet from '../components/MomentBoardSnippet';

const JoinMomentBoard: React.FC = () => {
  const { momentBoardId } = useParams<{ momentBoardId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [board, setBoard] = useState<MomentBoard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');

  useEffect(() => {
    const fetchBoard = async () => {
      if (!momentBoardId) return;

      try {
        const data = await getMomentBoard(momentBoardId);
        setBoard(data);

        // If the user is the board owner, redirect to the board page
        if (user && data.created_by === user.id) {
          navigate(`/board/${momentBoardId}`, { replace: true });
          return;
        }

      } catch (err) {
        setError('Failed to load moment board');
        console.error('Error fetching board:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBoard();
  }, [momentBoardId, user, navigate]);

  const handleJoin = () => {
    console.log('Joining board:', momentBoardId);
  };

  // Don't render anything while redirecting owner
  if (user && board && board.created_by === user.id) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-lime-200 to-teal-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-orange-500"></div>
      </div>
    );
  }

  if (error || !board) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-lime-200 to-teal-100 flex items-center justify-center">
        <div className="text-center px-4">
          <p className="text-red-600 font-medium">
            {error || 'Moment board not found'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-lime-200 to-teal-100 px-6 py-10">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-12">
          <div className="text-6xl mb-6">🎉</div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            You're invited!
          </h1>
          <p className="text-gray-600 text-lg">
            Join this moment to add your memories
          </p>
        </div>

        <div className="mb-10">
          <MomentBoardSnippet
            title={board.title || undefined}
            dateStart={board.date_start}
            dateEnd={board.date_end || undefined}
          />
        </div>

        {user ? (
          <button
            onClick={handleJoin}
            className="w-full bg-orange-500 text-white py-4 px-8 rounded-full text-base font-medium hover:bg-orange-600 transition-colors"
          >
            Join this Moment
          </button>
        ) : (
          <div>
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="flex gap-2 mb-8">
                <button
                  onClick={() => setActiveTab('login')}
                  className={`flex-1 py-2 px-4 rounded-xl text-sm font-medium transition-colors ${
                    activeTab === 'login'
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Login
                </button>
                <button
                  onClick={() => setActiveTab('signup')}
                  className={`flex-1 py-2 px-4 rounded-xl text-sm font-medium transition-colors ${
                    activeTab === 'signup'
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Sign up
                </button>
              </div>

              {activeTab === 'login' ? <LoginForm isJoin /> : <SignupForm isJoin />}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default JoinMomentBoard;
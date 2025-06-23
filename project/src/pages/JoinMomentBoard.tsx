import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMomentBoard } from '../services/supabase';
import { BasicMomentBoard } from '../lib/types';
import LoginForm from '../components/Auth/LoginForm';
import SignupForm from '../components/Auth/SignupForm';
import MomentBoardSnippet from '../components/MomentBoardSnippet';
import { supabase } from '../lib/supabaseClient';

// Error boundary component for JoinMomentBoard
class JoinMomentBoardErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('JoinMomentBoard Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-b from-lime-200 to-teal-100 flex items-center justify-center">
          <div className="text-center px-4 max-w-md">
            <div className="text-6xl mb-6">💥</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Component Error
            </h1>
            <p className="text-red-600 font-medium mb-4">
              The join page encountered an error. Please try refreshing.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-orange-500 text-white py-2 px-6 rounded-full text-sm font-medium hover:bg-orange-600 transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const JoinMomentBoardContent: React.FC = () => {
  const { momentBoardId } = useParams<{ momentBoardId: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [board, setBoard] = useState<BasicMomentBoard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');

  useEffect(() => {
    const fetchBoard = async () => {
      console.log('JoinMomentBoard: Starting fetchBoard', { momentBoardId, user: !!user });
      
      // Debug environment variables in production
      console.log('JoinMomentBoard: Environment check', {
        hasSupabaseUrl: !!import.meta.env.VITE_SUPABASE_URL,
        hasSupabaseAnonKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
        supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
        nodeEnv: import.meta.env.MODE
      });
      
      if (!momentBoardId) {
        console.error('JoinMomentBoard: No momentBoardId provided');
        setError('Invalid moment board link');
        setLoading(false);
        return;
      }

      try {
        console.log('JoinMomentBoard: Fetching board data for ID:', momentBoardId);
        const data = await getMomentBoard(momentBoardId);
        console.log('JoinMomentBoard: Board data received:', data);
        setBoard(data);

        // If the user is the board owner, redirect to the board page
        if (user && data.created_by === user.id) {
          console.log('JoinMomentBoard: User is owner, redirecting to board');
          navigate(`/board/${momentBoardId}`, { replace: true });
          return;
        }

      } catch (err) {
        console.error('JoinMomentBoard: Error fetching board:', err);
        setError(err instanceof Error ? err.message : 'Failed to load moment board');
      } finally {
        setLoading(false);
      }
    };

    // Only fetch board data after auth loading is complete
    if (!authLoading) {
      fetchBoard();
    }
  }, [momentBoardId, user, navigate, authLoading]);

  const handleJoin = async () => {
    if (!momentBoardId || !user) {
      console.error('JoinMomentBoard: Cannot join - missing momentBoardId or user');
      return;
    }
    
    setJoining(true);
    try {
      console.log('JoinMomentBoard: Starting join process');
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('No session');
      }

      const response = await fetch('https://ekwpzlzdjbfzjdtdfafk.supabase.co/functions/v1/join-moment-board', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY
        },
        body: JSON.stringify({ momentBoardId }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to join: ${errorText}`);
      }

      console.log('JoinMomentBoard: Successfully joined, redirecting');
      // Redirect to the board page after successful join
      navigate(`/board/${momentBoardId}`);
    } catch (err) {
      console.error('JoinMomentBoard: Error joining board:', err);
      setError(err instanceof Error ? err.message : 'Failed to join moment board');
    } finally {
      setJoining(false);
    }
  };

  // Wrap the entire render logic in a try-catch to prevent blank screens
  try {
    // Show loading state while auth is loading
    if (authLoading) {
      return (
        <div className="min-h-screen bg-gradient-to-b from-lime-200 to-teal-100 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-orange-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      );
    }

    // Don't render anything while redirecting owner
    if (user && board && board.created_by === user.id) {
      return (
        <div className="min-h-screen bg-gradient-to-b from-lime-200 to-teal-100 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-orange-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Redirecting to your moment...</p>
          </div>
        </div>
      );
    }

    if (loading) {
      return (
        <div className="min-h-screen bg-gradient-to-b from-lime-200 to-teal-100 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-orange-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading moment board...</p>
          </div>
        </div>
      );
    }

    if (error || !board) {
      return (
        <div className="min-h-screen bg-gradient-to-b from-lime-200 to-teal-100 flex items-center justify-center">
          <div className="text-center px-4 max-w-md">
            <div className="text-6xl mb-6">😔</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              {error ? 'Something went wrong' : 'Moment not found'}
            </h1>
            <p className="text-red-600 font-medium mb-4">
              {error || 'This moment board could not be found or may have been deleted.'}
            </p>
            <button
              onClick={() => navigate('/')}
              className="bg-orange-500 text-white py-2 px-6 rounded-full text-sm font-medium hover:bg-orange-600 transition-colors"
            >
              Go Home
            </button>
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
              disabled={joining}
              className="w-full bg-orange-500 text-white py-4 px-8 rounded-full text-base font-medium hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {joining ? 'Joining...' : 'Join this Moment'}
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
  } catch (err) {
    console.error('JoinMomentBoard: Unexpected error in render:', err);
    return (
      <div className="min-h-screen bg-gradient-to-b from-lime-200 to-teal-100 flex items-center justify-center">
        <div className="text-center px-4 max-w-md">
          <div className="text-6xl mb-6">😵</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Something went wrong
          </h1>
          <p className="text-red-600 font-medium mb-4">
            An unexpected error occurred. Please try refreshing the page.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-orange-500 text-white py-2 px-6 rounded-full text-sm font-medium hover:bg-orange-600 transition-colors"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }
};

const JoinMomentBoard: React.FC = () => {
  return (
    <JoinMomentBoardErrorBoundary>
      <JoinMomentBoardContent />
    </JoinMomentBoardErrorBoundary>
  );
};

export default JoinMomentBoard;
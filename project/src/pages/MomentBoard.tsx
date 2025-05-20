import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, MoreVertical, Trash2, Edit, LogOut } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { format, parseISO } from 'date-fns';
import { useAuth } from '../context/AuthContext';
import PhotoCard from '../components/PhotoCard';
import TextCard from '../components/TextCard';
import MomentCardViewer from '../components/MomentCardViewer';
import ConfirmDialog from '../components/ConfirmDialog';

type MomentBoardData = {
  board: {
    id: string;
    title: string | null;
    description: string | null;
    date_start: string;
    date_end: string | null;
    created_by: string;
    owner_display_name: string;
    role: 'owner' | 'participant';
    participant_count: number;
    card_count: number;
  };
  cards: Array<{
    id: string;
    moment_board_id: string;
    media_url: string | null;
    optimized_url: string | null;
    uploaded_by: string;
    created_at: string;
    type: 'photo' | 'text';
    uploader_initial: string;
    is_favorited: boolean;
    is_own_card: boolean;
    uploader_display_name: string;
  }>;
};

const MomentBoard: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<MomentBoardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCardIndex, setSelectedCardIndex] = useState<number | null>(null);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    const fetchBoardData = async () => {
      if (!id) return;

      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) {
          throw new Error('No session');
        }

        const response = await fetch('https://ekwpzlzdjbfzjdtdfafk.supabase.co/functions/v1/get-moment-board-data', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ moment_board_id: id })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch board data');
        }

        const responseData = await response.json();
        setData(responseData);
      } catch (err) {
        console.error('Error fetching board:', err);
        setError(err instanceof Error ? err.message : 'Failed to load board');
      } finally {
        setLoading(false);
      }
    };

    fetchBoardData();
  }, [id]);

  const formatDate = (date: string) => {
    return format(parseISO(date), 'MMMM d, yyyy');
  };

  const handleFavorite = async (cardId: string) => {
    if (!data || !user) {
      console.error('No data or user available:', { data: !!data, user: !!user });
      return;
    }

    try {
      const card = data.cards.find(c => c.id === cardId);
      if (!card) {
        console.error('Card not found:', cardId);
        return;
      }

      let result;
      if (card.is_favorited) {
        // Remove from favorites
        result = await supabase
          .from('favorites')
          .delete()
          .match({
            user_id: user.id,
            moment_card_id: cardId
          });
      } else {
        // Add to favorites
        result = await supabase
          .from('favorites')
          .insert({
            user_id: user.id,
            moment_card_id: cardId
          });
      }

      if (result.error) {
        console.error('Supabase operation failed:', result.error);
        throw result.error;
      }

      // Update local state
      setData(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          cards: prev.cards.map(c => 
            c.id === cardId 
              ? { ...c, is_favorited: !c.is_favorited }
              : c
          )
        };
      });
    } catch (err) {
      console.error('Error in handleFavorite:', err);
    }
  };

  const handleDelete = async (cardId: string) => {
    // TODO: Implement delete functionality
    console.log('Delete card:', cardId);
  };

  const handleDeleteMoment = async () => {
    if (!id) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('No session');
      }

      const response = await fetch('https://ekwpzlzdjbfzjdtdfafk.supabase.co/functions/v1/delete-moment-board', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ moment_board_id: id })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        if (errorData?.error) {
          throw new Error(errorData.error);
        } else if (response.status === 403) {
          throw new Error('You do not have permission to delete this moment board');
        } else if (response.status === 404) {
          throw new Error('Moment board not found');
        } else {
          throw new Error('Failed to delete moment board');
        }
      }

      // Close dialogs and navigate back to timeline
      setShowDeleteConfirm(false);
      setIsBottomSheetOpen(false);
      navigate('/timeline');
    } catch (err) {
      console.error('Error deleting moment board:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete moment board');
      setShowDeleteConfirm(false); // Close the confirm dialog on error
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-teal"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="p-6">
          <Link to="/timeline" className="inline-block text-gray-900 hover:text-gray-700 transition-colors">
            <ArrowLeft size={32} />
          </Link>
        </div>
        <div className="px-6">
          <p className="text-red-500">{error || 'Board not found'}</p>
        </div>
      </div>
    );
  }

  const { board, cards } = data;
  const displayedCards = showFavoritesOnly ? cards.filter(card => card.is_favorited) : cards;

  return (
    <div className="min-h-screen bg-gray-100 relative">
      <div className="p-6 flex justify-between items-center">
        <Link to="/timeline" className="text-gray-900 hover:text-gray-700 transition-colors">
          <ArrowLeft size={32} />
        </Link>
        <button 
          onClick={() => setIsBottomSheetOpen(true)}
          className="text-gray-900 hover:text-gray-700 transition-colors p-2 rounded-full hover:bg-gray-200"
        >
          <MoreVertical size={24} />
        </button>
      </div>

      <div className="px-6">
        <h1 className="text-3xl font-bold text-gray-900">
          {board.title || formatDate(board.date_start)}
        </h1>
        
        {board.title && (
          <p className="text-gray-500 mt-2 text-lg">
            {formatDate(board.date_start)}
            {board.date_end && ` - ${formatDate(board.date_end)}`}
          </p>
        )}

        {board.description && (
          <p className="text-gray-600 mt-4">
            {board.description}
          </p>
        )}

        <p className="text-gray-500 mt-6 text-sm">
          {board.role === 'owner' 
            ? "Created by you"
            : `Created by ${board.owner_display_name}`
          }
        </p>

        {/* View toggle */}
        <div className="mt-8 flex justify-center">
          <div className="inline-flex rounded-lg border border-gray-200 bg-white p-1">
            <button
              onClick={() => setShowFavoritesOnly(false)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                !showFavoritesOnly
                  ? 'bg-teal-500 text-white'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              All cards
            </button>
            <button
              onClick={() => setShowFavoritesOnly(true)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                showFavoritesOnly
                  ? 'bg-teal-500 text-white'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Favorites
            </button>
          </div>
        </div>

        {/* Grid of cards */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-6">
          {displayedCards.map((card, index) => (
            card.type === 'photo' ? (
              <PhotoCard
                key={card.id}
                card={card}
                onFavorite={handleFavorite}
                onClick={() => setSelectedCardIndex(index)}
                canDelete={board.role === 'owner' || card.is_own_card}
                onDelete={handleDelete}
              />
            ) : (
              <TextCard
                key={card.id}
                card={card}
                onFavorite={handleFavorite}
                onClick={() => setSelectedCardIndex(index)}
                canDelete={board.role === 'owner' || card.is_own_card}
                onDelete={handleDelete}
              />
            )
          ))}
        </div>
      </div>

      {/* Card viewer modal */}
      {selectedCardIndex !== null && (
        <MomentCardViewer
          cards={displayedCards}
          currentCardIndex={selectedCardIndex}
          onClose={() => setSelectedCardIndex(null)}
          onNext={() => setSelectedCardIndex(prev => Math.min((prev || 0) + 1, displayedCards.length - 1))}
          onPrevious={() => setSelectedCardIndex(prev => Math.max((prev || 0) - 1, 0))}
          onFavorite={handleFavorite}
          canDelete={board.role === 'owner' || displayedCards[selectedCardIndex].is_own_card}
          onDelete={handleDelete}
        />
      )}

      {/* Bottom Sheet */}
      {isBottomSheetOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setIsBottomSheetOpen(false)}
          />
          
          {/* Bottom Sheet Content */}
          <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-xl p-4 z-50 animate-slide-up">
            <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4" />
            
            <div className="space-y-4">
              {board.role === 'owner' ? (
                <>
                  <button 
                    onClick={() => setShowDeleteConfirm(true)}
                    className="w-full flex items-center gap-3 p-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={20} />
                    <span>Delete Moment</span>
                  </button>
                  <button 
                    onClick={() => console.log('Edit Moment')}
                    className="w-full flex items-center gap-3 p-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Edit size={20} />
                    <span>Edit Moment</span>
                  </button>
                </>
              ) : (
                <button 
                  onClick={() => console.log('Leave Moment')}
                  className="w-full flex items-center gap-3 p-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <LogOut size={20} />
                  <span>Leave Moment</span>
                </button>
              )}
            </div>
          </div>
        </>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Delete Moment"
        message="Are you sure you want to delete this moment? This action cannot be undone and will remove all associated cards and comments."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={handleDeleteMoment}
        onCancel={() => setShowDeleteConfirm(false)}
        isDestructive={true}
      />
    </div>
  );
};

export default MomentBoard;
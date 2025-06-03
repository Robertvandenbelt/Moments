import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, MoreVertical, Trash2, Edit, LogOut, Plus, Camera, Type, Share2, Download, Heart } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { format, parseISO } from 'date-fns';
import { useAuth } from '../context/AuthContext';
import PhotoCard from '../components/PhotoCard';
import TextCard from '../components/TextCard';
import MomentCardViewer from '../components/MomentCardViewer';
import ConfirmDialog from '../components/ConfirmDialog';
import PhotoUploadSheet from '../components/PhotoUploadSheet';
import TextUploadSheet from '../components/TextUploadSheet';
import DeleteConfirmationDialog from '../components/DeleteConfirmationDialog';
import { addTextCard, deleteMomentCard } from '../services/momentCard';
import JSZip from 'jszip';
import { MomentCard } from '../lib/types';

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
    description: string | null;
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
  const [momentCards, setMomentCards] = useState<MomentCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCardIndex, setSelectedCardIndex] = useState<number | null>(null);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isFabMenuOpen, setIsFabMenuOpen] = useState(false);
  const [showPhotoUpload, setShowPhotoUpload] = useState(false);
  const [showTextUpload, setShowTextUpload] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [cardToDelete, setCardToDelete] = useState<string | null>(null);

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
        setMomentCards(responseData.cards);
      } catch (err) {
        console.error('Error fetching board:', err);
        setError(err instanceof Error ? err.message : 'Failed to load board');
      } finally {
        setLoading(false);
      }
    };

    fetchBoardData();
  }, [id]);

  useEffect(() => {
    const updateViewTimestamp = async () => {
      if (!id || !user) return;

      try {
        const { error } = await supabase
          .from('moment_views')
          .upsert({
            user_id: user.id,
            moment_board_id: id,
            last_viewed: new Date().toISOString()
          });

        if (error) {
          console.error('Error updating view timestamp:', error);
        }
      } catch (err) {
        console.error('Failed to update view timestamp:', err);
      }
    };

    // Set a delay of 3 seconds before updating the view timestamp
    const timer = setTimeout(() => {
      updateViewTimestamp();
    }, 3000);

    // Cleanup the timer if component unmounts before the delay
    return () => clearTimeout(timer);
  }, [id, user]);

  const displayedCards = useMemo(() => {
    return showFavoritesOnly ? momentCards.filter((card) => card.is_favorited) : momentCards;
  }, [momentCards, showFavoritesOnly]);

  useEffect(() => {
    if (selectedCardIndex !== null) {
      if (displayedCards.length === 0) {
        setSelectedCardIndex(null); // Close viewer if no cards left
      } else if (selectedCardIndex >= displayedCards.length) {
        setSelectedCardIndex(displayedCards.length - 1); // Go to previous card if last was removed
      } else if (selectedCardIndex < 0) {
        setSelectedCardIndex(0); // Go to first card if index is negative
      }
    }
  }, [displayedCards, selectedCardIndex]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-teal-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-teal"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-teal-50">
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

  const { board } = data;

  const formatDate = (date: string) => {
    return format(parseISO(date), 'MMMM d, yyyy');
  };

  const handleFavorite = async (cardId: string) => {
    if (!data || !user) {
      console.error('No data or user available:', { data: !!data, user: !!user });
      return;
    }

    const card = data.cards.find(c => c.id === cardId);
    if (!card) {
      console.error('Card not found:', cardId);
      return;
    }

    // Optimistically update both UI states
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

    setMomentCards(prev => 
      prev.map(c => 
        c.id === cardId 
          ? { ...c, is_favorited: !c.is_favorited }
          : c
      )
    );

    try {
      let result;
      if (!card.is_favorited) { // Note: we use the original state here
        // Add to favorites
        result = await supabase
          .from('favorites')
          .insert({
            user_id: user.id,
            moment_card_id: cardId
          });
      } else {
        // Remove from favorites
        result = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('moment_card_id', cardId);
      }

      if (result.error) {
        console.error('Supabase operation failed:', result.error);
        // Revert both UI states on error
        setData(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            cards: prev.cards.map(c => 
              c.id === cardId 
                ? { ...c, is_favorited: card.is_favorited }
                : c
            )
          };
        });

        setMomentCards(prev => 
          prev.map(c => 
            c.id === cardId 
              ? { ...c, is_favorited: card.is_favorited }
              : c
          )
        );
        
        throw result.error;
      }
    } catch (err) {
      console.error('Error in handleFavorite:', err);
    }
  };

  const handleDeleteClick = async (cardId: string): Promise<void> => {
    setCardToDelete(cardId);
    // Return a resolved promise since this is an async function
    return Promise.resolve();
  };

  const handleDelete = async (cardId: string) => {
    try {
      await deleteMomentCard(cardId);
      
      // Update local state to remove the deleted card
      setData(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          cards: prev.cards.filter(c => c.id !== cardId)
        };
      });

      // If we're in the card viewer, close it if this was the last card
      if (selectedCardIndex !== null) {
        const newCards = data?.cards.filter(c => c.id !== cardId) ?? [];
        if (newCards.length === 0) {
          setSelectedCardIndex(null);
        }
      }
    } catch (err) {
      console.error('Error deleting card:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete card');
    } finally {
      setCardToDelete(null); // Clear the cardToDelete state
    }
  };

  const handleDeleteMoment = async () => {
    if (!id) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('No session');
      }

      console.log('Sending delete request for moment board:', id);
      const response = await fetch('https://ekwpzlzdjbfzjdtdfafk.supabase.co/functions/v1/delete-moment-board', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ moment_board_id: id })
      });

      console.log('Delete response status:', response.status);
      const responseData = await response.json().catch(() => null);
      console.log('Delete response data:', responseData);

      if (!response.ok) {
        if (responseData?.error) {
          throw new Error(responseData.error);
        } else if (response.status === 403) {
          throw new Error('You do not have permission to delete this moment board');
        } else if (response.status === 404) {
          throw new Error('Moment board not found');
        } else {
          throw new Error(`Failed to delete moment board: ${response.status} ${response.statusText}`);
        }
      }

      // Verify the deletion was successful
      if (responseData.deleted_cards === 0) {
        // Double check if the board still exists
        const { data: { session: checkSession } } = await supabase.auth.getSession();
        if (!checkSession?.access_token) {
          throw new Error('No session for verification');
        }

        const verifyResponse = await fetch('https://ekwpzlzdjbfzjdtdfafk.supabase.co/functions/v1/get-moment-board-data', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${checkSession.access_token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ moment_board_id: id })
        });

        if (verifyResponse.ok) {
          throw new Error('Moment board still exists after deletion attempt');
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

  const handlePhotoUploadSuccess = (newCard: MomentCard) => {
    setMomentCards(prev => [newCard, ...prev]);
  };

  const handleTextCardCreate = async (text: string) => {
    if (!id || !data) return;
    setIsSubmitting(true);

    try {
      const newCard = await addTextCard(id, text);
      
      // Update the local state with the new card
      setData(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          cards: [...prev.cards, newCard]
        };
      });

      // Close the text upload sheet
      setShowTextUpload(false);
    } catch (err) {
      console.error('Error creating text card:', err);
      setError(err instanceof Error ? err.message : 'Failed to create text card');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadFavorites = async () => {
    if (!data) return;

    try {
      setIsDownloading(true);
      // Create a new ZIP file
      const zip = new JSZip();
      const favoritePhotos = data.cards.filter(card => card.is_favorited && card.type === 'photo');

      // Download each photo and add it to the ZIP
      await Promise.all(favoritePhotos.map(async (card) => {
        if (!card.media_url) return;

        try {
          const filename = card.media_url.split('/').pop();
          if (!filename) return;

          const response = await fetch(card.media_url);
          const blob = await response.blob();
          zip.file(filename, blob);
        } catch (error) {
          console.error(`Failed to download photo: ${card.media_url}`, error);
        }
      }));

      // Generate the ZIP file
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      
      // Create a download link and trigger the download
      const url = window.URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `favorites-${data.board.title || data.board.id}.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Error downloading favorites:', err);
      // You might want to show an error message to the user here
    } finally {
      setIsDownloading(false);
    }
  };

  const handleLeaveMoment = async () => {
    if (!id) return;

    try {
      // Add this line to debug the environment variable
      console.log('Anon key available:', !!import.meta.env.VITE_SUPABASE_ANON_KEY);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('No session');
      }

      const response = await fetch('https://ekwpzlzdjbfzjdtdfafk.supabase.co/functions/v1/leave-moment-board', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY
        },
        body: JSON.stringify({ moment_board_id: id })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        if (errorData?.error) {
          throw new Error(errorData.error);
        } else if (response.status === 403) {
          throw new Error('You do not have permission to leave this moment board');
        } else if (response.status === 404) {
          throw new Error('Moment board not found');
        } else {
          throw new Error('Failed to leave moment board');
        }
      }

      // Close dialogs and navigate back to timeline
      setShowLeaveConfirm(false);
      setIsBottomSheetOpen(false);
      navigate('/timeline');
    } catch (err) {
      console.error('Error leaving moment board:', err);
      setError(err instanceof Error ? err.message : 'Failed to leave moment board');
      setShowLeaveConfirm(false); // Close the confirm dialog on error
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-teal-50 relative">
      <div className="container mx-auto px-4 pt-6">
        {/* Board Info Card */}
        <article className="bg-white rounded-xl shadow-sm ring-1 ring-black/5 overflow-hidden">
          {/* Card Header */}
          <div className="p-4 flex justify-between items-center">
            <Link 
              to="/timeline" 
              className="text-gray-900 hover:text-gray-700 transition-colors rounded-full p-2 hover:bg-gray-50"
            >
              <ArrowLeft size={24} />
            </Link>
            <button 
              onClick={() => setIsBottomSheetOpen(true)}
              className="text-gray-900 hover:text-gray-700 transition-colors p-2 rounded-full hover:bg-gray-50"
            >
              <MoreVertical size={24} />
            </button>
          </div>

          {/* Card Content */}
          <div className="px-6">
            <div className="space-y-4 pb-4">
              {/* Title & Date Section */}
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">
                  {board.title || formatDate(board.date_start)}
                </h1>
                {board.title && (
                  <p className="text-gray-600 text-sm mt-1">
                    {formatDate(board.date_start)}
                    {board.date_end && ` - ${formatDate(board.date_end)}`}
                  </p>
                )}
              </div>

              {/* Description Section - if exists */}
              {board.description && (
                <p className="text-gray-600 text-base">
                  {board.description}
                </p>
              )}
            </div>

            {/* Stats & Creator Info */}
            <div className="p-4 sm:p-6 bg-gray-50 -mx-6 border-t border-gray-100">
              <div className="flex justify-between items-center">
                <p className="text-gray-400 text-xs sm:text-sm">
                  {board.role === 'owner' 
                    ? "Created by you"
                    : `Created by ${board.owner_display_name}`
                  }
                </p>
                <span className="text-orange-600 text-sm">
                  {board.card_count} {board.card_count === 1 ? 'card' : 'cards'}
                </span>
              </div>
            </div>
          </div>
        </article>

        {/* View toggle */}
        <div className="mt-8 flex justify-center">
          <div className="inline-flex rounded-lg border border-gray-200 bg-white p-1 shadow-sm">
            <button
              onClick={() => setShowFavoritesOnly(false)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                !showFavoritesOnly
                  ? 'bg-orange-500 text-white'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              All cards
            </button>
            <button
              onClick={() => setShowFavoritesOnly(true)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                showFavoritesOnly
                  ? 'bg-orange-500 text-white'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Favorites
            </button>
          </div>
        </div>

        {/* Grid of cards */}
        <div className="pt-8 pb-24">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedCards.map((card, index) => (
              <article 
                key={card.id}
                onClick={() => setSelectedCardIndex(index)}
                className="bg-white rounded-xl w-full shadow-sm ring-1 ring-black/5 overflow-hidden hover:shadow-xl transition duration-300 cursor-pointer group"
              >
                {card.type === 'photo' ? (
                  <>
                    <div className="aspect-square bg-gray-100">
                      <img
                        src={card.media_url ? `${card.media_url}?width=500&height=500&resize=cover&quality=80` : ''}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="aspect-square bg-gradient-to-br from-teal-500 to-lime-300 p-6 flex items-center justify-center">
                      <p className="text-white text-lg font-medium line-clamp-6 text-center">
                        {card.description}
                      </p>
                    </div>
                  </>
                )}
                <div className="p-4 sm:p-6 bg-white border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{card.uploader_display_name}</p>
                      <p className="text-xs text-gray-500">
                        {format(parseISO(card.created_at), 'MMM d, yyyy')}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleFavorite(card.id);
                      }}
                      className={`p-1.5 rounded-full hover:bg-gray-100 transition-colors ${
                        card.is_favorited ? 'text-orange-500' : 'text-gray-400 hover:text-gray-600'
                      }`}
                    >
                      <Heart 
                        size={18} 
                        className={card.is_favorited ? 'fill-current' : ''} 
                      />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>

      {/* Card viewer */}
      {selectedCardIndex !== null && (
        <MomentCardViewer
          card={displayedCards[selectedCardIndex]}
          onClose={() => setSelectedCardIndex(null)}
          onPrevious={() => setSelectedCardIndex(prev => prev !== null ? Math.max(0, prev - 1) : null)}
          onNext={() => setSelectedCardIndex(prev => prev !== null ? Math.min(displayedCards.length - 1, prev + 1) : null)}
          hasPrevious={selectedCardIndex > 0}
          hasNext={selectedCardIndex < displayedCards.length - 1}
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
                    onClick={() => {
                      setIsBottomSheetOpen(false);
                      navigate(`/edit/${id}`);
                    }}
                    className="w-full flex items-center gap-3 p-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Edit size={20} />
                    <span>Edit Moment</span>
                  </button>
                </>
              ) : (
                <button 
                  onClick={() => setShowLeaveConfirm(true)}
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

      {/* Leave Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showLeaveConfirm}
        title="Leave Moment"
        message="Are you sure you want to leave this moment? You will no longer have access to view or add content."
        confirmLabel="Leave"
        cancelLabel="Cancel"
        onConfirm={handleLeaveMoment}
        onCancel={() => setShowLeaveConfirm(false)}
        isDestructive={true}
      />

      {/* FAB and Menu */}
      <div className="fixed bottom-6 right-6">
        {/* FAB Menu */}
        {isFabMenuOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-black/20 z-40"
              onClick={() => setIsFabMenuOpen(false)}
            />
            
            <div className="absolute bottom-[4.5rem] right-[0.375rem] z-50 flex flex-col gap-2 animate-slide-up">
              {/* Add Photo Card */}
              <button
                onClick={() => {
                  setIsFabMenuOpen(false);
                  setShowPhotoUpload(true);
                }}
                className="w-12 h-12 bg-white rounded-full shadow-card hover:bg-gray-50 transition-colors flex items-center justify-center"
              >
                <Camera size={24} className="text-teal-500" />
              </button>

              {/* Add Text Card */}
              <button
                onClick={() => {
                  setIsFabMenuOpen(false);
                  setShowTextUpload(true);
                }}
                className="w-12 h-12 bg-white rounded-full shadow-card hover:bg-gray-50 transition-colors flex items-center justify-center"
              >
                <Type size={24} className="text-teal-500" />
              </button>

              {/* Share Board - Only for owners */}
              {board.role === 'owner' && (
                <button
                  onClick={() => {
                    setIsFabMenuOpen(false);
                    navigate(`/share/${id}`);
                  }}
                  className="w-12 h-12 bg-white rounded-full shadow-card hover:bg-gray-50 transition-colors flex items-center justify-center"
                >
                  <Share2 size={24} className="text-teal-500" />
                </button>
              )}
            </div>
          </>
        )}

        {/* Download FAB - only visible when showing favorites */}
        {showFavoritesOnly && displayedCards.length > 0 && (
          <div className="absolute right-[4.5rem] bottom-0 animate-slide-left">
            <button 
              onClick={() => handleDownloadFavorites()}
              disabled={isDownloading}
              className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-white transition-colors ${
                isDownloading 
                  ? 'bg-orange-400 cursor-not-allowed' 
                  : 'bg-orange-500 hover:bg-orange-600'
              }`}
              aria-label={isDownloading ? "Downloading favorites..." : "Download favorites"}
            >
              {isDownloading ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Download size={28} />
              )}
            </button>
          </div>
        )}

        {/* Add Content FAB */}
        <button 
          onClick={() => setIsFabMenuOpen(!isFabMenuOpen)}
          className="fab z-50"
          aria-label="Add content"
        >
          <Plus size={28} className={`transition-transform ${isFabMenuOpen ? 'rotate-45' : ''}`} />
        </button>
      </div>

      {/* Photo Upload Sheet */}
      {showPhotoUpload && id && (
        <PhotoUploadSheet
          momentBoardId={id}
          onClose={() => setShowPhotoUpload(false)}
          onSuccess={(newCard) => {
            handlePhotoUploadSuccess(newCard);
            setShowPhotoUpload(false);
          }}
        />
      )}

      {/* Text Upload Sheet */}
      {showTextUpload && (
        <TextUploadSheet
          onClose={() => setShowTextUpload(false)}
          onSubmit={handleTextCardCreate}
          isSubmitting={isSubmitting}
        />
      )}

      {/* Delete confirmation dialog */}
      <DeleteConfirmationDialog
        isOpen={cardToDelete !== null}
        onConfirm={() => cardToDelete && handleDelete(cardToDelete)}
        onCancel={() => setCardToDelete(null)}
      />
    </div>
  );
};

export default MomentBoard;
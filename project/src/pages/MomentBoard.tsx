import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, MoreVertical, Trash2, Edit, LogOut, Plus, Camera, Type, Share2, Download, Heart } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { format } from 'date-fns';
import { parseISO } from 'date-fns/parseISO';
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
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(true);
  const [showOnlyMyCards, setShowOnlyMyCards] = useState(false);
  const [showOnlyOthersCards, setShowOnlyOthersCards] = useState(false);
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDownloadConfirm, setShowDownloadConfirm] = useState(false);
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
    let filteredCards = showFavoritesOnly ? momentCards.filter((card) => card.is_favorited) : momentCards;
    
    if (!showFavoritesOnly) {
      if (showOnlyMyCards) {
        filteredCards = filteredCards.filter(card => card.is_own_card);
      } else if (showOnlyOthersCards) {
        filteredCards = filteredCards.filter(card => !card.is_own_card);
      }
    }
    
    return filteredCards;
  }, [momentCards, showFavoritesOnly, showOnlyMyCards, showOnlyOthersCards]);

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
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="relative w-12 h-12">
          {/* Track */}
          <div className="absolute inset-0 rounded-full border-4 border-surface-container-highest" />
          {/* Progress */}
          <div className="absolute inset-0 rounded-full border-4 border-primary animate-spin" 
            style={{
              borderRightColor: 'transparent',
              borderTopColor: 'transparent'
            }}
          />
        </div>
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
      {/* Top app bar with navigation */}
      <div className="sticky top-0 z-20 bg-surface/95 backdrop-blur-xl border-b border-outline-variant">
        <div className="px-6 h-20 flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <Link 
              to="/timeline" 
              className="relative p-4 rounded-full hover:bg-surface-container-highest transition-colors"
            >
              <div className="absolute inset-0 rounded-full bg-on-surface opacity-0 hover:opacity-[0.08] active:opacity-[0.12] transition-opacity duration-300" />
              <span 
                className="material-symbols-outlined text-on-surface"
                style={{ 
                  fontSize: '24px',
                  fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' -25, 'opsz' 24"
                }}
              >
                arrow_back
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            {/* Share button for owners */}
            {board.role === 'owner' && (
              <button
                onClick={() => navigate(`/share/${id}`)}
                className="relative p-4 rounded-full hover:bg-surface-container-highest transition-colors"
                aria-label="Share moment"
              >
                <div className="absolute inset-0 rounded-full bg-on-surface opacity-0 hover:opacity-[0.08] active:opacity-[0.12] transition-opacity duration-300" />
                <span
                  className="material-symbols-outlined text-on-surface"
                  style={{
                    fontSize: '24px',
                    fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' -25, 'opsz' 24"
                  }}
                >
                  share
                </span>
              </button>
            )}
            <button 
              onClick={() => setIsBottomSheetOpen(true)}
              className="relative p-4 rounded-full hover:bg-surface-container-highest transition-colors"
            >
              <div className="absolute inset-0 rounded-full bg-on-surface opacity-0 hover:opacity-[0.08] active:opacity-[0.12] transition-opacity duration-300" />
              <span 
                className="material-symbols-outlined text-on-surface"
                style={{ 
                  fontSize: '24px',
                  fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' -25, 'opsz' 24"
                }}
              >
                more_vert
              </span>
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 pt-8">
        {/* Page header */}
        <div className="max-w-7xl mx-auto mb-12">
          <div className="space-y-6">
            {/* Title & Date Section */}
            <div>
              <h1 className="text-display-small font-roboto-flex text-on-surface mb-2">
                {board.title || formatDate(board.date_start)}
              </h1>
              {board.title && (
                <p className="text-title-large font-roboto-flex text-on-surface-variant">
                  {formatDate(board.date_start)}
                  {board.date_end && ` - ${formatDate(board.date_end)}`}
                </p>
              )}
            </div>

            {/* Description Section - if exists */}
            {board.description && (
              <p className="text-body-large font-roboto-flex text-on-surface-variant max-w-2xl">
                {board.description}
              </p>
            )}

            {/* Creator Info Chip */}
            <div className="flex items-center gap-2 pt-2">
              <div className="inline-flex items-center h-8 px-3 rounded-lg" style={{ backgroundColor: '#DCE9D7' }}>
                <span 
                  className="material-symbols-outlined text-on-surface-variant mr-2"
                  style={{ 
                    fontSize: '18px',
                    fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' -25, 'opsz' 24"
                  }}
                >
                  {board.role === 'owner' ? 'edit_square' : 'person'}
                </span>
                <span className="text-label-medium font-roboto-flex text-on-surface-variant">
                  {board.role === 'owner' 
                    ? "Created by you"
                    : `Created by ${board.owner_display_name}`
                  }
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Primary tabs */}
        <div className="mt-8">
          <div className="max-w-2xl mx-auto">
            {/* Primary tab bar */}
            <div className="flex items-center border-b border-outline-variant">
              <button
                onClick={() => {
                  setShowFavoritesOnly(true);
                  setShowOnlyMyCards(false);
                  setShowOnlyOthersCards(false);
                }}
                className={`group relative min-w-[100px] p-3 flex items-center gap-2 transition-colors ${
                  showFavoritesOnly ? 'text-primary' : 'text-on-surface-variant'
                }`}
              >
                {/* Icon */}
                <span 
                  className="material-symbols-outlined"
                  style={{ 
                    fontSize: '24px',
                    fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' -25, 'opsz' 24"
                  }}
                >
                  favorite
                </span>
                {/* Label */}
                <span className="text-label-large font-roboto-flex">Favorites</span>
                {/* Active indicator */}
                <div className={`absolute bottom-0 left-0 right-0 h-[3px] bg-primary transform transition-transform duration-200 ${
                  showFavoritesOnly ? 'scale-x-100' : 'scale-x-0'
                }`} />
                {/* State layer */}
                <div className="absolute inset-0 bg-on-surface opacity-0 group-hover:opacity-[0.08] group-active:opacity-[0.12] transition-opacity duration-200" />
              </button>

              <button
                onClick={() => {
                  setShowFavoritesOnly(false);
                  setShowOnlyMyCards(false);
                  setShowOnlyOthersCards(false);
                }}
                className={`group relative min-w-[100px] p-3 flex items-center gap-2 transition-colors ${
                  !showFavoritesOnly ? 'text-primary' : 'text-on-surface-variant'
                }`}
              >
                {/* Icon */}
                <span 
                  className="material-symbols-outlined"
                  style={{ 
                    fontSize: '24px',
                    fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' -25, 'opsz' 24"
                  }}
                >
                  grid_view
                </span>
                {/* Label */}
                <span className="text-label-large font-roboto-flex">All</span>
                {/* Active indicator */}
                <div className={`absolute bottom-0 left-0 right-0 h-[3px] bg-primary transform transition-transform duration-200 ${
                  !showFavoritesOnly ? 'scale-x-100' : 'scale-x-0'
                }`} />
                {/* State layer */}
                <div className="absolute inset-0 bg-on-surface opacity-0 group-hover:opacity-[0.08] group-active:opacity-[0.12] transition-opacity duration-200" />
              </button>
            </div>

            {/* Segmented buttons for All tab (M3 style, single-select) */}
            {!showFavoritesOnly && (
              <div className="inline-flex mt-4 shadow-sm">
                <button
                  onClick={() => {
                    setShowOnlyMyCards(false);
                    setShowOnlyOthersCards(false);
                  }}
                  className={`px-4 py-2 border border-outline-variant focus:z-10 focus:outline-none text-label-large font-roboto-flex
                    rounded-l-full
                    ${!showOnlyMyCards && !showOnlyOthersCards
                      ? 'bg-primary text-on-primary border-primary'
                      : 'bg-surface text-on-surface hover:bg-surface-container-highest'}
                  `}
                  aria-pressed={!showOnlyMyCards && !showOnlyOthersCards}
                >
                  All cards
                </button>
                <button
                  onClick={() => {
                    setShowOnlyMyCards(true);
                    setShowOnlyOthersCards(false);
                  }}
                  className={`px-4 py-2 border-t border-b border-outline-variant focus:z-10 focus:outline-none text-label-large font-roboto-flex
                    ${showOnlyMyCards
                      ? 'bg-primary text-on-primary border-primary'
                      : 'bg-surface text-on-surface hover:bg-surface-container-highest'}
                  `}
                  aria-pressed={showOnlyMyCards}
                >
                  Your cards
                </button>
                <button
                  onClick={() => {
                    setShowOnlyMyCards(false);
                    setShowOnlyOthersCards(true);
                  }}
                  className={`px-4 py-2 border border-outline-variant focus:z-10 focus:outline-none text-label-large font-roboto-flex
                    rounded-r-full
                    ${showOnlyOthersCards
                      ? 'bg-primary text-on-primary border-primary'
                      : 'bg-surface text-on-surface hover:bg-surface-container-highest'}
                  `}
                  aria-pressed={showOnlyOthersCards}
                >
                  Others cards
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Feed of cards */}
        <div className="pt-8 pb-24 px-4 sm:px-6">
          {/* Feed container with dynamic max-width based on viewport */}
          <div className="max-w-7xl mx-auto">
            {/* Feed header with content summary */}
            <div className="mb-8 flex items-center justify-between">
              <div>
                <p className="text-headline-small font-roboto-flex text-on-surface">
                  {displayedCards.length} {displayedCards.length === 1 ? 'card' : 'cards'}
                </p>
              </div>
              
              {/* Dynamic feed layout options - could be expanded later */}
              <div className="flex items-center gap-2">
                {showFavoritesOnly && displayedCards.length > 0 && (
                  <button
                    onClick={() => setShowDownloadConfirm(true)}
                    disabled={isDownloading}
                    className="relative p-2.5 rounded-full hover:bg-surface-container-highest transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label={isDownloading ? "Downloading favorites..." : "Download favorites"}
                  >
                    {/* State layer */}
                    <div className="absolute inset-0 rounded-full bg-on-surface opacity-0 hover:opacity-[0.08] active:opacity-[0.12] transition-opacity duration-200" />
                    
                    {/* Icon */}
                    <span 
                      className="material-symbols-outlined text-on-surface-variant relative"
                      style={{ 
                        fontSize: '24px',
                        fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' -25, 'opsz' 24"
                      }}
                    >
                      {isDownloading ? 'progress_activity' : 'download'}
                    </span>
                  </button>
                )}
                <button
                  className="relative p-2.5 rounded-full hover:bg-surface-container-highest transition-colors"
                  aria-label="View options"
                >
                  <div className="absolute inset-0 rounded-full bg-on-surface opacity-0 hover:opacity-[0.08] active:opacity-[0.12] transition-opacity duration-300" />
                  <span 
                    className="material-symbols-outlined text-on-surface-variant"
                    style={{ 
                      fontSize: '24px',
                      fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' -25, 'opsz' 24"
                    }}
                  >
                    tune
                  </span>
                </button>
              </div>
            </div>

            {/* Dynamic feed content */}
            {displayedCards.length === 0 ? (
              // Empty state
              <div className="py-12 flex flex-col items-center justify-center text-center bg-surface-container-low rounded-xl">
                <span 
                  className="material-symbols-outlined text-on-surface-variant mb-4"
                  style={{ 
                    fontSize: '48px',
                    fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' -25, 'opsz' 24"
                  }}
                >
                  {showFavoritesOnly ? 'favorite' : 'photo_library'}
                </span>
                <p className="text-title-large font-roboto-flex text-on-surface mb-2">
                  {showFavoritesOnly 
                    ? 'No favorite cards yet' 
                    : 'No cards added yet'
                  }
                </p>
                <p className="text-body-medium font-roboto-flex text-on-surface-variant max-w-sm">
                  {showFavoritesOnly
                    ? 'Cards you mark as favorites will appear here'
                    : 'Start adding photo or text cards to create your moment'
                  }
                </p>
              </div>
            ) : (
              // Responsive masonry grid
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {displayedCards.map((card, index) => {
                  // Determine if the card should span multiple columns
                  const isLargeCard = index % 5 === 0; // Every 5th card will be larger
                  
                  return (
                    <article 
                      key={card.id}
                      onClick={() => setSelectedCardIndex(index)}
                      className={`group relative bg-surface rounded-xl shadow-level1 hover:shadow-level2 active:shadow-level1 transition-all duration-300 cursor-pointer overflow-hidden ${
                        isLargeCard ? 'md:col-span-2 lg:col-span-2' : ''
                      }`}
                    >
                      {/* State layer for hover/press states */}
                      <div className="absolute inset-0 rounded-xl bg-on-surface opacity-0 group-hover:opacity-[0.08] group-active:opacity-[0.12] transition-opacity duration-300" />
                      
                      {card.type === 'photo' ? (
                        <div className={`${
                          isLargeCard ? 'aspect-[21/9]' : 'aspect-[16/9]'
                        } bg-surface-container-low`}>
                          <img
                            src={card.media_url ? `${card.media_url}?width=${isLargeCard ? 1200 : 800}&height=${isLargeCard ? 514 : 450}&resize=cover&quality=80` : ''}
                            alt=""
                            className="h-full w-full object-cover rounded-t-xl"
                            loading="lazy"
                          />
                        </div>
                      ) : (
                        <div className={`${
                          isLargeCard ? 'aspect-[21/9] p-12' : 'aspect-[16/9] p-8'
                        } bg-primary-container flex items-center justify-center rounded-t-xl`}>
                          <p className={`${
                            isLargeCard ? 'text-headline-medium' : 'text-headline-small'
                          } font-roboto-flex text-on-primary-container line-clamp-6 text-center`}>
                            {card.description}
                          </p>
                        </div>
                      )}

                      <div className="p-4 sm:p-6 bg-surface border-t border-outline-variant">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-title-medium font-roboto-flex text-on-surface">{card.uploader_display_name}</p>
                            <p className="text-body-medium font-roboto-flex text-on-surface-variant">
                              {format(parseISO(card.created_at), 'MMM d, yyyy')}
                            </p>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleFavorite(card.id);
                            }}
                            className="relative p-2.5 rounded-full hover:bg-surface-container-highest transition-colors"
                          >
                            <div className="absolute inset-0 rounded-full bg-on-surface opacity-0 hover:opacity-[0.08] active:opacity-[0.12] transition-opacity duration-300" />
                            <Heart 
                              size={20} 
                              className={`relative ${card.is_favorited ? 'text-primary-action fill-current' : 'text-on-surface-variant'}`}
                            />
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
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

      {/* Download Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDownloadConfirm}
        title="Download Favorites"
        message="This will download all your favorite cards in their original quality. Would you like to continue?"
        confirmLabel="Download"
        cancelLabel="Cancel"
        onConfirm={() => {
          setShowDownloadConfirm(false);
          handleDownloadFavorites();
        }}
        onCancel={() => setShowDownloadConfirm(false)}
      />

      {/* FAB and Menu */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
        {/* FAB Menu (expanded) */}
        {isFabMenuOpen && (
          <div className="flex flex-col items-end mb-4 space-y-3 animate-fade-in-up">
            {/* Add Photo Card */}
            <button
              onClick={() => {
                setIsFabMenuOpen(false);
                setShowPhotoUpload(true);
              }}
              className="w-14 h-14 flex items-center justify-center rounded-full shadow-lg" style={{ background: '#DCE9D7', color: '#234B1C' }}
              aria-label="PhotoCard"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 24 }}>photo_camera</span>
            </button>
            {/* Add Text Card */}
            <button
              onClick={() => {
                setIsFabMenuOpen(false);
                setShowTextUpload(true);
              }}
              className="w-14 h-14 flex items-center justify-center rounded-full shadow-lg" style={{ background: '#DCE9D7', color: '#234B1C' }}
              aria-label="TextCard"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 24 }}>edit</span>
            </button>
          </div>
        )}
        {/* Main FAB */}
        <button
          onClick={() => setIsFabMenuOpen(!isFabMenuOpen)}
          className="w-14 h-14 flex items-center justify-center rounded-full shadow-lg bg-[#E27D60] text-white transition-transform hover:bg-[#d96c4f] active:bg-[#c85d41] z-50"
          aria-label="Add content"
        >
          <span
            className={`material-symbols-outlined transition-transform duration-200 ${isFabMenuOpen ? 'rotate-45' : ''}`}
            style={{ fontSize: 28 }}
          >
            add
          </span>
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
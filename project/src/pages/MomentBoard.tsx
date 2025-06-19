import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2, Edit, LogOut, Heart, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { format } from 'date-fns';
import { parseISO } from 'date-fns/parseISO';
import { useAuth } from '../context/AuthContext';
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
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [showOnlyMyCards, setShowOnlyMyCards] = useState(false);
  const [showOnlyOthersCards, setShowOnlyOthersCards] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDownloadConfirm, setShowDownloadConfirm] = useState(false);
  const [isFabMenuOpen, setIsFabMenuOpen] = useState(false);
  const [showPhotoUpload, setShowPhotoUpload] = useState(false);
  const [showTextUpload, setShowTextUpload] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [cardToDelete, setCardToDelete] = useState<string | null>(null);
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [showInfoTooltip, setShowInfoTooltip] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const cardContainerRef = useRef<HTMLDivElement>(null);

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

  // Swipe handling functions
  const minSwipeDistance = 50;

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  }, []);

  const onTouchEnd = useCallback(() => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && currentCardIndex < displayedCards.length - 1) {
      setSwipeDirection('left');
      setTimeout(() => {
        setCurrentCardIndex(prev => prev + 1);
        setSwipeDirection(null);
      }, 150);
    } else if (isRightSwipe && currentCardIndex > 0) {
      setSwipeDirection('right');
      setTimeout(() => {
        setCurrentCardIndex(prev => prev - 1);
        setSwipeDirection(null);
      }, 150);
    }
  }, [touchStart, touchEnd, currentCardIndex, displayedCards.length]);

  const goToNextCard = useCallback(() => {
    if (currentCardIndex < displayedCards.length - 1) {
      setSwipeDirection('left');
      setTimeout(() => {
        setCurrentCardIndex(prev => prev + 1);
        setSwipeDirection(null);
      }, 150);
    }
  }, [currentCardIndex, displayedCards.length]);

  const goToPreviousCard = useCallback(() => {
    if (currentCardIndex > 0) {
      setSwipeDirection('right');
      setTimeout(() => {
        setCurrentCardIndex(prev => prev - 1);
        setSwipeDirection(null);
      }, 150);
    }
  }, [currentCardIndex]);

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
      setIsMenuOpen(false);
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
      setIsMenuOpen(false);
      navigate('/timeline');
    } catch (err) {
      console.error('Error leaving moment board:', err);
      setError(err instanceof Error ? err.message : 'Failed to leave moment board');
      setShowLeaveConfirm(false); // Close the confirm dialog on error
    }
  };

  // Calculate counts for each filter state
  const allCount = momentCards.length;
  const yoursCount = momentCards.filter(card => card.is_own_card).length;
  const othersCount = momentCards.filter(card => !card.is_own_card).length;

  // In swipe view, use a safeCardIndex to avoid out-of-bounds errors
  const safeCardIndex = Math.max(0, Math.min(currentCardIndex, displayedCards.length - 1));

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-teal-50 relative">
      {/* Top app bar with navigation */}
      <div className="sticky top-0 z-20 bg-surface-container-low backdrop-blur-xl border-b border-outline-variant">
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
            {/* Info icon with tooltip */}
            <div className="relative">
              <button
                className="relative p-4 rounded-full hover:bg-surface-container-highest transition-colors"
                aria-label="Show info"
                onClick={() => setShowInfoTooltip((v) => !v)}
                onBlur={() => setShowInfoTooltip(false)}
              >
                <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: 24 }}>info</span>
              </button>
              {showInfoTooltip && (
                <div 
                  className="absolute left-1/2 -translate-x-1/2 top-full mt-2 z-50"
                  style={{ filter: 'drop-shadow(0px 1px 2px rgba(0,0,0,0.3)) drop-shadow(0px 1px 3px rgba(0,0,0,0.15))' }}
                >
                  <div className="bg-surface-container-low rounded-lg py-2 px-3">
                    <div className="flex items-center gap-2 text-on-surface text-label-medium font-roboto-flex whitespace-nowrap">
                      <span 
                        className="material-symbols-outlined text-on-surface" 
                        style={{ 
                          fontSize: '18px',
                          fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' -25, 'opsz' 24"
                        }}
                      >
                        person
                      </span>
                      Created by {board.owner_display_name}
                    </div>
                  </div>
                </div>
              )}
            </div>
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
              ref={menuButtonRef}
              onClick={() => setIsMenuOpen((open) => !open)}
              className="relative p-4 rounded-full hover:bg-surface-container-highest transition-colors"
              aria-haspopup="menu"
              aria-expanded={isMenuOpen}
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
        {/* Primary tabs */}
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center justify-between">
            {/* Tab bar */}
            <div className="flex items-center border-b border-outline-variant flex-1">
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
                {/* Card count for All tab */}
                <span className="ml-2 text-label-medium font-roboto-flex bg-surface-container-highest text-on-surface rounded-full px-2 py-0.5 align-middle">
                  {momentCards.length}
                </span>
                {/* Active indicator */}
                <div className={`absolute bottom-0 left-0 right-0 h-[3px] bg-primary transform transition-transform duration-200 ${
                  !showFavoritesOnly ? 'scale-x-100' : 'scale-x-0'
                }`} />
                {/* State layer */}
                <div className="absolute inset-0 bg-on-surface opacity-0 group-hover:opacity-[0.08] group-active:opacity-[0.12] transition-opacity duration-200" />
              </button>

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
                {/* Card count indicator for Favorites tab */}
                <span className="ml-2 text-label-medium font-roboto-flex bg-primary-container text-on-primary-container rounded-full px-2 py-0.5 align-middle">
                  {momentCards.filter(card => card.is_favorited).length}
                </span>
                {/* Active indicator */}
                <div className={`absolute bottom-0 left-0 right-0 h-[3px] bg-primary transform transition-transform duration-200 ${
                  showFavoritesOnly ? 'scale-x-100' : 'scale-x-0'
                }`} />
                {/* State layer */}
                <div className="absolute inset-0 bg-on-surface opacity-0 group-hover:opacity-[0.08] group-active:opacity-[0.12] transition-opacity duration-200" />
              </button>
            </div>
            {/* View toggle and filter icons, smaller and closer */}
            <div className="flex items-center gap-1 ml-2">
              {!showFavoritesOnly && (
                <button
                  className="relative p-1.5 rounded-full hover:bg-surface-container-highest transition-colors"
                  aria-label="Filter cards"
                  onClick={() => setFilterModalOpen(true)}
                >
                  <span 
                    className="material-symbols-outlined text-on-surface-variant"
                    style={{ fontSize: '20px', fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' -25, 'opsz' 24" }}
                  >
                    tune
                  </span>
                </button>
              )}
              {showFavoritesOnly && displayedCards.length > 0 && (
                <button
                  onClick={() => setShowDownloadConfirm(true)}
                  disabled={isDownloading}
                  className="relative p-1.5 rounded-full hover:bg-surface-container-highest transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label={isDownloading ? "Downloading favorites..." : "Download favorites"}
                >
                  <span 
                    className="material-symbols-outlined text-on-surface-variant relative"
                    style={{ fontSize: '20px', fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' -25, 'opsz' 24" }}
                  >
                    {isDownloading ? 'progress_activity' : 'download'}
                  </span>
                </button>
              )}
            </div>
          </div>
          {/* Active filter chip */}
          {(!showFavoritesOnly && (showOnlyMyCards || showOnlyOthersCards)) && (
            <div className="mt-2 flex items-center gap-2">
              <div className="inline-flex items-center bg-secondary-container rounded-full pl-4 pr-2 py-1.5 shadow-level1">
                <span className="text-label-large font-roboto-flex text-on-secondary-container">
                  {showOnlyMyCards ? 'Your cards' : 'Others\' cards'}
                </span>
                <button
                  onClick={() => {
                    setShowOnlyMyCards(false);
                    setShowOnlyOthersCards(false);
                  }}
                  className="ml-1 p-1 rounded-full hover:bg-secondary/10 transition-colors flex items-center justify-center"
                  aria-label="Clear filter"
                >
                  <span 
                    className="material-symbols-outlined text-on-secondary-container" 
                    style={{ 
                      fontSize: '20px',
                      fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' -25, 'opsz' 24"
                    }}
                  >
                    close
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Feed of cards */}
        <div className="pt-8 pb-12 px-4 sm:px-6">
          {/* Feed container with dynamic max-width based on viewport */}
          <div className="max-w-7xl mx-auto">
            {/* Feed header with content summary and view toggle */}
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
              // Swipe view - single card with navigation
              <div className="relative w-full max-w-2xl mx-auto">
                {/* Card counter */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
                  <div className="bg-surface/80 backdrop-blur-sm rounded-full px-4 py-2 text-label-medium font-roboto-flex text-on-surface-variant">
                    {safeCardIndex + 1} of {displayedCards.length}
                  </div>
                </div>

                {/* Navigation arrows */}
                {safeCardIndex > 0 && (
                  <button
                    onClick={goToPreviousCard}
                    className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 flex items-center justify-center rounded-full bg-surface/80 backdrop-blur-sm text-on-surface hover:bg-surface/90 transition-colors"
                    aria-label="Previous card"
                  >
                    <ChevronLeft size={24} />
                  </button>
                )}

                {safeCardIndex < displayedCards.length - 1 && (
                  <button
                    onClick={goToNextCard}
                    className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 flex items-center justify-center rounded-full bg-surface/80 backdrop-blur-sm text-on-surface hover:bg-surface/90 transition-colors"
                    aria-label="Next card"
                  >
                    <ChevronRight size={24} />
                  </button>
                )}

                {/* Current card */}
                <div
                  ref={cardContainerRef}
                  className="relative w-full"
                  onTouchStart={onTouchStart}
                  onTouchMove={onTouchMove}
                  onTouchEnd={onTouchEnd}
                >
                  <article 
                    className={`group relative bg-surface-container rounded-xl transition-all duration-300 overflow-hidden w-full ${
                      swipeDirection === 'left' ? 'animate-slide-out-left' : 
                      swipeDirection === 'right' ? 'animate-slide-out-right' : ''
                    }`}
                  >
                    {(() => {
                      if (displayedCards.length === 0) return null;
                      const card = displayedCards[safeCardIndex];
                      return (
                        <>
                          {/* Photo or Text Card */}
                          {card.type === 'photo' ? (
                            <div className="relative w-full">
                              <img
                                src={
                                  (card.optimized_url || card.media_url)
                                    ? `${card.optimized_url || card.media_url}?width=800&quality=80`
                                    : ''
                                }
                                alt=""
                                className="w-full"
                                style={{ display: 'block', maxWidth: '100%' }}
                                loading="lazy"
                              />
                            </div>
                          ) : (
                            <div className="bg-primary-container flex items-center justify-center rounded-xl w-full min-h-[120px]">
                              <p className="text-headline-small font-roboto-flex text-on-primary-container line-clamp-6 text-center p-6">
                                {card.description}
                              </p>
                            </div>
                          )}
                          {/* Card footer: heart, date, uploader */}
                          <div className="flex items-center justify-between mt-2 px-2">
                            <button
                              onClick={e => { e.stopPropagation(); handleFavorite(card.id); }}
                              className="relative p-2.5 rounded-full hover:bg-surface-container-highest transition-colors"
                            >
                              <div className="absolute inset-0 rounded-full bg-on-surface opacity-0 hover:opacity-[0.08] active:opacity-[0.12] transition-opacity duration-300" />
                              <Heart 
                                size={20} 
                                className={`relative ${card.is_favorited ? 'text-primary-action fill-current' : 'text-on-surface-variant'}`}
                              />
                            </button>
                            <div className="text-label-small font-roboto-flex text-on-surface-variant">
                              {card.uploader_display_name}
                            </div>
                          </div>
                        </>
                      );
                    })()}
                  </article>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Title, Date & Description section below cards */}
        <div className="max-w-2xl mx-auto mb-8 px-4 sm:px-6">
          <div className="rounded-xl p-6 space-y-4">
            {/* Title & Date */}
            <div className="space-y-2">
              <h1 className="text-2xl sm:text-display-small font-roboto-flex text-on-surface">
                {board.title || formatDate(board.date_start)}
              </h1>
              {board.title && (
                <p className="text-sm sm:text-title-large font-roboto-flex text-on-surface-variant">
                  {formatDate(board.date_start)}
                  {board.date_end && ` - ${formatDate(board.date_end)}`}
                </p>
              )}
            </div>
            
            {/* Description */}
            {board.description && (
              <div className="pt-2 border-t border-outline-variant">
                <p className="text-body-large font-roboto-flex text-on-surface-variant leading-relaxed">
                  {board.description}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* M3 Menu Popover */}
      {isMenuOpen && (
        <div
          className="fixed z-50"
          style={{
            top: menuButtonRef.current?.getBoundingClientRect?.().bottom ? menuButtonRef.current.getBoundingClientRect().bottom + 8 : 60,
            left: menuButtonRef.current?.getBoundingClientRect?.().right ? menuButtonRef.current.getBoundingClientRect().right - 200 : 'auto',
            minWidth: 200,
          }}
          role="menu"
          tabIndex={-1}
          onBlur={() => setIsMenuOpen(false)}
        >
          <div className="bg-surface rounded-xl shadow-xl border border-outline-variant py-2">
            {board.role === 'owner' ? (
              <>
                <button
                  onClick={() => { setShowDeleteConfirm(true); setIsMenuOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-left"
                  role="menuitem"
                >
                  <Trash2 size={20} />
                  <span>Delete Moment</span>
                </button>
                <button
                  onClick={() => { setIsMenuOpen(false); navigate(`/edit/${id}`); }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-on-surface hover:bg-surface-container-high rounded-lg transition-colors text-left"
                  role="menuitem"
                >
                  <Edit size={20} />
                  <span>Edit Moment</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => { setShowLeaveConfirm(true); setIsMenuOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-left"
                role="menuitem"
              >
                <LogOut size={20} />
                <span>Leave Moment</span>
              </button>
            )}
          </div>
        </div>
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
        {/* FAB Menu (expanded, M3 extended FAB style) */}
        {isFabMenuOpen && (
          <div className="flex flex-col items-end mb-4 space-y-3 animate-fade-in-up">
            {/* Add Photo Card (Extended FAB) */}
            <button
              onClick={() => {
                setIsFabMenuOpen(false);
                setShowPhotoUpload(true);
              }}
              className="flex items-center gap-3 h-14 px-6 rounded-full shadow-lg bg-primary-container text-primary font-roboto-flex text-label-large transition-colors hover:bg-primary-container/90 active:bg-primary-container/80"
              aria-label="PhotoCard"
            >
              <span className="material-symbols-outlined text-primary" style={{ fontSize: 24, fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' -25, 'opsz' 24" }}>photo_camera</span>
              Photo
            </button>
            {/* Add Text Card (Extended FAB) */}
            <button
              onClick={() => {
                setIsFabMenuOpen(false);
                setShowTextUpload(true);
              }}
              className="flex items-center gap-3 h-14 px-6 rounded-full shadow-lg bg-primary-container text-primary font-roboto-flex text-label-large transition-colors hover:bg-primary-container/90 active:bg-primary-container/80"
              aria-label="TextCard"
            >
              <span className="material-symbols-outlined text-primary" style={{ fontSize: 24, fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' -25, 'opsz' 24" }}>edit</span>
              Text
            </button>
          </div>
        )}
        {/* Main FAB */}
        <button
          onClick={() => setIsFabMenuOpen(!isFabMenuOpen)}
          className="w-14 h-14 flex items-center justify-center rounded-full shadow-lg bg-primary text-white transition-transform hover:bg-primary/90 active:bg-primary/80 z-50"
          aria-label="Add content"
        >
          <span
            className={`material-symbols-outlined transition-transform duration-200 ${isFabMenuOpen ? 'rotate-45' : ''}`}
            style={{ fontSize: 28, fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' -25, 'opsz' 24" }}
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

      {/* Filter Modal (M3 bottom sheet style) */}
      {filterModalOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/40 z-40"
            onClick={() => setFilterModalOpen(false)}
          />
          {/* Bottom Sheet */}
          <div className="fixed bottom-0 left-0 right-0 bg-surface rounded-t-2xl p-6 z-50 shadow-xl animate-slide-up border-t border-outline-variant">
            <h2 className="text-title-large font-roboto-flex text-on-surface mb-4">Filter cards</h2>
            <ul className="space-y-2">
              <li>
                <button
                  className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left ${!showOnlyMyCards && !showOnlyOthersCards ? 'bg-primary-container text-on-primary-container font-semibold' : 'hover:bg-surface-container-highest text-on-surface-variant'}`}
                  onClick={() => {
                    setShowOnlyMyCards(false);
                    setShowOnlyOthersCards(false);
                    setFilterModalOpen(false);
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
                    select_all
                  </span>
                  All cards
                  <span className="ml-auto text-label-medium font-roboto-flex bg-surface-container-highest text-on-surface rounded-full px-2 py-0.5 align-middle min-w-[2.5rem] text-center">
                    {allCount}
                  </span>
                </button>
              </li>
              <li>
                <button
                  className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left ${showOnlyMyCards ? 'bg-primary-container text-on-primary-container font-semibold' : 'hover:bg-surface-container-highest text-on-surface-variant'}`}
                  onClick={() => {
                    setShowOnlyMyCards(true);
                    setShowOnlyOthersCards(false);
                    setFilterModalOpen(false);
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
                    person
                  </span>
                  Your cards
                  <span className="ml-auto text-label-medium font-roboto-flex bg-surface-container-highest text-on-surface rounded-full px-2 py-0.5 align-middle min-w-[2.5rem] text-center">
                    {yoursCount}
                  </span>
                </button>
              </li>
              <li>
                <button
                  className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left ${showOnlyOthersCards ? 'bg-primary-container text-on-primary-container font-semibold' : 'hover:bg-surface-container-highest text-on-surface-variant'}`}
                  onClick={() => {
                    setShowOnlyMyCards(false);
                    setShowOnlyOthersCards(true);
                    setFilterModalOpen(false);
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
                    group
                  </span>
                  Others cards
                  <span className="ml-auto text-label-medium font-roboto-flex bg-surface-container-highest text-on-surface rounded-full px-2 py-0.5 align-middle min-w-[2.5rem] text-center">
                    {othersCount}
                  </span>
                </button>
              </li>
            </ul>
          </div>
        </>
      )}
    </div>
  );
};

export default MomentBoard;
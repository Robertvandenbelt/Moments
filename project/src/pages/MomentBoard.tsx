import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2, Edit, LogOut, Heart, ChevronLeft, ChevronRight, Check, Plus } from 'lucide-react';
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
  const [activeTab, setActiveTab] = useState(0); // 0: All photos, 1: Favorite photos, 2: About
  const [photoChip, setPhotoChip] = useState<'all' | 'yours' | 'others'>('all');
  const [doubleTapTimers, setDoubleTapTimers] = useState<{ [key: string]: NodeJS.Timeout }>({});
  const [favoriteAnimations, setFavoriteAnimations] = useState<{ [key: string]: boolean }>({});
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const moreMenuRef = useRef<HTMLButtonElement>(null);
  const [shareFeedback, setShareFeedback] = useState('');
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);
  const filterOptions = [
    { key: 'all', label: `All (${data?.cards?.filter(card => card.type === 'photo').length || 0})` },
    { key: 'yours', label: `Yours (${data?.cards?.filter(card => card.type === 'photo' && card.is_own_card).length || 0})` },
    { key: 'others', label: `Others (${data?.cards?.filter(card => card.type === 'photo' && !card.is_own_card).length || 0})` },
  ];
  const currentFilter = filterOptions.find(opt => opt.key === photoChip) || filterOptions[0];

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

  // Cleanup double tap timers on unmount
  useEffect(() => {
    return () => {
      Object.values(doubleTapTimers).forEach(timer => clearTimeout(timer));
    };
  }, [doubleTapTimers]);

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

    // Trigger animation
    setFavoriteAnimations(prev => ({ ...prev, [cardId]: true }));
    
    // Clear animation after 1 second
    setTimeout(() => {
      setFavoriteAnimations(prev => ({ ...prev, [cardId]: false }));
    }, 1000);

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

  const handleDoubleTap = (cardId: string) => {
    // Clear any existing timer for this card
    if (doubleTapTimers[cardId]) {
      clearTimeout(doubleTapTimers[cardId]);
      setDoubleTapTimers(prev => {
        const newTimers = { ...prev };
        delete newTimers[cardId];
        return newTimers;
      });
      
      // This is a double tap - trigger favorite
      handleFavorite(cardId);
    } else {
      // First tap - set a timer
      const timer = setTimeout(() => {
        setDoubleTapTimers(prev => {
          const newTimers = { ...prev };
          delete newTimers[cardId];
          return newTimers;
        });
      }, 300); // 300ms window for double tap
      
      setDoubleTapTimers(prev => ({ ...prev, [cardId]: timer }));
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

  // Share functionality
  const handleShare = () => {
    navigate(`/share/${board.id}`);
  };

  // Calculate counts for each filter state
  const allCount = momentCards.length;
  const yoursCount = momentCards.filter(card => card.is_own_card).length;
  const othersCount = momentCards.filter(card => !card.is_own_card).length;
  const favoritePhotosCount = momentCards.filter(card => card.is_favorited && card.type === 'photo').length;

  // In swipe view, use a safeCardIndex to avoid out-of-bounds errors
  const safeCardIndex = Math.max(0, Math.min(currentCardIndex, displayedCards.length - 1));

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-teal-50 relative">
      {/* Top App Bar - Material 3 Small App Bar */}
      <div className="w-full border-b border-outline-variant bg-surface-container-low px-4 py-3 flex items-center gap-2">
        <Link to="/timeline" className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-surface-container-highest transition-colors">
          <span className="material-symbols-outlined text-on-surface" style={{ fontSize: 24 }}>arrow_back</span>
        </Link>
        <h1 className="text-title-medium font-medium text-on-surface ml-2 truncate flex-1">
          {board.title || formatDate(board.date_start)}
        </h1>
        {/* Share Button */}
        <button
          onClick={handleShare}
          className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-primary/10 transition-colors relative"
          aria-label="Share moment"
        >
          <span className="material-symbols-outlined text-on-surface" style={{ fontSize: 24 }}>share</span>
          {shareFeedback && (
            <span className="absolute -top-6 left-1/2 -translate-x-1/2 bg-surface-container-highest text-xs px-2 py-1 rounded shadow text-on-surface-variant whitespace-nowrap">{shareFeedback}</span>
          )}
        </button>
        {/* More (3-dots) Menu */}
        <div className="relative">
          <button
            ref={moreMenuRef}
            onClick={() => setIsMoreMenuOpen((v) => !v)}
            className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-primary/10 transition-colors"
            aria-label="More actions"
          >
            <span className="material-symbols-outlined text-on-surface" style={{ fontSize: 24 }}>more_vert</span>
          </button>
          {isMoreMenuOpen && (
            <div className="absolute right-0 mt-2 w-44 bg-surface-container-highest rounded-xl shadow-lg border border-outline-variant z-50 animate-fade-in">
              <button
                onClick={() => { setIsMoreMenuOpen(false); navigate(`/edit/${board.id}`); }}
                className="w-full flex items-center gap-3 px-4 py-3 text-on-surface hover:bg-primary/10 rounded-t-xl text-left text-label-large font-roboto-flex"
              >
                <span className="material-symbols-outlined" style={{ fontSize: 22 }}>edit</span>
                Edit moment
              </button>
              <button
                onClick={() => { setIsMoreMenuOpen(false); setShowDeleteConfirm(true); }}
                className="w-full flex items-center gap-3 px-4 py-3 text-error hover:bg-error/10 rounded-b-xl text-left text-label-large font-roboto-flex"
              >
                <span className="material-symbols-outlined" style={{ fontSize: 22 }}>delete</span>
                Delete moment
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Tabs - Material 3 Primary Tabs */}
      <div className="flex items-center justify-center w-full mb-2">
        <div className="flex w-full max-w-2xl mx-auto border-b border-outline-variant">
          {['All', 'Favorites', 'About'].map((tab, idx) => (
            <button
              key={tab}
              onClick={() => setActiveTab(idx)}
              className={`flex-1 py-3 text-label-large font-roboto-flex transition-colors relative
                ${activeTab === idx ? 'text-primary font-bold' : 'text-on-surface-variant'}
              `}
              style={{ outline: 'none' }}
            >
              <span className="relative">
                {tab}
                {/* Badge for Favorites tab */}
                {idx === 1 && favoritePhotosCount > 0 && (
                  <span className="absolute -top-2 -right-5 bg-primary text-on-primary text-xs rounded-full px-1.5 min-w-[20px] h-5 flex items-center justify-center font-bold shadow">
                    {favoritePhotosCount}
                  </span>
                )}
              </span>
              {activeTab === idx && (
                <span className="absolute left-1/2 -translate-x-1/2 bottom-0 h-[3px] w-2/3 bg-primary rounded-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Only show filter button and Feed/Swipe toggle under All tab */}
      {activeTab === 0 && (
        <div className="flex items-center justify-center w-full mb-6 gap-4">
          {/* Filter button */}
          <div className="relative">
            <button
              onClick={() => setFilterMenuOpen(v => !v)}
              className="flex items-center gap-2 px-4 h-10 rounded-full border border-outline-variant bg-surface text-label-large font-roboto-flex text-on-surface hover:bg-surface-container-highest transition-colors focus:outline-none"
              aria-haspopup="menu"
              aria-expanded={filterMenuOpen}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>filter_list</span>
              {currentFilter.label}
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>expand_more</span>
            </button>
            {filterMenuOpen && (
              <div className="absolute left-0 mt-2 w-48 bg-surface-container-highest rounded-xl shadow-lg border border-outline-variant z-50 animate-fade-in">
                {filterOptions.map(opt => (
                  <button
                    key={opt.key}
                    onClick={() => { setPhotoChip(opt.key as any); setFilterMenuOpen(false); }}
                    className={`w-full flex items-center gap-2 px-4 py-3 text-on-surface hover:bg-primary/10 text-left text-label-large font-roboto-flex ${photoChip === opt.key ? 'font-bold bg-primary/5' : ''}`}
                    aria-selected={photoChip === opt.key}
                  >
                    {opt.label}
                    {photoChip === opt.key && (
                      <span className="material-symbols-outlined text-primary ml-auto" style={{ fontSize: 20 }}>check</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Feed view for All tab */}
      {activeTab === 0 && (
        <div className="flex flex-col items-center w-full max-w-2xl mx-auto gap-8 pb-16">
          {data?.cards
            ?.filter(card => card.type === 'photo')
            ?.filter(card =>
              photoChip === 'all' ? true :
              photoChip === 'yours' ? card.is_own_card :
              !card.is_own_card
            )
            .map(card => (
              <div key={card.id} className="w-full rounded-2xl overflow-hidden bg-gradient-to-br from-orange-50 to-teal-50 border border-outline-variant relative">
                <div 
                  className="relative w-full aspect-[4/5] cursor-pointer"
                  onTouchStart={() => handleDoubleTap(card.id)}
                  style={{ touchAction: 'manipulation' }}
                >
                  {card.optimized_url || card.media_url ? (
                    <img
                      src={(card.optimized_url || card.media_url) + '?width=800&quality=80'}
                      alt={card.description || ''}
                      className="w-full aspect-[4/5] object-cover"
                      style={{ display: 'block', maxWidth: '100%' }}
                    />
                  ) : (
                    <div className="w-full aspect-[4/5] bg-surface-container-high flex items-center justify-center text-on-surface-variant">
                      No photo
                    </div>
                  )}
                  {/* Double tap heart animation overlay */}
                  {favoriteAnimations[card.id] && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="animate-ping">
                        <Heart 
                          size={80} 
                          className="text-primary fill-primary drop-shadow-lg" 
                        />
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between px-4 py-3">
                  <span className="text-label-large font-roboto-flex text-on-surface truncate">{card.uploader_display_name}</span>
                  <button 
                    onClick={() => handleFavorite(card.id)}
                    className="flex items-center gap-1 text-on-surface-variant hover:text-primary transition-colors"
                    aria-label={card.is_favorited ? "Remove from favorites" : "Add to favorites"}
                  >
                    <Heart 
                      size={18} 
                      className={`${card.is_favorited ? 'fill-primary text-primary' : 'text-on-surface-variant'}`} 
                    />
                    {card.is_favorited ? 1 : 0}
                  </button>
                </div>
              </div>
            ))}
          {data?.cards?.filter(card => card.type === 'photo')
            ?.filter(card =>
              photoChip === 'all' ? true :
              photoChip === 'yours' ? card.is_own_card :
              !card.is_own_card
            ).length === 0 && (
              <div className="text-on-surface-variant text-center py-12">No photos to show.</div>
            )}
        </div>
      )}

      {/* Favorites tab: 2-column grid of favorite photos */}
      {activeTab === 1 && (
        <div className="w-full max-w-2xl mx-auto px-4 pb-16 mt-4">
          {data?.cards?.filter(card => card.type === 'photo' && card.is_favorited).length === 0 ? (
            <div className="text-center py-12">
              <div className="text-on-surface-variant mb-4">
                <Heart size={48} className="mx-auto text-on-surface-variant/50" />
              </div>
              <p className="text-title-medium font-roboto-flex text-on-surface-variant mb-2">No favorites yet</p>
              <p className="text-body-medium text-on-surface-variant">Double-tap photos to add them to your favorites</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {data?.cards
                ?.filter(card => card.type === 'photo' && card.is_favorited)
                .map(card => (
                  <div key={card.id} className="rounded-2xl overflow-hidden bg-gradient-to-br from-orange-50 to-teal-50 border border-outline-variant relative">
                    <div 
                      className="relative w-full aspect-[4/5] cursor-pointer"
                      onTouchStart={() => handleDoubleTap(card.id)}
                      style={{ touchAction: 'manipulation' }}
                    >
                      {card.optimized_url || card.media_url ? (
                        <img
                          src={(card.optimized_url || card.media_url) + '?width=400&quality=80'}
                          alt={card.description || ''}
                          className="w-full aspect-[4/5] object-cover"
                          style={{ display: 'block', maxWidth: '100%' }}
                        />
                      ) : (
                        <div className="w-full aspect-[4/5] bg-surface-container-high flex items-center justify-center text-on-surface-variant">
                          No photo
                        </div>
                      )}
                      {/* Double tap heart animation overlay */}
                      {favoriteAnimations[card.id] && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div className="animate-ping">
                            <Heart 
                              size={40} 
                              className="text-primary fill-primary drop-shadow-lg" 
                            />
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center justify-between px-3 py-2">
                      <span className="text-label-small font-roboto-flex text-on-surface truncate flex-1 mr-2">{card.uploader_display_name}</span>
                      <button 
                        onClick={() => handleFavorite(card.id)}
                        className="flex items-center gap-1 text-primary hover:text-primary/80 transition-colors flex-shrink-0"
                        aria-label="Remove from favorites"
                      >
                        <Heart 
                          size={16} 
                          className="fill-primary text-primary" 
                        />
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* About tab: show all meta data from the Moment */}
      {activeTab === 2 && data && (
        <div className="w-full max-w-2xl mx-auto mt-8 px-4">
          <h2 className="text-title-large font-bold text-on-surface mb-2">{data.board.title || 'Untitled Moment'}</h2>
          <div className="text-label-large text-on-surface-variant mb-2">
            {formatDate(data.board.date_start)}
            {data.board.date_end && ` - ${formatDate(data.board.date_end)}`}
          </div>
          {data.board.description && (
            <div className="mb-4">
              <div className="text-body-large font-roboto-flex text-on-surface-variant whitespace-pre-line">{data.board.description}</div>
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4 text-label-large text-on-surface-variant">
            <div><span className="font-bold">Owner:</span> {data.board.owner_display_name || data.board.created_by}</div>
            <div><span className="font-bold">Participants:</span> {data.board.participant_count}</div>
            <div><span className="font-bold">Cards:</span> {data.board.card_count}</div>
            <div><span className="font-bold">Role:</span> {data.board.role}</div>
            {/* Add more meta fields as needed */}
          </div>
        </div>
      )}

      {/* Floating Action Button */}
      <button
        onClick={() => navigate('/create')}
        className="fixed bottom-20 left-1/2 -translate-x-1/2 md:left-8 md:translate-x-0 z-40 flex items-center justify-center w-14 h-14 bg-primary text-on-primary rounded-full shadow-lg hover:shadow-xl hover:bg-primary-container transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-primary/20"
        aria-label="Create new moment"
      >
        <Plus className="w-6 h-6" />
      </button>
    </div>
  );
};

export default MomentBoard;
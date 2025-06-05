import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { X } from 'lucide-react';
import { getShareLink, getMomentBoard } from '../services/supabase';
import { supabase } from '../lib/supabaseClient';
import MomentBoardSnippet from '../components/MomentBoardSnippet';
import confetti from 'canvas-confetti';
import { MomentBoard } from '../lib/types';
import { useAuth } from '../context/AuthContext';

const ShareMomentBoard: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  const [board, setBoard] = useState<MomentBoard | null>(null);
  const [userName, setUserName] = useState<string>('');
  
  useEffect(() => {
    if (id) {
      getMomentBoard(id).then(setBoard).catch(console.error);
    }
    
    // Get user's display name
    if (user) {
      const fetchUserName = async () => {
        const { data } = await supabase
          .from('profiles')
          .select('display_name')
          .eq('id', user.id)
          .single();
        if (data?.display_name) {
          setUserName(data.display_name);
        }
      };
      fetchUserName();
    }
    
    // Initial confetti burst
    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.7 },
      colors: ['#F97316', '#38B2AC', '#D9F99D'],
      gravity: 1.2,
      decay: 0.94,
      ticks: 150
    });
  }, [id, user]);

  if (!id) {
    navigate('/timeline');
    return null;
  }

  const shareLink = getShareLink(id);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      
      // Small confetti burst on copy
      confetti({
        particleCount: 20,
        spread: 50,
        origin: { y: 0.7 },
        colors: ['#F97316', '#38B2AC'],
        gravity: 1.2,
        decay: 0.94,
        ticks: 100
      });
      
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(`${userName} has invited you to join his Moment "${board?.title || 'Untitled Moment'}". Join here: ${shareLink}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const handleClose = () => {
    navigate(`/board/${id}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-lime-200 to-teal-100 px-0 pt-0 pb-10">
      {/* Top App Bar */}
      <div className="sticky top-0 z-20 bg-surface/95 backdrop-blur-xl border-b border-outline-variant flex items-center h-16 px-4">
        <button 
          onClick={handleClose} 
          className="relative p-3 rounded-full hover:bg-surface-container-highest transition-colors"
          aria-label="Close and go to board"
        >
          <span className="material-symbols-outlined text-on-surface" style={{ fontSize: 28 }}>close</span>
        </button>
      </div>

      <div className="flex flex-col items-center justify-center min-h-[80vh] -mt-8 px-4">
        <div className="text-center mb-10">
          <div className="text-7xl mb-4 animate-[bounce_1s_ease-in-out]">🎉</div>
          <h1 className="text-headline-medium font-roboto-flex text-on-surface mb-2">
            Your moment is live!
          </h1>
          <p className="text-title-medium font-roboto-flex text-on-surface-variant">
            Share it with your friends and family
          </p>
        </div>

        {board && (
          <div className="w-full max-w-md bg-surface-container-low rounded-2xl overflow-hidden border border-outline-variant">
            <MomentBoardSnippet
              title={board.title || undefined}
              dateStart={board.date_start}
              dateEnd={board.date_end || undefined}
            />
            <div className="border-t border-outline-variant bg-surface-container-low">
              <div className="p-4">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={shareLink}
                    readOnly
                    className="flex-1 bg-surface-container-low border border-outline-variant rounded-xl px-4 py-3 text-body-medium font-roboto-flex text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition truncate"
                  />
                  <button
                    onClick={handleCopy}
                    className="shrink-0 px-5 py-3 rounded-full bg-primary text-on-primary text-label-large font-roboto-flex font-medium shadow-md transition-colors hover:bg-primary/90 active:bg-primary/80 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <button
          onClick={handleWhatsAppShare}
          className="w-full max-w-md bg-[#25D366] text-white py-4 rounded-full font-semibold shadow-lg transition-all hover:scale-105 hover:shadow-xl mt-8 text-label-large font-roboto-flex"
        >
          Share via WhatsApp
        </button>
      </div>
    </div>
  );
};

export default ShareMomentBoard;
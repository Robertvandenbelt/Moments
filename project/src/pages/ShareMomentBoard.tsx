import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { X } from 'lucide-react';
import { getShareLink, getMomentBoard } from '../services/supabase';
import { supabase } from '../lib/supabaseClient';
import MomentBoardSnippet from '../components/MomentBoardSnippet';
import confetti from 'canvas-confetti';
import { BasicMomentBoard } from '../lib/types';
import { useAuth } from '../context/AuthContext';

const ShareMomentBoard: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  const [board, setBoard] = useState<BasicMomentBoard | null>(null);
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
      {/* Top App Bar - Material 3 Small App Bar */}
      <div className="sticky top-0 z-20 bg-surface/95 backdrop-blur-xl border-b border-outline-variant flex items-center h-16 px-4 gap-2">
        <button 
          onClick={handleClose} 
          className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-surface-container-highest transition-colors"
          aria-label="Back to board"
        >
          <span className="material-symbols-outlined text-on-surface" style={{ fontSize: 24 }}>arrow_back</span>
        </button>
        <h1 className="text-title-medium font-medium text-on-surface ml-2 truncate flex-1 text-center">
          Share moment
        </h1>
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
          <div className="w-full max-w-md bg-surface-container-low rounded-[16px] shadow overflow-hidden">
            <MomentBoardSnippet
              title={board.title || undefined}
              dateStart={board.date_start}
              dateEnd={board.date_end || undefined}
            />
            <div className="border-t border-outline-variant bg-surface-container-low">
              <div className="p-4 flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={shareLink}
                    readOnly
                    className="flex-1 h-14 bg-surface-container-low border border-outline-variant rounded-[12px] px-4 text-body-medium font-roboto-flex text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition truncate"
                  />
                  <button
                    onClick={handleCopy}
                    className="shrink-0 h-14 px-6 rounded-[12px] bg-primary text-on-primary text-label-large font-roboto-flex font-medium shadow transition-colors hover:bg-primary/90 active:bg-primary/80 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 24 }}>content_copy</span>
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <button
          onClick={handleWhatsAppShare}
          className="w-full max-w-md h-14 bg-[#25D366] text-white rounded-[12px] font-roboto-flex text-label-large font-medium shadow transition-all hover:scale-105 hover:shadow-xl mt-8 flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined" style={{ fontSize: 24 }}>
            ios_share
          </span>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.031-.967-.273-.099-.471-.148-.67.15-.198.297-.767.966-.94 1.164-.173.198-.347.223-.644.075-.297-.149-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.151-.174.2-.298.3-.497.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.5-.669-.51-.173-.008-.372-.01-.571-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.099 3.205 5.077 4.372.71.306 1.263.489 1.694.626.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.288.173-1.413-.074-.124-.272-.198-.57-.347zm-5.421-12.381c-5.514 0-9.979 4.465-9.979 9.979 0 1.762.462 3.479 1.337 4.991l-1.409 5.151 5.273-1.385c1.463.801 3.125 1.264 4.778 1.264h.004c5.514 0 9.979-4.465 9.979-9.979 0-2.662-1.037-5.164-2.921-7.048-1.884-1.884-4.386-2.973-7.062-2.973zm5.449 14.668c-.232.654-1.357 1.248-1.857 1.332-.476.08-1.068.114-1.726-.113-.409-.133-1.047-.341-1.799-.666-3.172-1.271-5.254-4.5-5.418-4.725-.163-.223-1.294-1.722-1.294-3.292 0-1.57.818-2.341 1.109-2.634.29-.292.634-.366.847-.366.213 0 .426.004.613.011.197.008.462-.075.728.56.267.635.902 2.021.978 2.169.075.148.124.322.025.52-.099.199-.165.323-.314.497-.149.174-.298.388-.425.521-.134.133-.191.282-.134.48.057.198.272.684.583 1.11.409.563 1.211 1.222 1.372 1.37.161.148 2.548 1.627 3.153 1.849.605.223.96.186 1.316-.112.356-.297.609-.669.827-1.066.217-.397.457-.446.776-.297.319.149 2.019.951 2.373 1.124.355.173.592.257.68.401.089.144.089.827-.143 1.481z"/></svg>
          Share via WhatsApp
        </button>
      </div>
    </div>
  );
};

export default ShareMomentBoard;
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { X } from 'lucide-react';
import { getShareLink, getMomentBoard } from '../services/supabase';
import MomentBoardSnippet from '../components/MomentBoardSnippet';
import confetti from 'canvas-confetti';
import { MomentBoard } from '../lib/types';

const ShareMomentBoard: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [board, setBoard] = useState<MomentBoard | null>(null);
  
  useEffect(() => {
    if (id) {
      getMomentBoard(id).then(setBoard).catch(console.error);
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
  }, [id]);

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
    const text = encodeURIComponent(`Join my moment: ${shareLink}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const handleClose = () => {
    navigate(`/board/${id}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-lime-200 to-teal-100 px-6 pt-8 pb-10">
      <button 
        onClick={handleClose} 
        className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-black/5 transition-colors"
        aria-label="Close and go to board"
      >
        <X size={32} className="text-gray-900" />
      </button>

      <div className="flex flex-col items-center justify-center min-h-[80vh] -mt-16">
        <div className="text-center mb-12">
          <div className="text-8xl mb-6 animate-[bounce_1s_ease-in-out]">🎉</div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Your moment is live!
          </h1>
          <p className="text-gray-600 text-lg">
            Share it with your friends and family
          </p>
        </div>

        {board && (
          <div className="w-full max-w-md mb-8">
            <MomentBoardSnippet
              title={board.title || undefined}
              dateStart={board.date_start}
              dateEnd={board.date_end || undefined}
              description={board.description || undefined}
            />
          </div>
        )}

        <div className="w-full max-w-md bg-white rounded-2xl p-4 mb-8 shadow-lg">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={shareLink}
              readOnly
              className="flex-1 bg-transparent px-3 py-2 focus:outline-none text-sm sm:text-base truncate"
            />
            <button
              onClick={handleCopy}
              className="shrink-0 px-4 py-2 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition-colors text-sm sm:text-base"
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>

        <button
          onClick={handleWhatsAppShare}
          className="w-full max-w-md bg-[#25D366] text-white py-4 rounded-full font-semibold shadow-lg transform transition-all hover:scale-105 hover:shadow-xl"
        >
          Share via WhatsApp
        </button>
      </div>
    </div>
  );
};

export default ShareMomentBoard;
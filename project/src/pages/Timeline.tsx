import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import MomentListItem from '../components/MomentListItem';
import { Plus } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { MomentBoard } from '../lib/types';
import { format } from 'date-fns';
import { parseISO } from 'date-fns/parseISO';
import 'material-symbols/outlined.css';

type GroupedMoments = {
  [key: string]: {
    display: string;
    moments: MomentBoard[];
  };
};

const Timeline: React.FC = () => {
  const [moments, setMoments] = useState<GroupedMoments>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTimeline = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) {
          console.error('No access token found');
          throw new Error('No session');
        }

        const response = await fetch('https://ekwpzlzdjbfzjdtdfafk.supabase.co/functions/v1/get-user-timeline', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Response error:', {
            status: response.status,
            statusText: response.statusText,
            body: errorText
          });
          throw new Error(`Failed to fetch timeline: ${response.status} ${response.statusText}`);
        }

        const timelineData = await response.json();
        if (!Array.isArray(timelineData)) {
          console.error('Invalid response format:', timelineData);
          throw new Error('Invalid response format');
        }

        const grouped = timelineData.reduce((groups: GroupedMoments, moment) => {
          if (!moment.date_start) return groups;
          
          const date = parseISO(moment.date_start);
          const monthKey = format(date, 'yyyy-MM');
          const monthDisplay = format(date, 'MMMM yyyy');
          
          if (!groups[monthKey]) {
            groups[monthKey] = {
              display: monthDisplay,
              moments: []
            };
          }
          
          groups[monthKey].moments.push({
            ...moment,
            moment_cards: { count: moment.total_card_count }
          });
          return groups;
        }, {});

        Object.keys(grouped).forEach(month => {
          grouped[month].moments.sort((a, b) => {
            const dateA = parseISO(a.date_start);
            const dateB = parseISO(b.date_start);
            return dateB.getTime() - dateA.getTime();
          });
        });

        setMoments(grouped);
      } catch (err) {
        console.error('Error:', err);
        setError(err instanceof Error ? err.message : 'Failed to load timeline');
      } finally {
        setLoading(false);
      }
    };

    fetchTimeline();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="relative w-12 h-12">
          {/* Track */}
          <div className="absolute inset-0 rounded-full border-4 border-surface-container-high" />
          {/* Progress */}
          <div className="absolute inset-0 rounded-full border-4 border-primary-500 animate-spin" 
            style={{
              borderRightColor: 'transparent',
              borderTopColor: 'transparent'
            }}
          />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-surface-dim">
        <div className="container mx-auto px-4 pt-20 text-center">
          <p className="text-on-surface-variant">{error}</p>
        </div>
      </div>
    );
  }

  const handleCreateClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate('/create');
  };

  return (
    <div className="min-h-screen bg-surface relative max-w-full overflow-x-hidden">
      {/* M3 Top App Bar */}
      <div className="sticky top-0 z-20 bg-surface-container-low backdrop-blur-xl border-b border-outline-variant">
        <div className="px-6 h-20 flex items-center justify-between max-w-7xl mx-auto relative">
          {/* Centered Logo */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="px-6 py-2 -rotate-3 hover:rotate-0 transition-transform duration-200">
              <div className="flex items-center text-2xl sm:text-3xl md:text-4xl font-roboto-flex font-bold tracking-tight text-primary-500">
                m
                <span 
                  className="material-symbols-outlined mx-[1px] text-primary-700"
                  style={{ 
                    fontSize: '28px',
                    fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' -25, 'opsz' 24"
                  }}
                >
                  photo_camera
                </span>
                ments
              </div>
            </div>
          </div>

          {/* Invisible placeholder for left alignment */}
          <div className="w-10 h-10 md:w-12 md:h-12" />

          {/* Right section - Settings */}
          <Link 
            to="/profile" 
            className="relative w-10 h-10 rounded-full bg-secondary-container hover:bg-secondary-container/90 transition-colors flex items-center justify-center"
            aria-label="Settings"
          >
            <div className="absolute inset-0 rounded-full bg-on-secondary-container opacity-0 hover:opacity-[0.08] active:opacity-[0.12] transition-opacity duration-300" />
            <span 
              className="material-symbols-outlined text-on-secondary-container relative"
              style={{ 
                fontSize: '24px',
                fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24"
              }}
            >
              settings
            </span>
          </Link>
        </div>
      </div>
      
      <main
        className="container mx-auto px-4 pt-8 pb-32"
        style={{ paddingBottom: 'calc(8rem + env(safe-area-inset-bottom, 0px))' }}
      >
        {Object.entries(moments).length === 0 ? (
          <div className="text-center mt-12">
            <p className="text-gray-500">No moments yet. Create your first one!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
            {Object.entries(moments)
              .sort(([monthA], [monthB]) => monthB.localeCompare(monthA))
              .map(([month, { display, moments: monthMoments }]) => (
              <section key={month} className="mb-8">
                <div className="px-4 pb-3 mb-2">
                  <h2 className="text-headline-small font-roboto-flex font-medium text-on-surface">{display}</h2>
                </div>
                <div className="bg-surface rounded-lg overflow-hidden">
                  {monthMoments.map((moment, index) => (
                    <Link key={moment.id} to={`/board/${moment.id}`}>
                      <MomentListItem
                        title={moment.title || undefined}
                        date={moment.date_start}
                        dateEnd={moment.date_end || undefined}
                        participantCount={Number(moment.participant_count)}
                        unseenCardCount={moment.unseen_card_count}
                        totalCardCount={moment.total_card_count}
                        previewPhotoUrl={moment.preview_photo_url}
                        isLast={index === monthMoments.length - 1}
                      />
                    </Link>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </main>

      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={handleCreateClick}
          className="relative flex items-center gap-3 justify-center h-14 px-6 rounded-full shadow-lg bg-primary text-white transition-colors hover:bg-primary/90 active:bg-primary/80 focus:outline-none focus:ring-2 focus:ring-primary/40 font-roboto-flex text-label-large"
          aria-label="Add new moment"
          style={{ boxShadow: '0px 3px 8px rgba(0,0,0,0.15)' }}
        >
          <span className="material-symbols-outlined text-white" style={{ fontSize: 28, fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' -25, 'opsz' 24" }}>add</span>
          New moment
          {/* State layer */}
          <span className="absolute inset-0 rounded-full bg-on-primary opacity-0 hover:opacity-[0.08] active:opacity-[0.12] transition-opacity duration-200 pointer-events-none" />
        </button>
      </div>
    </div>
  );
};

export default Timeline;
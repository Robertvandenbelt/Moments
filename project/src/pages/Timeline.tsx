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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-teal-50 relative max-w-full overflow-x-hidden">
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
          <div className="flex flex-col items-center w-full max-w-2xl mx-auto gap-8">
            {Object.entries(moments)
              .sort(([monthA], [monthB]) => monthB.localeCompare(monthA))
              .map(([month, { display, moments: monthMoments }]) => (
                <React.Fragment key={month}>
                  <div className="w-full px-2 pb-1">
                    <h2 className="text-headline-small font-roboto-flex font-medium text-on-surface mb-2">{display}</h2>
                  </div>
                  {monthMoments.map((moment) => (
                    <Link key={moment.id} to={`/board/${moment.id}`} className="block w-full">
                      <div className="w-full mb-4 bg-transparent p-0 overflow-hidden">
                        {/* Title, Date */}
                        <div className="px-6 pt-6 pb-2">
                          {moment.title ? (
                            <>
                              <div className="text-title-large font-bold text-on-surface mb-1">{moment.title}</div>
                              <div className="text-label-large text-on-surface-variant mb-1">{moment.date_start ? format(parseISO(moment.date_start), 'MMMM d, yyyy') : ''}</div>
                            </>
                          ) : (
                            <div className="text-title-large font-bold text-on-surface mb-1">{moment.date_start ? format(parseISO(moment.date_start), 'MMMM d, yyyy') : ''}</div>
                          )}
                        </div>
                        {/* Photo with photo count badge */}
                        <div className="relative w-full">
                          {moment.preview_photo_url && (
                            <img
                              src={moment.preview_photo_url}
                              alt={moment.title || ''}
                              className="w-full rounded-none"
                              style={{ display: 'block', maxWidth: '100%' }}
                            />
                          )}
                          {moment.total_card_count > 1 && (
                            <span className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded-lg bg-surface text-on-surface shadow text-label-small font-roboto-flex">
                              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>collections</span>
                              {moment.total_card_count}
                            </span>
                          )}
                        </div>
                        {/* Description (below photo) */}
                        {moment.description && (
                          <div className="px-6 pb-4">
                            <div className="text-body-large font-roboto-flex text-on-surface-variant max-w-2xl">{moment.description}</div>
                          </div>
                        )}
                        {/* Supporting Info (chips/badges) */}
                        <div className="flex items-center gap-3 px-6 py-4">
                          {Number(moment.participant_count) > 1 && (
                            <span className="inline-flex items-center h-6 px-2 rounded-full bg-secondary-container text-on-secondary-container text-label-small font-roboto-flex">
                              <span 
                                className="material-symbols-outlined text-on-secondary-container mr-1"
                                style={{ 
                                  fontSize: '16px',
                                  fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' -25, 'opsz' 24"
                                }}
                              >
                                group
                              </span>
                              {moment.participant_count}
                            </span>
                          )}
                          {moment.unseen_card_count > 0 && (
                            <span className="inline-flex items-center h-5 px-2 rounded-full bg-secondary-container text-on-secondary-container text-label-small font-roboto-flex">
                              +{moment.unseen_card_count}
                            </span>
                          )}
                          {moment.total_card_count > 0 && (
                            <span className="text-label-medium font-roboto-flex text-on-surface-variant ml-auto">
                              {moment.total_card_count} {moment.total_card_count === 1 ? 'card' : 'cards'}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </React.Fragment>
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
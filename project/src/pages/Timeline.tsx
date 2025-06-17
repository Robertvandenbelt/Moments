import React, { useState, useEffect, useMemo } from 'react';
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
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState('all');

  // Get all months for filter options
  const allMonths = useMemo(() => {
    return Object.entries(moments)
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([key, { display }]) => ({ key, display }));
  }, [moments]);

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
          {/* Left: Filter Button */}
          <button
            className="relative w-10 h-10 flex items-center justify-center hover:bg-surface-container-highest transition-colors"
            aria-label="Filter timeline"
            onClick={() => setFilterModalOpen(true)}
          >
            <span className="material-symbols-outlined text-on-surface" style={{ fontSize: 24 }}>
              tune
            </span>
          </button>

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

          {/* Right: Settings Button (plain icon) */}
          <Link 
            to="/profile" 
            className="relative w-10 h-10 flex items-center justify-center"
            aria-label="Settings"
          >
            <div className="absolute inset-0 rounded-full bg-on-surface opacity-0 hover:opacity-[0.08] active:opacity-[0.12] transition-opacity duration-300" />
            <span 
              className="material-symbols-outlined text-on-surface-variant relative"
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
        className="container mx-auto px-4 pt-8 pb-32 relative"
        style={{ paddingBottom: 'calc(8rem + env(safe-area-inset-bottom, 0px))' }}
      >
        {Object.entries(moments).length === 0 ? (
          <div className="text-center mt-12">
            <p className="text-gray-500">No moments yet. Create your first one!</p>
          </div>
        ) : (
          <div className="flex flex-col items-center w-full max-w-2xl mx-auto gap-4">
            {/* Filtered moments */}
            {(selectedMonth === 'all' ? Object.entries(moments) : Object.entries(moments).filter(([key]) => key === selectedMonth))
              .sort(([monthA], [monthB]) => monthB.localeCompare(monthA))
              .flatMap(([_, { moments: monthMoments }]) =>
                monthMoments.map((moment, idx, arr) => (
                  <React.Fragment key={moment.id}>
                    <Link to={`/board/${moment.id}`} className="block w-full">
                      <div className="w-full mb-2 bg-surface-container p-0 overflow-hidden rounded-xl">
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
                          {moment.description && (
                            <div className="pt-2 pb-6">
                              <div className="text-body-large font-roboto-flex text-on-surface-variant max-w-2xl">{moment.description}</div>
                            </div>
                          )}
                        </div>
                        {/* Photo with photo count and participants badges */}
                        <div className="relative w-full">
                          {moment.preview_photo_url && (
                            <img
                              src={moment.preview_photo_url}
                              alt={moment.title || ''}
                              className="w-full rounded-none"
                              style={{ display: 'block', maxWidth: '100%' }}
                            />
                          )}
                          {(moment.total_card_count > 1 || Number(moment.participant_count) > 1) && (
                            <div className="absolute top-2 right-2 flex flex-row gap-2">
                              {moment.total_card_count > 1 && (
                                <span className="flex items-center gap-1 px-2 py-1 rounded-lg bg-surface text-on-surface shadow text-label-small font-roboto-flex">
                                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>collections</span>
                                  {moment.total_card_count}
                                </span>
                              )}
                              {Number(moment.participant_count) > 1 && (
                                <span className="flex items-center gap-1 px-2 py-1 rounded-lg bg-surface text-on-surface shadow text-label-small font-roboto-flex">
                                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>group</span>
                                  {moment.participant_count}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </Link>
                    {idx < arr.length - 1 && (
                      <hr className="mx-6 border-t border-on-surface-variant" style={{ opacity: 0.3 }} />
                    )}
                  </React.Fragment>
                ))
              )}
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
            <h2 className="text-title-large font-roboto-flex text-on-surface mb-4">Filter by month</h2>
            <div className="flex flex-col gap-2">
              <button
                className={`flex items-center justify-between px-4 py-3 rounded-lg text-label-large font-roboto-flex transition-colors ${selectedMonth === 'all' ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-on-surface'}`}
                onClick={() => { setSelectedMonth('all'); setFilterModalOpen(false); }}
              >
                All
                {selectedMonth === 'all' && <span className="material-symbols-outlined ml-2">check</span>}
              </button>
              {allMonths.map(({ key, display }) => (
                <button
                  key={key}
                  className={`flex items-center justify-between px-4 py-3 rounded-lg text-label-large font-roboto-flex transition-colors ${selectedMonth === key ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-on-surface'}`}
                  onClick={() => { setSelectedMonth(key); setFilterModalOpen(false); }}
                >
                  {display}
                  {selectedMonth === key && <span className="material-symbols-outlined ml-2">check</span>}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Timeline;
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import MomentListItem from '../components/MomentListItem';
import { Plus } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { MomentBoard } from '../lib/types';
import { format, formatDistanceToNow } from 'date-fns';
import { parseISO } from 'date-fns/parseISO';
import 'material-symbols/outlined.css';
import BottomNavBar from '../components/BottomNavBar';
import SidebarNav from '../components/SidebarNav';
import Avatar from '../components/Avatar';

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
      {/* Sidebar Navigation for md+ screens */}
      <SidebarNav />
      <main
        className="container mx-auto px-4 pt-8 pb-32 relative md:pl-28 lg:pl-60"
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
                    {/* User/Meta Row - OUTSIDE the card */}
                    <div className="flex items-center gap-4 px-2 pt-2 pb-1">
                      <Avatar name={moment.created_by_display_name || 'User'} size={44} />
                      <div className="flex flex-col">
                        <span className="font-bold text-on-surface text-base leading-tight">{moment.created_by_display_name || 'User'}</span>
                        <span className="text-on-surface-variant text-sm">
                          Created {moment.date_start ? formatDistanceToNow(parseISO(moment.date_start), { addSuffix: true }) : ''}
                          {` - ${moment.participant_count} member${Number(moment.participant_count) === 1 ? '' : 's'} - ${moment.total_card_count} photo${Number(moment.total_card_count) === 1 ? '' : 's'}`}
                        </span>
                      </div>
                    </div>
                    <Link to={`/board/${moment.id}`} className="block w-full">
                      <div className="w-full mb-6 p-0 overflow-hidden rounded-2xl bg-surface border border-outline-variant">
                        {/* Card Image/Content */}
                        <div className="px-0 pt-0 pb-0">
                          <div className="rounded-t-2xl overflow-hidden bg-surface-container-high aspect-[4/5] relative">
                            {moment.preview_photo_url && (
                              <img
                                src={moment.preview_photo_url}
                                alt={moment.title || ''}
                                className="w-full h-full object-cover absolute inset-0"
                                style={{ maxWidth: '100%' }}
                              />
                            )}
                          </div>
                          <div className="px-6 py-4">
                            <div className="text-title-large font-bold text-on-surface mb-1">
                              {moment.title || (moment.date_start ? format(parseISO(moment.date_start), 'MMMM d, yyyy') : '')}
                            </div>
                            {moment.title && (
                              <div className="text-label-large text-on-surface-variant mb-1">{moment.date_start ? format(parseISO(moment.date_start), 'MMMM d, yyyy') : ''}</div>
                            )}
                            {moment.description && (
                              <div className="pt-1">
                                <div className="text-body-large font-roboto-flex text-on-surface-variant max-w-2xl">{moment.description}</div>
                              </div>
                            )}
                          </div>
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

      {/* Bottom Navigation Bar */}
      <BottomNavBar />

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
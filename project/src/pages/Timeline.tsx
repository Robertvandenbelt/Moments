import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import MomentBoardCard from '../components/MomentBoardCard';
import { Plus } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { MomentBoard } from '../lib/types';
import { format, parseISO } from 'date-fns';

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
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-teal-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-teal"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-teal-50">
        <Navbar />
        <div className="container mx-auto px-4 pt-20 text-center">
          <p className="text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  const handleCreateClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate('/create');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-teal-50">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-28 pb-24">
        {Object.entries(moments).length === 0 ? (
          <div className="text-center mt-12">
            <p className="text-gray-500">No moments yet. Create your first one!</p>
          </div>
        ) : (
          Object.entries(moments)
            .sort(([monthA], [monthB]) => monthB.localeCompare(monthA))
            .map(([month, { display, moments: monthMoments }]) => (
            <section key={month} className="mb-16">
              <h2 className="text-xl font-semibold text-gray-600 mb-8">{display}</h2>
              <div className="grid gap-6">
                {monthMoments.map(moment => (
                  <Link 
                    to={`/board/${moment.id}`} 
                    key={moment.id} 
                    className="block transform transition hover:-translate-y-1 duration-300"
                  >
                    <MomentBoardCard 
                      title={moment.title || undefined}
                      date={moment.date_start}
                      dateEnd={moment.date_end || undefined}
                      description={moment.description || undefined}
                      isOwner={moment.is_owner}
                      participantCount={moment.participant_count || 0}
                      unseenCardCount={moment.unseen_card_count || 0}
                      totalCardCount={moment.total_card_count || 0}
                    />
                  </Link>
                ))}
              </div>
            </section>
          ))
        )}
      </main>

      <button 
        onClick={handleCreateClick}
        className="fab"
        aria-label="Add new moment"
      >
        <Plus size={28} />
      </button>
    </div>
  );
};

export default Timeline;
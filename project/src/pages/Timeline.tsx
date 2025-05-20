import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import MomentBoardCard from '../components/MomentBoardCard';
import { Plus } from 'lucide-react';
import { useTimelineData } from '../hooks/useTimelineData';

const Timeline: React.FC = () => {
  const { moments, loading, error } = useTimelineData();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-teal"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
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
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-20 pb-24">
        {Object.entries(moments).length === 0 ? (
          <div className="text-center mt-12">
            <p className="text-gray-500">No moments yet. Create your first one!</p>
          </div>
        ) : (
          Object.entries(moments).map(([month, monthMoments]) => (
            <section key={month} className="mb-8">
              <h2 className="text-xl font-semibold text-gray-400 mb-6">{month}</h2>
              <div className="space-y-4">
                {monthMoments.map(moment => (
                  <Link to={`/board/${moment.id}`} key={moment.id}>
                    <MomentBoardCard 
                      title={moment.title || undefined}
                      date={moment.date_start}
                      description={moment.description || undefined}
                      isPrivate={!moment.is_public_preview}
                      newCardCount={moment.moment_cards?.count || 0}
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
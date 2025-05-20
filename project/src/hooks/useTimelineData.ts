import { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import { getUserTimeline, updateLastTimelineSeen } from '../services/supabase';
import { MomentBoard, GroupedMoments } from '../lib/types';

export function useTimelineData() {
  const [moments, setMoments] = useState<GroupedMoments>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTimeline = async () => {
      try {
        const timelineData = await getUserTimeline();
        const grouped = groupMomentsByMonth(timelineData);
        setMoments(grouped);
        
        // Update last seen after 5 seconds
        setTimeout(() => {
          updateLastTimelineSeen();
        }, 5000);
      } catch (err) {
        setError('Failed to load timeline');
        console.error('Error fetching timeline:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTimeline();
  }, []);

  const groupMomentsByMonth = (momentsList: MomentBoard[]): GroupedMoments => {
    return momentsList.reduce((groups: GroupedMoments, moment) => {
      const date = parseISO(moment.created_at);
      const monthKey = format(date, 'MMMM yyyy');
      
      if (!groups[monthKey]) {
        groups[monthKey] = [];
      }
      
      groups[monthKey].push(moment);
      return groups;
    }, {});
  };

  return { moments, loading, error };
}
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import MomentBoardSnippet from '../components/MomentBoardSnippet';

const EditMomentBoard: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    dateStart: '',
    dateEnd: '',
    description: ''
  });

  useEffect(() => {
    const fetchBoardData = async () => {
      if (!id) return;

      try {
        // Get board data directly from Supabase
        const { data: board, error: boardError } = await supabase
          .from('moment_boards')
          .select(`
            id,
            title,
            description,
            date_start,
            date_end,
            created_by
          `)
          .eq('id', id)
          .single();

        if (boardError) throw boardError;
        if (!board) throw new Error('Board not found');

        // Check if user is owner
        const { data: { user } } = await supabase.auth.getUser();
        if (!user || board.created_by !== user.id) {
          throw new Error('You do not have permission to edit this moment board');
        }

        setFormData({
          title: board.title || '',
          dateStart: board.date_start,
          dateEnd: board.date_end || board.date_start,
          description: board.description || ''
        });
      } catch (err) {
        console.error('Error fetching board:', err);
        setError(err instanceof Error ? err.message : 'Failed to load board');
      } finally {
        setLoading(false);
      }
    };

    fetchBoardData();
  }, [id]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'dateStart' | 'dateEnd') => {
    const newDate = e.target.value;
    setFormData(prev => {
      // If start date is after end date, update end date
      if (field === 'dateStart' && newDate > prev.dateEnd) {
        return { ...prev, [field]: newDate, dateEnd: newDate };
      }
      // If end date is before start date, update start date
      if (field === 'dateEnd' && newDate < prev.dateStart) {
        return { ...prev, [field]: newDate, dateStart: newDate };
      }
      return { ...prev, [field]: newDate };
    });
  };

  const handleSave = async () => {
    if (!id) return;
    setSaving(true);

    try {
      // Validate dates
      if (!formData.dateStart) {
        throw new Error('Start date is required');
      }

      // Format dates to ISO string (YYYY-MM-DD)
      const dateStart = new Date(formData.dateStart).toISOString().split('T')[0];
      const dateEnd = formData.dateEnd ? new Date(formData.dateEnd).toISOString().split('T')[0] : null;

      // Log the update payload for debugging
      console.log('Updating board with data:', {
        id,
        title: formData.title || null,
        description: formData.description || null,
        date_start: dateStart,
        date_end: dateEnd === dateStart ? null : dateEnd
      });

      const { data, error } = await supabase
        .from('moment_boards')
        .update({
          title: formData.title || null,
          description: formData.description || null,
          date_start: dateStart,
          date_end: dateEnd === dateStart ? null : dateEnd
        })
        .eq('id', id)
        .select(); // Add select() to return the updated data

      if (error) {
        console.error('Supabase update error:', error);
        throw error;
      }

      console.log('Update response:', data);

      // Refresh the board data in the parent component by forcing a reload
      navigate(`/board/${id}`, { replace: true });
    } catch (err) {
      console.error('Error updating board:', err);
      setError(err instanceof Error ? err.message : 'Failed to update board');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-teal-500 to-teal-600 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-white"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-teal-500 to-teal-600 px-8 pt-8">
        <Link to={`/board/${id}`} className="text-white">
          <ArrowLeft size={32} />
        </Link>
        <div className="max-w-md mx-auto mt-10">
          <p className="text-white text-center">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-500 to-teal-600 px-8 pt-8 pb-24">
      <div className="max-w-md mx-auto">
        <Link to={`/board/${id}`} className="text-white">
          <ArrowLeft size={32} />
        </Link>

        <h1 className="text-3xl sm:text-4xl font-bold text-white mt-10 mb-8">
          Edit moment details
        </h1>

        <div className="space-y-6">
          <div>
            <label className="block text-white text-lg mb-4">
              Start date
            </label>
            <div className="relative">
              <input
                type="date"
                value={formData.dateStart}
                onChange={(e) => handleDateChange(e, 'dateStart')}
                className="w-full px-4 py-4 rounded-xl bg-white text-base pr-12"
              />
              <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={24} />
            </div>
          </div>

          <div>
            <label className="block text-white text-lg mb-4">
              End date (optional)
            </label>
            <div className="relative">
              <input
                type="date"
                value={formData.dateEnd}
                onChange={(e) => handleDateChange(e, 'dateEnd')}
                min={formData.dateStart}
                className="w-full px-4 py-4 rounded-xl bg-white text-base pr-12"
              />
              <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={24} />
            </div>
          </div>

          <div>
            <label className="block text-white text-lg mb-4">
              Title (optional)
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="e.g. Sarah's birthday, Summer BBQ"
              maxLength={50}
              className="w-full px-4 py-4 rounded-xl bg-white text-base"
            />
            <div className="text-right mt-2 text-white/80 text-sm">
              {formData.title.length} / 50
            </div>
          </div>

          <div className="bg-white rounded-2xl overflow-hidden mt-8">
            <MomentBoardSnippet
              title={formData.title}
              dateStart={formData.dateStart}
              dateEnd={formData.dateEnd}
              className="rounded-none"
            />
            <div className="p-4">
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Add an optional description. What was this moment about?"
                maxLength={250}
                rows={6}
                className="w-full resize-none text-base focus:outline-none"
              />
            </div>
          </div>
          <div className="text-right mt-2 text-white/80 text-sm">
            {formData.description.length} / 250
          </div>

          <div className="fixed max-w-md mx-auto inset-x-0 bottom-8 px-8 flex gap-4">
            <Link
              to={`/board/${id}`}
              className="flex-1 bg-white/20 text-white py-4 rounded-full text-base font-medium text-center"
            >
              Cancel
            </Link>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 bg-orange-500 text-white py-4 rounded-full text-base font-medium disabled:opacity-70"
            >
              {saving ? 'Saving...' : 'Save changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditMomentBoard; 
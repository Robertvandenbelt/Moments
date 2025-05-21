import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, ArrowRight } from 'lucide-react';
import MomentBoardSnippet from '../components/MomentBoardSnippet';
import { createMomentBoard } from '../services/supabase';

const CreateMomentBoard: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const today = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
  const [formData, setFormData] = useState({
    title: '',
    dateStart: today,
    dateEnd: today,
    description: ''
  });
  const [loading, setLoading] = useState(false);

  const handleNext = () => {
    if (formData.dateStart) {
      setStep(2);
    }
  };

  const handleBack = () => {
    setStep(1);
  };

  const handleCreate = async () => {
    setLoading(true);
    try {
      const board = await createMomentBoard({
        title: formData.title || undefined,
        date_start: formData.dateStart,
        date_end: formData.dateEnd || undefined,
        description: formData.description || undefined
      });
      navigate(`/share/${board.id}`);
    } catch (error) {
      console.error('Error creating board:', error);
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <div className="min-h-screen bg-teal-500 px-8 pt-8 pb-24">
      {step === 1 ? (
        <div className="max-w-md mx-auto">
          <Link to="/timeline" className="text-white">
            <ArrowLeft size={32} />
          </Link>

          <h1 className="text-3xl sm:text-4xl font-bold text-white mt-10 mb-8">
            When is the moment?
          </h1>
          <p className="text-white text-lg mb-10">Step 1 of 2 - date and title</p>

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
          </div>

          <button
            onClick={handleNext}
            disabled={!formData.dateStart}
            className="fixed bottom-6 right-6 w-14 h-14 bg-orange-500 rounded-full flex items-center justify-center text-white shadow-fab disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Next"
          >
            <ArrowRight size={24} />
          </button>
        </div>
      ) : (
        <div className="max-w-md mx-auto">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mt-10 mb-8">
            Add a description
          </h1>
          <p className="text-white text-lg mb-10">Step 2 of 2 - add a description</p>

          <div className="bg-white rounded-2xl overflow-hidden">
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
            <button
              onClick={handleBack}
              className="flex-1 bg-white/20 text-white py-4 rounded-full text-base font-medium"
            >
              Back
            </button>
            <button
              onClick={handleCreate}
              disabled={loading}
              className="flex-1 bg-orange-500 text-white py-4 rounded-full text-base font-medium disabled:opacity-70"
            >
              {loading ? 'Creating...' : 'Create moment'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateMomentBoard;
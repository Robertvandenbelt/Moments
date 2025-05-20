import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import FABNext from '../components/FABNext';
import MomentBoardSnippet from '../components/MomentBoardSnippet';
import DateRangePicker from '../components/DateRangePicker';
import { createMomentBoard } from '../services/supabase';

const CreateMomentBoard: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    dateStart: '',
    dateEnd: '',
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

  const handleDateChange = ({ from, to }: { from: string; to?: string }) => {
    setFormData(prev => ({
      ...prev,
      dateStart: from,
      dateEnd: to || ''
    }));
  };

  return (
    <div className="min-h-screen bg-teal-500 px-6 pt-8 pb-24">
      <Link to="/timeline" className="text-white">
        <ArrowLeft size={32} />
      </Link>

      {step === 1 ? (
        <>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mt-10 mb-8">
            When is the moment?
          </h1>
          <p className="text-white text-lg mb-10">Step 1 of 2 - date and title</p>

          <div className="space-y-10">
            <DateRangePicker
              label="When did it happen?"
              placeholder="Select date(s)"
              onApply={handleDateChange}
              initialFrom={formData.dateStart}
              initialTo={formData.dateEnd}
            />

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

          <FABNext 
            onClick={handleNext}
            disabled={!formData.dateStart}
          />
        </>
      ) : (
        <>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mt-10 mb-8">
            Add a description
          </h1>
          <p className="text-white text-lg mb-10">Step 2 of 2 - add a description</p>

          <MomentBoardSnippet
            title={formData.title}
            dateStart={formData.dateStart}
            dateEnd={formData.dateEnd}
          />

          <div className="mt-10">
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Add an optional description. What was this moment about?"
              maxLength={250}
              rows={4}
              className="w-full px-4 py-4 rounded-xl bg-white text-base resize-none"
            />
            <div className="text-right mt-2 text-white/80 text-sm">
              {formData.description.length} / 250
            </div>
          </div>

          <div className="fixed bottom-8 left-6 right-6 flex gap-4">
            <button
              onClick={handleBack}
              className="flex-1 bg-white/20 text-white py-4 rounded-full text-base"
            >
              Back
            </button>
            <button
              onClick={handleCreate}
              disabled={loading}
              className="flex-1 bg-orange-500 text-white py-4 rounded-full text-base disabled:opacity-70"
            >
              {loading ? 'Creating...' : 'Create moment'}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default CreateMomentBoard;
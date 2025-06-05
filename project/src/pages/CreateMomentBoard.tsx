import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DateRangePicker } from '@mui/x-date-pickers-pro/DateRangePicker';
import { format } from 'date-fns';
import MomentBoardSnippet from '../components/MomentBoardSnippet';
import { createMomentBoard } from '../services/supabase';

const CreateMomentBoard: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const today = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
  const [formData, setFormData] = useState<{
    title: string;
    dateRange: [Date | null, Date | null];
    description: string;
  }>({
    title: '',
    dateRange: [new Date(), new Date()],
    description: ''
  });
  const [loading, setLoading] = useState(false);

  const handleNext = () => {
    if (formData.dateRange[0]) {
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
        date_start: formData.dateRange[0] ? formData.dateRange[0].toISOString().split('T')[0] : '',
        date_end: formData.dateRange[1] ? formData.dateRange[1].toISOString().split('T')[0] : '',
        description: formData.description || undefined
      });
      navigate(`/share/${board.id}`);
    } catch (error) {
      console.error('Error creating board:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDateRangeChange = (newRange: [Date | null, Date | null]) => {
    setFormData(prev => ({ ...prev, dateRange: newRange }));
  };

  return (
    <div className="min-h-screen" style={{ background: '#DCE9D7' }}>
      {step === 1 ? (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
        <div className="max-w-md mx-auto px-4 pt-8">
          <h1 className="text-headline-small font-roboto-flex text-on-surface mb-2">When is the moment?</h1>
          <p className="text-body-large font-roboto-flex text-on-surface-variant mb-8">Step 1 of 2 – date and title</p>
          <div className="space-y-6">
            <div>
              <label className="block text-title-medium font-roboto-flex text-on-surface mb-2">Date or date range</label>
              <DateRangePicker
                value={formData.dateRange as [Date | null, Date | null]}
                onChange={handleDateRangeChange}
                format="yyyy-MM-dd"
                slotProps={{
                  textField: {
                    fullWidth: true,
                    variant: 'outlined',
                    className: 'w-full rounded-xl border border-outline-variant bg-surface text-on-surface text-body-large font-roboto-flex',
                    InputProps: { style: { borderRadius: '0.75rem' } },
                  },
                  popper: {
                    sx: { zIndex: 1300 },
                  },
                }}
              />
            </div>
            <div>
              <label className="block text-title-medium font-roboto-flex text-on-surface mb-2">Title (optional)</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g. Sarah's birthday, Summer BBQ"
                maxLength={50}
                className="w-full px-4 py-4 rounded-xl border border-outline-variant bg-surface text-on-surface text-body-large font-roboto-flex focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              />
              <div className="text-right mt-2 text-label-medium text-on-surface-variant">
                {formData.title.length} / 50
              </div>
            </div>
          </div>
          <div className="fixed max-w-md mx-auto inset-x-0 bottom-8 px-8 flex gap-4">
            <Link
              to="/timeline"
              className="flex-1 bg-surface-container-highest text-on-surface py-4 rounded-full text-base font-medium border border-outline-variant hover:bg-surface-container-highest/80 flex items-center justify-center transition-colors"
            >
              Cancel
            </Link>
            <button
              onClick={handleNext}
              disabled={!formData.dateRange[0]}
              className="flex-1 bg-primary text-on-primary py-4 rounded-full text-base font-medium shadow-md transition-colors hover:bg-primary/90 active:bg-primary/80 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              aria-label="Next"
            >
              Next
            </button>
          </div>
        </div>
        </LocalizationProvider>
      ) : (
        <div className="max-w-md mx-auto px-4 pt-8">
          <h1 className="text-headline-small font-roboto-flex text-on-surface mb-2">Add a description</h1>
          <p className="text-body-large font-roboto-flex text-on-surface-variant mb-8">Step 2 of 2 – add a description</p>
          <div className="bg-surface-container-low rounded-2xl overflow-hidden border border-outline-variant">
            <MomentBoardSnippet
              title={formData.title}
              dateStart={formData.dateRange[0] ? formData.dateRange[0].toISOString().split('T')[0] : ''}
              dateEnd={formData.dateRange[1] ? formData.dateRange[1].toISOString().split('T')[0] : ''}
              className="rounded-none"
            />
            <div className="p-4">
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Add an optional description. What was this moment about?"
                maxLength={250}
                rows={6}
                className="w-full resize-none text-body-large font-roboto-flex rounded-xl border border-outline-variant bg-surface text-on-surface px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>
          </div>
          <div className="text-right mt-2 text-label-medium text-on-surface-variant">
            {formData.description.length} / 250
          </div>
          <div className="fixed max-w-md mx-auto inset-x-0 bottom-8 px-8 flex gap-4">
            <button
              onClick={handleBack}
              className="flex-1 bg-surface-container-highest text-on-surface py-4 rounded-full text-base font-medium border border-outline-variant hover:bg-surface-container-highest/80 flex items-center justify-center transition-colors"
            >
              Back
            </button>
            <button
              onClick={handleCreate}
              disabled={loading}
              className="flex-1 bg-primary text-on-primary py-4 rounded-full text-base font-medium shadow-md transition-colors hover:bg-primary/90 active:bg-primary/80 disabled:opacity-70 flex items-center justify-center"
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
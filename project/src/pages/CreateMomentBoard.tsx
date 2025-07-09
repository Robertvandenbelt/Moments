import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ArrowLeft, Calendar, Edit3, Plus } from 'lucide-react';
import DatePickerModal, { DatePickerMode } from '../components/DatePickerModal';
import { createMomentBoard } from '../services/supabase';

const TITLE_MAX = 50;

const CreateMomentBoard: React.FC = () => {
  const navigate = useNavigate();
  const [pickerMode, setPickerMode] = useState<DatePickerMode>('single');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedRange, setSelectedRange] = useState<{ from: string; to: string } | null>(null);
  const [title, setTitle] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const getDisplayValue = () => {
    if (pickerMode === 'single') {
      return selectedDate ? format(new Date(selectedDate), 'MMM d, yyyy') : 'Select date';
    } else {
      if (selectedRange && selectedRange.from && selectedRange.to) {
        return `${format(new Date(selectedRange.from), 'MMM d, yyyy')} – ${format(new Date(selectedRange.to), 'MMM d, yyyy')}`;
      } else {
        return 'Select date range';
      }
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pickerMode === 'single' && !selectedDate) return;
    if (pickerMode === 'range' && (!selectedRange || !selectedRange.from || !selectedRange.to)) return;
    if (!title.trim()) return;
    
    setIsLoading(true);
    try {
      const board = await createMomentBoard({
        title: title.trim(),
        description: undefined,
        date_start: pickerMode === 'single' ? selectedDate! : selectedRange!.from,
        date_end: pickerMode === 'range' ? selectedRange!.to : undefined
      });
      navigate(`/share/${board.id}`);
    } catch (error) {
      console.error('Error creating moment board:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = () => {
    const hasValidDate = pickerMode === 'single' ? selectedDate !== null : 
      (selectedRange !== null && selectedRange.from && selectedRange.to);
    const hasValidTitle = title.trim().length > 0;
    return hasValidDate && hasValidTitle;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-teal-50">
      {/* Top App Bar */}
      <div className="sticky top-0 z-40 bg-surface/80 backdrop-blur-md border-b border-outline-variant">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-surface-container-highest transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="w-6 h-6 text-on-surface" />
          </button>
          <h1 className="text-title-large font-roboto-flex text-on-surface">Create Moment</h1>
          <div className="w-10" /> {/* Spacer for centering */}
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 py-6 max-w-md mx-auto">
        <div className="space-y-8">
          {/* Date Selection Section */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary-container">
                <Calendar className="w-5 h-5 text-on-primary-container" />
              </div>
              <h2 className="text-title-medium font-roboto-flex text-on-surface">When did it happen? <span className="text-error">*</span></h2>
            </div>
            
            {/* Date Mode Toggle */}
            <div className="inline-flex mb-4 shadow-sm rounded-full bg-surface-container-lowest border border-outline-variant" role="group">
              <button
                type="button"
                onClick={() => setPickerMode('single')}
                className={`px-4 py-2 text-label-large font-roboto-flex rounded-l-full border-r border-outline-variant transition-colors ${
                  pickerMode === 'single' 
                    ? 'bg-primary text-on-primary' 
                    : 'bg-surface text-on-surface hover:bg-surface-container-highest'
                }`}
              >
                Single Date
              </button>
              <button
                type="button"
                onClick={() => setPickerMode('range')}
                className={`px-4 py-2 text-label-large font-roboto-flex rounded-r-full transition-colors ${
                  pickerMode === 'range' 
                    ? 'bg-primary text-on-primary' 
                    : 'bg-surface text-on-surface hover:bg-surface-container-highest'
                }`}
              >
                Date Range
              </button>
            </div>

            {/* Date Display - Material 3 Outlined Text Field */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="w-full px-4 py-4 rounded-4xl bg-surface text-left border border-outline-variant hover:border-primary hover:bg-surface-container-lowest transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <div className="flex items-center justify-between">
                  <span className="text-body-large text-on-surface">{getDisplayValue()}</span>
                  <Calendar className="w-5 h-5 text-on-surface-variant" />
                </div>
              </button>
            </div>
          </div>

          {/* Title Section - Material 3 Outlined Text Field */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-secondary-container">
                <Edit3 className="w-5 h-5 text-on-secondary-container" />
              </div>
              <h2 className="text-title-medium font-roboto-flex text-on-surface">Give it a title <span className="text-error">*</span></h2>
            </div>
            
            <div className="space-y-2">
              <div className="relative">
                <input
                  type="text"
                  value={title}
                  maxLength={TITLE_MAX}
                  onChange={e => setTitle(e.target.value.slice(0, TITLE_MAX))}
                  className="w-full px-4 py-4 rounded-4xl bg-surface text-body-large text-on-surface border border-outline-variant focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors peer"
                  placeholder=" "
                  required
                />
                <label className="absolute left-4 top-4 text-body-large text-on-surface-variant transition-all duration-200 peer-focus:text-primary peer-focus:text-label-small peer-focus:-translate-y-2 peer-focus:bg-surface peer-focus:px-2 peer-[:not(:placeholder-shown)]:text-label-small peer-[:not(:placeholder-shown)]:-translate-y-2 peer-[:not(:placeholder-shown)]:bg-surface peer-[:not(:placeholder-shown)]:px-2">
                  e.g., Summer Vacation 2024
                </label>
              </div>
              <div className="flex justify-end">
                <span className="text-label-small text-on-surface-variant">{title.length}/{TITLE_MAX}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-4">
            <button
              type="button"
              onClick={handleCreate}
              disabled={isLoading || !isFormValid()}
              className="w-full py-4 px-6 bg-primary text-on-primary rounded-4xl text-label-large font-roboto-flex hover:bg-primary-container transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-on-primary border-t-transparent rounded-full animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5" />
                  Create Moment
                </>
              )}
            </button>
            
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="w-full py-4 px-6 bg-surface-container-highest text-on-surface rounded-4xl text-label-large font-roboto-flex hover:bg-surface-container-high transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>

      {/* Date Picker Modal */}
      <DatePickerModal
        open={modalOpen}
        mode={pickerMode}
        initialDate={pickerMode === 'single' ? selectedDate ?? undefined : undefined}
        initialRange={pickerMode === 'range' ? selectedRange ?? undefined : undefined}
        onCancel={() => setModalOpen(false)}
        onConfirm={val => {
          setModalOpen(false);
          if (pickerMode === 'single') {
            setSelectedDate(typeof val === 'string' ? val : null);
          } else {
            setSelectedRange(typeof val === 'object' && val && 'from' in val && 'to' in val ? val : null);
          }
        }}
      />
    </div>
  );
};

export default CreateMomentBoard;
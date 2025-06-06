import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import DatePickerModal, { DatePickerMode } from '../components/DatePickerModal';
import { createMomentBoard } from '../services/supabase';

const PRIMARY_COLOR = '#6750A4';
const OUTLINE_COLOR = '#D1C4E9';
const TITLE_MAX = 50;
const DESC_MAX = 500;

const CreateMomentBoard: React.FC = () => {
  const navigate = useNavigate();
  const [pickerMode, setPickerMode] = useState<DatePickerMode>('single');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(format(new Date(), 'yyyy-MM-dd'));
  const [selectedRange, setSelectedRange] = useState<{ from: string; to: string } | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Show value in input/button
  const getDisplayValue = () => {
    if (pickerMode === 'single') {
      return selectedDate ? format(new Date(selectedDate), 'MMM d, yyyy') : 'Select date';
    } else {
      if (selectedRange && selectedRange.from && selectedRange.to) {
        return `${format(new Date(selectedRange.from), 'MMM d, yyyy')} – ${format(new Date(selectedRange.to), 'MMM d, yyyy')}`;
      } else {
        return 'Select range';
      }
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pickerMode === 'single' && !selectedDate) return;
    if (pickerMode === 'range' && (!selectedRange || !selectedRange.from || !selectedRange.to)) return;
    setIsLoading(true);
    try {
      const board = await createMomentBoard({
        title: title || undefined,
        description: description || undefined,
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

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center">
      <div className="max-w-md w-full p-8 rounded-xl shadow" style={{ background: '#DCE9D7' }}>
        <h1 className="text-2xl font-bold mb-6">Create new Moment</h1>
        {/* Material 3 Segmented Button */}
        <div className="inline-flex mb-4 shadow-sm rounded-full bg-surface-container-lowest border border-outline-variant" role="group" aria-label="Date picker mode">
          <button
            type="button"
            aria-pressed={pickerMode === 'single'}
            onClick={() => setPickerMode('single')}
            className={`px-4 py-2 focus:z-10 focus:outline-none text-label-large font-roboto-flex rounded-l-full border-r border-outline-variant transition-colors
              ${pickerMode === 'single' ? 'bg-primary text-on-primary border-primary' : 'bg-surface text-on-surface hover:bg-surface-container-highest'}`}
          >
            Single Date
          </button>
          <button
            type="button"
            aria-pressed={pickerMode === 'range'}
            onClick={() => setPickerMode('range')}
            className={`px-4 py-2 focus:z-10 focus:outline-none text-label-large font-roboto-flex rounded-r-full transition-colors
              ${pickerMode === 'range' ? 'bg-primary text-on-primary border-primary' : 'bg-surface text-on-surface hover:bg-surface-container-highest'}`}
          >
            Date Range
          </button>
        </div>
        <form onSubmit={handleCreate} className="space-y-6">
          <div>
            <label className="block mb-2 font-medium">Date <span className="text-red-500">*</span></label>
            <button
              type="button"
              className="w-full px-4 py-3 border rounded text-left bg-gray-50"
              onClick={() => setModalOpen(true)}
            >
              {getDisplayValue()}
            </button>
          </div>
          <div>
            <label htmlFor="title" className="block text-title-medium font-roboto-flex text-on-background mb-2">
              Title (optional)
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={title}
              maxLength={TITLE_MAX}
              onChange={e => setTitle(e.target.value.slice(0, TITLE_MAX))}
              className="w-full px-4 py-4 rounded-xl bg-surface text-body-large text-on-surface border border-outline-variant focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Enter a title for your moment board"
            />
            <div className="flex justify-end mt-1">
              <span className="text-xs text-on-surface-variant">{title.length}/{TITLE_MAX}</span>
            </div>
          </div>
          <div>
            <label htmlFor="description" className="block text-title-medium font-roboto-flex text-on-background mb-2">
              Description (optional)
            </label>
            <textarea
              id="description"
              name="description"
              value={description}
              maxLength={DESC_MAX}
              onChange={e => setDescription(e.target.value.slice(0, DESC_MAX))}
              rows={4}
              className="w-full px-4 py-4 rounded-xl bg-surface text-body-large text-on-surface border border-outline-variant focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              placeholder="Describe what this moment board is about"
            />
            <div className="flex justify-end mt-1">
              <span className="text-xs text-on-surface-variant">{description.length}/{DESC_MAX}</span>
            </div>
          </div>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex-1 py-4 px-6 bg-surface-container-highest text-on-surface rounded-xl text-label-large font-roboto-flex hover:bg-surface-container-high transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || (pickerMode === 'single' && !selectedDate) || (pickerMode === 'range' && (!selectedRange || !selectedRange.from || !selectedRange.to))}
              className="flex-1 py-4 px-6 bg-primary text-on-primary rounded-xl text-label-large font-roboto-flex hover:bg-primary-container transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creating...' : 'Create Moment'}
            </button>
          </div>
        </form>
      </div>
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
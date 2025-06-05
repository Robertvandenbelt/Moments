import React, { useState, useRef, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CalendarDays } from 'lucide-react';
import { DayPicker, DateRange } from 'react-day-picker';
import { format, addYears, getYear, setYear } from 'date-fns';
import MomentBoardSnippet from '../components/MomentBoardSnippet';
import { createMomentBoard } from '../services/supabase';
import 'react-day-picker/dist/style.css';
import './CreateMomentBoard.css';
import { CaptionProps } from 'react-day-picker';

const CreateMomentBoard: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const today = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
  const [formData, setFormData] = useState<{
    title: string;
    dateRange: DateRange | undefined;
    description: string;
  }>({
    title: '',
    dateRange: { from: new Date(), to: undefined },
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [showDateModal, setShowDateModal] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [dateMode, setDateMode] = useState<'single' | 'range'>('single');
  const [calendarMonth, setCalendarMonth] = useState<Date>(new Date());
  const handleMonthChange = useCallback((date: Date) => setCalendarMonth(date), []);

  const handleNext = () => {
    if (formData.dateRange?.from) {
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
        date_start: formData.dateRange?.from ? format(formData.dateRange.from, 'yyyy-MM-dd') : '',
        date_end: dateMode === 'range' && formData.dateRange?.to ? format(formData.dateRange.to, 'yyyy-MM-dd') : '',
        description: formData.description || undefined
      });
      navigate(`/share/${board.id}`);
    } catch (error) {
      console.error('Error creating board:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (date: Date | undefined) => {
    setFormData(prev => ({ ...prev, dateRange: date ? { from: date, to: undefined } : undefined }));
    if (date) setShowDateModal(false);
  };

  const handleDateRangeChange = (newRange: DateRange | undefined) => {
    setFormData(prev => ({ ...prev, dateRange: newRange }));
    if (newRange?.from && newRange?.to) {
      setShowDateModal(false);
    }
  };

  const getDateRangeLabel = () => {
    const { from, to } = formData.dateRange || {};
    if (!from) return '';
    if (dateMode === 'single' || !to) return format(from, 'MMM d, yyyy');
    return `${format(from, 'MMM d, yyyy')} – ${format(to, 'MMM d, yyyy')}`;
  };

  // Custom dropdown for year selection
  const YearDropdown: React.FC<{
    years: number[];
    value: number;
    onChange: (year: number) => void;
  }> = ({ years, value, onChange }) => {
    const [open, setOpen] = useState(false);
    const btnRef = useRef<HTMLButtonElement>(null);

    // Close dropdown on outside click
    React.useEffect(() => {
      if (!open) return;
      const handleClick = (e: MouseEvent) => {
        if (btnRef.current && !btnRef.current.contains(e.target as Node)) {
          setOpen(false);
        }
      };
      document.addEventListener('mousedown', handleClick);
      return () => document.removeEventListener('mousedown', handleClick);
    }, [open]);

    return (
      <div className="relative">
        <button
          ref={btnRef}
          type="button"
          className="px-2 py-1 rounded-md border border-outline-variant bg-surface text-on-surface text-label-large font-roboto-flex focus:outline-none focus:ring-2 focus:ring-primary min-w-[60px] max-w-[70px] flex items-center justify-between"
          onClick={() => setOpen((v) => !v)}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-label="Select year"
        >
          {value}
          <span className="material-symbols-outlined ml-1 text-on-surface-variant" style={{ fontSize: 18 }}>
            expand_more
          </span>
        </button>
        {open && (
          <ul
            className="absolute right-0 z-50 mt-1 max-h-56 w-24 overflow-y-auto rounded-lg bg-surface shadow-lg border border-outline-variant py-1"
            style={{ minWidth: 70 }}
            role="listbox"
          >
            {years.map((year) => (
              <li
                key={year}
                className={`px-4 py-2 cursor-pointer text-label-large font-roboto-flex hover:bg-surface-container-highest ${year === value ? 'bg-primary text-on-primary' : 'text-on-surface'}`}
                onClick={() => {
                  onChange(year);
                  setOpen(false);
                }}
                role="option"
                aria-selected={year === value}
              >
                {year}
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  };

  // Custom caption with year dropdown
  type YearMonthCaptionProps = CaptionProps & { setCalendarMonth: (date: Date) => void };

  const YearMonthCaption: React.FC<YearMonthCaptionProps> = ({ displayMonth, setCalendarMonth }) => {
    const thisYear = getYear(new Date());
    const years = Array.from({ length: 21 }, (_, i) => thisYear - 10 + i);
    return (
      <div className="flex items-center justify-between px-2">
        <span className="text-title-medium font-roboto-flex text-on-surface" style={{ flex: 1, marginRight: '0.5rem', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {displayMonth.toLocaleString(undefined, { month: 'long' })}
        </span>
        <YearDropdown
          years={years}
          value={getYear(displayMonth)}
          onChange={year => setCalendarMonth(setYear(displayMonth, year))}
        />
      </div>
    );
  };

  return (
    <div className="min-h-screen" style={{ background: '#DCE9D7' }}>
      {step === 1 ? (
        <div className="max-w-md mx-auto px-4 pt-8">
          <h1 className="text-headline-small font-roboto-flex text-on-surface mb-2">When is the moment?</h1>
          <p className="text-body-large font-roboto-flex text-on-surface-variant mb-8">Step 1 of 2 – date and title</p>
          <div className="space-y-6">
            <div>
              <label className="block text-title-medium font-roboto-flex text-on-surface mb-2">Date or date range</label>
              <div className="relative">
                <input
                  ref={inputRef}
                  type="text"
                  readOnly
                  value={getDateRangeLabel()}
                  onClick={() => setShowDateModal(true)}
                  className="w-full px-4 py-4 rounded-xl border border-outline-variant bg-surface text-on-surface text-body-large font-roboto-flex focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary pr-12 cursor-pointer"
                  placeholder="Select date or range"
                  aria-label="Select date or date range"
                />
                <button
                  type="button"
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-surface-container-highest transition-colors"
                  onClick={() => setShowDateModal(true)}
                  tabIndex={-1}
                  aria-label="Open date picker"
                >
                  <CalendarDays size={22} className="text-on-surface-variant" />
                </button>
              </div>
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
              disabled={!formData.dateRange?.from}
              className="flex-1 bg-primary text-on-primary py-4 rounded-full text-base font-medium shadow-md transition-colors hover:bg-primary/90 active:bg-primary/80 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              aria-label="Next"
            >
              Next
            </button>
          </div>
          {showDateModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
              <div className="bg-surface rounded-2xl shadow-xl p-0 max-w-lg w-full relative animate-fade-in-up modal-calendar-container">
                <div className="flex items-center justify-between h-14 px-4 border-b border-outline-variant">
                  <span className="text-title-medium font-roboto-flex text-on-surface">
                    {dateMode === 'single' ? 'Select date' : 'Select date range'}
                  </span>
                  <button
                    className="p-2 rounded-full hover:bg-surface-container-highest transition-colors"
                    onClick={() => setShowDateModal(false)}
                    aria-label="Close date picker"
                  >
                    <span
                      className="material-symbols-outlined text-on-surface-variant"
                      style={{ fontSize: 28, fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' -25, 'opsz' 24" }}
                    >
                      close
                    </span>
                  </button>
                </div>
                <div className="flex justify-center py-3 border-b border-outline-variant bg-surface-container-low">
                  <button
                    className={`px-4 py-2 rounded-l-full border border-outline-variant text-label-large font-roboto-flex transition-colors focus:outline-none ${dateMode === 'single' ? 'bg-primary text-on-primary border-primary' : 'bg-surface text-on-surface hover:bg-surface-container-highest'}`}
                    aria-pressed={dateMode === 'single'}
                    onClick={() => setDateMode('single')}
                    type="button"
                  >
                    Single date
                  </button>
                  <button
                    className={`px-4 py-2 rounded-r-full border-t border-b border-r border-outline-variant text-label-large font-roboto-flex transition-colors focus:outline-none ${dateMode === 'range' ? 'bg-primary text-on-primary border-primary' : 'bg-surface text-on-surface hover:bg-surface-container-highest'}`}
                    aria-pressed={dateMode === 'range'}
                    onClick={() => setDateMode('range')}
                    type="button"
                  >
                    Date range
                  </button>
                </div>
                {dateMode === 'single' ? (
                  <DayPicker
                    mode="single"
                    selected={formData.dateRange?.from}
                    onSelect={handleDateChange}
                    numberOfMonths={1}
                    className="!font-roboto-flex custom-daypicker-m3"
                    initialFocus
                    month={calendarMonth}
                    onMonthChange={handleMonthChange}
                    components={{ Caption: (props) => <YearMonthCaption {...props} setCalendarMonth={setCalendarMonth} /> }}
                  />
                ) : (
                  <DayPicker
                    mode="range"
                    selected={formData.dateRange}
                    onSelect={handleDateRangeChange}
                    numberOfMonths={1}
                    className="!font-roboto-flex custom-daypicker-m3"
                    initialFocus
                    month={calendarMonth}
                    onMonthChange={handleMonthChange}
                    components={{ Caption: (props) => <YearMonthCaption {...props} setCalendarMonth={setCalendarMonth} /> }}
                  />
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="max-w-md mx-auto px-4 pt-8">
          <h1 className="text-headline-small font-roboto-flex text-on-surface mb-2">Add a description</h1>
          <p className="text-body-large font-roboto-flex text-on-surface-variant mb-8">Step 2 of 2 – add a description</p>
          <div className="bg-surface-container-low rounded-2xl overflow-hidden border border-outline-variant">
            <MomentBoardSnippet
              title={formData.title}
              dateStart={formData.dateRange?.from ? format(formData.dateRange.from, 'yyyy-MM-dd') : ''}
              dateEnd={formData.dateRange?.to ? format(formData.dateRange.to, 'yyyy-MM-dd') : ''}
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
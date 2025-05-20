import React, { useState, useRef, useEffect } from 'react';
import { DayPicker } from 'react-day-picker';
import { format } from 'date-fns';
import { Calendar } from 'lucide-react';
import 'react-day-picker/dist/style.css';

type DateRangePickerProps = {
  onApply: (dates: { from: string; to?: string }) => void;
  initialFrom?: string;
  initialTo?: string;
  label: string;
  placeholder?: string;
};

const DateRangePicker: React.FC<DateRangePickerProps> = ({
  onApply,
  initialFrom,
  initialTo,
  label,
  placeholder = 'Select date'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState<{ 
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: initialFrom ? new Date(initialFrom) : undefined,
    to: initialTo ? new Date(initialTo) : undefined
  });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleApply = () => {
    if (selected.from) {
      onApply({
        from: format(selected.from, 'yyyy-MM-dd'),
        to: selected.to ? format(selected.to, 'yyyy-MM-dd') : undefined
      });
      setIsOpen(false);
    }
  };

  const handleCancel = () => {
    setSelected({ from: undefined, to: undefined });
    setIsOpen(false);
  };

  const displayValue = selected.from
    ? selected.to
      ? `${format(selected.from, 'MMM d, yyyy')} - ${format(selected.to, 'MMM d, yyyy')}`
      : format(selected.from, 'MMM d, yyyy')
    : placeholder;

  const modifiersStyles = {
    selected: {
      backgroundColor: '#F97316',
      color: 'white',
      borderRadius: '0.75rem'
    },
    today: {
      color: '#F97316',
      fontWeight: 'bold'
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <label className="block text-white text-lg mb-4">
        {label}
      </label>
      
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-4 rounded-xl bg-white text-left text-base flex items-center gap-3 border border-gray-200 hover:border-orange-200 transition-colors"
      >
        <Calendar className="text-gray-500 shrink-0" size={20} />
        <span className="flex-1 text-gray-900 truncate">{displayValue}</span>
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-2 bg-white rounded-2xl shadow-xl p-4 w-[300px] sm:w-[320px] max-h-[80vh] overflow-y-auto left-1/2 -translate-x-1/2">
          <DayPicker
            mode="range"
            selected={selected}
            onSelect={(range) => setSelected(range || { from: undefined, to: undefined })}
            modifiersStyles={modifiersStyles}
            styles={{
              caption: { 
                color: '#1F2937',
                fontSize: '0.875rem',
                fontWeight: '600'
              },
              head: { 
                color: '#9CA3AF',
                fontSize: '0.75rem'
              },
              day: {
                margin: '1px',
                height: '36px',
                width: '36px'
              },
              nav: {
                buttonPrevious: {
                  marginRight: '0.5rem'
                },
                buttonNext: {
                  marginLeft: '0.5rem'
                }
              }
            }}
            className="!font-sans [&_.rdp-day]:!text-sm [&_.rdp-day]:!font-medium [&_.rdp-day:hover]:!bg-orange-50 [&_.rdp-day_button]:!h-9 [&_.rdp-day_button]:!w-9"
          />
          
          <div className="flex gap-2 mt-4">
            <button
              onClick={handleCancel}
              className="flex-1 py-2.5 px-4 bg-gray-200 text-gray-900 rounded-xl text-sm font-medium hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              disabled={!selected.from}
              className="flex-1 py-2.5 px-4 bg-orange-500 text-white rounded-xl text-sm font-medium hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-orange-500"
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DateRangePicker;
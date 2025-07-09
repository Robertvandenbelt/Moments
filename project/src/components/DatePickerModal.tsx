import React, { useState } from 'react';
import { DayPicker, DateRange } from 'react-day-picker';
import { format, getYear, setYear, subMonths, addMonths, getMonth, setMonth } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export type DatePickerMode = 'single' | 'range';

type DatePickerModalProps = {
  open: boolean;
  mode: DatePickerMode;
  initialDate?: string;
  initialRange?: { from?: string; to?: string };
  onConfirm: (value: string | { from: string; to: string } | null) => void;
  onCancel: () => void;
};

const CustomCaption: React.FC<{
  displayMonth: Date;
  setCurrentMonth: (date: Date) => void;
}> = ({ displayMonth, setCurrentMonth }) => {
  const currentYear = getYear(new Date());
  const years = Array.from({ length: 51 }, (_, i) => currentYear - 25 + i);
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newYear = parseInt(e.target.value, 10);
    setCurrentMonth(setYear(displayMonth, newYear));
  };

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newMonth = parseInt(e.target.value, 10);
    setCurrentMonth(setMonth(displayMonth, newMonth));
  };

  return (
    <div className="flex items-center justify-between px-4 py-3">
      {/* Month and Year Dropdowns */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <select
            value={getMonth(displayMonth)}
            onChange={handleMonthChange}
            className="appearance-none bg-surface-container-lowest text-on-surface text-label-large font-roboto-flex px-3 py-2 pr-8 rounded-lg border border-outline-variant focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors cursor-pointer"
            aria-label="Select month"
          >
            {months.map((month, index) => (
              <option key={month} value={index}>
                {month}
              </option>
            ))}
          </select>
          <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
            <ChevronRight className="w-4 h-4 text-on-surface-variant rotate-90" />
          </div>
        </div>
        
        <div className="relative">
          <select
            value={getYear(displayMonth)}
            onChange={handleYearChange}
            className="appearance-none bg-surface-container-lowest text-on-surface text-label-large font-roboto-flex px-3 py-2 pr-8 rounded-lg border border-outline-variant focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors cursor-pointer"
            aria-label="Select year"
          >
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
          <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
            <ChevronRight className="w-4 h-4 text-on-surface-variant rotate-90" />
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => setCurrentMonth(subMonths(displayMonth, 1))}
          className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-surface-container-highest transition-colors"
          aria-label="Previous month"
        >
          <ChevronLeft className="w-5 h-5 text-on-surface" />
        </button>
        <button
          type="button"
          onClick={() => setCurrentMonth(addMonths(displayMonth, 1))}
          className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-surface-container-highest transition-colors"
          aria-label="Next month"
        >
          <ChevronRight className="w-5 h-5 text-on-surface" />
        </button>
      </div>
    </div>
  );
};

const getHeaderLabel = (
  mode: DatePickerMode,
  selected: Date | undefined,
  range: DateRange | undefined
) => {
  if (mode === 'single') {
    return selected ? format(selected, 'MMMM d, yyyy') : 'Select date';
  } else {
    if (range?.from && range?.to) {
      return `${format(range.from, 'MMM d')} – ${format(range.to, 'MMM d, yyyy')}`;
    } else if (range?.from) {
      return `${format(range.from, 'MMM d, yyyy')} –`;
    } else {
      return 'Select date range';
    }
  }
};

const DatePickerModal: React.FC<DatePickerModalProps> = ({
  open,
  mode,
  initialDate,
  initialRange,
  onConfirm,
  onCancel
}) => {
  const [selected, setSelected] = useState<Date | undefined>(
    initialDate ? new Date(initialDate) : undefined
  );
  const [range, setRange] = useState<DateRange | undefined>(
    initialRange && (initialRange.from || initialRange.to)
      ? {
          from: initialRange.from ? new Date(initialRange.from) : undefined,
          to: initialRange.to ? new Date(initialRange.to) : undefined
        }
      : undefined
  );
  const [currentMonth, setCurrentMonth] = useState<Date>(
    selected || range?.from || new Date()
  );

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div 
        className="bg-surface rounded-3xl shadow-2xl max-w-sm w-full max-h-[90vh] overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-outline-variant">
          <h2 className="text-headline-small font-roboto-flex text-on-surface">
            {getHeaderLabel(mode, selected, range)}
          </h2>
        </div>

        {/* Calendar */}
        <div className="p-4">
          <style>{`
            .rdp {
              --rdp-cell-size: 40px;
              --rdp-accent-color: #6750A4;
              --rdp-background-color: #E8DEF8;
              --rdp-accent-color-dark: #6750A4;
              --rdp-background-color-dark: #E8DEF8;
              --rdp-outline: 2px solid var(--rdp-accent-color);
              --rdp-outline-selected: 2px solid var(--rdp-accent-color);
              margin: 0;
            }
            
            .rdp-table {
              width: 100%;
              border-collapse: collapse;
            }
            
            .rdp-head_cell {
              font-weight: 500;
              font-size: 12px;
              color: #6750A4;
              padding: 8px 0;
              text-align: center;
              font-family: 'Roboto Flex', sans-serif;
            }
            
            .rdp-cell {
              padding: 0;
              text-align: center;
            }
            
            .rdp-button {
              width: var(--rdp-cell-size);
              height: var(--rdp-cell-size);
              border-radius: 50%;
              border: none;
              background: transparent;
              color: #1C1B1F;
              font-size: 14px;
              font-family: 'Roboto Flex', sans-serif;
              cursor: pointer;
              transition: all 0.2s ease;
            }
            
            .rdp-button:hover:not([disabled]) {
              background: #E8DEF8;
              color: #6750A4;
            }
            
            .rdp-button:focus-visible {
              outline: 2px solid #6750A4;
              outline-offset: 2px;
            }
            
            .rdp-day_selected {
              background: #6750A4 !important;
              color: white !important;
            }
            
            .rdp-day_selected:hover {
              background: #5A4A7A !important;
            }
            
            .rdp-day_range_start {
              background: #6750A4 !important;
              color: white !important;
            }
            
            .rdp-day_range_end {
              background: #6750A4 !important;
              color: white !important;
            }
            
            .rdp-day_range_middle {
              background: #E8DEF8 !important;
              color: #6750A4 !important;
            }
            
            .rdp-day_today {
              font-weight: bold;
              color: #6750A4;
            }
            
            .rdp-day_outside {
              color: #CAC4D0;
            }
            
            .rdp-button[disabled] {
              color: #CAC4D0;
              cursor: not-allowed;
            }
          `}</style>
          
          {mode === 'single' ? (
            <DayPicker
              mode="single"
              selected={selected}
              onSelect={setSelected}
              month={currentMonth}
              onMonthChange={setCurrentMonth}
              showOutsideDays
              components={{
                Caption: (props) => <CustomCaption {...props} setCurrentMonth={setCurrentMonth} />
              }}
            />
          ) : (
            <DayPicker
              mode="range"
              selected={range}
              onSelect={setRange}
              month={currentMonth}
              onMonthChange={setCurrentMonth}
              showOutsideDays
              components={{
                Caption: (props) => <CustomCaption {...props} setCurrentMonth={setCurrentMonth} />
              }}
            />
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 px-6 pb-6">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 text-label-large font-roboto-flex text-on-surface hover:bg-surface-container-highest rounded-full transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              if (mode === 'single') {
                onConfirm(selected ? format(selected, 'yyyy-MM-dd') : null);
              } else {
                onConfirm(
                  range && range.from && range.to
                    ? {
                        from: format(range.from, 'yyyy-MM-dd'),
                        to: format(range.to, 'yyyy-MM-dd')
                      }
                    : null
                );
              }
            }}
            disabled={
              (mode === 'single' && !selected) ||
              (mode === 'range' && (!range || !range.from || !range.to))
            }
            className="px-6 py-3 bg-primary text-on-primary text-label-large font-roboto-flex rounded-full hover:bg-primary-container transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

export default DatePickerModal; 
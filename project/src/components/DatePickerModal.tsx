import React, { useState } from 'react';
import { DayPicker, DateRange } from 'react-day-picker';
import { format, getYear, setYear, subMonths, addMonths } from 'date-fns';

// Props: onDateSelected (date string or null), onDateRangeSelected (range or null), onDismiss, initialDate, initialRange, mode, open
export type DatePickerMode = 'single' | 'range';

const PRIMARY_COLOR = '#6750A4'; // Google M3 primary
const SECONDARY_COLOR = '#E27D60'; // Your secondary
const MODAL_RADIUS = 28;
const BUTTON_RADIUS = 12;
const BUTTON_FONT_WEIGHT = 600;
const BUTTON_FONT_SIZE = 16;
const BUTTON_MIN_WIDTH = 80;
const BUTTON_MIN_HEIGHT = 40;
const BUTTON_PADDING = '12px 20px';

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
  const years = Array.from({ length: 51 }, (_, i) => currentYear - 25 + i); // 25 years back, 25 forward

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newYear = parseInt(e.target.value, 10);
    setCurrentMonth(setYear(displayMonth, newYear));
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', padding: '8px 0' }}>
      <button
        type="button"
        onClick={() => setCurrentMonth(subMonths(displayMonth, 1))}
        aria-label="Previous month"
        style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: PRIMARY_COLOR, borderRadius: BUTTON_RADIUS, padding: 4, minWidth: 32 }}
      >
        {'<'}
      </button>
      <span style={{ fontWeight: 500, fontSize: 16 }}>
        {displayMonth.toLocaleString(undefined, { month: 'long' })}
      </span>
      <select
        value={getYear(displayMonth)}
        onChange={handleYearChange}
        style={{ fontSize: 16, borderRadius: BUTTON_RADIUS, padding: '2px 6px', border: `1px solid ${PRIMARY_COLOR}`, color: PRIMARY_COLOR, fontWeight: BUTTON_FONT_WEIGHT, background: 'white', minWidth: 60, maxWidth: 70 }}
        aria-label="Select year"
      >
        {years.map((year) => (
          <option key={year} value={year}>
            {year}
          </option>
        ))}
      </select>
      <button
        type="button"
        onClick={() => setCurrentMonth(addMonths(displayMonth, 1))}
        aria-label="Next month"
        style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: PRIMARY_COLOR, borderRadius: BUTTON_RADIUS, padding: 4, minWidth: 32 }}
      >
        {'>'}
      </button>
    </div>
  );
};

const getHeaderLabel = (
  mode: DatePickerMode,
  selected: Date | undefined,
  range: DateRange | undefined
) => {
  if (mode === 'single') {
    return selected ? format(selected, 'MMM d, yyyy') : 'Select date';
  } else {
    if (range?.from && range?.to) {
      return `${format(range.from, 'MMM d')} – ${format(range.to, 'MMM d, yyyy')}`;
    } else if (range?.from) {
      return `${format(range.from, 'MMM d, yyyy')} –`;
    } else {
      return 'Select range';
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
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}
      aria-modal="true"
      role="dialog"
      tabIndex={-1}
      onClick={onCancel}
    >
      <div
        style={{
          background: 'white',
          borderRadius: MODAL_RADIUS,
          minWidth: 340,
          maxWidth: 400,
          width: '100%',
          boxShadow: '0 8px 32px rgba(0,0,0,0.24)',
          display: 'flex',
          flexDirection: 'column',
          padding: 0
        }}
        onClick={e => e.stopPropagation()}
        role="document"
      >
        {/* Header */}
        <div style={{ padding: '24px 24px 0 24px', borderTopLeftRadius: MODAL_RADIUS, borderTopRightRadius: MODAL_RADIUS }}>
          <div style={{ fontSize: 24, fontWeight: 600, minHeight: 40, display: 'flex', alignItems: 'center', gap: 8 }}>
            {getHeaderLabel(mode, selected, range)}
          </div>
        </div>
        {/* Calendar with custom caption */}
        <div style={{ padding: '16px 24px 0 24px' }}>
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
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, padding: '0 24px 24px 24px' }}>
          <button
            type="button"
            onClick={onCancel}
            style={{
              background: SECONDARY_COLOR,
              color: '#fff',
              border: 'none',
              borderRadius: BUTTON_RADIUS,
              fontWeight: BUTTON_FONT_WEIGHT,
              fontSize: BUTTON_FONT_SIZE,
              minWidth: BUTTON_MIN_WIDTH,
              minHeight: BUTTON_MIN_HEIGHT,
              padding: BUTTON_PADDING,
              cursor: 'pointer',
              boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
            }}
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
            style={{
              background: PRIMARY_COLOR,
              color: '#fff',
              border: 'none',
              borderRadius: BUTTON_RADIUS,
              fontWeight: BUTTON_FONT_WEIGHT,
              fontSize: BUTTON_FONT_SIZE,
              minWidth: BUTTON_MIN_WIDTH,
              minHeight: BUTTON_MIN_HEIGHT,
              padding: BUTTON_PADDING,
              cursor: (mode === 'single' && !selected) || (mode === 'range' && (!range || !range.from || !range.to)) ? 'not-allowed' : 'pointer',
              opacity: (mode === 'single' && !selected) || (mode === 'range' && (!range || !range.from || !range.to)) ? 0.5 : 1,
              boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
            }}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

export default DatePickerModal; 
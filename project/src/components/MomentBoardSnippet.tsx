import React from 'react';
import { format, isValid } from 'date-fns';

type MomentBoardSnippetProps = {
  title?: string;
  dateStart: string;
  dateEnd?: string;
  className?: string;
};

const MomentBoardSnippet: React.FC<MomentBoardSnippetProps> = ({
  title,
  dateStart,
  dateEnd,
  className = ''
}) => {
  const formatDate = (date: string) => {
    const parsed = new Date(date);
    return isValid(parsed) ? format(parsed, 'dd MMM, yyyy') : '';
  };

  const dateRange = dateEnd 
    ? `${formatDate(dateStart)} - ${formatDate(dateEnd)}`
    : formatDate(dateStart);

  // Determine the main heading based on the provided props
  const mainHeading = title ? title : dateRange;
  
  return (
    <div className={`bg-white ${className}`}>
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          {mainHeading}
        </h3>
        {title && <p className="text-gray-500">{dateRange}</p>}
      </div>
      <div className="h-px bg-orange-500" />
    </div>
  );
};

export default MomentBoardSnippet;
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
    <div className={className}>
      <div className="p-6">
        <h3 className="text-title-large font-roboto-flex text-on-surface mb-1">
          {mainHeading}
        </h3>
        {title && <p className="text-body-medium font-roboto-flex text-on-surface-variant">{dateRange}</p>}
      </div>
    </div>
  );
};

export default MomentBoardSnippet;
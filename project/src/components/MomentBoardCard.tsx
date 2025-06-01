import React from 'react';
import { format, parseISO } from 'date-fns';

type MomentBoardCardProps = {
  title?: string;
  date?: string;
  dateEnd?: string;
  description?: string;
  participantCount: number;
  unseenCardCount?: number;
  totalCardCount: number;
};

const MomentBoardCard: React.FC<MomentBoardCardProps> = ({
  title,
  date,
  dateEnd,
  description,
  participantCount,
  unseenCardCount = 0,
  totalCardCount = 0
}) => {
  const mainHeading = title || date || 'Untitled Moment';

  const formatDate = (dateString: string) => {
    return format(parseISO(dateString), 'MMMM d, yyyy');
  };

  const dateDisplay = date ? (
    dateEnd ? `${formatDate(date)} - ${formatDate(dateEnd)}` : formatDate(date)
  ) : null;

  const participantText = participantCount === 0 ? 
    'Just you' : 
    `${participantCount + 1} participants`;  // +1 to include the owner

  return (
    <article className="bg-white rounded-xl w-full p-4 sm:p-6 shadow-md transform transition hover:-translate-y-1 duration-300">
      <div className="min-w-0">
        <h3 className="text-base sm:text-xl font-semibold text-gray-900 mb-2 truncate">
          {mainHeading}
        </h3>
        {title && dateDisplay && (
          <p className="text-gray-600 text-xs sm:text-sm">
            {dateDisplay}
          </p>
        )}
      </div>
      
      {description && (
        <p className="text-gray-600 mt-3 line-clamp-2 text-sm sm:text-base">
          {description}
        </p>
      )}
      
      <div className="mt-6 flex justify-between items-center">
        <div className="text-gray-400 text-xs sm:text-sm">
          {participantText}
        </div>

        <div className="flex items-center gap-2">
          {totalCardCount > 0 && (
            <div className="text-gray-400 text-xs sm:text-sm">
              {totalCardCount} {totalCardCount === 1 ? 'card' : 'cards'}
              {unseenCardCount > 0 && (
                <span className="text-orange-500 font-medium ml-1">
                  (+{unseenCardCount} new)
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </article>
  );
};

export default MomentBoardCard;
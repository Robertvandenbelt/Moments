import React from 'react';
import { format } from 'date-fns';
import { parseISO } from 'date-fns/parseISO';
import 'material-symbols/outlined.css';

type MomentListItemProps = {
  title?: string;
  date?: string;
  dateEnd?: string;
  participantCount: number;
  unseenCardCount?: number;
  totalCardCount: number;
  previewPhotoUrl?: string;
};

const formatDate = (date: string) => {
  return format(parseISO(date), 'MMMM d, yyyy');
};

const MomentListItem: React.FC<MomentListItemProps> = ({
  title,
  date,
  dateEnd,
  participantCount,
  unseenCardCount = 0,
  totalCardCount = 0,
  previewPhotoUrl,
}) => {
  const mainHeading = title || (date ? formatDate(date) : 'Untitled Moment');

  const dateDisplay = date ? (
    dateEnd ? `${formatDate(date)} - ${formatDate(dateEnd)}` : formatDate(date)
  ) : null;

  const participantText = participantCount === 0 ? 
    'Just you' : 
    participantCount.toString();

  return (
    <div className="relative">
      <div className="flex items-center gap-4 px-4 py-4 bg-surface hover:bg-surface-container-high active:bg-surface-container-high transition-colors">
        {/* State layer for hover/press states */}
        <div className="absolute inset-0 bg-on-surface opacity-0 hover:opacity-[0.08] active:opacity-[0.12] transition-opacity duration-300" />

        {/* Leading element - Preview image or icon */}
        <div className="flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden bg-surface-container">
          {previewPhotoUrl ? (
            <img 
              src={`${previewPhotoUrl}?width=96&height=96&resize=cover&quality=80`}
              alt=""
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-primary-container rounded-lg">
              <span 
                className="material-symbols-outlined text-on-primary-container"
                style={{ 
                  fontSize: '24px',
                  fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' -25, 'opsz' 24"
                }}
              >
                photo_camera
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-grow min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-title-medium font-roboto-flex text-on-surface truncate">
              {mainHeading}
            </h3>
            {unseenCardCount > 0 && (
              <span className="inline-flex items-center h-5 px-2 rounded-full bg-primary-container text-on-primary-container text-label-small font-roboto-flex">
                +{unseenCardCount}
              </span>
            )}
          </div>
          
          {title && dateDisplay && (
            <p className="text-body-medium font-roboto-flex text-on-surface-variant">
              {dateDisplay}
            </p>
          )}

          <div className="flex items-center gap-2 mt-2">
            {participantCount > 1 && (
              <span className="inline-flex items-center h-6 px-2 rounded-full bg-primary-500 text-on-primary text-label-small font-roboto-flex">
                <span 
                  className="material-symbols-outlined text-on-primary mr-1"
                  style={{ 
                    fontSize: '16px',
                    fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' -25, 'opsz' 24"
                  }}
                >
                  group
                </span>
                {participantCount}
              </span>
            )}
          </div>
        </div>

        {/* Trailing supporting text */}
        {totalCardCount > 0 && (
          <div className="flex-shrink-0 text-right">
            <span className="text-label-medium font-roboto-flex text-on-surface-variant">
              {totalCardCount} {totalCardCount === 1 ? 'card' : 'cards'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default MomentListItem; 
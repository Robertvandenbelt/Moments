import React from 'react';
import { format, parseISO } from 'date-fns';
import 'material-symbols/outlined.css';

type MomentBoardCardProps = {
  title?: string;
  date?: string;
  dateEnd?: string;
  description?: string;
  participantCount: number;
  unseenCardCount?: number;
  totalCardCount: number;
  previewPhotoUrl?: string;
};

// Helper function to get transformed image URL
const getImageUrl = (mediaUrl: string | undefined) => {
  if (!mediaUrl) return '';
  return `${mediaUrl}?width=800&height=450&resize=cover&quality=80`;
};

const MomentBoardCard: React.FC<MomentBoardCardProps> = ({
  title,
  date,
  dateEnd,
  description,
  participantCount,
  unseenCardCount = 0,
  totalCardCount = 0,
  previewPhotoUrl
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
    participantCount.toString();

  return (
    <article 
      className="group relative bg-surface-container-low rounded-medium shadow-level1 hover:shadow-level2 active:shadow-level1 transition-all duration-300"
    >
      {/* State layer for hover/press states */}
      <div className="absolute inset-0 rounded-medium bg-on-surface opacity-0 group-hover:opacity-[0.08] group-active:opacity-[0.12] transition-opacity duration-300" />

      {previewPhotoUrl && (
        <div className="relative aspect-video w-full overflow-hidden bg-surface-container rounded-t-medium">
          <img 
            src={getImageUrl(previewPhotoUrl)}
            alt=""
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      )}

      <div className="p-4 pb-0">
        <div className="min-w-0">
          <h3 className="text-title-large font-roboto-flex text-on-surface mb-1 truncate">
            {mainHeading}
          </h3>
          {title && dateDisplay && (
            <p className="text-body-medium font-roboto-flex text-on-surface-variant">
              {dateDisplay}
            </p>
          )}
        </div>
        
        {description && (
          <p className="text-body-medium font-roboto-flex text-on-surface-variant mt-4 line-clamp-2">
            {description}
          </p>
        )}
      </div>
      
      <div className="px-4 py-4 mt-4 border-t border-outline-variant">
        <div className="flex flex-wrap items-center gap-2">
          {/* Participants Assist Chip */}
          <div className="inline-flex items-center h-8 px-3 rounded-lg bg-primary-container">
            <span 
              className="material-symbols-outlined text-on-primary-container mr-2"
              style={{ 
                fontSize: '20px',
                fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' -25, 'opsz' 24"
              }}
            >
              group
            </span>
            <span className="text-label-medium font-roboto-flex text-on-primary-container">
              {participantText}
            </span>
          </div>

          {totalCardCount > 0 && (
            <>
              {/* Cards Count Assist Chip */}
              <div className="inline-flex items-center h-8 px-3 rounded-lg bg-primary-action">
                <span 
                  className="material-symbols-outlined text-white mr-2"
                  style={{ 
                    fontSize: '20px',
                    fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' -25, 'opsz' 24"
                  }}
                >
                  photo_library
                </span>
                <span className="text-label-medium font-roboto-flex text-white">
                  {totalCardCount}
                </span>
              </div>

              {/* New Cards Badge Chip */}
              {unseenCardCount > 0 && (
                <div className="inline-flex items-center h-8 px-3 rounded-lg bg-primary-container text-on-primary-container">
                  <span className="text-label-medium font-roboto-flex">
                    +{unseenCardCount} new
                  </span>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </article>
  );
};

export default MomentBoardCard;
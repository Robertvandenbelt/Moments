import React from 'react';
import { Users, Lock, CreditCard } from 'lucide-react';

type MomentBoardCardProps = {
  title?: string;
  date?: string;
  description?: string;
  isPrivate?: boolean;
  isShared?: boolean;
  newCardCount?: number;
};

const MomentBoardCard: React.FC<MomentBoardCardProps> = ({
  title,
  date,
  description,
  isPrivate = false,
  isShared = false,
  newCardCount = 0
}) => {
  const mainHeading = title || date || 'Untitled Moment';
  
  const renderStatusIcon = () => {
    if (isPrivate) return <Lock size={20} />;
    if (isShared) return <Users size={20} />;
    return null;
  };

  return (
    <article className="bg-white rounded-2xl shadow-card overflow-hidden hover:shadow-lg transition-shadow">
      <div className="p-5">
        <div className="flex justify-between items-start gap-4">
          <div className="min-w-0 flex-1">
            <h3 className="text-xl font-bold text-gray-900 mb-1 truncate">
              {mainHeading}
            </h3>
            {title && date && (
              <p className="text-gray-400 text-sm">{date}</p>
            )}
          </div>
          {(isPrivate || isShared) && (
            <div className="text-teal flex-shrink-0">
              {renderStatusIcon()}
            </div>
          )}
        </div>
        
        {description && (
          <p className="text-gray-500 mt-3 line-clamp-2 text-sm">
            {description}
          </p>
        )}
      </div>
      
      {newCardCount > 0 && (
        <div className="px-5 pb-4 flex justify-end">
          <div className="inline-flex items-center bg-lime-200 px-3 py-1.5 rounded-full">
            <CreditCard size={16} className="text-orange mr-1.5" strokeWidth={2.5} />
            <span className="text-sm font-semibold text-orange">
              +{newCardCount}
            </span>
          </div>
        </div>
      )}
    </article>
  );
};

export default MomentBoardCard;
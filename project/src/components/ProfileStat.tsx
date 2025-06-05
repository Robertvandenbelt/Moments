import React from 'react';

type ProfileStatProps = {
  count: number;
  label: string;
  description: string;
  type: 'private' | 'shared' | 'joined' | 'cards';
};

const ProfileStat: React.FC<ProfileStatProps> = ({ count, label, description }) => {
  return (
    <div className="relative h-full rounded-medium border border-outline bg-surface-container-low">
      {/* Card Header - Using M3 spacing and typography */}
      <div className="p-6">
        <div className="flex flex-col items-center text-center">
          <div className="text-display-small font-roboto-flex text-on-surface mb-1">
            {count}
          </div>
          <h3 className="text-title-medium font-roboto-flex text-on-surface">
            {label}
          </h3>
        </div>
      </div>

      {/* Card Footer - Supporting text */}
      <div className="px-6 py-4 bg-surface-container-lowest border-t border-outline/20">
        <p className="text-body-medium text-on-surface-variant text-center">
          {description}
        </p>
      </div>
    </div>
  );
};

export default ProfileStat;
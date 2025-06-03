import React from 'react';

type ProfileStatProps = {
  count: number;
  label: string;
  description: string;
  type: 'private' | 'shared' | 'joined' | 'cards';
};

const ProfileStat: React.FC<ProfileStatProps> = ({ count, label, description }) => {
  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 p-6 bg-gradient-to-br from-orange-50 to-teal-50">
        <div className="flex flex-col items-center text-center">
          <div className="text-3xl font-bold text-gray-900 mb-2">
            {count}
          </div>
          <h3 className="text-lg font-medium text-gray-900">
            {label}
          </h3>
        </div>
      </div>
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
        <p className="text-sm text-gray-500 text-center">
          {description}
        </p>
      </div>
    </div>
  );
};

export default ProfileStat;
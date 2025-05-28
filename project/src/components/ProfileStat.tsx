import React from 'react';

type ProfileStatProps = {
  count: number;
  label: string;
  description: string;
  type: 'private' | 'shared' | 'joined' | 'cards';
};

const ProfileStat: React.FC<ProfileStatProps> = ({ count, label, description }) => {
  return (
    <div className="p-6 border-b border-gray-200 last:border-b-0 text-center">
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        {count} {label}
      </h3>
      <p className="text-gray-600">
        {description}
      </p>
    </div>
  );
};

export default ProfileStat;
import React from 'react';
import { Lock, Users, Puzzle, CreditCard } from 'lucide-react';

type ProfileStatProps = {
  count: number;
  label: string;
  description: string;
  type: 'private' | 'shared' | 'joined' | 'cards';
};

const ProfileStat: React.FC<ProfileStatProps> = ({ count, label, description, type }) => {
  const getIcon = () => {
    switch (type) {
      case 'private':
        return <Lock size={32} className="text-teal-500" />;
      case 'shared':
        return <Users size={32} className="text-teal-500" />;
      case 'joined':
        return <Puzzle size={32} className="text-teal-500" />;
      case 'cards':
        return <CreditCard size={32} className="text-teal-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="flex items-center p-4 border-b border-gray-200 last:border-b-0">
      <div className="mr-4 flex-shrink-0">
        {getIcon()}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-xl font-bold text-gray-900 mb-1">
          {count} {label}
        </h3>
        <p className="text-gray-500 text-sm">{description}</p>
      </div>
    </div>
  );
};

export default ProfileStat;
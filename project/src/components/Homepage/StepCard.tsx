import React from 'react';

interface StepCardProps {
  title: string;
  description: string;
  visual: React.ReactNode;
  stepNumber: number;
}

const StepCard: React.FC<StepCardProps> = ({
  title,
  description,
  visual,
  stepNumber,
}) => {
  return (
    <div className="relative">
      <div className="mb-6">
        <div className="flex gap-4">
          <div className="w-10 h-10 rounded-full bg-teal-500 flex items-center justify-center text-white font-semibold shrink-0">
            {stepNumber}
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
            <p className="text-gray-600">{description}</p>
          </div>
        </div>
      </div>
      <div className="rounded-2xl overflow-hidden shadow-card">
        {visual}
      </div>
    </div>
  );
};

export default StepCard; 
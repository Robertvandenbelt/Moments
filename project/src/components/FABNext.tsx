import React from 'react';
import { ArrowRight } from 'lucide-react';

type FABNextProps = {
  onClick: () => void;
  disabled?: boolean;
};

const FABNext: React.FC<FABNextProps> = ({ onClick, disabled = false }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="fab"
      aria-label="Next"
    >
      <ArrowRight size={28} />
    </button>
  );
};

export default FABNext;
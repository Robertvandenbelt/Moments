import React from 'react';

interface AvatarProps {
  name: string;
  size?: number;
}

function getInitials(name: string) {
  const words = name.trim().split(' ');
  if (words.length === 1) return words[0][0]?.toUpperCase() || '';
  return (words[0][0] + words[1][0]).toUpperCase();
}

// Optionally, generate a color from the name
function stringToColor(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const color = `hsl(${hash % 360}, 70%, 85%)`;
  return color;
}

const Avatar: React.FC<AvatarProps> = ({ name, size = 48 }) => {
  const initials = getInitials(name);
  const bgColor = stringToColor(name);
  return (
    <div
      className="flex items-center justify-center rounded-full font-bold text-primary-700"
      style={{
        width: size,
        height: size,
        backgroundColor: bgColor,
        fontSize: size * 0.45,
        userSelect: 'none',
      }}
      aria-label={name}
    >
      {initials}
    </div>
  );
};

export default Avatar; 
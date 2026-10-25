import React, { useState } from 'react';
import { resolveMediaUrl } from '../../services/api';

// Stock photos the app used to assign when someone had no photo. Older records still
// store them, so they are treated as "no photo" rather than shown as the person's face.
const PLACEHOLDER_PHOTO_IDS = [
  'photo-1534528741775-53994a69daeb',
  'photo-1500648767791-00dcc994a43e',
  'photo-1507003211169-0a1dd7228f2d',
  // Stock workshop photo once used as a default portfolio "work sample"
  'photo-1581092160607-ee22621dd758'
];

export function isRealPhoto(src?: string | null): src is string {
  return !!src && !PLACEHOLDER_PHOTO_IDS.some(id => src.includes(id));
}

function initialsOf(name?: string) {
  const words = (name || '').trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return '?';
  const first = words[0][0];
  const last = words.length > 1 ? words[words.length - 1][0] : '';
  return (first + last).toUpperCase();
}

interface AvatarProps {
  src?: string | null;
  name?: string;
  /** Size, shape and border classes, e.g. "w-12 h-12 rounded-full". */
  className?: string;
}

/**
 * A person's photo, or their initials when they have not uploaded one.
 * Never substitutes a stranger's stock photo for someone's face.
 */
export const Avatar: React.FC<AvatarProps> = ({ src, name, className = '' }) => {
  const [failed, setFailed] = useState(false);

  if (isRealPhoto(src) && !failed) {
    return <img src={resolveMediaUrl(src)} alt={name || ''} className={`object-cover ${className}`} onError={() => setFailed(true)} />;
  }

  return (
    <span role="img" aria-label={name || 'No photo'} className={`inline-flex shrink-0 overflow-hidden bg-forest-100 text-forest-800 select-none ${className}`}>
      {/* SVG text scales with whatever size the call site gives the box */}
      <svg viewBox="0 0 40 40" className="w-full h-full" aria-hidden="true">
        <text x="50%" y="50%" dominantBaseline="central" textAnchor="middle" fontSize="15" fontWeight="700" fill="currentColor" fontFamily="'Bricolage Grotesque', sans-serif">
          {initialsOf(name)}
        </text>
      </svg>
    </span>
  );
};

export default Avatar;

import React from 'react';
import { Educator } from '../types';
import { formatUGX } from '../utils/formatters';
import { ShieldCheck, Star, MapPin, Clock, ArrowRight } from 'lucide-react';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';

interface EducatorCardProps {
  educator: Educator;
  onViewProfile: (educator: Educator) => void;
  onRequestBooking: (educator: Educator) => void;
}

export const EducatorCard: React.FC<EducatorCardProps> = ({
  educator,
  onViewProfile,
  onRequestBooking
}) => {
  const avatar = educator.user?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80';
  const name = educator.user?.name || 'Practitioner';

  return (
    <div className="bg-white rounded-card border border-ink-200 shadow-level-1 hover:border-forest-200 hover:shadow-level-2 transition-all duration-200 flex flex-col justify-between overflow-hidden group">
      <div className="p-5 pb-4">
        <div className="flex items-start gap-3.5">
          <div className="relative shrink-0">
            <img
              src={avatar}
              alt={name}
              className="w-14 h-14 rounded-card object-cover border border-ink-200 shadow-soft"
            />
            {educator.status === 'active' && (
              <span
                title="Verified Practitioner"
                className="absolute -bottom-1 -right-1 bg-forest-700 text-white p-1 rounded-full ring-2 ring-white shadow-soft"
                aria-label="Verified practitioner"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
              </span>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-bold text-ink-900 text-[15px] leading-tight line-clamp-1 group-hover:text-forest-800 transition font-display">
                {name}
              </h3>
              {educator.rating > 0 && (
                <Badge variant="warning" size="sm" dot={false} className="shrink-0 gap-1">
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  <span>{educator.rating.toFixed(1)}</span>
                  <span className="text-ink-500 font-normal">({educator.total_reviews})</span>
                </Badge>
              )}
            </div>

            <p className="text-body-sm font-medium text-forest-700 mt-0.5 line-clamp-1">
              {educator.title}
            </p>

            <div className="flex items-center gap-3 text-xs text-ink-600 mt-2">
              <span className="flex items-center gap-1 min-w-0">
                <MapPin className="w-3.5 h-3.5 text-ink-500 shrink-0" />
                <span className="truncate max-w-[140px]">{educator.location.split(',')[0]}</span>
              </span>
              <span className="flex items-center gap-1 shrink-0">
                <Clock className="w-3.5 h-3.5 text-ink-500" />
                <span>{educator.years_experience} yrs exp</span>
              </span>
            </div>
          </div>
        </div>

        <p className="mt-3 text-body-sm text-ink-700 line-clamp-2 leading-relaxed">
          {educator.bio}
        </p>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {educator.teaching_formats.map(f => (
            <Badge key={f} variant="neutral" size="sm">
              {f === 'in-person' ? 'In-Person Workshop' : f === 'online' ? 'Online Live' : 'Hybrid'}
            </Badge>
          ))}
          {educator.skills && educator.skills.slice(0, 2).map(s => (
            <Badge
              key={s.id}
              variant="success"
              size="sm"
              className="truncate max-w-[150px]"
            >
              {s.skill_name}
            </Badge>
          ))}
        </div>
      </div>

      <div className="px-5 py-3.5 bg-ink-50 border-t border-ink-100 flex items-center justify-between gap-3 pb-safe sm:pb-3.5">
        <div>
          <span className="text-[11px] text-ink-600 uppercase font-bold tracking-wider block">Rate</span>
          <span className="text-[15px] font-bold text-ink-900 font-display">
            {formatUGX(educator.hourly_rate_ugx)}
            <span className="text-xs text-ink-600 font-normal"> / hr</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="md"
            onClick={() => onViewProfile(educator)}
            className="min-h-[44px] px-4"
            aria-label={`View profile of ${name}`}
          >
            View Profile
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={() => onRequestBooking(educator)}
            rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
            className="min-h-[44px] px-4 shadow-soft"
            aria-label={`Book session with ${name}`}
          >
            Learn
          </Button>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { Educator } from '../../types';
import { formatUGX } from '../../utils/formatters';
import { StatusBadge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';

interface AdminEducatorsTabProps {
  educators: Educator[];
}

export const AdminEducatorsTab: React.FC<AdminEducatorsTabProps> = ({ educators }) => {
  return (
    <div className="bg-white rounded-2xl border border-ink-200 shadow-sm p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-ink-900">All Registered Educators & Mentors</h2>
          <p className="text-xs text-ink-500">Master practitioners and trainers across Uganda.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {educators.map(edu => (
          <div key={edu.id} className="p-4 rounded-xl border border-ink-200 bg-ink-50/50 space-y-3">
            <div className="flex items-center gap-3">
              <Avatar src={edu.user?.avatar_url} name={edu.user?.name} className="w-12 h-12 rounded-xl border border-ink-300" />
              <div>
                <h3 className="font-bold text-xs text-ink-900">{edu.user?.name}</h3>
                <div className="text-[12px] text-ink-500">{edu.title}</div>
                <StatusBadge status={edu.status} />
              </div>
            </div>

            <div className="text-xs text-ink-600 space-y-1">
              <div><strong>Base:</strong> {edu.location}</div>
              <div><strong>Rate:</strong> {formatUGX(edu.hourly_rate_ugx)}/hr</div>
              <div><strong>Phone:</strong> {edu.user?.phone}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminEducatorsTab;

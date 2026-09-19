import React from 'react';
import { Educator } from '../../types';
import { formatUGX } from '../../utils/formatters';
import { StatusBadge } from '../../components/ui/Badge';

interface AdminEducatorsTabProps {
  educators: Educator[];
}

export const AdminEducatorsTab: React.FC<AdminEducatorsTabProps> = ({ educators }) => {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-gray-900">All Registered Educators & Mentors</h2>
          <p className="text-xs text-gray-500">Master practitioners and trainers across Uganda.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {educators.map(edu => (
          <div key={edu.id} className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 space-y-3">
            <div className="flex items-center gap-3">
              <img
                src={edu.user?.avatar_url || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80'}
                alt={edu.user?.name}
                className="w-12 h-12 rounded-xl object-cover border border-gray-300"
              />
              <div>
                <h3 className="font-bold text-xs text-gray-900">{edu.user?.name}</h3>
                <div className="text-[11px] text-gray-500">{edu.title}</div>
                <StatusBadge status={edu.status} />
              </div>
            </div>

            <div className="text-xs text-gray-600 space-y-1">
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

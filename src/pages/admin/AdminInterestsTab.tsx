import React from 'react';
import { LearnerRequest } from '../../types';
import { formatUGX, formatShortDate } from '../../utils/formatters';
import { StatusBadge } from '../../components/ui/Badge';

interface AdminInterestsTabProps {
  demandData: any;
  learnerRequests: LearnerRequest[];
}

export const AdminInterestsTab: React.FC<AdminInterestsTabProps> = ({
  demandData,
  learnerRequests
}) => {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-6">
      <div className="border-b border-gray-100 pb-4">
        <h2 className="text-base font-bold text-gray-900">
          Demand & User Interests Intelligence
        </h2>
        <p className="text-xs text-gray-500">
          Real-time analytics on what skills Ugandan students are requesting, average learner budgets in UGX, and regional demand clusters.
        </p>
      </div>

      {/* Quick Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200 space-y-1">
          <span className="text-gray-600 font-semibold">Total Custom Learning Inquiries</span>
          <div className="text-2xl font-black text-emerald-950">{demandData?.totalRequests || learnerRequests.length}</div>
          <span className="text-[11px] text-emerald-800 font-medium">Submitted by active learners</span>
        </div>

        <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200 space-y-1">
          <span className="text-gray-600 font-semibold">Open Matching Queue</span>
          <div className="text-2xl font-black text-amber-950">{demandData?.openRequestsCount || learnerRequests.filter(r => r.status === 'open').length}</div>
          <span className="text-[11px] text-amber-800 font-medium">Awaiting educator match</span>
        </div>

        <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200 space-y-1">
          <span className="text-gray-600 font-semibold">Matched & In-Training</span>
          <div className="text-2xl font-black text-blue-950">{demandData?.matchedRequestsCount || learnerRequests.filter(r => r.status === 'matched').length}</div>
          <span className="text-[11px] text-blue-800 font-medium">Apprentices actively learning</span>
        </div>
      </div>

      {/* Detailed Skill Demand Breakdown */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700">
          Top Requested Vocational & Technical Trades
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {demandData?.tradeDemand && demandData.tradeDemand.length > 0 ? (
            demandData.tradeDemand.map((item: any, idx: number) => (
              <div key={idx} className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 space-y-2">
                <div className="flex items-center justify-between font-bold text-gray-900 text-xs">
                  <span className="flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-md bg-emerald-800 text-white flex items-center justify-center text-[10px] font-bold">
                      {idx + 1}
                    </span>
                    {item.trade}
                  </span>
                  <span className="text-emerald-800 font-black">{item.requestCount} inquiries</span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-gray-600 pt-1 border-t border-gray-200/60">
                  <span>Avg Student Budget: <strong>{formatUGX(item.averageBudgetUgx)}</strong></span>
                  <span className="text-gray-500 truncate max-w-[150px]">
                    Areas: {item.topLocations?.join(', ') || 'Mbarara City'}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="p-4 text-xs text-gray-500 italic">No demand data aggregated yet.</div>
          )}
        </div>
      </div>

      {/* Full Custom Learner Requests Log with Contacts */}
      <div className="space-y-3 pt-4 border-t border-gray-100">
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700">
          Live Learner Requests & Contact Records
        </h3>

        <div className="hidden md:block overflow-x-auto border border-gray-200 rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-100 text-gray-700 font-semibold border-b border-gray-200">
              <tr>
                <th className="p-3">Learner Name</th>
                <th className="p-3">Requested Skill</th>
                <th className="p-3">Location</th>
                <th className="p-3">Max Budget</th>
                <th className="p-3">Direct Contact</th>
                <th className="p-3">Status</th>
                <th className="p-3">Submitted</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {learnerRequests.map(r => (
                <tr key={r.id} className="hover:bg-gray-50/50">
                  <td className="p-3 font-bold text-gray-900">{r.learner_name}</td>
                  <td className="p-3 font-semibold text-emerald-950">{r.skill_name}</td>
                  <td className="p-3 text-gray-600">{r.location}</td>
                  <td className="p-3 font-bold text-gray-900">{formatUGX(r.budget_ugx)}</td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <a
                        href={`tel:${r.contact_phone}`}
                        className="text-emerald-800 font-semibold hover:underline"
                      >
                        {r.contact_phone}
                      </a>
                    </div>
                  </td>
                  <td className="p-3">
                    <StatusBadge status={r.status} />
                  </td>
                  <td className="p-3 text-gray-500">{formatShortDate(r.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="md:hidden space-y-3">
          {learnerRequests.map(r => (
            <div key={r.id} className="p-4 rounded-xl border border-gray-200 bg-white shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-gray-900">{r.learner_name}</span>
                <StatusBadge status={r.status} />
              </div>
              <div className="text-xs font-semibold text-emerald-950">{r.skill_name} • {r.location}</div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div><span className="text-gray-500">Budget:</span> <span className="font-bold">{formatUGX(r.budget_ugx)}</span></div>
                <div><span className="text-gray-500">Date:</span> <span className="text-gray-600">{formatShortDate(r.created_at)}</span></div>
              </div>
              <a href={`tel:${r.contact_phone}`} className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-800 hover:underline">{r.contact_phone}</a>
            </div>
          ))}
          {learnerRequests.length===0 && <div className="text-center py-8 text-xs text-gray-400">No learner requests yet.</div>}
        </div>
      </div>
    </div>
  );
};

export default AdminInterestsTab;

import React from 'react';
import { Payment } from '../../types';
import { formatUGX } from '../../utils/formatters';
import { StatusBadge } from '../../components/ui/Badge';

interface AdminPaymentsTabProps {
  payments: Payment[];
  onReleasePayout: (paymentId: string) => void;
}

export const AdminPaymentsTab: React.FC<AdminPaymentsTabProps> = ({
  payments,
  onReleasePayout
}) => {
  return (
    <div className="bg-white rounded-2xl border border-ink-200 shadow-sm p-6 space-y-6">
      <div>
        <h2 className="text-base font-bold text-ink-900">Platform Escrow Ledger</h2>
        <p className="text-xs text-ink-500">
          Escrow deposits held safely in MTN/Airtel MoMo until learner milestones are delivered.
        </p>
      </div>

      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-ink-50 text-ink-700 font-semibold border-b border-ink-200">
            <tr>
              <th className="p-3">Reference</th>
              <th className="p-3">Total UGX</th>
              <th className="p-3">Educator Net (90%)</th>
              <th className="p-3">Platform Fee (10%)</th>
              <th className="p-3">Method</th>
              <th className="p-3">Status</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100 text-ink-700">
            {payments.map(p => (
              <tr key={p.id} className="hover:bg-ink-50/50">
                <td className="p-3 font-mono font-bold text-ink-900">{p.payment_reference}</td>
                <td className="p-3 font-bold text-ink-900">{formatUGX(p.amount_ugx)}</td>
                <td className="p-3 font-semibold text-forest-800">{formatUGX(p.payout_amount_ugx)}</td>
                <td className="p-3 text-ink-600">{formatUGX(p.platform_fee_ugx)}</td>
                <td className="p-3 uppercase font-semibold text-forest-900">{p.method.replace('_', ' ')}</td>
                <td className="p-3">
                  <StatusBadge status={p.status} />
                </td>
                <td className="p-3">
                  {p.status === 'paid' ? (
                    <button
                      onClick={() => onReleasePayout(p.id)}
                      className="px-3 py-1 bg-forest-700 hover:bg-forest-800 text-white font-bold rounded text-[12px]"
                    >
                      Release Payout
                    </button>
                  ) : (
                    <span className="text-ink-400 text-[12px]">{p.status}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="md:hidden space-y-3">
        {payments.map(p => (
          <div key={p.id} className="p-4 rounded-xl border border-ink-200 bg-white shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono font-bold text-xs text-ink-900">{p.payment_reference}</span>
              <StatusBadge status={p.status} />
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div><span className="text-ink-500">Total:</span> <span className="font-bold">{formatUGX(p.amount_ugx)}</span></div>
              <div><span className="text-ink-500">Net:</span> <span className="font-bold text-forest-800">{formatUGX(p.payout_amount_ugx)}</span></div>
              <div><span className="text-ink-500">Fee:</span> <span className="text-ink-600">{formatUGX(p.platform_fee_ugx)}</span></div>
              <div><span className="text-ink-500">Method:</span> <span className="uppercase font-semibold">{p.method.replace('_',' ')}</span></div>
            </div>
            {p.status === 'paid' && <button onClick={() => onReleasePayout(p.id)} className="w-full mt-2 py-2 bg-forest-700 hover:bg-forest-800 text-white font-bold rounded-lg text-xs">Release Payout</button>}
          </div>
        ))}
        {payments.length===0 && <div className="text-center py-8 text-xs text-ink-400">No escrow records yet.</div>}
      </div>
    </div>
  );
};

export default AdminPaymentsTab;

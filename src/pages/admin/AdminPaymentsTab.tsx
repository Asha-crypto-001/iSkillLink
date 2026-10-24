import React from 'react';
import { Booking, Payment } from '../../types';
import { formatUGX, formatShortDate } from '../../utils/formatters';
import { PaymentStatusBadge } from '../../components/ui/Badge';

interface AdminPaymentsTabProps {
  payments: Payment[];
  bookings: Booking[];
  onReleasePayout: (payment: Payment, booking?: Booking) => void;
}

export const AdminPaymentsTab: React.FC<AdminPaymentsTabProps> = ({
  payments,
  bookings,
  onReleasePayout
}) => {
  const bookingFor = (p: Payment) => bookings.find(b => b.id === p.booking_id);

  // A payout can only go out for money that is held and a session that has happened.
  const releaseControl = (p: Payment) => {
    const booking = bookingFor(p);
    if (p.status !== 'paid') return null;
    if (booking?.status !== 'completed') {
      return <span className="text-xs text-ink-600 whitespace-nowrap">Session not done yet</span>;
    }
    return (
      <button
        onClick={() => onReleasePayout(p, booking)}
        className="px-3 min-h-[36px] bg-forest-700 hover:bg-forest-800 text-white font-bold rounded-control text-xs whitespace-nowrap"
      >
        Release {formatUGX(p.payout_amount_ugx)}
      </button>
    );
  };

  const sessionLabel = (p: Payment) => {
    const booking = bookingFor(p);
    if (!booking) return <span className="text-ink-500">Booking {p.booking_id}</span>;
    return (
      <>
        <div className="font-semibold text-ink-900">{booking.skill_name}</div>
        <div className="text-xs text-ink-600">
          {booking.learnerUser?.name || 'Learner'} → {booking.educator?.user?.name || 'Educator'} · {formatShortDate(booking.scheduled_date)}
        </div>
      </>
    );
  };

  return (
    <div className="bg-white rounded-card border border-ink-200 shadow-level-1 p-6 space-y-5">
      <p className="text-sm text-ink-600">
        Learners’ MoMo payments are held here until their session is done. Releasing sends 90% to the educator and keeps the 10% fee.
      </p>

      {payments.length === 0 ? (
        <p className="py-10 text-center text-sm text-ink-600">No payments yet.</p>
      ) : (
        <>
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs text-ink-600 border-b border-ink-200">
                <tr>
                  <th scope="col" className="py-2 pr-3 font-semibold">Session</th>
                  <th scope="col" className="py-2 px-3 font-semibold text-right">Paid</th>
                  <th scope="col" className="py-2 px-3 font-semibold text-right">To educator</th>
                  <th scope="col" className="py-2 px-3 font-semibold">Status</th>
                  <th scope="col" className="py-2 pl-3 font-semibold text-right"><span className="sr-only">Action</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {payments.map(p => (
                  <tr key={p.id}>
                    <td className="py-3 pr-3">
                      {sessionLabel(p)}
                      <div className="font-mono text-[12px] text-ink-500 mt-0.5">{p.payment_reference}</div>
                    </td>
                    <td className="py-3 px-3 text-right font-semibold text-ink-900 tabular-nums whitespace-nowrap">{formatUGX(p.amount_ugx)}</td>
                    <td className="py-3 px-3 text-right text-ink-800 tabular-nums whitespace-nowrap">{formatUGX(p.payout_amount_ugx)}</td>
                    <td className="py-3 px-3"><PaymentStatusBadge status={p.status} audience="educator" /></td>
                    <td className="py-3 pl-3 text-right">{releaseControl(p)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ul className="md:hidden divide-y divide-ink-100">
            {payments.map(p => (
              <li key={p.id} className="py-3 space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">{sessionLabel(p)}</div>
                  <PaymentStatusBadge status={p.status} audience="educator" />
                </div>
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-ink-700">{formatUGX(p.amount_ugx)} paid · {formatUGX(p.payout_amount_ugx)} to educator</span>
                  {releaseControl(p)}
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
};

export default AdminPaymentsTab;

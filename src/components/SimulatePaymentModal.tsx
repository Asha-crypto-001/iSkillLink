import React, { useState } from 'react';
import { Booking } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { formatUGX } from '../utils/formatters';
import { X, CheckCircle2, Smartphone, Clock } from 'lucide-react';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { Alert } from './ui/Alert';

interface SimulatePaymentModalProps {
  booking: Booking | null;
  onClose: () => void;
  onPaymentSuccess: () => void;
}

type Network = 'mtn_momo' | 'airtel_money';

const NETWORKS: Record<Network, { label: string; prefixes: string[]; dot: string; selected: string }> = {
  mtn_momo: { label: 'MTN MoMo', prefixes: ['076', '077', '078', '039'], dot: 'bg-amber-400', selected: 'bg-amber-50 border-amber-400 text-amber-950' },
  airtel_money: { label: 'Airtel Money', prefixes: ['070', '074', '075', '020'], dot: 'bg-rose-600', selected: 'bg-rose-50 border-rose-400 text-rose-950' }
};

/** Works out the network from a Ugandan number (+256 7X… or 07X…), if the prefix is known. */
function networkFor(phone: string): Network | null {
  const digits = phone.replace(/\D/g, '');
  const local = digits.startsWith('256') ? `0${digits.slice(3)}` : digits;
  const prefix = local.slice(0, 3);
  return (Object.keys(NETWORKS) as Network[]).find(n => NETWORKS[n].prefixes.includes(prefix)) || null;
}

export const SimulatePaymentModal: React.FC<SimulatePaymentModalProps> = ({
  booking,
  onClose,
  onPaymentSuccess
}) => {
  if (!booking) return null;

  const { user } = useAuth();
  // Start from the learner's own number — never a made-up one a prompt could be sent to.
  const initialPhone = user?.phone && user.phone.replace(/\D/g, '').length > 6 ? user.phone : '';
  const [phoneNumber, setPhoneNumber] = useState(initialPhone);
  const [provider, setProvider] = useState<Network>(networkFor(initialPhone) || 'mtn_momo');
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<'input' | 'prompt_simulation' | 'confirmed'>('input');
  const [refCode, setRefCode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const total = booking.total_amount_ugx;
  const educatorName = booking.educator?.user?.name?.split(' ')[0] || 'the educator';

  const handlePhoneChange = (value: string) => {
    setPhoneNumber(value);
    const detected = networkFor(value);
    if (detected) setProvider(detected);
  };

  const handleInitiate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setErrorMsg('');
    setStep('prompt_simulation');

    // Test mode: stand in for the few seconds a real MoMo approval takes.
    setTimeout(async () => {
      try {
        const res = await api.simulatePayment(booking.id, provider, phoneNumber);
        setRefCode(res.payment.payment_reference);
        setStep('confirmed');
      } catch (err: any) {
        setErrorMsg(err.message || 'The payment didn’t go through. Please try again.');
        setStep('input');
      } finally {
        setIsProcessing(false);
      }
    }, 2500);
  };

  return (
    <Modal isOpen={!!booking} onClose={onClose} titleId="escrow-payment-title" title="Pay into escrow" maxWidth="max-w-lg">
        <div className="shrink-0 bg-white px-5 py-4 flex items-center justify-between gap-3 border-b border-ink-200">
          <div>
            <h3 id="escrow-payment-title" className="font-bold text-lg text-ink-900 font-display">Pay into escrow</h3>
            <p className="text-sm text-ink-600">{booking.skill_name} with {educatorName}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-control text-ink-500 hover:bg-ink-100 hover:text-ink-900 transition w-11 h-11 shrink-0 flex items-center justify-center"
            aria-label="Close payment"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {step === 'input' && (
          <form onSubmit={handleInitiate} className="flex flex-col flex-1 min-h-0">
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
            {errorMsg && <Alert>{errorMsg}</Alert>}

            <div className="flex items-baseline justify-between">
              <span className="text-ink-700">{booking.duration_hours} {booking.duration_hours === 1 ? 'hour' : 'hours'}</span>
              <span className="font-display text-2xl font-bold text-ink-900">{formatUGX(total)}</span>
            </div>

            <div>
              <label className="block text-[14px] font-semibold text-ink-800 mb-1.5" htmlFor="momo-phone">
                Your Mobile Money number
              </label>
              <div className="relative">
                <input
                  id="momo-phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  value={phoneNumber}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  placeholder="07X XXX XXXX"
                  className="w-full text-base min-h-[48px] rounded-control border-ink-200 border pl-10 pr-3.5 bg-white text-ink-900 focus:ring-2 focus:ring-forest-700 focus:outline-none"
                  required
                />
                <Smartphone className="w-4 h-4 text-ink-400 absolute left-3.5 top-1/2 -translate-y-1/2" aria-hidden="true" />
              </div>
            </div>

            <fieldset>
              <legend className="block text-[14px] font-semibold text-ink-800 mb-1.5">Network</legend>
              <div className="grid grid-cols-2 gap-3">
                {(Object.keys(NETWORKS) as Network[]).map(network => (
                  <button
                    key={network}
                    type="button"
                    onClick={() => setProvider(network)}
                    aria-pressed={provider === network}
                    className={`px-3 min-h-[56px] rounded-card border flex items-center justify-center gap-2 text-[15px] font-bold transition ${provider === network ? NETWORKS[network].selected : 'border-ink-200 text-ink-700 hover:bg-ink-50'}`}
                  >
                    <span className={`w-3 h-3 rounded-full ${NETWORKS[network].dot}`} aria-hidden="true" />
                    {NETWORKS[network].label}
                  </button>
                ))}
              </div>
              <p className="mt-1.5 text-xs text-ink-600">Picked from your number — change it if it’s wrong.</p>
            </fieldset>

            <div className="rounded-card bg-clay-50 border border-clay-200 p-4 text-sm text-ink-800 leading-relaxed space-y-1">
              <p><strong className="text-clay-800">iSkillLink holds this money</strong> until the session is done. Then 90% goes to {educatorName} and 10% is our fee.</p>
              <p>If the session doesn’t happen, we refund you in full.</p>
            </div>

            <p className="text-xs text-ink-600">Test mode: no money leaves your phone yet.</p>
            </div>
            <div className="shrink-0 p-4 bg-ink-50 border-t border-ink-200 flex items-center justify-end gap-3 pb-safe">
              <Button variant="outline" size="md" type="button" onClick={onClose}>
                Cancel
              </Button>
              <Button variant="primary" size="md" type="submit" isLoading={isProcessing}>
                Pay {formatUGX(total)}
              </Button>
            </div>
          </form>
        )}

        {step === 'prompt_simulation' && (
          <div className="flex-1 overflow-y-auto p-8 text-center space-y-4" role="status" aria-live="polite">
            <div className="w-16 h-16 rounded-full bg-forest-50 text-forest-700 flex items-center justify-center mx-auto border border-forest-200">
              <Smartphone className="w-8 h-8" aria-hidden="true" />
            </div>
            <div>
              <h4 className="font-bold text-ink-900 text-lg font-display">Check your phone</h4>
              <p className="text-[15px] text-ink-700 mt-1 max-w-xs mx-auto">
                Approve <span className="font-bold">{formatUGX(total)}</span> on <span className="font-semibold">{phoneNumber}</span> with your MoMo PIN.
              </p>
            </div>
            <div className="text-sm text-ink-600 flex items-center justify-center gap-1.5">
              <Clock className="w-4 h-4 animate-spin text-forest-600" aria-hidden="true" />
              Waiting for approval…
            </div>
          </div>
        )}

        {step === 'confirmed' && (
          <div className="flex-1 overflow-y-auto p-6 text-center space-y-4" role="status">
            <div className="w-14 h-14 rounded-full bg-forest-100 text-forest-700 flex items-center justify-center mx-auto border border-forest-200">
              <CheckCircle2 className="w-8 h-8" aria-hidden="true" />
            </div>
            <div>
              <h4 className="font-bold text-ink-900 text-lg font-display">Paid — we’re holding it</h4>
              <p className="text-[15px] text-ink-700 mt-1">
                {formatUGX(total)} is held by iSkillLink. {educatorName} gets paid after your session.
              </p>
            </div>

            <dl className="bg-ink-50 rounded-card p-3 border border-ink-200 text-sm text-left grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
              <dt className="text-ink-600">Reference</dt><dd className="font-mono text-ink-900">{refCode}</dd>
              <dt className="text-ink-600">Paid with</dt><dd className="text-ink-900">{NETWORKS[provider].label}</dd>
            </dl>

            <div className="pt-2 pb-safe">
              <Button variant="primary" size="md" onClick={() => { onClose(); onPaymentSuccess(); }} className="w-full">
                Back to my bookings
              </Button>
            </div>
          </div>
        )}
    </Modal>
  );
};

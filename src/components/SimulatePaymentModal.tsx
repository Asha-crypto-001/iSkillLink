import React, { useState } from 'react';
import { Booking } from '../types';
import { api } from '../services/api';
import { formatUGX } from '../utils/formatters';
import {
  X, CheckCircle2, ShieldCheck, Smartphone, AlertCircle,
  Clock, ArrowRight, Lock
} from 'lucide-react';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';

interface SimulatePaymentModalProps {
  booking: Booking | null;
  onClose: () => void;
  onPaymentSuccess: () => void;
}

export const SimulatePaymentModal: React.FC<SimulatePaymentModalProps> = ({
  booking,
  onClose,
  onPaymentSuccess
}) => {
  if (!booking) return null;

  const [provider, setProvider] = useState<'mtn_momo' | 'airtel_money'>('mtn_momo');
  const [phoneNumber, setPhoneNumber] = useState('+256 772 455 890');
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<'input' | 'prompt_simulation' | 'confirmed'>('input');
  const [refCode, setRefCode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const total = booking.total_amount_ugx;
  const platformFee = booking.platform_fee_ugx || Math.round(total * 0.10);
  const educatorPayout = booking.educator_payout_ugx || total - platformFee;

  const handleInitiate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setStep('prompt_simulation');

    setTimeout(async () => {
      try {
        const res = await api.simulatePayment(booking.id, provider, phoneNumber);
        setRefCode(res.payment.payment_reference);
        setStep('confirmed');
        setIsProcessing(false);
      } catch (err: any) {
        setErrorMsg(err.message || 'Payment simulation failed.');
        setIsProcessing(false);
        setStep('input');
      }
    }, 2500);
  };

  return (
    <Modal isOpen={!!booking} onClose={onClose} titleId="escrow-payment-title" title="iSkillLink Escrow Payment" maxWidth="max-w-lg">
        {/* Header — pinned, ink */}
        <div id="escrow-payment-title" className="shrink-0 bg-ink-950 text-white p-5 flex items-center justify-between border-b border-ink-800">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-forest-400" />
            <div>
              <h3 className="font-bold text-sm text-white font-display">iSkillLink Escrow Payment</h3>
              <p className="text-[11px] text-ink-300">Protected Mobile Money Escrow for Uganda</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-control bg-ink-800 hover:bg-ink-700 text-ink-300 transition min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Close payment"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {step === 'input' && (
          <form onSubmit={handleInitiate} className="flex flex-col flex-1 min-h-0">
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {errorMsg && (
              <div className="p-3 rounded-control bg-rose-50 border border-rose-200 text-rose-800 text-[13px] flex items-center gap-2" role="alert">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="bg-ink-50 rounded-card p-3.5 border border-ink-200 text-[13px] space-y-1.5">
              <div className="flex justify-between font-bold text-ink-900">
                <span>{booking.skill_name}</span>
                <span className="text-forest-800">{formatUGX(total)}</span>
              </div>
              <div className="text-ink-600 flex items-center justify-between text-xs">
                <span>Educator: {booking.educator?.user?.name || 'Practitioner'}</span>
                <span>{booking.duration_hours} hrs</span>
              </div>
            </div>

            <div>
              <label className="block text-[13px] font-bold text-ink-800 mb-1.5">
                Select Mobile Money Network
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setProvider('mtn_momo');
                    if (phoneNumber.startsWith('+256 70')) setPhoneNumber('+256 772 455 890');
                  }}
                  className={`p-3 rounded-card border flex flex-col items-center justify-center gap-1.5 text-[13px] font-bold transition min-h-[88px] ${
                    provider === 'mtn_momo'
                      ? 'bg-amber-50 border-amber-300 text-amber-900 ring-2 ring-amber-200'
                      : 'border-ink-200 text-ink-700 hover:bg-ink-50'
                  }`}
                >
                  <span className="w-3 h-3 rounded-full bg-amber-400"></span>
                  <span>MTN MoMo</span>
                  <span className="text-xs text-ink-500 font-normal">077 / 078 / 076</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setProvider('airtel_money');
                    if (phoneNumber.startsWith('+256 77') || phoneNumber.startsWith('+256 78')) setPhoneNumber('+256 701 455 890');
                  }}
                  className={`p-3 rounded-card border flex flex-col items-center justify-center gap-1.5 text-[13px] font-bold transition min-h-[88px] ${
                    provider === 'airtel_money'
                      ? 'bg-rose-50 border-rose-300 text-rose-900 ring-2 ring-rose-200'
                      : 'border-ink-200 text-ink-700 hover:bg-ink-50'
                  }`}
                >
                  <span className="w-3 h-3 rounded-full bg-rose-600"></span>
                  <span>Airtel Money</span>
                  <span className="text-xs text-ink-500 font-normal">070 / 074 / 075</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[13px] font-bold text-ink-800 mb-1" htmlFor="momo-phone">
                Registered Mobile Money Phone Number
              </label>
              <div className="relative">
                <input
                  id="momo-phone"
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+256 77X XXX XXX"
                  className="w-full text-[13px] min-h-[44px] rounded-control border-ink-200 border pl-10 pr-3.5 py-2.5 bg-white text-ink-900 focus:ring-2 focus:ring-forest-700 focus:outline-none"
                  required
                />
                <Smartphone className="w-4 h-4 text-ink-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div className="bg-ink-50 p-3.5 rounded-card border border-ink-200 text-[13px] space-y-1 text-ink-700">
              <div className="flex justify-between">
                <span>Session Cost:</span>
                <span className="font-semibold">{formatUGX(total)}</span>
              </div>
              <div className="flex justify-between text-ink-500 text-xs">
                <span>Platform & Escrow (10%):</span>
                <span>{formatUGX(platformFee)}</span>
              </div>
              <div className="flex justify-between text-ink-500 text-xs">
                <span>Net Educator Payout:</span>
                <span>{formatUGX(educatorPayout)}</span>
              </div>
              <div className="border-t border-ink-200 pt-2 flex justify-between font-bold text-ink-900 text-[13px]">
                <span>Total Charged:</span>
                <span className="text-forest-800">{formatUGX(total)}</span>
              </div>
            </div>

            <div className="text-xs text-ink-600 flex items-start gap-1.5 leading-relaxed">
              <Lock className="w-3.5 h-3.5 text-forest-600 shrink-0 mt-0.5" />
              <span>Funds held in iSkillLink Escrow. Educator receives payout only after session completed.</span>
            </div>

            </div>
            <div className="shrink-0 p-4 bg-ink-50 border-t border-ink-200 flex items-center justify-end gap-3 pb-safe">
              <Button variant="outline" size="md" type="button" onClick={onClose}>
                Cancel
              </Button>
              <Button variant="primary" size="md" type="submit" isLoading={isProcessing} rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                Deposit {formatUGX(total)} into Escrow
              </Button>
            </div>
          </form>
        )}

        {step === 'prompt_simulation' && (
          <div className="flex-1 overflow-y-auto p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-forest-50 text-forest-700 flex items-center justify-center mx-auto animate-pulse border border-forest-200">
              <Smartphone className="w-8 h-8" />
            </div>
            <div>
              <h4 className="font-bold text-ink-900 text-base font-display">Mobile Money Prompt Sent</h4>
              <p className="text-[13px] text-ink-600 mt-1 max-w-xs mx-auto">
                Check <span className="font-semibold text-ink-900">{phoneNumber}</span> to approve <span className="font-bold text-forest-700">{formatUGX(total)}</span>.
              </p>
            </div>
            <div className="text-xs text-ink-500 flex items-center justify-center gap-1.5">
              <Clock className="w-4 h-4 animate-spin text-forest-600" />
              <span>Simulating network approval...</span>
            </div>
          </div>
        )}

        {step === 'confirmed' && (
          <div className="flex-1 overflow-y-auto p-6 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-forest-100 text-forest-700 flex items-center justify-center mx-auto border border-forest-200">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h4 className="font-bold text-ink-900 text-base font-display">Escrow Payment Confirmed!</h4>
              <p className="text-[13px] text-ink-600 mt-1">
                Your payment of <span className="font-bold text-forest-700">{formatUGX(total)}</span> is secured in iSkillLink Escrow.
              </p>
            </div>

            <div className="bg-ink-50 rounded-card p-3 border border-ink-200 text-xs font-mono text-ink-700 text-left space-y-1">
              <div><span className="text-ink-500 font-sans">Ref:</span> {refCode}</div>
              <div><span className="text-ink-500 font-sans">Method:</span> {provider.toUpperCase()}</div>
              <div><span className="text-ink-500 font-sans">Status:</span> SECURED_IN_ESCROW</div>
            </div>

            <div className="pt-2 pb-safe">
              <Button variant="primary" size="md" onClick={() => { onClose(); onPaymentSuccess(); }} className="w-full">
                View Updated Bookings
              </Button>
            </div>
          </div>
        )}
    </Modal>
  );
};
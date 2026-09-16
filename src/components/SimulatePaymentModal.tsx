import React, { useState } from 'react';
import { Booking } from '../types';
import { api } from '../services/api';
import { formatUGX } from '../utils/formatters';
import {
  X, CheckCircle2, ShieldCheck, Smartphone, AlertCircle,
  Clock, ArrowRight, Lock
} from 'lucide-react';

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

    // Simulate standard USSD / Push Notification on phone
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
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl border border-gray-200 overflow-hidden">
        {/* Header — pinned */}
        <div className="shrink-0 bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="font-bold text-sm text-white">iSkillLink Escrow Payment</h3>
              <p className="text-[11px] text-slate-300">Protected Mobile Money Escrow for Uganda</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {step === 'input' && (
          <form onSubmit={handleInitiate} className="flex flex-col flex-1 min-h-0">
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {errorMsg && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Booking overview */}
            <div className="bg-gray-50 rounded-xl p-3.5 border border-gray-200 text-xs space-y-1.5">
              <div className="flex justify-between font-bold text-gray-900">
                <span>{booking.skill_name}</span>
                <span className="text-emerald-800">{formatUGX(total)}</span>
              </div>
              <div className="text-gray-600 flex items-center justify-between">
                <span>Educator: {booking.educator?.user?.name || 'Practitioner'}</span>
                <span>{booking.duration_hours} hrs session</span>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Select Mobile Money Network
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setProvider('mtn_momo');
                    if (phoneNumber.startsWith('+256 70')) setPhoneNumber('+256 772 455 890');
                  }}
                  className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 text-xs font-bold transition ${
                    provider === 'mtn_momo'
                      ? 'bg-amber-50/80 border-amber-500 text-amber-900 ring-2 ring-amber-400/30'
                      : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span className="w-3 h-3 rounded-full bg-amber-400"></span>
                  <span>MTN MoMo (Uganda)</span>
                  <span className="text-[10px] text-gray-500 font-normal">077 / 078 / 076</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setProvider('airtel_money');
                    if (phoneNumber.startsWith('+256 77') || phoneNumber.startsWith('+256 78')) setPhoneNumber('+256 701 455 890');
                  }}
                  className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 text-xs font-bold transition ${
                    provider === 'airtel_money'
                      ? 'bg-red-50/80 border-red-500 text-red-900 ring-2 ring-red-400/30'
                      : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span className="w-3 h-3 rounded-full bg-red-600"></span>
                  <span>Airtel Money</span>
                  <span className="text-[10px] text-gray-500 font-normal">070 / 074 / 075</span>
                </button>
              </div>
            </div>

            {/* Mobile Number */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Registered Mobile Money Phone Number
              </label>
              <div className="relative">
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+256 77X XXX XXX"
                  className="w-full text-xs rounded-lg border-gray-300 border p-2.5 pl-8 bg-white text-gray-900 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  required
                />
                <Smartphone className="w-4 h-4 text-gray-400 absolute left-2.5 top-2.5" />
              </div>
            </div>

            {/* Escrow terms breakdown */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1 text-slate-700">
              <div className="flex justify-between">
                <span>Session Cost:</span>
                <span>{formatUGX(total)}</span>
              </div>
              <div className="flex justify-between text-slate-500 text-[11px]">
                <span>Platform Facilitation & Escrow (10%):</span>
                <span>{formatUGX(platformFee)}</span>
              </div>
              <div className="flex justify-between text-slate-500 text-[11px]">
                <span>Net Educator Payout:</span>
                <span>{formatUGX(educatorPayout)}</span>
              </div>
              <div className="border-t border-slate-200 pt-1 flex justify-between font-bold text-slate-900 text-xs">
                <span>Total Amount Charged:</span>
                <span className="text-emerald-700">{formatUGX(total)}</span>
              </div>
            </div>

            <div className="text-[11px] text-gray-500 flex items-start gap-1.5 leading-relaxed">
              <Lock className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                Funds will remain securely held in iSkillLink Escrow. The educator only receives their payout once the session is marked completed.
              </span>
            </div>

            </div>
            <div className="shrink-0 p-4 bg-gray-50 border-t border-gray-200 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 text-xs font-semibold rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 text-xs font-bold rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm flex items-center gap-1.5"
              >
                <span>Deposit {formatUGX(total)} into Escrow</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        )}

        {step === 'prompt_simulation' && (
          <div className="flex-1 overflow-y-auto p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto animate-bounce">
              <Smartphone className="w-8 h-8" />
            </div>
            <div>
              <h4 className="font-bold text-gray-900 text-base">Mobile Money Prompt Sent</h4>
              <p className="text-xs text-gray-600 mt-1 max-w-xs mx-auto">
                Please check <span className="font-semibold text-gray-900">{phoneNumber}</span> to approve the payment of <span className="font-bold text-emerald-700">{formatUGX(total)}</span>.
              </p>
            </div>
            <div className="text-xs text-gray-400 flex items-center justify-center gap-1.5">
              <Clock className="w-4 h-4 animate-spin text-emerald-600" />
              <span>Simulating network approval...</span>
            </div>
          </div>
        )}

        {step === 'confirmed' && (
          <div className="flex-1 overflow-y-auto p-6 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h4 className="font-bold text-gray-900 text-base">Escrow Payment Confirmed!</h4>
              <p className="text-xs text-gray-600 mt-1">
                Your payment of <span className="font-bold text-emerald-700">{formatUGX(total)}</span> has been securely deposited into iSkillLink Escrow.
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-3 border border-gray-200 text-xs font-mono text-gray-700 text-left space-y-1">
              <div><span className="text-gray-400 font-sans">Payment Ref:</span> {refCode}</div>
              <div><span className="text-gray-400 font-sans">Method:</span> {provider.toUpperCase()}</div>
              <div><span className="text-gray-400 font-sans">Status:</span> SECURED_IN_ESCROW</div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => {
                  onClose();
                  onPaymentSuccess();
                }}
                className="w-full py-2.5 text-xs font-bold rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm"
              >
                View Updated Bookings
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

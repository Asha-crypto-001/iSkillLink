import React, { useState } from 'react';
import {
  ShieldCheck, CheckCircle2, ArrowRight, Award, Lock,
  Users, MapPin, DollarSign, Calendar, MessageSquare, Wrench
} from 'lucide-react';

interface HowItWorksPageProps {
  setCurrentView: (view: string) => void;
  onOpenSkillRequest: () => void;
}

export const HowItWorksPage: React.FC<HowItWorksPageProps> = ({
  setCurrentView,
  onOpenSkillRequest
}) => {
  const [activeTab, setActiveTab] = useState<'learners' | 'educators' | 'safety'>('learners');

  return (
    <div className="container-app py-12 space-y-12">
      {/* Page Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <span className="text-xs font-bold uppercase tracking-wider text-forest-700 bg-forest-50 px-3 py-1 rounded-md border border-forest-200">
          Transparent Operational Model
        </span>
        <h1 className="text-3xl sm:text-4xl font-bold text-ink-900 tracking-tight">
          How iSkillLink Works
        </h1>
        <p className="text-xs sm:text-sm text-ink-600 leading-relaxed">
          iSkillLink connects motivated learners with verified Ugandan educators, artisans, and professionals for direct practical skill acquisition. We coordinate discovery, vetting, bookings, and payment protection.
        </p>

        {/* Tab switch */}
        <div className="pt-4 flex justify-center">
          <div className="inline-flex p-1 bg-white rounded-card border border-ink-200 text-xs font-bold shadow-level-1">
            <button
              onClick={() => setActiveTab('learners')}
              className={`px-5 py-2.5 rounded-lg transition ${
                activeTab === 'learners' ? 'bg-forest-700 text-white shadow' : 'text-ink-600 hover:text-ink-900'
              }`}
            >
              For Students & Apprentices
            </button>
            <button
              onClick={() => setActiveTab('educators')}
              className={`px-5 py-2.5 rounded-lg transition ${
                activeTab === 'educators' ? 'bg-forest-700 text-white shadow' : 'text-ink-600 hover:text-ink-900'
              }`}
            >
              For Educators & Artisans
            </button>
            <button
              onClick={() => setActiveTab('safety')}
              className={`px-5 py-2.5 rounded-lg transition ${
                activeTab === 'safety' ? 'bg-forest-700 text-white shadow' : 'text-ink-600 hover:text-ink-900'
              }`}
            >
              Verification & Escrow
            </button>
          </div>
        </div>
      </div>

      {/* LEARNERS VIEW */}
      {activeTab === 'learners' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-card border border-ink-200 shadow-level-1 space-y-3">
              <div className="w-10 h-10 rounded-card bg-forest-50 text-forest-800 flex items-center justify-center font-bold text-base">
                1
              </div>
              <h3 className="font-bold text-ink-900 text-base">Browse or Submit a Custom Request</h3>
              <p className="text-xs text-ink-600 leading-relaxed">
                Explore verified educators across 20+ practical skill categories or post a custom learning request specifying your budget in UGX, preferred location (e.g. Mbarara High Street, Kakoba, Ruharo, or Kampala), and schedule.
              </p>
            </div>

            <div className="bg-white p-6 rounded-card border border-ink-200 shadow-level-1 space-y-3">
              <div className="w-10 h-10 rounded-card bg-forest-50 text-forest-800 flex items-center justify-center font-bold text-base">
                2
              </div>
              <h3 className="font-bold text-ink-900 text-base">Rule-Based Match & Profile Inspection</h3>
              <p className="text-xs text-ink-600 leading-relaxed">
                Review verified educator profiles, tool setups, photo portfolios of previous student creations, and ratings from past learners. Our rule-based matching engine suggests the best fit.
              </p>
            </div>

            <div className="bg-white p-6 rounded-card border border-ink-200 shadow-level-1 space-y-3">
              <div className="w-10 h-10 rounded-card bg-forest-50 text-forest-800 flex items-center justify-center font-bold text-base">
                3
              </div>
              <h3 className="font-bold text-ink-900 text-base">Escrow Payment via Mobile Money</h3>
              <p className="text-xs text-ink-600 leading-relaxed">
                Once an educator confirms your requested session, deposit funds into iSkillLink Escrow using MTN MoMo or Airtel Money. The educator does not receive payout until the session is completed.
              </p>
            </div>

            <div className="bg-white p-6 rounded-card border border-ink-200 shadow-level-1 space-y-3">
              <div className="w-10 h-10 rounded-card bg-forest-50 text-forest-800 flex items-center justify-center font-bold text-base">
                4
              </div>
              <h3 className="font-bold text-ink-900 text-base">Hands-on Apprenticeship & Review</h3>
              <p className="text-xs text-ink-600 leading-relaxed">
                Attend practical workshop sessions, operate real machines/tools, build tangible projects, mark milestone completion, and publish a verified student review.
              </p>
            </div>
          </div>

          <div className="bg-forest-800 p-8 rounded-3xl text-white text-center space-y-4">
            <h3 className="text-xl font-bold">Ready to master a practical skill?</h3>
            <p className="text-xs text-emerald-100 max-w-md mx-auto">
              Find verified educators in your area or submit a custom request today.
            </p>
            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={() => setCurrentView('find-skill')}
                className="px-6 py-2.5 rounded-card bg-white text-emerald-950 font-bold text-xs shadow"
              >
                Find a Skill
              </button>
              <button
                onClick={onOpenSkillRequest}
                className="px-6 py-2.5 rounded-card bg-emerald-900 text-white font-bold text-xs border border-emerald-700"
              >
                Request Custom Skill
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDUCATORS VIEW */}
      {activeTab === 'educators' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-card border border-ink-200 shadow-level-1 space-y-3">
              <div className="w-10 h-10 rounded-card bg-slate-100 text-ink-800 flex items-center justify-center font-bold text-base">
                1
              </div>
              <h3 className="font-bold text-ink-900 text-base">Multi-Step Verification Application</h3>
              <p className="text-xs text-ink-600 leading-relaxed">
                Submit your National ID (NIN), trade certifications (e.g. DIT trade tests, ERA licenses), and workshop location for our verification team to inspect.
              </p>
            </div>

            <div className="bg-white p-6 rounded-card border border-ink-200 shadow-level-1 space-y-3">
              <div className="w-10 h-10 rounded-card bg-slate-100 text-ink-800 flex items-center justify-center font-bold text-base">
                2
              </div>
              <h3 className="font-bold text-ink-900 text-base">Define Your Rates & Schedule</h3>
              <p className="text-xs text-ink-600 leading-relaxed">
                You maintain total control over your pricing in UGX (hourly and course packages), your availability, and the tools you provide at your workshop bench.
              </p>
            </div>

            <div className="bg-white p-6 rounded-card border border-ink-200 shadow-level-1 space-y-3">
              <div className="w-10 h-10 rounded-card bg-slate-100 text-ink-800 flex items-center justify-center font-bold text-base">
                3
              </div>
              <h3 className="font-bold text-ink-900 text-base">Accept Learner Bookings</h3>
              <p className="text-xs text-ink-600 leading-relaxed">
                Review student goals, accept bookings with one click, coordinate logistics via in-app messaging, and teach hands-on apprenticeship sessions.
              </p>
            </div>

            <div className="bg-white p-6 rounded-card border border-ink-200 shadow-level-1 space-y-3">
              <div className="w-10 h-10 rounded-card bg-slate-100 text-ink-800 flex items-center justify-center font-bold text-base">
                4
              </div>
              <h3 className="font-bold text-ink-900 text-base">Guaranteed 90% Net Payouts</h3>
              <p className="text-xs text-ink-600 leading-relaxed">
                iSkillLink facilitates bookings for a standard 10% platform fee. As soon as the student marks the session complete, your 90% share is disbursed via MTN / Airtel Mobile Money.
              </p>
            </div>
          </div>

          <div className="bg-ink-950 p-8 rounded-3xl text-white text-center space-y-4">
            <h3 className="text-xl font-bold">Monetize your craft and mentor the next generation</h3>
            <p className="text-xs text-ink-300 max-w-md mx-auto">
              Join Uganda's dedicated vocational and practical skills marketplace.
            </p>
            <div className="pt-2">
              <button
                onClick={() => setCurrentView('become-educator')}
                className="px-6 py-2.5 rounded-card bg-emerald-600 hover:bg-forest-500 text-white font-bold text-xs shadow"
              >
                Start Educator Application
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SAFETY & ESCROW VIEW */}
      {activeTab === 'safety' && (
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-card border border-ink-200 shadow-level-1 space-y-6">
            <div>
              <h2 className="text-lg font-bold text-ink-900">iSkillLink Escrow & Payment Protection Architecture</h2>
              <p className="text-xs text-ink-600 mt-1">
                How we protect both learners and educators against fraud, unfulfilled sessions, and disputes.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-card bg-forest-50/60 border border-forest-200 space-y-2">
                <ShieldCheck className="w-5 h-5 text-forest-700" />
                <h4 className="font-bold text-ink-900">Protected Escrow</h4>
                <p className="text-ink-600 leading-relaxed">
                  Funds are secured upon booking and held until practical milestones are delivered.
                </p>
              </div>

              <div className="p-4 rounded-card bg-forest-50/60 border border-forest-200 space-y-2">
                <Lock className="w-5 h-5 text-forest-700" />
                <h4 className="font-bold text-ink-900">Zero Credential Storage</h4>
                <p className="text-ink-600 leading-relaxed">
                  We never ask for or store Mobile Money PINs, passwords, or credit card security codes.
                </p>
              </div>

              <div className="p-4 rounded-card bg-forest-50/60 border border-forest-200 space-y-2">
                <CheckCircle2 className="w-5 h-5 text-forest-700" />
                <h4 className="font-bold text-ink-900">Dispute Mediation</h4>
                <p className="text-ink-600 leading-relaxed">
                  In case of scheduling conflicts or dissatisfaction, our Mbarara operations team led by Ashabahebwa Hassan mediates refund or rescheduling.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

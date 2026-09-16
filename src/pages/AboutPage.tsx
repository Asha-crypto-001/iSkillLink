import React from 'react';
import { ShieldCheck, Users, Target, Award, MapPin, CheckCircle2, ArrowRight, Phone, Mail } from 'lucide-react';

interface AboutPageProps {
  setCurrentView: (view: string) => void;
  onOpenSkillRequest: () => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({
  setCurrentView,
  onOpenSkillRequest
}) => {
  return (
    <div className="container-app py-12 space-y-12">
      {/* Hero Section */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <span className="text-xs font-bold uppercase tracking-wider text-forest-700 bg-forest-50 px-3 py-1 rounded-md border border-forest-200">
          Our Story & Purpose
        </span>
        <h1 className="text-3xl sm:text-4xl font-bold text-ink-900 tracking-tight">
          Where Skills Meet Opportunity
        </h1>
        <p className="text-xs sm:text-sm text-ink-600 leading-relaxed">
          Founded by <strong>Ashabahebwa Hassan</strong> in Mbarara, Uganda, iSkillLink bridges the divide between theoretical education and real-world practical mastery across East Africa.
        </p>
      </div>

      {/* Main Narrative Card */}
      <div className="bg-white p-8 sm:p-10 rounded-3xl border border-ink-200 shadow-level-1 space-y-6 text-sm text-ink-700 leading-relaxed">
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-ink-900">
            Addressing the Practical Skills Deficit in Uganda & Africa
          </h2>
          <p>
            Across Western Uganda, Greater Ankole, Kampala, and the wider East African region, thousands of ambitious young people graduate or seek self-reliance every year. However, thriving in today's economy requires concrete, hands-on capabilities: precision pattern drafting, micro-soldering, dairy farm management, solar PV sizing, commercial pastry baking, or production software development.
          </p>
          <p>
            At the same time, thousands of master craftspeople, verified technicians, and experienced professionals operate active workshops in Mbarara, Kampala, and regional hubs with immense practical knowledge, but lacked a structured, trusted platform to connect with learners and monetize their teaching.
          </p>
          <p>
            <strong>iSkillLink is that bridge.</strong> We provide the digital marketplace infrastructure—discovery, rigorous verification, rule-based matching, escrow protection, and structured progress tracking—that turns master workshops into accredited learning hubs.
          </p>
        </div>

        {/* 3 Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-ink-100">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-card bg-forest-50 text-forest-800 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-ink-900 text-sm">Rigorous Verification</h3>
            <p className="text-xs text-ink-600 leading-relaxed">
              Every educator undergoes National ID vetting, trade test assessment, and physical workshop inspections.
            </p>
          </div>

          <div className="space-y-2">
            <div className="w-10 h-10 rounded-card bg-forest-50 text-forest-800 flex items-center justify-center font-bold">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-ink-900 text-sm">100% Practical Focus</h3>
            <p className="text-xs text-ink-600 leading-relaxed">
              No passive theoretical slides. Learners work on real machines, real codebases, and real practical benches.
            </p>
          </div>

          <div className="space-y-2">
            <div className="w-10 h-10 rounded-card bg-forest-50 text-forest-800 flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-ink-900 text-sm">Escrow Protection</h3>
            <p className="text-xs text-ink-600 leading-relaxed">
              Mobile Money payments are secured in escrow until session completion, guaranteeing fair outcomes for all.
            </p>
          </div>
        </div>
      </div>

      {/* Leadership & Location */}
      <div className="bg-ink-950 text-white p-8 sm:p-10 rounded-3xl border border-ink-800 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="flex items-center gap-2 text-xs text-emerald-400 font-bold uppercase">
            <MapPin className="w-4 h-4" />
            <span>Headquartered in Mbarara City, Uganda</span>
          </div>
          <h3 className="text-xl font-bold text-white">Founded by Ashabahebwa Hassan</h3>
          <p className="text-xs text-ink-300 leading-relaxed">
            Leading practical vocational advancement from Mbarara City, Western Region, across Uganda and East Africa. Contact our office via WhatsApp at <strong>+256 744 024 529</strong> / <strong>+256 772 233 621</strong> or email <a href="mailto:iskilllink0@gmail.com" className="text-emerald-400 underline">iskilllink0@gmail.com</a>.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 shrink-0">
          <button
            onClick={() => setCurrentView('find-skill')}
            className="px-5 py-2.5 rounded-card bg-emerald-600 hover:bg-forest-500 text-white font-bold text-xs shadow"
          >
            Find a Skill
          </button>
          <button
            onClick={() => setCurrentView('become-educator')}
            className="px-5 py-2.5 rounded-card bg-ink-900 hover:bg-slate-700 text-slate-100 font-bold text-xs border border-ink-700"
          >
            Teach With Us
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { ShieldCheck, MapPin, Phone, Mail, Award, CheckCircle, Send, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';

interface FooterProps {
  setCurrentView: (view: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ setCurrentView }) => {
  const [footerEmail, setFooterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleFooterSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!footerEmail || !footerEmail.includes('@')) return;
    try {
      await api.subscribeNewsletter(footerEmail, 'All Practical Trades');
    } catch {}
    setSubscribed(true);
  };

  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800">
      {/* Top trust highlights */}
      <div className="border-b border-slate-800 bg-slate-950/40 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6 text-xs">
          <div className="flex items-start gap-3">
            <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-slate-100 text-sm">Vetted & Verified Educators</div>
              <div className="text-slate-400 mt-1">National ID validation, practical trade background checks & workshop inspection.</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-slate-100 text-sm">Escrow Payment Protection</div>
              <div className="text-slate-400 mt-1">Funds held securely via MTN & Airtel MoMo until training milestone is marked complete.</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Award className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-slate-100 text-sm">Hands-On Practical Learning</div>
              <div className="text-slate-400 mt-1">Real equipment, direct mentor guidance, workshop benches, and production projects.</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <MapPin className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-slate-100 text-sm">Headquartered in Mbarara</div>
              <div className="text-slate-400 mt-1">Serving Mbarara, Greater Ankole, Western Region, Kampala, and across Uganda.</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* Col 1: Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <button
              onClick={() => {
                setCurrentView('home');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex items-center gap-3 text-left group"
            >
              <div className="w-11 h-11 bg-white rounded-xl shadow-md border border-white/20 p-1.5 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
                <img
                  src="./logo.png"
                  alt="iSkillLink Logo"
                  className="w-full h-full object-contain rounded-lg"
                />
              </div>
              <div>
                <div className="text-xl font-bold text-white tracking-tight">
                  iSkillLink
                </div>
                <div className="text-[11px] text-emerald-400 font-semibold">
                  Founder: Ashabahebwa Hassan
                </div>
              </div>
            </button>
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              iSkillLink connects learners seeking practical, vocational, technical, and creative skills with verified Ugandan practitioners, master artisans, and professionals.
            </p>
            <div className="space-y-2 text-xs text-slate-400 pt-2">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Headquarters: Mbarara City, Western Region, Uganda</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>WhatsApp: +256 744 024 529 / +256 772 233 621</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-emerald-500 shrink-0" />
                <div className="flex flex-col">
                  <span><a href="mailto:iskilllink0@gmail.com" className="text-emerald-400 hover:underline">iskilllink0@gmail.com</a> (Inquiries & Newsletter)</span>
                  <span className="text-slate-400"><a href="mailto:ashabahebwahassan665@gmail.com" className="hover:underline">ashabahebwahassan665@gmail.com</a> (Founder)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Col 2: Marketplace */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-100 mb-4">
              Explore Skills
            </h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <button onClick={() => setCurrentView('find-skill')} className="hover:text-emerald-400 transition">
                  Fashion & Tailoring
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentView('find-skill')} className="hover:text-emerald-400 transition">
                  Web Dev & Programming
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentView('find-skill')} className="hover:text-emerald-400 transition">
                  Electronics & Phone Repair
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentView('find-skill')} className="hover:text-emerald-400 transition">
                  Solar & Electrical Wiring
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentView('find-skill')} className="hover:text-emerald-400 transition">
                  Commercial Baking & Pastry
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentView('find-skill')} className="hover:text-emerald-400 transition">
                  Dairy Farming & Agribusiness
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Platform */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-100 mb-4">
              Platform
            </h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <button onClick={() => setCurrentView('how-it-works')} className="hover:text-emerald-400 transition">
                  How It Works
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentView('become-educator')} className="hover:text-emerald-400 transition">
                  Teach on iSkillLink
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentView('about')} className="hover:text-emerald-400 transition">
                  About iSkillLink
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentView('contact')} className="hover:text-emerald-400 transition">
                  Help & Contact Us
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentView('find-skill')} className="hover:text-emerald-400 transition">
                  Verified Educators Directory
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Newsletter & Trust */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-100 mb-4">
              Newsletter
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-3">
              Get practical skill workshops and artisan alerts sent to <strong className="text-slate-200">iskilllink0@gmail.com</strong>.
            </p>
            {subscribed ? (
              <div className="bg-emerald-950/80 border border-emerald-700/60 rounded-xl p-3 text-xs text-emerald-200 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Subscribed! Check email client.</span>
              </div>
            ) : (
              <form onSubmit={handleFooterSubscribe} className="space-y-2">
                <div className="relative">
                  <input
                    type="email"
                    value={footerEmail}
                    onChange={(e) => setFooterEmail(e.target.value)}
                    placeholder="your.email@gmail.com"
                    required
                    className="w-full text-xs px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5"
                >
                  <span>Subscribe</span>
                  <Send className="w-3 h-3" />
                </button>
              </form>
            )}

            <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 space-y-1">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>Escrow Protected (MTN & Airtel)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>Vetted Ugandan Artisans</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <div>
            © {new Date().getFullYear()} iSkillLink Uganda • Founded by Ashabahebwa Hassan. “Where Skills Meet Opportunity.”
          </div>
          <div className="flex items-center gap-4">
            <span className="text-slate-400">Mbarara • Greater Ankole • Kampala • Entebbe • Jinja</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

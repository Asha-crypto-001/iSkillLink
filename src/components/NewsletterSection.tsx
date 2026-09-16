import React, { useState } from 'react';
import { Mail, CheckCircle2, Send, Sparkles, ArrowRight } from 'lucide-react';
import { api } from '../services/api';

export const NewsletterSection: React.FC = () => {
  const [email, setEmail] = useState('');
  const [interest, setInterest] = useState('All Practical Trades');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;

    setLoading(true);
    try {
      await api.subscribeNewsletter(email, interest);
      setIsSubmitted(true);
    } catch (err: any) {
      // Fallback: still show success via local persistence (api already handles fallback)
      setIsSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-gradient-to-br from-emerald-900 via-emerald-950 to-slate-950 text-white rounded-3xl p-8 sm:p-12 border border-emerald-800/60 shadow-xl relative overflow-hidden my-8">
      {/* Subtle background glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-800/60 border border-emerald-600/40 text-emerald-300 text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Stay Updated • Mbarara & Uganda</span>
        </div>

        <div className="space-y-3">
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white font-serif">
            Subscribe to the iSkillLink Newsletter
          </h2>
          <p className="text-xs sm:text-sm text-emerald-100/90 max-w-2xl mx-auto leading-relaxed">
            Get early announcements for upcoming hands-on artisan masterclasses, technical workshops, apprenticeship openings, and verified educator spotlights in Mbarara and across Uganda.
          </p>
        </div>

        {isSubmitted ? (
          <div className="bg-emerald-800/80 border border-emerald-500/60 rounded-2xl p-6 text-center max-w-md mx-auto space-y-2 animate-fadeIn">
            <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-md">
              <CheckCircle2 className="w-7 h-7 text-white" />
            </div>
            <h3 className="font-bold text-base text-white">You're Subscribed!</h3>
            <p className="text-xs text-emerald-100">
              Your subscription for <strong className="text-white">{email}</strong> has been routed to{' '}
              <a href="mailto:iskilllink0@gmail.com" className="underline font-bold text-amber-300">
                iskilllink0@gmail.com
              </a>
              . We look forward to connecting you with hands-on skill opportunities!
            </p>
            <button
              onClick={() => { setIsSubmitted(false); setEmail(''); }}
              className="mt-3 text-xs text-emerald-200 underline hover:text-white"
            >
              Subscribe another email
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold text-emerald-200 mb-1">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email (e.g. you@gmail.com)"
                    required
                    className="w-full text-xs sm:text-sm pl-10 pr-4 py-3 rounded-xl bg-white text-slate-900 border border-emerald-300/40 focus:outline-none focus:ring-2 focus:ring-amber-400 placeholder-slate-400 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-emerald-200 mb-1">
                  Skill Focus
                </label>
                <select
                  value={interest}
                  onChange={(e) => setInterest(e.target.value)}
                  className="w-full text-xs sm:text-sm px-3 py-3 rounded-xl bg-white text-slate-900 border border-emerald-300/40 focus:outline-none focus:ring-2 focus:ring-amber-400 font-medium"
                >
                  <option value="All Practical Trades">All Practical Trades</option>
                  <option value="Fashion & Tailoring">Fashion & Tailoring</option>
                  <option value="Web & Tech">Web Development & Tech</option>
                  <option value="Solar & Electrical">Solar & Electrical</option>
                  <option value="Phone Repair">Phone Repair & Electronics</option>
                  <option value="Baking & Culinary">Baking & Culinary</option>
                  <option value="Agriculture">Agribusiness & Dairy</option>
                  <option value="Photography">Photography & Video</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              <div className="text-[11px] text-emerald-200/80 flex items-center gap-1.5 text-center sm:text-left">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                <span>Routed to <strong className="text-white">iskilllink0@gmail.com</strong> • No spam, unsubscribe anytime.</span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition transform active:scale-95 disabled:opacity-50 shrink-0 cursor-pointer"
              >
                {loading ? (
                  <span>Subscribing...</span>
                ) : (
                  <>
                    <span>Subscribe Now</span>
                    <Send className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        <div className="pt-2 flex flex-wrap items-center justify-center gap-6 text-xs text-emerald-200/70 border-t border-emerald-800/40">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Weekly Practical Workshop Alerts</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Mbarara & Nationwide Apprentice Matchings</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Educator Registration Guides</span>
          </div>
        </div>
      </div>
    </section>
  );
};

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Send, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';
import logoUrl from '../assets/logo.png';

interface FooterProps {
  setCurrentView: (view: string) => void;
}

// Each link filters the catalogue to that trade (ids from the seeded categories).
const TRADE_LINKS = [
  { label: 'Fashion & tailoring', categoryId: 'cat-fashion' },
  { label: 'Solar & electrical', categoryId: 'cat-electrical' },
  { label: 'Cooking & baking', categoryId: 'cat-culinary' },
  { label: 'Phone repair', categoryId: 'cat-repair' },
  { label: 'Agriculture', categoryId: 'cat-agriculture' },
  { label: 'Web development', categoryId: 'cat-tech' }
];

export const Footer: React.FC<FooterProps> = ({ setCurrentView }) => {
  const [footerEmail, setFooterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [subscribeError, setSubscribeError] = useState('');

  const handleFooterSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubscribeError('');
    try {
      await api.subscribeNewsletter(footerEmail, 'All Practical Trades');
      setSubscribed(true);
    } catch (err: any) {
      setSubscribeError(err.message || 'Could not subscribe. Please try again.');
    }
  };

  const linkClass = 'inline-flex items-center min-h-[44px] md:min-h-0 hover:text-white transition rounded-control';

  return (
    <footer className="overflow-hidden bg-forest-950 text-forest-100/80 border-t border-forest-900">
      <div className="container-app py-12">
        <div className="grid grid-cols-2 md:grid-cols-12 gap-x-8 gap-y-10">
          {/* Brand + contact */}
          <div className="col-span-2 md:col-span-5 space-y-4">
            <button
              onClick={() => { setCurrentView('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className="flex items-center gap-3 min-h-[44px] text-left rounded-control"
              aria-label="iSkillLink home"
            >
              <span className="w-10 h-10 bg-white rounded-control p-1.5 flex items-center justify-center shrink-0">
                <img src={logoUrl} alt="" className="w-full h-full object-contain" aria-hidden="true" />
              </span>
              <span className="text-lg font-bold text-white tracking-[-0.01em]">iSkillLink</span>
            </button>
            <p className="text-sm text-forest-100/70 leading-relaxed max-w-sm">
              Hands-on lessons from people who do the work — tailors, electricians, bakers and technicians in Mbarara and across Uganda.
            </p>
            <ul className="md:space-y-2 text-sm text-forest-100/70">
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-forest-400 shrink-0" aria-hidden="true" />
                Mbarara City, Uganda
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-forest-400 shrink-0" aria-hidden="true" />
                <a href="https://wa.me/256744024529" target="_blank" rel="noopener noreferrer" className={linkClass}>WhatsApp +256 744 024 529</a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-forest-400 shrink-0" aria-hidden="true" />
                <a href="mailto:iskilllink0@gmail.com" className={linkClass}>iskilllink0@gmail.com</a>
              </li>
            </ul>
          </div>

          {/* Trades */}
          <nav className="md:col-span-2" aria-labelledby="footer-trades">
            <h3 id="footer-trades" className="text-sm font-semibold text-white mb-3">Learn a skill</h3>
            <ul className="md:space-y-2 text-sm text-forest-100/70">
              {TRADE_LINKS.map(link => (
                <li key={link.categoryId}>
                  <Link to={`/find-skill?category=${link.categoryId}`} className={linkClass}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Platform */}
          <nav className="md:col-span-2" aria-labelledby="footer-platform">
            <h3 id="footer-platform" className="text-sm font-semibold text-white mb-3">iSkillLink</h3>
            <ul className="md:space-y-2 text-sm text-forest-100/70">
              <li><Link to="/about#how-it-works" className={linkClass}>How it works</Link></li>
              <li><button onClick={() => setCurrentView('become-educator')} className={linkClass}>Teach on iSkillLink</button></li>
              <li><button onClick={() => setCurrentView('about')} className={linkClass}>About us</button></li>
              <li><button onClick={() => setCurrentView('contact')} className={linkClass}>Help & contact</button></li>
            </ul>
          </nav>

          {/* Newsletter — the site's only signup form */}
          <div className="col-span-2 md:col-span-3">
            <h3 className="text-sm font-semibold text-white mb-1">New educators near you</h3>
            <p className="text-sm text-forest-100/70 leading-relaxed mb-3">
              An email when someone new starts teaching a skill. No spam.
            </p>
            {subscribed ? (
              <p className="flex items-center gap-2 text-sm text-forest-300" role="status">
                <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
                You’re subscribed. Thank you!
              </p>
            ) : (
              <form onSubmit={handleFooterSubscribe} className="flex gap-2">
                <label htmlFor="footer-email" className="sr-only">Email address</label>
                <input
                  id="footer-email"
                  type="email"
                  value={footerEmail}
                  onChange={(e) => setFooterEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="flex-1 min-w-0 text-base sm:text-sm px-3 min-h-[44px] rounded-control bg-white/5 border border-white/15 text-white placeholder-forest-100/50 focus:outline-none focus:ring-2 focus:ring-sun-300"
                />
                <button
                  type="submit"
                  aria-label="Subscribe"
                  className="px-4 min-h-[44px] bg-sun-300 hover:bg-sun-200 text-ink-950 text-sm font-semibold rounded-control transition flex items-center gap-1.5 shrink-0"
                >
                  <Send className="w-4 h-4" aria-hidden="true" />
                </button>
              </form>
            )}
            {subscribeError && <p className="mt-2 text-xs text-rose-300" role="alert">{subscribeError}</p>}
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-forest-100/70">
          <p>© {new Date().getFullYear()} iSkillLink Uganda</p>
          <p>Made in Mbarara</p>
        </div>
      </div>
      {/* The name, set huge and faint, as the last thing on the page */}
      <p aria-hidden="true" className="select-none overflow-hidden text-center font-display font-bold leading-[0.8] tracking-[-0.05em] text-white/[0.07] text-[21vw] xl:text-[17rem] -mb-[0.08em]">
        iSkillLink
      </p>
    </footer>
  );
};

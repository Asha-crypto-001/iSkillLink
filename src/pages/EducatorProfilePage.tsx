import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Educator } from '../types';
import { api } from '../services/api';
import { formatUGX, formatShortDate } from '../utils/formatters';
import { BookingModal } from '../components/BookingModal';
import { Breadcrumbs } from '../components/ui/Breadcrumbs';
import { Alert } from '../components/ui/Alert';
import { Button } from '../components/ui/Button';
import { Avatar, isRealPhoto } from '../components/ui/Avatar';
import { Skeleton } from '../components/ui/Skeleton';
import { ShieldCheck, Star, MapPin, Clock, Share2, MessageCircle, CheckCircle2 } from 'lucide-react';

// Text the app fills in when an educator leaves "tools provided" blank; not worth showing as if they wrote it.
const DEFAULT_EQUIPMENT_TEXT = [
  'workshop practical equipment',
  'workshop equipment provided',
  'practical tools provided at workshop bench.',
  'workshop tools provided.'
];

const FORMAT_LABELS: Record<string, string> = {
  'in-person': 'At their workshop',
  hybrid: 'Mix of online and workshop',
  online: 'Online'
};

export const EducatorProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [educator, setEducator] = useState<Educator | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showBooking, setShowBooking] = useState(false);
  const [bookingSent, setBookingSent] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      try {
        setLoading(true);
        setError('');
        setEducator(await api.getEducatorById(id));
      } catch (e: any) {
        setError(e.message || 'Failed to load educator profile');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: educator?.user?.name || 'iSkillLink educator', url });
        return;
      }
    } catch {
      // Share sheet dismissed or unavailable: fall back to copying the link.
    }
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const whatsappShare = () => {
    if (!educator) return;
    const text = encodeURIComponent(`${educator.user?.name} teaches ${educator.title} on iSkillLink: ${window.location.href}`);
    window.open(`https://wa.me/?text=${text}`, '_blank', 'noopener');
  };

  if (loading) {
    return (
      <div className="container-app py-8 space-y-6" aria-busy="true" role="status">
        <span className="sr-only">Loading profile…</span>
        <div className="flex items-center gap-5">
          <Skeleton className="w-24 h-24 rounded-card" />
          <div className="space-y-3 flex-1 max-w-sm">
            <Skeleton className="h-7 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
        <Skeleton className="h-4 w-full max-w-2xl" />
        <Skeleton className="h-4 w-5/6 max-w-2xl" />
      </div>
    );
  }

  if (error || !educator) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <h1 className="text-2xl font-bold text-ink-900">We couldn’t find this educator</h1>
        <p className="text-sm text-ink-600">{error === 'Educator not found' || !error ? 'The link may be old, or the profile was taken down.' : error}</p>
        <div className="flex gap-2 justify-center pt-2">
          <Button onClick={() => navigate('/find-skill')}>Browse educators</Button>
          <Button variant="outline" onClick={() => navigate('/')}>Home</Button>
        </div>
      </div>
    );
  }

  const name = educator.user?.name || 'Educator';
  const firstName = name.split(' ')[0];
  const isLive = educator.status === 'active' || educator.status === 'approved';
  const reviews = educator.reviews || [];
  const portfolios = educator.portfolios || [];
  const qualifications = educator.qualifications || [];
  const equipment = educator.equipment_provided?.trim();
  const showEquipment = !!equipment && !DEFAULT_EQUIPMENT_TEXT.includes(equipment.toLowerCase());

  const sectionHeading = 'text-lg font-bold text-ink-900 font-display';

  return (
    <div className="container-app py-6 pb-28 lg:pb-10 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Breadcrumbs items={[{ label: 'Explore skills', to: '/find-skill' }, { label: name }]} />
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleShare} leftIcon={<Share2 className="w-3.5 h-3.5" />} aria-live="polite">
            {copied ? 'Link copied' : 'Share'}
          </Button>
          <Button variant="outline" size="sm" onClick={whatsappShare} leftIcon={<MessageCircle className="w-3.5 h-3.5" />}>
            WhatsApp
          </Button>
        </div>
      </div>

      {!isLive && (
        <Alert tone="info">This profile is still being checked by our team, so it can’t be booked yet.</Alert>
      )}
      {bookingSent && (
        <Alert tone="success" onDismiss={() => setBookingSent(false)}>
          Request sent to {firstName}. You’ll get a notification when {firstName} confirms — then you can pay into escrow from your dashboard.
        </Alert>
      )}

      <div className="grid lg:grid-cols-[1fr_20rem] gap-8 lg:gap-12 items-start">
        <div className="space-y-10 min-w-0">
          {/* Who */}
          <header className="flex flex-col sm:flex-row sm:items-center gap-5">
            <div className="relative shrink-0 self-start">
              <Avatar src={educator.user?.avatar_url} name={name} className="w-24 h-24 rounded-card" />
              {isLive && (
                <span className="absolute -bottom-1.5 -right-1.5 bg-forest-700 text-white p-1 rounded-full ring-2 ring-ink-50" aria-hidden="true">
                  <ShieldCheck className="w-4 h-4" />
                </span>
              )}
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-3xl sm:text-4xl font-bold text-ink-900 font-display">{name}</h1>
                {isLive && (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold bg-forest-50 text-forest-800 border border-forest-200 px-2 py-0.5 rounded-pill">
                    <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" /> Verified
                  </span>
                )}
              </div>
              <p className="text-lg text-ink-700 mt-1">{educator.title}</p>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-ink-600 mt-2">
                <span className="flex items-center gap-1"><MapPin className="w-4 h-4 text-ink-400" aria-hidden="true" />{educator.location}</span>
                <span className="flex items-center gap-1"><Clock className="w-4 h-4 text-ink-400" aria-hidden="true" />{educator.years_experience} years experience</span>
                {educator.rating > 0 ? (
                  <span className="flex items-center gap-1 font-semibold text-ink-800">
                    <Star className="w-4 h-4 fill-amber-500 text-amber-500" aria-hidden="true" />
                    {educator.rating.toFixed(1)} · {educator.total_reviews} {educator.total_reviews === 1 ? 'review' : 'reviews'}
                  </span>
                ) : (
                  <span>New on iSkillLink</span>
                )}
              </div>
            </div>
          </header>

          {/* About */}
          {educator.bio?.trim() && (
            <section aria-labelledby="about-heading" className="space-y-2">
              <h2 id="about-heading" className={sectionHeading}>About {firstName}</h2>
              <p className="text-base text-ink-800 leading-relaxed max-w-prose">{educator.bio}</p>
            </section>
          )}

          {/* What they teach */}
          {educator.skills && educator.skills.length > 0 && (
            <section aria-labelledby="teaches-heading" className="space-y-3">
              <h2 id="teaches-heading" className={sectionHeading}>What {firstName} teaches</h2>
              <ul className="divide-y divide-ink-200 border-y border-ink-200">
                {educator.skills.map(s => (
                  <li key={s.id} className="py-4 flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-ink-900">{s.skill_name}</span>
                        <span className="text-xs font-semibold capitalize px-2 py-0.5 rounded-pill bg-ink-100 text-ink-700">{s.proficiency_level}</span>
                      </div>
                      {s.description && <p className="text-sm text-ink-600 mt-1">{s.description}</p>}
                    </div>
                    <div className="text-sm font-semibold text-ink-900 whitespace-nowrap">{formatUGX(s.hourly_rate_ugx)} / hr</div>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* The workshop */}
          <section aria-labelledby="workshop-heading" className="space-y-3">
            <h2 id="workshop-heading" className={sectionHeading}>The workshop</h2>
            <dl className="grid sm:grid-cols-2 gap-x-8 gap-y-4 text-sm">
              <div>
                <dt className="text-ink-600">Based in</dt>
                <dd className="font-semibold text-ink-900">{educator.location}</dd>
              </div>
              <div>
                <dt className="text-ink-600">Also teaches around</dt>
                <dd className="font-semibold text-ink-900">{educator.service_area}</dd>
              </div>
              <div>
                <dt className="text-ink-600">How you’ll learn</dt>
                <dd className="font-semibold text-ink-900">{educator.teaching_formats.map(f => FORMAT_LABELS[f] || f).join(', ')}</dd>
              </div>
              <div>
                <dt className="text-ink-600">Languages</dt>
                <dd className="font-semibold text-ink-900">{educator.languages.join(', ')}</dd>
              </div>
              {showEquipment && (
                <div className="sm:col-span-2">
                  <dt className="text-ink-600">Tools you’ll use</dt>
                  <dd className="font-semibold text-ink-900">{equipment}</dd>
                </div>
              )}
            </dl>
          </section>

          {/* Qualifications — "Verified" only when the team actually verified one */}
          {qualifications.length > 0 && (
            <section aria-labelledby="quals-heading" className="space-y-3">
              <h2 id="quals-heading" className={sectionHeading}>Qualifications</h2>
              <ul className="space-y-2">
                {qualifications.map(q => (
                  <li key={q.id} className="flex items-start justify-between gap-3 text-sm">
                    <div>
                      <div className="font-semibold text-ink-900">{q.title}</div>
                      <div className="text-ink-600">{q.institution} · {q.year}</div>
                    </div>
                    {q.verified && (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-forest-800 shrink-0">
                        <CheckCircle2 className="w-4 h-4" aria-hidden="true" /> Checked by our team
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Work samples — only when there are some */}
          {portfolios.length > 0 && (
            <section aria-labelledby="work-heading" className="space-y-3">
              <h2 id="work-heading" className={sectionHeading}>Work by {firstName}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {portfolios.map(p => (
                  <figure key={p.id} className="rounded-card border border-ink-200 overflow-hidden bg-white">
                    {isRealPhoto(p.image_url) && <img src={p.image_url} alt={p.title} className="w-full h-48 object-cover" />}
                    <figcaption className="p-4">
                      <div className="font-semibold text-ink-900">{p.title}</div>
                      {p.description && <p className="text-sm text-ink-600 mt-1">{p.description}</p>}
                    </figcaption>
                  </figure>
                ))}
              </div>
            </section>
          )}

          {/* Reviews */}
          <section aria-labelledby="reviews-heading" className="space-y-3">
            <h2 id="reviews-heading" className={sectionHeading}>
              Reviews{reviews.length > 0 && <span className="text-ink-500 font-normal"> · {reviews.length}</span>}
            </h2>
            {reviews.length > 0 ? (
              <ul className="space-y-6">
                {reviews.map(r => (
                  <li key={r.id} className="space-y-2">
                    <div className="flex items-center gap-2.5">
                      <Avatar src={r.learner_avatar} name={r.learner_name} className="w-9 h-9 rounded-full" />
                      <div className="min-w-0">
                        <span className="font-semibold text-ink-900 text-sm block">{r.learner_name}</span>
                        <span className="text-xs text-ink-600">{formatShortDate(r.created_at)}</span>
                      </div>
                      <span className="ml-auto flex gap-0.5" role="img" aria-label={`${r.rating} out of 5 stars`}>
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`w-4 h-4 ${i < r.rating ? 'fill-amber-500 text-amber-500' : 'text-ink-300'}`} aria-hidden="true" />
                        ))}
                      </span>
                    </div>
                    <p className="text-[15px] text-ink-800 leading-relaxed max-w-prose">“{r.comment}”</p>
                    {r.educator_reply && (
                      <p className="pl-3 border-l-2 border-forest-700 text-sm text-ink-700 max-w-prose">
                        <span className="font-semibold text-ink-900">{firstName} replied:</span> {r.educator_reply}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-ink-600">No reviews yet — {firstName} is new on iSkillLink. Reviews appear here after learners finish a session.</p>
            )}
          </section>
        </div>

        {/* Booking box — sticky beside the profile on desktop */}
        <aside className="hidden lg:block sticky top-24" aria-label="Book a session">
          <div className="bg-white rounded-card border border-ink-200 shadow-level-2 p-6 space-y-4">
            <div>
              <span className="font-display text-3xl font-bold text-ink-900">{formatUGX(educator.hourly_rate_ugx)}</span>
              <span className="text-ink-600"> / hour</span>
            </div>
            <Button className="w-full" size="lg" disabled={!isLive} onClick={() => setShowBooking(true)}>
              Book a session
            </Button>
            <p className="text-sm text-ink-600 leading-relaxed">
              Your MoMo payment is held by iSkillLink and only released to {firstName} after the session is done.
            </p>
          </div>
        </aside>
      </div>

      {/* Mobile: price and booking always within thumb reach */}
      <div className="lg:hidden fixed inset-x-0 bottom-0 z-30 bg-white/95 backdrop-blur border-t border-ink-200 px-4 py-3 pb-safe flex items-center justify-between gap-3">
        <div className="leading-tight">
          <span className="font-display text-lg font-bold text-ink-900">{formatUGX(educator.hourly_rate_ugx)}</span>
          <span className="text-sm text-ink-600"> / hour</span>
        </div>
        <Button disabled={!isLive} onClick={() => setShowBooking(true)}>Book a session</Button>
      </div>

      {showBooking && (
        <BookingModal
          educator={educator}
          onClose={() => setShowBooking(false)}
          onBookingSuccess={() => { setShowBooking(false); setBookingSent(true); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
        />
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { Educator } from '../types';
import { formatUGX, formatShortDate } from '../utils/formatters';
import {
  X, ShieldCheck, Star, MapPin, Clock, Award, Globe,
  Wrench, CheckCircle2, Calendar
} from 'lucide-react';
import { Modal } from './ui/Modal';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';

interface EducatorProfileModalProps {
  educator: Educator | null;
  onClose: () => void;
  onRequestBooking: (educator: Educator) => void;
}

export const EducatorProfileModal: React.FC<EducatorProfileModalProps> = ({
  educator,
  onClose,
  onRequestBooking
}) => {
  if (!educator) return null;

  const [activeTab, setActiveTab] = useState<'overview' | 'skills' | 'portfolio' | 'reviews'>('overview');

  const avatar = educator.user?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80';
  const name = educator.user?.name || 'Educator';

  const tabs: { id: typeof activeTab; label: string; count?: number }[] = [
    { id: 'overview', label: 'Overview & Workshop' },
    { id: 'skills', label: 'Skills & Pricing', count: educator.skills?.length || 0 },
    { id: 'portfolio', label: 'Work Samples & Proof', count: educator.portfolios?.length || 0 },
    { id: 'reviews', label: 'Student Reviews', count: educator.reviews?.length || 0 },
  ];

  return (
    <Modal isOpen={!!educator} onClose={onClose} titleId="educator-profile-title" title={`${name} — Verified Practitioner`} maxWidth="max-w-4xl">
      {/* Modal Header — pinned */}
      <div className="shrink-0 relative bg-ink-950 text-white p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-ink-800">
        <button
          onClick={onClose}
          aria-label="Close profile"
          className="absolute top-4 right-4 p-2 rounded-full bg-ink-800 hover:bg-ink-700 text-ink-300 hover:text-white transition min-h-[44px] min-w-[44px] flex items-center justify-center"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-4 sm:gap-6">
          <div className="relative">
            <img
              src={avatar}
              alt={name}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-display object-cover border-2 border-ink-800 shadow-level-2"
            />
            {educator.status === 'active' && (
              <span className="absolute -bottom-1.5 -right-1.5 bg-forest-600 text-white p-1 rounded-full ring-2 ring-ink-950 shadow-soft" aria-label="Verified">
                <ShieldCheck className="w-4 h-4" />
              </span>
            )}
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 id="educator-profile-title" className="text-xl sm:text-2xl font-bold text-white tracking-tight font-display">{name}</h2>
              <Badge variant="verified" size="sm" dot>
                <ShieldCheck className="w-3.5 h-3.5" />
                Verified Practitioner
              </Badge>
            </div>

            <p className="text-[13px] font-medium text-ink-300 mt-1">{educator.title}</p>

            <div className="flex flex-wrap items-center gap-4 text-xs text-ink-300 mt-2">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-forest-400" />
                {educator.location}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-forest-400" />
                {educator.years_experience} Years Active Craft
              </span>
              {educator.rating > 0 && (
                <span className="flex items-center gap-1 bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded-pill font-bold border border-amber-400/20">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  {educator.rating.toFixed(2)} ({educator.total_reviews} Reviews)
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="sm:text-right w-full sm:w-auto pt-4 sm:pt-0 border-t sm:border-t-0 border-ink-800">
          <div className="text-[11px] text-ink-400 uppercase font-bold tracking-wider">Standard Rate</div>
          <div className="text-2xl font-bold text-white font-display">
            {formatUGX(educator.hourly_rate_ugx)}
            <span className="text-xs font-normal text-ink-400"> / hr</span>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              onClose();
              onRequestBooking(educator);
            }}
            leftIcon={<Calendar className="w-3.5 h-3.5" />}
            className="mt-3 w-full sm:w-auto"
          >
            Request to Learn
          </Button>
        </div>
      </div>

      {/* Tab Navigation — accessible */}
      <div className="shrink-0 border-b border-ink-200 px-6 sm:px-8 bg-ink-50 flex gap-6 text-[13px] font-semibold overflow-x-auto" role="tablist" aria-label="Educator profile sections">
        {tabs.map(tab => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`py-3.5 border-b-2 whitespace-nowrap transition ${
              activeTab === tab.id ? 'border-forest-700 text-forest-800' : 'border-transparent text-ink-600 hover:text-ink-900'
            }`}
          >
            {tab.label} {tab.count !== undefined ? `(${tab.count})` : ''}
          </button>
        ))}
      </div>

      {/* Scrollable Body */}
      <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 bg-white">
        {activeTab === 'overview' && (
          <div className="space-y-6" role="tabpanel">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-ink-700 mb-2">
                Professional Background & Experience
              </h4>
              <p className="text-[13px] text-ink-800 leading-relaxed bg-ink-50 p-4 rounded-card border border-ink-200">
                {educator.bio}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-card border border-ink-200 bg-white space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-ink-900">
                  <Wrench className="w-4 h-4 text-forest-700" />
                  <span>Workshop Tools & Equipment Provided</span>
                </div>
                <p className="text-[13px] text-ink-700 leading-relaxed">
                  {educator.equipment_provided || 'Full practical equipment available for hands-on apprenticeship.'}
                </p>
              </div>

              <div className="p-4 rounded-card border border-ink-200 bg-white space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-ink-900">
                  <MapPin className="w-4 h-4 text-forest-700" />
                  <span>Service Area & Locations</span>
                </div>
                <p className="text-[13px] text-ink-800">
                  <span className="font-semibold text-ink-900">Base: </span>{educator.location}
                </p>
                <p className="text-[13px] text-ink-800">
                  <span className="font-semibold text-ink-900">Covered: </span>{educator.service_area}
                </p>
              </div>

              <div className="p-4 rounded-card border border-ink-200 bg-white space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-ink-900">
                  <Globe className="w-4 h-4 text-forest-700" />
                  <span>Languages Spoken</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {educator.languages.map(l => (
                    <Badge key={l} variant="neutral" size="sm">{l}</Badge>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-card border border-ink-200 bg-white space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-ink-900">
                  <Award className="w-4 h-4 text-forest-700" />
                  <span>Teaching Formats</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {educator.teaching_formats.map(f => (
                    <Badge key={f} variant="success" size="sm">
                      {f === 'in-person' ? 'In-Person Workshop' : f === 'online' ? 'Online Live' : 'Hybrid'}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {educator.qualifications && educator.qualifications.length > 0 && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-ink-700 mb-2">
                  Verified Qualifications & Certifications
                </h4>
                <div className="space-y-2">
                  {educator.qualifications.map(q => (
                    <div
                      key={q.id}
                      className="p-3 rounded-control border border-ink-200 bg-white flex items-center justify-between text-xs"
                    >
                      <div className="flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-forest-600 shrink-0 mt-0.5" />
                        <div>
                          <div className="font-semibold text-ink-900">{q.title}</div>
                          <div className="text-ink-600">{q.institution} ({q.year})</div>
                        </div>
                      </div>
                      <Badge variant="success" size="sm">Verified by iSkillLink</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'skills' && (
          <div className="space-y-4" role="tabpanel">
            <p className="text-[13px] text-ink-700">
              Each practical skill is taught hands-on with transparent hourly or package rates in Ugandan Shillings (UGX).
            </p>
            <div className="space-y-3">
              {educator.skills?.map(s => (
                <div
                  key={s.id}
                  className="p-4 rounded-card border border-ink-200 bg-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-ink-900 text-[15px] font-display">{s.skill_name}</span>
                      <Badge variant="neutral" size="sm">{s.proficiency_level}</Badge>
                    </div>
                    <p className="text-[13px] text-ink-700 mt-1">{s.description}</p>
                  </div>

                  <div className="sm:text-right shrink-0">
                    <div className="text-[15px] font-bold text-ink-900 font-display">
                      {formatUGX(s.hourly_rate_ugx)}
                      <span className="text-xs font-normal text-ink-600"> / hr</span>
                    </div>
                    {s.package_rate_ugx && (
                      <div className="text-xs text-forest-700 font-semibold mt-0.5">
                        Full Package: {formatUGX(s.package_rate_ugx)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'portfolio' && (
          <div className="space-y-4" role="tabpanel">
            <p className="text-[13px] text-ink-700">
              Real photos and verified projects produced by {name} and previous students.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {educator.portfolios?.map(p => (
                <div key={p.id} className="rounded-card border border-ink-200 overflow-hidden bg-white group">
                  <img
                    src={p.image_url}
                    alt={p.title}
                    className="w-full aspect-[4/3] object-cover group-hover:scale-[1.02] transition duration-300"
                  />
                  <div className="p-4">
                    <Badge variant="success" size="sm" className="mb-1">{p.tag}</Badge>
                    <h5 className="font-bold text-ink-900 text-[15px] font-display">{p.title}</h5>
                    <p className="text-[13px] text-ink-700 mt-1">{p.description}</p>
                  </div>
                </div>
              ))}
              {(!educator.portfolios || educator.portfolios.length === 0) && (
                <div className="col-span-2 text-center py-8 text-ink-600 text-[13px]">No work samples yet.</div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="space-y-4" role="tabpanel">
            {educator.reviews && educator.reviews.length > 0 ? (
              <div className="space-y-4">
                {educator.reviews.map(r => (
                  <div key={r.id} className="p-4 rounded-card border border-ink-200 bg-white space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={r.learner_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'}
                          alt={r.learner_name}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                        <div>
                          <span className="font-semibold text-ink-900 text-[13px] block">{r.learner_name}</span>
                          <span className="text-xs text-ink-500">{formatShortDate(r.created_at)}</span>
                        </div>
                      </div>

                      <Badge variant="warning" size="sm">
                        <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                        {r.rating}.0
                      </Badge>
                    </div>

                    <p className="text-[13px] text-ink-800 leading-relaxed bg-ink-50 p-3 rounded-control border border-ink-100">
                      "{r.comment}"
                    </p>

                    {r.educator_reply && (
                      <div className="ml-4 pl-3 border-l-2 border-forest-600 text-[13px] bg-forest-50/50 p-2.5 rounded-r-control">
                        <span className="font-semibold text-forest-900 block text-xs">Educator Reply:</span>
                        <span className="text-ink-700 mt-0.5 block">{r.educator_reply}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-ink-600 text-[13px]">
                No public reviews recorded yet. Be among the first to learn with this educator!
              </div>
            )}
          </div>
        )}
      </div>

      {/* Sticky Bottom Action */}
      <div className="shrink-0 p-4 sm:px-8 bg-ink-50 border-t border-ink-200 flex items-center justify-between gap-4">
        <div className="text-xs text-ink-600 hidden sm:block">
          Protected by iSkillLink Escrow • Satisfaction Guarantee
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <Button variant="outline" size="sm" onClick={onClose}>Close</Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              onClose();
              onRequestBooking(educator);
            }}
            leftIcon={<Calendar className="w-3.5 h-3.5" />}
          >
            Book Learning Session
          </Button>
        </div>
      </div>
    </Modal>
  );
};

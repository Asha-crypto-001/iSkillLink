import React, { useState } from 'react';
import { Educator } from '../types';
import { formatUGX, formatShortDate } from '../utils/formatters';
import {
  X, ShieldCheck, Star, MapPin, Clock, Award, Globe,
  Wrench, CheckCircle2, MessageSquare, Calendar, ExternalLink,
  ChevronRight, Sparkles, UserCheck, PhoneCall
} from 'lucide-react';

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

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-gray-200 overflow-hidden">
        {/* Modal Header — pinned */}
        <div className="shrink-0 relative bg-slate-900 text-white p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-4 sm:gap-6">
            <div className="relative">
              <img
                src={avatar}
                alt={name}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-slate-700 shadow-md"
              />
              {educator.status === 'active' && (
                <span className="absolute -bottom-1.5 -right-1.5 bg-emerald-600 text-white p-1 rounded-full ring-2 ring-slate-900 shadow">
                  <ShieldCheck className="w-4 h-4" />
                </span>
              )}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">{name}</h2>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded-md">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Verified Practitioner
                </span>
              </div>

              <p className="text-sm font-medium text-slate-300 mt-1">{educator.title}</p>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 mt-2">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                  {educator.location}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-emerald-400" />
                  {educator.years_experience} Years Active Craft
                </span>
                {educator.rating > 0 && (
                  <span className="flex items-center gap-1 bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    {educator.rating.toFixed(2)} ({educator.total_reviews} Reviews)
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Quick Price & Action in Header */}
          <div className="sm:text-right w-full sm:w-auto pt-4 sm:pt-0 border-t sm:border-t-0 border-slate-800">
            <div className="text-xs text-slate-400 uppercase font-semibold">Standard Rate</div>
            <div className="text-2xl font-black text-white">
              {formatUGX(educator.hourly_rate_ugx)}
              <span className="text-xs font-normal text-slate-400"> / hr</span>
            </div>
            <button
              onClick={() => {
                onClose();
                onRequestBooking(educator);
              }}
              className="mt-2 w-full sm:w-auto px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition shadow-md flex items-center justify-center gap-1.5"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Request to Learn</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation — pinned */}
        <div className="shrink-0 border-b border-gray-200 px-6 sm:px-8 bg-gray-50 flex space-x-6 text-xs font-semibold overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3.5 border-b-2 transition ${
              activeTab === 'overview' ? 'border-emerald-700 text-emerald-800' : 'border-transparent text-gray-700 hover:text-gray-900'
            }`}
          >
            Overview & Workshop
          </button>
          <button
            onClick={() => setActiveTab('skills')}
            className={`py-3.5 border-b-2 transition ${
              activeTab === 'skills' ? 'border-emerald-700 text-emerald-800' : 'border-transparent text-gray-700 hover:text-gray-900'
            }`}
          >
            Skills & Pricing ({educator.skills?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('portfolio')}
            className={`py-3.5 border-b-2 transition ${
              activeTab === 'portfolio' ? 'border-emerald-700 text-emerald-800' : 'border-transparent text-gray-700 hover:text-gray-900'
            }`}
          >
            Work Samples & Proof ({educator.portfolios?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`py-3.5 border-b-2 transition ${
              activeTab === 'reviews' ? 'border-emerald-700 text-emerald-800' : 'border-transparent text-gray-700 hover:text-gray-900'
            }`}
          >
            Student Reviews ({educator.reviews?.length || 0})
          </button>
        </div>

        {/* Modal Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Bio */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                  Professional Background & Experience
                </h4>
                <p className="text-sm text-gray-800 leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-200">
                  {educator.bio}
                </p>
              </div>

              {/* Teaching Setup Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-gray-200 bg-white space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-gray-900">
                    <Wrench className="w-4 h-4 text-emerald-700" />
                    <span>Workshop Tools & Equipment Provided</span>
                  </div>
                  <p className="text-xs text-gray-800 leading-relaxed">
                    {educator.equipment_provided || 'Full practical equipment available for hands-on apprenticeship.'}
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-gray-200 bg-white space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-gray-900">
                    <MapPin className="w-4 h-4 text-emerald-700" />
                    <span>Service Area & Locations</span>
                  </div>
                  <p className="text-xs text-gray-800">
                    <span className="font-semibold text-gray-900">Base: </span>{educator.location}
                  </p>
                  <p className="text-xs text-gray-800">
                    <span className="font-semibold text-gray-900">Covered: </span>{educator.service_area}
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-gray-200 bg-white space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-gray-900">
                    <Globe className="w-4 h-4 text-emerald-700" />
                    <span>Languages Spoken</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {educator.languages.map(l => (
                      <span key={l} className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-800">
                        {l}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-gray-200 bg-white space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-gray-900">
                    <Award className="w-4 h-4 text-emerald-700" />
                    <span>Teaching Formats</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {educator.teaching_formats.map(f => (
                      <span key={f} className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-900 border border-emerald-200">
                        {f === 'in-person' ? 'In-Person Workshop' : f === 'online' ? 'Online Live' : 'Hybrid'}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Verified Qualifications */}
              {educator.qualifications && educator.qualifications.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                    Verified Qualifications & Certifications
                  </h4>
                  <div className="space-y-2">
                    {educator.qualifications.map(q => (
                      <div
                        key={q.id}
                        className="p-3 rounded-lg border border-gray-200 bg-white flex items-center justify-between text-xs"
                      >
                        <div className="flex items-start gap-2.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <div>
                            <div className="font-semibold text-gray-900">{q.title}</div>
                            <div className="text-gray-700">{q.institution} ({q.year})</div>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200">
                          Verified by iSkillLink
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'skills' && (
            <div className="space-y-4">
              <div className="text-xs text-gray-800">
                Each practical skill is taught hands-on with transparent hourly or package rates in Ugandan Shillings (UGX).
              </div>
              <div className="space-y-3">
                {educator.skills?.map(s => (
                  <div
                    key={s.id}
                    className="p-4 rounded-xl border border-gray-200 bg-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900 text-sm">{s.skill_name}</span>
                        <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-gray-100 text-gray-700">
                          {s.proficiency_level} Level
                        </span>
                      </div>
                      <p className="text-xs text-gray-800 mt-1">{s.description}</p>
                    </div>

                    <div className="sm:text-right shrink-0">
                      <div className="text-sm font-black text-gray-900">
                        {formatUGX(s.hourly_rate_ugx)}
                        <span className="text-xs font-normal text-gray-700"> / hr</span>
                      </div>
                      {s.package_rate_ugx && (
                        <div className="text-[11px] text-emerald-800 font-semibold mt-0.5">
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
            <div className="space-y-4">
              <div className="text-xs text-gray-800">
                Real photos and verified projects produced by {name} and previous students.
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {educator.portfolios?.map(p => (
                  <div key={p.id} className="rounded-xl border border-gray-200 overflow-hidden bg-white group">
                    <img
                      src={p.image_url}
                      alt={p.title}
                      className="w-full h-48 object-cover group-hover:scale-105 transition duration-300"
                    />
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] font-semibold uppercase text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                          {p.tag}
                        </span>
                      </div>
                      <h5 className="font-bold text-gray-900 text-sm">{p.title}</h5>
                      <p className="text-xs text-gray-800 mt-1">{p.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-4">
              {educator.reviews && educator.reviews.length > 0 ? (
                <div className="space-y-4">
                  {educator.reviews.map(r => (
                    <div key={r.id} className="p-4 rounded-xl border border-gray-200 bg-white space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={r.learner_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'}
                            alt={r.learner_name}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                          <div>
                            <span className="font-semibold text-gray-900 text-xs block">{r.learner_name}</span>
                            <span className="text-[10px] text-gray-700">{formatShortDate(r.created_at)}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
                          <Star className="w-3.5 h-3.5 fill-amber-500" />
                          <span>{r.rating}.0</span>
                        </div>
                      </div>

                      <p className="text-xs text-gray-800 leading-relaxed bg-gray-50 p-3 rounded-lg border border-gray-100">
                        "{r.comment}"
                      </p>

                      {r.educator_reply && (
                        <div className="ml-4 pl-3 border-l-2 border-emerald-600 text-xs bg-emerald-50/50 p-2.5 rounded-r-lg">
                          <span className="font-semibold text-emerald-950 block text-[11px]">Educator Reply:</span>
                          <span className="text-gray-800 mt-0.5 block">{r.educator_reply}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-700 text-xs">
                  No public reviews recorded yet. Be among the first to learn with this educator!
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Sticky Bottom Action — pinned */}
        <div className="shrink-0 p-4 sm:px-8 bg-gray-50 border-t border-gray-200 flex items-center justify-between gap-4">
          <div className="text-xs text-gray-700 hidden sm:block">
            Protected by iSkillLink Escrow • Satisfaction Guarantee
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-100"
            >
              Close
            </button>
            <button
              onClick={() => {
                onClose();
                onRequestBooking(educator);
              }}
              className="px-5 py-2 text-xs font-bold rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm flex items-center gap-1.5"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Book Learning Session</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

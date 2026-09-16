import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Educator } from '../types';
import { api } from '../services/api';
import { formatUGX, formatShortDate } from '../utils/formatters';
import { BookingModal } from '../components/BookingModal';
import {
  ShieldCheck, Star, MapPin, Clock, Award, Globe, Wrench, CheckCircle2,
  Calendar, ChevronRight, ArrowLeft, Share2, MessageCircle
} from 'lucide-react';

export const EducatorProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [educator, setEducator] = useState<Educator | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'skills' | 'portfolio' | 'reviews'>('overview');
  const [showBooking, setShowBooking] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      try {
        setLoading(true);
        const data = await api.getEducatorById(id);
        setEducator(data);
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
        await navigator.share({ title: educator?.user?.name || 'iSkillLink Educator', url });
      } else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const whatsappShare = () => {
    if (!educator) return;
    const text = encodeURIComponent(`Check out ${educator.user?.name} — ${educator.title} on iSkillLink Uganda: ${window.location.href}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <div className="animate-pulse space-y-4">
          <div className="w-24 h-24 bg-gray-200 rounded-2xl mx-auto" />
          <div className="h-6 bg-gray-200 rounded w-1/3 mx-auto" />
          <div className="h-4 bg-gray-100 rounded w-1/2 mx-auto" />
        </div>
        <p className="text-xs text-gray-500 mt-6">Loading verified educator profile...</p>
      </div>
    );
  }

  if (error || !educator) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-200">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Educator Not Found</h2>
        <p className="text-xs text-gray-600">{error || 'This profile may have been removed or is under verification.'}</p>
        <div className="flex gap-2 justify-center pt-2">
          <button onClick={() => navigate('/find-skill')} className="px-5 py-2.5 rounded-xl bg-emerald-700 text-white text-xs font-bold hover:bg-emerald-800">Browse Educators</button>
          <button onClick={() => navigate('/')} className="px-5 py-2.5 rounded-xl bg-white border border-gray-300 text-xs font-semibold hover:bg-gray-50">Back Home</button>
        </div>
      </div>
    );
  }

  const avatar = educator.user?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80';
  const name = educator.user?.name || 'Educator';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Breadcrumb & Share */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        <nav className="flex items-center gap-1.5 text-gray-500" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-emerald-700 font-medium">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <Link to="/find-skill" className="hover:text-emerald-700 font-medium">Explore Skills</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-gray-900 font-semibold truncate max-w-[150px]">{name}</span>
        </nav>
        <div className="flex items-center gap-2">
          <button onClick={handleShare} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-xs font-semibold">
            <Share2 className="w-3.5 h-3.5" />
            <span>{copied ? 'Link Copied!' : 'Share Profile'}</span>
          </button>
          <button onClick={whatsappShare} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold">
            <MessageCircle className="w-3.5 h-3.5" />
            <span>WhatsApp</span>
          </button>
        </div>
      </div>

      {/* Header Card */}
      <div className="bg-slate-900 text-white rounded-2xl overflow-hidden border border-slate-800 shadow-lg">
        <div className="p-6 sm:p-8 flex flex-col sm:flex-row items-start justify-between gap-6">
          <div className="flex gap-5">
            <div className="relative shrink-0">
              <img src={avatar} alt={name} className="w-24 h-24 rounded-2xl object-cover border-2 border-slate-700 shadow-md" />
              {educator.status === 'active' && <span className="absolute -bottom-1.5 -right-1.5 bg-emerald-600 text-white p-1 rounded-full ring-2 ring-slate-900"><ShieldCheck className="w-4 h-4" /></span>}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight">{name}</h1>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded-md"><ShieldCheck className="w-3.5 h-3.5" /> Verified</span>
              </div>
              <p className="text-sm font-medium text-slate-300 mt-1">{educator.title}</p>
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 mt-2">
                <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-emerald-400" />{educator.location}</span>
                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-emerald-400" />{educator.years_experience} Years</span>
                {educator.rating > 0 && <span className="flex items-center gap-1 bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded font-bold"><Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />{educator.rating.toFixed(2)} ({educator.total_reviews})</span>}
              </div>
            </div>
          </div>
          <div className="sm:text-right w-full sm:w-auto pt-4 sm:pt-0 border-t sm:border-0 border-slate-800">
            <div className="text-xs text-slate-400 uppercase font-semibold">Standard Rate</div>
            <div className="text-2xl font-black">{formatUGX(educator.hourly_rate_ugx)}<span className="text-xs font-normal text-slate-400"> / hr</span></div>
            <button onClick={() => setShowBooking(true)} className="mt-2 w-full sm:w-auto px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition shadow-md flex items-center justify-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" /><span>Request to Learn</span>
            </button>
            <button onClick={() => navigate('/find-skill')} className="mt-2 w-full sm:w-auto px-5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center justify-center gap-1">
              <ArrowLeft className="w-3 h-3" /><span>Back to Directory</span>
            </button>
          </div>
        </div>

        <div className="bg-gray-50 border-t border-gray-200 px-6 sm:px-8 flex space-x-6 text-xs font-semibold overflow-x-auto">
          {(['overview','skills','portfolio','reviews'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`py-3.5 border-b-2 whitespace-nowrap transition ${activeTab===tab ? 'border-emerald-700 text-emerald-800' : 'border-transparent text-gray-700 hover:text-gray-900'}`}>
              {tab === 'overview' ? 'Overview & Workshop' : tab === 'skills' ? `Skills & Pricing (${educator.skills?.length||0})` : tab === 'portfolio' ? `Work Samples (${educator.portfolios?.length||0})` : `Reviews (${educator.reviews?.length||0})`}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8 space-y-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">Professional Background</h4>
              <p className="text-sm text-gray-800 leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-200">{educator.bio}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-gray-200 bg-white space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-gray-900"><Wrench className="w-4 h-4 text-emerald-700" /><span>Workshop Tools</span></div>
                <p className="text-xs text-gray-800 leading-relaxed">{educator.equipment_provided || 'Full practical equipment available.'}</p>
              </div>
              <div className="p-4 rounded-xl border border-gray-200 bg-white space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-gray-900"><MapPin className="w-4 h-4 text-emerald-700" /><span>Service Area</span></div>
                <p className="text-xs text-gray-800"><span className="font-semibold">Base:</span> {educator.location}</p>
                <p className="text-xs text-gray-800"><span className="font-semibold">Covered:</span> {educator.service_area}</p>
              </div>
              <div className="p-4 rounded-xl border border-gray-200 bg-white space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-gray-900"><Globe className="w-4 h-4 text-emerald-700" /><span>Languages</span></div>
                <div className="flex flex-wrap gap-1.5">{educator.languages.map(l => <span key={l} className="text-xs px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-800">{l}</span>)}</div>
              </div>
              <div className="p-4 rounded-xl border border-gray-200 bg-white space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-gray-900"><Award className="w-4 h-4 text-emerald-700" /><span>Teaching Formats</span></div>
                <div className="flex flex-wrap gap-1.5">{educator.teaching_formats.map(f => <span key={f} className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-900 border border-emerald-200">{f==='in-person'?'In-Person Workshop':f==='online'?'Online Live':'Hybrid'}</span>)}</div>
              </div>
            </div>
            {educator.qualifications && educator.qualifications.length>0 && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">Verified Qualifications</h4>
                <div className="space-y-2">
                  {educator.qualifications.map(q => (
                    <div key={q.id} className="p-3 rounded-lg border border-gray-200 bg-white flex items-center justify-between text-xs">
                      <div className="flex items-start gap-2.5"><CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" /><div><div className="font-semibold text-gray-900">{q.title}</div><div className="text-gray-700">{q.institution} ({q.year})</div></div></div>
                      <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200">Verified</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'skills' && (
          <div className="space-y-4">
            <div className="text-xs text-gray-800">Each practical skill is taught hands-on with transparent UGX pricing.</div>
            <div className="space-y-3">
              {educator.skills?.map(s => (
                <div key={s.id} className="p-4 rounded-xl border border-gray-200 bg-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div><div className="flex items-center gap-2"><span className="font-bold text-gray-900 text-sm">{s.skill_name}</span><span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-gray-100 text-gray-700">{s.proficiency_level}</span></div><p className="text-xs text-gray-800 mt-1">{s.description}</p></div>
                  <div className="sm:text-right shrink-0"><div className="text-sm font-black text-gray-900">{formatUGX(s.hourly_rate_ugx)}<span className="text-xs font-normal text-gray-700"> / hr</span></div></div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'portfolio' && (
          <div className="space-y-4">
            <div className="text-xs text-gray-800">Verified projects produced by {name} and apprentices.</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {educator.portfolios?.map(p => (
                <div key={p.id} className="rounded-xl border border-gray-200 overflow-hidden bg-white group">
                  <img src={p.image_url} alt={p.title} className="w-full h-48 object-cover group-hover:scale-105 transition duration-300" />
                  <div className="p-4"><span className="text-[11px] font-semibold uppercase text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">{p.tag}</span><h5 className="font-bold text-gray-900 text-sm mt-1">{p.title}</h5><p className="text-xs text-gray-800 mt-1">{p.description}</p></div>
                </div>
              ))}
              {(!educator.portfolios || educator.portfolios.length===0) && <div className="col-span-2 text-center text-xs text-gray-500 py-8">No work samples yet.</div>}
            </div>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="space-y-4">
            {educator.reviews && educator.reviews.length>0 ? (
              <div className="space-y-4">
                {educator.reviews.map(r => (
                  <div key={r.id} className="p-4 rounded-xl border border-gray-200 bg-white space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5"><img src={r.learner_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'} alt={r.learner_name} className="w-8 h-8 rounded-full object-cover" /><div><span className="font-semibold text-gray-900 text-xs block">{r.learner_name}</span><span className="text-[10px] text-gray-700">{formatShortDate(r.created_at)}</span></div></div>
                      <div className="flex items-center gap-1 text-amber-500 text-xs font-bold"><Star className="w-3.5 h-3.5 fill-amber-500" /><span>{r.rating}.0</span></div>
                    </div>
                    <p className="text-xs text-gray-800 leading-relaxed bg-gray-50 p-3 rounded-lg border border-gray-100">"{r.comment}"</p>
                    {r.educator_reply && <div className="ml-4 pl-3 border-l-2 border-emerald-600 text-xs bg-emerald-50/50 p-2.5 rounded-r-lg"><span className="font-semibold text-emerald-950 block text-[11px]">Educator Reply:</span><span className="text-gray-800 mt-0.5 block">{r.educator_reply}</span></div>}
                  </div>
                ))}
              </div>
            ) : <div className="text-center py-8 text-gray-700 text-xs">No public reviews yet. Be the first to learn!</div>}
          </div>
        )}
      </div>

      {showBooking && <BookingModal educator={educator} onClose={() => setShowBooking(false)} onBookingSuccess={() => { setShowBooking(false); }} />}
    </div>
  );
};

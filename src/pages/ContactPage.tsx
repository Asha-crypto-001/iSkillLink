import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Clock, CheckCircle2, MessageCircle, ArrowUpRight, Plus, Minus } from 'lucide-react';
import { api } from '../services/api';
import { Field } from '../components/ui/Field';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Textarea } from '../components/ui/Textarea';
import { Button } from '../components/ui/Button';
import { Alert } from '../components/ui/Alert';

const SUBJECTS = [
  'General question',
  'Help finding an educator',
  'My educator application',
  'A payment or refund',
  'Partnership'
];

const FAQS = [
  {
    q: 'How do you check educators before they can teach?',
    a: 'Every educator passes four checks: we match their NIN to their national ID card, review an LC1 letter and police clearance, talk with them, and visit their workshop to see their tools and finished work. Nobody can take bookings until all four are done.'
  },
  {
    q: 'How is my payment protected?',
    a: 'You pay with MTN MoMo or Airtel Money once the educator has confirmed your booking. The money waits with iSkillLink until the session has happened; only then do we pay the educator their 90%.'
  },
  {
    q: 'Can I learn online, or only in person?',
    a: 'Most hands-on skills, like tailoring, solar installation, baking or welding, are taught in person at the educator’s workshop. Skills that suit a screen, like web development or design, can also be taught online.'
  },
  {
    q: 'What if the educator cancels or doesn’t show up?',
    a: 'Tell us and our team in Mbarara will refund you in full, or help you agree a new date with the educator.'
  },
  {
    q: 'What’s the quickest way to get an answer?',
    a: 'WhatsApp, during our hours: Monday to Saturday, 8am to 6pm. Messages sent with the form are answered by email, or on WhatsApp if you leave your number.'
  }
];

const sectionEyebrow = 'text-xs font-bold uppercase tracking-[0.14em] text-forest-700';
const sectionTitle = 'mt-2 text-[1.75rem] sm:text-4xl font-bold text-ink-900 tracking-[-0.02em] font-display leading-[1.1]';

export const ContactPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState(SUBJECTS[0]);
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError('');
    try {
      await api.createInquiry({ name, email, phone, subject, message });
      setSubmitted(true);
    } catch (err: any) {
      setSubmitError(err.message || 'Failed to send message. Please try again or contact us on WhatsApp.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="overflow-x-clip">
      {/* ===== HERO — the ways to reach us, WhatsApp first ===== */}
      <section className="container-app pt-12 pb-16 sm:pt-16 lg:pt-20 lg:pb-20">
        <div className="max-w-2xl space-y-5">
          <p className={sectionEyebrow}>Contact</p>
          <h1 className="font-display font-bold text-ink-900 text-[2.4rem] sm:text-[3.4rem] lg:text-[4rem] leading-[1.02] tracking-[-0.035em]">
            Talk to our team in Mbarara
          </h1>
          <p className="text-base sm:text-lg text-ink-600 leading-relaxed">
            Questions about a booking, a payment or teaching on iSkillLink? A real person reads every message.
          </p>
        </div>

        <ul className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* WhatsApp is how most people reach us — make it the obvious first choice */}
          <li className="relative isolate overflow-hidden rounded-card bg-forest-700 p-6 text-white sm:col-span-2 lg:col-span-1">
            <span aria-hidden="true" className="absolute -right-10 -top-12 -z-10 h-36 w-36 rounded-full border border-white/20 bg-white/10" />
            <span className="glass-dark flex h-12 w-12 items-center justify-center rounded-control" aria-hidden="true">
              <MessageCircle className="h-6 w-6" />
            </span>
            <h2 className="mt-5 text-lg font-bold">WhatsApp</h2>
            <p className="mt-1 text-sm text-forest-100/85">The quickest way to reach us.</p>
            <a
              href="https://wa.me/256744024529"
              target="_blank"
              rel="noopener noreferrer"
              className="group mt-5 inline-flex items-center gap-2.5 pl-5 pr-1.5 min-h-[48px] rounded-pill bg-white hover:bg-forest-50 text-ink-900 text-sm font-semibold transition focus-visible:ring-white focus-visible:ring-offset-forest-700"
            >
              +256 744 024 529
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-forest-700 text-white transition-transform group-hover:rotate-45" aria-hidden="true">
                <ArrowUpRight className="h-4 w-4" />
              </span>
            </a>
          </li>
          <li className="glass rounded-card p-6">
            <span className="flex h-12 w-12 items-center justify-center rounded-control bg-sky-50 text-sky-600" aria-hidden="true">
              <Phone className="h-6 w-6" />
            </span>
            <h2 className="mt-5 text-lg font-bold text-ink-900">Call us</h2>
            <p className="mt-1 text-sm text-ink-600">Speak to someone during office hours.</p>
            <a href="tel:+256772233621" className="mt-5 inline-flex min-h-[44px] items-center text-base font-semibold text-forest-700 underline underline-offset-4 hover:text-forest-800">
              +256 772 233 621
            </a>
          </li>
          <li className="glass rounded-card p-6">
            <span className="flex h-12 w-12 items-center justify-center rounded-control bg-amber-50 text-amber-600" aria-hidden="true">
              <Mail className="h-6 w-6" />
            </span>
            <h2 className="mt-5 text-lg font-bold text-ink-900">Email</h2>
            <p className="mt-1 text-sm text-ink-600">For anything that needs documents or detail.</p>
            <a href="mailto:iskilllink0@gmail.com" className="mt-5 inline-flex min-h-[44px] items-center text-base font-semibold text-forest-700 underline underline-offset-4 hover:text-forest-800 break-all">
              iskilllink0@gmail.com
            </a>
          </li>
        </ul>

        <ul className="mt-6 flex flex-wrap gap-x-8 gap-y-3 text-sm text-ink-600">
          <li className="flex items-center gap-2"><Clock className="h-4 w-4 text-ink-500" aria-hidden="true" />Monday – Saturday, 8am – 6pm</li>
          <li className="flex items-center gap-2"><MapPin className="h-4 w-4 text-ink-500" aria-hidden="true" />Mbarara City, Western Uganda</li>
        </ul>
      </section>

      {/* ===== MESSAGE FORM ===== */}
      <section className="bg-ink-50/60 border-y border-ink-100 py-16 lg:py-24" aria-labelledby="message-heading">
        <div className="container-app grid lg:grid-cols-[0.85fr_1.15fr] gap-10 lg:gap-16">
          <div>
            <p className={sectionEyebrow}>Send a message</p>
            <h2 id="message-heading" className={sectionTitle}>Prefer to write it down?</h2>
            <p className="mt-3 text-base text-ink-600 leading-relaxed max-w-md">
              Tell us what you need and we’ll reply by email, or on WhatsApp if you leave your number.
            </p>
          </div>

          <div className="rounded-card border border-ink-200 bg-white p-6 sm:p-8 shadow-level-1">
            {submitted ? (
              <div className="py-6 text-center space-y-3" role="status">
                <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-forest-50 text-forest-700" aria-hidden="true">
                  <CheckCircle2 className="h-7 w-7" />
                </span>
                <h3 className="font-display text-xl font-bold text-ink-900">Message sent</h3>
                <p className="text-sm text-ink-600 max-w-sm mx-auto">
                  Thank you, {name}. We’ve got your message and will reply by email or WhatsApp.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Your name" htmlFor="contact-name" required>
                    <Input
                      id="contact-name"
                      type="text"
                      autoComplete="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </Field>

                  <Field label="Email" htmlFor="contact-email" required>
                    <Input
                      id="contact-email"
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                    />
                  </Field>

                  <Field label="Phone or WhatsApp" htmlFor="contact-phone" hint="Optional. We’ll reply on WhatsApp if you add it.">
                    <Input
                      id="contact-phone"
                      type="tel"
                      autoComplete="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+256 70X XXX XXX"
                    />
                  </Field>

                  <Field label="What is it about?" htmlFor="contact-subject">
                    <Select
                      id="contact-subject"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                    >
                      {SUBJECTS.map(option => <option key={option} value={option}>{option}</option>)}
                    </Select>
                  </Field>
                </div>

                <Field label="Message" htmlFor="contact-message" required>
                  <Textarea
                    id="contact-message"
                    rows={5}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tell us how we can help"
                    required
                  />
                </Field>

                {submitError && (
                  <Alert>{submitError}</Alert>
                )}
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  isLoading={isSubmitting}
                >
                  Send message
                </Button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <section className="container-app py-16 lg:py-24" aria-labelledby="contact-faq-heading">
        <div className="grid lg:grid-cols-[0.85fr_1.15fr] gap-10 lg:gap-16">
          <div>
            <p className={sectionEyebrow}>Questions</p>
            <h2 id="contact-faq-heading" className={sectionTitle}>Maybe we’ve already answered it</h2>
            <p className="mt-3 text-base text-ink-600 leading-relaxed max-w-md">
              The things people ask us most. For the full picture, see{' '}
              <Link to="/about#how-it-works" className="font-semibold text-forest-700 underline underline-offset-2 hover:text-forest-800">how iSkillLink works</Link>.
            </p>
          </div>
          <ul className="space-y-3">
            {FAQS.map((faq, index) => {
              const open = openFaq === index;
              return (
                <li key={faq.q} className={`rounded-card border transition ${open ? 'border-forest-200 bg-forest-50/60' : 'border-ink-200 bg-white'}`}>
                  <h3 className="text-base">
                    <button
                      onClick={() => setOpenFaq(open ? null : index)}
                      aria-expanded={open}
                      aria-controls={`contact-faq-${index}`}
                      className="flex w-full items-center justify-between gap-4 px-5 py-4 min-h-[56px] text-left font-semibold text-ink-900 font-sans"
                    >
                      {faq.q}
                      <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${open ? 'bg-forest-700 text-white' : 'bg-ink-100 text-ink-700'}`} aria-hidden="true">
                        {open ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                      </span>
                    </button>
                  </h3>
                  {open && <p id={`contact-faq-${index}`} className="px-5 pb-5 -mt-1 text-sm text-ink-700 leading-relaxed">{faq.a}</p>}
                </li>
              );
            })}
          </ul>
        </div>
      </section>
    </div>
  );
};

import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, CheckCircle2, ChevronDown } from 'lucide-react';
import { api } from '../services/api';
import { Field } from '../components/ui/Field';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Textarea } from '../components/ui/Textarea';
import { Button } from '../components/ui/Button';

export const ContactPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('General Inquiry');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // FAQ accordion state
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: 'How does iSkillLink verify educators before they can teach?',
      a: 'We conduct a 4-step vetting process: National ID (NIN) validation with Ugandan records, review of trade certificates (e.g. DIT trade tests, ERA permits), physical inspection of workshop tools, and screening interviews.'
    },
    {
      q: 'How does the Mobile Money Escrow system protect my payment?',
      a: 'When you book a session, your payment (via MTN MoMo or Airtel Money) is held securely in the iSkillLink platform escrow. The educator only receives their 90% payout after the practical session is delivered and you mark milestone completion.'
    },
    {
      q: 'Can I learn skills in-person at a workshop or online?',
      a: 'Both options are available! Most vocational and artisan trades (such as Tailoring, Solar Installation, Baking, Welding, Phone Repair, Dairy Farming) are taught hands-on at verified workshops in Mbarara, Kampala, and regional hubs. Tech and business skills are available both online and in-person.'
    },
    {
      q: 'What if an educator cancels or does not show up?',
      a: 'If a session cannot proceed as scheduled, you can either reschedule with the educator or request an immediate 100% refund from our operations team.'
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError('');
    try {
      await api.createInquiry({ name, email, phone, subject, message });
      setSubmitted(true);
    } catch (err: any) {
      setSubmitError(err.message || 'Failed to send message. Please try again or contact via WhatsApp.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container-app py-12 space-y-12">
      {/* Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-md border border-emerald-200">
          Support & Management
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
          Contact iSkillLink Uganda
        </h1>
        <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
          Reach our management team led by <strong>Ashabahebwa Hassan</strong> in Mbarara City for verification inquiries, custom learning requests, or platform support.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Contact Info Sidebar */}
        <div className="space-y-6">
          <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="font-bold text-sm text-white uppercase tracking-wider">
              Mbarara Operations HQ
            </h3>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Mbarara City, Western Region, Uganda</span>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <div>WhatsApp: +256 744 024 529</div>
                  <div className="text-slate-400 mt-0.5">Direct Line: +256 772 233 621</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <div><a href="mailto:iskilllink0@gmail.com" className="hover:text-emerald-300 underline font-medium">iskilllink0@gmail.com</a> (Official Inquiries)</div>
                  <div className="text-slate-400 mt-0.5"><a href="mailto:ashabahebwahassan665@gmail.com" className="hover:text-emerald-300 underline">ashabahebwahassan665@gmail.com</a> (Founder)</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Mon – Sat: 8:00 AM – 6:00 PM EAT</span>
              </div>
            </div>
          </div>

          <div className="bg-emerald-50/70 p-5 rounded-2xl border border-emerald-200 space-y-2 text-xs text-emerald-950">
            <h4 className="font-bold text-emerald-900">Direct WhatsApp Helpline</h4>
            <p className="text-[11px] text-emerald-800 leading-relaxed">
              For immediate assistance with bookings or verification, reach Founder & Admin Ashabahebwa Hassan on WhatsApp at <a href="https://wa.me/256744024529" target="_blank" rel="noreferrer" className="underline font-bold">+256 744 024 529</a>.
            </p>
          </div>
        </div>

        {/* Contact Form — now unified via Field/Input primitives (Phase 3) */}
        <div className="lg:col-span-2 bg-white p-6 sm:p-8 rounded-card border border-ink-200 shadow-level-1 space-y-4">
          <h3 className="font-bold text-base text-ink-900 font-display">Send Us a Message</h3>

          {submitted ? (
            <div className="p-6 bg-forest-50 rounded-card border border-forest-200 text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-forest-600 mx-auto" />
              <h4 className="font-bold text-forest-900 text-[13px]">Message Sent Successfully!</h4>
              <p className="text-[13px] text-forest-800">
                Thank you, {name}. Ashabahebwa Hassan and the iSkillLink team will respond to your message promptly.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Your Full Name" htmlFor="contact-name" required>
                  <Input
                    id="contact-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Your Full Name"
                    required
                  />
                </Field>

                <Field label="Email Address" htmlFor="contact-email" required>
                  <Input
                    id="contact-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. yourname@example.com"
                    required
                  />
                </Field>

                <Field label="Phone / WhatsApp" htmlFor="contact-phone" hint="Optional — for faster reply via WhatsApp">
                  <Input
                    id="contact-phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+256 70X XXX XXX"
                  />
                </Field>

                <Field label="Inquiry Subject" htmlFor="contact-subject">
                  <Select
                    id="contact-subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                  >
                    <option value="General Inquiry">General Inquiry</option>
                    <option value="Custom Skill Request Assistance">Custom Skill Request Assistance</option>
                    <option value="Educator Verification Status">Educator Verification Status</option>
                    <option value="Mobile Money Escrow Support">Mobile Money Escrow Support</option>
                    <option value="Institutional Partnership">Institutional Partnership</option>
                  </Select>
                </Field>
              </div>

              <Field label="Message Details" htmlFor="contact-message" required>
                <Textarea
                  id="contact-message"
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us how we can help you..."
                  required
                />
              </Field>

              {submitError && (
                <div className="p-3 rounded-control bg-rose-50 border border-rose-200 text-rose-700 text-[13px] flex items-center gap-2" role="alert">
                  <span>{submitError}</span>
                </div>
              )}
              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={isSubmitting}
              >
                Send Message to iSkillLink
              </Button>
            </form>
          )}
        </div>
      </div>

      {/* FAQ Accordion Section */}
      <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm space-y-6">
        <div className="text-center space-y-1">
          <h3 className="text-xl font-bold text-gray-900">Frequently Asked Questions</h3>
          <p className="text-xs text-gray-500">Everything you need to know about learning and teaching on iSkillLink.</p>
        </div>

        <div className="space-y-3 max-w-3xl mx-auto">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="border border-gray-200 rounded-xl overflow-hidden text-xs"
            >
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full p-4 text-left font-bold text-gray-900 bg-gray-50/50 hover:bg-gray-50 flex items-center justify-between transition"
              >
                <span>{faq.q}</span>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${openFaq === idx ? 'rotate-180 text-emerald-700' : ''}`} />
              </button>
              {openFaq === idx && (
                <div className="p-4 bg-white text-gray-600 leading-relaxed border-t border-gray-100">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

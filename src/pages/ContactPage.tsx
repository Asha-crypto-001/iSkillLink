import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, CheckCircle2, ChevronDown } from 'lucide-react';
import { api } from '../services/api';
import { Field } from '../components/ui/Field';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Textarea } from '../components/ui/Textarea';
import { Button } from '../components/ui/Button';
import { Alert } from '../components/ui/Alert';

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
      <div className="space-y-3 max-w-2xl">
        <h1 className="text-3xl sm:text-4xl font-bold text-ink-900 font-display">
          Talk to us
        </h1>
        <p className="text-base text-ink-600 leading-relaxed">
          Questions about a booking, a payment or teaching on iSkillLink? Our team in Mbarara reads every message.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Contact Info Sidebar */}
        <div className="space-y-6">
          {/* WhatsApp is how most people reach us — make it the obvious first choice */}
          <div className="bg-white p-6 rounded-card border border-ink-200 shadow-level-1 space-y-3">
            <h2 className="font-bold text-base text-ink-900">Fastest: WhatsApp</h2>
            <a
              href="https://wa.me/256744024529"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full min-h-[48px] rounded-control bg-forest-700 hover:bg-forest-800 text-white text-sm font-bold"
            >
              <Phone className="w-4 h-4" aria-hidden="true" /> +256 744 024 529
            </a>
            <p className="flex items-center gap-2 text-sm text-ink-600"><Clock className="w-4 h-4" aria-hidden="true" /> Mon – Sat, 8am – 6pm</p>
          </div>

          <ul className="space-y-3 text-sm text-ink-700 px-1">
            <li className="flex items-start gap-3"><Phone className="w-4 h-4 text-ink-500 shrink-0 mt-0.5" aria-hidden="true" /><span>Call: +256 772 233 621</span></li>
            <li className="flex items-start gap-3"><Mail className="w-4 h-4 text-ink-500 shrink-0 mt-0.5" aria-hidden="true" /><a href="mailto:iskilllink0@gmail.com" className="underline underline-offset-2 hover:text-ink-900">iskilllink0@gmail.com</a></li>
            <li className="flex items-start gap-3"><MapPin className="w-4 h-4 text-ink-500 shrink-0 mt-0.5" aria-hidden="true" /><span>Mbarara City, Western Uganda</span></li>
          </ul>
        </div>

        {/* Contact Form — now unified via Field/Input primitives (Phase 3) */}
        <div className="lg:col-span-2 bg-white p-6 sm:p-8 rounded-card border border-ink-200 shadow-level-1 space-y-4">
          <h2 className="font-bold text-base text-ink-900 font-display">Or send a message</h2>

          {submitted ? (
            <div className="p-6 bg-forest-50 rounded-card border border-forest-200 text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-forest-600 mx-auto" />
              <h3 className="font-bold text-forest-900 text-[14px]">Message sent</h3>
              <p className="text-[14px] text-forest-800">
                Thank you, {name}. We’ve got your message and will reply by email or WhatsApp.
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
                <Alert>{submitError}</Alert>
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
      <div className="bg-white p-8 rounded-3xl border border-ink-200 shadow-sm space-y-6">
        <div className="text-center space-y-1">
          <h3 className="text-xl font-bold text-ink-900">Frequently Asked Questions</h3>
          <p className="text-xs text-ink-500">Everything you need to know about learning and teaching on iSkillLink.</p>
        </div>

        <div className="space-y-3 max-w-3xl mx-auto">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="border border-ink-200 rounded-xl overflow-hidden text-xs"
            >
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full p-4 text-left font-bold text-ink-900 bg-ink-50/50 hover:bg-ink-50 flex items-center justify-between transition"
              >
                <span>{faq.q}</span>
                <ChevronDown className={`w-4 h-4 text-ink-400 transition-transform ${openFaq === idx ? 'rotate-180 text-forest-700' : ''}`} />
              </button>
              {openFaq === idx && (
                <div className="p-4 bg-white text-ink-600 leading-relaxed border-t border-ink-100">
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

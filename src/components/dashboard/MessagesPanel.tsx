import React, { ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ArrowLeft, MessageCircle, MessageSquare, Search, Send } from 'lucide-react';
import { Message } from '../../types';
import { Avatar } from '../ui/Avatar';
import { cn } from '../../utils/cn';
import { whatsappNumber } from '../../utils/formatters';

export interface ChatContact {
  /** The other person's user id. */
  id: string;
  name: string;
  subtitle?: string;
  avatar_url?: string;
  phone?: string;
}

interface MessagesPanelProps {
  currentUserId: string;
  contacts: ChatContact[];
  messages: Message[];
  onSend: (receiverId: string, text: string) => Promise<unknown>;
  onMarkRead: (conversationId: string, other: { id: string; name: string }) => void;
  emptyTitle: string;
  emptyDescription: string;
  emptyAction?: ReactNode;
  /** Quick openers offered in an empty conversation. */
  suggestions?: string[];
}

const timeOf = (iso: string) => new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

function dayLabel(iso: string) {
  const day = new Date(iso);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (day.toDateString() === today.toDateString()) return 'Today';
  if (day.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return day.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
}

/** Today's time, "Yesterday", or a short date — for the conversation list. */
function shortWhen(iso: string) {
  const label = dayLabel(iso);
  if (label === 'Today') return timeOf(iso);
  if (label === 'Yesterday') return label;
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

/**
 * A two-pane inbox: people on the left (latest conversation first, unread counts), the chat on
 * the right. On phones it shows one pane at a time. `?with=<userId>` opens that conversation.
 */
export const MessagesPanel: React.FC<MessagesPanelProps> = ({
  currentUserId, contacts, messages, onSend, onMarkRead, emptyTitle, emptyDescription, emptyAction, suggestions = []
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedId, setSelectedId] = useState(searchParams.get('with') || '');
  const [mobileThreadOpen, setMobileThreadOpen] = useState(!!searchParams.get('with'));
  const [draft, setDraft] = useState('');
  const [query, setQuery] = useState('');
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState('');
  const threadEndRef = useRef<HTMLDivElement | null>(null);
  const composerRef = useRef<HTMLTextAreaElement | null>(null);

  // Everyone the user can talk to, plus anyone who has written to them.
  const people = useMemo(() => {
    const byId = new Map(contacts.map(c => [c.id, c]));
    messages.forEach(m => {
      const otherId = m.sender_id === currentUserId ? m.receiver_id : m.sender_id;
      if (!byId.has(otherId)) byId.set(otherId, { id: otherId, name: 'iSkillLink member' });
    });
    return [...byId.values()].map(person => {
      const thread = messages
        .filter(m => (m.sender_id === person.id && m.receiver_id === currentUserId) || (m.sender_id === currentUserId && m.receiver_id === person.id))
        .sort((a, b) => a.created_at.localeCompare(b.created_at));
      return {
        person,
        thread,
        last: thread[thread.length - 1],
        unread: thread.filter(m => m.receiver_id === currentUserId && !m.is_read).length
      };
    }).sort((a, b) => (b.last?.created_at || '').localeCompare(a.last?.created_at || '') || a.person.name.localeCompare(b.person.name));
  }, [contacts, messages, currentUserId]);

  const visiblePeople = people.filter(p => p.person.name.toLowerCase().includes(query.trim().toLowerCase()));
  const selected = people.find(p => p.person.id === selectedId) || people[0];

  // Follow ?with= when a notification opens a conversation.
  useEffect(() => {
    const withId = searchParams.get('with');
    if (withId) {
      setSelectedId(withId);
      setMobileThreadOpen(true);
    }
  }, [searchParams]);

  // Reading a conversation marks what came in as read.
  useEffect(() => {
    if (!selected || selected.unread === 0) return;
    new Set(selected.thread.filter(m => m.receiver_id === currentUserId && !m.is_read).map(m => m.conversation_id))
      .forEach(conversationId => onMarkRead(conversationId, { id: selected.person.id, name: selected.person.name }));
  }, [selected?.person.id, selected?.unread]);

  useEffect(() => {
    threadEndRef.current?.scrollIntoView({ block: 'end' });
  }, [selected?.person.id, selected?.thread.length]);

  const choose = (id: string) => {
    setSelectedId(id);
    setMobileThreadOpen(true);
    setSendError('');
    if (searchParams.get('with')) {
      searchParams.delete('with');
      setSearchParams(searchParams, { replace: true });
    }
  };

  const submit = async (text = draft) => {
    const content = text.trim();
    if (!content || !selected || sending) return;
    setSending(true);
    setSendError('');
    try {
      await onSend(selected.person.id, content);
      setDraft('');
      composerRef.current?.focus();
    } catch (err: any) {
      setSendError(err.message || 'Your message didn’t send. Please try again.');
    } finally {
      setSending(false);
    }
  };

  if (people.length === 0) {
    return (
      <div className="dash-card flex min-h-[24rem] flex-col items-center justify-center p-10 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-forest-50 text-forest-700" aria-hidden="true">
          <MessageSquare className="h-6 w-6" />
        </span>
        <h2 className="mt-5 text-xl font-bold text-ink-900">{emptyTitle}</h2>
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-ink-600">{emptyDescription}</p>
        {emptyAction && <div className="mt-6">{emptyAction}</div>}
      </div>
    );
  }

  // Messages grouped under a day heading.
  const groups: Array<{ day: string; items: Message[] }> = [];
  selected?.thread.forEach(m => {
    const day = dayLabel(m.created_at);
    if (groups[groups.length - 1]?.day !== day) groups.push({ day, items: [] });
    groups[groups.length - 1].items.push(m);
  });
  const firstName = selected?.person.name.split(' ')[0] || '';

  return (
    <div className="dash-card grid h-[min(46rem,calc(100vh-12rem))] min-h-[32rem] overflow-hidden md:grid-cols-[18rem_minmax(0,1fr)] lg:grid-cols-[20rem_minmax(0,1fr)]">
      {/* People */}
      <aside className={cn('flex min-h-0 flex-col border-[#ECEEF3] bg-white md:border-r', mobileThreadOpen && 'hidden md:flex')} aria-label="Conversations">
        <div className="border-b border-[#ECEEF3] p-4">
          <p className="mb-3 text-lg font-bold text-ink-900">All messages</p>
          <label htmlFor="chat-search" className="sr-only">Search conversations</label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" aria-hidden="true" />
            <input
              id="chat-search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search people"
              className="w-full rounded-pill border border-[#E3E5EC] bg-[#F5F6FA] py-2.5 pl-9 pr-3 text-sm text-ink-900 placeholder:text-ink-400 focus:border-forest-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-forest-100"
            />
          </div>
        </div>
        <ul className="min-h-0 flex-1 overflow-y-auto p-2">
          {visiblePeople.map(({ person, last, unread }) => {
            const active = selected?.person.id === person.id;
            return (
              <li key={person.id}>
                <button
                  type="button"
                  onClick={() => choose(person.id)}
                  aria-current={active ? 'true' : undefined}
                  className={cn('flex w-full items-center gap-3 rounded-[18px] px-3 py-3 text-left transition', active ? 'bg-[#F5F6FA]' : 'hover:bg-[#F8F9FB]')}
                >
                  <Avatar src={person.avatar_url} name={person.name} className="h-11 w-11 rounded-full" />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-baseline justify-between gap-2">
                      <span className={cn('truncate text-sm text-ink-900', unread > 0 ? 'font-bold' : 'font-semibold')}>{person.name}</span>
                      {last && <span className="shrink-0 text-[12px] text-ink-500">{shortWhen(last.created_at)}</span>}
                    </span>
                    <span className="mt-0.5 flex items-center justify-between gap-2">
                      <span className={cn('truncate text-xs', unread > 0 ? 'font-semibold text-ink-800' : 'text-ink-500')}>
                        {last ? `${last.sender_id === currentUserId ? 'You: ' : ''}${last.content}` : person.subtitle || 'Start a conversation'}
                      </span>
                      {unread > 0 && <span className="grid h-5 min-w-5 shrink-0 place-items-center rounded-pill bg-forest-500 px-1.5 text-[11px] font-bold text-white">{unread}</span>}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
          {visiblePeople.length === 0 && <li className="px-3 py-6 text-center text-sm text-ink-500">Nobody matches “{query}”.</li>}
        </ul>
      </aside>

      {/* Conversation */}
      {selected && (
        <section className={cn('flex min-h-0 flex-col bg-white', !mobileThreadOpen && 'hidden md:flex')} aria-label={`Conversation with ${selected.person.name}`}>
          <header className="flex items-center gap-3 border-b border-[#ECEEF3] bg-white px-4 py-3">
            <button type="button" onClick={() => setMobileThreadOpen(false)} className="-ml-1 rounded-full p-2.5 text-ink-600 hover:bg-[#EEF0F5] md:hidden" aria-label="Back to conversations">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <Avatar src={selected.person.avatar_url} name={selected.person.name} className="h-10 w-10 rounded-full" />
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-ink-900">{selected.person.name}</p>
              {selected.person.subtitle && <p className="truncate text-xs text-ink-500">{selected.person.subtitle}</p>}
            </div>
            {selected.person.phone && whatsappNumber(selected.person.phone) && (
              <a
                href={`https://wa.me/${whatsappNumber(selected.person.phone)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[40px] items-center gap-1.5 rounded-pill border border-[#E3E5EC] bg-white px-3.5 text-xs font-semibold text-ink-700 hover:bg-[#F5F6FA]"
              >
                <MessageCircle className="h-4 w-4 text-forest-700" aria-hidden="true" />
                <span className="hidden sm:inline">WhatsApp</span>
              </a>
            )}
          </header>

          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6" aria-live="polite">
            {groups.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <Avatar src={selected.person.avatar_url} name={selected.person.name} className="h-16 w-16 rounded-full" />
                <p className="mt-4 font-semibold text-ink-900">Say hello to {firstName}</p>
                <p className="mt-1 max-w-xs text-sm text-ink-500">Agree on the time, what to bring, or anything else before your session.</p>
                {suggestions.length > 0 && (
                  <div className="mt-5 flex max-w-md flex-wrap justify-center gap-2">
                    {suggestions.map(text => (
                      <button key={text} type="button" onClick={() => submit(text)} className="rounded-pill border border-[#E3E5EC] bg-white px-3.5 py-2 text-xs font-medium text-ink-700 hover:border-forest-300 hover:text-forest-800">
                        {text}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-5">
                {groups.map(group => (
                  <div key={group.day} className="space-y-2">
                    <p className="text-center"><span className="rounded-pill bg-white px-3 py-1 text-[12px] font-medium text-ink-500 shadow-soft">{group.day}</span></p>
                    {group.items.map((m, index) => {
                      const mine = m.sender_id === currentUserId;
                      const nextFromSame = group.items[index + 1]?.sender_id === m.sender_id;
                      return (
                        <div key={m.id} className={cn('flex flex-col', mine ? 'items-end' : 'items-start')}>
                          <p className={cn(
                            'max-w-[85%] whitespace-pre-wrap break-words rounded-2xl px-4 py-2.5 text-sm leading-relaxed sm:max-w-[70%]',
                            mine ? 'bg-forest-500 text-white' : 'bg-[#F1F3F8] text-ink-800',
                            mine && !nextFromSame && 'rounded-br-md',
                            !mine && !nextFromSame && 'rounded-bl-md'
                          )}>
                            {m.content}
                          </p>
                          {!nextFromSame && (
                            <span className="mt-1 px-1 text-[12px] text-ink-400">
                              {timeOf(m.created_at)}{mine && m.is_read ? ' · Seen' : ''}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
                <div ref={threadEndRef} />
              </div>
            )}
          </div>

          <form onSubmit={(e) => { e.preventDefault(); submit(); }} className="border-t border-[#ECEEF3] bg-white p-3 sm:p-4">
            {sendError && <p className="mb-2 text-xs font-medium text-rose-700" role="alert">{sendError}</p>}
            <div className="flex items-end gap-2">
              <label htmlFor="chat-composer" className="sr-only">Message {selected.person.name}</label>
              <textarea
                id="chat-composer"
                ref={composerRef}
                rows={1}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(); } }}
                placeholder={`Message ${firstName}…`}
                className="max-h-32 min-h-[48px] flex-1 resize-none rounded-3xl border border-[#E3E5EC] bg-[#F5F6FA] px-4 py-3 text-base text-ink-900 placeholder:text-ink-400 focus:border-forest-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-forest-100 sm:text-sm"
              />
              <button
                type="submit"
                disabled={!draft.trim() || sending}
                aria-label="Send message"
                className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-forest-500 text-white transition hover:bg-forest-500 disabled:cursor-not-allowed disabled:bg-[#E8EAF0] disabled:text-ink-400"
              >
                <Send className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
            <p className="mt-1.5 hidden px-2 text-[12px] text-ink-400 sm:block">Enter to send · Shift + Enter for a new line</p>
          </form>
        </section>
      )}
    </div>
  );
};

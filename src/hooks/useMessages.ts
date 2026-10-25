import { useCallback, useEffect, useState } from 'react';
import { Message } from '../types';
import { api } from '../services/api';
import { useAutoRefresh } from './useAutoRefresh';
import { useAuth } from '../context/AuthContext';

/**
 * The signed-in user's messages, kept fresh in the background. Polls faster while the inbox is
 * open (`inboxOpen`) so a conversation reads like a chat.
 */
export function useMessages(userId: string | undefined, inboxOpen = false) {
  const [messages, setMessages] = useState<Message[]>([]);
  const { notifications, markNotificationAsRead } = useAuth();

  const reload = useCallback(async () => {
    if (!userId) return;
    try {
      setMessages(await api.getMessages(userId));
    } catch (err) {
      console.error('Could not load messages:', err);
    }
  }, [userId]);

  useEffect(() => {
    reload();
  }, [reload]);

  useAutoRefresh(reload, inboxOpen ? 8000 : 30000, !!userId);

  // While the inbox is open, a "New message" notification whose messages are already read is stale.
  useEffect(() => {
    if (!inboxOpen) return;
    notifications.filter(n => !n.is_read && n.link?.includes('/messages?with=')).forEach(n => {
      const senderId = new URLSearchParams(n.link!.split('?')[1]).get('with');
      if (senderId && messages.some(m => m.sender_id === senderId) && !messages.some(m => m.sender_id === senderId && m.receiver_id === userId && !m.is_read)) {
        markNotificationAsRead(n.id);
      }
    });
  }, [notifications, messages, inboxOpen]);

  const send = async (receiverId: string, content: string) => {
    if (!userId) throw new Error('Not signed in');
    const sent = await api.sendMessage(userId, receiverId, content);
    setMessages(prev => [...prev, sent]);
    return sent;
  };

  /** Marks a conversation read, and clears the bell's "New message from …" notifications for it. */
  const markConversationRead = async (conversationId: string, other?: { id: string; name: string }) => {
    if (other) {
      notifications
        .filter(n => !n.is_read && (n.link?.includes(`with=${other.id}`) || n.title === `New message from ${other.name}`))
        .forEach(n => markNotificationAsRead(n.id));
    }
    setMessages(prev => prev.map(m =>
      m.conversation_id === conversationId && m.receiver_id === userId ? { ...m, is_read: true } : m
    ));
    try {
      await api.markConversationRead(conversationId);
    } catch (err) {
      console.error('Could not mark the conversation read:', err);
    }
  };

  const unreadCount = messages.filter(m => m.receiver_id === userId && !m.is_read).length;

  return { messages, send, markConversationRead, unreadCount, reload };
}

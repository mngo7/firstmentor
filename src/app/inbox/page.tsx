'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';

interface ThreadSummary {
  threadId: string;
  subject: string;
  otherParty: string;
  lastMessage: { body: string; createdAt: string; fromMe: boolean };
  messageCount: number;
  startedByMe: boolean;
}

interface ThreadMessage {
  id: string;
  createdAt: string;
  fromMe: boolean;
  fromName: string;
  body: string;
  kind: string;
  via: 'site' | 'email';
}

interface Thread {
  subject: string;
  otherParty: string;
  messages: ThreadMessage[];
  localTesting: boolean;
}

type Filter = 'all' | 'received' | 'sent';

function formatDate(iso: string) {
  const d = new Date(iso);
  const sameDay = d.toDateString() === new Date().toDateString();
  return sameDay ? d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

const kindLabel: Record<string, string> = {
  'connect-mentor': 'Offering mentorship',
  'connect-mentee': 'Looking for a mentor',
};

export default function InboxPage() {
  const [authState, setAuthState] = useState<'loading' | 'signed-out' | 'signed-in'>('loading');
  const [threads, setThreads] = useState<ThreadSummary[]>([]);
  const [filter, setFilter] = useState<Filter>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [thread, setThread] = useState<Thread | null>(null);
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [simulated, setSimulated] = useState('');

  const loadThreads = useCallback(async () => {
    const res = await fetch('/api/inbox', { cache: 'no-store' });
    if (res.status === 401) {
      setAuthState('signed-out');
      return;
    }
    setAuthState('signed-in');
    if (res.ok) setThreads((await res.json()).threads);
  }, []);

  const loadThread = useCallback(async (id: string) => {
    const res = await fetch(`/api/inbox/${encodeURIComponent(id)}`, { cache: 'no-store' });
    setThread(res.ok ? await res.json() : null);
  }, []);

  useEffect(() => {
    const fromUrl = new URLSearchParams(window.location.search).get('thread');
    if (fromUrl) setSelectedId(fromUrl);
    loadThreads();
  }, [loadThreads]);

  useEffect(() => {
    if (!selectedId) return;
    setThread(null);
    setError('');
    loadThread(selectedId);
    window.history.replaceState(null, '', `/inbox?thread=${encodeURIComponent(selectedId)}`);
  }, [selectedId, loadThread]);

  async function sendReply() {
    if (!selectedId || !reply.trim()) return;
    setSending(true);
    setError('');
    try {
      const res = await fetch(`/api/inbox/${encodeURIComponent(selectedId)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: reply }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send reply');
      setReply('');
      await Promise.all([loadThread(selectedId), loadThreads()]);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to send reply');
    } finally {
      setSending(false);
    }
  }

  async function simulateReply() {
    if (!selectedId) return;
    setSending(true);
    try {
      await fetch(`/api/inbox/${encodeURIComponent(selectedId)}/simulate-reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: simulated || 'Thanks for reaching out! We would love some help.' }),
      });
      setSimulated('');
      await Promise.all([loadThread(selectedId), loadThreads()]);
    } finally {
      setSending(false);
    }
  }

  if (authState === 'loading') {
    return <div className="min-h-screen flex items-center justify-center text-gray-500">Loading...</div>;
  }

  if (authState === 'signed-out') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-lg shadow p-8 max-w-md text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Inbox</h1>
          <p className="text-gray-600 mb-6">Sign in to see your messages.</p>
          <Link href="/signin" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Sign In</Link>
        </div>
      </div>
    );
  }

  const shown = threads.filter(t => filter === 'all' || (filter === 'sent' ? t.startedByMe : !t.startedByMe));

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Inbox</h1>
            <p className="text-gray-600 mt-1">Messages you&apos;ve sent and received, including replies people sent by email.</p>
          </div>
          <Link href="/messages" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium whitespace-nowrap">
            Message Teams
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Conversation list */}
          <aside className="bg-white rounded-lg shadow overflow-hidden md:col-span-1">
            <div className="flex border-b border-gray-200 text-sm">
              {(['all', 'received', 'sent'] as Filter[]).map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`flex-1 py-2 capitalize ${filter === f ? 'text-blue-600 border-b-2 border-blue-600 font-medium' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  {f}
                </button>
              ))}
            </div>
            <ul className="divide-y divide-gray-100 max-h-[70vh] overflow-y-auto">
              {shown.map(t => (
                <li key={t.threadId}>
                  <button
                    onClick={() => setSelectedId(t.threadId)}
                    className={`w-full text-left px-4 py-3 hover:bg-gray-50 ${selectedId === t.threadId ? 'bg-blue-50' : ''}`}
                  >
                    <div className="flex justify-between gap-2">
                      <span className="font-medium text-gray-900 truncate">{t.otherParty}</span>
                      <span className="text-xs text-gray-400 whitespace-nowrap">{formatDate(t.lastMessage.createdAt)}</span>
                    </div>
                    <p className="text-sm text-gray-700 truncate">{t.subject}</p>
                    <p className="text-xs text-gray-500 truncate">
                      {t.lastMessage.fromMe ? 'You: ' : ''}{t.lastMessage.body}
                    </p>
                    {t.messageCount > 1 && <span className="text-xs text-gray-400">{t.messageCount} messages</span>}
                  </button>
                </li>
              ))}
              {shown.length === 0 && (
                <li className="px-4 py-8 text-center text-sm text-gray-500">
                  No messages yet. Find someone in <Link href="/mentor-match" className="text-blue-600">Mentor Search</Link> and click Connect,
                  or use <Link href="/messages" className="text-blue-600">Message Teams</Link>.
                </li>
              )}
            </ul>
          </aside>

          {/* Conversation */}
          <section className="bg-white rounded-lg shadow md:col-span-2 flex flex-col min-h-[50vh]">
            {!selectedId && <div className="m-auto text-gray-400 text-sm">Select a conversation</div>}
            {selectedId && !thread && <div className="m-auto text-gray-400 text-sm">Loading...</div>}
            {thread && (
              <>
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">{thread.subject}</h2>
                  <p className="text-sm text-gray-500">with {thread.otherParty}</p>
                </div>
                <div className="flex-1 px-6 py-4 space-y-4 overflow-y-auto max-h-[55vh]">
                  {thread.messages.map(m => (
                    <div key={m.id} className={`flex ${m.fromMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] rounded-lg px-4 py-3 ${m.fromMe ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-900'}`}>
                        <div className={`text-xs mb-1 ${m.fromMe ? 'text-blue-100' : 'text-gray-500'}`}>
                          {m.fromMe ? 'You' : m.fromName} · {new Date(m.createdAt).toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                          {m.via === 'email' && ' · replied by email'}
                          {kindLabel[m.kind] && ` · ${kindLabel[m.kind]}`}
                        </div>
                        <p className="whitespace-pre-wrap text-sm">{m.body}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-t border-gray-200 p-4 space-y-2">
                  <textarea
                    rows={3}
                    value={reply}
                    onChange={e => setReply(e.target.value)}
                    placeholder={`Reply to ${thread.otherParty}...`}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {error && <p className="text-sm text-red-600">{error}</p>}
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-gray-500">They&apos;ll get your reply by email. Their replies come to your email and here.</p>
                    <button
                      onClick={sendReply}
                      disabled={sending || !reply.trim()}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:bg-gray-300"
                    >
                      {sending ? 'Sending...' : 'Send reply'}
                    </button>
                  </div>

                  {thread.localTesting && (
                    <div className="mt-3 p-3 border border-dashed border-amber-400 bg-amber-50 rounded-lg space-y-2">
                      <p className="text-xs text-amber-800">
                        <strong>Local testing only:</strong> pretend {thread.otherParty} replied from their email app.
                      </p>
                      <div className="flex gap-2">
                        <input
                          value={simulated}
                          onChange={e => setSimulated(e.target.value)}
                          placeholder="Their reply..."
                          className="flex-1 px-3 py-1.5 border border-amber-300 rounded text-sm"
                        />
                        <button onClick={simulateReply} disabled={sending} className="px-3 py-1.5 bg-amber-500 text-white rounded text-sm hover:bg-amber-600 disabled:bg-gray-300">
                          Simulate email reply
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

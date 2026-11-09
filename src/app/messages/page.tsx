'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import SearchableSelect from '@/components/SearchableSelect';

const PROGRAMS = ['FLL Explore', 'FLL Challenge', 'FTC', 'FRC'];
const MAX_SUBJECT = 150;
const MAX_MESSAGE = 5000;

interface PreviewTeam {
  id: string;
  name: string;
  teamNumber: string;
  teamName: string;
  program: string;
  state: string;
  country: string;
  isListedTeam: boolean;
}

interface Preview {
  recipientCount: number;
  teamCount: number;
  remainingToday: number;
  dailyLimit: number;
  sample: PreviewTeam[];
}

function CheckboxGroup({ options, selected, onChange }: { options: { id: string; name: string }[]; selected: string[]; onChange: (v: string[]) => void }) {
  return (
    <div className="flex flex-wrap gap-x-5 gap-y-2">
      {options.map(o => (
        <label key={o.id} className="inline-flex items-center text-sm text-gray-700">
          <input
            type="checkbox"
            className="h-4 w-4 text-blue-600 rounded"
            checked={selected.includes(o.id)}
            onChange={() => onChange(selected.includes(o.id) ? selected.filter(v => v !== o.id) : [...selected, o.id])}
          />
          <span className="ml-2">{o.name}</span>
        </label>
      ))}
    </div>
  );
}

export default function MessagesPage() {
  const [authState, setAuthState] = useState<'loading' | 'signed-out' | 'signed-in'>('loading');
  const [locations, setLocations] = useState<{ countries: string[]; statesByCountry: Record<string, string[]> }>({ countries: [], statesByCountry: {} });

  const [programs, setPrograms] = useState<string[]>([]);
  const [countries, setCountries] = useState<string[]>([]);
  const [states, setStates] = useState<string[]>([]);
  const [teamNumbersText, setTeamNumbersText] = useState('');

  const [preview, setPreview] = useState<Preview | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetch('/api/auth/me').then(res => setAuthState(res.ok ? 'signed-in' : 'signed-out')).catch(() => setAuthState('signed-out'));
    // Build the country/state lists from the profiles that exist
    fetch('/api/profiles')
      .then(res => (res.ok ? res.json() : []))
      .then((profiles: { country: string; state: string }[]) => {
        const statesByCountry: Record<string, Set<string>> = {};
        for (const p of profiles) {
          if (!p.country) continue;
          statesByCountry[p.country] = statesByCountry[p.country] || new Set();
          if (p.state && p.state !== p.country) statesByCountry[p.country].add(p.state);
        }
        setLocations({
          countries: Object.keys(statesByCountry).sort(),
          statesByCountry: Object.fromEntries(Object.entries(statesByCountry).map(([c, s]) => [c, Array.from(s).sort()])),
        });
      })
      .catch(() => {});
  }, []);

  const stateOptions = useMemo(() => {
    const source = countries.length ? countries : locations.countries;
    return Array.from(new Set(source.flatMap(c => locations.statesByCountry[c] || []))).sort();
  }, [countries, locations]);

  // Drop selected states that no longer fit the chosen countries
  useEffect(() => {
    setStates(prev => prev.filter(s => stateOptions.includes(s)));
  }, [stateOptions]);

  // For now messages always go to listed teams
  const filters = useMemo(() => ({
    audience: 'listed',
    programs,
    countries,
    states,
    memberRoles: [],
    teamNumbers: teamNumbersText.split(/[\s,]+/).map(t => t.replace(/^#/, '').trim()).filter(Boolean),
  }), [programs, countries, states, teamNumbersText]);

  useEffect(() => {
    if (authState !== 'signed-in') return;
    setPreviewLoading(true);
    const timer = setTimeout(() => {
      fetch('/api/messages/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(filters),
      })
        .then(res => (res.ok ? res.json() : null))
        .then(data => setPreview(data))
        .finally(() => setPreviewLoading(false));
    }, 400);
    return () => clearTimeout(timer);
  }, [filters, authState]);

  const overLimit = !!preview && preview.recipientCount > preview.remainingToday;
  const canSend = !!preview && preview.recipientCount > 0 && !overLimit && subject.trim() && message.trim() && !sending && !previewLoading;

  async function handleSend() {
    if (!preview || !canSend) return;
    const ok = window.confirm(`Send "${subject.trim()}" to ${preview.recipientCount} recipient${preview.recipientCount === 1 ? '' : 's'}? This can't be undone.`);
    if (!ok) return;

    setSending(true);
    setResult(null);
    try {
      const res = await fetch('/api/messages/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filters, subject, message }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send message');
      setResult({
        type: data.failed ? 'error' : 'success',
        text: data.failed
          ? `Sent to ${data.sent} recipients. ${data.failed} failed: ${data.failedNames.join(', ')}`
          : `Sent to ${data.sent} recipient${data.sent === 1 ? '' : 's'}. Replies will go to your email and your inbox.`,
      });
      if (!data.failed) {
        setSubject('');
        setMessage('');
      }
      // Refresh the remaining count
      fetch('/api/messages/preview', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(filters) })
        .then(r => (r.ok ? r.json() : null))
        .then(setPreview);
    } catch (error) {
      setResult({ type: 'error', text: error instanceof Error ? error.message : 'Failed to send message' });
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
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Message Teams</h1>
          <p className="text-gray-600 mb-6">Sign in to send messages to teams on First Mentor.</p>
          <div className="flex gap-3 justify-center">
            <Link href="/signin" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Sign In</Link>
            <Link href="/signup" className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Sign Up</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900">Message Teams</h1>
        <p className="text-gray-600 mt-1 mb-8">
          Send one message to many listed teams at once. Teams see your name and team. Replies go to your email and your inbox.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Filters */}
          <section className="lg:col-span-2 bg-white rounded-lg shadow p-6 space-y-6">
            <h2 className="text-lg font-semibold text-gray-900">1. Choose teams</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Program</label>
              <CheckboxGroup options={PROGRAMS.map(p => ({ id: p, name: p }))} selected={programs} onChange={setPrograms} />
              <p className="mt-1 text-xs text-gray-500">{programs.length === 0 ? 'All programs' : ''}</p>
            </div>

            <SearchableSelect multiple label="Country" options={locations.countries} value={countries} onChange={setCountries} placeholder="All countries" />
            <SearchableSelect multiple label="State / province" options={stateOptions} value={states} onChange={setStates} placeholder="All states" emptyText="No states for the selected countries" />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Specific team numbers (optional)</label>
              <input
                type="text"
                value={teamNumbersText}
                onChange={e => setTeamNumbersText(e.target.value)}
                placeholder="e.g. 254, 1678, 16461"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </section>

          {/* Preview + message */}
          <div className="lg:col-span-3 space-y-6">
            <section className="bg-white rounded-lg shadow p-6">
              <div className="flex items-baseline justify-between">
                <h2 className="text-lg font-semibold text-gray-900">2. Recipients</h2>
                {previewLoading && <span className="text-xs text-gray-400">Updating...</span>}
              </div>
              {preview && (
                <>
                  <p className="mt-2 text-gray-700">
                    <span className="text-2xl font-bold text-gray-900">{preview.recipientCount.toLocaleString()}</span> recipient{preview.recipientCount === 1 ? '' : 's'}
                    {preview.teamCount !== preview.recipientCount && (
                      <span className="text-sm text-gray-500"> ({preview.teamCount.toLocaleString()} listings; some contacts manage several teams and get one email)</span>
                    )}
                  </p>
                  <p className={`text-sm mt-1 ${overLimit ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
                    You can send to {preview.remainingToday.toLocaleString()} more recipient{preview.remainingToday === 1 ? '' : 's'} today (limit {preview.dailyLimit} per day).
                    {overLimit && ' Narrow your filters to send.'}
                  </p>
                  <div className="mt-4 max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 text-gray-600 text-left sticky top-0">
                        <tr>
                          <th className="px-3 py-2 font-medium">Team</th>
                          <th className="px-3 py-2 font-medium">Program</th>
                          <th className="px-3 py-2 font-medium">Location</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {preview.sample.map((t, i) => (
                          <tr key={`${t.id}-${i}`}>
                            <td className="px-3 py-1.5 text-gray-900">
                              {t.teamNumber ? `#${t.teamNumber} ` : ''}{t.teamName || t.name}
                            </td>
                            <td className="px-3 py-1.5 text-gray-600">{t.program}</td>
                            <td className="px-3 py-1.5 text-gray-600">{[t.state !== t.country ? t.state : '', t.country].filter(Boolean).join(', ')}</td>
                          </tr>
                        ))}
                        {preview.sample.length === 0 && (
                          <tr><td colSpan={3} className="px-3 py-4 text-center text-gray-400">No one matches these filters</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                  {preview.teamCount > preview.sample.length && (
                    <p className="text-xs text-gray-500 mt-1">Showing the first {preview.sample.length} of {preview.teamCount.toLocaleString()}.</p>
                  )}
                </>
              )}
            </section>

            <section className="bg-white rounded-lg shadow p-6 space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">3. Write your message</h2>
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <input
                  id="subject"
                  type="text"
                  maxLength={MAX_SUBJECT}
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  placeholder="e.g. Free CAD workshop for FTC teams in Washington"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea
                  id="message"
                  rows={10}
                  maxLength={MAX_MESSAGE}
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="Introduce yourself and say what you're offering or looking for."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 text-right">{message.length}/{MAX_MESSAGE}</p>
              </div>
              <p className="text-xs text-gray-500">
                Each email greets the team and includes your name and team, plus a link for the team to join First Mentor. Replies go to your email and to your First Mentor inbox.
              </p>

              {result && (
                <div className={`p-3 rounded-lg text-sm ${result.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                  {result.text}
                </div>
              )}

              <button
                type="button"
                onClick={handleSend}
                disabled={!canSend}
                className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {sending ? 'Sending...' : preview ? `Send to ${preview.recipientCount.toLocaleString()} recipient${preview.recipientCount === 1 ? '' : 's'}` : 'Send'}
              </button>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

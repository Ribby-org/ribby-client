import { useState, FormEvent } from 'react';
import { X, Loader2 } from 'lucide-react';
import type { BugReportDraft, BugSeverity, BugStatus } from '../../hooks/useBugReports';

const SEVERITIES: BugSeverity[] = ['critical', 'high', 'medium', 'low', 'info'];
const STATUSES: { value: BugStatus; label: string }[] = [
  { value: 'open',        label: 'Open' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'fixed',       label: 'Fixed' },
  { value: 'closed',      label: 'Closed' },
  { value: 'wont_fix',    label: "Won't Fix" },
];

interface BugModalProps {
  initial: BugReportDraft;
  onSave: (draft: BugReportDraft) => Promise<void>;
  onClose: () => void;
  saving: boolean;
}

export default function BugModal({ initial, onSave, onClose, saving }: BugModalProps) {
  const [form, setForm] = useState<BugReportDraft>(initial);
  const set = (k: keyof BugReportDraft, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handle = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    await onSave(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-black/30 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl my-8">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">Bug Report</h2>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handle} className="p-6 space-y-5">
          {/* Title */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.title}
              onChange={e => set('title', e.target.value)}
              placeholder="Short description of the bug"
              className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          {/* URL */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">URL</label>
            <input
              type="text"
              value={form.url}
              onChange={e => set('url', e.target.value)}
              placeholder="https://example.com/page"
              className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          {/* Severity + Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Severity</label>
              <select
                value={form.severity}
                onChange={e => set('severity', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
              >
                {SEVERITIES.map(s => (
                  <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Status</label>
              <select
                value={form.status}
                onChange={e => set('status', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
              >
                {STATUSES.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Description</label>
            <textarea
              value={form.description}
              onChange={e => set('description', e.target.value)}
              rows={3}
              placeholder="What went wrong?"
              className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
            />
          </div>

          {/* Steps to reproduce */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Steps to Reproduce</label>
            <textarea
              value={form.steps}
              onChange={e => set('steps', e.target.value)}
              rows={3}
              placeholder={"1. Go to...\n2. Click on...\n3. See error"}
              className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none font-mono"
            />
          </div>

          {/* Expected / Actual */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Expected Behaviour</label>
              <textarea
                value={form.expected}
                onChange={e => set('expected', e.target.value)}
                rows={3}
                placeholder="What should happen?"
                className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Actual Behaviour</label>
              <textarea
                value={form.actual}
                onChange={e => set('actual', e.target.value)}
                rows={3}
                placeholder="What actually happens?"
                className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
            <button type="button" onClick={onClose} className="btn-ghost">Cancel</button>
            <button type="submit" disabled={!form.title.trim() || saving} className="btn-primary disabled:opacity-50">
              {saving ? <><Loader2 size={13} className="animate-spin" />Saving…</> : 'Save Bug Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

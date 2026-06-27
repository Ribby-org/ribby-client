import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Bug, Plus, Trash2, ChevronDown, ChevronUp, Pencil } from 'lucide-react';
import { useBugReports, type BugReport, type BugReportDraft, type BugSeverity, type BugStatus } from '../hooks/useBugReports';
import BugModal from '../components/bugs/BugModal';

// ── Constants ─────────────────────────────────────────────────────────────────

const SEVERITIES: BugSeverity[] = ['critical', 'high', 'medium', 'low', 'info'];
const STATUSES: { value: BugStatus; label: string }[] = [
  { value: 'open',        label: 'Open' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'fixed',       label: 'Fixed' },
  { value: 'closed',      label: 'Closed' },
  { value: 'wont_fix',    label: "Won't Fix" },
];

const SEV_BADGE: Record<BugSeverity, string> = {
  critical: 'bg-red-50 text-red-600 ring-1 ring-red-200',
  high:     'bg-orange-50 text-orange-600 ring-1 ring-orange-200',
  medium:   'bg-amber-50 text-amber-600 ring-1 ring-amber-200',
  low:      'bg-green-50 text-green-600 ring-1 ring-green-200',
  info:     'bg-blue-50 text-blue-600 ring-1 ring-blue-200',
};

const STATUS_BADGE: Record<BugStatus, string> = {
  open:        'bg-red-50 text-red-600',
  in_progress: 'bg-amber-50 text-amber-600',
  fixed:       'bg-green-50 text-green-600',
  closed:      'bg-gray-100 text-gray-500',
  wont_fix:    'bg-slate-100 text-slate-500',
};

const STATUS_DOT: Record<BugStatus, string> = {
  open:        'bg-red-500',
  in_progress: 'bg-amber-400',
  fixed:       'bg-green-500',
  closed:      'bg-gray-400',
  wont_fix:    'bg-slate-400',
};

const EMPTY_DRAFT: BugReportDraft = {
  title: '', url: '', severity: 'medium', status: 'open',
  description: '', steps: '', expected: '', actual: '', category: '',
};

// ── Bug card ──────────────────────────────────────────────────────────────────

function BugCard({ bug, onEdit, onDelete, onStatusChange }: {
  bug: BugReport;
  onEdit: (bug: BugReport) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: BugStatus) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="card overflow-hidden">
      <div className="px-4 py-3.5">
        <div className="flex items-start gap-3">
          <span className={`w-2 h-2 rounded-full flex-shrink-0 mt-1.5 ${STATUS_DOT[bug.status]}`} />

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className={`text-xs font-medium px-2 py-0.5 rounded-md ${SEV_BADGE[bug.severity]}`}>
                {bug.severity}
              </span>
              <select
                value={bug.status}
                onChange={e => onStatusChange(bug.id, e.target.value as BugStatus)}
                onClick={e => e.stopPropagation()}
                className={`text-xs font-medium px-2 py-0.5 rounded-md border-0 cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-300 ${STATUS_BADGE[bug.status]}`}
              >
                {STATUSES.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
              {bug.category && (
                <span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">{bug.category}</span>
              )}
            </div>

            <p className="text-sm font-medium text-gray-800 leading-snug">{bug.title}</p>
            {bug.url && (
              <p className="text-[11px] text-gray-400 font-mono mt-0.5 truncate">{bug.url}</p>
            )}
            <p className="text-[11px] text-gray-300 mt-1">
              {new Date(bug.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
            </p>
          </div>

          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              onClick={() => setExpanded(e => !e)}
              className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
            >
              {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
            <button
              onClick={() => onEdit(bug)}
              className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
            >
              <Pencil size={13} />
            </button>
            <button
              onClick={() => onDelete(bug.id)}
              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-gray-100 px-4 py-4 space-y-4 bg-gray-50/50">
          {bug.description && (
            <div>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Description</p>
              <p className="text-xs text-gray-600 leading-relaxed">{bug.description}</p>
            </div>
          )}
          {bug.steps && (
            <div>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Steps to Reproduce</p>
              <pre className="text-xs text-gray-600 leading-relaxed whitespace-pre-wrap font-mono">{bug.steps}</pre>
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {bug.expected && (
              <div className="bg-green-50 border border-green-100 rounded-lg px-3 py-2.5">
                <p className="text-[10px] font-semibold text-green-700 uppercase tracking-wide mb-1">Expected</p>
                <p className="text-xs text-gray-600 leading-relaxed">{bug.expected}</p>
              </div>
            )}
            {bug.actual && (
              <div className="bg-red-50 border border-red-100 rounded-lg px-3 py-2.5">
                <p className="text-[10px] font-semibold text-red-700 uppercase tracking-wide mb-1">Actual</p>
                <p className="text-xs text-gray-600 leading-relaxed">{bug.actual}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export type { BugReportDraft };

export default function BugReportsPage() {
  const { orgId } = useParams<{ orgId: string }>();
  const { bugs, loading, fetchBugs, createBug, updateBug, deleteBug } = useBugReports(orgId);

  const [statusFilter, setStatusFilter] = useState<BugStatus | 'all'>('all');
  const [modal, setModal] = useState<{ open: boolean; editing: BugReport | null; initial: BugReportDraft }>({
    open: false, editing: null, initial: EMPTY_DRAFT
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchBugs(); }, [fetchBugs]);

  const openCreate = (prefill?: Partial<BugReportDraft>) =>
    setModal({ open: true, editing: null, initial: { ...EMPTY_DRAFT, ...prefill } });

  const openEdit = (bug: BugReport) =>
    setModal({
      open: true, editing: bug,
      initial: {
        title: bug.title, url: bug.url ?? '', severity: bug.severity,
        status: bug.status, description: bug.description ?? '',
        steps: bug.steps ?? '', expected: bug.expected ?? '',
        actual: bug.actual ?? '', category: bug.category ?? '',
      }
    });

  const handleSave = async (draft: BugReportDraft) => {
    setSaving(true);
    if (modal.editing) {
      await updateBug(modal.editing.id, draft);
    } else {
      await createBug(draft);
    }
    setSaving(false);
    setModal(m => ({ ...m, open: false }));
  };

  const handleStatusChange = async (id: string, status: BugStatus) => {
    await updateBug(id, { status });
  };

  const STATUS_TABS: { value: BugStatus | 'all'; label: string }[] = [
    { value: 'all',        label: 'All' },
    { value: 'open',       label: 'Open' },
    { value: 'in_progress',label: 'In Progress' },
    { value: 'fixed',      label: 'Fixed' },
    { value: 'closed',     label: 'Closed' },
    { value: 'wont_fix',   label: "Won't Fix" },
  ];

  const filtered = statusFilter === 'all' ? bugs : bugs.filter(b => b.status === statusFilter);

  const counts: Record<string, number> = { all: bugs.length };
  bugs.forEach(b => { counts[b.status] = (counts[b.status] ?? 0) + 1; });

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto pb-24 md:pb-6">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Bug Reports</h1>
          <p className="text-sm text-gray-400 mt-0.5">{bugs.length} total · track issues found during QA</p>
        </div>
        <button onClick={() => openCreate()} className="btn-primary">
          <Plus size={14} /> New Bug
        </button>
      </div>

      {/* Status tabs */}
      <div className="flex items-center gap-1 mb-5 overflow-x-auto pb-1">
        {STATUS_TABS.map(tab => {
          const count = counts[tab.value] ?? 0;
          const active = statusFilter === tab.value;
          return (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                active ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-500 hover:border-blue-300 hover:text-blue-600'
              }`}
            >
              {tab.label}
              {count > 0 && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${active ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* List */}
      {loading ? (
        <div className="card p-10 text-center">
          <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="card p-14 text-center">
          <Bug size={28} className="text-gray-300 mx-auto mb-3" />
          <p className="text-sm font-medium text-gray-500 mb-1">
            {statusFilter === 'all' ? 'No bug reports yet' : `No ${statusFilter.replace('_', ' ')} bugs`}
          </p>
          <p className="text-xs text-gray-400 mb-5">
            Create a report manually or click "Report Bug" on any scan finding.
          </p>
          {statusFilter === 'all' && (
            <button onClick={() => openCreate()} className="btn-primary mx-auto">
              <Plus size={14} /> New Bug Report
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(bug => (
            <BugCard
              key={bug.id}
              bug={bug}
              onEdit={openEdit}
              onDelete={deleteBug}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      {modal.open && (
        <BugModal
          initial={modal.initial}
          onSave={handleSave}
          onClose={() => setModal(m => ({ ...m, open: false }))}
          saving={saving}
        />
      )}
    </div>
  );
}

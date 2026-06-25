import { useState, FormEvent } from 'react';
import { Loader2, ArrowRight, Building2, ArrowLeft } from 'lucide-react';
import type { User } from '@supabase/supabase-js';
import { useOrganization } from '../../hooks/useOrganization';

interface OnboardingPageProps {
  user: User;
  onComplete: () => void;
  onCancel?: () => void;
}

export default function OnboardingPage({ user, onComplete, onCancel }: OnboardingPageProps) {
  const { createOrganization } = useOrganization(user);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const displayName = (user.user_metadata?.full_name || user.user_metadata?.user_name || 'there') as string;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    setError('');

    const result = await createOrganization(name, description);

    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    onComplete();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <span className="font-bold text-gray-900 tracking-tight text-xl">Ribby</span>
        </div>

        {/* Card */}
        <div className="card p-8">
          {/* Back link — only when coming from org picker */}
          {onCancel && (
            <button
              onClick={onCancel}
              className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-700 mb-5 transition-colors"
            >
              <ArrowLeft size={13} />
              Back to organizations
            </button>
          )}

          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-6">
            <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center">
              <span className="text-white text-xs font-bold">1</span>
            </div>
            <div className="flex-1 h-px bg-gray-200" />
            <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-400 text-xs font-bold">2</span>
            </div>
          </div>

          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
              <Building2 size={18} className="text-blue-600" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Create your organization</h1>
              <p className="text-xs text-gray-400">Welcome, {displayName}</p>
            </div>
          </div>

          <p className="text-sm text-gray-400 mb-6 mt-3">
            Set up your workspace to start scanning applications and tracking results.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Organization name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Acme QA Team"
                maxLength={80}
                className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-150"
                disabled={loading}
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Description <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="What does your team work on?"
                maxLength={300}
                rows={3}
                className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-150 resize-none"
                disabled={loading}
              />
              <p className="text-[11px] text-gray-400 mt-1 text-right">{description.length}/300</p>
            </div>

            {error && (
              <p className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={!name.trim() || loading}
              className="w-full btn-primary justify-center py-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <><Loader2 size={15} className="animate-spin" /> Creating...</>
              ) : (
                <>Create Organization <ArrowRight size={15} /></>
              )}
            </button>
          </form>

          <p className="text-center text-xs text-gray-400 mt-4">
            You can create up to <span className="font-medium text-gray-600">20 organizations</span> per account.
          </p>
        </div>
      </div>
    </div>
  );
}

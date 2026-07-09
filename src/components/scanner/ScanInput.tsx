import { useState, FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Search, ArrowRight } from 'lucide-react';

const EXAMPLES = ['example.com', 'github.com', 'stripe.com'];

interface ScanInputProps {
  compact?: boolean;
  value?: string;
  onChange?: (value: string) => void;
  onSubmitUrl?: (url: string) => void;
  submitLabel?: string;
}

export default function ScanInput({
  compact = false,
  value: controlledValue,
  onChange,
  onSubmitUrl,
  submitLabel = 'Continue'
}: ScanInputProps) {
  const [internalUrl, setInternalUrl] = useState('');
  const navigate = useNavigate();
  const { orgId } = useParams<{ orgId: string }>();

  const url = controlledValue ?? internalUrl;
  const setUrl = onChange ?? setInternalUrl;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    const normalized = url.trim().startsWith('http') ? url.trim() : 'https://' + url.trim();

    if (onSubmitUrl) {
      onSubmitUrl(normalized);
      return;
    }

    navigate(`/org/${orgId}/hub?url=${encodeURIComponent(normalized)}`);
  };

  return (
    <div className={`w-full mx-auto ${compact ? '' : 'max-w-xl px-4 md:px-0'}`}>
      {!compact && (
        <div className="text-center mb-6">
          <h1 className="text-xl md:text-2xl font-semibold text-[#ede9ff] mb-2">
            Scan any web application
          </h1>
          <p className="text-sm text-[#6b6880]">
            Enter a URL to run targeted tests: security, performance, load, accessibility, and more.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6b6880]" />
          <input
            type="text"
            value={url}
            onChange={e => setUrl(e.target.value)}
            placeholder="https://example.com"
            className="w-full bg-surface border border-border rounded-lg pl-9 pr-4 py-2.5 text-sm text-[#ede9ff] placeholder-[#4e4b60] focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 transition-all duration-150"
          />
        </div>
        <button
          type="submit"
          disabled={!url.trim()}
          className="btn-primary justify-center disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {submitLabel} <ArrowRight size={14} />
        </button>
      </form>

      {!compact && (
        <div className="mt-4 flex items-center gap-2 justify-center flex-wrap">
          <span className="text-xs text-[#4e4b60]">Try:</span>
          {EXAMPLES.map(ex => (
            <button
              key={ex}
              type="button"
              onClick={() => setUrl('https://' + ex)}
              className="text-xs text-[#6b6880] hover:text-blue-400 transition-colors duration-150 underline underline-offset-2"
            >
              {ex}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

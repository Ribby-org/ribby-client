import { useState, FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Search, ArrowRight } from 'lucide-react';

const EXAMPLES = ['example.com', 'github.com', 'stripe.com'];

export default function ScanInput() {
  const [url, setUrl] = useState('');
  const navigate = useNavigate();
  const { orgId } = useParams<{ orgId: string }>();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    const normalized = url.trim().startsWith('http') ? url.trim() : 'https://' + url.trim();
    navigate(`/org/${orgId}/hub`, { state: { url: normalized } });
  };

  return (
    <div className="w-full max-w-xl mx-auto px-4 md:px-0">
      <div className="text-center mb-6">
        <h1 className="text-xl md:text-2xl font-semibold text-gray-900 mb-2">
          Scan any web application
        </h1>
        <p className="text-sm text-gray-400">
          Enter a URL to run targeted tests: security, performance, load, accessibility, and more.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={url}
            onChange={e => setUrl(e.target.value)}
            placeholder="https://example.com"
            className="w-full bg-white border border-gray-200 rounded-lg pl-9 pr-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-150 shadow-sm"
          />
        </div>
        <button
          type="submit"
          disabled={!url.trim()}
          className="btn-primary justify-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue <ArrowRight size={14} />
        </button>
      </form>

      <div className="mt-4 flex items-center gap-2 justify-center flex-wrap">
        <span className="text-xs text-gray-400">Try:</span>
        {EXAMPLES.map(ex => (
          <button
            key={ex}
            onClick={() => setUrl('https://' + ex)}
            className="text-xs text-gray-400 hover:text-blue-600 transition-colors duration-150 underline underline-offset-2"
          >
            {ex}
          </button>
        ))}
      </div>
    </div>
  );
}

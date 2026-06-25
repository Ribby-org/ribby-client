import ScanInput from '../components/scanner/ScanInput';

const FEATURES = [
  { title: 'Security', desc: 'Headers, HTTPS, CORS, CSP, exposed credentials' },
  { title: 'Performance', desc: 'Response time, compression, caching, page weight' },
  { title: 'Accessibility', desc: 'WCAG violations, alt text, ARIA, heading structure' },
  { title: 'Functional', desc: 'Broken links, form issues, meta tags, error exposure' }
];

export default function HomePage() {
  return (
    <div className="min-h-full flex flex-col items-center justify-center px-4 py-10 pb-24 md:pb-10">
      <ScanInput />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-10 max-w-xl w-full px-0">
        {FEATURES.map(({ title, desc }) => (
          <div key={title} className="card p-4">
            <h3 className="text-sm font-medium text-gray-800 mb-1">{title}</h3>
            <p className="text-xs text-gray-400 leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

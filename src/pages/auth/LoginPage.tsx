import { Github, Lock, Search, Activity } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export default function LoginPage() {
  const { signInWithGitHub } = useAuth();

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row">

        {/* ── Left panel ── */}
        <div className="flex-1 flex flex-col justify-center px-8 py-10 md:px-10 md:py-12">
          <div className="mb-6 md:mb-8">
            <span className="font-bold text-xl text-gray-900 tracking-tight">Ribby</span>
            <p className="text-xs text-gray-400 mt-0.5">Web Application Scanner</p>
          </div>

          <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">Welcome back</h1>
          <p className="text-sm text-gray-400 mb-6 md:mb-8">
            Sign in to start scanning web applications for vulnerabilities.
          </p>

          <button
            onClick={signInWithGitHub}
            className="w-full flex items-center justify-center gap-3 bg-gray-900 hover:bg-gray-700 text-white text-sm font-semibold px-5 py-3 rounded-full transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <Github size={18} />
            Continue with GitHub
          </button>

          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-xs text-gray-400">secure sign-in</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          <p className="text-[11px] text-gray-400 leading-relaxed text-center">
            By signing in you agree to use Ribby responsibly and only scan applications you are authorised to test.
          </p>
        </div>

        {/* ── Right panel — hidden on mobile, visible on md+ ── */}
        <div className="hidden md:flex relative w-64 lg:w-80 bg-gradient-to-br from-violet-500 via-indigo-500 to-blue-600 flex-col items-center justify-center p-8 overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10" />
          <div className="absolute -bottom-10 -left-10 w-48 h-48 rounded-full bg-white/10" />
          <div className="absolute top-1/2 -right-6 w-24 h-24 rounded-full bg-white/5" />

          <div className="relative z-10 text-center mb-6">
            <h2 className="text-white font-bold text-lg leading-snug mb-2">
              Smart App<br />Scanner
            </h2>
            <p className="text-white/70 text-xs leading-relaxed">
              Security, performance, load testing and accessibility all in one place.
            </p>
          </div>

          <div className="relative z-10 flex flex-col gap-2 w-full">
            {[
              { icon: Lock,     label: 'Safety Checks' },
              { icon: Activity, label: 'Load Testing' },
              { icon: Search,   label: 'Performance Audit' }
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2.5 bg-white/10 border border-white/20 rounded-full px-3.5 py-1.5">
                <Icon size={12} className="text-white/80" />
                <span className="text-white/90 text-xs font-medium">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Mobile bottom strip (replaces right panel) ── */}
        <div className="md:hidden bg-gradient-to-r from-violet-500 via-indigo-500 to-blue-600 px-8 py-4 flex items-center justify-center gap-4">
          {[
            { icon: Lock,     label: 'Safety' },
            { icon: Activity, label: 'Load' },
            { icon: Search,   label: 'Performance' }
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-1.5 bg-white/10 border border-white/20 rounded-full px-3 py-1">
              <Icon size={11} className="text-white/80" />
              <span className="text-white/90 text-[11px] font-medium">{label}</span>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

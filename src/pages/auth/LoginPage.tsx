import { Github, Lock, Search, Activity } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export default function LoginPage() {
  const { signInWithGitHub } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#181623' }}>
      <div className="w-full max-w-3xl rounded-2xl overflow-hidden flex flex-col md:flex-row shadow-2xl"
        style={{ border: '1px solid #2e2a42' }}>

        {/* Left panel */}
        <div className="flex-1 flex flex-col justify-center px-8 py-10 md:px-10 md:py-12"
          style={{ backgroundColor: '#1d1a2b' }}>
          <div className="mb-6 md:mb-8">
            <span className="font-bold text-xl tracking-tight" style={{ color: '#ede9ff' }}>Ribby</span>
            <p className="text-xs mt-0.5" style={{ color: '#6b6880' }}>Web Application Scanner</p>
          </div>

          <h1 className="text-xl md:text-2xl font-bold mb-1" style={{ color: '#ede9ff' }}>Welcome back</h1>
          <p className="text-sm mb-6 md:mb-8" style={{ color: '#6b6880' }}>
            Sign in to start scanning web applications for vulnerabilities.
          </p>

          <button
            onClick={signInWithGitHub}
            className="w-full flex items-center justify-center gap-3 text-white text-sm font-semibold px-5 py-3 rounded-full transition-all duration-200"
            style={{ backgroundColor: '#7c3aed' }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#6d28d9')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#7c3aed')}
          >
            <Github size={18} />
            Continue with GitHub
          </button>

          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px" style={{ backgroundColor: '#2e2a42' }} />
            <span className="text-xs" style={{ color: '#4e4b60' }}>secure sign-in</span>
            <div className="flex-1 h-px" style={{ backgroundColor: '#2e2a42' }} />
          </div>

          <p className="text-[11px] leading-relaxed text-center" style={{ color: '#4e4b60' }}>
            By signing in you agree to use Ribby responsibly and only scan applications you are authorised to test.
          </p>
        </div>

        {/* Right panel — desktop */}
        <div className="hidden md:flex relative w-64 lg:w-80 flex-col items-center justify-center p-8 overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)' }}>
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }} />
          <div className="absolute -bottom-10 -left-10 w-48 h-48 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.06)' }} />

          <div className="relative z-10 text-center mb-6">
            <h2 className="text-white font-bold text-lg leading-snug mb-2">Smart App<br />Scanner</h2>
            <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.65)' }}>
              Security, performance, load testing and accessibility all in one place.
            </p>
          </div>

          <div className="relative z-10 flex flex-col gap-2 w-full">
            {[
              { icon: Lock,     label: 'Safety Checks' },
              { icon: Activity, label: 'Load Testing' },
              { icon: Search,   label: 'Performance Audit' }
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2.5 rounded-full px-3.5 py-1.5"
                style={{ backgroundColor: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)' }}>
                <Icon size={12} style={{ color: 'rgba(255,255,255,0.8)' }} />
                <span className="text-xs font-medium text-white">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile bottom strip */}
        <div className="md:hidden flex items-center justify-center gap-4 px-8 py-4"
          style={{ background: 'linear-gradient(90deg, #7c3aed 0%, #4f46e5 100%)' }}>
          {[
            { icon: Lock,     label: 'Safety' },
            { icon: Activity, label: 'Load' },
            { icon: Search,   label: 'Performance' }
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-1.5 rounded-full px-3 py-1"
              style={{ backgroundColor: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)' }}>
              <Icon size={11} style={{ color: 'rgba(255,255,255,0.8)' }} />
              <span className="text-[11px] font-medium text-white">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

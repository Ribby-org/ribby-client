import { useState } from 'react';
import { NavLink, useNavigate, useParams } from 'react-router-dom';
import { History, ScanLine, LogOut, X, ChevronLeft, Building2, Github, ClipboardList, Bug } from 'lucide-react';
import LegalModal from './LegalModal';
import { useAuth } from '../../hooks/useAuth';
import { useOrganization } from '../../hooks/useOrganization';

interface SidebarProps {
  onClose: () => void;
}

export default function Sidebar({ onClose }: SidebarProps) {
  const { user, signOut } = useAuth();
  const { organizations } = useOrganization(user);
  const { orgId } = useParams<{ orgId: string }>();
  const navigate = useNavigate();

  const [legal, setLegal] = useState<'privacy' | 'terms' | null>(null);
  const avatar = user?.user_metadata?.avatar_url as string | undefined;
  const name = (user?.user_metadata?.full_name || user?.user_metadata?.user_name || user?.email || '') as string;
  const currentOrg = organizations.find(o => o.id === orgId);

  const sections = [
    {
      label: 'Web Scanner',
      items: [
        { to: `/org/${orgId}/scanner`, icon: ScanLine,      label: 'Scanner' },
        { to: `/org/${orgId}/audit`,   icon: ClipboardList, label: 'Site Audit' },
      ]
    },
    {
      label: 'Code',
      items: [
        { to: `/org/${orgId}/repo`, icon: Github, label: 'Repositories' }
      ]
    },
    {
      label: 'QA',
      items: [
        { to: `/org/${orgId}/bugs`, icon: Bug, label: 'Bug Reports' }
      ]
    },
    {
      label: 'Reports',
      items: [
        { to: `/org/${orgId}/history`, icon: History, label: 'History' }
      ]
    }
  ];

  return (
    <aside
      className="w-56 flex-shrink-0 flex flex-col h-full"
      style={{ backgroundColor: '#1d1a2b' }}
    >
      {/* Org header */}
      <div className="px-4 py-4" style={{ borderBottom: '1px solid #2e2a42' }}>
        <button
          onClick={() => { navigate('/'); onClose(); }}
          className="flex items-center gap-1.5 text-xs mb-3 transition-colors"
          style={{ color: '#6b6880' }}
          onMouseEnter={e => (e.currentTarget.style.color = '#9390aa')}
          onMouseLeave={e => (e.currentTarget.style.color = '#6b6880')}
        >
          <ChevronLeft size={13} />
          All organizations
        </button>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.25)' }}>
              <Building2 size={13} className="text-blue-400" />
            </div>
            <span className="font-semibold text-sm truncate" style={{ color: '#ede9ff' }}>
              {currentOrg?.name ?? 'Organization'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="md:hidden p-1 rounded-lg transition-colors"
            style={{ color: '#6b6880' }}
          >
            <X size={15} />
          </button>
        </div>
      </div>

      {/* Nav sections */}
      <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto">
        {sections.map(section => (
          <div key={section.label}>
            <p className="text-[10px] font-semibold uppercase tracking-widest px-2 mb-1.5" style={{ color: '#4e4b60' }}>
              {section.label}
            </p>
            <div className="space-y-0.5">
              {section.items.map(({ to, icon: Icon, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors duration-150 ${
                      isActive ? 'text-blue-400 font-medium' : ''
                    }`
                  }
                  style={({ isActive }) => isActive
                    ? { backgroundColor: 'rgba(124,58,237,0.15)', color: '#a78bfa' }
                    : { color: '#9390aa' }
                  }
                >
                  <Icon size={15} />
                  {label}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* User */}
      {user && (
        <div className="px-3 py-4" style={{ borderTop: '1px solid #2e2a42' }}>
          <div className="flex items-center gap-2.5 px-2 mb-2">
            {avatar ? (
              <img src={avatar} alt={name} className="w-7 h-7 rounded-full flex-shrink-0" />
            ) : (
              <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: '#2e2a42' }}>
                <span className="text-xs font-medium" style={{ color: '#9390aa' }}>{name.charAt(0).toUpperCase()}</span>
              </div>
            )}
            <div className="min-w-0">
              <p className="text-xs font-medium truncate" style={{ color: '#ede9ff' }}>{name}</p>
              <p className="text-[11px] truncate" style={{ color: '#6b6880' }}>{user.email}</p>
            </div>
          </div>
          <button
            onClick={signOut}
            className="w-full flex items-center gap-2 px-2 py-1.5 text-xs rounded-lg transition-colors duration-150"
            style={{ color: '#6b6880' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#f87171'; e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.08)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = '#6b6880'; e.currentTarget.style.backgroundColor = 'transparent'; }}
          >
            <LogOut size={13} />
            Sign out
          </button>
        </div>
      )}

      {/* Legal links */}
      <div className="px-4 pb-3 flex items-center gap-3">
        <button
          onClick={() => setLegal('privacy')}
          className="text-[10px] transition-colors"
          style={{ color: '#4e4b60' }}
          onMouseEnter={e => (e.currentTarget.style.color = '#9390aa')}
          onMouseLeave={e => (e.currentTarget.style.color = '#4e4b60')}
        >
          Privacy
        </button>
        <span style={{ color: '#2e2a42' }}>·</span>
        <button
          onClick={() => setLegal('terms')}
          className="text-[10px] transition-colors"
          style={{ color: '#4e4b60' }}
          onMouseEnter={e => (e.currentTarget.style.color = '#9390aa')}
          onMouseLeave={e => (e.currentTarget.style.color = '#4e4b60')}
        >
          Terms
        </button>
      </div>

      {legal && <LegalModal type={legal} onClose={() => setLegal(null)} />}
    </aside>
  );
}

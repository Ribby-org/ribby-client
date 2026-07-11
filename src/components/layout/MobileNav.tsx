import { NavLink, useParams } from 'react-router-dom';
import { ScanLine, History, Menu, Github, ClipboardList } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useOrganization } from '../../hooks/useOrganization';

interface MobileNavProps {
  onMenuClick: () => void;
}

export default function MobileNav({ onMenuClick }: MobileNavProps) {
  const { user } = useAuth();
  const { organizations } = useOrganization(user);
  const { orgId } = useParams<{ orgId: string }>();
  const currentOrg = organizations.find(o => o.id === orgId);
  const isFirstOrg = organizations.length > 0 && organizations[0].id === orgId;

  const avatar = user?.user_metadata?.avatar_url as string | undefined;
  const name = (user?.user_metadata?.full_name || user?.user_metadata?.user_name || '') as string;

  const tabs = [
    { to: `/org/${orgId}/scanner`, icon: ScanLine,      label: 'Scanner' },
    { to: `/org/${orgId}/audit`,   icon: ClipboardList, label: 'Audit' },
    ...(isFirstOrg ? [{ to: `/org/${orgId}/repo`, icon: Github, label: 'Repos' }] : []),
    { to: `/org/${orgId}/history`, icon: History,       label: 'History' }
  ];

  return (
    <>
      <div className="md:hidden flex items-center justify-between px-4 py-3 flex-shrink-0"
        style={{ backgroundColor: '#1d1a2b', borderBottom: '1px solid #2e2a42' }}>
        <div className="flex items-center gap-3">
          <button onClick={onMenuClick} aria-label="Open menu" className="p-1.5 rounded-lg transition-colors" style={{ color: '#9390aa' }}>
            <Menu size={18} />
          </button>
          <span className="font-semibold text-sm truncate max-w-[160px]" style={{ color: '#ede9ff' }}>
            {currentOrg?.name ?? 'Ribby'}
          </span>
        </div>
        {avatar ? (
          <img src={avatar} alt={name} className="w-7 h-7 rounded-full" />
        ) : (
          <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ backgroundColor: '#2e2a42' }}>
            <span className="text-xs font-medium" style={{ color: '#9390aa' }}>{name.charAt(0).toUpperCase()}</span>
          </div>
        )}
      </div>

      <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 flex"
        style={{ backgroundColor: '#1d1a2b', borderTop: '1px solid #2e2a42' }}>
        {tabs.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className="flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5 text-xs transition-colors duration-150"
            style={({ isActive }) => ({ color: isActive ? '#a78bfa' : '#6b6880' })}
          >
            <Icon size={18} />
            <span>{label}</span>
          </NavLink>
        ))}
      </div>
    </>
  );
}

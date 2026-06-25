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

  const avatar = user?.user_metadata?.avatar_url as string | undefined;
  const name = (user?.user_metadata?.full_name || user?.user_metadata?.user_name || '') as string;

  const tabs = [
    { to: `/org/${orgId}/scanner`, icon: ScanLine, label: 'Scanner' },
    { to: `/org/${orgId}/audit`, icon: ClipboardList, label: 'Audit' },
    { to: `/org/${orgId}/repo`, icon: Github, label: 'Repos' },
    { to: `/org/${orgId}/history`, icon: History, label: 'History' }
  ];

  return (
    <>
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={onMenuClick} className="p-1.5 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors">
            <Menu size={18} />
          </button>
          <span className="font-semibold text-gray-900 text-sm truncate max-w-[160px]">
            {currentOrg?.name ?? 'Ribby'}
          </span>
        </div>
        {avatar ? (
          <img src={avatar} alt={name} className="w-7 h-7 rounded-full ring-1 ring-gray-200" />
        ) : (
          <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center">
            <span className="text-xs font-medium text-gray-600">{name.charAt(0).toUpperCase()}</span>
          </div>
        )}
      </div>

      <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-200 flex">
        {tabs.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5 text-xs transition-colors duration-150 ${
                isActive ? 'text-blue-600' : 'text-gray-400'
              }`
            }
          >
            <Icon size={18} />
            <span>{label}</span>
          </NavLink>
        ))}
      </div>
    </>
  );
}

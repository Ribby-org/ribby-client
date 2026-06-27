import { NavLink, useNavigate, useParams } from 'react-router-dom';
import { History, ScanLine, LogOut, X, ChevronLeft, Building2, Github, ClipboardList, Bug } from 'lucide-react';
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

  const avatar = user?.user_metadata?.avatar_url as string | undefined;
  const name = (user?.user_metadata?.full_name || user?.user_metadata?.user_name || user?.email || '') as string;
  const currentOrg = organizations.find(o => o.id === orgId);

  const sections = [
    {
      label: 'Web Scanner',
      items: [
        { to: `/org/${orgId}/scanner`,   icon: ScanLine,      label: 'Scanner' },
        { to: `/org/${orgId}/audit`,     icon: ClipboardList, label: 'Site Audit' },
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
    <aside className="w-56 flex-shrink-0 bg-white border-r border-gray-200 flex flex-col h-full">

      {/* Org header */}
      <div className="px-4 py-4 border-b border-gray-100">
        <button
          onClick={() => { navigate('/'); onClose(); }}
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 mb-3 transition-colors"
        >
          <ChevronLeft size={13} />
          All organizations
        </button>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center flex-shrink-0">
              <Building2 size={13} className="text-blue-600" />
            </div>
            <span className="font-semibold text-gray-900 text-sm truncate">
              {currentOrg?.name ?? 'Organization'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="md:hidden p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={15} />
          </button>
        </div>
      </div>

      {/* Nav sections */}
      <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto">
        {sections.map(section => (
          <div key={section.label}>
            <p className="text-[11px] font-semibold text-gray-400 px-2 mb-1.5">
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
                      isActive
                        ? 'bg-blue-50 text-blue-600 font-medium'
                        : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'
                    }`
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
        <div className="px-3 py-4 border-t border-gray-100">
          <div className="flex items-center gap-2.5 px-2 mb-2">
            {avatar ? (
              <img src={avatar} alt={name} className="w-7 h-7 rounded-full flex-shrink-0 ring-1 ring-gray-200" />
            ) : (
              <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-medium text-gray-600">{name.charAt(0).toUpperCase()}</span>
              </div>
            )}
            <div className="min-w-0">
              <p className="text-xs font-medium text-gray-800 truncate">{name}</p>
              <p className="text-[11px] text-gray-400 truncate">{user.email}</p>
            </div>
          </div>
          <button
            onClick={signOut}
            className="w-full flex items-center gap-2 px-2 py-1.5 text-xs text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors duration-150"
          >
            <LogOut size={13} />
            Sign out
          </button>
        </div>
      )}
    </aside>
  );
}

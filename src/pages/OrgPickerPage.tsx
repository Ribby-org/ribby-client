import { useNavigate } from 'react-router-dom';
import { Plus, Building2, LogOut, ChevronRight } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useOrganization } from '../hooks/useOrganization';
import type { Organization } from '../hooks/useOrganization';

interface OrgPickerPageProps {
  onCreateNew: () => void;
}

export default function OrgPickerPage({ onCreateNew }: OrgPickerPageProps) {
  const { user, signOut } = useAuth();
  const { organizations } = useOrganization(user);
  const navigate = useNavigate();

  const avatar = user?.user_metadata?.avatar_url as string | undefined;
  const name = (user?.user_metadata?.full_name || user?.user_metadata?.user_name || user?.email || '') as string;

  const handleSelect = (org: Organization) => {
    navigate(`/org/${org.id}/scanner`);
  };

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: '#181623' }}>

      {/* Left icon strip */}
      <div className="flex flex-col items-center justify-between py-6 px-3 flex-shrink-0"
        style={{ width: '60px' }}>
        {/* Logo initial */}
        <span className="text-sm font-bold" style={{ color: '#a78bfa' }}>R</span>

        {/* Bottom: avatar + logout */}
        <div className="flex flex-col items-center gap-3">
          {avatar ? (
            <img src={avatar} alt={name} className="w-8 h-8 rounded-full" title={name} />
          ) : (
            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: '#2e2a42' }}>
              <span className="text-xs font-medium" style={{ color: '#9390aa' }}>
                {name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <button
            onClick={signOut}
            title="Sign out"
            className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors"
            style={{ color: '#6b6880' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#f87171'; e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.08)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = '#6b6880'; e.currentTarget.style.backgroundColor = 'transparent'; }}
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex items-start justify-center px-6 pt-16 pb-12">
        <div className="w-full max-w-3xl">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold" style={{ color: '#ede9ff' }}>Your organizations</h1>
              <p className="text-sm mt-1" style={{ color: '#6b6880' }}>Select an organization to continue</p>
            </div>
            {organizations.length < 20 && (
              <button onClick={onCreateNew} className="btn-primary self-start sm:self-auto">
                <Plus size={15} /> New Organization
              </button>
            )}
          </div>

          {/* Org grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {organizations.map(org => (
              <button
                key={org.id}
                onClick={() => handleSelect(org)}
                className="card p-5 text-left transition-all duration-200 hover:scale-[1.02]"
                style={{ border: '1px solid #2e2a42' }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.25)' }}>
                    <Building2 size={18} style={{ color: '#a78bfa' }} />
                  </div>
                  <ChevronRight size={16} className="mt-1" style={{ color: '#4e4b60' }} />
                </div>
                <h3 className="text-sm font-semibold mb-1 truncate" style={{ color: '#ede9ff' }}>{org.name}</h3>
                {org.description ? (
                  <p className="text-xs line-clamp-2 leading-relaxed" style={{ color: '#6b6880' }}>{org.description}</p>
                ) : (
                  <p className="text-xs italic" style={{ color: '#4e4b60' }}>No description</p>
                )}
                <p className="text-[11px] mt-3" style={{ color: '#4e4b60' }}>
                  Created {new Date(org.created_at).toLocaleDateString()}
                </p>
              </button>
            ))}

            {organizations.length < 20 && (
              <button
                onClick={onCreateNew}
                className="card p-5 transition-all duration-200 flex flex-col items-center justify-center gap-2 min-h-[140px]"
                style={{ border: '1px dashed #2e2a42' }}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: '#2e2a42' }}>
                  <Plus size={18} style={{ color: '#6b6880' }} />
                </div>
                <p className="text-sm font-medium" style={{ color: '#6b6880' }}>New Organization</p>
              </button>
            )}
          </div>

          {organizations.length === 20 && (
            <p className="text-center text-xs mt-6" style={{ color: '#6b6880' }}>
              You have reached the maximum of 20 organizations.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

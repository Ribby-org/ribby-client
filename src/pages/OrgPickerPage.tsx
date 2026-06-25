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
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <div className="border-b border-gray-200 bg-white px-6 py-4 flex items-center justify-between">
        <span className="font-bold text-gray-900 tracking-tight text-lg">Ribby</span>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5">
            {avatar ? (
              <img src={avatar} alt={name} className="w-7 h-7 rounded-full ring-1 ring-gray-200" />
            ) : (
              <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-xs font-medium text-gray-600">{name.charAt(0).toUpperCase()}</span>
              </div>
            )}
            <span className="text-sm text-gray-700 font-medium">{name}</span>
          </div>
          <button
            onClick={signOut}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-red-500 transition-colors px-2 py-1.5 rounded-lg hover:bg-red-50"
          >
            <LogOut size={13} />
            Sign out
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Your organizations</h1>
            <p className="text-sm text-gray-400 mt-1">Select an organization to continue</p>
          </div>
          {organizations.length < 20 && (
            <button onClick={onCreateNew} className="btn-primary">
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
              className="card p-5 text-left hover:shadow-md hover:border-blue-200 transition-all duration-200 group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center flex-shrink-0">
                  <Building2 size={18} className="text-blue-600" />
                </div>
                <ChevronRight size={16} className="text-gray-300 group-hover:text-blue-500 transition-colors mt-1" />
              </div>
              <h3 className="text-sm font-semibold text-gray-900 mb-1 truncate">{org.name}</h3>
              {org.description ? (
                <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">{org.description}</p>
              ) : (
                <p className="text-xs text-gray-300 italic">No description</p>
              )}
              <p className="text-[11px] text-gray-300 mt-3">
                Created {new Date(org.created_at).toLocaleDateString()}
              </p>
            </button>
          ))}

          {/* Create new card */}
          {organizations.length < 20 && (
            <button
              onClick={onCreateNew}
              className="card p-5 text-left border-dashed hover:border-blue-300 hover:bg-blue-50/50 transition-all duration-200 group flex flex-col items-center justify-center gap-2 min-h-[140px]"
            >
              <div className="w-10 h-10 rounded-xl bg-gray-100 group-hover:bg-blue-100 flex items-center justify-center transition-colors">
                <Plus size={18} className="text-gray-400 group-hover:text-blue-600 transition-colors" />
              </div>
              <p className="text-sm text-gray-400 group-hover:text-blue-600 font-medium transition-colors">
                New Organization
              </p>
            </button>
          )}
        </div>

        {organizations.length === 20 && (
          <p className="text-center text-xs text-gray-400 mt-6">
            You have reached the maximum of 20 organizations.
          </p>
        )}
      </div>
    </div>
  );
}

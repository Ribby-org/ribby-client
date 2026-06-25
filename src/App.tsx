import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import ScanHubPage from './pages/ScanHubPage';
import HistoryPage from './pages/HistoryPage';
import RepoScanPage from './pages/github/RepoScanPage';
import AuditPage from './pages/AuditPage';
import AnalyticsPage from './pages/AnalyticsPage';
import LoginPage from './pages/auth/LoginPage';
import OnboardingPage from './pages/onboarding/OnboardingPage';
import OrgPickerPage from './pages/OrgPickerPage';
import { useAuth } from './hooks/useAuth';
import { useOrganization } from './hooks/useOrganization';

function Spinner() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

// Guard: ensures the org in the URL belongs to the current user
function OrgGuard({ organizations, children }: {
  organizations: { id: string }[];
  children: React.ReactNode;
}) {
  const { orgId } = useParams<{ orgId: string }>();
  const belongs = organizations.some(o => o.id === orgId);
  if (!belongs) return <Navigate to="/" replace />;
  return <>{children}</>;
}

export default function App() {
  const { session, user, loading: authLoading } = useAuth();
  const { organizations, loading: orgLoading, fetched: orgFetched, refetch } = useOrganization(user);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Hold spinner until auth AND org fetch are fully settled
  if (authLoading || !orgFetched || (session && orgLoading)) return <Spinner />;

  // Not logged in — always show login regardless of URL
  if (!session) return <LoginPage />;

  // First time — no orgs yet
  if (orgFetched && organizations.length === 0) {
    return <OnboardingPage user={user!} onComplete={async () => { await refetch(); }} />;
  }

  // Creating a new org
  if (showOnboarding) {
    return (
      <OnboardingPage
        user={user!}
        onComplete={async () => { await refetch(); setShowOnboarding(false); }}
        onCancel={() => setShowOnboarding(false)}
      />
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Org picker */}
        <Route
          path="/"
          element={<OrgPickerPage onCreateNew={() => setShowOnboarding(true)} />}
        />

        {/* Org-scoped routes — guarded so only the owner/member can access */}
        <Route
          path="/org/:orgId/*"
          element={
            <OrgGuard organizations={organizations}>
              <Layout>
                <Routes>
                  <Route path="scanner"   element={<HomePage />} />
                  <Route path="hub"       element={<ScanHubPage />} />
                  <Route path="audit"     element={<AuditPage />} />
                  <Route path="analytics" element={<AnalyticsPage />} />
                  <Route path="repo"      element={<RepoScanPage />} />
                  <Route path="history"   element={<HistoryPage />} />
                  <Route path="*"         element={<Navigate to="scanner" replace />} />
                </Routes>
              </Layout>
            </OrgGuard>
          }
        />

        {/* Any unknown URL → org picker */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

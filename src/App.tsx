import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useParams, useNavigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import ScanHubPage from './pages/ScanHubPage';
import HistoryPage from './pages/HistoryPage';
import RepoScanPage from './pages/github/RepoScanPage';
import AuditPage from './pages/AuditPage';
import BugReportsPage from './pages/BugReportsPage';
import LoginPage from './pages/auth/LoginPage';
import OnboardingPage from './pages/onboarding/OnboardingPage';
import OrgPickerPage from './pages/OrgPickerPage';
import { useAuth } from './hooks/useAuth';
import { useOrganization } from './hooks/useOrganization';

function Spinner() {
  return (
    <div className="min-h-screen bg-app flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

// Handles returning to the page the user was on before GitHub OAuth
function OAuthReturn() {
  const navigate = useNavigate();
  useEffect(() => {
    const returnPath = localStorage.getItem('ribby_oauth_return');
    if (returnPath) {
      localStorage.removeItem('ribby_oauth_return');
      navigate(returnPath, { replace: true });
    }
  }, [navigate]);
  return null;
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

  useEffect(() => {
    // Only redirect to root if auth has fully settled AND there is definitively no session.
    // Without the authLoading guard, this fires during the brief moment Supabase is
    // restoring the session, wiping the current URL before the session is confirmed.
    if (!authLoading && !session && window.location.pathname !== '/') {
      window.history.replaceState({}, '', '/');
    }
  }, [authLoading, session]);

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
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <OAuthReturn />
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
                  <Route path="bugs"      element={<BugReportsPage />} />
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

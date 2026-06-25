import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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

export default function App() {
  const { session, user, loading: authLoading } = useAuth();
  const { organizations, loading: orgLoading, fetched: orgFetched, refetch } = useOrganization(user);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Hold spinner until auth AND org fetch are both fully settled
  if (authLoading || !orgFetched || (session && orgLoading)) return <Spinner />;
  if (!session) return <LoginPage />;

  // Only show onboarding once we're certain there are no orgs
  if (orgFetched && organizations.length === 0) {
    return <OnboardingPage user={user!} onComplete={async () => { await refetch(); }} />;
  }

  // User wants to create another org
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
        {/* Org picker — root */}
        <Route
          path="/"
          element={
            <OrgPickerPage onCreateNew={() => setShowOnboarding(true)} />
          }
        />

        {/* Org-scoped routes */}
        <Route
          path="/org/:orgId/*"
          element={
            <Layout>
              <Routes>
                <Route path="scanner" element={<HomePage />} />
                <Route path="hub"     element={<ScanHubPage />} />
                <Route path="audit"      element={<AuditPage />} />
                <Route path="analytics" element={<AnalyticsPage />} />
                <Route path="repo"    element={<RepoScanPage />} />
                <Route path="history" element={<HistoryPage />} />
                <Route path="*"       element={<Navigate to="scanner" replace />} />
              </Routes>
            </Layout>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { ThemeProvider, useTheme } from './hooks/useTheme';
import { Layout } from './components/layout/Layout';
import type { ReactNode } from 'react';

const AuthPage = lazy(() => import('./components/auth/AuthPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const StorePage = lazy(() => import('./pages/StorePage'));
const ShoppingListPage = lazy(() => import('./pages/ShoppingListPage'));
const HistoryPage = lazy(() => import('./pages/HistoryPage'));
const TemplatesPage = lazy(() => import('./pages/TemplatesPage'));
const StatsPage = lazy(() => import('./pages/StatsPage'));

function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full" />
    </div>
  );
}

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/auth" replace />;

  return <Layout>{children}</Layout>;
}

function AuthRoute() {
  const { user, loading } = useAuth();

  if (loading) return <LoadingSpinner />;
  if (user) return <Navigate to="/" replace />;

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <AuthPage />
    </Suspense>
  );
}

function ThemedToaster() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <Toaster
      position="top-center"
      toastOptions={{
        duration: 3000,
        style: {
          background: isDark ? '#1e293b' : '#ffffff',
          color: isDark ? '#f1f5f9' : '#0f172a',
          border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
          borderRadius: '12px',
          fontSize: '14px',
        },
      }}
    />
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              <Route path="/auth" element={<AuthRoute />} />
              <Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
              <Route path="/store/:storeId" element={<ProtectedRoute><StorePage /></ProtectedRoute>} />
              <Route path="/list/:listId" element={<ProtectedRoute><ShoppingListPage /></ProtectedRoute>} />
              <Route path="/history" element={<ProtectedRoute><HistoryPage /></ProtectedRoute>} />
              <Route path="/templates" element={<ProtectedRoute><TemplatesPage /></ProtectedRoute>} />
              <Route path="/stats" element={<ProtectedRoute><StatsPage /></ProtectedRoute>} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>

          <ThemedToaster />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { Layout } from './components/layout/Layout';
import type { ReactNode } from 'react';

const AuthPage = lazy(() => import('./components/auth/AuthPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const StorePage = lazy(() => import('./pages/StorePage'));
const ShoppingListPage = lazy(() => import('./pages/ShoppingListPage'));
const HistoryPage = lazy(() => import('./pages/HistoryPage'));
const TemplatesPage = lazy(() => import('./pages/TemplatesPage'));

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

const TOAST_STYLE = {
  background: '#1e293b',
  color: '#f1f5f9',
  border: '1px solid #334155',
  borderRadius: '12px',
  fontSize: '14px',
} as const;

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            <Route path="/auth" element={<AuthRoute />} />
            <Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            <Route path="/store/:storeId" element={<ProtectedRoute><StorePage /></ProtectedRoute>} />
            <Route path="/list/:listId" element={<ProtectedRoute><ShoppingListPage /></ProtectedRoute>} />
            <Route path="/history" element={<ProtectedRoute><HistoryPage /></ProtectedRoute>} />
            <Route path="/templates" element={<ProtectedRoute><TemplatesPage /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>

        <Toaster
          position="top-center"
          toastOptions={{ duration: 3000, style: TOAST_STYLE }}
        />
      </AuthProvider>
    </BrowserRouter>
  );
}

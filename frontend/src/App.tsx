import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';

// Layout components
import DashboardLayout from './components/layout/DashboardLayout';
import AuthLayout from './components/layout/AuthLayout';

// Auth pages
import LoginPage from './pages/auth/LoginPage';

// Dashboard pages
import Dashboard from './pages/Dashboard';
import RequestsPage from './pages/requests/RequestsPage';
import RequestDetailsPage from './pages/requests/RequestDetailsPage';
import CreateRequestPage from './pages/requests/CreateRequestPage';
import CustomersPage from './pages/customers/CustomersPage';
import ProductsPage from './pages/products/ProductsPage';
import UsersPage from './pages/users/UsersPage';
import CreateUserPage from './pages/users/CreateUserPage';
import ProfilePage from './pages/ProfilePage';
import ReportsPage from './pages/reports/ReportsPage';
import NotificationsPage from './pages/NotificationsPage';

// Protected Route component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

// Public Route component (only accessible when not authenticated)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return isAuthenticated ? <Navigate to="/" replace /> : <>{children}</>;
};

function App() {
  return (
    <div className="App">
      <Routes>
        {/* Public routes */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <AuthLayout>
                <LoginPage />
              </AuthLayout>
            </PublicRoute>
          }
        />

        {/* Protected routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Dashboard />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/requests"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <RequestsPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/requests/new"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <CreateRequestPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/requests/:id"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <RequestDetailsPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/customers"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <CustomersPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/products"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <ProductsPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/users"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <UsersPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/users/new"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <CreateUserPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <ProfilePage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/reports"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <ReportsPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <NotificationsPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';
import { LandingPage } from './pages/LandingPage';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { ChartOfAccounts } from './pages/accounting/ChartOfAccounts';
import { JournalEntries } from './pages/accounting/JournalEntries';
import { Invoices } from './pages/accounting/Invoices';
import { Payments } from './pages/accounting/Payments';
import { TrialBalance } from './pages/accounting/reports/TrialBalance';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/accounting/accounts"
            element={
              <ProtectedRoute>
                <Layout>
                  <ChartOfAccounts />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/accounting/journal-entries"
            element={
              <ProtectedRoute>
                <Layout>
                  <JournalEntries />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/accounting/invoices"
            element={
              <ProtectedRoute>
                <Layout>
                  <Invoices />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/accounting/payments"
            element={
              <ProtectedRoute>
                <Layout>
                  <Payments />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/accounting/reports/trial-balance"
            element={
              <ProtectedRoute>
                <Layout>
                  <TrialBalance />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

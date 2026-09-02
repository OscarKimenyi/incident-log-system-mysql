import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import IncidentList from './pages/IncidentList';
import IncidentDetail from './pages/IncidentDetail';
import CreateIncident from './pages/CreateIncident';
import UserManagement from './pages/UserManagement';

function PrivateRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
}

function AdminRoute({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return children;
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={
        <PrivateRoute><Layout><Dashboard /></Layout></PrivateRoute>
      } />
      <Route path="/incidents" element={
        <PrivateRoute><Layout><IncidentList /></Layout></PrivateRoute>
      } />
      <Route path="/incidents/new" element={
        <PrivateRoute><Layout><CreateIncident /></Layout></PrivateRoute>
      } />
      <Route path="/incidents/:id" element={
        <PrivateRoute><Layout><IncidentDetail /></Layout></PrivateRoute>
      } />
      <Route path="/users" element={
        <AdminRoute><Layout><UserManagement /></Layout></AdminRoute>
      } />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
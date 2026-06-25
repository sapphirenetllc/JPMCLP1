import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner" style={{ borderColor: 'rgba(26,95,190,.25)', borderTopColor: 'var(--blue)', width: 32, height: 32 }} />
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/signin" replace />;
}

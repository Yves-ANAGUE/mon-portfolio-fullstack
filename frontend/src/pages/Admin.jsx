import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Dashboard from '../components/admin/Dashboard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { ROUTES } from '../utils/constants';

const Admin = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.ADMIN_LOGIN} replace />;
  }

  return <Dashboard />;
};

export default Admin;

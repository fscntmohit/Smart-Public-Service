import { useUser } from '@clerk/clerk-react';
import { Navigate, useNavigate } from 'react-router-dom';
import Spinner from './ui/Spinner';

export default function ProtectedRoute({ children, role: requiredRole }) {
  const { user, isLoaded } = useUser();
  const navigate = useNavigate();

  if (!isLoaded) return (
    <div className="min-h-screen flex items-center justify-center">
      <Spinner />
    </div>
  );
  if (!user) return <Navigate to="/sign-in" replace />;

  const userRole = user?.publicMetadata?.role || 'citizen';

  // If a specific role is required and user role doesn't match
  if (requiredRole && userRole !== requiredRole) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-slate-50">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Unauthorized</h1>
        <p className="text-slate-500 mb-6">You do not have permission to access this page.</p>
        <button
          onClick={() => navigate('/redirect')}
          className="btn-primary"
        >
          Go to your Dashboard
        </button>
      </div>
    );
  }

  return children;
}

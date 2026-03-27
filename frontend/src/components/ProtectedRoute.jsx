import { useUser } from '@clerk/clerk-react';
import { Navigate } from 'react-router-dom';
import Spinner from './ui/Spinner';

export default function ProtectedRoute({ children, role: requiredRole }) {
  const { user, isLoaded } = useUser();

  if (!isLoaded) return <Spinner />;
  if (!user) return <Navigate to="/sign-in" replace />;

  const userRole = user?.publicMetadata?.role || 'citizen';

  // If a specific role is required and user role doesn't match
  if (requiredRole && userRole !== requiredRole) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-slate-50">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Unauthorized</h1>
        <p className="text-slate-500 mb-6">You do not have permission to access this page.</p>
        <button
          onClick={() => window.location.href = '/redirect'}
          className="btn-primary"
        >
          Go to your Dashboard
        </button>
      </div>
    );
  }

  return children;
}

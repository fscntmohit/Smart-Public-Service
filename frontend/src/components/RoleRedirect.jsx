import { useUser } from '@clerk/clerk-react';
import { Navigate } from 'react-router-dom';
import Spinner from './ui/Spinner';

export default function RoleRedirect() {
  const { user, isLoaded } = useUser();

  if (!isLoaded) return <Spinner />;
  
  // If not logged in, go to home or sign in
  if (!user) return <Navigate to="/" replace />;

  const role = user?.publicMetadata?.role || 'citizen';

  if (role === 'admin') {
    return <Navigate to="/admin/dashboard" replace />;
  } else if (role === 'officer') {
    return <Navigate to="/officer/dashboard" replace />;
  } else {
    // defaults to citizen
    return <Navigate to="/citizen/dashboard" replace />;
  }
}

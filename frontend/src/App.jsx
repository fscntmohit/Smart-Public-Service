import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ClerkProvider, SignIn, SignUp, useAuth, useUser } from '@clerk/clerk-react';
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';
import { setAuthInterceptor } from './services/api';
import { syncUser } from './services/userService';

import DashboardLayout from './layouts/DashboardLayout';
import ProtectedRoute from './components/ProtectedRoute';
import RoleRedirect from './components/RoleRedirect';
import Landing from './pages/Landing';
import TrackComplaintPublic from './pages/TrackComplaintPublic';
import SubmitComplaint from './pages/citizen/SubmitComplaint';
import TrackComplaints from './pages/citizen/TrackComplaints';
import ComplaintDetails from './pages/citizen/ComplaintDetails';
import OfficerDashboard from './pages/officer/OfficerDashboard';
import OfficerComplaintDetails from './pages/officer/OfficerComplaintDetails';
import OfficerMap from './pages/officer/OfficerMap';
import OfficerReports from './pages/officer/Reports';
import AdminDashboard from './pages/admin/AdminDashboard';
import Analytics from './pages/admin/Analytics';
import ManageOfficers from './pages/admin/ManageOfficers';
import Heatmap from './pages/admin/Heatmap';
import AdminReports from './pages/admin/Reports';
import HelpVideo from './pages/help/HelpVideo';
import HelpFaq from './pages/help/HelpFaq';
import HelpContact from './pages/help/HelpContact';

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

import { useState } from 'react';
import Spinner from './components/ui/Spinner';

function AuthSetup({ children }) {
  const { getToken, isSignedIn } = useAuth();
  const { user } = useUser();
  const [isSyncing, setIsSyncing] = useState(true);

  useEffect(() => {
    if (isSignedIn === undefined || user === undefined) return; // Clerk still loading

    if (!isSignedIn) {
      setIsSyncing(false);
      return;
    }

    if (isSignedIn && getToken && user) {
      setAuthInterceptor(getToken);
      // Sync user to backend
      syncUser({
        name: user?.fullName || '',
        email: user?.primaryEmailAddress?.emailAddress || '',
        role: user?.publicMetadata?.role || 'citizen',
      })
      .catch((err) => console.error('Sync user failed', err))
      .finally(() => {
        setIsSyncing(false);
      });
    }
  }, [isSignedIn, getToken, user]);

  if (isSyncing) return <div className="min-h-screen flex items-center justify-center"><Spinner /></div>;
  return children;
}

export default function App() {
  return (
    <ClerkProvider publishableKey={clerkPubKey}>
      <BrowserRouter>
        <AuthSetup>
          <Toaster
            position="top-right"
            toastOptions={{
              style: { borderRadius: '0.75rem', fontSize: '14px', padding: '12px 16px' },
              success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
              error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
            }}
          />
          <Routes>
            {/* Public */}
            <Route path="/" element={<Landing />} />
            <Route path="/track" element={<TrackComplaintPublic />} />
            <Route path="/help/video" element={<HelpVideo />} />
            <Route path="/help/faq" element={<HelpFaq />} />
            <Route path="/help/contact" element={<HelpContact />} />
            <Route path="/sign-in/*" element={
              <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <SignIn routing="path" path="/sign-in" afterSignInUrl="/redirect" />
              </div>
            } />
            <Route path="/sign-up/*" element={
              <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <SignUp routing="path" path="/sign-up" afterSignUpUrl="/redirect" />
              </div>
            } />
            
            {/* Main Redirect after login based on role */}
            <Route path="/redirect" element={<RoleRedirect />} />

            {/* Citizen Routes */}
            <Route element={
              <ProtectedRoute role="citizen">
                <DashboardLayout />
              </ProtectedRoute>
            }>
              <Route path="/citizen/dashboard" element={<SubmitComplaint />} />
              <Route path="/citizen/complaints" element={<TrackComplaints />} />
              <Route path="/citizen/complaint/:id" element={<ComplaintDetails />} />
            </Route>

            {/* Officer Routes */}
            <Route element={
              <ProtectedRoute role="officer">
                <DashboardLayout />
              </ProtectedRoute>
            }>
              <Route path="/officer/dashboard" element={<OfficerDashboard />} />
              <Route path="/officer/complaint/:id" element={<OfficerComplaintDetails />} />
              <Route path="/officer/map" element={<OfficerMap />} />
              <Route path="/officer/reports" element={<OfficerReports />} />
            </Route>

            {/* Admin Routes */}
            <Route element={
              <ProtectedRoute role="admin">
                <DashboardLayout />
              </ProtectedRoute>
            }>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/analytics" element={<Analytics />} />
              <Route path="/admin/manage-officers" element={<ManageOfficers />} />
              <Route path="/admin/heatmap" element={<Heatmap />} />
              <Route path="/admin/reports" element={<AdminReports />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthSetup>
      </BrowserRouter>
    </ClerkProvider>
  );
}

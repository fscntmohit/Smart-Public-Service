import { useCallback, useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

export default function DashboardLayout() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const closeMobileSidebar = useCallback(() => setMobileSidebarOpen(false), []);
  const toggleMobileSidebar = useCallback(() => setMobileSidebarOpen((prev) => !prev), []);

  useEffect(() => {
    document.body.style.overflow = mobileSidebarOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileSidebarOpen]);

  return (
    <div className="flex min-h-screen bg-slate-50 relative">
      <Sidebar
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={closeMobileSidebar}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar onToggleSidebar={toggleMobileSidebar} />
        <main className="flex-1 p-3 sm:p-4 lg:p-6 overflow-auto fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

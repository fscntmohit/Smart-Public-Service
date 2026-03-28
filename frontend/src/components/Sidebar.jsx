import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import {
  LayoutDashboard, FileText, PlusCircle, Map, Users,
  BarChart3, MapPin, Shield, ChevronLeft, ChevronRight, X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';

const citizenLinks = [
  { to: '/citizen/dashboard', icon: PlusCircle, labelKey: 'sidebar.submitComplaint' },
  { to: '/citizen/complaints', icon: FileText, labelKey: 'sidebar.myComplaints' },
];

const officerLinks = [
  { to: '/officer/dashboard', icon: LayoutDashboard, labelKey: 'sidebar.dashboard' },
  { to: '/officer/map', icon: Map, labelKey: 'sidebar.mapView' },
  { to: '/officer/reports', icon: FileText, labelKey: 'sidebar.reports' },
];

const adminLinks = [
  { to: '/admin/dashboard', icon: LayoutDashboard, labelKey: 'sidebar.dashboard' },
  { to: '/admin/manage-officers', icon: Users, labelKey: 'sidebar.manageOfficers' },
  { to: '/admin/analytics', icon: BarChart3, labelKey: 'sidebar.analytics' },
  { to: '/admin/heatmap', icon: MapPin, labelKey: 'sidebar.heatmap' },
  { to: '/admin/reports', icon: FileText, labelKey: 'sidebar.reports' },
];

export default function Sidebar({ mobileOpen = false, onCloseMobile = () => {} }) {
  const { user } = useUser();
  const { t } = useTranslation();
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const role = user?.publicMetadata?.role || 'citizen';

  const links = role === 'admin' ? adminLinks : role === 'officer' ? officerLinks : citizenLinks;

  const sidebarBg = isDark
    ? 'bg-gradient-to-b from-slate-900 to-slate-800'
    : 'bg-white border-r border-slate-200';
  const logoBorder = isDark ? 'border-slate-700/50' : 'border-slate-200';
  const titleClass = isDark ? 'text-white' : 'text-slate-900';
  const subtitleClass = isDark ? 'text-slate-400' : 'text-slate-500';
  const panelLabelClass = isDark ? 'text-slate-500' : 'text-slate-400';
  const navDefaultClass = isDark
    ? 'text-slate-400 hover:text-white hover:bg-white/5'
    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100';
  const dividerClass = isDark ? 'border-slate-700/50' : 'border-slate-200';
  const collapseButtonClass = isDark ? 'text-slate-500 hover:text-slate-300' : 'text-slate-500 hover:text-slate-700';
  const closeButtonClass = isDark ? 'text-slate-300 hover:bg-white/10' : 'text-slate-600 hover:bg-slate-100';

  useEffect(() => {
    onCloseMobile();
  }, [location.pathname]);

  return (
    <>
      {/* Mobile overlay */}
      <div
        onClick={onCloseMobile}
        className={`lg:hidden fixed inset-0 z-30 bg-black/40 backdrop-blur-[1px] transition-opacity ${
          mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Desktop Sidebar */}
      <aside
        className={`${collapsed ? 'w-[72px]' : 'w-[260px]'} hidden lg:flex ${sidebarBg} min-h-screen flex-col transition-all duration-300 ease-in-out sticky top-0 h-screen z-20`}
      >
        {/* Logo */}
        <div
          className={`h-16 flex items-center gap-3 px-5 border-b cursor-pointer ${logoBorder}`}
          onClick={() => navigate('/')}
        >
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <Shield className="w-4.5 h-4.5 text-white" />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <h1 className={`text-sm font-bold tracking-tight ${titleClass}`}>PS-CRM</h1>
              <p className={`text-[10px] tracking-wide ${subtitleClass}`}>Smart Governance</p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {!collapsed && (
            <p className={`text-[10px] font-semibold uppercase tracking-wider px-3 mb-3 ${panelLabelClass}`}>
              {role === 'admin' ? t('sidebar.adminPanel') : role === 'officer' ? t('sidebar.officerPanel') : t('sidebar.citizenPanel')}
            </p>
          )}
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${isActive
                  ? 'bg-indigo-500/15 text-indigo-400'
                  : navDefaultClass
                }`
              }
            >
              <link.icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span>{t(link.labelKey)}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Collapse toggle */}
        <div className={`p-3 border-t ${dividerClass}`}>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={`w-full flex items-center justify-center py-2 transition-colors ${collapseButtonClass}`}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>
      </aside>

      {/* Mobile Drawer */}
      <aside
        className={`lg:hidden fixed inset-y-0 left-0 z-40 w-[86vw] max-w-[320px] ${sidebarBg} min-h-screen flex flex-col transform transition-transform duration-300 ease-out ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className={`h-16 flex items-center justify-between gap-3 px-4 border-b ${logoBorder}`}>
          <button
            className="flex items-center gap-3"
            onClick={() => {
              navigate('/');
              onCloseMobile();
            }}
          >
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <Shield className="w-4.5 h-4.5 text-white" />
            </div>
            <div className="overflow-hidden text-left">
              <h1 className={`text-sm font-bold tracking-tight ${titleClass}`}>PS-CRM</h1>
              <p className={`text-[10px] tracking-wide ${subtitleClass}`}>Smart Governance</p>
            </div>
          </button>

          <button
            onClick={onCloseMobile}
            className={`p-2 rounded-lg ${closeButtonClass}`}
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          <p className={`text-[10px] font-semibold uppercase tracking-wider px-3 mb-3 ${panelLabelClass}`}>
            {role === 'admin' ? t('sidebar.adminPanel') : role === 'officer' ? t('sidebar.officerPanel') : t('sidebar.citizenPanel')}
          </p>

          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 group ${isActive
                  ? 'bg-indigo-500/15 text-indigo-400'
                  : navDefaultClass
                }`
              }
            >
              <link.icon className="w-5 h-5 flex-shrink-0" />
              <span>{t(link.labelKey)}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}

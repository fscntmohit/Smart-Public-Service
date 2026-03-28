import { useUser, UserButton } from '@clerk/clerk-react';
import { Search, Menu, Moon, Sun } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import NotificationBell from './NotificationBell';

export default function Navbar({ onToggleSidebar = () => {} }) {
  const { user } = useUser();
  const { t, i18n } = useTranslation();
  const { isDark, toggleTheme } = useTheme();

  const toggleLanguage = () => {
    const nextLanguage = i18n.language === 'en' ? 'hi' : 'en';
    i18n.changeLanguage(nextLanguage);
    localStorage.setItem('pscrm_lang', nextLanguage);
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-3 sm:px-4 lg:px-6 sticky top-0 z-10">
      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="relative w-full max-w-[170px] sm:max-w-[260px] md:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder={t('navbar.search')}
            className="pl-10 pr-3 sm:pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 w-full transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4 pl-2">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          title={isDark ? 'Light mode' : 'Dark mode'}
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
        <button
          onClick={toggleLanguage}
          className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
        >
          {t('common.language')}
        </button>
        <NotificationBell />

        <div className="flex items-center gap-2 sm:gap-3 pl-2 sm:pl-4 border-l border-slate-200">
          <div className="text-right hidden md:block">
            <p className="text-sm font-medium text-slate-700">{user?.fullName || 'User'}</p>
            <p className="text-xs text-slate-500">{user?.publicMetadata?.role || 'citizen'}</p>
          </div>
          <UserButton
            appearance={{
              elements: {
                avatarBox: 'w-9 h-9',
              },
            }}
          />
        </div>
      </div>
    </header>
  );
}

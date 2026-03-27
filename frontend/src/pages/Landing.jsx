import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useUser, useClerk } from '@clerk/clerk-react';
import { Shield, ArrowRight, MapPin, BarChart3, Users, Zap, LayoutDashboard, BrainCircuit, Activity, ShieldCheck, Mail, Moon, Sun, FileText, Bot, CheckCircle2, User, Wrench, Building2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import HelpDropdown from '../components/HelpDropdown';
import Footer from '../components/ui/footer';

export default function Landing() {
  const { t, i18n } = useTranslation();
  const { isDark, toggleTheme } = useTheme();
  const { isSignedIn, user } = useUser();
  const role = user?.publicMetadata?.role || 'citizen';
  const { openSignIn } = useClerk();

  const [open, setOpen] = useState(false);

  const handleLogin = () => {
    openSignIn({ fallbackRedirectUrl: '/redirect' });
    setOpen(false);
  };

  const getDashboardLink = () => {
    if (role === 'admin') return '/admin/dashboard';
    if (role === 'officer') return '/officer/dashboard';
    return '/citizen/dashboard';
  };

  const features = [
    { icon: BrainCircuit, ...t('landing.features.items.0', { returnObjects: true }) },
    { icon: Users, ...t('landing.features.items.1', { returnObjects: true }) },
    { icon: Activity, ...t('landing.features.items.2', { returnObjects: true }) },
    { icon: MapPin, ...t('landing.features.items.3', { returnObjects: true }) },
    { icon: ShieldCheck, ...t('landing.features.items.4', { returnObjects: true }) },
    { icon: LayoutDashboard, ...t('landing.features.items.5', { returnObjects: true }) },
  ];

  const steps = [
    { icon: FileText, ...t('landing.howItWorks.steps.0', { returnObjects: true }) },
    { icon: Bot, ...t('landing.howItWorks.steps.1', { returnObjects: true }) },
    { icon: CheckCircle2, ...t('landing.howItWorks.steps.2', { returnObjects: true }) },
    { icon: BarChart3, ...t('landing.howItWorks.steps.3', { returnObjects: true }) },
  ];

  const toggleLanguage = () => {
    const nextLanguage = i18n.language === 'en' ? 'hi' : 'en';
    i18n.changeLanguage(nextLanguage);
    localStorage.setItem('pscrm_lang', nextLanguage);
  };

  const navClass = isDark
    ? 'fixed top-0 left-0 right-0 z-50 bg-slate-950/50 backdrop-blur-md border-b border-white/5'
    : 'fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200';
  const navLinkClass = isDark ? 'text-slate-400 hover:text-white transition-colors' : 'text-slate-600 hover:text-slate-900 transition-colors';
  const headingClass = isDark ? 'text-white' : 'text-slate-900';
  const bodyTextClass = isDark ? 'text-slate-400' : 'text-slate-600';
  const cardClass = isDark
    ? 'bg-white/5 backdrop-blur-md border border-white/10'
    : 'bg-white border border-slate-200 shadow-sm';

  return (
    <div className={`landing-page min-h-screen font-sans relative overflow-hidden selection:bg-indigo-500/30 w-full flex flex-col scroll-smooth ${isDark ? 'bg-slate-950 text-slate-300' : 'bg-slate-50 text-slate-700'}`}>

      {/* Premium Background Glow Effects */}
      <div className={`absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0 ${isDark ? '' : 'hidden'}`}>
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-indigo-600/20 blur-[120px] rounded-full"></div>
        <div className="absolute top-[20%] -right-[10%] w-[40%] h-[40%] bg-purple-600/20 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] left-[20%] w-[60%] h-[40%] bg-indigo-900/20 blur-[120px] rounded-full"></div>
      </div>

      {/* 1. NAVBAR */}
      <nav className={navClass}>
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">

          {/* Logo */}
          <Link to="/" onClick={() => window.scrollTo(0, 0)} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className={`text-lg font-bold tracking-tight ${headingClass}`}>PS-CRM</span>
          </Link>

          {/* Nav Links (Center) */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium">
            <a href="#about" className={navLinkClass}>{t('landing.nav.about')}</a>
            <a href="#features" className={navLinkClass}>{t('landing.nav.features')}</a>
            <a href="#how-it-works" className={navLinkClass}>{t('landing.nav.howItWorks')}</a>
            <Link to="/track" className={navLinkClass}>{t('landing.nav.track')}</Link>
          </div>

          {/* Right Action */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <HelpDropdown dark={isDark} />
            <button
              onClick={toggleTheme}
              className={`${isDark ? 'bg-white/10 hover:bg-white/15 text-white border-white/10' : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'} p-2 rounded-lg border`}
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              title={isDark ? 'Light mode' : 'Dark mode'}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              onClick={toggleLanguage}
              className={`${isDark ? 'bg-white/10 hover:bg-white/15 text-white border-white/10' : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'} px-3 py-1.5 rounded-lg text-xs font-semibold border`}
            >
              {t('common.language')}
            </button>
            {isSignedIn ? (
              <Link
                to={getDashboardLink()}
                className={`${isDark ? 'bg-white/10 hover:bg-white/15 text-white border-white/5' : 'bg-slate-900 hover:bg-slate-800 text-white border-slate-900'} px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-colors border flex items-center gap-2`}
              >
                {t('common.dashboard')} <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <button
                onClick={() => setOpen(true)}
                className="px-3 sm:px-4 py-1.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-500 transition-colors shadow-sm"
              >
                {t('landing.nav.signIn')}
              </button>
            )}
          </div>
        </div>
      </nav>

      <main className="flex-1 relative z-10 pt-32 pb-20 scroll-smooth">

        {/* 2. HERO SECTION */}
        <section className="max-w-4xl mx-auto px-6 text-center mt-12 mb-20 animate-fade-in-up">
          <h1 className={`text-5xl md:text-7xl font-extrabold leading-tight tracking-tight mb-8 ${headingClass}`}>
            {t('landing.heroTitle1')} <br className="hidden md:block" />
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent pb-2 block">
              {t('landing.heroTitle2')}
            </span>
          </h1>

          <p className={`text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mb-10 ${bodyTextClass}`}>
            {t('landing.heroDesc')}
          </p>

          <div className="flex items-center justify-center gap-4">
            {isSignedIn ? (
              <Link to={getDashboardLink()} className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium transition-all hover:scale-[1.02] flex items-center gap-2 shadow-lg shadow-indigo-600/20">
                {t('landing.openDashboard')} <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <button onClick={() => setOpen(true)} className="px-6 py-3 bg-white text-slate-900 hover:bg-slate-100 rounded-lg font-medium transition-all hover:scale-[1.02] flex items-center gap-2">
                {t('landing.getStarted')} <ArrowRight className="w-4 h-4" />
              </button>
            )}
            <Link to="/track" className={`px-6 py-3 border rounded-lg font-medium transition-all ${isDark ? 'border-white/15 text-white hover:bg-white/10' : 'border-slate-300 text-slate-800 hover:bg-slate-100'}`}>
              {t('landing.trackComplaint')}
            </Link>
          </div>
        </section>

        {/* 3. TRUST STRIP */}
        <section className={`max-w-3xl mx-auto px-6 mb-32 border-y py-6 ${isDark ? 'border-white/5' : 'border-slate-200'}`}>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 text-sm font-medium text-slate-400">
            <div className="flex items-center gap-2 tracking-wide"><Zap className="w-4 h-4 text-indigo-400" /> {t('landing.trust.ai')}</div>
            <div className="flex items-center gap-2 tracking-wide"><MapPin className="w-4 h-4 text-purple-400" /> {t('landing.trust.geo')}</div>
            <div className="flex items-center gap-2 tracking-wide"><BarChart3 className="w-4 h-4 text-pink-400" /> {t('landing.trust.analytics')}</div>
          </div>
        </section>

        {/* ABOUT SECTION */}
        <section id="about" className="max-w-6xl mx-auto px-6 mb-32 pt-16">
          <div className="text-center mb-12">
            <h2 className={`text-3xl md:text-4xl font-bold mb-4 tracking-tight ${headingClass}`}>{t('landing.about.title')}</h2>
            <p className={`text-lg max-w-2xl mx-auto leading-relaxed ${bodyTextClass}`}>
              {t('landing.about.desc')}
            </p>
          </div>
        </section>

        {/* 4. FEATURES SECTION */}
        <section id="features" className="max-w-6xl mx-auto px-6 mb-32 pt-16">
          <div className="text-center mb-16">
            <h2 className={`text-3xl md:text-4xl font-bold mb-4 tracking-tight ${headingClass}`}>{t('landing.features.title')}</h2>
            <p className={`text-lg max-w-xl mx-auto ${bodyTextClass}`}>{t('landing.features.subtitle')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div key={idx} className={`${cardClass} rounded-2xl p-6 ${isDark ? 'hover:bg-white/10' : 'hover:bg-slate-50'} transition-all duration-300`}>
                  <div className="w-10 h-10 bg-indigo-500/20 text-indigo-400 rounded-xl flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className={`font-semibold text-lg mb-2 ${headingClass}`}>{feat.title}</h3>
                  <p className={`text-sm leading-relaxed ${bodyTextClass}`}>{feat.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* 5. HOW IT WORKS */}
        <section id="how-it-works" className="max-w-6xl mx-auto px-6 mb-32 pt-16">
          <div className="text-center mb-16">
            <h2 className={`text-3xl md:text-4xl font-bold mb-4 tracking-tight ${headingClass}`}>{t('landing.howItWorks.title')}</h2>
            <p className={`text-lg max-w-xl mx-auto ${bodyTextClass}`}>{t('landing.howItWorks.subtitle')}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            {/* Connecting Line (Desktop) */}
            <div className="hidden lg:block absolute top-[28px] left-[10%] w-[80%] h-[1px] bg-gradient-to-r from-indigo-500/0 via-indigo-500/30 to-indigo-500/0 -z-10"></div>

            {steps.map((step, idx) => (
              <div key={idx} className="flex flex-col items-center text-center p-4">
                {(() => {
                  const StepIcon = step.icon;
                  return (
                <div className={`w-14 h-14 border rounded-2xl flex items-center justify-center text-2xl mb-6 relative z-10 hover:scale-[1.05] transition-transform duration-300 ${isDark ? 'bg-slate-900 border-white/10 shadow-xl shadow-black/50' : 'bg-white border-slate-200 shadow-sm'}`}>
                  <StepIcon className="w-6 h-6 text-indigo-500" />
                </div>
                  );
                })()}
                <h3 className={`font-semibold mb-2 ${headingClass}`}>{step.title}</h3>
                <p className={`text-sm leading-relaxed ${bodyTextClass}`}>{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 6. CTA SECTION */}
        <section className="max-w-4xl mx-auto px-6 mb-24 pt-16">
          <div className={`backdrop-blur-md border rounded-3xl p-12 text-center relative overflow-hidden flex flex-col items-center ${isDark ? 'bg-gradient-to-b from-indigo-900/40 to-slate-900/40 border-indigo-500/20' : 'bg-white border-slate-200 shadow-sm'}`}>
            {/* Inner glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-indigo-500/20 blur-[80px] rounded-full z-0 pointer-events-none"></div>

            <h2 className={`text-3xl md:text-5xl font-bold mb-6 relative z-10 tracking-tight ${headingClass}`}>
              {t('landing.cta.title')}
            </h2>
            <p className={`mb-8 max-w-lg mx-auto relative z-10 ${bodyTextClass}`}>
              {t('landing.cta.desc')}
            </p>
            <button
              onClick={() => {
                if (!isSignedIn) setOpen(true);
              }}
              className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium transition-all hover:scale-[1.02] relative z-10 shadow-lg shadow-indigo-600/20"
            >
              {t('landing.cta.button')}
            </button>
          </div>
        </section>

        {/* CONTACT SECTION */}
        <section id="contact" className="max-w-4xl mx-auto px-6 mb-24 pt-16">
          <div className={`${cardClass} rounded-3xl p-8 md:p-12 text-center`}>
            <h2 className={`text-3xl font-bold mb-4 ${headingClass}`}>{t('landing.contact.title')}</h2>
            <p className={`mb-8 max-w-lg mx-auto ${bodyTextClass}`}>
              {t('landing.contact.desc')}
            </p>
            <a href="mailto:support@ps-crm.com" className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${isDark ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-slate-900 hover:bg-slate-800 text-white'}`}>
              <Mail className="w-5 h-5" /> {t('landing.contact.support')}
            </a>
          </div>
        </section>

        {/* PRIVACY & TERMS SECTIONS */}
        <section id="privacy" className="max-w-4xl mx-auto px-6 mb-16 pt-16 text-center">
          <h2 className={`text-2xl font-bold mb-4 ${headingClass}`}>{t('landing.privacy.title')}</h2>
          <p className={`text-sm max-w-2xl mx-auto leading-relaxed ${bodyTextClass}`}>
            {t('landing.privacy.desc')}
          </p>
        </section>

        <section id="terms" className="max-w-4xl mx-auto px-6 mb-16 pt-16 text-center">
          <h2 className={`text-2xl font-bold mb-4 ${headingClass}`}>{t('landing.terms.title')}</h2>
          <p className={`text-sm max-w-2xl mx-auto leading-relaxed ${bodyTextClass}`}>
            {t('landing.terms.desc')}
          </p>
        </section>

      </main>

      <Footer />

      {/* Role Selection Modal */}
      {open && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] animate-in fade-in duration-200">
          <div className={`${isDark ? 'bg-slate-900/90 border-white/10' : 'bg-white border-slate-200'} border rounded-2xl p-6 w-[350px] shadow-2xl relative`}>
            <h2 className={`text-xl font-bold mb-5 ${headingClass}`}>
              {t('landing.roleModal.title')}
            </h2>

            <div className="space-y-3">
              <button
                onClick={handleLogin}
                className={`w-full text-left p-4 rounded-xl transition font-medium flex items-center justify-between group cursor-pointer ${isDark ? 'bg-white/5 border border-white/10 hover:bg-white/10 text-slate-200' : 'bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-800'}`}
              >
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-indigo-500" /> {t('landing.roleModal.citizen')}
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
              </button>

              <button
                onClick={handleLogin}
                className={`w-full text-left p-4 rounded-xl transition font-medium flex items-center justify-between group cursor-pointer ${isDark ? 'bg-white/5 border border-white/10 hover:bg-white/10 text-slate-200' : 'bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-800'}`}
              >
                <div className="flex items-center gap-3">
                  <Wrench className="w-5 h-5 text-indigo-500" /> {t('landing.roleModal.officer')}
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
              </button>

              <button
                onClick={handleLogin}
                className={`w-full text-left p-4 rounded-xl transition font-medium flex items-center justify-between group cursor-pointer ${isDark ? 'bg-white/5 border border-white/10 hover:bg-white/10 text-slate-200' : 'bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-800'}`}
              >
                <div className="flex items-center gap-3">
                  <Building2 className="w-5 h-5 text-indigo-500" /> {t('landing.roleModal.admin')}
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
              </button>
            </div>

            <button
              onClick={() => setOpen(false)}
              className={`mt-6 text-sm transition-colors w-full text-center font-medium cursor-pointer ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}
            >
              {t('landing.roleModal.cancel')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

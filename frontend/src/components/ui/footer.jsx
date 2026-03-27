import { motion, useReducedMotion } from 'framer-motion';
import { Building2, Globe, Link2, MapPinned, MessagesSquare, Share2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const platformLinks = [
  { label: 'Dashboard', path: '/redirect' },
  { label: 'Submit Complaint', path: '/citizen/dashboard' },
  { label: 'Track Complaint', path: '/track' },
  { label: 'Analytics', path: '/admin/analytics' },
  { label: 'Map View', path: '/officer/map' },
];

const helpLinks = [
  { label: 'FAQs', path: '/help/faq' },
  { label: 'Citizen Help Video', path: '/help/video' },
  { label: 'Contact Us', path: '/help/contact' },
];

const systemLinks = [
  { label: 'About PS-CRM', sectionId: 'about' },
  { label: 'Privacy Policy', sectionId: 'privacy' },
  { label: 'Terms & Conditions', sectionId: 'terms' },
];

const socialLinks = [
  { label: 'LinkedIn', icon: Globe },
  { label: 'Twitter', icon: Share2 },
  { label: 'Facebook', icon: MessagesSquare },
  { label: 'Instagram', icon: Link2 },
];

function FooterLinkButton({ label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full block text-left text-sm text-slate-600 hover:text-slate-900 transition-colors py-0.5"
    >
      {label}
    </button>
  );
}

export default function Footer() {
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();

  const navigateToSection = (sectionId) => {
    navigate('/');
    setTimeout(() => {
      const target = document.getElementById(sectionId);
      target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
  };

  const sectionVariants = reduceMotion
    ? {}
    : {
        hidden: { opacity: 0, y: 8 },
        show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
      };

  return (
    <footer className="bg-slate-100 border-t border-slate-200 mt-16">
      <motion.div
        initial={reduceMotion ? false : 'hidden'}
        whileInView={reduceMotion ? undefined : 'show'}
        viewport={{ once: true, amount: 0.25 }}
        variants={sectionVariants}
        className="max-w-7xl mx-auto px-6 py-12"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
                <Building2 className="w-4 h-4" />
              </div>
              <p className="text-lg font-semibold text-slate-900">PS-CRM</p>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              Bridging Citizens & Governance
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-3">Platform</h3>
            <div className="space-y-2">
              {platformLinks.map((item) => (
                <FooterLinkButton key={item.label} label={item.label} onClick={() => navigate(item.path)} />
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-3">Help & Support</h3>
            <div className="space-y-2">
              {helpLinks.map((item) => (
                <FooterLinkButton key={item.label} label={item.label} onClick={() => navigate(item.path)} />
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-3">System</h3>
            <div className="space-y-2">
              {systemLinks.map((item) => (
                <FooterLinkButton key={item.label} label={item.label} onClick={() => navigateToSection(item.sectionId)} />
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-3">Social</h3>
            <div className="flex items-center gap-2 mb-3">
              {socialLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.label}
                    type="button"
                    className="w-9 h-9 rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors flex items-center justify-center"
                    title={item.label}
                    aria-label={item.label}
                  >
                    <Icon className="w-4 h-4" />
                  </button>
                );
              })}
            </div>
            <div className="inline-flex items-center gap-1 text-xs text-slate-500">
              <MapPinned className="w-3.5 h-3.5" /> Smart Public Service Platform
            </div>
          </div>
        </div>

        <div className="mt-10 pt-5 border-t border-slate-200 text-xs text-slate-600">
          © 2026 PS-CRM • Smart Public Service Platform
        </div>
      </motion.div>
    </footer>
  );
}

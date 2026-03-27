import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, FileText, CalendarDays, MapPin, Flag, CircleDot, Moon, Sun } from 'lucide-react';
import { trackComplaintById } from '../services/complaintService';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';

const statusStyles = {
  Pending: 'bg-amber-100 text-amber-700 border border-amber-200',
  'In Progress': 'bg-blue-100 text-blue-700 border border-blue-200',
  Resolved: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
};

const timelineSteps = ['Pending', 'In Progress', 'Resolved'];

export default function TrackComplaintPublic() {
  const { t, i18n } = useTranslation();
  const { isDark, toggleTheme } = useTheme();
  const [searchParams] = useSearchParams();
  const presetId = searchParams.get('complaintId') || '';

  const [complaintId, setComplaintId] = useState(presetId);
  const [loading, setLoading] = useState(false);
  const [complaint, setComplaint] = useState(null);
  const [notFound, setNotFound] = useState(false);

  const statusLabel = {
    Pending: t('status.pending'),
    'In Progress': t('status.inProgress'),
    Resolved: t('status.resolved'),
  };

  const timeline = [
    { key: 'Pending', label: t('status.pending') },
    { key: 'In Progress', label: t('status.inProgress') },
    { key: 'Resolved', label: t('status.resolved') },
  ];

  const currentStep = useMemo(() => {
    if (!complaint?.status) return 0;
    return Math.max(0, timelineSteps.indexOf(complaint.status));
  }, [complaint]);

  const toggleLanguage = () => {
    const nextLanguage = i18n.language === 'en' ? 'hi' : 'en';
    i18n.changeLanguage(nextLanguage);
    localStorage.setItem('pscrm_lang', nextLanguage);
  };

  const handleTrack = async () => {
    if (!complaintId.trim()) {
      toast.error(t('track.enterIdError'));
      return;
    }

    setLoading(true);
    setNotFound(false);

    try {
      const { data } = await trackComplaintById(complaintId.trim());
      setComplaint(data);
    } catch (error) {
      setComplaint(null);
      if (error?.response?.status === 404) {
        setNotFound(true);
      } else {
        toast.error(t('track.notFound'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-14 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-slate-900">{t('track.title')}</h1>
            <div className="flex items-center gap-3">
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
              <Link to="/" className="text-sm font-semibold text-indigo-600 hover:text-indigo-700">{t('common.backToHome')}</Link>
            </div>
          </div>
          <p className="text-sm text-slate-500 mt-1">{t('track.subtitle')}</p>

          <div className="mt-5 flex flex-col sm:flex-row gap-2">
            <input
              value={complaintId}
              onChange={(e) => setComplaintId(e.target.value.toUpperCase())}
              placeholder={t('track.inputPlaceholder')}
              className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            />
            <button
              onClick={handleTrack}
              disabled={loading}
              className="px-5 py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 disabled:opacity-70 flex items-center justify-center gap-2"
            >
              <Search className="w-4 h-4" />
              {loading ? t('track.tracking') : t('track.track')}
            </button>
          </div>

          {notFound && (
            <div className="mt-5 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 px-4 py-3 text-sm">
              {t('track.notFound')}
            </div>
          )}

          {complaint && (
            <div className="mt-6 space-y-5">
              <div className="rounded-xl border border-slate-200 p-4 bg-slate-50">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    <p className="text-xs font-semibold text-slate-500">{t('track.complaintId')}</p>
                    <p className="text-lg font-bold text-slate-900">{complaint.complaintId}</p>
                  </div>
                  <span className={`px-3 py-1 text-xs rounded-full font-semibold ${statusStyles[complaint.status] || statusStyles.Pending}`}>
                    {statusLabel[complaint.status] || complaint.status}
                  </span>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <InfoRow icon={FileText} label={t('track.titleLabel')} value={complaint.title} />
                <InfoRow icon={Flag} label={t('track.category')} value={complaint.category} />
                <InfoRow icon={CircleDot} label={t('track.priority')} value={complaint.priority} />
                <InfoRow icon={MapPin} label={t('track.area')} value={complaint.area || 'N/A'} />
                <InfoRow
                  icon={CalendarDays}
                  label={t('track.date')}
                  value={complaint.createdAt ? new Date(complaint.createdAt).toLocaleString() : 'N/A'}
                />
              </div>

              <div className="rounded-xl border border-slate-200 p-4">
                <p className="text-xs font-semibold text-slate-500 mb-2">{t('track.description')}</p>
                <p className="text-sm text-slate-700 whitespace-pre-wrap">{complaint.description}</p>
              </div>

              <div className="rounded-xl border border-slate-200 p-4">
                <p className="text-xs font-semibold text-slate-500 mb-4">{t('track.timeline')}</p>
                <div className="grid grid-cols-3 gap-2">
                  {timeline.map((step, idx) => {
                    const active = idx <= currentStep;
                    return (
                      <div key={step.key} className={`text-center rounded-lg p-2 text-xs font-semibold ${active ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                        {step.label}
                      </div>
                    );
                  })}
                </div>
              </div>

              {(complaint.proofImage || complaint.proofVideo) && (
                <div className="rounded-xl border border-slate-200 p-4 space-y-3">
                  <p className="text-xs font-semibold text-slate-500">{t('track.proof')}</p>
                  {complaint.proofImage && (
                    <img src={complaint.proofImage} alt="Resolution proof" className="w-full max-h-72 object-cover rounded-lg border border-slate-200" />
                  )}
                  {complaint.proofVideo && (
                    <video controls className="w-full rounded-lg border border-slate-200">
                      <source src={complaint.proofVideo} />
                      {t('track.noVideo')}
                    </video>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="rounded-xl border border-slate-200 p-3 bg-white">
      <p className="text-xs text-slate-500 flex items-center gap-1"><Icon className="w-3.5 h-3.5" /> {label}</p>
      <p className="text-sm font-semibold text-slate-800 mt-1">{value}</p>
    </div>
  );
}

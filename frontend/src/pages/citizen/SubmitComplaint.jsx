import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, MapPin, AlertCircle, CheckCircle2 } from 'lucide-react';
import { createComplaint } from '../../services/complaintService';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

import ImageUpload from '../../components/complaint/ImageUpload';
import CategorySelector from '../../components/complaint/CategorySelector';
import LocationMap from '../../components/complaint/LocationMap';

const FALLBACK_AREAS = ['Alpha 1', 'Alpha 2', 'Beta 1', 'Beta 2', 'Gamma 1'];

export default function SubmitComplaint() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState('');
  const [addressLoading, setAddressLoading] = useState(false);
  const [submittedComplaintId, setSubmittedComplaintId] = useState('');
  const [imageError, setImageError] = useState('');
  const [formError, setFormError] = useState('');

  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    area: '',
    latitude: null,
    longitude: null,
    image: '',
    priority: '',
  });

  // Reverse Geocoding
  const fetchAddress = async (lat, lon) => {
    setAddressLoading(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`);
      const data = await res.json();
      if (data && data.display_name) {
        setForm(f => ({ ...f, area: data.display_name }));
      }
    } catch (err) {
      console.error('Failed to get address', err);
    } finally {
      setAddressLoading(false);
    }
  };

  const captureGPS = useCallback(() => {
    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser');
      toast.error('Geolocation not supported');
      return;
    }

    setGpsLoading(true);
    setGpsError('');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        setForm((f) => ({ ...f, latitude: lat, longitude: lon }));
        setGpsLoading(false);
        fetchAddress(lat, lon);
        toast.success('Location captured successfully!');
      },
      (err) => {
        setGpsLoading(false);
        setGpsError('Please allow location access to map the issue precisely.');
        toast.error('Location access denied');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  // Fetch GPS on load
  useEffect(() => {
    captureGPS();
  }, [captureGPS]);

  // Map marker drag handler
  const handleLocationChange = (lat, lon) => {
    setForm(f => ({ ...f, latitude: lat, longitude: lon }));
    fetchAddress(lat, lon);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRefreshGPS = () => {
    captureGPS();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title.trim()) {
      setFormError('Report title is required');
      toast.error('Report title is required');
      return;
    }
    if (!form.category) {
      setFormError('Please select issue category');
      toast.error('Issue category is required');
      return;
    }
    if (!form.priority) {
      setFormError('Please select priority level');
      toast.error('Priority level is required');
      return;
    }
    if (!form.latitude && !form.area) {
      setFormError('Pinpoint location is required');
      toast.error('Pinpoint location is required');
      return;
    }
    if (!form.image) {
      setImageError('Please upload or capture an image');
      toast.error('Image is required');
      return;
    }

    setFormError('');
    setLoading(true);
    try {
      const { data } = await createComplaint(form);
      if (data?.complaintId) {
        setSubmittedComplaintId(data.complaintId);
      }
      toast.success('Complaint submitted successfully!');

      // Clear form
      setForm({
        title: '', description: '', category: '', area: '',
        latitude: null, longitude: null, image: '', priority: '',
      });
      setImageError('');
    } catch (err) {
      toast.error('Failed to submit complaint');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto pb-10">
      {submittedComplaintId && (
        <div className="fixed inset-0 z-[120] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 text-center">
            <div className="mx-auto mb-3 w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Complaint Submitted Successfully</h2>
            <p className="text-sm text-slate-600 mt-2">{t('track.complaintId')}:</p>
            <p className="mt-1 text-lg font-extrabold text-indigo-600 tracking-wide">{submittedComplaintId}</p>
            <p className="text-sm text-slate-500 mt-2">Save this ID to track your complaint.</p>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setSubmittedComplaintId('');
                  navigate('/citizen/complaints');
                }}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors"
              >
                {t('sidebar.myComplaints')}
              </button>
              <button
                type="button"
                onClick={() => setSubmittedComplaintId('')}
                className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200 transition-colors"
              >
                {t('common.close')}
              </button>
            </div>
          </div>
        </div>
      )}
      <form onSubmit={handleSubmit} className="bg-white sm:rounded-2xl sm:shadow-md overflow-hidden border-x border-b sm:border border-slate-200/60">

        {/* Banner Image Upload */}
        <ImageUpload
          image={form.image}
          error={imageError}
          onError={setImageError}
          onImageChange={(img) => {
            setForm({ ...form, image: img });
            if (img) setImageError('');
          }}
        />

        <div className="p-4 sm:p-6 space-y-6">

          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{t('submit.reportIssue')}</h1>
            <p className="text-sm text-slate-500">{t('submit.helper')}</p>
          </div>

          {/* Title Box */}
          <div>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder={t('submit.titlePlaceholder')}
              className="w-full text-lg font-medium text-slate-900 placeholder:text-slate-400 border-0 border-b-2 border-slate-100 focus:border-indigo-500 focus:ring-0 px-0 py-2 transition-colors bg-transparent"
              required
            />
          </div>

          {/* Category Selector */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-3">{t('submit.issueType')} <span className="text-rose-500">*</span></label>
            <CategorySelector
              value={form.category}
              onChange={(cat) => {
                setForm({ ...form, category: cat });
                setFormError('');
              }}
            />
          </div>

          {/* Map & Location */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-semibold text-slate-700">{t('submit.pinpointLocation')} <span className="text-rose-500">*</span></label>
              <button
                type="button"
                onClick={handleRefreshGPS}
                disabled={gpsLoading}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
              >
                {gpsLoading ? (
                  <span className="animate-spin w-3 h-3 border-2 border-indigo-600 border-t-transparent rounded-full mr-1"></span>
                ) : (
                  <MapPin className="w-3.5 h-3.5" />
                )}
                {gpsLoading ? t('submit.locating') : t('submit.refreshGps')}
              </button>
            </div>

            <LocationMap
              latitude={form.latitude}
              longitude={form.longitude}
              onLocationChange={handleLocationChange}
            />

            {/* Address / Fallback */}
            {gpsError ? (
              <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl border border-red-100 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <div className="w-full">
                  <p className="font-medium mb-1">{gpsError}</p>
                  <select
                    name="area"
                    value={form.area}
                    onChange={handleChange}
                    className="w-full bg-white border border-red-200 text-slate-800 text-sm rounded-lg focus:ring-red-500 focus:border-red-500 block p-2"
                  >
                    <option value="">Select your Sector manually</option>
                    {FALLBACK_AREAS.map((a) => (
                      <option key={a} value={a}>{a}</option>
                    ))}
                  </select>
                </div>
              </div>
            ) : (
              <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl flex items-start gap-3">
                <MapPin className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-0.5">Detected Address</p>
                  {addressLoading ? (
                    <div className="h-4 bg-slate-200 rounded animate-pulse w-3/4"></div>
                  ) : (
                    <p className="text-sm text-slate-700 truncate font-medium">
                      {form.area || t('submit.dragHint')}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">{t('submit.additionalDetails')}</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={4}
              placeholder={t('submit.additionalPlaceholder')}
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl focus:ring-indigo-500 focus:border-indigo-500 block p-3.5 transition-all shadow-sm placeholder:text-slate-400 resize-none leading-relaxed"
            />
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">{t('submit.priority')} <span className="text-rose-500">*</span></label>
            <div className="flex bg-slate-100 p-1 rounded-xl">
              {['Low', 'Medium', 'High'].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => {
                    setForm({ ...form, priority: p });
                    setFormError('');
                  }}
                  className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${form.priority === p
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                    }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Submit */}
          {formError && <p className="text-rose-600 text-sm">{formError}</p>}
          <div className="pt-4">
            <button
              type="submit"
              disabled={loading || !form.title.trim() || !form.category || !form.priority || (!form.latitude && !form.area) || !form.image}
              className="w-full relative flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 text-white font-semibold rounded-xl py-3.5 transition-all hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  {t('submit.submitting')}
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  {t('submit.submit')}
                </>
              )}
            </button>
          </div>

        </div>
      </form>
    </div>
  );
}

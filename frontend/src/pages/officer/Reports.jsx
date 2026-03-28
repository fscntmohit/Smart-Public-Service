import { useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { BarChart3, Download, CalendarDays, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import { downloadReportPdf } from '../../services/reportService';

const parseFilenameFromDisposition = (contentDisposition, fallbackName) => {
  if (!contentDisposition) return fallbackName;
  const match = contentDisposition.match(/filename\*=UTF-8''([^;]+)|filename="?([^";]+)"?/i);
  return decodeURIComponent(match?.[1] || match?.[2] || fallbackName);
};

const getApiErrorMessage = async (error) => {
  const data = error?.response?.data;

  if (data instanceof Blob) {
    try {
      const text = await data.text();
      const parsed = JSON.parse(text);
      return parsed?.error || parsed?.message || null;
    } catch (_) {
      return null;
    }
  }

  return data?.error || data?.message || null;
};

export default function Reports() {
  const { getToken } = useAuth();
  const [loadingType, setLoadingType] = useState('');

  const downloadReport = async (type) => {
    setLoadingType(type);
    try {
      const token = await getToken();
      const config = token
        ? { headers: { Authorization: `Bearer ${token}` } }
        : {};

      const response = await downloadReportPdf(type, config);
      const fileName = parseFilenameFromDisposition(
        response.headers['content-disposition'],
        `${type}-report.pdf`
      );

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = fileName;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.URL.revokeObjectURL(url);

      toast.success(`${type === 'weekly' ? 'Weekly' : 'Monthly'} report downloaded`);
    } catch (error) {
      const message = await getApiErrorMessage(error);
      toast.error(message || 'Failed to download report');
    } finally {
      setLoadingType('');
    }
  };

  return (
    <div className="slide-up space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-indigo-600" /> Reports
        </h1>
        <p className="text-sm text-slate-500 mt-1">Download your assigned complaint analytics in PDF format.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-5">
          <p className="text-xs uppercase tracking-wide text-slate-500">Scope</p>
          <p className="text-lg font-semibold text-slate-800 mt-1">My Assigned Complaints</p>
        </div>
        <div className="card p-5">
          <p className="text-xs uppercase tracking-wide text-slate-500">Includes</p>
          <p className="text-lg font-semibold text-slate-800 mt-1">Status, Priority, Category Analytics</p>
        </div>
        <div className="card p-5">
          <p className="text-xs uppercase tracking-wide text-slate-500">Format</p>
          <p className="text-lg font-semibold text-slate-800 mt-1">PDF (.pdf)</p>
        </div>
      </div>

      <div className="card p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-slate-800">
          <FileText className="w-5 h-5 text-indigo-600" /> Reports
        </h2>

        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => downloadReport('weekly')}
            disabled={loadingType !== ''}
            className="btn-primary inline-flex items-center gap-2 disabled:opacity-60"
          >
            {loadingType === 'weekly' ? (
              <>
                <Download className="w-4 h-4 animate-pulse" /> Preparing Weekly...
              </>
            ) : (
              <>
                <CalendarDays className="w-4 h-4" /> Download Weekly Report
              </>
            )}
          </button>

          <button
            onClick={() => downloadReport('monthly')}
            disabled={loadingType !== ''}
            className="btn-secondary inline-flex items-center gap-2 disabled:opacity-60"
          >
            {loadingType === 'monthly' ? (
              <>
                <Download className="w-4 h-4 animate-pulse" /> Preparing Monthly...
              </>
            ) : (
              <>
                <CalendarDays className="w-4 h-4" /> Download Monthly Report
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

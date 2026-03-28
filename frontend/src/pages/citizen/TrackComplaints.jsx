import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { FileText } from 'lucide-react';
import { getMyComplaints } from '../../services/complaintService';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import toast from 'react-hot-toast';

export default function TrackComplaints() {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const formatDate = (date) => new Date(date).toLocaleString();

  const statusUpdates = useMemo(() => {
    return complaints
      .flatMap((complaint) =>
        (complaint.updates || []).map((update, index) => ({
          id: `${complaint._id}-${index}`,
          complaintId: complaint.complaintId,
          title: complaint.title,
          message: update.message,
          status: update.status,
          timestamp: update.timestamp,
        }))
      )
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }, [complaints]);

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    loadComplaints();
  }, [isLoaded, isSignedIn]);

  const loadComplaints = async () => {
    setLoading(true);
    try {
      const token = await getToken();
      if (!token) {
        setLoading(false);
        return;
      }

      const complaintsRes = await getMyComplaints({
        headers: { Authorization: `Bearer ${token}` },
      });
      setComplaints(complaintsRes.data);
    } catch (err) {
      toast.error('Failed to load complaints', { id: 'load-complaints-error' });
    } finally {
      setLoading(false);
    }
  };

  const filtered = filter === 'all'
    ? complaints
    : complaints.filter((c) => c.status === filter);

  if (loading) return <Spinner />;

  return (
    <div className="slide-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">My Complaints</h1>
          <p className="text-sm text-slate-500 mt-1">{complaints.length} total complaints</p>
        </div>
        <div className="flex items-center gap-2">
          {['all', 'Pending', 'In Progress', 'Resolved'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === f
                  ? 'bg-indigo-500 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
            >
              {f === 'all' ? 'All' : f}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No complaints found"
          description={filter === 'all' ? "You haven't submitted any complaints yet." : `No ${filter} complaints.`}
          icon={FileText}
        />
      ) : (
        <div className="grid lg:grid-cols-3 gap-4 items-start">
          <div className="lg:col-span-2 grid gap-4">
            {filtered.map((c) => (
              <Link
                key={c._id}
                to={`/citizen/complaint/${c._id}`}
                className="card p-5 hover:shadow-md transition-all duration-200 group block"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors truncate">
                        {c.title}
                      </h3>
                      <Badge variant={c.status}>{c.status}</Badge>
                      <Badge variant={c.priority}>{c.priority}</Badge>
                    </div>
                    <p className="text-sm text-slate-500 line-clamp-2 mb-3">{c.description}</p>
                    <p className="text-sm text-slate-500 flex flex-wrap gap-2 items-center">
                      <span className="px-2 py-1 text-xs font-medium bg-indigo-50 text-indigo-600 rounded-md">
                        🆔 {c.complaintId || 'N/A'}
                      </span>
                      <span>• {c.category}</span>
                      <span>• {c.area || 'N/A'}</span>
                      <span>• {new Date(c.createdAt).toLocaleDateString()}</span>
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="card p-4">
            <h2 className="text-sm font-semibold text-slate-700 mb-3">📢 Status Updates</h2>
            {statusUpdates.length === 0 ? (
              <p className="text-sm text-slate-500">No updates yet.</p>
            ) : (
              <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                {statusUpdates.slice(0, 12).map((u) => (
                  <div key={u.id} className="rounded-lg border border-slate-200 bg-white px-3 py-2">
                    <p className="text-xs text-slate-400">{formatDate(u.timestamp)}</p>
                    <p className="text-sm text-slate-700 leading-snug mt-0.5">{u.message}</p>
                    <p className="text-xs text-indigo-600 mt-1">
                      {u.complaintId} • {u.status}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

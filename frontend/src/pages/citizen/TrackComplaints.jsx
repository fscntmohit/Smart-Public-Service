import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText } from 'lucide-react';
import { getMyComplaints } from '../../services/complaintService';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import toast from 'react-hot-toast';

export default function TrackComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadComplaints();
  }, []);

  const loadComplaints = async () => {
    try {
      const { data } = await getMyComplaints();
      setComplaints(data);
    } catch (err) {
      toast.error('Failed to load complaints');
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
        <div className="grid gap-4">
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
      )}
    </div>
  );
}

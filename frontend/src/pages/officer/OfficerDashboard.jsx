import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ClipboardList, Filter, Clock } from 'lucide-react';
import { getOfficerComplaints } from '../../services/complaintService';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import StatCard from '../../components/ui/StatCard';
import toast from 'react-hot-toast';

export default function OfficerDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  useEffect(() => {
    loadComplaints();
  }, [statusFilter, priorityFilter]);

  const loadComplaints = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (priorityFilter) params.priority = priorityFilter;
      const { data } = await getOfficerComplaints(params);
      setComplaints(data);
    } catch (err) {
      toast.error('Failed to load complaints');
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    total: complaints.length,
    pending: complaints.filter((c) => c.status === 'Pending').length,
    inProgress: complaints.filter((c) => c.status === 'In Progress').length,
    resolved: complaints.filter((c) => c.status === 'Resolved').length,
  };

  return (
    <div className="slide-up">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">My Assigned Complaints</h1>
        <p className="text-sm text-slate-500 mt-1">Manage and resolve complaints in your area</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard title="Total Assigned" value={stats.total} icon={ClipboardList} color="indigo" />
        <StatCard title="Pending" value={stats.pending} icon={Clock} color="amber" />
        <StatCard title="In Progress" value={stats.inProgress} icon={Filter} color="sky" />
        <StatCard title="Resolved" value={stats.resolved} icon={ClipboardList} color="emerald" />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input-field w-auto"
        >
          <option value="">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="In Progress">In Progress</option>
          <option value="Resolved">Resolved</option>
        </select>
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="input-field w-auto"
        >
          <option value="">All Priorities</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>
      </div>

      {loading ? (
        <Spinner />
      ) : complaints.length === 0 ? (
        <EmptyState title="No complaints assigned" description="You don't have any complaints matching the filters." icon={ClipboardList} />
      ) : (
        <div className="grid gap-4">
          {complaints.map((c) => (
            <Link
              key={c._id}
              to={`/officer/complaint/${c._id}`}
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
                  <p className="text-sm text-slate-500 line-clamp-1 mb-2">{c.description}</p>
                  <p className="text-sm text-slate-500 flex flex-wrap gap-2 items-center">
                    <span className="px-2 py-1 text-xs font-medium bg-indigo-50 text-indigo-600 rounded-md">
                      🆔 {c.complaintId || 'N/A'}
                    </span>
                    <span>• {c.category}</span>
                    <span>• {c.area || 'N/A'}</span>
                    <span className="inline-flex items-center gap-1">• <Clock className="w-3.5 h-3.5" />{new Date(c.createdAt).toLocaleDateString()}</span>
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

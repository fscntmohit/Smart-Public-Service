import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ClipboardList, Filter, Clock } from 'lucide-react';
import { getOfficerComplaints } from '../../services/complaintService';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import StatCard from '../../components/ui/StatCard';
import toast from 'react-hot-toast';

const SLA_MAP = {
  Low: 36,
  Medium: 24,
  High: 16,
};

const getTotalSlaMs = (priority) => (SLA_MAP[priority] || SLA_MAP.Medium) * 60 * 60 * 1000;

const getEffectiveSlaDeadline = (complaint) => {
  if (complaint?.slaDeadline) return new Date(complaint.slaDeadline);

  if (!complaint?.createdAt) return null;
  const slaWindow = getTotalSlaMs(complaint.priority);
  return new Date(new Date(complaint.createdAt).getTime() + slaWindow);
};

const getTimeLeftLabel = (complaint, nowMs) => {
  const deadline = getEffectiveSlaDeadline(complaint);
  if (!deadline) return 'Overdue';

  const diff = deadline.getTime() - nowMs;
  if (diff <= 0) return 'Overdue';

  const totalMinutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h ${minutes}m remaining`;
};

const getSlaRisk = (complaint, nowMs) => {
  if (!complaint?.createdAt) return 'High';

  const totalMs = getTotalSlaMs(complaint.priority);
  const elapsedMs = nowMs - new Date(complaint.createdAt).getTime();
  const usage = elapsedMs / totalMs;

  if (usage >= 1) return 'High';
  if (usage >= 0.75) return 'High';
  if (usage >= 0.5) return 'Medium';
  return 'Low';
};

const getSlaUsage = (complaint, nowMs) => {
  if (!complaint?.createdAt) return 1;

  const totalMs = getTotalSlaMs(complaint.priority);
  const elapsedMs = nowMs - new Date(complaint.createdAt).getTime();
  const usage = elapsedMs / totalMs;

  if (!Number.isFinite(usage)) return 1;
  return Math.max(0, usage);
};

const getSlaUsageBarClass = (usage) => {
  if (usage >= 1) return 'bg-rose-500';
  if (usage >= 0.75) return 'bg-orange-500';
  if (usage >= 0.5) return 'bg-yellow-500';
  return 'bg-emerald-500';
};

const getSlaRiskTextClass = (risk) => {
  if (risk === 'High') return 'text-red-600';
  if (risk === 'Medium') return 'text-yellow-600';
  return 'text-green-600';
};

function formatTime(milliseconds) {
  if (!milliseconds || milliseconds <= 0) return null;

  const totalMinutes = Math.floor(milliseconds / (1000 * 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return `${hours}h ${minutes}m`;
}

const getResolvedDurationLabel = (complaint) => {
  if (!complaint?.resolvedAt || !complaint?.createdAt) return '✅ Resolved';
  const duration = formatTime(new Date(complaint.resolvedAt) - new Date(complaint.createdAt));
  return duration ? `✅ Resolved in ${duration}` : '✅ Resolved';
};

export default function OfficerDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [nowTick, setNowTick] = useState(Date.now());

  useEffect(() => {
    loadComplaints();
  }, [statusFilter, priorityFilter]);

  useEffect(() => {
    const interval = setInterval(() => setNowTick(Date.now()), 60 * 1000);
    return () => clearInterval(interval);
  }, []);

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
          {complaints.map((c) => {
            const risk = getSlaRisk(c, nowTick);
            const usage = getSlaUsage(c, nowTick);
            const usagePercent = Math.min(100, Math.round(usage * 100));
            const actionDuration = c.firstActionTaken && c.firstActionAt && c.createdAt
              ? formatTime(new Date(c.firstActionAt) - new Date(c.createdAt))
              : null;

            return (
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
                        🆔 {c.complaintId || '—'}
                      </span>
                      <span>• {c.category}</span>
                      <span>• {c.area || 'Area Unspecified'}</span>
                      <span className="inline-flex items-center gap-1">• <Clock className="w-3.5 h-3.5" />{new Date(c.createdAt).toLocaleDateString()}</span>
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                      {!c.firstActionTaken ? (
                        <span className="px-2 py-1 rounded-md bg-yellow-50 text-yellow-700 font-medium">
                          🕒 No Action Yet
                        </span>
                      ) : (
                        <span className={`px-2 py-1 rounded-md font-medium ${c.status === 'Resolved' ? 'bg-emerald-50 text-emerald-700' : 'bg-indigo-50 text-indigo-700'}`}>
                          ⚡ Action in {actionDuration || '0h 0m'}
                        </span>
                      )}
                      {c.status !== 'Resolved' ? (
                        <>
                          <span className="px-2 py-1 rounded-md bg-amber-50 text-amber-700 font-medium">
                            ⏳ {getTimeLeftLabel(c, nowTick)}
                          </span>
                          <span className={`px-2 py-1 rounded-md font-medium ${risk === 'High' ? 'bg-rose-50 text-rose-700' : risk === 'Medium' ? 'bg-yellow-50 text-yellow-700' : 'bg-emerald-50 text-emerald-700'}`}>
                            ⚠️ SLA Risk: {risk}
                          </span>
                          <span className={`font-semibold ${getSlaRiskTextClass(risk)}`}>
                            SLA Usage: {usagePercent}%
                          </span>
                          <div className="w-full max-w-[220px] h-2 rounded-full bg-slate-200 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${getSlaUsageBarClass(usage)}`}
                              style={{ width: `${Math.min(100, usagePercent)}%` }}
                            />
                          </div>
                        </>
                      ) : (
                        <span className="px-2 py-1 rounded-md bg-emerald-50 text-emerald-700 font-medium">
                          {getResolvedDurationLabel(c)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

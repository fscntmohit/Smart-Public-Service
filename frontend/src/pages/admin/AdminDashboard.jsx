import { useState, useEffect } from 'react';
import { BarChart3, Users, AlertTriangle, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { getStats, getCategoryDistribution, getMonthlyTrends } from '../../services/analyticsService';
import { getAllComplaints } from '../../services/complaintService';
import StatCard from '../../components/ui/StatCard';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import toast from 'react-hot-toast';

const COLORS = ['#6366f1', '#0ea5e9', '#f43f5e', '#10b981', '#f59e0b'];

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [categories, setCategories] = useState([]);
  const [trends, setTrends] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [statsRes, catRes, trendsRes, compRes] = await Promise.all([
        getStats(),
        getCategoryDistribution(),
        getMonthlyTrends(),
        getAllComplaints({ limit: 5 }),
      ]);
      setStats(statsRes.data);
      setCategories(catRes.data);
      setTrends(trendsRes.data);
      setComplaints(compRes.data.slice(0, 8));
    } catch (err) {
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="slide-up">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Admin Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">System overview and analytics</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <StatCard title="Total Complaints" value={stats?.total || 0} icon={BarChart3} color="indigo" />
        <StatCard title="Pending" value={stats?.pending || 0} icon={Clock} color="amber" />
        <StatCard title="In Progress" value={stats?.inProgress || 0} icon={TrendingUp} color="sky" />
        <StatCard title="Resolved" value={stats?.resolved || 0} icon={CheckCircle} color="emerald" />
        <StatCard title="High Priority" value={stats?.highPriority || 0} icon={AlertTriangle} color="rose" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Trends Bar Chart */}
        <div className="card p-6">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Monthly Trends</h2>
          <div className="h-64">
            {trends.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} />
                  <Tooltip
                    contentStyle={{ borderRadius: '0.5rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                  />
                  <Bar dataKey="total" fill="#6366f1" radius={[4, 4, 0, 0]} name="Total" />
                  <Bar dataKey="resolved" fill="#10b981" radius={[4, 4, 0, 0]} name="Resolved" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-sm text-slate-400">No trend data</div>
            )}
          </div>
        </div>

        {/* Category Pie Chart */}
        <div className="card p-6">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Category Distribution</h2>
          <div className="h-64">
            {categories.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categories}
                    dataKey="count"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    innerRadius={55}
                    strokeWidth={2}
                  >
                    {categories.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '0.5rem', border: '1px solid #e2e8f0' }} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-sm text-slate-400">No category data</div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Complaints Table */}
      <div className="card overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-700">Recent Complaints</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50">
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Complaint ID</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Title</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Category</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Area</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Status</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Priority</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {complaints.map((c) => (
                <tr key={c._id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3 text-sm">
                    <span className="px-2 py-1 text-xs font-medium bg-indigo-50 text-indigo-600 rounded-md">
                      {c.complaintId || 'N/A'}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-sm font-medium text-slate-700 max-w-[200px] truncate">{c.title}</td>
                  <td className="px-5 py-3 text-sm text-slate-500">{c.category}</td>
                  <td className="px-5 py-3 text-sm text-slate-500">{c.area || '—'}</td>
                  <td className="px-5 py-3"><Badge variant={c.status}>{c.status}</Badge></td>
                  <td className="px-5 py-3"><Badge variant={c.priority}>{c.priority}</Badge></td>
                  <td className="px-5 py-3 text-sm text-slate-400">{new Date(c.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

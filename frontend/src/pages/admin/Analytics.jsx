import { useState, useEffect, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend, Brush, ReferenceLine } from 'recharts';
import { getCategoryDistribution, getMonthlyTrends, getAreaDistribution, getOfficerPerformance } from '../../services/analyticsService';
import toast from 'react-hot-toast';
import { useTheme } from '../../context/ThemeContext';

const COLORS = ['#6366f1', '#0ea5e9', '#f43f5e', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

export default function Analytics() {
  const { isDark } = useTheme();
  const [categories, setCategories] = useState([]);
  const [trends, setTrends] = useState([]);
  const [areas, setAreas] = useState([]);
  const [trendRange, setTrendRange] = useState('all');
  const [showTotal, setShowTotal] = useState(true);
  const [showResolved, setShowResolved] = useState(true);
  const [selectedTrendMonth, setSelectedTrendMonth] = useState(null);

  // Officer Performance State
  const [performance, setPerformance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();

    const fetchPerformance = async () => {
      try {
        setLoading(true);

        // Using getOfficerPerformance() from our authenticated api service
        // This ensures the Clerk auth token is passed and correctly hits port 5001
        const res = await getOfficerPerformance();

        console.log("API RESPONSE:", res.data);

        if (res.data.success) {
          setPerformance(res.data.data); // Correctly parse res.data.data as instructed
          console.log("PERFORMANCE STATE:", res.data.data);
        } else {
          setPerformance([]);
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setError("Failed to load officer performance data");
      } finally {
        setLoading(false);
      }
    };

    fetchPerformance();
  }, []);

  const loadData = async () => {
    try {
      const [catRes, trendRes, areaRes] = await Promise.all([
        getCategoryDistribution(),
        getMonthlyTrends(),
        getAreaDistribution(),
      ]);
      setCategories(catRes.data);
      setTrends(trendRes.data);
      setAreas(areaRes.data);
    } catch (err) {
      toast.error('Failed to load general analytics');
    }
  };

  const filteredTrends = useMemo(() => {
    if (!Array.isArray(trends) || trends.length === 0) return [];

    if (trendRange === '6m') return trends.slice(-6);
    if (trendRange === '12m') return trends.slice(-12);
    return trends;
  }, [trends, trendRange]);

  const trendSummary = useMemo(() => {
    if (!filteredTrends.length) return null;

    const latest = filteredTrends[filteredTrends.length - 1];
    const previous = filteredTrends[filteredTrends.length - 2];
    const total = latest?.total || 0;
    const resolved = latest?.resolved || 0;
    const rate = total > 0 ? Math.round((resolved / total) * 100) : 0;
    const delta = previous ? total - (previous.total || 0) : 0;

    return {
      month: latest.month,
      total,
      resolved,
      rate,
      delta,
    };
  }, [filteredTrends]);

  const selectedPoint = useMemo(() => {
    if (!selectedTrendMonth) return null;
    return filteredTrends.find((item) => item.month === selectedTrendMonth) || null;
  }, [filteredTrends, selectedTrendMonth]);

  const chartTrends = useMemo(() => {
    if (!filteredTrends.length) return [];
    if (filteredTrends.length > 1) return filteredTrends;

    const onlyPoint = filteredTrends[0];
    const parsedDate = new Date(`${onlyPoint.month} 1`);
    let previousMonthLabel = 'Previous';

    if (!Number.isNaN(parsedDate.getTime())) {
      parsedDate.setMonth(parsedDate.getMonth() - 1);
      previousMonthLabel = parsedDate.toLocaleString('en-US', { month: 'short', year: 'numeric' });
    }

    return [
      { month: previousMonthLabel, total: 0, resolved: 0 },
      onlyPoint,
    ];
  }, [filteredTrends]);

  if (loading) {
    return <div className="p-6 text-sm text-slate-400">Loading...</div>;
  }

  if (error) {
    return <div className="p-6 text-sm text-red-500">{error}</div>;
  }

  return (
    <div className="slide-up">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Analytics</h1>
        <p className="text-sm text-slate-500 mt-1">Detailed insights and performance metrics</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Monthly Trends Line */}
        <div className="card p-6">
          <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
            <h2 className="text-sm font-semibold text-slate-700">Complaint Trends</h2>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setTrendRange('6m')}
                className={`px-2.5 py-1 text-xs rounded-md border ${trendRange === '6m' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
              >
                6M
              </button>
              <button
                onClick={() => setTrendRange('12m')}
                className={`px-2.5 py-1 text-xs rounded-md border ${trendRange === '12m' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
              >
                12M
              </button>
              <button
                onClick={() => setTrendRange('all')}
                className={`px-2.5 py-1 text-xs rounded-md border ${trendRange === 'all' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
              >
                All
              </button>

              <button
                onClick={() => setShowTotal((prev) => !prev)}
                className={`px-2.5 py-1 text-xs rounded-md border ${showTotal ? 'bg-indigo-100 text-indigo-700 border-indigo-200' : 'bg-white text-slate-600 border-slate-200'}`}
              >
                Total
              </button>
              <button
                onClick={() => setShowResolved((prev) => !prev)}
                className={`px-2.5 py-1 text-xs rounded-md border ${showResolved ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-white text-slate-600 border-slate-200'}`}
              >
                Resolved
              </button>
            </div>
          </div>

          {trendSummary && (
            <div className="mb-4 grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                <p className="text-[11px] text-slate-500">Latest Month</p>
                <p className="text-sm font-semibold text-slate-700">{trendSummary.month}</p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                <p className="text-[11px] text-slate-500">Resolution Rate</p>
                <p className="text-sm font-semibold text-slate-700">{trendSummary.rate}%</p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                <p className="text-[11px] text-slate-500">Total Trend</p>
                <p className={`text-sm font-semibold ${trendSummary.delta >= 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                  {trendSummary.delta >= 0 ? '+' : ''}
                  {trendSummary.delta} vs prev
                </p>
              </div>
            </div>
          )}

          <div className="h-64">
            {chartTrends.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chartTrends}
                  onClick={(state) => {
                    if (state?.activeLabel) setSelectedTrendMonth(state.activeLabel);
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#334155' : '#f1f5f9'} />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '0.5rem',
                      border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
                      backgroundColor: isDark ? '#0f172a' : '#fff',
                    }}
                    labelStyle={{ color: isDark ? '#e2e8f0' : '#334155', fontWeight: 600 }}
                  />
                  {showTotal && (
                    <Line
                      type="monotone"
                      dataKey="total"
                      stroke="#6366f1"
                      strokeWidth={2.5}
                      dot={{ r: 3 }}
                      activeDot={{ r: 6 }}
                      name="Total"
                    />
                  )}
                  {showResolved && (
                    <Line
                      type="monotone"
                      dataKey="resolved"
                      stroke="#10b981"
                      strokeWidth={2.5}
                      dot={{ r: 3 }}
                      activeDot={{ r: 6 }}
                      name="Resolved"
                    />
                  )}
                  {selectedTrendMonth && (
                    <ReferenceLine x={selectedTrendMonth} stroke="#94a3b8" strokeDasharray="4 4" />
                  )}
                  <Brush
                    dataKey="month"
                    height={22}
                    stroke={isDark ? '#475569' : '#94a3b8'}
                    travellerWidth={8}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-sm text-slate-400">No data</div>
            )}
          </div>

          {selectedPoint && (
            <div className="mt-3 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs text-indigo-800">
              <span className="font-semibold">{selectedPoint.month}:</span> Total {selectedPoint.total || 0}, Resolved {selectedPoint.resolved || 0}
            </div>
          )}
        </div>

        {/* Category Distribution */}
        <div className="card p-6">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Category Breakdown</h2>
          <div className="h-64">
            {categories.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={categories} dataKey="count" nameKey="category" cx="50%" cy="50%" outerRadius={90} innerRadius={55}>
                    {categories.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '0.5rem', border: '1px solid #e2e8f0' }} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-sm text-slate-400">No data</div>
            )}
          </div>
        </div>

        {/* Area Distribution */}
        <div className="card p-6">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Area-wise Complaints</h2>
          <div className="h-64">
            {areas.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={areas} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis type="number" tick={{ fontSize: 12, fill: '#94a3b8' }} />
                  <YAxis dataKey="area" type="category" tick={{ fontSize: 12, fill: '#94a3b8' }} width={80} />
                  <Tooltip contentStyle={{ borderRadius: '0.5rem', border: '1px solid #e2e8f0' }} />
                  <Bar dataKey="count" fill="#6366f1" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-sm text-slate-400">No data</div>
            )}
          </div>
        </div>

        {/* Officer Performance */}
        <div className="card p-6">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Officer Performance</h2>
          {performance.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left text-xs font-semibold text-slate-500 pb-3">Officer</th>
                    <th className="text-left text-xs font-semibold text-slate-500 pb-3">Department</th>
                    <th className="text-center text-xs font-semibold text-slate-500 pb-3">Resolved</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {performance.map((o) => (
                    <tr key={o._id}>
                      <td className="py-2.5 text-sm text-slate-700">{o.officerName || 'Unknown'}</td>
                      <td className="py-2.5 text-sm text-slate-500">{o.department || '—'}</td>
                      <td className="py-2.5 text-sm text-center text-emerald-600 font-medium">{o.totalResolved}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex items-center justify-center h-40 text-sm text-slate-400">No data</div>
          )}
        </div>
      </div>
    </div>
  );
}

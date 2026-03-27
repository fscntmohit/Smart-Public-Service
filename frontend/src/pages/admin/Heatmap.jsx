import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { getHeatmapData } from '../../services/analyticsService';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import toast from 'react-hot-toast';
import { MapPin } from 'lucide-react';

const categoryColors = {
  Waste: '#f59e0b',
  Electricity: '#3b82f6',
  Water: '#06b6d4',
  Road: '#8b5cf6',
  Other: '#6b7280',
};

const priorityRadius = {
  High: 14,
  Medium: 10,
  Low: 7,
};

export default function Heatmap() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { data } = await getHeatmapData();
      setComplaints(data);
    } catch (err) {
      toast.error('Failed to load heatmap data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Spinner />;

  const center = complaints.length > 0
    ? [complaints[0].latitude, complaints[0].longitude]
    : [28.6139, 77.2090];

  return (
    <div className="slide-up">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Complaint Heatmap</h1>
        <p className="text-sm text-slate-500 mt-1">Visualize complaint clusters and hotspots</p>
      </div>

      {/* Legend */}
      <div className="card p-4 mb-4">
        <div className="flex flex-wrap items-center gap-6">
          <span className="text-xs font-semibold text-slate-500 uppercase">Categories:</span>
          {Object.entries(categoryColors).map(([cat, color]) => (
            <span key={cat} className="flex items-center gap-2 text-sm">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: color }}></span>
              {cat}
            </span>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-6 mt-2">
          <span className="text-xs font-semibold text-slate-500 uppercase">Size = Priority:</span>
          <span className="text-xs text-slate-400">Larger circles = Higher priority</span>
        </div>
      </div>

      {complaints.length === 0 ? (
        <EmptyState title="No heatmap data" description="No complaints with GPS coordinates found." icon={MapPin} />
      ) : (
        <div className="card overflow-hidden" style={{ height: '550px' }}>
          <MapContainer center={center} zoom={12} style={{ height: '100%', width: '100%' }}>
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/">OSM</a>'
            />
            {complaints.map((c) => (
              <CircleMarker
                key={c._id}
                center={[c.latitude, c.longitude]}
                radius={priorityRadius[c.priority] || 10}
                fillColor={categoryColors[c.category] || '#6b7280'}
                color="rgba(255,255,255,0.8)"
                weight={1.5}
                fillOpacity={0.65}
              >
                <Popup>
                  <div className="text-sm">
                    <strong>{c.title}</strong><br />
                    <span className="text-slate-500">
                      {c.category} • {c.priority} • {c.status}
                    </span><br />
                    {c.area && <span className="text-slate-400">{c.area}</span>}
                  </div>
                </Popup>
              </CircleMarker>
            ))}
          </MapContainer>
        </div>
      )}
    </div>
  );
}

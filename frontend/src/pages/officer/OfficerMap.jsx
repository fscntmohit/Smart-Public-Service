import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getOfficerComplaints } from '../../services/complaintService';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import toast from 'react-hot-toast';
import { Map as MapIcon } from 'lucide-react';

const priorityColors = {
  High: '#ef4444',
  Medium: '#f97316',
  Low: '#22c55e',
};

const statusColors = {
  Pending: '#eab308',
  'In Progress': '#3b82f6',
  Resolved: '#22c55e',
};

export default function OfficerMap() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [colorBy, setColorBy] = useState('priority');

  useEffect(() => {
    loadComplaints();
  }, []);

  const loadComplaints = async () => {
    try {
      const { data } = await getOfficerComplaints({});
      setComplaints(data.filter((c) => c.latitude && c.longitude));
    } catch (err) {
      toast.error('Failed to load map data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Spinner />;

  const mapComplaints = complaints.filter((c) => c.latitude && c.longitude);
  const center = mapComplaints.length > 0
    ? [mapComplaints[0].latitude, mapComplaints[0].longitude]
    : [28.6139, 77.2090];

  return (
    <div className="slide-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Area Map</h1>
          <p className="text-sm text-slate-500 mt-1">View complaints in your assigned area</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-500">Color by:</span>
          <select
            value={colorBy}
            onChange={(e) => setColorBy(e.target.value)}
            className="input-field w-auto"
          >
            <option value="priority">Priority</option>
            <option value="status">Status</option>
          </select>
        </div>
      </div>

      {/* Legend */}
      <div className="card p-4 mb-4 flex flex-wrap items-center gap-6">
        {colorBy === 'priority' ? (
          <>
            <span className="flex items-center gap-2 text-sm"><span className="w-3 h-3 rounded-full bg-red-500"></span> High</span>
            <span className="flex items-center gap-2 text-sm"><span className="w-3 h-3 rounded-full bg-orange-500"></span> Medium</span>
            <span className="flex items-center gap-2 text-sm"><span className="w-3 h-3 rounded-full bg-green-500"></span> Low</span>
          </>
        ) : (
          <>
            <span className="flex items-center gap-2 text-sm"><span className="w-3 h-3 rounded-full bg-yellow-500"></span> Pending</span>
            <span className="flex items-center gap-2 text-sm"><span className="w-3 h-3 rounded-full bg-blue-500"></span> In Progress</span>
            <span className="flex items-center gap-2 text-sm"><span className="w-3 h-3 rounded-full bg-green-500"></span> Resolved</span>
          </>
        )}
      </div>

      {mapComplaints.length === 0 ? (
        <EmptyState title="No location data" description="No complaints with GPS data found." icon={MapIcon} />
      ) : (
        <div className="card overflow-hidden" style={{ height: '500px' }}>
          <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%' }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {mapComplaints.map((c) => (
              <CircleMarker
                key={c._id}
                center={[c.latitude, c.longitude]}
                radius={10}
                fillColor={colorBy === 'priority' ? priorityColors[c.priority] : statusColors[c.status]}
                color="#fff"
                weight={2}
                fillOpacity={0.8}
              >
                <Popup>
                  <div className="text-sm">
                    <strong>{c.title}</strong><br />
                    <span className="text-slate-500">{c.category} • {c.status} • {c.priority}</span><br />
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

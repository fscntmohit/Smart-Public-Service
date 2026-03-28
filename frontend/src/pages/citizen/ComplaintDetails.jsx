import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Clock, User, Camera, Video, MessageSquare, CheckCircle } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getComplaint } from '../../services/complaintService';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import toast from 'react-hot-toast';

// Fix leaflet default marker
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

export default function ComplaintDetails() {
  const { id } = useParams();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadComplaint();
  }, [id]);

  const loadComplaint = async () => {
    try {
      const { data } = await getComplaint(id);
      setComplaint(data);
    } catch (err) {
      toast.error('Failed to load complaint');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Spinner />;
  if (!complaint) return <div className="text-center py-20 text-slate-500">Complaint not found</div>;

  const statusSteps = ['Pending', 'In Progress', 'Resolved'];
  const currentStep = statusSteps.indexOf(complaint.status);
  const updates = [...(complaint.updates || [])].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  const getStatusDotClass = (status) => {
    if (status === 'Resolved') return 'bg-emerald-500';
    if (status === 'In Progress') return 'bg-sky-500';
    return 'bg-amber-500';
  };

  const handleCopyId = async () => {
    if (!complaint?.complaintId) return;
    try {
      await navigator.clipboard.writeText(complaint.complaintId);
      toast.success('Complaint ID copied');
    } catch {
      toast.error('Failed to copy complaint ID');
    }
  };

  return (
    <div className="max-w-3xl mx-auto slide-up">
      <Link to="/citizen/complaints" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-indigo-600 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to My Complaints
      </Link>

      {/* Header */}
      <div className="card p-6 mb-4">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-slate-800">{complaint.title}</h1>
            <div className="flex items-center gap-3 mt-2">
              <Badge variant={complaint.status}>{complaint.status}</Badge>
              <Badge variant={complaint.priority}>{complaint.priority}</Badge>
              <span className="text-xs text-slate-400">{complaint.category}</span>
            </div>
          </div>
        </div>
        <p className="text-sm text-slate-600 leading-relaxed">{complaint.description}</p>

        {/* Metadata */}
        <div className="mt-4 pt-4 border-t border-slate-100">
          <div className="flex flex-wrap gap-3 text-sm text-slate-500 mb-3">
            <span className="px-2 py-1 bg-indigo-50 text-indigo-600 rounded-md font-medium">
              🆔 {complaint.complaintId || 'N/A'}
            </span>
            <span>• {complaint.category}</span>
            <span>• {complaint.area || 'N/A'}</span>
            <span>• {new Date(complaint.createdAt).toLocaleDateString()}</span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <button
              onClick={handleCopyId}
              className="text-indigo-500 hover:underline font-medium"
            >
              Copy ID
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-slate-500">
            <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{new Date(complaint.createdAt).toLocaleString()}</span>
            {complaint.assignedOfficer && (
              <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" />Assigned</span>
            )}
          </div>
        </div>

        {/* Complaint image */}
        {complaint.image && (
          <div className="mt-4">
            <img src={complaint.image} alt="Complaint" className="rounded-lg max-h-64 object-cover border" />
          </div>
        )}
      </div>

      {/* Status Timeline */}
      <div className="card p-6 mb-4">
        <h2 className="text-sm font-semibold text-slate-700 mb-4">Status Timeline</h2>
        <div className="flex items-center gap-0">
          {statusSteps.map((step, i) => (
            <div key={step} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${i <= currentStep
                    ? 'bg-indigo-500 text-white'
                    : 'bg-slate-200 text-slate-400'
                  }`}>
                  {i < currentStep ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    i + 1
                  )}
                </div>
                <span className={`text-xs mt-1.5 ${i <= currentStep ? 'text-indigo-600 font-medium' : 'text-slate-400'}`}>
                  {step}
                </span>
              </div>
              {i < statusSteps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 ${i < currentStep ? 'bg-indigo-500' : 'bg-slate-200'}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Activity Updates */}
      <div className="card p-6 mb-4">
        <h2 className="text-sm font-semibold text-slate-700 mb-4">📢 Status Updates</h2>
        {updates.length === 0 ? (
          <p className="text-sm text-slate-500">No updates yet.</p>
        ) : (
          <div className="relative pl-4">
            <div className="absolute left-[7px] top-1 bottom-1 w-px bg-slate-200"></div>
            <div className="space-y-3">
              {updates.map((u, i) => (
                <div key={`${u.timestamp || i}-${i}`} className="relative pl-4">
                  <span className={`absolute left-0.5 top-1.5 w-3 h-3 rounded-full border-2 border-white ${getStatusDotClass(u.status)}`}></span>
                  <p className="text-xs text-slate-400">{new Date(u.timestamp).toLocaleString()}</p>
                  <p className="text-sm text-slate-700 mt-0.5">{u.message}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{u.status} • {u.by}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Map */}
      {complaint.latitude && complaint.longitude && (
        <div className="card p-6 mb-4">
          <h2 className="text-sm font-semibold text-slate-700 mb-3">Location</h2>
          <div className="h-64 rounded-lg overflow-hidden">
            <MapContainer
              center={[complaint.latitude, complaint.longitude]}
              zoom={15}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <Marker position={[complaint.latitude, complaint.longitude]}>
                <Popup>{complaint.title}</Popup>
              </Marker>
            </MapContainer>
          </div>
        </div>
      )}

      {/* Proof Section */}
      {complaint.status === 'Resolved' && (complaint.proofImage || complaint.proofVideo || complaint.remarks) && (
        <div className="card p-6 border-2 border-emerald-200 bg-emerald-50/50">
          <h2 className="text-sm font-semibold text-emerald-800 mb-4 flex items-center gap-2">
            <CheckCircle className="w-4 h-4" /> Resolution Proof
          </h2>

          {complaint.proofImage && (
            <div className="mb-4">
              <p className="text-xs text-emerald-700 mb-2 flex items-center gap-1"><Camera className="w-3.5 h-3.5" /> Proof Image</p>
              <img src={complaint.proofImage} alt="Proof" className="rounded-lg max-h-64 object-cover border" />
            </div>
          )}

          {complaint.proofVideo && (
            <div className="mb-4">
              <p className="text-xs text-emerald-700 mb-2 flex items-center gap-1"><Video className="w-3.5 h-3.5" /> Proof Video</p>
              <video src={complaint.proofVideo} controls className="rounded-lg max-h-64 w-full border" />
            </div>
          )}

          {complaint.remarks && (
            <div>
              <p className="text-xs text-emerald-700 mb-1 flex items-center gap-1"><MessageSquare className="w-3.5 h-3.5" /> Remarks</p>
              <p className="text-sm text-emerald-800 bg-white/50 rounded-lg p-3">{complaint.remarks}</p>
            </div>
          )}

          {complaint.resolvedAt && (
            <p className="text-xs text-emerald-600 mt-3">
              Resolved on {new Date(complaint.resolvedAt).toLocaleString()}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

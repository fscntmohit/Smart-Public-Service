import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Clock, Camera, Video, MessageSquare, CheckCircle, Send, Upload, X, Circle, Square } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getComplaint, updateComplaintStatus } from '../../services/complaintService';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import toast from 'react-hot-toast';
import { useRef } from 'react';

const allowedTransitions = {
  Pending: ['In Progress'],
  'In Progress': ['Resolved'],
  Resolved: [],
};

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

export default function OfficerComplaintDetails() {
  const { id } = useParams();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [proofError, setProofError] = useState('');
  const [showImageCamera, setShowImageCamera] = useState(false);
  const [showVideoRecorder, setShowVideoRecorder] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [form, setForm] = useState({
    status: '', proofImage: '', proofVideo: '', remarks: '',
  });

  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const imageCameraVideoRef = useRef(null);
  const videoRecorderRef = useRef(null);
  const imageStreamRef = useRef(null);
  const videoStreamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);

  useEffect(() => { loadComplaint(); }, [id]);

  const loadComplaint = async () => {
    try {
      const { data } = await getComplaint(id);
      setComplaint(data);
      const nextStatus = allowedTransitions[data.status]?.[0] || data.status;
      setForm({
        status: nextStatus,
        proofImage: data.proofImage || '',
        proofVideo: data.proofVideo || '',
        remarks: data.remarks || '',
      });
    } catch (err) {
      toast.error('Failed to load complaint');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    const currentStatus = complaint?.status;
    const nextStatusOptions = allowedTransitions[currentStatus] || [];

    if (currentStatus === 'Resolved') {
      toast.error('This complaint is closed and cannot be updated');
      return;
    }

    if (!nextStatusOptions.includes(form.status)) {
      toast.error('Invalid status change. You can only move forward.');
      return;
    }

    if (form.status === 'Resolved' && !form.proofImage) {
      setProofError('Photo proof is mandatory when resolving complaint');
      toast.error('Upload/capture photo proof before resolving');
      return;
    }

    setProofError('');
    setUpdating(true);
    try {
      const { data } = await updateComplaintStatus(id, form);
      const updatedComplaint = data?.complaint || data;
      setComplaint(updatedComplaint);
      setForm((prev) => ({
        ...prev,
        status: allowedTransitions[updatedComplaint.status]?.[0] || updatedComplaint.status,
        proofImage: updatedComplaint.proofImage || prev.proofImage,
        proofVideo: updatedComplaint.proofVideo || prev.proofVideo,
        remarks: updatedComplaint.remarks || prev.remarks,
      }));
      toast.success('Complaint updated!');
    } catch (err) {
      const message = err?.response?.data?.message || err?.response?.data?.error || 'Failed to update';
      if (message.toLowerCase().includes('invalid transition')) {
        toast.error('Invalid status change. You can only move forward.');
      } else {
        toast.error(message);
      }
    } finally {
      setUpdating(false);
    }
  };

  useEffect(() => {
    return () => {
      closeImageCamera();
      closeVideoRecorder();
    };
  }, []);

  const fileToDataUrl = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    const dataUrl = await fileToDataUrl(file);
    setForm((prev) => ({ ...prev, proofImage: dataUrl }));
    setProofError('');
    e.target.value = '';
  };

  const handleVideoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      toast.error('Please upload a video file');
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      toast.error('Video must be less than 8MB');
      return;
    }

    const dataUrl = await fileToDataUrl(file);
    setForm((prev) => ({ ...prev, proofVideo: dataUrl }));
    setProofError('');
    e.target.value = '';
  };

  const openImageCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
        audio: false,
      });
      imageStreamRef.current = stream;
      setShowImageCamera(true);

      setTimeout(() => {
        if (imageCameraVideoRef.current) {
          imageCameraVideoRef.current.srcObject = stream;
          imageCameraVideoRef.current.play().catch(() => null);
        }
      }, 20);
    } catch {
      toast.error('Unable to access camera');
    }
  };

  const closeImageCamera = () => {
    if (imageStreamRef.current) {
      imageStreamRef.current.getTracks().forEach((track) => track.stop());
      imageStreamRef.current = null;
    }
    if (imageCameraVideoRef.current) {
      imageCameraVideoRef.current.srcObject = null;
    }
    setShowImageCamera(false);
  };

  const captureImageFromCamera = () => {
    const video = imageCameraVideoRef.current;
    if (!video || !video.videoWidth || !video.videoHeight) {
      toast.error('Camera not ready');
      return;
    }

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);

    setForm((prev) => ({ ...prev, proofImage: dataUrl }));
    setProofError('');
    closeImageCamera();
  };

  const openVideoRecorder = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
        audio: true,
      });
      videoStreamRef.current = stream;
      setShowVideoRecorder(true);

      setTimeout(() => {
        if (videoRecorderRef.current) {
          videoRecorderRef.current.srcObject = stream;
          videoRecorderRef.current.play().catch(() => null);
        }
      }, 20);
    } catch {
      toast.error('Unable to access camera/video recorder');
    }
  };

  const closeVideoRecorder = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
    if (videoStreamRef.current) {
      videoStreamRef.current.getTracks().forEach((track) => track.stop());
      videoStreamRef.current = null;
    }
    if (videoRecorderRef.current) {
      videoRecorderRef.current.srcObject = null;
    }
    setIsRecording(false);
    setShowVideoRecorder(false);
  };

  const startRecording = () => {
    if (!videoStreamRef.current) return;

    const stream = videoStreamRef.current;
    let recorder;
    try {
      recorder = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp8,opus' });
    } catch {
      recorder = new MediaRecorder(stream);
    }

    recordedChunksRef.current = [];
    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) recordedChunksRef.current.push(event.data);
    };

    recorder.onstop = async () => {
      const blob = new Blob(recordedChunksRef.current, { type: recorder.mimeType || 'video/webm' });
      if (blob.size > 8 * 1024 * 1024) {
        toast.error('Recorded video is too large. Keep it shorter.');
        return;
      }
      const file = new File([blob], 'proof-video.webm', { type: blob.type });
      const dataUrl = await fileToDataUrl(file);
      setForm((prev) => ({ ...prev, proofVideo: dataUrl }));
      setProofError('');
      closeVideoRecorder();
    };

    recorder.start();
    mediaRecorderRef.current = recorder;
    setIsRecording(true);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  if (loading) return <Spinner />;
  if (!complaint) return <div className="text-center py-20 text-slate-500">Not found</div>;

  const statusSteps = ['Pending', 'In Progress', 'Resolved'];
  const currentStep = statusSteps.indexOf(complaint.status);
  const nextStatusOptions = allowedTransitions[complaint.status] || [];
  const isResolvedLocked = complaint.status === 'Resolved';

  return (
    <div className="max-w-3xl mx-auto slide-up">
      <Link to="/officer/dashboard" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-indigo-600 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Link>

      {/* Complaint Info */}
      <div className="card p-6 mb-4">
        <div className="flex items-start justify-between mb-3">
          <h1 className="text-xl font-bold text-slate-800">{complaint.title}</h1>
          <div className="flex items-center gap-2">
            <Badge variant={complaint.status}>{complaint.status}</Badge>
            <Badge variant={complaint.priority}>{complaint.priority}</Badge>
          </div>
        </div>
        <p className="text-sm text-slate-600 leading-relaxed mb-4">{complaint.description}</p>
        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-3 border-t">
          <span className="px-2 py-1 text-xs font-medium bg-indigo-50 text-indigo-600 rounded-md">🆔 {complaint.complaintId || 'N/A'}</span>
          <span className="flex items-center gap-1">📂 {complaint.category}</span>
          {complaint.area && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{complaint.area}</span>}
          <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{new Date(complaint.createdAt).toLocaleString()}</span>
        </div>
        {complaint.image && (
          <img src={complaint.image} alt="Complaint" className="mt-4 rounded-lg max-h-48 object-cover border" />
        )}
      </div>

      {/* Timeline */}
      <div className="card p-6 mb-4">
        <h2 className="text-sm font-semibold text-slate-700 mb-4">Status Timeline</h2>
        <div className="flex items-center gap-0">
          {statusSteps.map((step, i) => (
            <div key={step} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${i <= currentStep ? 'bg-indigo-500 text-white' : 'bg-slate-200 text-slate-400'
                  }`}>
                  {i < currentStep ? <CheckCircle className="w-4 h-4" /> : i + 1}
                </div>
                <span className={`text-xs mt-1.5 ${i <= currentStep ? 'text-indigo-600 font-medium' : 'text-slate-400'}`}>{step}</span>
              </div>
              {i < statusSteps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 ${i < currentStep ? 'bg-indigo-500' : 'bg-slate-200'}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Map */}
      {complaint.latitude && complaint.longitude && (
        <div className="card p-6 mb-4">
          <h2 className="text-sm font-semibold text-slate-700 mb-3">Location</h2>
          <div className="h-56 rounded-lg overflow-hidden">
            <MapContainer center={[complaint.latitude, complaint.longitude]} zoom={15} style={{ height: '100%', width: '100%' }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <Marker position={[complaint.latitude, complaint.longitude]}>
                <Popup>{complaint.title}</Popup>
              </Marker>
            </MapContainer>
          </div>
        </div>
      )}

      {/* Update Form */}
      <div className="card p-6">
        <h2 className="text-sm font-semibold text-slate-700 mb-4">Update Complaint</h2>

        {isResolvedLocked && (
          <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
            🔒 This complaint is closed and cannot be modified
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              disabled={isResolvedLocked || updating}
              className="input-field"
            >
              {isResolvedLocked ? (
                <option value="Resolved">Resolved</option>
              ) : (
                nextStatusOptions.map((s) => <option key={s} value={s}>{s}</option>)
              )}
            </select>
            {!isResolvedLocked && (
              <p className="mt-1 text-xs text-slate-500">You can only move forward in workflow.</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Proof Photo {form.status === 'Resolved' && <span className="text-rose-500">*</span>}</label>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <button
                  type="button"
                  onClick={() => imageInputRef.current?.click()}
                  disabled={isResolvedLocked || updating}
                  className="px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-sm font-medium inline-flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" /> Upload Photo
                </button>
                <button
                  type="button"
                  onClick={openImageCamera}
                  disabled={isResolvedLocked || updating}
                  className="px-3 py-2 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-sm font-medium inline-flex items-center gap-2"
                >
                  <Camera className="w-4 h-4" /> Capture Photo
                </button>
                {form.proofImage && (
                  <button
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, proofImage: '' }))}
                    disabled={isResolvedLocked || updating}
                    className="px-3 py-2 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-sm font-medium inline-flex items-center gap-2"
                  >
                    <X className="w-4 h-4" /> Remove
                  </button>
                )}
              </div>

              {form.proofImage && <img src={form.proofImage} alt="Proof preview" className="mt-2 rounded-lg max-h-48 object-cover border" />}
            </div>
            <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Proof Video <span className="text-slate-400">(optional)</span></label>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <button
                  type="button"
                  onClick={() => videoInputRef.current?.click()}
                  disabled={isResolvedLocked || updating}
                  className="px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-sm font-medium inline-flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" /> Upload Video
                </button>
                <button
                  type="button"
                  onClick={openVideoRecorder}
                  disabled={isResolvedLocked || updating}
                  className="px-3 py-2 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-sm font-medium inline-flex items-center gap-2"
                >
                  <Video className="w-4 h-4" /> Capture Video
                </button>
                {form.proofVideo && (
                  <button
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, proofVideo: '' }))}
                    disabled={isResolvedLocked || updating}
                    className="px-3 py-2 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-sm font-medium inline-flex items-center gap-2"
                  >
                    <X className="w-4 h-4" /> Remove
                  </button>
                )}
              </div>

              {form.proofVideo && (
                <video src={form.proofVideo} controls className="mt-2 rounded-lg max-h-56 w-full border" />
              )}
            </div>
            <input ref={videoInputRef} type="file" accept="video/*" className="hidden" onChange={handleVideoUpload} />
          </div>

          {proofError && <p className="text-sm text-rose-600">{proofError}</p>}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Remarks</label>
            <textarea
              value={form.remarks}
              onChange={(e) => setForm({ ...form, remarks: e.target.value })}
              rows={3}
              placeholder="Add resolution notes..."
              disabled={isResolvedLocked || updating}
              className="input-field resize-none"
            />
          </div>
          <button
            onClick={handleUpdate}
            disabled={updating || isResolvedLocked || nextStatusOptions.length === 0}
            className="btn-primary flex items-center gap-2"
          >
            {updating ? 'Updating...' : <><Send className="w-4 h-4" /> Update Complaint</>}
          </button>
        </div>
      </div>

      {showImageCamera && (
        <div className="fixed inset-0 z-[130] bg-black/65 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-800">Capture Proof Photo</h3>
              <button type="button" onClick={closeImageCamera} className="p-1.5 rounded-lg hover:bg-slate-100">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="bg-black">
              <video ref={imageCameraVideoRef} autoPlay playsInline muted className="w-full aspect-video object-cover" />
            </div>
            <div className="p-4 flex justify-end gap-2">
              <button type="button" onClick={closeImageCamera} className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-sm font-medium">Cancel</button>
              <button type="button" onClick={captureImageFromCamera} className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium inline-flex items-center gap-2">
                <Camera className="w-4 h-4" /> Use Photo
              </button>
            </div>
          </div>
        </div>
      )}

      {showVideoRecorder && (
        <div className="fixed inset-0 z-[130] bg-black/65 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-800">Capture Proof Video</h3>
              <button type="button" onClick={closeVideoRecorder} className="p-1.5 rounded-lg hover:bg-slate-100">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="bg-black">
              <video ref={videoRecorderRef} autoPlay playsInline muted={false} className="w-full aspect-video object-cover" />
            </div>
            <div className="p-4 flex justify-end gap-2">
              <button type="button" onClick={closeVideoRecorder} className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-sm font-medium">Cancel</button>
              {!isRecording ? (
                <button type="button" onClick={startRecording} className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-sm font-medium inline-flex items-center gap-2">
                  <Circle className="w-4 h-4" /> Start Recording
                </button>
              ) : (
                <button type="button" onClick={stopRecording} className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium inline-flex items-center gap-2">
                  <Square className="w-4 h-4" /> Stop & Use Video
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

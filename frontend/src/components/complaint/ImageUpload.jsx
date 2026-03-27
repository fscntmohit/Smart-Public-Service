import { Camera, ImagePlus, Trash2, Upload, X, Check } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

export default function ImageUpload({ image, onImageChange, error, onError }) {
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [cameraLoading, setCameraLoading] = useState(false);

  const isTouchDevice =
    typeof window !== 'undefined' &&
    ('ontouchstart' in window || navigator.maxTouchPoints > 0);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, []);

  const processFile = (file) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      onError?.('Please upload a valid image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      onError?.('Image must be less than 5MB');
      return;
    }

    onError?.('');
    const reader = new FileReader();
    reader.onloadend = () => {
      onImageChange(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    processFile(file);
    e.target.value = '';
  };

  const handleCameraFileChange = (e) => {
    const file = e.target.files[0];
    processFile(file);
    e.target.value = '';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    processFile(file);
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const attachStreamToVideo = async (stream) => {
    if (!videoRef.current) return;
    videoRef.current.srcObject = stream;
    try {
      await videoRef.current.play();
    } catch {
      // Safari/Chrome can reject autoplay in some contexts; user can still tap Use Photo after feed appears.
    }
  };

  const openCamera = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      onError?.('Camera is not supported in this browser. Please upload from device.');
      return;
    }

    setCameraLoading(true);
    setCameraError('');

    try {
      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: 'environment' },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });
      } catch {
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
      }

      streamRef.current = stream;
      setCameraOpen(true);

      setTimeout(() => {
        attachStreamToVideo(stream);
      }, 50);
    } catch (err) {
      setCameraError('Unable to access camera. Please allow permission and try again.');
      onError?.('Unable to access camera. You can upload from device instead.');
    } finally {
      setCameraLoading(false);
    }
  };

  const openUploadPicker = () => {
    fileInputRef.current?.click();
  };

  const openDeviceCamera = async () => {
    setCameraError('');

    // Mobile/tablet: native camera picker is usually most reliable.
    if (isTouchDevice) {
      cameraInputRef.current?.click();
      return;
    }

    // Desktop: open live webcam modal.
    await openCamera();
  };

  const closeCamera = () => {
    stopCamera();
    setCameraOpen(false);
    setCameraError('');
  };

  useEffect(() => {
    if (cameraOpen && streamRef.current) {
      attachStreamToVideo(streamRef.current);
    }
  }, [cameraOpen]);

  useEffect(() => {
    const onEsc = (e) => {
      if (e.key === 'Escape' && cameraOpen) {
        closeCamera();
      }
    };
    window.addEventListener('keydown', onEsc);
    return () => window.removeEventListener('keydown', onEsc);
  }, [cameraOpen]);

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;

    if (!video.videoWidth || !video.videoHeight) {
      setCameraError('Camera is not ready yet. Please try again.');
      return;
    }

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    onImageChange(dataUrl);
    onError?.('');
    closeCamera();
  };

  return (
    <div className="p-4 sm:p-6 border-b border-slate-200/70 bg-slate-50/60">
      <p className="text-sm font-semibold text-slate-700 mb-2">Complaint Image <span className="text-rose-500">*</span></p>
      <div
        className={`relative w-full min-h-[220px] sm:min-h-64 rounded-2xl overflow-hidden group transition-all border-2 border-dashed cursor-pointer ${dragActive
            ? 'border-indigo-400 bg-indigo-50'
            : error
              ? 'border-rose-300 bg-rose-50/40'
              : 'border-slate-300 bg-white'
          }`}
        onClick={openUploadPicker}
        onDragOver={(e) => {
          if (isTouchDevice) return;
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => {
          if (isTouchDevice) return;
          setDragActive(false);
        }}
        onDrop={handleDrop}
      >
        {image ? (
          <>
            <img src={image} alt="Complaint Preview" className="w-full h-full min-h-[220px] sm:min-h-64 object-cover" />
            <div className="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <div className="bg-white/90 px-4 py-2 rounded-full flex items-center gap-2 text-sm font-medium text-slate-800 shadow-sm">
                <Camera className="w-4 h-4" /> Change Photo
              </div>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onImageChange('');
                onError?.('Image is required');
              }}
              className="absolute top-3 right-3 bg-white/90 hover:bg-white text-rose-600 p-2 rounded-lg shadow transition-colors"
              aria-label="Remove image"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-500 hover:text-indigo-600 transition-colors px-4 text-center py-10">
            <div className="w-16 h-16 bg-slate-100 rounded-full shadow-sm flex items-center justify-center mb-3">
              <ImagePlus className="w-8 h-8" />
            </div>
            <p className="font-medium">Upload or capture image</p>
            <p className="text-xs text-slate-400 mt-1">Drag & drop, browse, or use camera (Max 5MB)</p>
            <div className="mt-4 flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  openUploadPicker();
                }}
                className="inline-flex items-center justify-center gap-2 text-xs px-3 py-2 rounded-full bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200 transition-colors min-w-[140px]"
              >
                <Upload className="w-3.5 h-3.5" /> Upload
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  openDeviceCamera();
                }}
                disabled={cameraLoading}
                className="inline-flex items-center justify-center gap-2 text-xs px-3 py-2 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100 hover:bg-indigo-100 transition-colors disabled:opacity-70 min-w-[140px]"
              >
                <Camera className="w-3.5 h-3.5" /> {cameraLoading ? 'Opening...' : 'Capture Image'}
              </button>
            </div>
          </div>
        )}
      </div>

      {error && <p className="text-rose-600 text-sm mt-2">{error}</p>}
      {cameraError && <p className="text-rose-600 text-sm mt-2">{cameraError}</p>}

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      <input
        type="file"
        ref={cameraInputRef}
        onChange={handleCameraFileChange}
        accept="image/*"
        capture="environment"
        className="hidden"
      />

      {cameraOpen && (
        <div className="fixed inset-0 z-[140] bg-black/65 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[92vh] flex flex-col">
            <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-800">Capture Complaint Image</h3>
              <button
                type="button"
                onClick={closeCamera}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600"
                aria-label="Close camera"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-black flex-1">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full aspect-[3/4] sm:aspect-video object-cover"
              />
            </div>

            <div className="p-4 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2">
              <button
                type="button"
                onClick={closeCamera}
                className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 text-sm font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={capturePhoto}
                className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 text-sm font-medium inline-flex items-center gap-2"
              >
                <Check className="w-4 h-4" /> Use Photo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

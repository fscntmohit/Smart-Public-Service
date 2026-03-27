import { useEffect, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default Leaflet marker icons in React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Component to dynamically update map center when GPS location is acquired
function MapUpdater({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center[0] && center[1]) {
      map.setView(center, 16);
    }
  }, [center, map]);
  return null;
}

export default function LocationMap({ latitude, longitude, onLocationChange }) {
  const markerRef = useRef(null);

  const defaultCenter = [28.6139, 77.2090]; // Default New Delhi
  const mapCenter = latitude && longitude ? [latitude, longitude] : defaultCenter;

  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          const position = marker.getLatLng();
          onLocationChange(position.lat, position.lng);
        }
      },
    }),
    [onLocationChange]
  );

  return (
    <div className="h-64 sm:h-80 w-full rounded-xl overflow-hidden border border-slate-200 shadow-inner z-0 relative">
      <MapContainer
        center={mapCenter}
        zoom={latitude ? 16 : 11}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {(latitude && longitude) && (
          <Marker
            draggable={true}
            eventHandlers={eventHandlers}
            position={[latitude, longitude]}
            ref={markerRef}
          />
        )}
        <MapUpdater center={mapCenter} />
      </MapContainer>

      {!latitude && (
        <div className="absolute inset-0 bg-slate-900/10 flex items-center justify-center z-[1000] backdrop-blur-[1px]">
          <div className="bg-white px-4 py-2 rounded-full text-sm font-medium text-slate-700 shadow-md">
            Waiting for location...
          </div>
        </div>
      )}
    </div>
  );
}

import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import api from '../lib/axios';
import { MapPin, Navigation, User, Loader2, AlertCircle } from 'lucide-react';

// Fix leaflet default icon (broken in Vite/webpack)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom user marker icon (blue dot)
const myIcon = L.divIcon({
  html: `<div style="
    width:18px;height:18px;
    background:radial-gradient(circle, #06b6d4 0%, #2563eb 100%);
    border:3px solid white;
    border-radius:50%;
    box-shadow:0 2px 8px rgba(6,182,212,0.6);
  "></div>`,
  className: '',
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

// Custom profile pin with photo
const profileIcon = (photo, name) => L.divIcon({
  html: `<div style="
    display:flex;flex-direction:column;align-items:center;gap:2px;
    filter:drop-shadow(0 2px 6px rgba(0,0,0,0.25));
  ">
    <div style="
      width:44px;height:44px;border-radius:50%;overflow:hidden;
      border:3px solid white;background:#e2e8f0;
    ">
      ${photo
        ? `<img src="${photo}" style="width:100%;height:100%;object-fit:cover;" onerror="this.style.display='none'" />`
        : `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#06b6d4,#2563eb);color:white;font-weight:800;font-size:16px;">${name.charAt(0)}</div>`
      }
    </div>
    <div style="
      background:white;border-radius:100px;padding:2px 6px;
      font-size:10px;font-weight:700;color:#1e293b;
      white-space:nowrap;box-shadow:0 1px 4px rgba(0,0,0,0.15);
    ">${name}</div>
  </div>`,
  className: '',
  iconSize: [44, 60],
  iconAnchor: [22, 60],
  popupAnchor: [0, -60],
});

// Helper: re-centers map when center changes
function MapController({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

export function NearbyMap({ onViewProfile }) {
  const [users, setUsers]           = useState([]);
  const [myPos, setMyPos]           = useState(null);
  const [profileLoc, setProfileLoc] = useState(null);
  const [loading, setLoading]       = useState(true);
  const [geoError, setGeoError]     = useState(null);
  const [selectedUser, setSelected] = useState(null);

  // Fetch nearby users from API
  useEffect(() => {
    api.get('/api/profiles/nearby')
      .then(r => {
        setUsers(r.data.users || []);
        if (r.data.myLocation?.lat && r.data.myLocation?.lon) {
          setProfileLoc([r.data.myLocation.lat, r.data.myLocation.lon]);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Get real-time GPS for map center
  useEffect(() => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation not supported by this browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      pos => setMyPos([pos.coords.latitude, pos.coords.longitude]),
      () => setGeoError('Location access denied. Using profile location instead.'),
      { timeout: 8000 }
    );
  }, []);

  const mapCenter = myPos || profileLoc || [20.5937, 78.9629]; // Default: India center
  const defaultZoom = myPos || profileLoc ? 12 : 5;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-3 text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
        <p className="text-sm font-medium">Loading nearby people…</p>
      </div>
    );
  }

  return (
    <div className="relative w-full rounded-3xl overflow-hidden shadow-xl border border-slate-200" style={{ height: 'calc(100vh - 120px)', minHeight: '500px' }}>

      {/* Map */}
      <MapContainer
        center={mapCenter}
        zoom={defaultZoom}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapController center={mapCenter} />

        {/* My GPS position */}
        {myPos && (
          <Marker position={myPos} icon={myIcon}>
            <Popup className="leaflet-popup-custom">
              <div className="text-center text-xs font-semibold text-cyan-700 py-1">📍 You are here</div>
            </Popup>
          </Marker>
        )}

        {/* User pins */}
        {users.map(u => (
          <Marker
            key={u.id}
            position={[u.latitude, u.longitude]}
            icon={profileIcon(u.photo, u.name)}
            eventHandlers={{ click: () => setSelected(u) }}
          >
            <Popup className="leaflet-popup-custom" minWidth={180}>
              <div className="p-1 space-y-2">
                <div className="flex items-center gap-3">
                  {u.photo
                    ? <img src={u.photo} className="w-12 h-12 rounded-full object-cover border-2 border-cyan-200" alt={u.name} />
                    : <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg">{u.name.charAt(0)}</div>
                  }
                  <div>
                    <p className="font-bold text-slate-900 text-sm">{u.name}, {u.age}</p>
                    <p className="text-xs text-slate-500">{u.city}</p>
                    {u.distance !== null && (
                      <p className="text-xs text-cyan-600 font-semibold">{u.distance} km away</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => onViewProfile?.(u.id)}
                  className="w-full text-xs bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg py-1.5 font-semibold hover:opacity-90 transition-opacity"
                >
                  View Profile →
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Top overlay: stats */}
      <div className="absolute top-4 left-4 right-4 z-[999] flex items-start justify-between pointer-events-none">
        <div className="bg-white/90 backdrop-blur-md rounded-2xl px-4 py-2.5 shadow-lg border border-white/50 pointer-events-auto">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-cyan-600" />
            <span className="text-sm font-bold text-slate-800">
              {users.length} {users.length === 1 ? 'person' : 'people'} nearby
            </span>
          </div>
          {geoError && (
            <p className="text-xs text-amber-600 mt-0.5 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> {geoError}
            </p>
          )}
        </div>

        {myPos && (
          <div className="bg-white/90 backdrop-blur-md rounded-2xl px-3 py-2 shadow-lg border border-white/50 pointer-events-auto">
            <div className="flex items-center gap-1.5">
              <Navigation className="w-3.5 h-3.5 text-cyan-600" />
              <span className="text-xs font-semibold text-slate-700">Live location</span>
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="absolute bottom-6 left-4 z-[999] pointer-events-none">
        <div className="bg-white/90 backdrop-blur-md rounded-xl px-3 py-2 shadow-md border border-white/50 space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 border border-white shadow" />
            <span className="text-xs text-slate-600">You</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-white border-2 border-slate-300" />
            <span className="text-xs text-slate-600">Other users</span>
          </div>
        </div>
      </div>
    </div>
  );
}

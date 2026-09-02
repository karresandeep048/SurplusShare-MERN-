import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ArrowLeft, CheckCircle2, ShieldCheck, MapPin, Navigation } from 'lucide-react';

// Custom icons
const createVehicleIcon = () => L.divIcon({
    html: `
        <div class="relative w-12 h-12 flex items-center justify-center">
            <div class="absolute inset-0 bg-brand-500 rounded-full animate-ping opacity-25"></div>
            <div class="relative z-10 w-10 h-10 bg-white rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.15)] border-2 border-brand-500 overflow-hidden flex items-center justify-center p-1.5">
                <img src="https://cdn-icons-png.flaticon.com/512/3063/3063822.png" alt="Vehicle" class="w-full h-full object-contain" />
            </div>
        </div>
    `,
    className: '',
    iconSize: [48, 48],
    iconAnchor: [24, 24]
});

const PickupIcon = L.divIcon({
    html: `
        <div class="w-8 h-8 rounded-full bg-brand-600 text-white flex items-center justify-center font-bold shadow-lg border-2 border-white">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
        </div>
    `,
    className: '',
    iconSize: [32, 32],
    iconAnchor: [16, 32]
});

const OrderTracker = () => {
    const { code } = useParams();
    const [progress, setProgress] = useState(0); // 0 to 1
    const [arrived, setArrived] = useState(false);

    // Dummy coordinates in Bengaluru
    const startLoc = [12.9279, 77.5871]; // Jayanagar
    const endLoc = [12.9352, 77.6245];   // Koramangala

    // Calculate current position along the line based on progress
    const currentLat = startLoc[0] + (endLoc[0] - startLoc[0]) * progress;
    const currentLng = startLoc[1] + (endLoc[1] - startLoc[1]) * progress;

    useEffect(() => {
        const duration = 12000; // 12 seconds for demo
        const interval = 50;
        const steps = duration / interval;
        let step = 0;

        const timer = setInterval(() => {
            step += 1;
            const newProgress = Math.min(step / steps, 1);
            setProgress(newProgress);

            if (newProgress >= 1) {
                setArrived(true);
                clearInterval(timer);
            }
        }, interval);

        return () => clearInterval(timer);
    }, []);

    // Estimate time
    const minsLeft = Math.max(1, Math.ceil(12 * (1 - progress)));

    return (
        <div className="h-[calc(100vh-64px)] flex flex-col md:flex-row -mx-4 md:-mx-8 overflow-hidden bg-gray-50 relative">

            {/* Left Panel: Tracker Details */}
            <div className="w-full md:w-1/3 lg:w-1/4 h-full bg-white shadow-xl z-20 flex flex-col justify-between">
                <div>
                    <div className="p-6 border-b border-gray-100">
                        <Link to="/my-reservations" className="inline-flex items-center text-sm font-medium text-gray-400 hover:text-gray-900 mb-6 transition-colors">
                            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
                        </Link>
                        <div className="flex items-center justify-between mb-2">
                            <h2 className="text-2xl font-black text-gray-900">Live Status</h2>
                            <span className="text-brand-600 bg-brand-50 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest animate-pulse">
                                Active
                            </span>
                        </div>
                        <p className="text-gray-500 font-medium text-sm">Reservation Code: <span className="font-bold text-gray-900">{code}</span></p>
                    </div>

                    <div className="p-6">
                        {arrived ? (
                            <div className="text-center py-6 bg-brand-50 rounded-2xl border border-brand-100">
                                <CheckCircle2 className="w-12 h-12 text-brand-600 mx-auto mb-3" />
                                <h3 className="text-xl font-bold text-gray-900 mb-1">Arrived at Location</h3>
                                <p className="text-sm font-medium text-brand-700">Please present your code to collect.</p>
                            </div>
                        ) : (
                            <div className="flex items-start mb-8 text-center p-6 bg-blue-50/50 rounded-2xl border border-blue-50">
                                <div className="mx-auto flex flex-col items-center">
                                    <h1 className="text-4xl font-black text-blue-600 mb-1">{minsLeft} <span className="text-xl">min</span></h1>
                                    <p className="text-gray-500 font-semibold text-sm">Estimated arrival time</p>
                                </div>
                            </div>
                        )}

                        <div className="relative pl-6 border-l-2 border-gray-100 space-y-6">
                            <div className="relative">
                                <span className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-brand-600 ring-4 ring-white"></span>
                                <h4 className="font-bold text-gray-900 text-sm">Order Confirmed</h4>
                                <p className="text-xs text-gray-500 font-medium">Your surplus food is reserved.</p>
                            </div>
                            <div className="relative">
                                <span className={`absolute -left-[31px] top-0 w-4 h-4 rounded-full ring-4 ring-white transition-colors ${progress > 0.1 ? 'bg-brand-600' : 'bg-gray-200'}`}></span>
                                <h4 className={`font-bold text-sm ${progress > 0.1 ? 'text-gray-900' : 'text-gray-400'}`}>On the Way</h4>
                                <p className="text-xs text-gray-400 font-medium tracking-wide">Navigating to pickup point.</p>
                            </div>
                            <div className="relative">
                                <span className={`absolute -left-[31px] top-0 w-4 h-4 rounded-full ring-4 ring-white transition-colors ${arrived ? 'bg-brand-600' : 'bg-gray-200'}`}></span>
                                <h4 className={`font-bold text-sm ${arrived ? 'text-gray-900' : 'text-gray-400'}`}>Ready for Pickup</h4>
                                <p className="text-xs text-gray-400 font-medium tracking-wide">Handshake at the venue.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-6 bg-gray-50 border-t border-gray-100">
                    <div className="flex items-center space-x-3 text-sm font-semibold text-gray-700">
                        <ShieldCheck className="w-5 h-5 text-green-500" />
                        <span>Pickup code secured safely.</span>
                    </div>
                </div>
            </div>

            {/* Right Panel: Active Map */}
            <div className="w-full md:w-2/3 lg:w-3/4 h-[50vh] md:h-full relative z-10">
                <MapContainer
                    center={endLoc}
                    zoom={13}
                    scrollWheelZoom={false}
                    zoomControl={false}
                    style={{ height: '100%', width: '100%' }}
                >
                   <TileLayer
    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
/>
                    {/* The path line */}
                    <Polyline
                        positions={[startLoc, endLoc]}
                        color="#10B981"
                        weight={4}
                        dashArray="6 6"
                        opacity={0.6}
                    />

                    {/* Pickup Destination */}
                    <Marker position={endLoc} icon={PickupIcon} />

                    {/* Moving Vehicle */}
                    {currentLat && (
                        <Marker position={[currentLat, currentLng]} icon={createVehicleIcon()} />
                    )}
                </MapContainer>

                {/* Floating Map Overlay */}
                <div className="absolute top-6 left-6 z-[400] bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl shadow-lg border border-gray-100 flex items-center">
                    <Navigation className="w-5 h-5 text-brand-600 mr-2" />
                    <span className="font-bold text-gray-900 text-sm">Tracking Navigation Live</span>
                </div>
            </div>

        </div>
    );
};

export default OrderTracker;

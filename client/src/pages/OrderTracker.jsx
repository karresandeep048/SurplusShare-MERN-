import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
    ArrowLeft, 
    CheckCircle2, 
    ShieldCheck, 
    MapPin, 
    Navigation, 
    Bell, 
    Copy, 
    Check, 
    Clock, 
    Package,
    Loader2 
} from 'lucide-react';

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
    const [donorNotified, setDonorNotified] = useState(false);
    const [notifying, setNotifying] = useState(false);
    const [copied, setCopied] = useState(false);
    const [reservationData, setReservationData] = useState(null);

    // Initial coordinates
    const [startLoc, setStartLoc] = useState([12.9279, 77.5871]);
    const [endLoc, setEndLoc] = useState([12.9352, 77.6245]);

    // Fetch reservation details
    useEffect(() => {
        const fetchReservation = async () => {
            try {
                const { data } = await axios.get('/api/reservations/my');
                const match = data.find(r => r.pickupCode === code);
                if (match) {
                    setReservationData(match);
                    if (match.pickerArrived) {
                        setArrived(true);
                        setDonorNotified(true);
                    }
                    if (match.foodListing?.coordinates?.lat && match.foodListing?.coordinates?.lng) {
                        setEndLoc([match.foodListing.coordinates.lat, match.foodListing.coordinates.lng]);
                    }
                }
            } catch (err) {
                console.error('Error fetching reservation in tracker:', err);
            }
        };
        fetchReservation();
    }, [code]);

    // Send arrival notification to food donor
    const handleNotifyArrival = async () => {
        setNotifying(true);
        try {
            await axios.post('/api/reservations/notify-arrival', { pickupCode: code });
            setDonorNotified(true);
            setArrived(true);
            setProgress(1);
        } catch (err) {
            console.error('Error notifying donor of arrival:', err);
        } finally {
            setNotifying(false);
        }
    };

    // Calculate current position along the line based on progress
    const currentLat = startLoc[0] + (endLoc[0] - startLoc[0]) * progress;
    const currentLng = startLoc[1] + (endLoc[1] - startLoc[1]) * progress;

    useEffect(() => {
        if (arrived) return;

        const duration = 12000; // 12 seconds simulation
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
                // Trigger arrival notification
                handleNotifyArrival();
            }
        }, interval);

        return () => clearInterval(timer);
    }, [arrived]);

    const handleCopy = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Estimate time
    const minsLeft = Math.max(1, Math.ceil(12 * (1 - progress)));

    return (
        <div className="h-[calc(100vh-64px)] flex flex-col md:flex-row -mx-4 md:-mx-8 overflow-hidden bg-gray-50 relative">

            {/* Left Panel: Tracker Details */}
            <div className="w-full md:w-5/12 lg:w-4/12 h-full bg-white shadow-xl z-20 flex flex-col justify-between overflow-y-auto">
                <div>
                    <div className="p-6 border-b border-gray-100">
                        <Link to="/my-reservations" className="inline-flex items-center text-sm font-semibold text-gray-500 hover:text-brand-600 mb-4 transition-colors">
                            <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to My Reservations
                        </Link>
                        <div className="flex items-center justify-between mb-1">
                            <h2 className="text-2xl font-black text-gray-900">Live Pickup Status</h2>
                            <span className="text-brand-700 bg-brand-50 border border-brand-200 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider animate-pulse">
                                {arrived ? 'ARRIVED' : 'EN ROUTE'}
                            </span>
                        </div>
                        {reservationData?.foodListing && (
                            <p className="text-sm font-bold text-gray-700 mt-1">
                                {reservationData.foodListing.foodName} • {reservationData.quantity} {reservationData.foodListing.unit}
                            </p>
                        )}
                    </div>

                    <div className="p-6 space-y-6">

                        {/* Confirmation Code Card */}
                        <div className="bg-gradient-to-br from-brand-50 to-emerald-50 border-2 border-brand-200 rounded-3xl p-5 text-center shadow-sm">
                            <span className="text-xs font-bold text-brand-800 uppercase tracking-widest block mb-1">
                                Your 6-Digit Pickup Confirmation Code
                            </span>
                            <div className="flex items-center justify-center gap-3 my-2">
                                <span className="text-4xl font-black text-gray-900 tracking-widest font-mono">
                                    {code}
                                </span>
                                <button
                                    onClick={handleCopy}
                                    className="p-2 bg-white hover:bg-brand-100 text-brand-700 border border-brand-200 rounded-xl transition-all shadow-sm"
                                    title="Copy Code"
                                >
                                    {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                                </button>
                            </div>
                            <p className="text-xs text-brand-700 font-medium">
                                Present this code to the food donor to verify and complete handover.
                            </p>
                        </div>

                        {/* Arrival Notification Alert */}
                        {donorNotified ? (
                            <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-start gap-3 animate-fade-in">
                                <div className="p-2 bg-green-100 text-green-700 rounded-full shrink-0">
                                    <Bell className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-green-900">Food Donor Notified!</h4>
                                    <p className="text-xs text-green-700 font-medium mt-0.5">
                                        The surplus food poster has received notification of your arrival. Show your code <span className="font-bold">{code}</span> for collection.
                                    </p>
                                </div>
                            </div>
                        ) : arrived ? (
                            <div className="text-center py-4 bg-brand-50 rounded-2xl border border-brand-100">
                                <CheckCircle2 className="w-10 h-10 text-brand-600 mx-auto mb-2" />
                                <h3 className="text-lg font-bold text-gray-900 mb-1">Arrived at Venue</h3>
                                <button
                                    onClick={handleNotifyArrival}
                                    disabled={notifying}
                                    className="mt-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-md transition-all inline-flex items-center"
                                >
                                    {notifying ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <Bell className="w-4 h-4 mr-1.5" />}
                                    Send Arrival Alert to Donor
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center justify-between p-4 bg-blue-50/70 rounded-2xl border border-blue-100">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-blue-100 text-blue-600 rounded-xl">
                                        <Clock className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-black text-blue-900">{minsLeft} mins</h4>
                                        <p className="text-xs text-blue-700 font-medium">Estimated arrival</p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleNotifyArrival}
                                    className="text-xs font-bold text-brand-700 bg-white hover:bg-brand-50 border border-brand-200 px-3 py-2 rounded-xl shadow-sm transition-all"
                                >
                                    I'm Already Here
                                </button>
                            </div>
                        )}

                        {/* Step progress line */}
                        <div className="relative pl-6 border-l-2 border-gray-100 space-y-6 pt-2">
                            <div className="relative">
                                <span className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-brand-600 ring-4 ring-white"></span>
                                <h4 className="font-bold text-gray-900 text-sm">Food Reserved</h4>
                                <p className="text-xs text-gray-500 font-medium">Code generated: <span className="font-bold">{code}</span></p>
                            </div>
                            <div className="relative">
                                <span className={`absolute -left-[31px] top-0 w-4 h-4 rounded-full ring-4 ring-white transition-colors ${progress > 0.1 ? 'bg-brand-600' : 'bg-gray-200'}`}></span>
                                <h4 className={`font-bold text-sm ${progress > 0.1 ? 'text-gray-900' : 'text-gray-400'}`}>Navigating to Venue</h4>
                                <p className="text-xs text-gray-400 font-medium tracking-wide">
                                    {reservationData?.foodListing?.location || 'Bengaluru location'}
                                </p>
                            </div>
                            <div className="relative">
                                <span className={`absolute -left-[31px] top-0 w-4 h-4 rounded-full ring-4 ring-white transition-colors ${arrived ? 'bg-brand-600' : 'bg-gray-200'}`}></span>
                                <h4 className={`font-bold text-sm ${arrived ? 'text-gray-900' : 'text-gray-400'}`}>Arrived & Handover</h4>
                                <p className="text-xs text-gray-400 font-medium tracking-wide">Present confirmation code to donor.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-5 bg-gray-50 border-t border-gray-100 flex items-center space-x-3 text-xs font-semibold text-gray-600">
                    <ShieldCheck className="w-5 h-5 text-brand-600 shrink-0" />
                    <span>Donor matches your code before release to prevent food waste.</span>
                </div>
            </div>

            {/* Right Panel: Active Map */}
            <div className="w-full md:w-7/12 lg:w-8/12 h-[50vh] md:h-full relative z-10">
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
                <div className="absolute top-6 left-6 z-[400] bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl shadow-lg border border-gray-100 flex items-center gap-2">
                    <Navigation className="w-5 h-5 text-brand-600" />
                    <span className="font-bold text-gray-900 text-sm">
                        {arrived ? 'Arrived at Pickup Venue' : 'Live Navigation Tracking'}
                    </span>
                </div>
            </div>

        </div>
    );
};

export default OrderTracker;

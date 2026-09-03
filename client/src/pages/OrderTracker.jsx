import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Polyline, Popup } from 'react-leaflet';
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
    Loader2,
    QrCode,
    X,
    Sparkles,
    AlertCircle,
    Mail,
    Send
} from 'lucide-react';

// Custom icons
const createVehicleIcon = () => L.divIcon({
    html: `
        <div class="relative w-12 h-12 flex items-center justify-center">
            <div class="absolute inset-0 bg-brand-500 rounded-full animate-ping opacity-25"></div>
            <div class="relative z-10 w-10 h-10 bg-white rounded-full shadow-[0_4px_16px_rgba(0,0,0,0.15)] border-2 border-brand-500 overflow-hidden flex items-center justify-center p-1.5">
                <span class="text-xl">🛵</span>
            </div>
        </div>
    `,
    className: '',
    iconSize: [48, 48],
    iconAnchor: [24, 24]
});

const PickupIcon = L.divIcon({
    html: `
        <div class="w-9 h-9 rounded-2xl bg-brand-600 text-white flex items-center justify-center font-bold shadow-xl border-2 border-white">
            <span class="text-base">📍</span>
        </div>
    `,
    className: '',
    iconSize: [36, 36],
    iconAnchor: [18, 36]
});

const OrderTracker = () => {
    const { code } = useParams();
    const [progress, setProgress] = useState(0.2); // 0 to 1
    const [arrived, setArrived] = useState(false);
    const [donorNotified, setDonorNotified] = useState(false);
    const [notifying, setNotifying] = useState(false);
    const [copied, setCopied] = useState(false);
    const [showQr, setShowQr] = useState(false);
    const [reservationData, setReservationData] = useState(null);
    const [loadingRes, setLoadingRes] = useState(true);

    // Email sending states
    const [emailSending, setEmailSending] = useState(false);
    const [emailSuccessMsg, setEmailSuccessMsg] = useState(null);
    const [emailErrorMsg, setEmailErrorMsg] = useState(null);
    const [showCustomEmail, setShowCustomEmail] = useState(false);
    const [customEmail, setCustomEmail] = useState('');

    const [startLoc, setStartLoc] = useState([12.9279, 77.5871]); // User simulated starting location
    const [endLoc, setEndLoc] = useState([12.9352, 77.6245]); // Food venue location

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
                        setProgress(1);
                    }
                    if (match.foodListing?.coordinates?.lat && match.foodListing?.coordinates?.lng) {
                        setEndLoc([match.foodListing.coordinates.lat, match.foodListing.coordinates.lng]);
                    }
                }
            } catch (err) {
                console.error('Error fetching reservation in tracker:', err);
            } finally {
                setLoadingRes(false);
            }
        };
        fetchReservation();
    }, [code]);

    // Send arrival alert to food donor
    const handleNotifyArrival = async () => {
        setNotifying(true);
        try {
            await axios.post('/api/reservations/notify-arrival', { pickupCode: code });
            setDonorNotified(true);
            setArrived(true);
            setProgress(1);
        } catch (err) {
            console.error('Error notifying arrival:', err);
        } finally {
            setNotifying(false);
        }
    };

    // Handle sending/resending digital pickup pass via email
    const handleSendEmailPass = async (overrideEmail = null) => {
        setEmailSending(true);
        setEmailSuccessMsg(null);
        setEmailErrorMsg(null);
        try {
            const target = overrideEmail || customEmail || reservationData?.receiver?.email;
            const { data } = await axios.post('/api/reservations/resend-email', {
                pickupCode: code,
                customEmail: target
            });
            setEmailSuccessMsg(data.message || `✓ Pickup Pass successfully emailed to ${target}!`);
            setShowCustomEmail(false);
            setCustomEmail('');
        } catch (err) {
            setEmailErrorMsg(err.response?.data?.message || 'Failed to dispatch email pass. Please try again.');
        } finally {
            setEmailSending(false);
        }
    };

    // Calculate current position along the line based on progress
    const currentLat = startLoc[0] + (endLoc[0] - startLoc[0]) * progress;
    const currentLng = startLoc[1] + (endLoc[1] - startLoc[1]) * progress;

    // Movement Simulation
    useEffect(() => {
        if (arrived) return;

        const duration = 14000;
        const interval = 60;
        const steps = duration / interval;
        let step = 0;

        const timer = setInterval(() => {
            step += 1;
            const newProgress = Math.min(step / steps, 1);
            setProgress(newProgress);

            if (newProgress >= 1) {
                setArrived(true);
                clearInterval(timer);
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

    const minsLeft = Math.max(1, Math.ceil(10 * (1 - progress)));

    return (
        <div className="h-[calc(100vh-64px)] flex flex-col md:flex-row overflow-hidden bg-slate-50 relative">

            {/* Left Column: Tracking Progression & Pickup Code */}
            <div className="w-full md:w-5/12 lg:w-4/12 h-full bg-white shadow-2xl z-20 flex flex-col justify-between overflow-y-auto border-r border-slate-200/80">
                <div>
                    {/* Header */}
                    <div className="p-6 border-b border-slate-100">
                        <Link 
                            to="/my-reservations" 
                            className="inline-flex items-center text-xs font-bold text-slate-500 hover:text-brand-600 mb-3 transition-colors"
                        >
                            <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back to My Reservations
                        </Link>
                        
                        <div className="flex items-center justify-between mb-1">
                            <h2 className="text-2xl font-black text-slate-900">Live Pickup Pass</h2>
                            <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${
                                arrived 
                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                                    : 'bg-blue-50 text-blue-800 border-blue-200 animate-pulse'
                            }`}>
                                {arrived ? 'ARRIVED' : 'EN ROUTE'}
                            </span>
                        </div>

                        {reservationData?.foodListing && (
                            <p className="text-xs font-bold text-slate-600 mt-1">
                                {reservationData.foodListing.foodName} • {reservationData.quantity} {reservationData.foodListing.unit}
                            </p>
                        )}
                    </div>

                    <div className="p-6 space-y-6">

                        {/* 6-Digit Code Card */}
                        <div className="bg-gradient-to-br from-brand-50 via-emerald-50 to-teal-50 border-2 border-brand-200 rounded-3xl p-6 text-center shadow-sm">
                            <span className="text-[10px] font-black text-brand-800 uppercase tracking-widest block mb-1">
                                Your 6-Digit Pickup Confirmation Code
                            </span>
                            
                            <div className="flex items-center justify-center gap-3 my-3">
                                <span className="text-4xl font-black text-slate-900 tracking-widest font-mono">
                                    {code}
                                </span>
                                <button
                                    onClick={handleCopy}
                                    className="p-2.5 bg-white hover:bg-brand-100 text-brand-700 border border-brand-200 rounded-xl transition-all shadow-sm"
                                    title="Copy Code"
                                >
                                    {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                                </button>
                                <button
                                    onClick={() => setShowQr(!showQr)}
                                    className="p-2.5 bg-white hover:bg-brand-100 text-brand-700 border border-brand-200 rounded-xl transition-all shadow-sm"
                                    title="Display QR"
                                >
                                    <QrCode className="w-4 h-4" />
                                </button>
                            </div>

                            <p className="text-xs text-brand-800 font-medium">
                                Show this code to the donor at the pickup venue to verify and release the surplus food.
                            </p>
                        </div>

                        {/* Email Pass & Delivery Options Card */}
                        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="p-1.5 bg-emerald-100 text-emerald-700 rounded-lg">
                                        <Mail className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-bold text-slate-900">Email Pickup Pass</h4>
                                        <p className="text-[11px] text-slate-500">
                                            Sent to: <span className="font-semibold text-slate-700">{reservationData?.receiver?.email || 'Your Account Email'}</span>
                                        </p>
                                    </div>
                                </div>
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                                    <Check className="w-3 h-3" /> Email Sent
                                </span>
                            </div>

                            {/* Success & Error Messages */}
                            {emailSuccessMsg && (
                                <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-800 flex items-center gap-1.5 animate-fade-in">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                    <span>{emailSuccessMsg}</span>
                                </div>
                            )}
                            {emailErrorMsg && (
                                <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold text-rose-800 flex items-center gap-1.5 animate-fade-in">
                                    <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                                    <span>{emailErrorMsg}</span>
                                </div>
                            )}

                            {/* Action Buttons */}
                            {!showCustomEmail ? (
                                <div className="flex items-center gap-2 pt-1">
                                    <button
                                        onClick={() => handleSendEmailPass()}
                                        disabled={emailSending}
                                        className="flex-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold py-2 px-3 rounded-xl transition flex items-center justify-center gap-1.5 shadow-sm"
                                    >
                                        {emailSending ? <Loader2 className="w-3 h-3 animate-spin text-brand-600" /> : <Send className="w-3 h-3 text-brand-600" />}
                                        <span>Resend Email Pass</span>
                                    </button>
                                    <button
                                        onClick={() => setShowCustomEmail(true)}
                                        className="text-xs font-bold text-brand-700 hover:text-brand-800 px-3 py-2 underline"
                                    >
                                        Email to another address
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-2 pt-1">
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="email"
                                            placeholder="Enter recipient email address..."
                                            value={customEmail}
                                            onChange={(e) => setCustomEmail(e.target.value)}
                                            className="flex-1 text-xs border border-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                                        />
                                        <button
                                            onClick={() => handleSendEmailPass(customEmail)}
                                            disabled={emailSending || !customEmail.trim()}
                                            className="bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white text-xs font-bold px-3 py-2 rounded-xl transition shadow-sm flex items-center gap-1 shrink-0"
                                        >
                                            {emailSending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                                            <span>Send</span>
                                        </button>
                                        <button
                                            onClick={() => setShowCustomEmail(false)}
                                            className="text-xs text-slate-400 hover:text-slate-600 p-2"
                                        >
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Arrival Alert Status Banner */}
                        {donorNotified ? (
                            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-start gap-3 animate-fade-in">
                                <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl shrink-0">
                                    <Bell className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="text-xs font-black text-emerald-900 uppercase">Food Donor Notified!</h4>
                                    <p className="text-xs text-emerald-800 font-medium mt-0.5">
                                        The venue has received notification of your arrival. Present code <span className="font-bold">{code}</span>.
                                    </p>
                                </div>
                            </div>
                        ) : arrived ? (
                            <div className="text-center py-4 bg-brand-50 rounded-2xl border border-brand-100 p-4">
                                <CheckCircle2 className="w-8 h-8 text-brand-600 mx-auto mb-2" />
                                <h3 className="text-base font-black text-slate-900 mb-1">Arrived at Venue</h3>
                                <button
                                    onClick={handleNotifyArrival}
                                    disabled={notifying}
                                    className="mt-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md transition-all inline-flex items-center gap-1.5"
                                >
                                    {notifying ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Bell className="w-3.5 h-3.5" />}
                                    <span>Send Arrival Alert to Donor</span>
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center justify-between p-4 bg-blue-50/70 rounded-2xl border border-blue-100">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-blue-100 text-blue-600 rounded-xl">
                                        <Clock className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-black text-blue-950">~{minsLeft} mins</h4>
                                        <p className="text-xs text-blue-700 font-medium">Estimated arrival</p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleNotifyArrival}
                                    className="text-xs font-bold text-brand-700 bg-white hover:bg-brand-50 border border-brand-200 px-3 py-2 rounded-xl shadow-sm transition-all"
                                >
                                    I'm Here Now
                                </button>
                            </div>
                        )}

                        {/* Step-by-Step Progression Timeline */}
                        <div className="relative pl-6 border-l-2 border-slate-100 space-y-6 pt-2">
                            <div className="relative">
                                <span className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-brand-600 ring-4 ring-white"></span>
                                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">1. Reservation Claimed</h4>
                                <p className="text-xs text-slate-500 font-medium mt-0.5">Code generated: <strong className="text-slate-800">{code}</strong></p>
                            </div>

                            <div className="relative">
                                <span className={`absolute -left-[31px] top-0.5 w-4 h-4 rounded-full ring-4 ring-white transition-colors ${progress > 0.2 ? 'bg-brand-600' : 'bg-slate-300'}`}></span>
                                <h4 className={`font-bold text-xs uppercase tracking-wider ${progress > 0.2 ? 'text-slate-900' : 'text-slate-400'}`}>
                                    2. Live Navigation to Venue
                                </h4>
                                <p className="text-xs text-slate-500 font-medium mt-0.5">
                                    {reservationData?.foodListing?.location || 'Bengaluru location'}
                                </p>
                            </div>

                            <div className="relative">
                                <span className={`absolute -left-[31px] top-0.5 w-4 h-4 rounded-full ring-4 ring-white transition-colors ${arrived ? 'bg-brand-600' : 'bg-slate-300'}`}></span>
                                <h4 className={`font-bold text-xs uppercase tracking-wider ${arrived ? 'text-slate-900' : 'text-slate-400'}`}>
                                    3. Arrived & Verification
                                </h4>
                                <p className="text-xs text-slate-400 font-medium mt-0.5">
                                    Present your 6-digit confirmation code.
                                </p>
                            </div>
                        </div>

                    </div>
                </div>

                {/* Footer Security Badge */}
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center space-x-3 text-xs font-semibold text-slate-600">
                    <ShieldCheck className="w-5 h-5 text-brand-600 shrink-0" />
                    <span>Donor matches code before handover to protect food safety.</span>
                </div>
            </div>

            {/* Right Column: Live Route Map */}
            <div className="w-full md:w-7/12 lg:w-8/12 h-[50vh] md:h-full relative z-10">
                <MapContainer
                    center={endLoc}
                    zoom={13}
                    scrollWheelZoom={false}
                    style={{ height: '100%', width: '100%' }}
                >
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    />
                    
                    {/* Polyline Route */}
                    <Polyline
                        positions={[startLoc, endLoc]}
                        color="#10B981"
                        weight={5}
                        dashArray="6 8"
                        opacity={0.7}
                    />

                    {/* Venue Marker */}
                    <Marker position={endLoc} icon={PickupIcon}>
                        <Popup>
                            <div className="p-2 text-center">
                                <p className="font-bold text-xs">📍 Pickup Location</p>
                                <p className="text-[10px] text-slate-500">{reservationData?.foodListing?.location}</p>
                            </div>
                        </Popup>
                    </Marker>

                    {/* Vehicle Marker */}
                    {currentLat && (
                        <Marker position={[currentLat, currentLng]} icon={createVehicleIcon()} />
                    )}
                </MapContainer>

                {/* Floating Top Header on Map */}
                <div className="absolute top-4 left-4 z-[400] bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl shadow-lg border border-slate-100 flex items-center gap-2">
                    <Navigation className="w-4 h-4 text-brand-600" />
                    <span className="font-bold text-slate-900 text-xs">
                        {arrived ? 'Arrived at Destination' : 'Live Navigation Tracking'}
                    </span>
                </div>
            </div>

            {/* QR CODE MODAL */}
            {showQr && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl border border-slate-100 text-center relative animate-scale-up">
                        <button 
                            onClick={() => setShowQr(false)}
                            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full bg-slate-100"
                        >
                            <X className="w-4 h-4" />
                        </button>
                        <h3 className="text-lg font-black text-slate-900 mb-1">Pickup Verification QR</h3>
                        <p className="text-xs text-slate-500 mb-4">Show this to the food donor</p>

                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 inline-block mb-4">
                            <span className="text-3xl font-black font-mono tracking-widest text-brand-700">{code}</span>
                        </div>

                        <button
                            onClick={() => setShowQr(false)}
                            className="w-full py-3 bg-brand-600 text-white rounded-xl font-bold text-xs shadow-md"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}

        </div>
    );
};

export default OrderTracker;

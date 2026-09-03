import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Polyline, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { AuthContext } from '../context/AuthContext';
import { 
    ArrowLeft, 
    CheckCircle2, 
    ShieldCheck, 
    Navigation, 
    Bell, 
    Copy, 
    Check, 
    Clock, 
    Loader2, 
    QrCode, 
    X, 
    Mail, 
    Send, 
    AlertCircle,
    User,
    KeyRound
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
    const { user } = useContext(AuthContext);
    const isSupplier = user?.role?.toLowerCase() === 'supplier';

    const [progress, setProgress] = useState(0.2); // 0 to 1
    const [arrived, setArrived] = useState(false);
    const [donorNotified, setDonorNotified] = useState(false);
    const [notifying, setNotifying] = useState(false);
    const [copied, setCopied] = useState(false);
    const [showQr, setShowQr] = useState(false);
    const [reservationData, setReservationData] = useState(null);
    const [loadingRes, setLoadingRes] = useState(true);

    // Supplier Verification Terminal States
    const [supplierCodeInput, setSupplierCodeInput] = useState('');
    const [verifyingHandover, setVerifyingHandover] = useState(false);
    const [handoverSuccessMsg, setHandoverSuccessMsg] = useState(null);
    const [handoverErrorMsg, setHandoverErrorMsg] = useState(null);
    const [isCollected, setIsCollected] = useState(false);

    // Donor Email Notification States (for receiver)
    const [donorEmailSending, setDonorEmailSending] = useState(false);
    const [donorEmailSuccess, setDonorEmailSuccess] = useState(null);
    const [donorEmailError, setDonorEmailError] = useState(null);

    const [startLoc, setStartLoc] = useState([12.9279, 77.5871]); // Starting location
    const [endLoc, setEndLoc] = useState([12.9352, 77.6245]); // Food venue location

    const fetchReservation = async () => {
        try {
            const { data } = await axios.get(`/api/reservations/track/${code}`);
            if (data) {
                setReservationData(data);
                if (data.status === 'COLLECTED') {
                    setIsCollected(true);
                    setArrived(true);
                    setProgress(1);
                }
                if (data.pickerArrived) {
                    setArrived(true);
                    setDonorNotified(true);
                    setProgress(1);
                }
                if (data.foodListing?.coordinates?.lat && data.foodListing?.coordinates?.lng) {
                    setEndLoc([data.foodListing.coordinates.lat, data.foodListing.coordinates.lng]);
                }
            }
        } catch (err) {
            console.error('Error fetching reservation in tracker:', err);
        } finally {
            setLoadingRes(false);
        }
    };

    useEffect(() => {
        fetchReservation();
        const interval = setInterval(fetchReservation, 8000);
        return () => clearInterval(interval);
    }, [code]);

    // Receiver: Send arrival alert to food donor
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

    // Receiver: Send pickup verification code email directly to food donor/poster
    const handleSendEmailToDonor = async () => {
        setDonorEmailSending(true);
        setDonorEmailSuccess(null);
        setDonorEmailError(null);
        try {
            const { data } = await axios.post('/api/reservations/notify-donor-email', {
                pickupCode: code
            }, { timeout: 12000 });

            setDonorEmailSuccess(data.message || `Pickup verification code & details sent to food donor!`);
            setTimeout(() => setDonorEmailSuccess(null), 8000);
        } catch (err) {
            setDonorEmailError(err.response?.data?.message || 'Failed to email food donor. Please try again.');
        } finally {
            setDonorEmailSending(false);
        }
    };

    // Supplier: Verify 6-digit code and complete handover directly from the tracking view
    const handleSupplierVerifyCode = async (e) => {
        if (e) e.preventDefault();
        const inputCode = supplierCodeInput.trim() || code;
        setHandoverErrorMsg(null);
        setHandoverSuccessMsg(null);

        if (!inputCode || inputCode.length !== 6) {
            setHandoverErrorMsg('Please enter the 6-digit code provided by the receiver.');
            return;
        }

        setVerifyingHandover(true);
        try {
            const { data } = await axios.post('/api/reservations/verify-code', {
                pickupCode: inputCode
            });

            setHandoverSuccessMsg(data.message || '🎉 Handover confirmed! Food successfully rescued.');
            setIsCollected(true);
            fetchReservation();
        } catch (err) {
            setHandoverErrorMsg(err.response?.data?.message || 'Verification failed. Code does not match.');
        } finally {
            setVerifyingHandover(false);
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
                if (!isSupplier) {
                    handleNotifyArrival();
                }
            }
        }, interval);

        return () => clearInterval(timer);
    }, [arrived, isSupplier]);

    const handleCopy = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const minsLeft = Math.max(1, Math.ceil(10 * (1 - progress)));

    return (
        <div className="h-[calc(100vh-64px)] flex flex-col md:flex-row overflow-hidden bg-slate-50 relative">

            {/* Left Column: Tracking Progression & Pickup Code / Handover Terminal */}
            <div className="w-full md:w-5/12 lg:w-4/12 h-full bg-white shadow-2xl z-20 flex flex-col justify-between overflow-y-auto border-r border-slate-200/80">
                <div>
                    {/* Header */}
                    <div className="p-6 border-b border-slate-100">
                        <Link 
                            to="/my-reservations" 
                            className="inline-flex items-center text-xs font-bold text-slate-500 hover:text-brand-600 mb-3 transition-colors"
                        >
                            <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back to {isSupplier ? 'Incoming Reservations' : 'My Reservations'}
                        </Link>
                        
                        <div className="flex items-center justify-between mb-1">
                            <h2 className="text-2xl font-black text-slate-900">
                                {isSupplier ? 'Live Receiver Tracker' : 'Live Pickup Pass'}
                            </h2>
                            <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${
                                isCollected
                                    ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                                    : arrived 
                                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200 animate-pulse' 
                                        : 'bg-blue-50 text-blue-800 border-blue-200'
                            }`}>
                                {isCollected ? 'HANDOVER COMPLETE' : arrived ? (isSupplier ? 'RECEIVER ARRIVED' : 'ARRIVED') : 'EN ROUTE'}
                            </span>
                        </div>

                        {reservationData?.foodListing && (
                            <p className="text-xs font-bold text-slate-600 mt-1">
                                {reservationData.foodListing.foodName} • {reservationData.quantity} {reservationData.foodListing.unit}
                            </p>
                        )}
                    </div>

                    <div className="p-6 space-y-5">

                        {/* SUPPLIER VIEW: Receiver Details & Handover Verification */}
                        {isSupplier ? (
                            <div className="space-y-5">
                                {/* Receiver Info Card */}
                                <div className="bg-slate-50 border border-slate-200 rounded-3xl p-5">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">
                                        Receiver Profile
                                    </span>
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-brand-100 text-brand-700 rounded-2xl flex items-center justify-center font-black text-lg shrink-0">
                                            {reservationData?.receiver?.name?.charAt(0) || <User className="w-6 h-6" />}
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="text-base font-black text-slate-900 truncate">
                                                {reservationData?.receiver?.name || 'Community Member'}
                                            </h3>
                                            <p className="text-xs text-slate-500 font-medium truncate">
                                                {reservationData?.receiver?.email || 'Receiver Email'}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <div className="mt-3 pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs">
                                        <span className="text-slate-500 font-medium">Portions Reserved:</span>
                                        <span className="font-bold text-brand-700">{reservationData?.quantity} {reservationData?.foodListing?.unit || 'items'}</span>
                                    </div>
                                </div>

                                {/* Live Arrival Notice Banner */}
                                {isCollected ? (
                                    <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-start gap-3 animate-fade-in">
                                        <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
                                        <div>
                                            <h4 className="text-xs font-black text-emerald-900 uppercase">Collection Verified!</h4>
                                            <p className="text-xs text-emerald-800 font-medium mt-0.5">
                                                Food handover has been officially completed and recorded.
                                            </p>
                                        </div>
                                    </div>
                                ) : arrived ? (
                                    <div className="bg-amber-50 border-2 border-amber-300 rounded-3xl p-5 text-center animate-fade-in">
                                        <div className="w-10 h-10 bg-amber-100 text-amber-800 rounded-2xl flex items-center justify-center mx-auto mb-2 animate-bounce">
                                            <Bell className="w-5 h-5" />
                                        </div>
                                        <h3 className="text-sm font-black text-amber-950 uppercase tracking-wide">
                                            Receiver Is At Your Location!
                                        </h3>
                                        <p className="text-xs text-amber-800 font-medium mt-1 mb-4">
                                            Ask {reservationData?.receiver?.name || 'the receiver'} for their 6-digit confirmation code.
                                        </p>

                                        {/* Handover Code Form */}
                                        <form onSubmit={handleSupplierVerifyCode} className="space-y-3">
                                            <input
                                                type="text"
                                                maxLength={6}
                                                placeholder="Enter 6-digit code"
                                                className="w-full text-center text-xl font-black font-mono tracking-widest border border-amber-300 rounded-2xl py-2.5 bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                                                value={supplierCodeInput}
                                                onChange={(e) => setSupplierCodeInput(e.target.value.replace(/\D/g, ''))}
                                            />
                                            <button
                                                type="submit"
                                                disabled={verifyingHandover}
                                                className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold py-3 rounded-xl shadow-md transition flex items-center justify-center gap-1.5"
                                            >
                                                {verifyingHandover ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                                                <span>Confirm Handover & Release Food</span>
                                            </button>
                                        </form>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-between p-4 bg-blue-50/80 rounded-2xl border border-blue-100">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2.5 bg-blue-100 text-blue-600 rounded-xl">
                                                <Clock className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h4 className="text-base font-black text-blue-950">~{minsLeft} mins away</h4>
                                                <p className="text-xs text-blue-700 font-medium">Receiver approaching your venue</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Feedback alerts */}
                                {handoverSuccessMsg && (
                                    <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center gap-2 animate-fade-in">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                        <span>{handoverSuccessMsg}</span>
                                    </div>
                                )}
                                {handoverErrorMsg && (
                                    <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs font-bold flex items-center gap-2 animate-fade-in">
                                        <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                                        <span>{handoverErrorMsg}</span>
                                    </div>
                                )}
                            </div>
                        ) : (
                            /* RECEIVER VIEW: 6-Digit Code, Email Pass to Donor, Arrival Status */
                            <div className="space-y-5">
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

                                {/* Email Verification Pass to Food Poster Card */}
                                <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2.5">
                                            <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl shrink-0">
                                                <Mail className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <h4 className="text-xs font-bold text-slate-900">Email Verification Pass to Food Poster</h4>
                                                <p className="text-[11px] text-slate-500">
                                                    Donor: <span className="font-semibold text-slate-700">{reservationData?.foodListing?.supplier?.name || 'Food Donor'}</span> ({reservationData?.foodListing?.supplier?.email || 'Donor Email'})
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {donorEmailSuccess && (
                                        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-start gap-2 animate-fade-in">
                                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                                            <span>{donorEmailSuccess}</span>
                                        </div>
                                    )}

                                    {donorEmailError && (
                                        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-bold flex items-start gap-2 animate-fade-in">
                                            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                                            <span>{donorEmailError}</span>
                                        </div>
                                    )}

                                    <button
                                        onClick={handleSendEmailToDonor}
                                        disabled={donorEmailSending}
                                        className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold py-2.5 px-3 rounded-xl transition flex items-center justify-center gap-1.5 shadow-sm"
                                    >
                                        {donorEmailSending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                                        <span>Send Verification Code & Pass to Donor</span>
                                    </button>
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
                                    {reservationData?.foodListing?.location || 'Pickup location'}
                                </p>
                            </div>

                            <div className="relative">
                                <span className={`absolute -left-[31px] top-0.5 w-4 h-4 rounded-full ring-4 ring-white transition-colors ${arrived ? 'bg-brand-600' : 'bg-slate-300'}`}></span>
                                <h4 className={`font-bold text-xs uppercase tracking-wider ${arrived ? 'text-slate-900' : 'text-slate-400'}`}>
                                    3. Arrived & Verification
                                </h4>
                                <p className="text-xs text-slate-400 font-medium mt-0.5">
                                    {isSupplier ? 'Match 6-digit code with receiver.' : 'Present your 6-digit confirmation code.'}
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
                                <p className="font-bold text-xs">📍 {isSupplier ? 'Your Food Venue' : 'Pickup Location'}</p>
                                <p className="text-[10px] text-slate-500">{reservationData?.foodListing?.location}</p>
                            </div>
                        </Popup>
                    </Marker>

                    {/* Vehicle Marker */}
                    {currentLat && (
                        <Marker position={[currentLat, currentLng]} icon={createVehicleIcon()}>
                            <Popup>
                                <div className="p-2 text-center">
                                    <p className="font-bold text-xs">🛵 {isSupplier ? `${reservationData?.receiver?.name || 'Receiver'} En Route` : 'Your Live Route'}</p>
                                    <p className="text-[10px] text-slate-500">ETA: ~{minsLeft} mins</p>
                                </div>
                            </Popup>
                        </Marker>
                    )}
                </MapContainer>

                {/* Floating Top Header on Map */}
                <div className="absolute top-4 left-4 z-[400] bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl shadow-lg border border-slate-100 flex items-center gap-2">
                    <Navigation className="w-4 h-4 text-brand-600" />
                    <span className="font-bold text-slate-900 text-xs">
                        {isSupplier 
                            ? (arrived ? 'Receiver Arrived at Destination' : 'Live Tracking: Receiver En Route')
                            : (arrived ? 'Arrived at Destination' : 'Live Navigation Tracking')}
                    </span>
                </div>
            </div>

            {/* QR CODE MODAL (for receiver) */}
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

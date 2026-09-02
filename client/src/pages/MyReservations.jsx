import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Link, useLocation } from 'react-router-dom';
import { 
    Package, 
    Clock, 
    ShieldCheck, 
    Loader2, 
    Bell, 
    CheckCircle2, 
    KeyRound, 
    AlertCircle, 
    Navigation, 
    Calendar,
    User,
    ArrowRight,
    Copy,
    Check,
    QrCode,
    X,
    Trash2,
    Ban
} from 'lucide-react';

const DEFAULT_FOOD_IMAGE = 'https://images.unsplash.com/photo-1490645943961-4a51e5f31070?w=200&q=80';

// Simple lightweight SVG QR Code Generator component
const QRCodeDisplay = ({ code, foodName }) => {
    return (
        <div className="flex flex-col items-center justify-center p-6 bg-white rounded-3xl border border-slate-100 shadow-xl text-center">
            <div className="p-4 bg-slate-900 rounded-2xl mb-4 shadow-inner">
                {/* SVG pattern simulating a clean QR Code with code in center */}
                <svg width="180" height="180" viewBox="0 0 180 180" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="180" height="180" rx="16" fill="white"/>
                    {/* Corner Position Marks */}
                    <rect x="16" y="16" width="40" height="40" rx="6" fill="#0f172a"/>
                    <rect x="24" y="24" width="24" height="24" rx="3" fill="white"/>
                    <rect x="30" y="30" width="12" height="12" rx="2" fill="#059669"/>

                    <rect x="124" y="16" width="40" height="40" rx="6" fill="#0f172a"/>
                    <rect x="132" y="24" width="24" height="24" rx="3" fill="white"/>
                    <rect x="138" y="30" width="12" height="12" rx="2" fill="#059669"/>

                    <rect x="16" y="124" width="40" height="40" rx="6" fill="#0f172a"/>
                    <rect x="24" y="132" width="24" height="24" rx="3" fill="white"/>
                    <rect x="30" y="138" width="12" height="12" rx="2" fill="#059669"/>

                    {/* Data Dots Pattern */}
                    <rect x="68" y="20" width="10" height="10" rx="2" fill="#0f172a"/>
                    <rect x="84" y="20" width="10" height="10" rx="2" fill="#059669"/>
                    <rect x="100" y="20" width="10" height="10" rx="2" fill="#0f172a"/>

                    <rect x="68" y="36" width="10" height="10" rx="2" fill="#0f172a"/>
                    <rect x="100" y="36" width="10" height="10" rx="2" fill="#0f172a"/>

                    <rect x="20" y="68" width="10" height="10" rx="2" fill="#0f172a"/>
                    <rect x="36" y="68" width="10" height="10" rx="2" fill="#0f172a"/>
                    <rect x="134" y="68" width="10" height="10" rx="2" fill="#0f172a"/>
                    <rect x="150" y="68" width="10" height="10" rx="2" fill="#059669"/>

                    {/* Center Code Badge */}
                    <rect x="52" y="64" width="76" height="52" rx="10" fill="#059669"/>
                    <text x="90" y="95" fill="white" fontSize="18" fontFamily="monospace" fontWeight="900" textAnchor="middle">
                        {code}
                    </text>
                    
                    <rect x="68" y="134" width="10" height="10" rx="2" fill="#0f172a"/>
                    <rect x="84" y="134" width="10" height="10" rx="2" fill="#0f172a"/>
                    <rect x="100" y="134" width="10" height="10" rx="2" fill="#059669"/>
                    <rect x="134" y="134" width="10" height="10" rx="2" fill="#0f172a"/>
                    <rect x="150" y="134" width="10" height="10" rx="2" fill="#0f172a"/>
                </svg>
            </div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Pickup Verification Pass</p>
            <h4 className="text-sm font-black text-slate-900 mb-1">{foodName}</h4>
            <div className="flex items-center gap-2 bg-brand-50 px-4 py-1.5 rounded-xl border border-brand-200 mt-2">
                <span className="text-2xl font-black font-mono tracking-widest text-brand-700">{code}</span>
            </div>
        </div>
    );
};

const MyReservations = () => {
    const { user } = useContext(AuthContext);
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('All');
    const [verifyInputMap, setVerifyInputMap] = useState({});
    const [verifyingId, setVerifyingId] = useState(null);
    const [actionMsg, setActionMsg] = useState(null);
    const [actionError, setActionError] = useState(null);
    const [copiedCode, setCopiedCode] = useState(null);
    const [qrModalData, setQrModalData] = useState(null);
    const [notifyingId, setNotifyingId] = useState(null);
    const [cancellingId, setCancellingId] = useState(null);
    const location = useLocation();

    const isSupplier = user?.role?.toLowerCase() === 'supplier';

    const fetchReservations = async () => {
        try {
            const endpoint = isSupplier ? '/api/reservations/supplier' : '/api/reservations/my';
            const { data } = await axios.get(endpoint);
            setReservations(data || []);
        } catch (err) {
            console.error('Error fetching reservations:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReservations();
        const interval = setInterval(fetchReservations, 10000);
        return () => clearInterval(interval);
    }, [isSupplier]);

    // Handle code verification on a specific reservation by supplier
    const handleVerifyItem = async (reservationId) => {
        const inputCode = verifyInputMap[reservationId] || '';
        setActionError(null);
        setActionMsg(null);

        if (!inputCode || inputCode.trim().length !== 6) {
            setActionError('Please enter the 6-digit confirmation code provided by the receiver.');
            return;
        }

        setVerifyingId(reservationId);
        try {
            const { data } = await axios.post('/api/reservations/verify-code', {
                pickupCode: inputCode.trim()
            });

            setActionMsg(data.message || 'Collection confirmed successfully!');
            setVerifyInputMap(prev => ({ ...prev, [reservationId]: '' }));
            fetchReservations();
            setTimeout(() => setActionMsg(null), 5000);
        } catch (err) {
            setActionError(err.response?.data?.message || 'Verification failed. Code does not match.');
        } finally {
            setVerifyingId(null);
        }
    };

    // Receiver: Trigger "I've Arrived"
    const handleNotifyArrival = async (res) => {
        setNotifyingId(res._id);
        try {
            await axios.post('/api/reservations/notify-arrival', { pickupCode: res.pickupCode });
            setActionMsg(`🔔 Donor notified! They know you have arrived at ${res.foodListing?.location || 'the venue'}.`);
            fetchReservations();
            setTimeout(() => setActionMsg(null), 5000);
        } catch (err) {
            setActionError(err.response?.data?.message || 'Failed to notify donor.');
        } finally {
            setNotifyingId(null);
        }
    };

    // Receiver: Cancel active reservation
    const handleCancelReservation = async (reservationId) => {
        if (!window.confirm('Are you sure you want to cancel this reservation? The food portions will be returned to the community pool.')) return;
        
        setCancellingId(reservationId);
        setActionError(null);
        try {
            const { data } = await axios.post(`/api/reservations/${reservationId}/cancel`);
            setActionMsg(data.message || 'Reservation cancelled.');
            fetchReservations();
            setTimeout(() => setActionMsg(null), 4000);
        } catch (err) {
            setActionError(err.response?.data?.message || 'Failed to cancel reservation.');
        } finally {
            setCancellingId(null);
        }
    };

    const handleCopy = (code) => {
        navigator.clipboard.writeText(code);
        setCopiedCode(code);
        setTimeout(() => setCopiedCode(null), 2000);
    };

    const filteredReservations = reservations.filter(res => {
        if (activeTab === 'All') return true;
        return res.status === activeTab.toUpperCase();
    });

    const getStatusStyle = (status) => {
        switch (status) {
            case 'RESERVED': return 'bg-amber-50 text-amber-800 border-amber-200';
            case 'COLLECTED': return 'bg-emerald-50 text-emerald-800 border-emerald-200';
            case 'EXPIRED': return 'bg-red-50 text-red-800 border-red-200';
            case 'CANCELLED': return 'bg-slate-100 text-slate-600 border-slate-200';
            default: return 'bg-slate-100 text-slate-600';
        }
    };

    return (
        <div className="max-w-5xl mx-auto pb-16">
            
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 mb-1">
                        {isSupplier ? 'Incoming Food Reservations' : 'My Food Reservations'}
                    </h1>
                    <p className="text-slate-500 font-medium text-sm">
                        {isSupplier 
                            ? 'Verify receiver pickup codes and complete safe food handovers.' 
                            : 'Access your 6-digit pickup passes, notify donors upon arrival, and track status.'}
                    </p>
                </div>
            </div>

            {/* Notification messages */}
            {actionMsg && (
                <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center gap-2 text-sm font-bold animate-fade-in">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span>{actionMsg}</span>
                </div>
            )}

            {actionError && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl flex items-center gap-2 text-sm font-medium animate-fade-in">
                    <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
                    <span>{actionError}</span>
                </div>
            )}

            {/* Filter Tabs */}
            <div className="flex space-x-1 border-b border-slate-200 mb-6 overflow-x-auto">
                {['All', 'Reserved', 'Collected', 'Expired', 'Cancelled'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-5 py-3 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${
                            activeTab === tab 
                                ? 'border-brand-600 text-brand-600' 
                                : 'border-transparent text-slate-400 hover:text-slate-600'
                        }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-48">
                    <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
                </div>
            ) : filteredReservations.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-300 p-8">
                    <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <h3 className="text-lg font-bold text-slate-900 mb-1">No reservations found</h3>
                    <p className="text-slate-500 font-medium text-xs mb-4">
                        {isSupplier 
                            ? 'No incoming bookings under this filter.' 
                            : `You don't have any ${activeTab !== 'All' ? activeTab.toLowerCase() : ''} reservations.`}
                    </p>
                    {!isSupplier && (
                        <Link to="/find-food" className="inline-flex items-center text-brand-600 font-bold text-sm hover:underline">
                            Browse surplus food on map →
                        </Link>
                    )}
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredReservations.map(res => {
                        const isExpired = res.status === 'EXPIRED' || (res.foodListing?.expiryTime && new Date(res.foodListing.expiryTime) < new Date() && res.status !== 'COLLECTED');

                        return (
                            <div 
                                key={res._id} 
                                className={`bg-white p-5 sm:p-6 rounded-3xl shadow-sm border transition-all ${
                                    res.pickerArrived && res.status === 'RESERVED'
                                        ? 'border-amber-300 ring-2 ring-amber-400/20 bg-amber-50/10'
                                        : 'border-slate-100 hover:shadow-md'
                                }`}
                            >
                                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                                    
                                    {/* Left: Food Info */}
                                    <div className="flex items-start sm:items-center gap-4 min-w-0 flex-1">
                                        <img
                                            src={res.foodListing?.image || DEFAULT_FOOD_IMAGE}
                                            onError={(e) => { e.currentTarget.src = DEFAULT_FOOD_IMAGE; }}
                                            alt="Food"
                                            className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-2xl bg-slate-100 shrink-0"
                                        />

                                        <div className="min-w-0 flex-1">
                                            <div className="flex flex-wrap items-center gap-2 mb-1">
                                                <h3 className="text-lg font-bold text-slate-900 truncate">
                                                    {res.foodListing?.foodName || 'Surplus Item'}
                                                </h3>
                                                <span className={`px-2 py-0.5 rounded-md text-[11px] font-black border ${getStatusStyle(isExpired ? 'EXPIRED' : res.status)}`}>
                                                    {isExpired ? 'EXPIRED' : res.status}
                                                </span>
                                                {res.pickerArrived && res.status === 'RESERVED' && (
                                                    <span className="px-2 py-0.5 rounded-md text-[11px] font-black bg-amber-200 text-amber-900 inline-flex items-center gap-1 animate-pulse">
                                                        <Bell className="w-3 h-3" /> Picker Arrived
                                                    </span>
                                                )}
                                            </div>

                                            <p className="text-xs text-slate-500 font-medium mb-2.5">
                                                {isSupplier ? (
                                                    <span>Claimed by <strong className="text-slate-800">{res.receiver?.name || 'Receiver'}</strong> ({res.receiver?.email})</span>
                                                ) : (
                                                    <span>Donor: <strong className="text-slate-800">{res.foodListing?.supplier?.name || 'Local Supplier'}</strong></span>
                                                )}
                                            </p>

                                            <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-slate-600">
                                                <span className="bg-brand-50 text-brand-700 px-2 py-1 rounded-md">
                                                    {res.quantity} {res.foodListing?.unit || 'items'} reserved
                                                </span>
                                                {res.foodListing?.location && (
                                                    <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded-md truncate max-w-[200px]">
                                                        📍 {res.foodListing.location}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right: Actions */}
                                    <div className="w-full lg:w-auto shrink-0 flex flex-col items-start lg:items-end justify-center pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                                        
                                        {/* SUPPLIER: Input Code */}
                                        {isSupplier ? (
                                            res.status === 'RESERVED' ? (
                                                <div className="w-full sm:w-auto bg-slate-50 p-3.5 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center gap-2">
                                                    <div>
                                                        <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Enter Picker Code:</span>
                                                        <input
                                                            type="text"
                                                            maxLength={6}
                                                            placeholder="6-digit code"
                                                            className="w-32 px-3 py-2 text-center text-sm font-black font-mono tracking-widest border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 bg-white outline-none"
                                                            value={verifyInputMap[res._id] || ''}
                                                            onChange={(e) => setVerifyInputMap({ ...verifyInputMap, [res._id]: e.target.value.replace(/\D/g, '') })}
                                                        />
                                                    </div>
                                                    <button
                                                        onClick={() => handleVerifyItem(res._id)}
                                                        disabled={verifyingId === res._id || (verifyInputMap[res._id] || '').length !== 6}
                                                        className="w-full sm:w-auto mt-2 sm:mt-5 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow transition-all"
                                                    >
                                                        {verifyingId === res._id ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Confirm Match'}
                                                    </button>
                                                </div>
                                            ) : res.status === 'COLLECTED' ? (
                                                <div className="text-right">
                                                    <span className="inline-flex items-center text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl">
                                                        <CheckCircle2 className="w-4 h-4 mr-1.5" /> Handover Complete
                                                    </span>
                                                    <p className="text-[11px] text-slate-400 mt-1 font-medium">
                                                        {new Date(res.collectedAt || res.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                </div>
                                            ) : (
                                                <span className="text-xs font-bold text-slate-500">{res.status}</span>
                                            )
                                        ) : (
                                            /* RECEIVER: View 6-Digit Pass & Actions */
                                            <div className="w-full sm:w-auto flex flex-col sm:flex-row items-center gap-3">
                                                
                                                {/* Code Badge */}
                                                <div className="flex items-center gap-2 bg-slate-50 px-3.5 py-2 rounded-2xl border border-slate-200">
                                                    <div>
                                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Pickup Code</span>
                                                        <span className={`text-xl font-black font-mono tracking-widest ${res.status === 'RESERVED' ? 'text-brand-700' : 'text-slate-400 line-through'}`}>
                                                            {res.pickupCode}
                                                        </span>
                                                    </div>
                                                    <button
                                                        onClick={() => handleCopy(res.pickupCode)}
                                                        className="p-1.5 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors"
                                                        title="Copy Code"
                                                    >
                                                        {copiedCode === res.pickupCode ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                                                    </button>
                                                    <button
                                                        onClick={() => setQrModalData(res)}
                                                        className="p-1.5 hover:bg-brand-100 text-brand-700 rounded-lg transition-colors"
                                                        title="Show QR Code"
                                                    >
                                                        <QrCode className="w-4 h-4" />
                                                    </button>
                                                </div>

                                                {res.status === 'RESERVED' && (
                                                    <div className="flex items-center gap-2 w-full sm:w-auto">
                                                        {/* Live Track button */}
                                                        <Link
                                                            to={`/track-order/${res.pickupCode}`}
                                                            className="flex-1 sm:flex-none inline-flex items-center justify-center bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold px-3.5 py-2.5 rounded-xl shadow-md shadow-brand-500/20 transition-all gap-1"
                                                        >
                                                            <Navigation className="w-3.5 h-3.5" />
                                                            <span>Live Track</span>
                                                        </Link>

                                                        {/* Cancel button */}
                                                        <button
                                                            onClick={() => handleCancelReservation(res._id)}
                                                            disabled={cancellingId === res._id}
                                                            className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors border border-slate-200"
                                                            title="Cancel reservation"
                                                        >
                                                            {cancellingId === res._id ? <Loader2 className="w-4 h-4 animate-spin text-red-500" /> : <Ban className="w-4 h-4" />}
                                                        </button>
                                                    </div>
                                                )}

                                            </div>
                                        )}

                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* QR CODE POPUP MODAL */}
            {qrModalData && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl border border-slate-100 relative animate-scale-up">
                        <button 
                            onClick={() => setQrModalData(null)}
                            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full bg-slate-100"
                        >
                            <X className="w-4 h-4" />
                        </button>
                        
                        <QRCodeDisplay 
                            code={qrModalData.pickupCode} 
                            foodName={qrModalData.foodListing?.foodName || 'Surplus Food'} 
                        />

                        <button
                            onClick={() => setQrModalData(null)}
                            className="w-full mt-4 py-3 bg-slate-900 text-white rounded-xl font-bold text-xs shadow"
                        >
                            Done
                        </button>
                    </div>
                </div>
            )}

        </div>
    );
};

export default MyReservations;

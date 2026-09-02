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
    ArrowRight
} from 'lucide-react';

const DEFAULT_FOOD_IMAGE = 'https://images.unsplash.com/photo-1490645943961-4a51e5f31070?w=200&q=80';

const MyReservations = () => {
    const { user } = useContext(AuthContext);
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('All');
    const [verifyInputMap, setVerifyInputMap] = useState({});
    const [verifyingId, setVerifyingId] = useState(null);
    const [actionMsg, setActionMsg] = useState(null);
    const [actionError, setActionError] = useState(null);
    const location = useLocation();

    const isSupplier = user?.role?.toLowerCase() === 'supplier';

    const fetchReservations = async () => {
        try {
            const endpoint = isSupplier ? '/api/reservations/supplier' : '/api/reservations/my';
            const { data } = await axios.get(endpoint);
            setReservations(data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReservations();
        const interval = setInterval(fetchReservations, 12000);
        return () => clearInterval(interval);
    }, [isSupplier]);

    // Handle code verification on a specific reservation by supplier
    const handleVerifyItem = async (reservationId, expectedCode) => {
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

    const filteredReservations = reservations.filter(res => {
        if (activeTab === 'All') return true;
        return res.status === activeTab.toUpperCase();
    });

    const getStatusStyle = (status) => {
        switch (status) {
            case 'RESERVED': return 'bg-amber-100 text-amber-800';
            case 'COLLECTED': return 'bg-green-100 text-green-800';
            case 'EXPIRED': return 'bg-red-100 text-red-800';
            case 'CANCELLED': return 'bg-gray-100 text-gray-700';
            default: return 'bg-gray-100 text-gray-600';
        }
    };

    return (
        <div className="max-w-5xl mx-auto pb-12">
            
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 mb-1">
                        {isSupplier ? 'Incoming Food Reservations' : 'My Food Reservations'}
                    </h1>
                    <p className="text-gray-500 font-medium">
                        {isSupplier 
                            ? 'Manage receivers, verify pickup confirmation codes, and complete handovers.' 
                            : 'Track pickup status, notify donors on arrival, and view your 6-digit codes.'}
                    </p>
                </div>
            </div>

            {/* Notification messages */}
            {actionMsg && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-800 rounded-2xl flex items-center gap-2 text-sm font-bold animate-fade-in">
                    <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                    <span>{actionMsg}</span>
                </div>
            )}

            {actionError && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl flex items-center gap-2 text-sm font-medium animate-fade-in">
                    <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
                    <span>{actionError}</span>
                </div>
            )}

            {location.state?.newReservation && (
                <div className="mb-8 p-6 bg-brand-50 border border-brand-200 rounded-2xl flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-bold text-brand-900 mb-1 flex items-center">
                            <span className="text-2xl mr-2">🎉</span> Reservation Confirmed!
                        </h3>
                        <p className="text-brand-700 font-medium">Your food is reserved. Present your 6-digit pickup code when you arrive at the location.</p>
                    </div>
                </div>
            )}

            {/* Tabs */}
            <div className="flex space-x-1 border-b border-gray-200 mb-6 overflow-x-auto">
                {['All', 'Reserved', 'Collected', 'Expired'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-5 py-3 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${
                            activeTab === tab 
                                ? 'border-brand-600 text-brand-600' 
                                : 'border-transparent text-gray-400 hover:text-gray-600 hover:border-gray-300'
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
                <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-gray-300">
                    <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <h3 className="text-lg font-bold text-gray-900 mb-1">No reservations found</h3>
                    <p className="text-gray-500 font-medium text-sm">
                        {isSupplier 
                            ? 'No reservations received for this status filter.' 
                            : `You don't have any ${activeTab !== 'All' ? activeTab.toLowerCase() : ''} reservations.`}
                    </p>
                </div>
            ) : (
                <div className="space-y-5">
                    {filteredReservations.map(res => {
                        const isExpired = res.status === 'EXPIRED' || (res.foodListing?.expiryTime && new Date(res.foodListing.expiryTime) < new Date() && res.status !== 'COLLECTED');

                        return (
                            <div 
                                key={res._id} 
                                className={`bg-white p-6 rounded-3xl shadow-sm border transition-all ${
                                    res.pickerArrived && res.status === 'RESERVED'
                                        ? 'border-amber-300 ring-2 ring-amber-400/20'
                                        : 'border-gray-100 hover:shadow-md'
                                }`}
                            >
                                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                                    
                                    {/* Food & Donor/Receiver Info */}
                                    <div className="flex items-start sm:items-center gap-4 min-w-0 flex-1">
                                        <img
                                            src={res.foodListing?.image || DEFAULT_FOOD_IMAGE}
                                            onError={(e) => { e.currentTarget.src = DEFAULT_FOOD_IMAGE; }}
                                            alt="Food"
                                            className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-2xl bg-gray-100 shrink-0"
                                        />

                                        <div className="min-w-0 flex-1">
                                            <div className="flex flex-wrap items-center gap-2 mb-1">
                                                <h3 className="text-lg sm:text-xl font-bold text-gray-900 truncate">
                                                    {res.foodListing?.foodName || 'Surplus Item'}
                                                </h3>
                                                <span className={`px-2.5 py-0.5 rounded-lg text-xs font-black ${getStatusStyle(isExpired ? 'EXPIRED' : res.status)}`}>
                                                    {isExpired ? 'EXPIRED' : res.status}
                                                </span>
                                                {res.pickerArrived && res.status === 'RESERVED' && (
                                                    <span className="px-2.5 py-0.5 rounded-lg text-xs font-black bg-amber-200 text-amber-900 inline-flex items-center gap-1 animate-pulse">
                                                        <Bell className="w-3.5 h-3.5" /> Picker Arrived at Location
                                                    </span>
                                                )}
                                            </div>

                                            <p className="text-xs sm:text-sm text-gray-500 font-medium mb-3">
                                                {isSupplier ? (
                                                    <span>Claimed by <strong className="text-gray-800">{res.receiver?.name || 'Receiver'}</strong> ({res.receiver?.email})</span>
                                                ) : (
                                                    <span>Donor: <strong className="text-gray-800">{res.foodListing?.supplier?.name || 'Local Supplier'}</strong></span>
                                                )}
                                            </p>

                                            <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-gray-600">
                                                <span className="flex items-center bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-100">
                                                    <Package className="w-3.5 h-3.5 mr-1 text-brand-500" /> 
                                                    {res.quantity} {res.foodListing?.unit || 'items'}
                                                </span>
                                                {res.foodListing && (
                                                    <span className="flex items-center bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-100">
                                                        <Clock className="w-3.5 h-3.5 mr-1 text-amber-500" /> 
                                                        Expiry: {new Date(res.foodListing.expiryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Column */}
                                    <div className="w-full lg:w-auto shrink-0 flex flex-col items-start lg:items-end justify-center pt-4 lg:pt-0 border-t lg:border-t-0 border-gray-100">
                                        
                                        {/* SUPPLIER: Enter confirmation code from receiver */}
                                        {isSupplier ? (
                                            res.status === 'RESERVED' ? (
                                                <div className="w-full sm:w-auto bg-gray-50 p-4 rounded-2xl border border-gray-200 flex flex-col sm:flex-row items-center gap-2">
                                                    <div>
                                                        <span className="text-xs font-bold text-gray-500 block mb-1">Enter Picker Code:</span>
                                                        <input
                                                            type="text"
                                                            maxLength={6}
                                                            placeholder="6-digit code"
                                                            className="w-32 px-3 py-2 text-center text-base font-black font-mono tracking-widest border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-500 bg-white outline-none"
                                                            value={verifyInputMap[res._id] || ''}
                                                            onChange={(e) => setVerifyInputMap({ ...verifyInputMap, [res._id]: e.target.value.replace(/\D/g, '') })}
                                                        />
                                                    </div>
                                                    <button
                                                        onClick={() => handleVerifyItem(res._id, res.pickupCode)}
                                                        disabled={verifyingId === res._id || (verifyInputMap[res._id] || '').length !== 6}
                                                        className="w-full sm:w-auto mt-4 sm:mt-5 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow transition-all"
                                                    >
                                                        {verifyingId === res._id ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Confirm Match'}
                                                    </button>
                                                </div>
                                            ) : res.status === 'COLLECTED' ? (
                                                <div className="text-right">
                                                    <span className="inline-flex items-center text-xs font-bold text-green-700 bg-green-50 border border-green-200 px-3 py-1.5 rounded-xl">
                                                        <CheckCircle2 className="w-4 h-4 mr-1.5" /> Handover Complete
                                                    </span>
                                                    <p className="text-[11px] text-gray-400 mt-1 font-medium">
                                                        Collected: {new Date(res.collectedAt || res.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                </div>
                                            ) : (
                                                <span className="text-xs font-bold text-red-600 bg-red-50 px-3 py-1 rounded-lg">
                                                    {res.status}
                                                </span>
                                            )
                                        ) : (
                                            /* RECEIVER: View Code & Track Navigation */
                                            <div className="w-full sm:w-auto flex flex-col sm:flex-row items-center gap-4">
                                                <div className="text-center sm:text-right">
                                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-0.5">Pickup Code</span>
                                                    <span className={`text-2xl font-black font-mono tracking-wider ${res.status === 'RESERVED' ? 'text-brand-700' : 'text-gray-400 line-through'}`}>
                                                        {res.pickupCode}
                                                    </span>
                                                </div>
                                                {res.status === 'RESERVED' && (
                                                    <Link
                                                        to={`/track-order/${res.pickupCode}`}
                                                        className="w-full sm:w-auto inline-flex items-center justify-center bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow transition-all"
                                                    >
                                                        <Navigation className="w-3.5 h-3.5 mr-1.5" /> Live Track →
                                                    </Link>
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
        </div>
    );
};

export default MyReservations;

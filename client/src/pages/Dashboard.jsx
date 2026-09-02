import React, { useContext, useState, useEffect, useCallback } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { 
    Package, 
    TrendingUp, 
    CheckCircle2, 
    List as ListIcon, 
    Heart, 
    Leaf, 
    Bell, 
    ShieldCheck, 
    KeyRound, 
    Loader2, 
    AlertCircle, 
    Clock, 
    UserCheck,
    Check
} from 'lucide-react';

const DEFAULT_FOOD_IMAGE = 'https://images.unsplash.com/photo-1490645943961-4a51e5f31070?w=100&q=80';

const Dashboard = () => {
    const { user } = useContext(AuthContext);
    const [recentListings, setRecentListings] = useState([]);
    const [incomingReservations, setIncomingReservations] = useState([]);
    const [myReservations, setMyReservations] = useState([]);
    const [supplierStats, setSupplierStats] = useState({
        active: 0,
        reserved: 0,
        collected: 0,
        rescued: 0
    });
    const [receiverStats, setReceiverStats] = useState({
        rescued: 0,
        pickups: 0,
        total: 0
    });

    // Verification code state
    const [verifyCodeInput, setVerifyCodeInput] = useState('');
    const [verifying, setVerifying] = useState(false);
    const [verifyMessage, setVerifyMessage] = useState(null);
    const [verifyError, setVerifyError] = useState(null);

    const isSupplier = user?.role?.toLowerCase() === 'supplier';

    const loadDashboardData = useCallback(() => {
        if (isSupplier) {
            // 1. Fetch Supplier Listings
            axios.get('/api/listings/my')
                .then(res => {
                    const data = res.data || [];
                    setRecentListings(data.slice(0, 5));
                    const active = data.filter(l => l.status === 'AVAILABLE').length;
                    const reserved = data.filter(l => l.status === 'RESERVED' || l.status === 'PARTIALLY_RESERVED').length;
                    const collected = data.filter(l => l.status === 'COLLECTED').length;
                    const rescued = data.filter(l => l.status === 'COLLECTED').reduce((sum, l) => sum + (l.quantity || 0), 0);
                    setSupplierStats({ active, reserved, collected, rescued });
                })
                .catch(err => console.error(err));

            // 2. Fetch Supplier Incoming Reservations
            axios.get('/api/reservations/supplier')
                .then(res => {
                    setIncomingReservations(res.data || []);
                })
                .catch(err => console.error(err));
        } else {
            // Receiver reservations
            axios.get('/api/reservations/my')
                .then(res => {
                    const data = res.data || [];
                    setMyReservations(data);
                    const pickups = data.filter(r => r.status === 'COLLECTED').length;
                    setReceiverStats({
                        rescued: user?.mealsRescued ?? 0,
                        pickups,
                        total: data.length
                    });
                })
                .catch(err => console.error(err));
        }
    }, [isSupplier, user]);

    useEffect(() => {
        loadDashboardData();
        // Periodically refresh every 15s to check for picker arrivals
        const interval = setInterval(loadDashboardData, 15000);
        return () => clearInterval(interval);
    }, [loadDashboardData]);

    // Handle Quick Code Verification by Donor
    const handleVerifyPickupCode = async (e) => {
        e.preventDefault();
        setVerifyError(null);
        setVerifyMessage(null);

        if (!verifyCodeInput || verifyCodeInput.trim().length !== 6) {
            setVerifyError('Please enter a valid 6-digit confirmation code.');
            return;
        }

        setVerifying(true);
        try {
            const { data } = await axios.post('/api/reservations/verify-code', {
                pickupCode: verifyCodeInput.trim()
            });

            setVerifyMessage(data.message || 'Pickup code matched! Food collection verified successfully.');
            setVerifyCodeInput('');
            loadDashboardData();
            setTimeout(() => setVerifyMessage(null), 6000);
        } catch (err) {
            setVerifyError(err.response?.data?.message || 'Invalid code. Could not verify pickup.');
        } finally {
            setVerifying(false);
        }
    };

    // Find all arrived pickers waiting for handover
    const arrivedPickers = incomingReservations.filter(r => r.pickerArrived && r.status === 'RESERVED');
    const activeReservedPickups = myReservations.filter(r => r.status === 'RESERVED');

    const supplierCards = [
        { label: 'Active Listings', value: supplierStats.active, icon: ListIcon, color: 'text-indigo-600', bg: 'bg-indigo-100' },
        { label: 'Reserved Food', value: supplierStats.reserved, icon: Package, color: 'text-amber-600', bg: 'bg-amber-100' },
        { label: 'Food Collected', value: supplierStats.collected, icon: CheckCircle2, color: 'text-brand-600', bg: 'bg-brand-100' },
        { label: 'Meals Rescued', value: supplierStats.rescued, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    ];

    const receiverCards = [
        { label: 'Meals Rescued', value: receiverStats.rescued, icon: Heart, color: 'text-brand-600', bg: 'bg-brand-100' },
        { label: 'Successful Pickups', value: receiverStats.pickups, icon: CheckCircle2, color: 'text-blue-600', bg: 'bg-blue-100' },
        { label: 'Rescue Actions', value: receiverStats.total, icon: Leaf, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    ];

    const cards = isSupplier ? supplierCards : receiverCards;

    return (
        <div className="max-w-6xl mx-auto pb-12">
            
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 mb-1">Welcome back, {user?.name?.split(' ')[0] || 'Guest'}! 👋</h1>
                    <p className="text-gray-500 font-medium">Track surplus food rescue impact and active handovers.</p>
                </div>
                {isSupplier && (
                    <Link to="/post-food" className="inline-flex items-center justify-center bg-brand-600 hover:bg-brand-700 text-white font-bold px-5 py-2.5 rounded-xl shadow-md transition-all">
                        + Share Surplus Food
                    </Link>
                )}
            </div>

            {/* LIVE ARRIVAL NOTIFICATION ALERT FOR SUPPLIERS */}
            {isSupplier && arrivedPickers.length > 0 && (
                <div className="mb-8 p-6 bg-gradient-to-r from-amber-500 to-emerald-600 text-white rounded-3xl shadow-lg animate-fade-in">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 animate-bounce">
                                <Bell className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="bg-white text-amber-900 text-xs font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                                        Live Alert
                                    </span>
                                    <h3 className="text-lg font-black">Picker Arrived at Location!</h3>
                                </div>
                                <p className="text-white/90 text-sm font-medium mt-0.5">
                                    {arrivedPickers.map(p => `${p.receiver?.name || 'A receiver'} for "${p.foodListing?.foodName || 'Food'}"`).join(', ')} is at your pickup venue.
                                </p>
                            </div>
                        </div>
                        <a 
                            href="#verify-section" 
                            className="bg-white text-emerald-800 hover:bg-emerald-50 px-5 py-2.5 rounded-xl font-black text-sm shadow-md transition-all shrink-0"
                        >
                            Verify Handover Code ↓
                        </a>
                    </div>
                </div>
            )}

            {/* Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                {cards.map((card, i) => (
                    <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 rounded-xl ${card.bg}`}>
                                <card.icon className={`w-6 h-6 ${card.color}`} />
                            </div>
                        </div>
                        <div>
                            <h2 className="text-4xl font-black text-gray-900 mb-1 tracking-tight">{card.value}</h2>
                            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">{card.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* SUPPLIER: Pickup Code Verification & Active Handovers */}
            {isSupplier && (
                <div id="verify-section" className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-10">
                    
                    {/* Left: Quick Code Verification Form */}
                    <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between">
                        <div>
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2.5 bg-brand-50 text-brand-600 rounded-xl">
                                    <KeyRound className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900">Verify Pickup Code</h3>
                                    <p className="text-xs text-gray-500 font-medium">Match code from the receiver to complete handover.</p>
                                </div>
                            </div>

                            {verifyMessage && (
                                <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-800 rounded-2xl flex items-start gap-2.5 text-sm font-bold animate-fade-in">
                                    <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                                    <span>{verifyMessage}</span>
                                </div>
                            )}

                            {verifyError && (
                                <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl flex items-start gap-2.5 text-sm font-medium animate-fade-in">
                                    <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                                    <span>{verifyError}</span>
                                </div>
                            )}

                            <form onSubmit={handleVerifyPickupCode} className="space-y-4 my-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                                        6-Digit Confirmation Code
                                    </label>
                                    <input
                                        type="text"
                                        maxLength={6}
                                        placeholder="e.g. 748291"
                                        className="w-full px-4 py-3.5 border border-gray-200 rounded-2xl text-center text-2xl font-black font-mono tracking-widest bg-gray-50 focus:bg-white focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                                        value={verifyCodeInput}
                                        onChange={(e) => setVerifyCodeInput(e.target.value.replace(/\D/g, ''))}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={verifying || verifyCodeInput.length !== 6}
                                    className="w-full bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                                >
                                    {verifying ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Verifying Code...
                                        </>
                                    ) : (
                                        <>
                                            <ShieldCheck className="w-5 h-5" />
                                            Confirm Handover
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>

                        <div className="pt-4 border-t border-gray-100 flex items-center gap-2 text-xs text-gray-400 font-medium">
                            <Check className="w-4 h-4 text-brand-600 shrink-0" />
                            <span>Matches receiver's reservation & updates rescued meal impact automatically.</span>
                        </div>
                    </div>

                    {/* Right: Live Incoming Reservations Status */}
                    <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="text-xl font-bold text-gray-900">Incoming Reservations</h3>
                            <Link to="/my-reservations" className="text-xs font-bold text-brand-600 hover:text-brand-700">
                                View All ({incomingReservations.length}) →
                            </Link>
                        </div>

                        {incomingReservations.length === 0 ? (
                            <div className="text-center py-10 text-gray-400">
                                <Package className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                                <p className="text-sm font-semibold text-gray-700">No active reservations</p>
                                <p className="text-xs">When users claim your surplus food, their pickup status will show here.</p>
                            </div>
                        ) : (
                            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                                {incomingReservations.slice(0, 4).map(res => (
                                    <div 
                                        key={res._id} 
                                        className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
                                            res.pickerArrived && res.status === 'RESERVED'
                                                ? 'bg-amber-50 border-amber-200 ring-2 ring-amber-400/20'
                                                : 'bg-gray-50 border-gray-100 hover:bg-gray-100/70'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <img
                                                src={res.foodListing?.image || DEFAULT_FOOD_IMAGE}
                                                onError={(e) => { e.currentTarget.src = DEFAULT_FOOD_IMAGE; }}
                                                className="w-12 h-12 rounded-xl object-cover shrink-0 bg-gray-200"
                                                alt=""
                                            />
                                            <div className="min-w-0">
                                                <h4 className="font-bold text-gray-900 text-sm truncate">{res.foodListing?.foodName || 'Surplus Item'}</h4>
                                                <p className="text-xs text-gray-500 font-medium">
                                                    Reserved by <span className="font-bold text-gray-700">{res.receiver?.name || 'User'}</span> • {res.quantity} {res.foodListing?.unit || 'items'}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="text-right shrink-0">
                                            {res.status === 'COLLECTED' ? (
                                                <span className="px-2.5 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-bold inline-flex items-center">
                                                    ✓ Collected
                                                </span>
                                            ) : res.pickerArrived ? (
                                                <span className="px-2.5 py-1 bg-amber-200 text-amber-900 rounded-lg text-xs font-black inline-flex items-center gap-1 animate-pulse">
                                                    🔔 Picker Arrived
                                                </span>
                                            ) : (
                                                <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold inline-flex items-center">
                                                    En Route
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                </div>
            )}

            {/* SUPPLIER: Recent Food Listings Table */}
            {isSupplier && (
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                        <h3 className="text-lg font-bold text-gray-900">Your Recent Listings</h3>
                        <Link to="/my-listings" className="text-sm font-semibold text-brand-600 hover:text-brand-700">View All Listings →</Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr>
                                    <th className="px-6 py-4 border-b border-gray-100 text-xs font-bold uppercase tracking-wider text-gray-400">Food</th>
                                    <th className="px-6 py-4 border-b border-gray-100 text-xs font-bold uppercase tracking-wider text-gray-400">Quantity</th>
                                    <th className="px-6 py-4 border-b border-gray-100 text-xs font-bold uppercase tracking-wider text-gray-400">Expiry Time</th>
                                    <th className="px-6 py-4 border-b border-gray-100 text-xs font-bold uppercase tracking-wider text-gray-400">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {recentListings.map(listing => {
                                    const isExpired = listing.status === 'EXPIRED' || new Date(listing.expiryTime) < new Date();
                                    return (
                                        <tr key={listing._id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <img 
                                                        src={listing.image || DEFAULT_FOOD_IMAGE} 
                                                        onError={(e) => { e.currentTarget.src = DEFAULT_FOOD_IMAGE; }}
                                                        className="w-10 h-10 rounded-lg object-cover mr-3 bg-gray-100" 
                                                        alt="" 
                                                    />
                                                    <span className="font-bold text-gray-900">{listing.foodName}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 font-medium text-gray-600">{listing.quantity} {listing.unit}</td>
                                            <td className="px-6 py-4 text-sm text-gray-500 font-medium">
                                                {new Date(listing.expiryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-1 rounded inline-flex text-xs font-bold ${
                                                    isExpired 
                                                        ? 'bg-red-100 text-red-700' 
                                                        : listing.status === 'AVAILABLE' 
                                                            ? 'bg-brand-100 text-brand-700' 
                                                            : 'bg-gray-100 text-gray-600'
                                                }`}>
                                                    {isExpired ? 'EXPIRED' : listing.status}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {recentListings.length === 0 && (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-8 text-center text-gray-500 font-medium">
                                            No recent listings. You haven't posted any surplus food yet.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* RECEIVER: Active Reservations & Quick Track */}
            {!isSupplier && (
                <div className="space-y-6">
                    {activeReservedPickups.length > 0 && (
                        <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100">
                            <h3 className="text-xl font-bold text-gray-900 mb-4">Your Active Pickups</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {activeReservedPickups.map(res => (
                                    <div key={res._id} className="bg-brand-50/50 border border-brand-200 rounded-2xl p-5 flex items-center justify-between">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <img
                                                src={res.foodListing?.image || DEFAULT_FOOD_IMAGE}
                                                onError={(e) => { e.currentTarget.src = DEFAULT_FOOD_IMAGE; }}
                                                className="w-14 h-14 rounded-xl object-cover bg-gray-100 shrink-0"
                                                alt=""
                                            />
                                            <div className="min-w-0">
                                                <h4 className="font-bold text-gray-900 truncate">{res.foodListing?.foodName || 'Reserved Item'}</h4>
                                                <p className="text-xs text-gray-500 font-medium">Pickup Code: <span className="font-mono font-black text-brand-700 text-sm">{res.pickupCode}</span></p>
                                            </div>
                                        </div>
                                        <Link 
                                            to={`/track-order/${res.pickupCode}`}
                                            className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow transition-all shrink-0"
                                        >
                                            Track & Code →
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="bg-brand-50 rounded-3xl border border-brand-100 p-8 flex flex-col md:flex-row justify-between items-center">
                        <div className="mb-4 md:mb-0">
                            <h3 className="text-xl font-bold text-brand-900 mb-2">Ready to Rescue?</h3>
                            <p className="text-brand-700 font-medium max-w-lg">
                                Discover fresh surplus food posted by local restaurants, canteens, and stores near you.
                            </p>
                        </div>
                        <Link to="/find-food" className="bg-brand-600 text-white font-bold px-6 py-3.5 rounded-xl hover:bg-brand-700 transition-colors shadow-md shrink-0">
                            Find Nearby Food
                        </Link>
                    </div>
                </div>
            )}

        </div>
    );
};

export default Dashboard;

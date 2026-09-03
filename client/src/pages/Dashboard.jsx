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
    Check,
    PlusSquare,
    Search
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

    // Verification code terminal state
    const [verifyCodeInput, setVerifyCodeInput] = useState('');
    const [verifying, setVerifying] = useState(false);
    const [verifyMessage, setVerifyMessage] = useState(null);
    const [verifyError, setVerifyError] = useState(null);

    const isSupplier = user?.role?.toLowerCase() === 'supplier';

    const loadDashboardData = useCallback(() => {
        if (isSupplier) {
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

            axios.get('/api/reservations/supplier')
                .then(res => {
                    setIncomingReservations(res.data || []);
                })
                .catch(err => console.error(err));
        } else {
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
        const interval = setInterval(loadDashboardData, 12000);
        return () => clearInterval(interval);
    }, [loadDashboardData]);

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

            setVerifyMessage(data.message || 'Pickup verified successfully! Food handover complete.');
            setVerifyCodeInput('');
            loadDashboardData();
            setTimeout(() => setVerifyMessage(null), 6000);
        } catch (err) {
            setVerifyError(err.response?.data?.message || 'Invalid code. Could not verify pickup.');
        } finally {
            setVerifying(false);
        }
    };

    const arrivedPickers = incomingReservations.filter(r => r.pickerArrived && r.status === 'RESERVED');
    const activeReservedPickups = myReservations.filter(r => r.status === 'RESERVED');

    const supplierCards = [
        { label: 'Active Listings', value: supplierStats.active, icon: ListIcon, color: 'text-brand-600', bg: 'bg-brand-50' },
        { label: 'In Reservation', value: supplierStats.reserved, icon: Package, color: 'text-amber-600', bg: 'bg-amber-50' },
        { label: 'Handovers Done', value: supplierStats.collected, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { label: 'Portions Rescued', value: supplierStats.rescued, icon: TrendingUp, color: 'text-teal-600', bg: 'bg-teal-50' },
    ];

    const receiverCards = [
        { label: 'Meals Rescued', value: receiverStats.rescued, icon: Heart, color: 'text-rose-600', bg: 'bg-rose-50' },
        { label: 'Completed Pickups', value: receiverStats.pickups, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { label: 'Active Reservations', value: activeReservedPickups.length, icon: Package, color: 'text-brand-600', bg: 'bg-brand-50' },
        { label: 'CO2 Avoided (kg)', value: (receiverStats.rescued * 2.5).toFixed(0), icon: Leaf, color: 'text-teal-600', bg: 'bg-teal-50' },
    ];

    const cards = isSupplier ? supplierCards : receiverCards;

    return (
        <div className="max-w-6xl mx-auto pb-16">
            
            {/* Header Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <h1 className="text-3xl font-black text-slate-900">
                            Welcome back, {user?.name?.split(' ')[0] || 'Member'}! 👋
                        </h1>
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider bg-brand-50 text-brand-700 border border-brand-200">
                            {user?.role}
                        </span>
                    </div>
                    <p className="text-slate-500 font-medium text-sm">
                        Track surplus food rescue metrics, active handovers, and community impact.
                    </p>
                </div>

                {isSupplier ? (
                    <Link 
                        to="/post-food" 
                        className="inline-flex items-center justify-center bg-brand-600 hover:bg-brand-700 text-white font-bold px-5 py-2.5 rounded-xl shadow-md shadow-brand-500/20 transition-all text-sm gap-2"
                    >
                        <PlusSquare className="w-4 h-4" />
                        <span>Share Surplus Food</span>
                    </Link>
                ) : (
                    <Link 
                        to="/find-food" 
                        className="inline-flex items-center justify-center bg-brand-600 hover:bg-brand-700 text-white font-bold px-5 py-2.5 rounded-xl shadow-md shadow-brand-500/20 transition-all text-sm gap-2"
                    >
                        <Search className="w-4 h-4" />
                        <span>Find Food Nearby</span>
                    </Link>
                )}
            </div>

            {/* LIVE ARRIVAL ALERT BANNER FOR DONORS */}
            {isSupplier && arrivedPickers.length > 0 && (
                <div className="mb-8 p-6 bg-gradient-to-r from-amber-500 to-emerald-600 text-white rounded-3xl shadow-xl animate-fade-in">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 animate-bounce">
                                <Bell className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="bg-white text-amber-900 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                                        Live Handover Alert
                                    </span>
                                    <h3 className="text-lg font-black">Receiver Arrived at Venue!</h3>
                                </div>
                                <p className="text-white/90 text-xs font-medium mt-0.5">
                                    {arrivedPickers.map(p => `${p.receiver?.name || 'A receiver'} for "${p.foodListing?.foodName || 'Food'}"`).join(', ')} is waiting at your location.
                                </p>
                            </div>
                        </div>
                        <a 
                            href="#verify-section" 
                            className="bg-white text-emerald-800 hover:bg-emerald-50 px-5 py-2.5 rounded-xl font-black text-xs shadow-md transition-all shrink-0"
                        >
                            Verify 6-Digit Code ↓
                        </a>
                    </div>
                </div>
            )}

            {/* Metrics Cards Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-10">
                {cards.map((card, i) => (
                    <div key={i} className="bg-white rounded-3xl shadow-sm border border-slate-100 p-5 sm:p-6 flex flex-col justify-between hover:shadow-md transition-all">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 rounded-2xl ${card.bg}`}>
                                <card.icon className={`w-5 h-5 ${card.color}`} />
                            </div>
                        </div>
                        <div>
                            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-1 tracking-tight">{card.value}</h2>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{card.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* SUPPLIER: Quick Code Verification & Live Incoming Bookings */}
            {isSupplier && (
                <div id="verify-section" className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-10">
                    
                    {/* Left: Code Terminal */}
                    <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-between">
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2.5 bg-brand-50 text-brand-600 rounded-xl">
                                    <KeyRound className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-slate-900">Verify Pickup Code</h3>
                                    <p className="text-xs text-slate-500 font-medium">Match code from the receiver to complete handover.</p>
                                </div>
                            </div>

                            {verifyMessage && (
                                <div className="mb-4 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-start gap-2.5 text-xs font-bold animate-fade-in">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                                    <span>{verifyMessage}</span>
                                </div>
                            )}

                            {verifyError && (
                                <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl flex items-start gap-2.5 text-xs font-medium animate-fade-in">
                                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                                    <span>{verifyError}</span>
                                </div>
                            )}

                            <form onSubmit={handleVerifyPickupCode} className="space-y-4 my-2">
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                                        Receiver's 6-Digit Code
                                    </label>
                                    <input
                                        type="text"
                                        maxLength={6}
                                        placeholder="e.g. 482731"
                                        className="w-full px-4 py-3 border border-slate-200 rounded-2xl text-center text-2xl font-black font-mono tracking-widest bg-slate-50 focus:bg-white focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                                        value={verifyCodeInput}
                                        onChange={(e) => setVerifyCodeInput(e.target.value.replace(/\D/g, ''))}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={verifying || verifyCodeInput.length !== 6}
                                    className="w-full bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl shadow-md shadow-brand-500/20 transition-all flex items-center justify-center gap-2 text-sm"
                                >
                                    {verifying ? (
                                        <>
                                             <Loader2 className="w-4 h-4 animate-spin" />
                                            <span>Verifying Code...</span>
                                        </>
                                    ) : (
                                        <>
                                            <ShieldCheck className="w-4 h-4" />
                                            <span>Confirm Handover</span>
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>

                        <div className="pt-4 border-t border-slate-100 flex items-center gap-2 text-[11px] text-slate-400 font-medium">
                            <Check className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                            <span>Automatically logs rescued meal metrics upon successful code match.</span>
                        </div>
                    </div>

                    {/* Right: Incoming Bookings */}
                    <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-100">
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="text-lg font-black text-slate-900">Incoming Reservations</h3>
                            <Link to="/my-reservations" className="text-xs font-bold text-brand-600 hover:text-brand-700">
                                View All ({incomingReservations.length}) →
                            </Link>
                        </div>

                        {incomingReservations.length === 0 ? (
                            <div className="text-center py-12 text-slate-400">
                                <Package className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                                <p className="text-xs font-bold text-slate-700">No active reservations yet</p>
                                <p className="text-[11px] text-slate-400">When community members claim your food, bookings will appear here.</p>
                            </div>
                        ) : (
                            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                                {incomingReservations.slice(0, 4).map(res => (
                                    <div 
                                        key={res._id} 
                                        className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
                                            res.pickerArrived && res.status === 'RESERVED'
                                                ? 'bg-amber-50 border-amber-200 ring-2 ring-amber-400/20'
                                                : 'bg-slate-50 border-slate-100 hover:bg-slate-100/70'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <img
                                                src={res.foodListing?.image || DEFAULT_FOOD_IMAGE}
                                                onError={(e) => { e.currentTarget.src = DEFAULT_FOOD_IMAGE; }}
                                                className="w-12 h-12 rounded-xl object-cover shrink-0 bg-slate-200"
                                                alt=""
                                            />
                                            <div className="min-w-0">
                                                <h4 className="font-bold text-slate-900 text-xs truncate">{res.foodListing?.foodName || 'Surplus Item'}</h4>
                                                <p className="text-[11px] text-slate-500 font-medium">
                                                    Claimed by <strong className="text-slate-800">{res.receiver?.name || 'Receiver'}</strong> • {res.quantity} {res.foodListing?.unit || 'items'}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="text-right shrink-0">
                                            {res.status === 'COLLECTED' ? (
                                                <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-lg text-[11px] font-black inline-flex items-center">
                                                    ✓ Collected
                                                </span>
                                            ) : res.pickerArrived ? (
                                                <span className="px-2.5 py-1 bg-amber-200 text-amber-900 rounded-lg text-[11px] font-black inline-flex items-center gap-1 animate-pulse">
                                                    🔔 Arrived
                                                </span>
                                            ) : (
                                                <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg text-[11px] font-bold">
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

            {/* RECEIVER: Active Pickups & Action */}
            {!isSupplier && (
                <div className="space-y-6">
                    {activeReservedPickups.length > 0 && (
                        <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-100">
                            <h3 className="text-xl font-black text-slate-900 mb-4">Your Active Pickups Ready for Collection</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {activeReservedPickups.map(res => (
                                    <div key={res._id} className="bg-brand-50/50 border border-brand-200 rounded-2xl p-4 flex items-center justify-between">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <img
                                                src={res.foodListing?.image || DEFAULT_FOOD_IMAGE}
                                                onError={(e) => { e.currentTarget.src = DEFAULT_FOOD_IMAGE; }}
                                                className="w-14 h-14 rounded-xl object-cover bg-slate-100 shrink-0"
                                                alt=""
                                            />
                                            <div className="min-w-0">
                                                <h4 className="font-bold text-slate-900 text-sm truncate">{res.foodListing?.foodName || 'Reserved Item'}</h4>
                                                <p className="text-xs text-slate-500 font-medium">Pickup Code: <span className="font-mono font-black text-brand-700 text-sm">{res.pickupCode}</span></p>
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

                    {/* Fast Rescue Promo */}
                    <div className="bg-gradient-to-r from-brand-600 to-emerald-700 text-white rounded-3xl p-8 flex flex-col md:flex-row justify-between items-center shadow-lg">
                        <div className="mb-4 md:mb-0">
                            <h3 className="text-xl font-black mb-1">Ready to Rescue More Food?</h3>
                            <p className="text-emerald-100 text-sm font-medium max-w-lg">
                                Fresh surplus from Indiranagar, Koramangala, and Jayanagar is live on the map.
                            </p>
                        </div>
                        <Link to="/find-food" className="bg-white text-emerald-900 font-bold px-6 py-3.5 rounded-xl hover:bg-emerald-50 transition-colors shadow-md text-sm shrink-0">
                            Explore Live Food Map →
                        </Link>
                    </div>
                </div>
            )}

        </div>
    );
};

export default Dashboard;

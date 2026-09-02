import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { 
    MapPin, 
    Clock, 
    Tag, 
    Package, 
    Sparkles, 
    CheckCircle2, 
    AlertCircle, 
    Loader2, 
    ArrowRight,
    Heart
} from 'lucide-react';

const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1490645943961-4a51e5f31070?w=600&auto=format&fit=crop&q=80";

export const FoodCard = ({ food, compact = false, onReserved }) => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [quickReserving, setQuickReserving] = useState(false);
    const [showQuickModal, setShowQuickModal] = useState(false);
    const [reserveQty, setReserveQty] = useState(1);
    const [errorMsg, setErrorMsg] = useState(null);

    const now = new Date();
    const expiry = new Date(food.expiryTime);
    const diffHrs = Math.max(0, (expiry - now) / 3600000);
    const isExpired = food.status === 'EXPIRED' || diffHrs <= 0;

    let urgencyBadge = {
        bg: "bg-emerald-50 text-emerald-700 border-emerald-200",
        label: `Expires in ${Math.round(diffHrs)}h`
    };

    if (isExpired) {
        urgencyBadge = {
            bg: "bg-red-50 text-red-700 border-red-200",
            label: "Expired"
        };
    } else if (diffHrs < 1) {
        const mins = Math.max(1, Math.round(diffHrs * 60));
        urgencyBadge = {
            bg: "bg-rose-50 text-rose-700 border-rose-200 animate-pulse",
            label: `⚡ Only ${mins}m left!`
        };
    } else if (diffHrs < 3) {
        urgencyBadge = {
            bg: "bg-amber-50 text-amber-700 border-amber-200",
            label: `⏳ ${Math.round(diffHrs)}h left`
        };
    }

    const handleQuickReserve = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!user) {
            navigate('/login');
            return;
        }

        if (user.role === 'supplier') {
            alert('Suppliers cannot reserve food. Please log in with a receiver account.');
            return;
        }

        setQuickReserving(true);
        setErrorMsg(null);
        try {
            const { data } = await axios.post('/api/reservations', {
                listingId: food._id,
                quantity: reserveQty
            });

            if (onReserved) onReserved(data);
            navigate(`/track-order/${data.pickupCode}`);
        } catch (err) {
            setErrorMsg(err.response?.data?.message || 'Failed to complete reservation.');
            setQuickReserving(false);
        }
    };

    return (
        <>
            <div className={`group bg-white rounded-3xl border border-slate-100 hover:border-brand-200 shadow-sm hover:shadow-xl hover:shadow-brand-500/5 transition-all duration-300 overflow-hidden flex flex-col justify-between ${
                compact ? '' : 'sm:flex-row'
            }`}>
                
                {/* Image Section */}
                <div className={`relative bg-slate-100 overflow-hidden shrink-0 ${
                    compact ? 'h-52 w-full' : 'h-52 sm:h-auto sm:w-56'
                }`}>
                    <img
                        src={food.image || DEFAULT_IMAGE}
                        onError={(e) => { e.currentTarget.src = DEFAULT_IMAGE; }}
                        alt={food.foodName}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    
                    {/* Portion Pill */}
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-black text-slate-800 shadow-md border border-white/50 flex items-center gap-1.5">
                        <Package className="w-3.5 h-3.5 text-brand-600" />
                        <span>{food.availableQuantity} {food.unit}</span>
                    </div>

                    {/* Expiry Urgency Badge */}
                    <div className="absolute top-3 right-3">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-black border shadow-sm backdrop-blur-md ${urgencyBadge.bg}`}>
                            {urgencyBadge.label}
                        </span>
                    </div>

                    {/* Food Type Pill */}
                    <div className="absolute bottom-3 left-3">
                        <span className={`px-2.5 py-0.5 rounded-lg text-xs font-black shadow-sm ${
                            food.foodType === 'Vegan' ? 'bg-emerald-600 text-white' :
                            food.foodType === 'Vegetarian' ? 'bg-green-600 text-white' :
                            food.foodType === 'Non-Vegetarian' ? 'bg-amber-600 text-white' :
                            'bg-slate-700 text-white'
                        }`}>
                            {food.foodType}
                        </span>
                    </div>
                </div>

                {/* Content Section */}
                <div className="p-5 sm:p-6 flex flex-col flex-1 justify-between min-w-0">
                    <div>
                        {/* Title & Status */}
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                            <h3 className="text-lg font-bold text-slate-900 group-hover:text-brand-700 transition-colors truncate" title={food.foodName}>
                                {food.foodName}
                            </h3>
                            <span className={`px-2.5 py-0.5 rounded-lg text-[11px] font-black shrink-0 ${
                                isExpired ? 'bg-red-100 text-red-700' :
                                food.status === 'AVAILABLE' ? 'bg-brand-50 text-brand-700 border border-brand-200' :
                                'bg-slate-100 text-slate-600'
                            }`}>
                                {isExpired ? 'EXPIRED' : food.status}
                            </span>
                        </div>

                        {/* Donor info */}
                        <p className="text-xs font-semibold text-slate-500 mb-3 flex items-center gap-1">
                            <span>Donor:</span>
                            <span className="font-bold text-slate-800">{food.supplier?.name || "Local Verified Supplier"}</span>
                        </p>

                        {/* Description */}
                        {food.description && (
                            <p className="text-xs text-slate-600 line-clamp-2 font-normal mb-4 leading-relaxed">
                                {food.description}
                            </p>
                        )}

                        {/* Dietary Tags */}
                        {food.dietaryInformation?.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mb-4">
                                {food.dietaryInformation.slice(0, 3).map((diet, i) => (
                                    <span key={i} className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 text-slate-600 border border-slate-200/60">
                                        <Tag className="w-2.5 h-2.5 mr-1 text-slate-400" />
                                        {diet}
                                    </span>
                                ))}
                                {food.dietaryInformation.length > 3 && (
                                    <span className="text-[11px] font-bold text-slate-400 self-center">
                                        +{food.dietaryInformation.length - 3} more
                                    </span>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Footer / Meta & Action */}
                    <div className="pt-4 border-t border-slate-100 space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-semibold text-slate-500">
                            <div className="flex items-center truncate" title={food.location}>
                                <MapPin className="w-3.5 h-3.5 mr-1 text-brand-500 shrink-0" />
                                <span className="truncate max-w-[180px]">{food.location}</span>
                            </div>
                            <div className="flex items-center text-slate-600">
                                <Clock className="w-3.5 h-3.5 mr-1 text-amber-500 shrink-0" />
                                <span>{new Date(food.pickupStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(food.pickupEnd).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                        </div>

                        <div className="flex items-center justify-between gap-2 pt-1">
                            <Link 
                                to={`/listing/${food._id}`} 
                                className="text-xs font-bold text-slate-600 hover:text-brand-700 flex items-center gap-1 transition-colors py-2"
                            >
                                <span>View Full Info</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                            </Link>

                            {food.status === 'AVAILABLE' && !isExpired && user?.role !== 'supplier' && (
                                <button
                                    onClick={() => setShowQuickModal(true)}
                                    className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md shadow-brand-500/20 hover:shadow-lg flex items-center gap-1.5"
                                >
                                    <Sparkles className="w-3.5 h-3.5" />
                                    <span>Quick Reserve</span>
                                </button>
                            )}
                        </div>
                    </div>

                </div>
            </div>

            {/* Quick 1-Click Reservation Modal */}
            {showQuickModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 animate-scale-up">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">Fast Food Rescue</span>
                                <h3 className="text-xl font-black text-slate-900">{food.foodName}</h3>
                                <p className="text-xs text-slate-500 font-medium">Pickup at {food.location}</p>
                            </div>
                            <button 
                                onClick={() => setShowQuickModal(false)}
                                className="p-2 text-slate-400 hover:text-slate-600 rounded-full bg-slate-100"
                            >
                                ✕
                            </button>
                        </div>

                        {errorMsg && (
                            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-xl text-xs font-medium flex items-center gap-2">
                                <AlertCircle className="w-4 h-4 shrink-0" />
                                <span>{errorMsg}</span>
                            </div>
                        )}

                        <div className="bg-brand-50/50 p-4 rounded-2xl border border-brand-100 mb-6">
                            <label className="block text-xs font-bold text-brand-900 mb-2">Select Portions to Reserve:</label>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center bg-white rounded-xl border border-brand-200 p-1">
                                    <button 
                                        type="button"
                                        onClick={() => setReserveQty(Math.max(1, reserveQty - 1))}
                                        className="w-8 h-8 flex items-center justify-center font-bold text-slate-600 hover:bg-slate-100 rounded-lg"
                                        disabled={reserveQty <= 1}
                                    >-</button>
                                    <span className="w-12 text-center font-black text-slate-900">{reserveQty}</span>
                                    <button 
                                        type="button"
                                        onClick={() => setReserveQty(Math.min(food.availableQuantity, reserveQty + 1))}
                                        className="w-8 h-8 flex items-center justify-center font-bold text-slate-600 hover:bg-slate-100 rounded-lg"
                                        disabled={reserveQty >= food.availableQuantity}
                                    >+</button>
                                </div>
                                <span className="text-xs font-bold text-brand-700">
                                    {food.availableQuantity} {food.unit} available
                                </span>
                            </div>
                            <p className="text-[11px] text-brand-600 font-semibold mt-2.5 flex items-center gap-1">
                                <Heart className="w-3.5 h-3.5 fill-current text-brand-500" />
                                <span>Rescuing this prevents ~{(reserveQty * 2.5).toFixed(1)} kg CO2 emissions!</span>
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => setShowQuickModal(false)}
                                className="flex-1 py-3 text-slate-600 hover:bg-slate-100 rounded-xl font-bold text-sm transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleQuickReserve}
                                disabled={quickReserving}
                                className="flex-1 py-3 bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white rounded-xl font-bold text-sm shadow-md shadow-brand-500/20 transition-all flex items-center justify-center gap-2"
                            >
                                {quickReserving ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span>Reserving...</span>
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle2 className="w-4 h-4" />
                                        <span>Confirm Reservation</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default FoodCard;

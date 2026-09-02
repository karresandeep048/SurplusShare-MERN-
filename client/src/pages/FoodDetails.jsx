import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { 
    MapPin, 
    Clock, 
    ShieldAlert, 
    Star, 
    Package, 
    CheckCircle2, 
    Loader2, 
    ArrowLeft, 
    Info, 
    Sparkles, 
    Heart, 
    Leaf, 
    Navigation, 
    Tag, 
    Building2,
    Calendar
} from 'lucide-react';
import FoodCard from '../components/FoodCard';

const DEFAULT_FOOD_IMAGE = "https://images.unsplash.com/photo-1490645943961-4a51e5f31070?w=800&q=80";

const FoodDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    
    const [food, setFood] = useState(null);
    const [similarListings, setSimilarListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [reserveAmount, setReserveAmount] = useState(1);
    const [reserving, setReserving] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchFoodDetails = async () => {
            setLoading(true);
            setError(null);
            try {
                const { data } = await axios.get(`/api/listings/${id}`);
                setFood(data);
                setReserveAmount(Math.min(1, data.availableQuantity || 1));

                // Fetch similar listings
                const allRes = await axios.get('/api/listings');
                const similar = (allRes.data || [])
                    .filter(item => item._id !== id && (item.foodType === data.foodType || item.status === 'AVAILABLE'))
                    .slice(0, 3);
                setSimilarListings(similar);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to load surplus food details.');
            } finally {
                setLoading(false);
            }
        };

        fetchFoodDetails();
    }, [id]);

    const handleReserve = async () => {
        if (!user) {
            navigate('/login');
            return;
        }

        if (user.role === 'supplier') {
            alert('Suppliers cannot reserve food. Please log in with a receiver account.');
            return;
        }

        setReserving(true);
        try {
            const { data } = await axios.post('/api/reservations', {
                listingId: id,
                quantity: reserveAmount
            });
            navigate(`/track-order/${data.pickupCode}`);
        } catch (err) {
            alert(err.response?.data?.message || 'Reservation failed. Please try again.');
            setReserving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <Loader2 className="w-10 h-10 animate-spin text-brand-600 mb-3" />
                <h3 className="text-sm font-bold text-slate-700">Loading surplus item details...</h3>
            </div>
        );
    }

    if (error || !food) {
        return (
            <div className="max-w-4xl mx-auto py-16 px-4 text-center">
                <div className="w-16 h-16 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mx-auto mb-4">
                    <Info className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-black text-slate-900 mb-2">Item Not Found</h2>
                <p className="text-slate-500 font-medium text-sm mb-6">{error || 'This surplus listing may have already been claimed or expired.'}</p>
                <Link to="/find-food" className="inline-flex items-center bg-brand-600 text-white font-bold px-6 py-3 rounded-xl text-sm shadow-md">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Browse Available Food
                </Link>
            </div>
        );
    }

    const now = new Date();
    const expiry = new Date(food.expiryTime);
    const diffHrs = Math.max(0, (expiry - now) / 3600000);
    const isAvailable = food.status === 'AVAILABLE' && food.availableQuantity > 0 && diffHrs > 0;

    const co2SavedKg = (reserveAmount * 2.5).toFixed(1);
    const waterSavedL = (reserveAmount * 140).toFixed(0);

    return (
        <div className="max-w-6xl mx-auto pb-16 pt-4 px-4 sm:px-6 lg:px-8">
            
            {/* Top Navigation */}
            <div className="flex items-center justify-between mb-6">
                <Link 
                    to="/find-food" 
                    className="inline-flex items-center text-sm font-bold text-slate-500 hover:text-brand-600 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Find Food
                </Link>
                <span className="text-xs font-bold text-slate-400">
                    Listing ID: {food._id?.slice(-6).toUpperCase()}
                </span>
            </div>

            {/* Main Showcase Hero Card */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden mb-8">
                <div className="grid grid-cols-1 lg:grid-cols-12">
                    
                    {/* Left: High-Resolution Photo Gallery */}
                    <div className="lg:col-span-6 relative bg-slate-100 min-h-[340px] sm:min-h-[440px]">
                        <img
                            src={food.image || DEFAULT_FOOD_IMAGE}
                            onError={(e) => { e.currentTarget.src = DEFAULT_FOOD_IMAGE; }}
                            alt={food.foodName}
                            className="w-full h-full object-cover absolute inset-0"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20"></div>

                        {/* Badges on Image */}
                        <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                            <span className="px-3.5 py-1 rounded-full text-xs font-black bg-white/95 text-slate-800 shadow-md backdrop-blur-md">
                                {food.availableQuantity} {food.unit} available
                            </span>
                            <span className="px-3.5 py-1 rounded-full text-xs font-black bg-brand-600 text-white shadow-md">
                                {food.foodType}
                            </span>
                        </div>

                        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white text-xs font-bold">
                            <span className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-3 py-1 rounded-xl">
                                <Clock className="w-3.5 h-3.5 text-amber-400" />
                                <span>Expires in {Math.round(diffHrs)} hours</span>
                            </span>
                            {food.coordinates?.lat && (
                                <a
                                    href={`https://www.google.com/maps/search/?api=1&query=${food.coordinates.lat},${food.coordinates.lng}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="bg-white/90 text-slate-900 px-3 py-1 rounded-xl hover:bg-white transition-all shadow"
                                >
                                    📍 Open Directions →
                                </a>
                            )}
                        </div>
                    </div>

                    {/* Right: Food Details & Interactive Reservation */}
                    <div className="lg:col-span-6 p-6 sm:p-10 flex flex-col justify-between">
                        <div>
                            
                            {/* Category & Status */}
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">
                                    Surplus Food Donation
                                </span>
                                <span className={`px-2.5 py-0.5 rounded-lg text-xs font-black ${
                                    isAvailable ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                                }`}>
                                    {isAvailable ? 'AVAILABLE FOR RESCUE' : food.status}
                                </span>
                            </div>

                            {/* Food Name */}
                            <h1 className="text-2xl sm:text-4xl font-black text-slate-900 leading-tight mb-4">
                                {food.foodName}
                            </h1>

                            {/* Description */}
                            <p className="text-slate-600 text-sm sm:text-base font-normal leading-relaxed mb-6">
                                {food.description}
                            </p>

                            {/* Info Grid */}
                            <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 mb-6">
                                <div>
                                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                                        Pickup Window
                                    </span>
                                    <div className="flex items-center text-xs font-bold text-slate-800">
                                        <Clock className="w-3.5 h-3.5 mr-1.5 text-brand-500" />
                                        <span>{new Date(food.pickupStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(food.pickupEnd).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                </div>

                                <div>
                                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                                        Pickup Location
                                    </span>
                                    <div className="flex items-center text-xs font-bold text-slate-800 truncate" title={food.location}>
                                        <MapPin className="w-3.5 h-3.5 mr-1.5 text-brand-500 shrink-0" />
                                        <span className="truncate">{food.location}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Dietary Badges */}
                            {food.dietaryInformation?.length > 0 && (
                                <div className="mb-6">
                                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                                        Dietary & Allergen Tags
                                    </span>
                                    <div className="flex flex-wrap gap-1.5">
                                        {food.dietaryInformation.map((diet, i) => (
                                            <span key={i} className="px-3 py-1 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200/60">
                                                {diet}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                        </div>

                        {/* Interactive Portion Selector & Reservation CTA */}
                        <div className="pt-6 border-t border-slate-100 mt-auto">
                            {isAvailable && user?.role !== 'supplier' ? (
                                <div className="space-y-4">
                                    
                                    {/* Portion selector & CO2 meter */}
                                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-brand-50/60 p-4 rounded-2xl border border-brand-100">
                                        <div>
                                            <span className="text-xs font-bold text-brand-900 block mb-1">Choose Portions to Reserve:</span>
                                            <div className="flex items-center bg-white rounded-xl border border-brand-200 p-1">
                                                <button
                                                    onClick={() => setReserveAmount(Math.max(1, reserveAmount - 1))}
                                                    className="w-9 h-9 flex items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 font-bold"
                                                    disabled={reserveAmount <= 1}
                                                >-</button>
                                                <span className="w-12 text-center font-black text-slate-900 text-base">{reserveAmount}</span>
                                                <button
                                                    onClick={() => setReserveAmount(Math.min(food.availableQuantity, reserveAmount + 1))}
                                                    className="w-9 h-9 flex items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 font-bold"
                                                    disabled={reserveAmount >= food.availableQuantity}
                                                >+</button>
                                            </div>
                                        </div>

                                        <div className="text-right sm:text-right w-full sm:w-auto">
                                            <span className="text-[11px] font-bold text-brand-800 uppercase block">Impact of your claim</span>
                                            <div className="text-xs font-black text-brand-700 flex items-center justify-end gap-2 mt-0.5">
                                                <span className="flex items-center gap-1"><Leaf className="w-3.5 h-3.5" /> -{co2SavedKg} kg CO2</span>
                                                <span>•</span>
                                                <span>💧 {waterSavedL} L water</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Button */}
                                    <button
                                        onClick={handleReserve}
                                        disabled={reserving}
                                        className="w-full py-4 bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white rounded-2xl font-black text-base shadow-lg shadow-brand-500/20 hover:shadow-xl transition-all flex items-center justify-center gap-2"
                                    >
                                        {reserving ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                <span>Generating Pickup Pass...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Sparkles className="w-5 h-5" />
                                                <span>Reserve {reserveAmount} {food.unit} & Get 6-Digit Pickup Code</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            ) : (
                                <div className="p-4 bg-slate-50 rounded-2xl text-center border border-slate-200/60">
                                    <p className="text-xs font-bold text-slate-600">
                                        {user?.role === 'supplier'
                                            ? 'Suppliers cannot reserve food listings.'
                                            : 'This surplus item is no longer available for reservation.'}
                                    </p>
                                    <Link to="/find-food" className="text-xs font-bold text-brand-600 hover:underline mt-1 inline-block">
                                        Browse other available listings →
                                    </Link>
                                </div>
                            )}
                        </div>

                    </div>
                </div>
            </div>

            {/* Donor Profile & Food Safety Badges */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                
                {/* Donor Profile */}
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-start gap-4">
                    <img
                        src={food.supplier?.profileImage || "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=120&q=80"}
                        alt={food.supplier?.name}
                        className="w-16 h-16 rounded-2xl object-cover border-2 border-brand-100 shrink-0"
                    />
                    <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Food Donor</span>
                        <h3 className="text-lg font-black text-slate-900">{food.supplier?.name || "Verified Local Supplier"}</h3>
                        <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs font-bold">
                            <span className="flex items-center text-amber-500">
                                <Star className="w-3.5 h-3.5 mr-1 fill-current" /> 4.9 Rating
                            </span>
                            <span className="flex items-center text-emerald-600">
                                <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Verified Partner
                            </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-2 font-medium">
                            Committed to sustainable food management and hunger relief in Bengaluru.
                        </p>
                    </div>
                </div>

                {/* Safety & Storage Advice */}
                <div className="bg-emerald-50/50 p-6 rounded-3xl border border-emerald-100 shadow-sm flex items-start gap-4">
                    <div className="p-3 bg-emerald-100 text-emerald-700 rounded-2xl shrink-0">
                        <ShieldAlert className="w-6 h-6" />
                    </div>
                    <div>
                        <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">Safety & Handling</span>
                        <h3 className="text-base font-black text-emerald-950 mb-1">Fresh Food Handling Guidelines</h3>
                        <p className="text-xs text-emerald-800 leading-relaxed font-medium">
                            Please consume freshly prepared items within 4 hours or refrigerate below 5°C. Verify packaging seals upon 6-digit code handover.
                        </p>
                    </div>
                </div>

            </div>

            {/* Similar Surplus Nearby */}
            {similarListings.length > 0 && (
                <div>
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-2xl font-black text-slate-900">Similar Surplus Food Nearby</h3>
                            <p className="text-xs text-slate-500 font-medium">More available surplus items in Bengaluru</p>
                        </div>
                        <Link to="/find-food" className="text-xs font-bold text-brand-600 hover:text-brand-700">
                            View All →
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        {similarListings.map(item => (
                            <FoodCard key={item._id} food={item} compact={true} />
                        ))}
                    </div>
                </div>
            )}

        </div>
    );
};

export default FoodDetails;

import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { MapPin, Clock, ShieldAlert, Star, Package, UserCircle, CheckCircle2, Loader2, ArrowLeft, Info } from 'lucide-react';

const FoodDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const [food, setFood] = useState(null);
    const [loading, setLoading] = useState(true);
    const [reserveAmount, setReserveAmount] = useState(1);
    const [reserving, setReserving] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchFood = async () => {
            try {
                const { data } = await axios.get(`/api/listings/${id}`);
                setFood(data);
                setReserveAmount(Math.min(1, data.availableQuantity));
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to load details');
            } finally {
                setLoading(false);
            }
        };
        fetchFood();
    }, [id]);

    const handleReserve = async () => {
        if (!user) {
            navigate('/login');
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
            alert(err.response?.data?.message || 'Reservation failed');
            setReserving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-[calc(100vh-64px)]">
                <Loader2 className="w-10 h-10 animate-spin text-brand-600" />
            </div>
        );
    }

    if (error || !food) {
        return (
            <div className="max-w-7xl mx-auto py-12 px-4 text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Oops!</h2>
                <p className="text-gray-500">{error || 'Food not found'}</p>
                <Link to="/find-food" className="mt-4 inline-block text-brand-600 font-medium">← Back to listings</Link>
            </div>
        );
    }

    const isAvailable = food.status === 'AVAILABLE' && food.availableQuantity > 0;
    const now = new Date();
    const expiry = new Date(food.expiryTime);
    const diffHrs = Math.max(0, (expiry - now) / 3600000);

    let expiryColor = "bg-green-100 text-green-800";
    if (diffHrs < 1) expiryColor = "bg-red-100 text-red-800";
    else if (diffHrs < 3) expiryColor = "bg-orange-100 text-orange-800";

    return (
        <div className="max-w-7xl mx-auto pb-12 pt-4 px-4 sm:px-6 lg:px-8">
            <Link to="/find-food" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 mb-6 transition-colors">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Find Food
            </Link>

            <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
                <div className="flex flex-col lg:flex-row">
                    {/* Image Section */}
                    <div className="lg:w-1/2 relative bg-gray-100 min-h-[300px] sm:min-h-[400px]">
                        <img
                            src={food.image || "https://images.unsplash.com/photo-1490645943961-4a51e5f31070?w=800&q=80"}
                            alt={food.foodName}
                            className="absolute inset-0 w-full h-full object-cover"
                        />
                        <div className="absolute top-4 left-4">
                            <span className={`px-4 py-1.5 rounded-full text-sm font-bold shadow-md backdrop-blur-md bg-white/90 ${food.status === 'AVAILABLE' ? 'text-brand-700' : 'text-gray-600'}`}>
                                {food.status}
                            </span>
                        </div>
                    </div>

                    {/* Details Section */}
                    <div className="lg:w-1/2 p-6 sm:p-10 flex flex-col">
                        <div className="mb-2">
                            <span className="inline-block px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-bold uppercase tracking-wider mb-3">
                                {food.foodType}
                            </span>
                        </div>

                        <h1 className="text-3xl sm:text-4xl font-black text-gray-900 leading-tight mb-4">
                            {food.foodName}
                        </h1>

                        <p className="text-gray-600 text-lg mb-8 leading-relaxed font-light">
                            {food.description}
                        </p>

                        <div className="grid grid-cols-2 gap-6 mb-8">
                            <div>
                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Availability</h4>
                                <div className="flex items-center text-gray-900 font-semibold text-lg">
                                    <Package className="w-5 h-5 mr-2 text-brand-500" />
                                    {food.availableQuantity} {food.unit}
                                </div>
                            </div>

                            <div>
                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Distance</h4>
                                <div className="flex items-center text-gray-900 font-semibold text-lg">
                                    <MapPin className="w-5 h-5 mr-2 text-brand-500" />
                                    1.2 km away
                                </div>
                            </div>

                            <div>
                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Pickup Time</h4>
                                <div className="flex items-center text-gray-900 font-semibold">
                                    <Clock className="w-5 h-5 mr-2 text-brand-500" />
                                    {new Date(food.pickupStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(food.pickupEnd).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>

                            <div>
                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Expiry</h4>
                                <div className="flex items-center">
                                    <span className={`px-2.5 py-1 flex items-center rounded-lg text-sm font-bold ${expiryColor}`}>
                                        <Info className="w-4 h-4 mr-1.5" />
                                        Expires in {Math.round(diffHrs)} hrs
                                    </span>
                                </div>
                            </div>
                        </div>

                        {food.dietaryInformation?.length > 0 && (
                            <div className="mb-10">
                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Dietary Information</h4>
                                <div className="flex flex-wrap gap-2">
                                    {food.dietaryInformation.map((diet, i) => (
                                        <span key={i} className="px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-lg text-sm font-medium text-gray-700">
                                            {diet}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="mt-auto pt-8 border-t border-gray-100">
                            {isAvailable && (user?.role !== 'supplier') ? (
                                <div className="flex flex-col sm:flex-row items-center gap-4">
                                    <div className="flex items-center bg-gray-50 rounded-xl border border-gray-200 p-1 w-full sm:w-auto">
                                        <button
                                            onClick={() => setReserveAmount(Math.max(1, reserveAmount - 1))}
                                            className="w-10 h-10 flex items-center justify-center rounded-lg text-gray-500 hover:bg-white hover:shadow-sm hover:text-gray-900 font-bold transition-all"
                                            disabled={reserveAmount <= 1}
                                        >-</button>
                                        <span className="w-12 text-center font-bold text-gray-900">{reserveAmount}</span>
                                        <button
                                            onClick={() => setReserveAmount(Math.min(food.availableQuantity, reserveAmount + 1))}
                                            className="w-10 h-10 flex items-center justify-center rounded-lg text-gray-500 hover:bg-white hover:shadow-sm hover:text-gray-900 font-bold transition-all"
                                            disabled={reserveAmount >= food.availableQuantity}
                                        >+</button>
                                    </div>
                                    <button
                                        onClick={handleReserve}
                                        disabled={reserving}
                                        className="w-full flex-1 bg-brand-600 hover:bg-brand-700 disabled:opacity-70 disabled:cursor-not-allowed text-white text-lg font-bold py-3.5 px-6 rounded-xl shadow-lg hover:shadow-brand-500/30 transition-all flex justify-center items-center"
                                    >
                                        {reserving ? <Loader2 className="w-6 h-6 animate-spin" /> : `Reserve ${reserveAmount} ${food.unit}`}
                                    </button>
                                </div>
                            ) : (
                                <div className="p-4 bg-gray-50 rounded-xl text-center text-gray-500 font-medium border border-gray-100">
                                    {user?.role === 'supplier' ? 'Suppliers cannot reserve food.' : 'This listing is no longer available for reservation.'}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Grid for Donor & Safety */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">

                {/* About the Donor */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-start space-x-4">
                    <img src={food.supplier?.profileImage || "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=100&q=80"} alt={food.supplier?.name} className="w-16 h-16 rounded-full object-cover border-2 border-brand-100" />
                    <div>
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">About the Donor</h4>
                        <h3 className="text-lg font-bold text-gray-900">{food.supplier?.name || "Verified Local Supplier"}</h3>
                        <div className="flex gap-4 mt-2">
                            <span className="flex items-center text-sm font-medium text-amber-500">
                                <Star className="w-4 h-4 mr-1 fill-current" /> 4.9 (120+)
                            </span>
                            <span className="flex items-center text-sm font-medium text-brand-600">
                                <CheckCircle2 className="w-4 h-4 mr-1" /> Verified
                            </span>
                        </div>
                    </div>
                </div>

                {/* Safety Tips */}
                <div className="bg-orange-50/50 rounded-2xl border border-orange-100 p-6 flex items-start space-x-4">
                    <div className="p-3 bg-orange-100 text-orange-600 rounded-full shrink-0">
                        <ShieldAlert className="w-6 h-6" />
                    </div>
                    <div>
                        <h4 className="text-xs font-bold text-orange-400 uppercase tracking-wider mb-1">Safety Tips</h4>
                        <p className="text-sm text-gray-700 leading-relaxed font-medium">
                            Meet in a public place and avoid sharing unnecessary personal information. Report any issue through the safety tools in your profile if items do not match their description.
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default FoodDetails;

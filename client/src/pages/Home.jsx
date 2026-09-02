import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
    ArrowRight, 
    Leaf, 
    Heart, 
    ShieldCheck, 
    Search, 
    Sparkles, 
    Package, 
    Clock, 
    Navigation, 
    KeyRound, 
    TrendingUp, 
    Users, 
    CheckCircle2, 
    Building2, 
    ChevronRight,
    MapPin,
    Droplet,
    Flame
} from 'lucide-react';
import FoodCard from '../components/FoodCard';

const Home = () => {
    const navigate = useNavigate();
    const [quickSearch, setQuickSearch] = useState('');
    const [liveListings, setLiveListings] = useState([]);
    const [loadingLive, setLoadingLive] = useState(true);
    const [calculatorMeals, setCalculatorMeals] = useState(10); // meals per week slider

    useEffect(() => {
        const fetchLiveListings = async () => {
            try {
                const { data } = await axios.get('/api/listings');
                setLiveListings((data || []).slice(0, 3));
            } catch (err) {
                console.error('Error fetching live listings for home:', err);
            } finally {
                setLoadingLive(false);
            }
        };
        fetchLiveListings();
    }, []);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (quickSearch.trim()) {
            navigate(`/find-food?search=${encodeURIComponent(quickSearch.trim())}`);
        } else {
            navigate('/find-food');
        }
    };

    // Calculate dynamic environmental metrics
    const co2SavedKg = (calculatorMeals * 2.5 * 52).toFixed(0);
    const waterSavedLitres = (calculatorMeals * 140 * 52).toLocaleString();
    const moneySavedINR = (calculatorMeals * 120 * 52).toLocaleString();

    return (
        <div className="bg-slate-50 min-h-screen flex flex-col overflow-hidden">
            
            {/* HERO SECTION */}
            <section className="relative pt-12 pb-20 lg:pt-20 lg:pb-32 overflow-hidden bg-gradient-to-b from-emerald-50/50 via-white to-slate-50">
                {/* Decorative blur orbs */}
                <div className="absolute -top-24 -left-24 w-96 h-96 bg-brand-200/40 rounded-full filter blur-3xl pointer-events-none animate-float"></div>
                <div className="absolute top-1/2 -right-24 w-96 h-96 bg-emerald-200/40 rounded-full filter blur-3xl pointer-events-none animate-float" style={{ animationDelay: '2s' }}></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                        
                        {/* Left Column: Hero Text & Search */}
                        <div className="lg:col-span-7 text-center lg:text-left space-y-6">
                            
                            {/* Live Badge */}
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-100/80 border border-brand-200/80 text-brand-800 text-xs font-bold shadow-sm">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                                <span>1,420+ Surplus Meals Rescued in Bengaluru This Month</span>
                            </div>

                            {/* Main Heading */}
                            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-slate-900 tracking-tight leading-[1.1]">
                                Save Food. <br />
                                <span className="bg-gradient-to-r from-brand-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent">
                                    Share Good.
                                </span>
                            </h1>

                            <p className="text-lg sm:text-xl text-slate-600 font-normal max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                                Connect surplus food from local restaurants, bakeries, and canteens directly with community members and shelters before it goes to waste.
                            </p>

                            {/* Hero Search Bar */}
                            <form onSubmit={handleSearchSubmit} className="max-w-xl mx-auto lg:mx-0 pt-2">
                                <div className="bg-white p-2 rounded-2xl shadow-xl shadow-brand-500/10 border border-slate-200/80 flex flex-col sm:flex-row items-center gap-2">
                                    <div className="flex items-center gap-3 px-3 flex-1 w-full">
                                        <Search className="w-5 h-5 text-brand-600 shrink-0" />
                                        <input
                                            type="text"
                                            placeholder="Search food, cuisine, or location (e.g. Biryani, Indiranagar)..."
                                            className="w-full py-2.5 bg-transparent outline-none text-slate-800 placeholder-slate-400 text-sm font-medium"
                                            value={quickSearch}
                                            onChange={(e) => setQuickSearch(e.target.value)}
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        className="w-full sm:w-auto bg-brand-600 hover:bg-brand-700 text-white font-bold px-6 py-3 rounded-xl transition-all shadow-md shadow-brand-500/20 text-sm shrink-0 flex items-center justify-center gap-2"
                                    >
                                        <span>Find Food</span>
                                        <ArrowRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </form>

                            {/* Action CTA Buttons */}
                            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-4">
                                <Link
                                    to="/post-food"
                                    className="px-6 py-3.5 rounded-xl text-sm font-bold bg-slate-900 hover:bg-slate-800 text-white shadow-lg transition-all flex items-center gap-2"
                                >
                                    <Building2 className="w-4 h-4 text-emerald-400" />
                                    <span>Donate Surplus Food</span>
                                </Link>
                                <a
                                    href="#how-it-works"
                                    className="px-6 py-3.5 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-100 border border-slate-200 transition-all"
                                >
                                    How It Works ↓
                                </a>
                            </div>

                        </div>

                        {/* Right Column: Hero Visual Graphic */}
                        <div className="lg:col-span-5 relative flex justify-center">
                            <div className="relative w-full max-w-md aspect-square">
                                
                                {/* Background Glow Ring */}
                                <div className="absolute inset-0 bg-gradient-to-tr from-brand-300 to-emerald-400 rounded-[3rem] rotate-6 scale-95 opacity-60 filter blur-xl"></div>
                                
                                {/* Main Image Card */}
                                <div className="relative w-full h-full rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white bg-slate-100">
                                    <img
                                        src="https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=800&auto=format&fit=crop"
                                        alt="Fresh surplus grocery and meals"
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                                    
                                    <div className="absolute bottom-6 left-6 right-6 text-white">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-black uppercase tracking-wider">
                                                Verified Donor
                                            </span>
                                            <span className="text-xs text-white/80 font-medium">10 mins ago</span>
                                        </div>
                                        <h3 className="text-lg font-black leading-tight">Fresh Vegetable Biryani & Bakery Breads</h3>
                                        <p className="text-xs text-white/90 mt-1 flex items-center gap-1">
                                            <MapPin className="w-3 h-3 text-emerald-400" /> Koramangala, Bengaluru
                                        </p>
                                    </div>
                                </div>

                                {/* Floating Live Floating Card 1 */}
                                <div className="absolute -top-4 -right-4 bg-white/95 backdrop-blur-md p-3.5 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-3 animate-float">
                                    <div className="w-10 h-10 rounded-xl bg-brand-100 text-brand-600 flex items-center justify-center font-bold">
                                        <Leaf className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-bold text-slate-400 uppercase">CO2 Avoided</p>
                                        <p className="text-sm font-black text-slate-900">3.55 Tons</p>
                                    </div>
                                </div>

                                {/* Floating Live Floating Card 2 */}
                                <div className="absolute -bottom-4 -left-4 bg-white/95 backdrop-blur-md p-3.5 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-3 animate-float" style={{ animationDelay: '1.5s' }}>
                                    <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center font-bold">
                                        <Clock className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-bold text-slate-400 uppercase">Average Handover</p>
                                        <p className="text-sm font-black text-slate-900">12 Mins</p>
                                    </div>
                                </div>

                            </div>
                        </div>

                    </div>
                </div>
            </section>

            {/* LIVE SURPLUS FOOD SHOWCASE */}
            <section className="py-16 bg-white border-y border-slate-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
                        <div>
                            <div className="flex items-center gap-2 text-brand-600 font-bold text-xs uppercase tracking-wider mb-2">
                                <Sparkles className="w-4 h-4" /> Available Right Now
                            </div>
                            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                                Fresh Surplus Ready for Pickup
                            </h2>
                            <p className="text-slate-500 font-medium text-sm mt-1">
                                Discover fresh food posted by verified donors across Bengaluru.
                            </p>
                        </div>
                        <Link
                            to="/find-food"
                            className="inline-flex items-center text-sm font-bold text-brand-600 hover:text-brand-700 gap-1.5 transition-colors"
                        >
                            <span>Explore Interactive Map & All Listings</span>
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>

                    {loadingLive ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[1, 2, 3].map(n => (
                                <div key={n} className="h-64 bg-slate-100 rounded-3xl animate-pulse"></div>
                            ))}
                        </div>
                    ) : liveListings.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {liveListings.map(food => (
                                <FoodCard key={food._id} food={food} compact={true} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                            <Package className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                            <h4 className="font-bold text-slate-700">No surplus food currently available</h4>
                            <p className="text-xs text-slate-500 mt-1">Be the first to share surplus food!</p>
                            <Link to="/post-food" className="mt-4 inline-block bg-brand-600 text-white font-bold px-4 py-2 rounded-xl text-xs">
                                + Share Food
                            </Link>
                        </div>
                    )}
                </div>
            </section>

            {/* HOW IT WORKS SECTION */}
            <section id="how-it-works" className="py-20 bg-slate-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <span className="text-brand-600 text-xs font-black uppercase tracking-widest bg-brand-50 border border-brand-200 px-3 py-1 rounded-full">
                            Zero Waste Lifecycle
                        </span>
                        <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight mt-3">
                            How SurplusShare Works
                        </h2>
                        <p className="text-slate-600 text-base sm:text-lg mt-3 font-normal">
                            A seamless, verified 4-step process to ensure safe, transparent food rescue.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        
                        {/* Step 1 */}
                        <div className="bg-white p-7 rounded-3xl shadow-sm border border-slate-100 relative group hover:shadow-md transition-all">
                            <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center font-black text-lg mb-5 border border-brand-100 group-hover:scale-110 transition-transform">
                                1
                            </div>
                            <h3 className="text-lg font-black text-slate-900 mb-2">1. Post Surplus Food</h3>
                            <p className="text-xs text-slate-500 font-medium leading-relaxed">
                                Restaurants, caterers, or households list available surplus with photos, quantity, pickup time, and exact GPS location.
                            </p>
                        </div>

                        {/* Step 2 */}
                        <div className="bg-white p-7 rounded-3xl shadow-sm border border-slate-100 relative group hover:shadow-md transition-all">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black text-lg mb-5 border border-emerald-100 group-hover:scale-110 transition-transform">
                                2
                            </div>
                            <h3 className="text-lg font-black text-slate-900 mb-2">2. Reserve Portions</h3>
                            <p className="text-xs text-slate-500 font-medium leading-relaxed">
                                Community members, students, or NGOs browse nearby items on the map and claim portions in one click.
                            </p>
                        </div>

                        {/* Step 3 */}
                        <div className="bg-white p-7 rounded-3xl shadow-sm border border-slate-100 relative group hover:shadow-md transition-all">
                            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-lg mb-5 border border-blue-100 group-hover:scale-110 transition-transform">
                                3
                            </div>
                            <h3 className="text-lg font-black text-slate-900 mb-2">3. Live GPS Navigation</h3>
                            <p className="text-xs text-slate-500 font-medium leading-relaxed">
                                Receivers navigate to the pickup location and alert the donor upon arrival with an instant 1-click ping.
                            </p>
                        </div>

                        {/* Step 4 */}
                        <div className="bg-white p-7 rounded-3xl shadow-sm border border-slate-100 relative group hover:shadow-md transition-all">
                            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-black text-lg mb-5 border border-amber-100 group-hover:scale-110 transition-transform">
                                4
                            </div>
                            <h3 className="text-lg font-black text-slate-900 mb-2">4. 6-Digit Code Handover</h3>
                            <p className="text-xs text-slate-500 font-medium leading-relaxed">
                                Donor verifies the receiver's unique 6-digit code to complete handover and automatically log meals rescued.
                            </p>
                        </div>

                    </div>
                </div>
            </section>

            {/* INTERACTIVE IMPACT CALCULATOR */}
            <section className="py-20 bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 text-white relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                        
                        <div className="lg:col-span-5 space-y-4">
                            <span className="text-emerald-400 text-xs font-black uppercase tracking-widest bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
                                Environmental Impact
                            </span>
                            <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
                                Your Food Rescue Multiplier.
                            </h2>
                            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                                Food waste accounts for 8-10% of global greenhouse emissions. Adjust the slider to see the yearly difference your rescues make.
                            </p>

                            {/* Slider Box */}
                            <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/10 mt-6">
                                <div className="flex justify-between items-center mb-3">
                                    <label className="text-xs font-bold text-slate-300 uppercase">Weekly Rescued Meals:</label>
                                    <span className="text-2xl font-black text-emerald-400">{calculatorMeals} meals / wk</span>
                                </div>
                                <input
                                    type="range"
                                    min="1"
                                    max="50"
                                    value={calculatorMeals}
                                    onChange={(e) => setCalculatorMeals(Number(e.target.value))}
                                    className="w-full accent-emerald-500 cursor-pointer h-2 bg-slate-700 rounded-lg"
                                />
                                <div className="flex justify-between text-[11px] text-slate-400 font-bold mt-2">
                                    <span>1 meal</span>
                                    <span>25 meals</span>
                                    <span>50 meals</span>
                                </div>
                            </div>
                        </div>

                        {/* Calculated Results */}
                        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-6">
                            
                            <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/10 flex flex-col justify-between">
                                <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-2xl w-fit mb-4">
                                    <Leaf className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="text-3xl sm:text-4xl font-black text-emerald-300 mb-1">{co2SavedKg} kg</h4>
                                    <p className="text-xs font-bold text-slate-300 uppercase tracking-wider">CO2 Emissions Prevented</p>
                                    <p className="text-[11px] text-slate-400 mt-2 font-medium">Equivalent to ~{(co2SavedKg / 120).toFixed(0)} tree seedlings grown for 10 years.</p>
                                </div>
                            </div>

                            <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/10 flex flex-col justify-between">
                                <div className="p-3 bg-blue-500/20 text-blue-400 rounded-2xl w-fit mb-4">
                                    <Droplet className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="text-3xl sm:text-4xl font-black text-blue-300 mb-1">{waterSavedLitres} L</h4>
                                    <p className="text-xs font-bold text-slate-300 uppercase tracking-wider">Freshwater Conserved</p>
                                    <p className="text-[11px] text-slate-400 mt-2 font-medium">Water embedded in agricultural production and preparation.</p>
                                </div>
                            </div>

                            <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/10 flex flex-col justify-between">
                                <div className="p-3 bg-amber-500/20 text-amber-400 rounded-2xl w-fit mb-4">
                                    <Flame className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="text-3xl sm:text-4xl font-black text-amber-300 mb-1">₹{moneySavedINR}</h4>
                                    <p className="text-xs font-bold text-slate-300 uppercase tracking-wider">Community Food Value</p>
                                    <p className="text-[11px] text-slate-400 mt-2 font-medium">Nutritious meals redirected from landfills to community plates.</p>
                                </div>
                            </div>

                        </div>

                    </div>
                </div>
            </section>

            {/* ROLE PATHWAY CARDS */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        
                        {/* Food Donors Card */}
                        <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-slate-50 to-brand-50/50 border border-brand-100 flex flex-col justify-between">
                            <div>
                                <span className="text-brand-700 text-xs font-black uppercase tracking-wider bg-brand-100 px-3 py-1 rounded-full">
                                    For Businesses & Donors
                                </span>
                                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mt-4 mb-3">
                                    Turn Surplus into Verified Social Impact
                                </h3>
                                <p className="text-sm text-slate-600 mb-6 leading-relaxed">
                                    Restaurants, bakeries, corporate cafeterias, and event caterers can list surplus food in seconds, reduce waste management costs, and earn recognized sustainability certifications.
                                </p>
                                <ul className="space-y-2.5 text-xs font-bold text-slate-700 mb-8">
                                    <li className="flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-brand-600" />
                                        <span>60-second listing creation with AI presets</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-brand-600" />
                                        <span>Secure 6-digit pickup verification</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-brand-600" />
                                        <span>Automated CO2 and meal impact tracking</span>
                                    </li>
                                </ul>
                            </div>
                            <Link
                                to="/post-food"
                                className="bg-brand-600 hover:bg-brand-700 text-white font-bold py-3.5 px-6 rounded-xl text-center shadow-md shadow-brand-500/20 transition-all text-sm"
                            >
                                Start Sharing Surplus Food →
                            </Link>
                        </div>

                        {/* Food Receivers Card */}
                        <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-slate-50 to-emerald-50/50 border border-emerald-100 flex flex-col justify-between">
                            <div>
                                <span className="text-emerald-700 text-xs font-black uppercase tracking-wider bg-emerald-100 px-3 py-1 rounded-full">
                                    For Receivers & NGOs
                                </span>
                                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mt-4 mb-3">
                                    Access Fresh, High-Quality Surplus Food
                                </h3>
                                <p className="text-sm text-slate-600 mb-6 leading-relaxed">
                                    Discover free, safe meals from top food establishments in your neighborhood. Perfect for students, families, volunteers, and local shelter programs.
                                </p>
                                <ul className="space-y-2.5 text-xs font-bold text-slate-700 mb-8">
                                    <li className="flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                        <span>Live interactive map & distance radius filter</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                        <span>Real-time GPS tracker with estimated arrival time</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                        <span>Digital QR & 6-digit handover passes</span>
                                    </li>
                                </ul>
                            </div>
                            <Link
                                to="/find-food"
                                className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 px-6 rounded-xl text-center shadow-md transition-all text-sm"
                            >
                                Browse Nearby Surplus →
                            </Link>
                        </div>

                    </div>
                </div>
            </section>

            {/* FOOTER */}
            <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                        <div className="md:col-span-2 space-y-3">
                            <div className="flex items-center gap-2 text-white">
                                <div className="w-8 h-8 rounded-xl bg-brand-600 flex items-center justify-center text-white">
                                    <Sparkles className="w-4 h-4" />
                                </div>
                                <span className="text-xl font-black">SurplusShare</span>
                            </div>
                            <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
                                SurplusShare is an open community platform dedicated to eradicating edible food waste and eliminating hunger through real-time food rescue matching.
                            </p>
                        </div>
                        <div>
                            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Quick Links</h4>
                            <ul className="space-y-2 text-xs">
                                <li><Link to="/find-food" className="hover:text-white transition-colors">Find Food</Link></li>
                                <li><Link to="/post-food" className="hover:text-white transition-colors">Share Food</Link></li>
                                <li><Link to="/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
                                <li><Link to="/profile" className="hover:text-white transition-colors">Impact Score</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Safety & Trust</h4>
                            <p className="text-xs text-slate-400 leading-relaxed">
                                Verified donors, real-time expiry clocks, and 6-digit confirmation codes protect food safety at every step.
                            </p>
                        </div>
                    </div>
                    <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500">
                        <p>© 2026 SurplusShare Platform. Built with care for our planet.</p>
                        <div className="flex gap-4">
                            <span>🌱 100% Zero Waste Initiative</span>
                            <span>📍 Bengaluru, India</span>
                        </div>
                    </div>
                </div>
            </footer>

        </div>
    );
};

export default Home;

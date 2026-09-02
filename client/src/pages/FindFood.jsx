import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useLocation, Link } from 'react-router-dom';
import FoodCard from '../components/FoodCard';
import { 
    Search, 
    Loader2, 
    MapPin, 
    SlidersHorizontal, 
    Navigation, 
    Grid, 
    Columns, 
    Map as MapIcon, 
    Sparkles, 
    Clock, 
    Tag, 
    X, 
    RotateCcw,
    AlertCircle,
    Package
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Custom Urgent Food Pin
const createUrgentIcon = () => L.divIcon({
    html: `
        <div class="relative w-8 h-8 flex items-center justify-center">
            <div class="absolute inset-0 bg-rose-500 rounded-full animate-ping opacity-30"></div>
            <div class="relative z-10 w-7 h-7 bg-rose-600 rounded-full shadow-lg border-2 border-white flex items-center justify-center text-white text-xs font-black">
                ⚡
            </div>
        </div>
    `,
    className: '',
    iconSize: [32, 32],
    iconAnchor: [16, 16]
});

// Custom Fresh Food Pin
const createFreshIcon = () => L.divIcon({
    html: `
        <div class="w-7 h-7 bg-emerald-600 rounded-full shadow-lg border-2 border-white flex items-center justify-center text-white text-xs font-black">
            🌱
        </div>
    `,
    className: '',
    iconSize: [28, 28],
    iconAnchor: [14, 14]
});

// User Location Pin
const createUserIcon = () => L.divIcon({
    html: `
        <div class="relative w-8 h-8 flex items-center justify-center">
            <div class="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-40"></div>
            <div class="relative z-10 w-6 h-6 bg-blue-600 rounded-full shadow-lg border-2 border-white flex items-center justify-center text-white text-xs">
                📍
            </div>
        </div>
    `,
    className: '',
    iconSize: [32, 32],
    iconAnchor: [16, 16]
});

// Helper component to center map on user or coordinates
function MapAutoCenter({ center }) {
    const map = useMap();
    useEffect(() => {
        if (center && center[0] && center[1]) {
            map.flyTo(center, Math.max(map.getZoom(), 13), { duration: 1 });
        }
    }, [center, map]);
    return null;
}

// Calculate distance in km between two lat/lng pairs using Haversine formula
const calculateDistance = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return null;
    const R = 6371; // Radius of the Earth in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
            Math.cos((lat2 * Math.PI) / 180) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
};

const CATEGORIES = ['All', 'Vegetarian', 'Vegan', 'Non-Vegetarian'];
const DIETARY_TAGS = ['Gluten-Free', 'Halal', 'Organic', 'Dairy-Free', 'Nut-Free', 'No Onion/Garlic'];

const FindFood = () => {
    const routeLocation = useLocation();
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Filters & Search
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedDietary, setSelectedDietary] = useState([]);
    const [maxDistanceKm, setMaxDistanceKm] = useState('all'); // 'all', '3', '5', '10', '25'
    const [sortBy, setSortBy] = useState('urgent'); // 'urgent', 'nearest', 'recent', 'quantity'
    const [viewMode, setViewMode] = useState('split'); // 'split', 'grid', 'map'
    const [showFiltersDrawer, setShowFiltersDrawer] = useState(false);

    // User Geolocation
    const [userCoords, setUserCoords] = useState([12.9716, 77.5946]); // Bengaluru default
    const [hasUserLocation, setHasUserLocation] = useState(false);
    const [locatingUser, setLocatingUser] = useState(false);

    // Read initial search query from URL if present
    useEffect(() => {
        const queryParams = new URLSearchParams(routeLocation.search);
        const search = queryParams.get('search');
        if (search) {
            setSearchTerm(search);
        }
    }, [routeLocation.search]);

    // Fetch listings from API
    const fetchListings = async () => {
        try {
            const { data } = await axios.get('/api/listings');
            setListings(data || []);
        } catch (err) {
            console.error('Error fetching listings:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchListings();
        // Periodically refresh listings every 30s
        const interval = setInterval(fetchListings, 30000);
        return () => clearInterval(interval);
    }, []);

    // Get user geolocation
    const handleGetUserLocation = () => {
        if (!navigator.geolocation) {
            alert('Geolocation is not supported by your browser.');
            return;
        }

        setLocatingUser(true);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const lat = pos.coords.latitude;
                const lng = pos.coords.longitude;
                setUserCoords([lat, lng]);
                setHasUserLocation(true);
                setLocatingUser(false);
            },
            (err) => {
                console.error(err);
                setLocatingUser(false);
                alert('Could not retrieve your location. Please check browser permissions.');
            },
            { enableHighAccuracy: true, timeout: 8000 }
        );
    };

    const toggleDietaryTag = (tag) => {
        if (selectedDietary.includes(tag)) {
            setSelectedDietary(selectedDietary.filter(t => t !== tag));
        } else {
            setSelectedDietary([...selectedDietary, tag]);
        }
    };

    const resetFilters = () => {
        setSearchTerm('');
        setSelectedCategory('All');
        setSelectedDietary([]);
        setMaxDistanceKm('all');
        setSortBy('urgent');
    };

    // Filter & Sort listings
    const processedListings = useMemo(() => {
        const now = new Date();

        return listings
            .map(item => {
                const dist = item.coordinates?.lat && item.coordinates?.lng
                    ? calculateDistance(userCoords[0], userCoords[1], item.coordinates.lat, item.coordinates.lng)
                    : null;
                const expiry = new Date(item.expiryTime);
                const diffHrs = Math.max(0, (expiry - now) / 3600000);
                return {
                    ...item,
                    distanceKm: dist,
                    diffHrs
                };
            })
            .filter(food => {
                // Search match
                const term = searchTerm.toLowerCase();
                const matchesSearch = !searchTerm || 
                    food.foodName?.toLowerCase().includes(term) ||
                    food.location?.toLowerCase().includes(term) ||
                    food.description?.toLowerCase().includes(term) ||
                    food.supplier?.name?.toLowerCase().includes(term);

                // Category match
                const matchesCat = selectedCategory === 'All' || food.foodType === selectedCategory;

                // Dietary tags match
                const matchesDiet = selectedDietary.length === 0 || 
                    (food.dietaryInformation && selectedDietary.every(tag => food.dietaryInformation.includes(tag)));

                // Distance match
                const matchesDist = maxDistanceKm === 'all' || 
                    (food.distanceKm !== null && food.distanceKm <= Number(maxDistanceKm));

                return matchesSearch && matchesCat && matchesDiet && matchesDist;
            })
            .sort((a, b) => {
                if (sortBy === 'urgent') return a.diffHrs - b.diffHrs;
                if (sortBy === 'nearest') {
                    if (a.distanceKm === null) return 1;
                    if (b.distanceKm === null) return -1;
                    return a.distanceKm - b.distanceKm;
                }
                if (sortBy === 'recent') return new Date(b.createdAt) - new Date(a.createdAt);
                if (sortBy === 'quantity') return b.availableQuantity - a.availableQuantity;
                return 0;
            });
    }, [listings, searchTerm, selectedCategory, selectedDietary, maxDistanceKm, sortBy, userCoords]);

    return (
        <div className="h-[calc(100vh-64px)] flex flex-col overflow-hidden bg-slate-50">
            
            {/* TOP FILTER & SEARCH BAR */}
            <header className="bg-white border-b border-slate-200/80 px-4 sm:px-6 py-3.5 z-20 shrink-0 shadow-sm">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
                    
                    {/* Search Input & Locate Button */}
                    <div className="flex items-center gap-2 w-full md:w-auto flex-1 max-w-xl">
                        <div className="relative flex-1">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                <Search className="w-4 h-4 text-slate-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search surplus food, cuisine, or area..."
                                className="w-full pl-10 pr-8 py-2 bg-slate-100 hover:bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-800 placeholder-slate-400 outline-none focus:ring-2 focus:ring-brand-500 transition-all"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            {searchTerm && (
                                <button
                                    onClick={() => setSearchTerm('')}
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>

                        {/* Use My Location Button */}
                        <button
                            type="button"
                            onClick={handleGetUserLocation}
                            disabled={locatingUser}
                            className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 shrink-0 ${
                                hasUserLocation 
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300 ring-2 ring-emerald-400/20' 
                                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                            }`}
                            title="Filter surplus food nearest to your live location"
                        >
                            {locatingUser ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-600" />
                            ) : (
                                <Navigation className={`w-3.5 h-3.5 ${hasUserLocation ? 'text-emerald-600 fill-current' : 'text-slate-500'}`} />
                            )}
                            <span className="hidden sm:inline">{hasUserLocation ? 'Located' : 'Near Me'}</span>
                        </button>
                    </div>

                    {/* Right Controls: Category Chips, Sort, View Toggle */}
                    <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end overflow-x-auto">
                        
                        {/* Sort Dropdown */}
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
                            <span className="hidden lg:inline text-slate-400">Sort:</span>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="bg-slate-100 hover:bg-slate-200/80 border border-slate-200 text-slate-800 text-xs font-bold rounded-xl px-2.5 py-2 outline-none cursor-pointer"
                            >
                                <option value="urgent">⚡ Expiring Soonest</option>
                                <option value="nearest">📍 Nearest Distance</option>
                                <option value="recent">✨ Recently Added</option>
                                <option value="quantity">📦 Most Portions</option>
                            </select>
                        </div>

                        {/* Radius Filter */}
                        <select
                            value={maxDistanceKm}
                            onChange={(e) => setMaxDistanceKm(e.target.value)}
                            className="bg-slate-100 hover:bg-slate-200/80 border border-slate-200 text-slate-800 text-xs font-bold rounded-xl px-2.5 py-2 outline-none cursor-pointer"
                        >
                            <option value="all">🌐 Any Distance</option>
                            <option value="3">Within 3 km</option>
                            <option value="5">Within 5 km</option>
                            <option value="10">Within 10 km</option>
                            <option value="25">Within 25 km</option>
                        </select>

                        {/* View Switcher Buttons */}
                        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200/80 shrink-0">
                            <button
                                onClick={() => setViewMode('split')}
                                className={`p-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === 'split' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
                                title="Split Map & List"
                            >
                                <Columns className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === 'grid' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
                                title="Card Grid Only"
                            >
                                <Grid className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setViewMode('map')}
                                className={`p-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === 'map' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
                                title="Map Explorer Only"
                            >
                                <MapIcon className="w-4 h-4" />
                            </button>
                        </div>

                    </div>

                </div>

                {/* Subcategory & Dietary Pills Bar */}
                <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 pt-3 overflow-x-auto hide-scrollbar">
                    <div className="flex items-center gap-1.5 shrink-0">
                        {CATEGORIES.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                                    selectedCategory === cat 
                                        ? 'bg-brand-600 text-white shadow-sm shadow-brand-500/20' 
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
                                }`}
                            >
                                {cat === 'All' ? '🌟 All Items' : cat}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 pl-3 border-l border-slate-200">
                        {DIETARY_TAGS.slice(0, 4).map(tag => {
                            const isSelected = selectedDietary.includes(tag);
                            return (
                                <button
                                    key={tag}
                                    onClick={() => toggleDietaryTag(tag)}
                                    className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all border whitespace-nowrap ${
                                        isSelected 
                                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300 ring-1 ring-emerald-400' 
                                            : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                                    }`}
                                >
                                    {isSelected && '✓ '} {tag}
                                </button>
                            );
                        })}

                        {(selectedDietary.length > 0 || selectedCategory !== 'All' || searchTerm || maxDistanceKm !== 'all') && (
                            <button
                                onClick={resetFilters}
                                className="px-2.5 py-1 text-[11px] font-bold text-rose-600 hover:bg-rose-50 rounded-full transition-colors flex items-center gap-1"
                            >
                                <RotateCcw className="w-3 h-3" />
                                <span>Reset</span>
                            </button>
                        )}
                    </div>
                </div>
            </header>

            {/* MAIN CONTENT AREA */}
            <div className="flex-1 overflow-hidden flex flex-col md:flex-row relative">
                
                {/* LIST / GRID PANEL */}
                {(viewMode === 'split' || viewMode === 'grid') && (
                    <div className={`h-full flex flex-col bg-slate-50 overflow-y-auto ${
                        viewMode === 'grid' ? 'w-full max-w-7xl mx-auto p-6' : 'w-full md:w-1/2 lg:w-5/12 border-r border-slate-200 p-4'
                    }`}>
                        
                        {/* Results Count Header */}
                        <div className="flex items-center justify-between mb-4 px-1">
                            <p className="text-xs font-bold text-slate-500">
                                Showing <strong className="text-slate-900">{processedListings.length}</strong> surplus items available
                            </p>
                            {hasUserLocation && (
                                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                                    Sorted by distance from your location
                                </span>
                            )}
                        </div>

                        {loading ? (
                            <div className="flex flex-col items-center justify-center h-64">
                                <Loader2 className="w-8 h-8 animate-spin text-brand-600 mb-2" />
                                <p className="text-xs font-semibold text-slate-500">Searching fresh surplus food...</p>
                            </div>
                        ) : processedListings.length === 0 ? (
                            <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-300 p-8 my-auto">
                                <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                <h3 className="text-lg font-bold text-slate-800 mb-1">No surplus food matching your filter</h3>
                                <p className="text-xs text-slate-500 font-medium mb-4">
                                    Try expanding your distance radius or clearing your dietary tags.
                                </p>
                                <button
                                    onClick={resetFilters}
                                    className="bg-brand-600 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-md transition-all"
                                >
                                    Reset All Filters
                                </button>
                            </div>
                        ) : (
                            <div className={`space-y-4 ${viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 space-y-0' : ''}`}>
                                {processedListings.map(food => (
                                    <FoodCard 
                                        key={food._id} 
                                        food={food} 
                                        compact={viewMode === 'grid'} 
                                        onReserved={fetchListings}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* MAP PANEL */}
                {(viewMode === 'split' || viewMode === 'map') && (
                    <div className={`h-full bg-slate-200 relative ${
                        viewMode === 'map' ? 'w-full' : 'hidden md:block w-full md:w-1/2 lg:w-7/12'
                    }`}>
                        <MapContainer
                            center={userCoords}
                            zoom={13}
                            style={{ height: '100%', width: '100%' }}
                            scrollWheelZoom={true}
                        >
                            <TileLayer
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                            />

                            <MapAutoCenter center={userCoords} />

                            {/* User Location Marker */}
                            {hasUserLocation && (
                                <>
                                    <Marker position={userCoords} icon={createUserIcon()}>
                                        <Popup className="rounded-2xl">
                                            <div className="p-3 text-center">
                                                <p className="font-bold text-xs text-slate-900">📍 You are here</p>
                                                <p className="text-[10px] text-slate-500">Searching surplus around you</p>
                                            </div>
                                        </Popup>
                                    </Marker>
                                    {maxDistanceKm !== 'all' && (
                                        <Circle 
                                            center={userCoords} 
                                            radius={Number(maxDistanceKm) * 1000} 
                                            pathOptions={{ color: '#10b981', fillColor: '#10b981', fillOpacity: 0.08 }} 
                                        />
                                    )}
                                </>
                            )}

                            {/* Food Listing Markers */}
                            {processedListings.map(food => {
                                if (!food.coordinates?.lat || !food.coordinates?.lng) return null;
                                const isUrgent = food.diffHrs < 1.5;

                                return (
                                    <Marker
                                        key={food._id}
                                        position={[food.coordinates.lat, food.coordinates.lng]}
                                        icon={isUrgent ? createUrgentIcon() : createFreshIcon()}
                                    >
                                        <Popup>
                                            <div className="min-w-[240px] p-0 overflow-hidden rounded-2xl">
                                                <div className="h-28 w-full bg-slate-100 relative">
                                                    <img
                                                        src={food.image || "https://images.unsplash.com/photo-1490645943961-4a51e5f31070?w=300&q=80"}
                                                        alt={food.foodName}
                                                        className="w-full h-full object-cover"
                                                    />
                                                    <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-md px-2 py-0.5 rounded-full text-[10px] font-black text-slate-900 shadow">
                                                        {food.availableQuantity} {food.unit}
                                                    </div>
                                                </div>

                                                <div className="p-3.5">
                                                    <h4 className="font-bold text-sm text-slate-900 truncate mb-1" title={food.foodName}>
                                                        {food.foodName}
                                                    </h4>
                                                    <p className="text-xs text-slate-500 font-medium truncate mb-2">
                                                        {food.location}
                                                    </p>

                                                    <div className="flex items-center justify-between text-[11px] font-bold mb-3">
                                                        <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                                                            {food.foodType}
                                                        </span>
                                                        <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
                                                            Expires in {Math.round(food.diffHrs)}h
                                                        </span>
                                                    </div>

                                                    <Link
                                                        to={`/listing/${food._id}`}
                                                        className="block text-center w-full py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
                                                    >
                                                        View Details & Reserve →
                                                    </Link>
                                                </div>
                                            </div>
                                        </Popup>
                                    </Marker>
                                );
                            })}
                        </MapContainer>

                        {/* Floating View Map Indicator */}
                        <div className="absolute top-4 right-4 z-[400] bg-white/90 backdrop-blur-md px-3.5 py-1.5 rounded-2xl shadow-lg border border-slate-200/80 text-xs font-bold text-slate-800 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            <span>{processedListings.length} Food Pins Placed</span>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default FindFood;

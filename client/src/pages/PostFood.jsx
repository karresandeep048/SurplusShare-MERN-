import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { 
    Upload, 
    Image as ImageIcon, 
    MapPin, 
    Navigation, 
    Clock, 
    Calendar, 
    CheckCircle2, 
    AlertCircle, 
    Loader2, 
    X, 
    Sparkles, 
    ArrowLeft,
    Tag
} from 'lucide-react';

import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Component to handle map clicks for placing marker
function MapClickHandler({ onLocationSelect }) {
    useMapEvents({
        click(e) {
            onLocationSelect(e.latlng.lat, e.latlng.lng);
        },
    });
    return null;
}

// Component to automatically fly/re-center map when coordinates change
function MapRecenter({ center }) {
    const map = useMap();
    useEffect(() => {
        if (center && center[0] && center[1]) {
            map.flyTo(center, Math.max(map.getZoom(), 14), { duration: 1.2 });
        }
    }, [center, map]);
    return null;
}

// Preset food images for quick selection
const PRESET_IMAGES = [
    { label: 'Cooked Meals / Biryani', url: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800&auto=format&fit=crop&q=80' },
    { label: 'Fresh Bakery & Bread', url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&auto=format&fit=crop&q=80' },
    { label: 'Fruits & Vegetables', url: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=800&auto=format&fit=crop&q=80' },
    { label: 'Curry & Rice Thali', url: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&auto=format&fit=crop&q=80' },
    { label: 'Snacks & Pastries', url: 'https://images.unsplash.com/photo-1607958996333-41aef7caefaa?w=800&auto=format&fit=crop&q=80' },
    { label: 'Salads & Wraps', url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&auto=format&fit=crop&q=80' }
];

const DIETARY_OPTIONS = ['Vegetarian', 'Vegan', 'Halal', 'Gluten-Free', 'Dairy-Free', 'Nut-Free', 'Organic', 'No Onion/Garlic'];

function PostFood() {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    // Initial default times (Start: now, End: +3 hours, Expiry: +6 hours)
    const now = new Date();
    const formatDateTimeLocal = (date) => {
        const pad = (n) => String(n).padStart(2, '0');
        const year = date.getFullYear();
        const month = pad(date.getMonth() + 1);
        const day = pad(date.getDate());
        const hours = pad(date.getHours());
        const minutes = pad(date.getMinutes());
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    const defaultStart = formatDateTimeLocal(now);
    const defaultEnd = formatDateTimeLocal(new Date(now.getTime() + 3 * 60 * 60 * 1000));
    const defaultExpiry = formatDateTimeLocal(new Date(now.getTime() + 6 * 60 * 60 * 1000));

    const [formData, setFormData] = useState({
        foodName: '',
        description: '',
        quantity: 5,
        unit: 'meals',
        foodType: 'Vegetarian',
        pickupStart: defaultStart,
        pickupEnd: defaultEnd,
        expiryTime: defaultExpiry,
        location: '',
        image: ''
    });

    const [dietaryInfo, setDietaryInfo] = useState([]);
    const [coordinates, setCoordinates] = useState({ lat: 12.9716, lng: 77.5946 }); // Default Bengaluru Center
    const [hasPickedCoords, setHasPickedCoords] = useState(false);
    const [imageTab, setImageTab] = useState('upload'); // 'upload' | 'url' | 'presets'
    const [imagePreview, setImagePreview] = useState('');
    const [isLocating, setIsLocating] = useState(false);
    const [isGeocoding, setIsGeocoding] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    // Compress & Convert File to Base64
    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            setError('Please select a valid image file (JPG, PNG, WebP).');
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 1000;
                const MAX_HEIGHT = 1000;
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }
                } else {
                    if (height > MAX_HEIGHT) {
                        width *= MAX_HEIGHT / height;
                        height = MAX_HEIGHT;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
                setImagePreview(dataUrl);
                setFormData(prev => ({ ...prev, image: dataUrl }));
                setError(null);
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    };

    // Reverse Geocode (Lat/Lng -> Friendly Address String)
    const reverseGeocode = async (lat, lng) => {
        setIsGeocoding(true);
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
            const data = await response.json();
            if (data && data.display_name) {
                // Construct a clean, readable address
                const addr = data.address || {};
                const parts = [
                    addr.amenity || addr.building || addr.road || addr.suburb || addr.neighbourhood,
                    addr.city || addr.town || addr.county || addr.state_district,
                    addr.state,
                    addr.postcode
                ].filter(Boolean);

                const cleanAddress = parts.length > 0 ? parts.join(', ') : data.display_name;
                setFormData(prev => ({ ...prev, location: cleanAddress }));
            }
        } catch (err) {
            console.error('Reverse geocode error:', err);
        } finally {
            setIsGeocoding(false);
        }
    };

    // Forward Geocode (Address String -> Lat/Lng)
    const forwardGeocode = async (addressQuery) => {
        if (!addressQuery || addressQuery.trim().length < 3) return;
        setIsGeocoding(true);
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(addressQuery)}&limit=1`);
            const data = await response.json();
            if (data && data.length > 0) {
                const lat = parseFloat(data[0].lat);
                const lng = parseFloat(data[0].lon);
                setCoordinates({ lat, lng });
                setHasPickedCoords(true);
            }
        } catch (err) {
            console.error('Forward geocode error:', err);
        } finally {
            setIsGeocoding(false);
        }
    };

    // "Use My Current Location" button handler
    const handleUseCurrentLocation = () => {
        if (!navigator.geolocation) {
            setError('Geolocation is not supported by your browser.');
            return;
        }

        setIsLocating(true);
        setError(null);

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                setCoordinates({ lat, lng });
                setHasPickedCoords(true);
                await reverseGeocode(lat, lng);
                setIsLocating(false);
            },
            (err) => {
                setIsLocating(false);
                let message = 'Unable to fetch your location.';
                if (err.code === 1) message = 'Location permission was denied. Please allow location access in your browser or click directly on the map.';
                else if (err.code === 2) message = 'Location position unavailable. Please click on the map to set location.';
                else if (err.code === 3) message = 'Location request timed out. Please try again.';
                setError(message);
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    };

    // User clicks on map to set position
    const handleMapClick = (lat, lng) => {
        setCoordinates({ lat, lng });
        setHasPickedCoords(true);
        reverseGeocode(lat, lng);
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const toggleDietary = (item) => {
        if (dietaryInfo.includes(item)) {
            setDietaryInfo(dietaryInfo.filter(d => d !== item));
        } else {
            setDietaryInfo([...dietaryInfo, item]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (!formData.location || formData.location.trim() === '') {
            setError('Please provide a pickup location address or click "Use Current Location".');
            return;
        }

        if (!hasPickedCoords) {
            // Attempt forward geocode if coordinates weren't explicitly set yet
            await forwardGeocode(formData.location);
        }

        setSubmitting(true);
        try {
            const payload = {
                ...formData,
                dietaryInformation: dietaryInfo,
                coordinates: {
                    lat: coordinates.lat,
                    lng: coordinates.lng
                },
                image: formData.image || imagePreview || PRESET_IMAGES[0].url
            };

            await axios.post('/api/listings', payload);
            setSuccess(true);
            setTimeout(() => {
                navigate('/my-listings');
            }, 1500);
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Failed to post food listing.');
            setSubmitting(false);
        }
    };

    if (success) {
        return (
            <div className="max-w-2xl mx-auto my-12 bg-white p-10 rounded-3xl shadow-xl border border-brand-100 text-center animate-fade-in">
                <div className="w-20 h-20 bg-brand-100 text-brand-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="w-10 h-10" />
                </div>
                <h2 className="text-3xl font-black text-gray-900 mb-3">Surplus Food Posted! 🎉</h2>
                <p className="text-gray-600 text-lg mb-6">
                    Your food listing is now live with exact location & image. Receivers in your area can now discover and reserve it.
                </p>
                <div className="flex justify-center gap-4">
                    <button onClick={() => navigate('/my-listings')} className="bg-brand-600 hover:bg-brand-700 text-white font-bold px-6 py-3 rounded-xl transition-all shadow-md">
                        View in My Listings
                    </button>
                    <button onClick={() => navigate('/find-food')} className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold px-6 py-3 rounded-xl transition-all">
                        View on Map
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto pb-16 pt-2">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <Link to="/dashboard" className="inline-flex items-center text-sm font-semibold text-gray-500 hover:text-brand-600 transition-colors mb-2">
                        <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Dashboard
                    </Link>
                    <h1 className="text-3xl font-black text-gray-900">Share Surplus Food</h1>
                    <p className="text-gray-500 font-medium">Add details, food image, and pickup location so receivers can locate and claim it.</p>
                </div>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                    <div className="text-sm font-medium">{error}</div>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
                
                {/* 1. Food Details Card */}
                <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900 mb-5 flex items-center">
                        <span className="w-8 h-8 rounded-xl bg-brand-50 text-brand-600 font-black flex items-center justify-center mr-3 text-sm">1</span>
                        Food Information
                    </h2>

                    <div className="space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5">
                                    Food Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="foodName"
                                    required
                                    placeholder="e.g. Vegetable Biryani, Fresh Croissants..."
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none font-medium transition-all"
                                    value={formData.foodName}
                                    onChange={handleChange}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5">
                                    Food Type <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="foodType"
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none font-medium transition-all"
                                    value={formData.foodType}
                                    onChange={handleChange}
                                >
                                    <option value="Vegetarian">🌱 Vegetarian</option>
                                    <option value="Vegan">🌿 Vegan</option>
                                    <option value="Non-Vegetarian">🍗 Non-Vegetarian</option>
                                    <option value="Other">🍽️ Other</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1.5">
                                Description & Condition <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                name="description"
                                required
                                rows="3"
                                placeholder="Describe the item (e.g. Leftover fresh buffet food, packed in clean meal boxes, prepared 1 hour ago...)"
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none font-medium transition-all"
                                value={formData.description}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5">
                                    Quantity Available <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    name="quantity"
                                    required
                                    min="1"
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none font-medium transition-all"
                                    value={formData.quantity}
                                    onChange={handleChange}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5">
                                    Unit of Measure <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="unit"
                                    required
                                    placeholder="e.g. meals, portions, boxes, kg, items"
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none font-medium transition-all"
                                    value={formData.unit}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        {/* Dietary tags */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                Dietary Tags & Attributes
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {DIETARY_OPTIONS.map((tag) => {
                                    const isSelected = dietaryInfo.includes(tag);
                                    return (
                                        <button
                                            type="button"
                                            key={tag}
                                            onClick={() => toggleDietary(tag)}
                                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                                                isSelected 
                                                    ? 'bg-brand-600 text-white border-brand-600 shadow-sm' 
                                                    : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                                            }`}
                                        >
                                            {isSelected && '✓ '} {tag}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. Food Image Section */}
                <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-5 gap-3">
                        <h2 className="text-xl font-bold text-gray-900 flex items-center">
                            <span className="w-8 h-8 rounded-xl bg-brand-50 text-brand-600 font-black flex items-center justify-center mr-3 text-sm">2</span>
                            Food Photo
                        </h2>
                        
                        {/* Tab Switcher for Image selection */}
                        <div className="flex bg-gray-100 p-1 rounded-xl">
                            <button
                                type="button"
                                onClick={() => setImageTab('upload')}
                                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${imageTab === 'upload' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                            >
                                📸 Upload Photo
                            </button>
                            <button
                                type="button"
                                onClick={() => setImageTab('presets')}
                                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${imageTab === 'presets' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                            >
                                🌟 Curated Presets
                            </button>
                            <button
                                type="button"
                                onClick={() => setImageTab('url')}
                                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${imageTab === 'url' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                            >
                                🔗 Image URL
                            </button>
                        </div>
                    </div>

                    {/* Image Preview & Upload options */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                        
                        {/* Left: Interactive Input based on tab */}
                        <div className="md:col-span-7">
                            {imageTab === 'upload' && (
                                <div 
                                    onClick={() => fileInputRef.current?.click()}
                                    className="border-2 border-dashed border-gray-200 hover:border-brand-500 hover:bg-brand-50/20 rounded-2xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center group"
                                >
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleFileUpload}
                                    />
                                    <div className="w-14 h-14 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                        <Upload className="w-7 h-7" />
                                    </div>
                                    <p className="text-sm font-bold text-gray-900 mb-1">Click or drag & drop food image</p>
                                    <p className="text-xs text-gray-400 font-medium">PNG, JPG, WEBP up to 10MB</p>
                                </div>
                            )}

                            {imageTab === 'presets' && (
                                <div className="space-y-2">
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Pick a category photo:</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {PRESET_IMAGES.map((preset, idx) => (
                                            <button
                                                type="button"
                                                key={idx}
                                                onClick={() => {
                                                    setImagePreview(preset.url);
                                                    setFormData(prev => ({ ...prev, image: preset.url }));
                                                }}
                                                className={`p-2 rounded-xl text-left border text-xs font-bold flex items-center gap-2 transition-all ${
                                                    (formData.image === preset.url || imagePreview === preset.url) 
                                                        ? 'border-brand-500 bg-brand-50 text-brand-700 ring-2 ring-brand-500/20' 
                                                        : 'border-gray-200 bg-gray-50 hover:bg-white text-gray-700'
                                                }`}
                                            >
                                                <img src={preset.url} alt="" className="w-8 h-8 rounded-lg object-cover" />
                                                <span className="truncate">{preset.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {imageTab === 'url' && (
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Online Image URL</label>
                                    <input
                                        type="url"
                                        placeholder="https://images.unsplash.com/..."
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-brand-500 outline-none font-medium transition-all"
                                        value={formData.image}
                                        onChange={(e) => {
                                            setFormData(prev => ({ ...prev, image: e.target.value }));
                                            setImagePreview(e.target.value);
                                        }}
                                    />
                                </div>
                            )}
                        </div>

                        {/* Right: Live Image Preview */}
                        <div className="md:col-span-5 flex flex-col items-center">
                            <div className="w-full h-44 rounded-2xl bg-gray-100 border border-gray-200 overflow-hidden relative flex items-center justify-center shadow-inner">
                                {imagePreview || formData.image ? (
                                    <>
                                        <img 
                                            src={imagePreview || formData.image} 
                                            alt="Preview" 
                                            className="w-full h-full object-cover" 
                                            onError={(e) => { e.currentTarget.src = PRESET_IMAGES[0].url; }}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setImagePreview('');
                                                setFormData(prev => ({ ...prev, image: '' }));
                                                if (fileInputRef.current) fileInputRef.current.value = '';
                                            }}
                                            className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-full transition-colors backdrop-blur-sm"
                                            title="Remove Image"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </>
                                ) : (
                                    <div className="text-center p-4 text-gray-400">
                                        <ImageIcon className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                                        <span className="text-xs font-medium">No image chosen</span>
                                    </div>
                                )}
                            </div>
                            <span className="text-xs text-gray-400 font-semibold mt-2">
                                Receivers will see this photo on map & listings
                            </span>
                        </div>

                    </div>
                </div>

                {/* 3. Exact Pickup Location & Interactive Map */}
                <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 flex items-center">
                                <span className="w-8 h-8 rounded-xl bg-brand-50 text-brand-600 font-black flex items-center justify-center mr-3 text-sm">3</span>
                                Exact Pickup Location
                            </h2>
                            <p className="text-xs text-gray-500 font-medium ml-11">Click on map or use your current location to place the exact pickup pin.</p>
                        </div>

                        {/* Use My Current Location button */}
                        <button
                            type="button"
                            onClick={handleUseCurrentLocation}
                            disabled={isLocating}
                            className="inline-flex items-center justify-center px-4 py-2.5 bg-brand-50 hover:bg-brand-100 text-brand-700 border border-brand-200 rounded-xl text-sm font-bold shadow-sm transition-all shrink-0 disabled:opacity-50"
                        >
                            {isLocating ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin text-brand-600" />
                                    Locating You...
                                </>
                            ) : (
                                <>
                                    <Navigation className="w-4 h-4 mr-2 text-brand-600" />
                                    Use My Current Location
                                </>
                            )}
                        </button>
                    </div>

                    {/* Address Text input with Geocode lookup */}
                    <div className="mb-4">
                        <label className="block text-sm font-bold text-gray-700 mb-1.5">
                            Pickup Address / Venue Description <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                <MapPin className="w-5 h-5 text-brand-500" />
                            </div>
                            <input
                                type="text"
                                name="location"
                                required
                                placeholder="e.g. 100 Feet Rd, Indiranagar, Bengaluru or click on map below..."
                                className="w-full pl-11 pr-28 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none font-medium transition-all"
                                value={formData.location}
                                onChange={handleChange}
                                onBlur={() => {
                                    if (formData.location && !hasPickedCoords) {
                                        forwardGeocode(formData.location);
                                    }
                                }}
                            />
                            <button
                                type="button"
                                onClick={() => forwardGeocode(formData.location)}
                                className="absolute right-2 top-2 bottom-2 px-3 bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 text-xs font-bold rounded-lg transition-colors"
                            >
                                Find on Map
                            </button>
                        </div>
                    </div>

                    {/* Interactive Leaflet Map Picker */}
                    <div className="rounded-2xl overflow-hidden border border-gray-200 h-64 sm:h-80 relative shadow-inner">
                        <MapContainer
                            center={[coordinates.lat, coordinates.lng]}
                            zoom={13}
                            scrollWheelZoom={true}
                            style={{ height: '100%', width: '100%' }}
                        >
                            <TileLayer
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                            />
                            
                            {/* Click listener */}
                            <MapClickHandler onLocationSelect={handleMapClick} />
                            
                            {/* Dynamic Map Recenter */}
                            <MapRecenter center={[coordinates.lat, coordinates.lng]} />

                            {/* Position Marker */}
                            <Marker position={[coordinates.lat, coordinates.lng]} />
                        </MapContainer>

                        {/* Floating coordinate helper */}
                        <div className="absolute bottom-3 left-3 z-[400] bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl shadow border border-gray-200 text-xs font-bold text-gray-700 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                            <span>Pin: {coordinates.lat.toFixed(4)}, {coordinates.lng.toFixed(4)}</span>
                            {isGeocoding && <Loader2 className="w-3 h-3 animate-spin text-brand-600" />}
                        </div>

                        <div className="absolute top-3 right-3 z-[400] bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-xl text-white text-xs font-medium shadow">
                            👆 Click map to move pickup pin
                        </div>
                    </div>
                </div>

                {/* 4. Pickup & Expiry Schedule */}
                <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900 mb-5 flex items-center">
                        <span className="w-8 h-8 rounded-xl bg-brand-50 text-brand-600 font-black flex items-center justify-center mr-3 text-sm">4</span>
                        Pickup Schedule & Expiry
                    </h2>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1.5 flex items-center">
                                <Clock className="w-4 h-4 mr-1.5 text-brand-500" /> Pickup Start Time <span className="text-red-500 ml-1">*</span>
                            </label>
                            <input
                                type="datetime-local"
                                name="pickupStart"
                                required
                                className="w-full px-3.5 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-brand-500 outline-none font-medium text-sm transition-all"
                                value={formData.pickupStart}
                                onChange={handleChange}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1.5 flex items-center">
                                <Clock className="w-4 h-4 mr-1.5 text-brand-500" /> Pickup End Time <span className="text-red-500 ml-1">*</span>
                            </label>
                            <input
                                type="datetime-local"
                                name="pickupEnd"
                                required
                                className="w-full px-3.5 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-brand-500 outline-none font-medium text-sm transition-all"
                                value={formData.pickupEnd}
                                onChange={handleChange}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1.5 flex items-center">
                                <Calendar className="w-4 h-4 mr-1.5 text-red-500" /> Expiry Time <span className="text-red-500 ml-1">*</span>
                            </label>
                            <input
                                type="datetime-local"
                                name="expiryTime"
                                required
                                className="w-full px-3.5 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-brand-500 outline-none font-medium text-sm transition-all"
                                value={formData.expiryTime}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                </div>

                {/* Submit Button */}
                <div>
                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white p-4 rounded-2xl transition-all font-bold text-lg shadow-lg hover:shadow-brand-500/30 flex items-center justify-center"
                    >
                        {submitting ? (
                            <>
                                <Loader2 className="w-6 h-6 mr-2 animate-spin" />
                                Publishing Surplus Food...
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-5 h-5 mr-2" />
                                + Post Surplus Food Listing
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default PostFood;

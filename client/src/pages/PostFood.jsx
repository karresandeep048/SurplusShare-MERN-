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
    Tag,
    Package,
    Wand2
} from 'lucide-react';

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

function MapClickHandler({ onLocationSelect }) {
    useMapEvents({
        click(e) {
            onLocationSelect(e.latlng.lat, e.latlng.lng);
        },
    });
    return null;
}

function MapRecenter({ center }) {
    const map = useMap();
    useEffect(() => {
        if (center && center[0] && center[1]) {
            map.flyTo(center, Math.max(map.getZoom(), 14), { duration: 1 });
        }
    }, [center, map]);
    return null;
}

const PRESET_IMAGES = [
    { label: 'Biryani & Rice', url: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800&auto=format&fit=crop&q=80' },
    { label: 'Bakery & Bread', url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&auto=format&fit=crop&q=80' },
    { label: 'Fruits & Veggies', url: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=800&auto=format&fit=crop&q=80' },
    { label: 'Curry & Thali', url: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&auto=format&fit=crop&q=80' },
    { label: 'Muffins & Pastry', url: 'https://images.unsplash.com/photo-1607958996333-41aef7caefaa?w=800&auto=format&fit=crop&q=80' },
    { label: 'Salads & Bowls', url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&auto=format&fit=crop&q=80' }
];

const QUICK_PRESETS = [
    {
        title: '🍛 Vegetable Biryani',
        foodName: 'Vegetable Biryani Buffet Surplus',
        foodType: 'Vegetarian',
        description: 'Fresh surplus cooked lunch buffet. Packed in clean food-grade containers with raita.',
        quantity: 15,
        unit: 'meals',
        dietaryInformation: ['No Dairy'],
        image: PRESET_IMAGES[0].url,
        pickupHours: 3,
        expiryHours: 4
    },
    {
        title: '🥐 Artisan Bakery Box',
        foodName: 'Assorted Fresh Croissants & Breads',
        foodType: 'Vegetarian',
        description: 'Morning bake surplus: sourdough loaves, croissants, and baguettes. Baked today.',
        quantity: 12,
        unit: 'items',
        dietaryInformation: ['Contains Gluten'],
        image: PRESET_IMAGES[1].url,
        pickupHours: 4,
        expiryHours: 24
    },
    {
        title: '🥗 Fresh Fruit & Produce',
        foodName: 'Mixed Seasonal Fruit Baskets',
        foodType: 'Vegan',
        description: 'Fresh apples, bananas, and oranges. Perfectly ripe and clean for consumption.',
        quantity: 8,
        unit: 'kg',
        dietaryInformation: ['Organic'],
        image: PRESET_IMAGES[2].url,
        pickupHours: 6,
        expiryHours: 48
    },
    {
        title: '🍲 Dal Tadka & Rice Thali',
        foodName: 'Dal Tadka & Steamed Jeera Rice',
        foodType: 'Vegetarian',
        description: 'Comforting home-style thali packaging. Prepared 1 hour ago, hot and fresh.',
        quantity: 20,
        unit: 'meals',
        dietaryInformation: ['Gluten-Free'],
        image: PRESET_IMAGES[3].url,
        pickupHours: 3,
        expiryHours: 5
    }
];

const DIETARY_OPTIONS = ['Vegetarian', 'Vegan', 'Halal', 'Gluten-Free', 'Dairy-Free', 'Nut-Free', 'Organic', 'No Onion/Garlic'];

function PostFood() {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    const now = new Date();
    const formatDateTimeLocal = (date) => {
        const pad = (n) => String(n).padStart(2, '0');
        return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
    };

    const defaultStart = formatDateTimeLocal(now);
    const defaultEnd = formatDateTimeLocal(new Date(now.getTime() + 3 * 3600000));
    const defaultExpiry = formatDateTimeLocal(new Date(now.getTime() + 5 * 3600000));

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
    const [coordinates, setCoordinates] = useState({ lat: 12.9716, lng: 77.5946 });
    const [hasPickedCoords, setHasPickedCoords] = useState(false);
    const [imageTab, setImageTab] = useState('upload');
    const [imagePreview, setImagePreview] = useState('');
    const [isLocating, setIsLocating] = useState(false);
    const [isGeocoding, setIsGeocoding] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    // Apply Smart Preset
    const handleApplyPreset = (preset) => {
        const pStart = new Date();
        const pEnd = new Date(pStart.getTime() + preset.pickupHours * 3600000);
        const pExp = new Date(pStart.getTime() + preset.expiryHours * 3600000);

        setFormData(prev => ({
            ...prev,
            foodName: preset.foodName,
            foodType: preset.foodType,
            description: preset.description,
            quantity: preset.quantity,
            unit: preset.unit,
            image: preset.image,
            pickupStart: formatDateTimeLocal(pStart),
            pickupEnd: formatDateTimeLocal(pEnd),
            expiryTime: formatDateTimeLocal(pExp)
        }));
        setImagePreview(preset.image);
        setDietaryInfo(preset.dietaryInformation || []);
    };

    // Compress & Convert File to Base64
    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            setError('Please select a valid image file.');
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_DIM = 900;
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > MAX_DIM) {
                        height *= MAX_DIM / width;
                        width = MAX_DIM;
                    }
                } else {
                    if (height > MAX_DIM) {
                        width *= MAX_DIM / height;
                        height = MAX_DIM;
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

    // Reverse Geocode
    const reverseGeocode = async (lat, lng) => {
        setIsGeocoding(true);
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
            const data = await res.json();
            if (data && data.display_name) {
                const addr = data.address || {};
                const parts = [
                    addr.amenity || addr.building || addr.road || addr.suburb || addr.neighbourhood,
                    addr.city || addr.town || addr.county,
                    addr.state,
                    addr.postcode
                ].filter(Boolean);
                const clean = parts.length > 0 ? parts.join(', ') : data.display_name;
                setFormData(prev => ({ ...prev, location: clean }));
            }
        } catch (err) {
            console.error('Reverse geocode error:', err);
        } finally {
            setIsGeocoding(false);
        }
    };

    // Forward Geocode
    const forwardGeocode = async (query) => {
        if (!query || query.trim().length < 3) return;
        setIsGeocoding(true);
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`);
            const data = await res.json();
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

    const handleUseCurrentLocation = () => {
        if (!navigator.geolocation) {
            setError('Geolocation is not supported by your browser.');
            return;
        }

        setIsLocating(true);
        setError(null);

        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                const lat = pos.coords.latitude;
                const lng = pos.coords.longitude;
                setCoordinates({ lat, lng });
                setHasPickedCoords(true);
                await reverseGeocode(lat, lng);
                setIsLocating(false);
            },
            (err) => {
                setIsLocating(false);
                setError('Location access was denied or unavailable. Please click directly on the map.');
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    };

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
            setError('Please provide a pickup address or click on the map to set location.');
            return;
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
            setError(err.response?.data?.message || err.message || 'Failed to publish food listing.');
            setSubmitting(false);
        }
    };

    if (success) {
        return (
            <div className="max-w-2xl mx-auto my-16 bg-white p-10 rounded-3xl shadow-xl border border-brand-100 text-center animate-fade-in">
                <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="w-10 h-10" />
                </div>
                <h2 className="text-3xl font-black text-slate-900 mb-3">Surplus Food Published! 🎉</h2>
                <p className="text-slate-600 text-base mb-8">
                    Your surplus food is now live on the interactive map and ready for nearby receivers to discover and reserve.
                </p>
                <div className="flex justify-center gap-4">
                    <button 
                        onClick={() => navigate('/my-listings')} 
                        className="bg-brand-600 hover:bg-brand-700 text-white font-bold px-6 py-3.5 rounded-xl transition-all shadow-md"
                    >
                        View in My Listings
                    </button>
                    <button 
                        onClick={() => navigate('/find-food')} 
                        className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold px-6 py-3.5 rounded-xl transition-all"
                    >
                        View on Map
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto pb-20 pt-2">
            
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <Link to="/dashboard" className="inline-flex items-center text-xs font-bold text-slate-500 hover:text-brand-600 transition-colors mb-2">
                        <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back to Dashboard
                    </Link>
                    <h1 className="text-3xl font-black text-slate-900">Share Surplus Food</h1>
                    <p className="text-slate-500 text-sm font-medium">
                        Post extra food to prevent waste and feed your local community.
                    </p>
                </div>
            </div>

            {/* Smart 1-Click Presets Ribbon */}
            <div className="bg-gradient-to-r from-brand-600 to-emerald-700 text-white p-5 rounded-3xl shadow-md mb-8">
                <div className="flex items-center gap-2 mb-3">
                    <Wand2 className="w-4 h-4 text-emerald-300" />
                    <h3 className="text-sm font-black uppercase tracking-wider">Quick Fill with AI Smart Presets:</h3>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {QUICK_PRESETS.map((preset, idx) => (
                        <button
                            type="button"
                            key={idx}
                            onClick={() => handleApplyPreset(preset)}
                            className="bg-white/10 hover:bg-white/25 backdrop-blur-md p-2.5 rounded-2xl text-left border border-white/15 transition-all text-xs font-bold text-white flex items-center gap-2 hover:scale-[1.02]"
                        >
                            <span>{preset.title}</span>
                        </button>
                    ))}
                </div>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl flex items-start gap-3 text-sm font-medium">
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                    <div>{error}</div>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
                
                {/* 1. Item Details */}
                <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-100">
                    <h2 className="text-xl font-bold text-slate-900 mb-5 flex items-center gap-3">
                        <span className="w-8 h-8 rounded-xl bg-brand-50 text-brand-600 font-black flex items-center justify-center text-sm">1</span>
                        Food Information
                    </h2>

                    <div className="space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Food Title <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="foodName"
                                    required
                                    placeholder="e.g. Vegetable Biryani, Croissant Baskets..."
                                    className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-brand-500 outline-none font-medium text-sm transition-all"
                                    value={formData.foodName}
                                    onChange={handleChange}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Food Type <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="foodType"
                                    className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-brand-500 outline-none font-bold text-sm transition-all"
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
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                Description & Condition <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                name="description"
                                required
                                rows="3"
                                placeholder="Describe the item (e.g. Freshly cooked surplus from evening catering, packed in clean boxes...)"
                                className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-brand-500 outline-none font-medium text-sm transition-all"
                                value={formData.description}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Quantity Available <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    name="quantity"
                                    required
                                    min="1"
                                    className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-brand-500 outline-none font-bold text-sm transition-all"
                                    value={formData.quantity}
                                    onChange={handleChange}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Unit of Measure <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="unit"
                                    required
                                    placeholder="e.g. meals, portions, boxes, kg, items"
                                    className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-brand-500 outline-none font-medium text-sm transition-all"
                                    value={formData.unit}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        {/* Dietary Tags */}
                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                                Dietary & Allergen Tags
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {DIETARY_OPTIONS.map(tag => {
                                    const isSelected = dietaryInfo.includes(tag);
                                    return (
                                        <button
                                            type="button"
                                            key={tag}
                                            onClick={() => toggleDietary(tag)}
                                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                                                isSelected 
                                                    ? 'bg-brand-600 text-white border-brand-600 shadow-sm' 
                                                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
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

                {/* 2. Photo Selection */}
                <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-100">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-5 gap-3">
                        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-3">
                            <span className="w-8 h-8 rounded-xl bg-brand-50 text-brand-600 font-black flex items-center justify-center text-sm">2</span>
                            Food Photo
                        </h2>
                        
                        <div className="flex bg-slate-100 p-1 rounded-xl">
                            <button
                                type="button"
                                onClick={() => setImageTab('upload')}
                                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${imageTab === 'upload' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
                            >
                                📸 Upload Photo
                            </button>
                            <button
                                type="button"
                                onClick={() => setImageTab('presets')}
                                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${imageTab === 'presets' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
                            >
                                🌟 Curated Presets
                            </button>
                            <button
                                type="button"
                                onClick={() => setImageTab('url')}
                                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${imageTab === 'url' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
                            >
                                🔗 Image URL
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                        <div className="md:col-span-7">
                            {imageTab === 'upload' && (
                                <div 
                                    onClick={() => fileInputRef.current?.click()}
                                    className="border-2 border-dashed border-slate-200 hover:border-brand-500 hover:bg-brand-50/20 rounded-2xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center group"
                                >
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleFileUpload}
                                    />
                                    <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                                        <Upload className="w-6 h-6" />
                                    </div>
                                    <p className="text-sm font-bold text-slate-900">Click or drag & drop food photo</p>
                                    <p className="text-xs text-slate-400 font-medium mt-0.5">PNG, JPG, WEBP automatically optimized</p>
                                </div>
                            )}

                            {imageTab === 'presets' && (
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
                                                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-white'
                                            }`}
                                        >
                                            <img src={preset.url} alt="" className="w-8 h-8 rounded-lg object-cover" />
                                            <span className="truncate">{preset.label}</span>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {imageTab === 'url' && (
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Direct Image URL</label>
                                    <input
                                        type="url"
                                        placeholder="https://images.unsplash.com/..."
                                        className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-brand-500 outline-none text-sm font-medium"
                                        value={formData.image}
                                        onChange={(e) => {
                                            setFormData(prev => ({ ...prev, image: e.target.value }));
                                            setImagePreview(e.target.value);
                                        }}
                                    />
                                </div>
                            )}
                        </div>

                        {/* Live Image Preview */}
                        <div className="md:col-span-5 flex flex-col items-center">
                            <div className="w-full h-44 rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden relative flex items-center justify-center shadow-inner">
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
                                            className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-full transition-colors"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </>
                                ) : (
                                    <div className="text-center p-4 text-slate-400">
                                        <ImageIcon className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                                        <span className="text-xs font-medium">No photo selected</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. Pickup Location Pinpoint */}
                <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-100">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
                        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-3">
                            <span className="w-8 h-8 rounded-xl bg-brand-50 text-brand-600 font-black flex items-center justify-center text-sm">3</span>
                            Exact Pickup Venue & Map Pin
                        </h2>

                        <button
                            type="button"
                            onClick={handleUseCurrentLocation}
                            disabled={isLocating}
                            className="inline-flex items-center px-4 py-2 bg-brand-50 hover:bg-brand-100 text-brand-700 border border-brand-200 rounded-xl text-xs font-bold shadow-sm transition-all shrink-0"
                        >
                            {isLocating ? (
                                <>
                                    <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin text-brand-600" />
                                    Detecting Location...
                                </>
                            ) : (
                                <>
                                    <Navigation className="w-3.5 h-3.5 mr-1.5 text-brand-600" />
                                    Use Current GPS Location
                                </>
                            )}
                        </button>
                    </div>

                    <div className="mb-4">
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                            Pickup Address & Landmark <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                <MapPin className="w-4 h-4 text-brand-500" />
                            </div>
                            <input
                                type="text"
                                name="location"
                                required
                                placeholder="e.g. 100 Feet Rd, Indiranagar, Bengaluru or click on map..."
                                className="w-full pl-10 pr-28 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-brand-500 outline-none font-medium text-sm transition-all"
                                value={formData.location}
                                onChange={handleChange}
                                onBlur={() => {
                                    if (formData.location && !hasPickedCoords) forwardGeocode(formData.location);
                                }}
                            />
                            <button
                                type="button"
                                onClick={() => forwardGeocode(formData.location)}
                                className="absolute right-2 top-2 bottom-2 px-3 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold rounded-lg"
                            >
                                Find on Map
                            </button>
                        </div>
                    </div>

                    {/* Interactive Leaflet Map */}
                    <div className="rounded-2xl overflow-hidden border border-slate-200 h-64 sm:h-72 relative shadow-inner">
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
                            <MapClickHandler onLocationSelect={handleMapClick} />
                            <MapRecenter center={[coordinates.lat, coordinates.lng]} />
                            <Marker position={[coordinates.lat, coordinates.lng]} />
                        </MapContainer>

                        <div className="absolute bottom-3 left-3 z-[400] bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl shadow text-xs font-bold text-slate-800 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            <span>Pin: {coordinates.lat.toFixed(4)}, {coordinates.lng.toFixed(4)}</span>
                            {isGeocoding && <Loader2 className="w-3 h-3 animate-spin text-brand-600" />}
                        </div>

                        <div className="absolute top-3 right-3 z-[400] bg-black/70 backdrop-blur-md px-3 py-1 rounded-lg text-white text-[11px] font-medium">
                            👆 Click map to move pickup pin
                        </div>
                    </div>
                </div>

                {/* 4. Schedule & Expiry */}
                <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-100">
                    <h2 className="text-xl font-bold text-slate-900 mb-5 flex items-center gap-3">
                        <span className="w-8 h-8 rounded-xl bg-brand-50 text-brand-600 font-black flex items-center justify-center text-sm">4</span>
                        Pickup Schedule & Expiry
                    </h2>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5 flex items-center">
                                <Clock className="w-3.5 h-3.5 mr-1 text-brand-500" /> Pickup Start Time <span className="text-red-500 ml-1">*</span>
                            </label>
                            <input
                                type="datetime-local"
                                name="pickupStart"
                                required
                                className="w-full px-3.5 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-brand-500 outline-none text-xs font-bold"
                                value={formData.pickupStart}
                                onChange={handleChange}
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5 flex items-center">
                                <Clock className="w-3.5 h-3.5 mr-1 text-brand-500" /> Pickup End Time <span className="text-red-500 ml-1">*</span>
                            </label>
                            <input
                                type="datetime-local"
                                name="pickupEnd"
                                required
                                className="w-full px-3.5 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-brand-500 outline-none text-xs font-bold"
                                value={formData.pickupEnd}
                                onChange={handleChange}
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5 flex items-center">
                                <Calendar className="w-3.5 h-3.5 mr-1 text-rose-500" /> Expiry Time <span className="text-red-500 ml-1">*</span>
                            </label>
                            <input
                                type="datetime-local"
                                name="expiryTime"
                                required
                                className="w-full px-3.5 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-brand-500 outline-none text-xs font-bold"
                                value={formData.expiryTime}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                </div>

                {/* Submit Action */}
                <div>
                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white p-4 rounded-2xl transition-all font-black text-base shadow-lg shadow-brand-500/20 flex items-center justify-center gap-2"
                    >
                        {submitting ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <span>Publishing Surplus Food...</span>
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-5 h-5" />
                                <span>+ Publish Surplus Food to Live Map</span>
                            </>
                        )}
                    </button>
                </div>

            </form>
        </div>
    );
}

export default PostFood;

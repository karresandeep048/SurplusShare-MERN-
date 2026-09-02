import React, { useState, useEffect } from 'react';
import axios from 'axios';
import FoodCard from '../components/FoodCard';
import { Search, Loader2 } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

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

const FindFood = () => {
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('All');

    useEffect(() => {
        const fetchListings = async () => {
            try {
                const { data } = await axios.get('/api/listings');
                setListings(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchListings();
    }, []);

    const categories = ['All', 'Vegetarian', 'Vegan', 'Non-Vegetarian'];

    const filteredListings = listings.filter(food => {
        const matchesSearch = food.foodName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            food.location.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = filterCategory === 'All' || food.foodType === filterCategory;
        return matchesSearch && matchesCategory;
    });

    const bengaluruCenter = [12.9716, 77.5946];

    return (
        <div className="h-[calc(100vh-64px)] overflow-hidden flex flex-col md:flex-row">
            {/* Left Panel: List */}
            <div className="w-full md:w-1/2 lg:w-5/12 h-full flex flex-col bg-gray-50 border-r border-gray-200 shadow-sm z-10 relative">
                <div className="p-6 bg-white border-b border-gray-100 z-10 shrink-0">
                    <h1 className="text-3xl font-black text-gray-900 mb-2">Find Food</h1>
                    <p className="text-gray-500 text-sm mb-5 font-medium">Find available surplus food near you.</p>

                    <div className="relative mb-5">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search food, dietary info, or location..."
                            className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 sm:text-sm transition-all shadow-inner font-medium"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setFilterCategory(cat)}
                                className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-semibold transition-colors ${filterCategory === cat ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {loading ? (
                        <div className="flex justify-center items-center h-full">
                            <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
                        </div>
                    ) : filteredListings.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-500">
                            <Search className="w-12 h-12 text-gray-300 mb-3" />
                            <p className="font-semibold text-lg text-gray-900">No surplus food found</p>
                            <p className="text-sm">Try adjusting your filters or search term</p>
                        </div>
                    ) : (
                        filteredListings.map(food => (
                            <FoodCard key={food._id} food={food} compact={false} />
                        ))
                    )}
                </div>
            </div>

            {/* Right Panel: Map */}
            <div className="hidden md:block w-full md:w-1/2 lg:w-7/12 h-full bg-gray-200 relative z-0">
                <MapContainer center={bengaluruCenter} zoom={13} style={{ height: '100%', width: '100%' }}>
                   <TileLayer
    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
/>
                    {filteredListings.map(food => {
                        if (food.coordinates && food.coordinates.lat && food.coordinates.lng && food.status === 'AVAILABLE') {
                            return (
                                <Marker key={food._id} position={[food.coordinates.lat, food.coordinates.lng]}>
                                    <Popup className="rounded-xl overflow-hidden custom-popup p-0 border-0 shadow-lg">
                                        <div className="-m-3 min-w-[220px]">
                                            <div className="h-28 w-full bg-gray-200">
                                                <img 
                                                    src={food.image || "https://images.unsplash.com/photo-1490645943961-4a51e5f31070?w=200&q=80"} 
                                                    onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1490645943961-4a51e5f31070?w=200&q=80"; }}
                                                    alt={food.foodName} 
                                                    className="w-full h-full object-cover" 
                                                />
                                            </div>
                                            <div className="p-4">
                                                <h4 className="font-bold text-gray-900 leading-tight mb-1 truncate" title={food.foodName}>{food.foodName}</h4>
                                                <p className="text-xs text-brand-600 mb-3 font-bold bg-brand-50 inline-block px-2 py-0.5 rounded-full">{food.availableQuantity} {food.unit} available</p>
                                                <a href={`/listing/${food._id}`} className="block text-center bg-brand-600 text-white px-3 py-2 rounded-lg text-xs font-bold hover:bg-brand-700 transition-colors shadow-sm">View Details</a>
                                            </div>
                                        </div>
                                    </Popup>
                                </Marker>
                            );
                        }
                        return null;
                    })}
                </MapContainer>
            </div>
        </div>
    );
};

export default FindFood;

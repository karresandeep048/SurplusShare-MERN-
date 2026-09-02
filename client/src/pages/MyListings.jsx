import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    Package, 
    PlusSquare, 
    Clock, 
    Trash2, 
    Loader2, 
    AlertCircle, 
    CheckCircle2, 
    Calendar,
    MapPin 
} from 'lucide-react';
import { Link } from 'react-router-dom';

const DEFAULT_FOOD_IMAGE = 'https://images.unsplash.com/photo-1490645943961-4a51e5f31070?w=200&q=80';

const MyListings = () => {
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('All');
    const [deletingId, setDeletingId] = useState(null);
    const [msg, setMsg] = useState(null);

    const fetchListings = async () => {
        try {
            const { data } = await axios.get('/api/listings/my');
            setListings(data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchListings();
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to remove this listing?')) return;
        setDeletingId(id);
        try {
            await axios.delete(`/api/listings/${id}`);
            setMsg('Listing removed successfully.');
            setListings(prev => prev.filter(l => l._id !== id));
            setTimeout(() => setMsg(null), 4000);
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to delete listing');
        } finally {
            setDeletingId(null);
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'AVAILABLE': return 'bg-brand-100 text-brand-700';
            case 'PARTIALLY_RESERVED':
            case 'RESERVED': return 'bg-amber-100 text-amber-800';
            case 'COLLECTED': return 'bg-green-100 text-green-800';
            case 'EXPIRED': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-600';
        }
    };

    const filteredListings = listings.filter(item => {
        const isExpired = item.status === 'EXPIRED' || (new Date(item.expiryTime) < new Date() && item.status !== 'COLLECTED');
        if (activeTab === 'All') return true;
        if (activeTab === 'Expired') return isExpired;
        if (activeTab === 'Available') return item.status === 'AVAILABLE' && !isExpired;
        if (activeTab === 'Reserved') return (item.status === 'RESERVED' || item.status === 'PARTIALLY_RESERVED') && !isExpired;
        if (activeTab === 'Collected') return item.status === 'COLLECTED';
        return true;
    });

    return (
        <div className="max-w-6xl mx-auto pb-12">
            
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end mb-6 gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 mb-1">My Food Listings</h1>
                    <p className="text-gray-500 font-medium">Manage your surplus donations, track active bookings, and clean expired items.</p>
                </div>
                <Link to="/post-food" className="inline-flex items-center bg-brand-600 hover:bg-brand-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md transition-all whitespace-nowrap">
                    <PlusSquare className="w-5 h-5 mr-2" /> Share Surplus Food
                </Link>
            </div>

            {msg && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-800 rounded-2xl flex items-center gap-2 text-sm font-bold animate-fade-in">
                    <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                    <span>{msg}</span>
                </div>
            )}

            {/* Filter Tabs */}
            <div className="flex space-x-1 border-b border-gray-200 mb-6 overflow-x-auto">
                {['All', 'Available', 'Reserved', 'Collected', 'Expired'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-5 py-3 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${
                            activeTab === tab 
                                ? 'border-brand-600 text-brand-600' 
                                : 'border-transparent text-gray-400 hover:text-gray-600 hover:border-gray-300'
                        }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-48">
                    <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
                </div>
            ) : filteredListings.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300">
                    <Package className="w-14 h-14 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No listings found</h3>
                    <p className="text-gray-500 font-medium mb-6">
                        {activeTab === 'All' ? "You haven't posted any surplus food yet." : `No listings found under ${activeTab}.`}
                    </p>
                    <Link to="/post-food" className="inline-flex items-center text-brand-600 font-bold hover:text-brand-700">
                        <PlusSquare className="w-5 h-5 mr-2" /> Create your first listing
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredListings.map(listing => {
                        const isExpired = listing.status === 'EXPIRED' || (new Date(listing.expiryTime) < new Date() && listing.status !== 'COLLECTED');

                        return (
                            <div 
                                key={listing._id} 
                                className={`bg-white p-5 rounded-3xl shadow-sm border flex flex-col justify-between transition-all hover:shadow-md ${
                                    isExpired ? 'border-red-100 bg-red-50/20' : 'border-gray-100'
                                }`}
                            >
                                <div>
                                    <div className="flex items-start gap-4 mb-4">
                                        <img
                                            src={listing.image || DEFAULT_FOOD_IMAGE}
                                            onError={(e) => { e.currentTarget.src = DEFAULT_FOOD_IMAGE; }}
                                            alt="Food"
                                            className="w-24 h-24 object-cover rounded-2xl bg-gray-100 shrink-0"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start mb-1 gap-2">
                                                <h3 className="text-lg font-bold text-gray-900 truncate" title={listing.foodName}>
                                                    {listing.foodName}
                                                </h3>
                                                <span className={`px-2.5 py-0.5 rounded-lg text-xs font-black shrink-0 ${getStatusStyle(isExpired ? 'EXPIRED' : listing.status)}`}>
                                                    {isExpired ? 'EXPIRED' : listing.status}
                                                </span>
                                            </div>
                                            
                                            <p className="text-xs text-gray-500 font-medium mb-3 flex items-center truncate">
                                                <MapPin className="w-3.5 h-3.5 mr-1 text-gray-400 shrink-0" />
                                                <span className="truncate">{listing.location}</span>
                                            </p>

                                            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-gray-600">
                                                <span className="bg-brand-50 text-brand-700 px-2 py-1 rounded-md">
                                                    {listing.availableQuantity} of {listing.quantity} {listing.unit} remaining
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-4 border-t border-gray-100 pt-3.5 flex items-center justify-between text-xs font-medium text-gray-500">
                                    <div className="flex items-center">
                                        <Clock className="w-4 h-4 mr-1.5 text-gray-400 shrink-0" />
                                        <span>
                                            {isExpired 
                                                ? <strong className="text-red-600">Expired at {new Date(listing.expiryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong>
                                                : `Expires: ${new Date(listing.expiryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                                            }
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-1">
                                        <button 
                                            onClick={() => handleDelete(listing._id)}
                                            disabled={deletingId === listing._id}
                                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                                            title="Delete listing"
                                        >
                                            {deletingId === listing._id ? <Loader2 className="w-4 h-4 animate-spin text-red-500" /> : <Trash2 className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default MyListings;

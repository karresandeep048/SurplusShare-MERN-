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
    MapPin,
    Edit3,
    Repeat,
    KeyRound,
    X,
    Sparkles
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const DEFAULT_FOOD_IMAGE = 'https://images.unsplash.com/photo-1490645943961-4a51e5f31070?w=200&q=80';

const MyListings = () => {
    const navigate = useNavigate();
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('All');
    const [deletingId, setDeletingId] = useState(null);
    const [msg, setMsg] = useState(null);
    const [errorMsg, setErrorMsg] = useState(null);

    // Edit modal state
    const [editingListing, setEditingListing] = useState(null);
    const [editFormData, setEditFormData] = useState({
        foodName: '',
        quantity: 0,
        description: '',
        location: ''
    });
    const [savingEdit, setSavingEdit] = useState(false);

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
        if (!window.confirm('Are you sure you want to delete this listing?')) return;
        setDeletingId(id);
        try {
            await axios.delete(`/api/listings/${id}`);
            setMsg('Listing removed successfully.');
            setListings(prev => prev.filter(l => l._id !== id));
            setTimeout(() => setMsg(null), 4000);
        } catch (err) {
            setErrorMsg(err.response?.data?.message || 'Failed to delete listing.');
        } finally {
            setDeletingId(null);
        }
    };

    // Open Edit Modal
    const handleOpenEdit = (listing) => {
        setEditingListing(listing);
        setEditFormData({
            foodName: listing.foodName || '',
            quantity: listing.quantity || 1,
            description: listing.description || '',
            location: listing.location || ''
        });
    };

    // Save Edit
    const handleSaveEdit = async (e) => {
        e.preventDefault();
        setSavingEdit(true);
        setErrorMsg(null);
        try {
            const { data } = await axios.put(`/api/listings/${editingListing._id}`, editFormData);
            setListings(prev => prev.map(l => l._id === data._id ? data : l));
            setMsg('Listing updated successfully!');
            setEditingListing(null);
            setTimeout(() => setMsg(null), 4000);
        } catch (err) {
            setErrorMsg(err.response?.data?.message || 'Failed to update listing.');
        } finally {
            setSavingEdit(false);
        }
    };

    // Repost / Duplicate Listing
    const handleRepost = async (listing) => {
        const now = new Date();
        const newStart = now.toISOString();
        const newEnd = new Date(now.getTime() + 3 * 3600000).toISOString();
        const newExp = new Date(now.getTime() + 5 * 3600000).toISOString();

        try {
            const payload = {
                foodName: listing.foodName,
                description: listing.description,
                quantity: listing.quantity,
                unit: listing.unit,
                foodType: listing.foodType,
                dietaryInformation: listing.dietaryInformation,
                image: listing.image,
                location: listing.location,
                coordinates: listing.coordinates,
                pickupStart: newStart,
                pickupEnd: newEnd,
                expiryTime: newExp
            };
            const { data } = await axios.post('/api/listings', payload);
            setListings(prev => [data, ...prev]);
            setMsg(`🎉 "${listing.foodName}" reposted with fresh expiry!`);
            setTimeout(() => setMsg(null), 5000);
        } catch (err) {
            setErrorMsg(err.response?.data?.message || 'Failed to repost listing.');
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'AVAILABLE': return 'bg-brand-50 text-brand-700 border-brand-200';
            case 'PARTIALLY_RESERVED':
            case 'RESERVED': return 'bg-amber-50 text-amber-700 border-amber-200';
            case 'COLLECTED': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
            case 'EXPIRED': return 'bg-red-50 text-red-700 border-red-200';
            default: return 'bg-slate-100 text-slate-600';
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

    const activeCount = listings.filter(l => l.status === 'AVAILABLE').length;
    const reservedCount = listings.filter(l => l.status === 'RESERVED' || l.status === 'PARTIALLY_RESERVED').length;
    const collectedCount = listings.filter(l => l.status === 'COLLECTED').length;

    return (
        <div className="max-w-6xl mx-auto pb-16">
            
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end mb-6 gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 mb-1">My Food Listings</h1>
                    <p className="text-slate-500 font-medium text-sm">
                        Manage your surplus food donations, edit items, and repost recurring surplus.
                    </p>
                </div>
                <Link 
                    to="/post-food" 
                    className="inline-flex items-center bg-brand-600 hover:bg-brand-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md shadow-brand-500/20 transition-all whitespace-nowrap"
                >
                    <PlusSquare className="w-4 h-4 mr-2" /> Share Surplus Food
                </Link>
            </div>

            {/* Quick Metrics Ribbon */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Listed</span>
                    <span className="text-2xl font-black text-slate-900">{listings.length}</span>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Active Available</span>
                    <span className="text-2xl font-black text-brand-600">{activeCount}</span>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">In Reservation</span>
                    <span className="text-2xl font-black text-amber-600">{reservedCount}</span>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Completed Handover</span>
                    <span className="text-2xl font-black text-emerald-600">{collectedCount}</span>
                </div>
            </div>

            {/* Alerts */}
            {msg && (
                <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center gap-2 text-sm font-bold animate-fade-in">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span>{msg}</span>
                </div>
            )}

            {errorMsg && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl flex items-center gap-2 text-sm font-medium animate-fade-in">
                    <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
                    <span>{errorMsg}</span>
                </div>
            )}

            {/* Filter Tabs */}
            <div className="flex space-x-1 border-b border-slate-200 mb-6 overflow-x-auto">
                {['All', 'Available', 'Reserved', 'Collected', 'Expired'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-5 py-3 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${
                            activeTab === tab 
                                ? 'border-brand-600 text-brand-600' 
                                : 'border-transparent text-slate-400 hover:text-slate-600'
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
                <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-300 p-8">
                    <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <h3 className="text-lg font-bold text-slate-900 mb-1">No listings found</h3>
                    <p className="text-slate-500 font-medium text-xs mb-4">
                        {activeTab === 'All' ? "You haven't posted any surplus food yet." : `No listings under "${activeTab}".`}
                    </p>
                    <Link to="/post-food" className="inline-flex items-center text-brand-600 font-bold text-sm hover:underline">
                        <PlusSquare className="w-4 h-4 mr-1.5" /> Post your first listing
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredListings.map(listing => {
                        const isExpired = listing.status === 'EXPIRED' || (new Date(listing.expiryTime) < new Date() && listing.status !== 'COLLECTED');

                        return (
                            <div 
                                key={listing._id} 
                                className={`bg-white p-5 rounded-3xl shadow-sm border transition-all hover:shadow-md flex flex-col justify-between ${
                                    isExpired ? 'border-red-100 bg-red-50/10' : 'border-slate-100'
                                }`}
                            >
                                <div>
                                    <div className="flex items-start gap-4 mb-4">
                                        <img
                                            src={listing.image || DEFAULT_FOOD_IMAGE}
                                            onError={(e) => { e.currentTarget.src = DEFAULT_FOOD_IMAGE; }}
                                            alt="Food"
                                            className="w-24 h-24 object-cover rounded-2xl bg-slate-100 shrink-0"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start mb-1 gap-2">
                                                <h3 className="text-base font-bold text-slate-900 truncate" title={listing.foodName}>
                                                    {listing.foodName}
                                                </h3>
                                                <span className={`px-2 py-0.5 rounded-md text-[11px] font-black shrink-0 border ${getStatusStyle(isExpired ? 'EXPIRED' : listing.status)}`}>
                                                    {isExpired ? 'EXPIRED' : listing.status}
                                                </span>
                                            </div>

                                            <p className="text-xs text-slate-500 font-medium mb-2 flex items-center truncate">
                                                <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400 shrink-0" />
                                                <span className="truncate">{listing.location}</span>
                                            </p>

                                            <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-slate-600">
                                                <span className="bg-brand-50 text-brand-700 px-2 py-0.5 rounded-md">
                                                    {listing.availableQuantity} of {listing.quantity} {listing.unit} remaining
                                                </span>
                                                <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                                                    {listing.foodType}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-medium text-slate-500">
                                    <div className="flex items-center text-slate-500">
                                        <Clock className="w-3.5 h-3.5 mr-1 text-slate-400 shrink-0" />
                                        <span>
                                            {isExpired ? (
                                                <strong className="text-red-600">Expired</strong>
                                            ) : (
                                                `Expires: ${new Date(listing.expiryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })}`
                                            )}
                                        </span>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-1">
                                        {/* Repost button */}
                                        <button
                                            onClick={() => handleRepost(listing)}
                                            className="p-1.5 text-slate-500 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors flex items-center gap-1 font-bold text-[11px]"
                                            title="Repost with fresh expiry"
                                        >
                                            <Repeat className="w-3.5 h-3.5" />
                                            <span>Repost</span>
                                        </button>

                                        {/* Edit button */}
                                        <button
                                            onClick={() => handleOpenEdit(listing)}
                                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                            title="Edit listing details"
                                        >
                                            <Edit3 className="w-3.5 h-3.5" />
                                        </button>

                                        {/* Delete button */}
                                        <button
                                            onClick={() => handleDelete(listing._id)}
                                            disabled={deletingId === listing._id}
                                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Delete listing"
                                        >
                                            {deletingId === listing._id ? <Loader2 className="w-3.5 h-3.5 animate-spin text-red-500" /> : <Trash2 className="w-3.5 h-3.5" />}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* EDIT LISTING MODAL */}
            {editingListing && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-100 animate-scale-up">
                        <div className="flex justify-between items-start mb-5">
                            <div>
                                <h3 className="text-xl font-black text-slate-900">Edit Food Listing</h3>
                                <p className="text-xs text-slate-500 font-medium">Update portions, title, or pickup address</p>
                            </div>
                            <button 
                                onClick={() => setEditingListing(null)}
                                className="p-2 text-slate-400 hover:text-slate-600 rounded-full bg-slate-100"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <form onSubmit={handleSaveEdit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Food Title</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-brand-500 outline-none text-sm font-medium"
                                    value={editFormData.foodName}
                                    onChange={(e) => setEditFormData({ ...editFormData, foodName: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Total Quantity</label>
                                <input
                                    type="number"
                                    min="1"
                                    required
                                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-brand-500 outline-none text-sm font-medium"
                                    value={editFormData.quantity}
                                    onChange={(e) => setEditFormData({ ...editFormData, quantity: Number(e.target.value) })}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Pickup Address</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-brand-500 outline-none text-sm font-medium"
                                    value={editFormData.location}
                                    onChange={(e) => setEditFormData({ ...editFormData, location: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Description</label>
                                <textarea
                                    rows="3"
                                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-brand-500 outline-none text-sm font-medium"
                                    value={editFormData.description}
                                    onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                                />
                            </div>

                            <div className="flex gap-3 pt-3">
                                <button
                                    type="button"
                                    onClick={() => setEditingListing(null)}
                                    className="flex-1 py-3 text-slate-600 hover:bg-slate-100 rounded-xl font-bold text-sm"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={savingEdit}
                                    className="flex-1 py-3 bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white rounded-xl font-bold text-sm shadow-md shadow-brand-500/20 flex items-center justify-center gap-2"
                                >
                                    {savingEdit ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
};

export default MyListings;

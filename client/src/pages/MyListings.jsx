import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Package, PlusSquare, Clock, Edit2, XCircle, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const MyListings = () => {
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchListings = async () => {
            try {
                const { data } = await axios.get('/api/listings/my');
                setListings(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchListings();
    }, []);

    const getStatusStyle = (status) => {
        switch (status) {
            case 'AVAILABLE': return 'bg-brand-100 text-brand-700';
            case 'RESERVED': return 'bg-amber-100 text-amber-700';
            case 'COLLECTED': return 'bg-gray-100 text-gray-700';
            case 'EXPIRED': return 'bg-red-100 text-red-700';
            default: return 'bg-gray-100 text-gray-600';
        }
    };

    return (
        <div className="max-w-6xl mx-auto pb-12">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 mb-2">My Listings</h1>
                    <p className="text-gray-500 font-medium">Manage and track your surplus food donations.</p>
                </div>
                <Link to="/post-food" className="inline-flex items-center bg-brand-600 hover:bg-brand-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-colors whitespace-nowrap">
                    <PlusSquare className="w-5 h-5 mr-2" /> Share Surplus Food
                </Link>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-48">
                    <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
                </div>
            ) : listings.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300">
                    <Package className="w-14 h-14 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No listings yet</h3>
                    <p className="text-gray-500 font-medium mb-6">You haven't posted any surplus food.</p>
                    <Link to="/post-food" className="inline-flex items-center text-brand-600 font-bold hover:text-brand-700">
                        <PlusSquare className="w-5 h-5 mr-2" /> Create your first listing
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {listings.map(listing => (
                        <div key={listing._id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full hover:shadow-md transition-shadow">
                            <div className="flex items-start gap-4 mb-4">
                                <img
                                    src={listing.image || 'https://images.unsplash.com/photo-1490645943961-4a51e5f31070?w=200&q=80'}
                                    alt="Food"
                                    className="w-24 h-24 object-cover rounded-xl bg-gray-100 shrink-0"
                                />
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start mb-1">
                                        <h3 className="text-lg font-bold text-gray-900 truncate pr-2">{listing.foodName}</h3>
                                        <span className={`px-2.5 py-1 rounded inline-flex text-xs font-bold shrink-0 ${getStatusStyle(listing.status)}`}>
                                            {listing.status}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-500 font-medium mb-3 truncate">{listing.location}</p>
                                    <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-gray-600">
                                        <span className="flex items-center text-brand-700 bg-brand-50 px-2 py-1 rounded-md">
                                            {listing.availableQuantity} of {listing.quantity} {listing.unit} left
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-auto border-t border-gray-100 pt-4 flex items-center justify-between">
                                <div className="flex items-center text-xs font-medium text-gray-500">
                                    <Clock className="w-4 h-4 mr-1.5 text-gray-400" />
                                    Expires: {new Date(listing.expiryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                                <div className="flex space-x-2">
                                    <button className="p-2 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors">
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                        <XCircle className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyListings;

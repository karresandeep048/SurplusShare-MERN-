import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Package, Clock, ShieldAlert, Loader2 } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const MyReservations = () => {
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('All');
    const location = useLocation();

    useEffect(() => {
        const fetchReservations = async () => {
            try {
                const { data } = await axios.get('/api/reservations/my');
                setReservations(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchReservations();
    }, []);

    const filteredReservations = reservations.filter(res => {
        if (activeTab === 'All') return true;
        return res.status === activeTab.toUpperCase();
    });

    const getStatusStyle = (status) => {
        switch (status) {
            case 'RESERVED': return 'bg-brand-100 text-brand-700';
            case 'COLLECTED': return 'bg-gray-100 text-gray-700';
            case 'CANCELLED': return 'bg-red-100 text-red-700';
            default: return 'bg-gray-100 text-gray-600';
        }
    };

    return (
        <div className="max-w-5xl mx-auto pb-12">
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 mb-2">My Reservations</h1>
                    <p className="text-gray-500 font-medium">Track your pickups and collection history.</p>
                </div>
            </div>

            {location.state?.newReservation && (
                <div className="mb-8 p-6 bg-brand-50 border border-brand-200 rounded-2xl flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-bold text-brand-900 mb-1 flex items-center">
                            <span className="text-2xl mr-2">🎉</span> Reservation Confirmed!
                        </h3>
                        <p className="text-brand-700 font-medium">Your food has been successfully reserved. Show your pickup code to the donor.</p>
                    </div>
                </div>
            )}

            <div className="flex space-x-1 border-b border-gray-200 mb-6">
                {['All', 'Reserved', 'Collected', 'Cancelled'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-5 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === tab ? 'border-brand-600 text-brand-600' : 'border-transparent text-gray-400 hover:text-gray-600 hover:border-gray-300'}`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-48">
                    <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
                </div>
            ) : filteredReservations.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-gray-300">
                    <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <h3 className="text-lg font-bold text-gray-900 mb-1">No reservations found</h3>
                    <p className="text-gray-500 font-medium">You don't have any {activeTab !== 'All' ? activeTab.toLowerCase() : ''} reservations yet.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredReservations.map(res => (
                        <div key={res._id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row items-center gap-6">
                            <img
                                src={res.foodListing?.image || 'https://images.unsplash.com/photo-1490645943961-4a51e5f31070?w=200&q=80'}
                                alt="Food"
                                className="w-full sm:w-28 h-28 object-cover rounded-xl bg-gray-100 shrink-0"
                            />

                            <div className="flex-1 w-full">
                                <div className="flex justify-between items-start mb-1">
                                    <h3 className="text-xl font-bold text-gray-900 leading-tight">
                                        {res.foodListing?.foodName || 'Unknown Food'}
                                    </h3>
                                    <span className={`px-2.5 py-1 rounded inline-flex text-xs font-bold ${getStatusStyle(res.status)}`}>
                                        {res.status}
                                    </span>
                                </div>
                                <div className="text-sm text-gray-500 font-medium mb-4">
                                    {res.foodListing?.supplier?.name || 'Local Supplier'}
                                </div>

                                <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-gray-600 bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                                    <span className="flex items-center">
                                        <Package className="w-4 h-4 mr-1.5 text-brand-500" /> {res.quantity} {res.foodListing?.unit || 'items'}
                                    </span>
                                    {res.foodListing && (
                                        <span className="flex items-center">
                                            <Clock className="w-4 h-4 mr-1.5 text-amber-500" /> Pickup: {new Date(res.foodListing.pickupStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(res.foodListing.pickupEnd).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="w-full sm:w-auto shrink-0 flex flex-col items-center sm:items-end justify-center bg-gray-50 sm:bg-transparent p-4 sm:p-0 rounded-xl">
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Pickup Code</span>
                                <span className={`text-3xl font-black ${res.status === 'RESERVED' ? 'text-gray-900 tracking-wider' : 'text-gray-400 line-through'}`}>
                                    {res.pickupCode}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyReservations;

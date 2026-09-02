import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Package, TrendingUp, CheckCircle2, List as ListIcon, Heart, Leaf } from 'lucide-react';

const DEFAULT_FOOD_IMAGE = 'https://images.unsplash.com/photo-1490645943961-4a51e5f31070?w=100&q=80';

const Dashboard = () => {
    const { user } = useContext(AuthContext);
    const [recentListings, setRecentListings] = useState([]);
    const [supplierStats, setSupplierStats] = useState({
        active: 0,
        reserved: 0,
        collected: 0,
        rescued: 0
    });
    const [receiverStats, setReceiverStats] = useState({
        rescued: 0,
        pickups: 0,
        total: 0
    });

    const isSupplier = user?.role?.toLowerCase() === 'supplier';

    useEffect(() => {
        if (isSupplier) {
            axios.get('/api/listings/my')
                .then(res => {
                    const data = res.data || [];
                    setRecentListings(data.slice(0, 3));
                    const active = data.filter(l => l.status === 'AVAILABLE').length;
                    const reserved = data.filter(l => l.status === 'RESERVED' || l.status === 'PARTIALLY_RESERVED').length;
                    const collected = data.filter(l => l.status === 'COLLECTED').length;
                    const rescued = data.filter(l => l.status === 'COLLECTED').reduce((sum, l) => sum + (l.quantity || 0), 0);
                    setSupplierStats({ active, reserved, collected, rescued });
                })
                .catch(err => console.error(err));
        } else {
            axios.get('/api/reservations/my')
                .then(res => {
                    const data = res.data || [];
                    const pickups = data.filter(r => r.status === 'COLLECTED').length;
                    setReceiverStats({
                        rescued: user?.mealsRescued ?? 0,
                        pickups,
                        total: data.length
                    });
                })
                .catch(err => console.error(err));
        }
    }, [user, isSupplier]);

    const supplierCards = [
        { label: 'Active Listings', value: supplierStats.active, icon: ListIcon, color: 'text-indigo-600', bg: 'bg-indigo-100' },
        { label: 'Reserved Food', value: supplierStats.reserved, icon: Package, color: 'text-amber-600', bg: 'bg-amber-100' },
        { label: 'Food Collected', value: supplierStats.collected, icon: CheckCircle2, color: 'text-brand-600', bg: 'bg-brand-100' },
        { label: 'Meals Rescued', value: supplierStats.rescued, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    ];

    const receiverCards = [
        { label: 'Meals Rescued', value: receiverStats.rescued, icon: Heart, color: 'text-brand-600', bg: 'bg-brand-100' },
        { label: 'Successful Pickups', value: receiverStats.pickups, icon: CheckCircle2, color: 'text-blue-600', bg: 'bg-blue-100' },
        { label: 'Rescue Actions', value: receiverStats.total, icon: Leaf, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    ];

    const cards = isSupplier ? supplierCards : receiverCards;

    return (
        <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl font-black text-gray-900 mb-2">Welcome back, {user?.name?.split(' ')[0] || 'Guest'}! 👋</h1>
            <p className="text-gray-500 mb-8 font-medium">Here's your impact on the community.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                {cards.map((card, i) => (
                    <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 rounded-xl ${card.bg}`}>
                                <card.icon className={`w-6 h-6 ${card.color}`} />
                            </div>
                        </div>
                        <div>
                            <h2 className="text-4xl font-black text-gray-900 mb-1 tracking-tight">{card.value}</h2>
                            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">{card.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {isSupplier && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                        <h3 className="text-lg font-bold text-gray-900">Recent Listings</h3>
                        <Link to="/my-listings" className="text-sm font-semibold text-brand-600 hover:text-brand-700">View All →</Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr>
                                    <th className="px-6 py-4 border-b border-gray-100 text-xs font-bold uppercase tracking-wider text-gray-400">Food</th>
                                    <th className="px-6 py-4 border-b border-gray-100 text-xs font-bold uppercase tracking-wider text-gray-400">Quantity</th>
                                    <th className="px-6 py-4 border-b border-gray-100 text-xs font-bold uppercase tracking-wider text-gray-400">Pickup Time</th>
                                    <th className="px-6 py-4 border-b border-gray-100 text-xs font-bold uppercase tracking-wider text-gray-400">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {recentListings.map(listing => (
                                    <tr key={listing._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <img 
                                                    src={listing.image || DEFAULT_FOOD_IMAGE} 
                                                    onError={(e) => { e.currentTarget.src = DEFAULT_FOOD_IMAGE; }}
                                                    className="w-10 h-10 rounded-lg object-cover mr-3 bg-gray-100" 
                                                    alt="" 
                                                />
                                                <span className="font-bold text-gray-900">{listing.foodName}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-600">{listing.quantity} {listing.unit}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500 font-medium">
                                            {new Date(listing.pickupStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded inline-flex text-xs font-bold ${listing.status === 'AVAILABLE' ? 'bg-brand-100 text-brand-700' : 'bg-gray-100 text-gray-600'}`}>
                                                {listing.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {recentListings.length === 0 && (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-8 text-center text-gray-500 font-medium">
                                            No recent listings. You haven't posted any surplus food yet.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {!isSupplier && (
                <div className="bg-brand-50 rounded-2xl border border-brand-100 p-8 flex flex-col md:flex-row justify-between items-center mt-10">
                    <div className="mb-4 md:mb-0">
                        <h3 className="text-xl font-bold text-brand-900 mb-2">Ready to Rescue?</h3>
                        <p className="text-brand-700 font-medium max-w-lg">
                            We have several active listings around Bengaluru waiting for pickup. Help the community by claiming surplus food today.
                        </p>
                    </div>
                    <Link to="/find-food" className="bg-brand-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-brand-700 transition-colors shadow-sm shrink-0">
                        Find Nearby Food
                    </Link>
                </div>
            )}
        </div>
    );
};

export default Dashboard;

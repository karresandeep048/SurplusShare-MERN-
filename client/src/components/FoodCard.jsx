import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Clock, Tag } from 'lucide-react';

export const FoodCard = ({ food, compact = false }) => {
    const now = new Date();
    const expiry = new Date(food.expiryTime);
    const diffHrs = Math.max(0, (expiry - now) / 3600000);

    let expiryColor = "bg-green-100 text-green-800";
    let expiryText = `Expires in ${Math.round(diffHrs)} hours`;

    if (diffHrs < 1) {
        expiryColor = "bg-red-100 text-red-800";
        expiryText = "Expiring soon!";
    } else if (diffHrs < 3) {
        expiryColor = "bg-orange-100 text-orange-800";
        expiryText = `Expires in ${Math.round(diffHrs)} hours`;
    }

    return (
        <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow flex ${compact ? 'flex-col' : 'flex-col sm:flex-row'}`}>
            <div className={`${compact ? 'h-48' : 'h-48 sm:h-auto sm:w-48'} shrink-0 relative bg-gray-100`}>
                <img
                    src={food.image || "https://images.unsplash.com/photo-1490645943961-4a51e5f31070?w=400&q=80"}
                    alt={food.foodName}
                    className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full text-xs font-bold text-gray-800 shadow-sm">
                    {food.availableQuantity} {food.unit}
                </div>
            </div>

            <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between min-w-0">
                <div>
                    <div className="flex justify-between items-start mb-1">
                        <h3 className="text-lg font-bold text-gray-900 truncate pr-2" title={food.foodName}>{food.foodName}</h3>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium shrink-0 ${food.status === 'AVAILABLE' ? 'bg-brand-100 text-brand-700' : 'bg-gray-100 text-gray-600'}`}>
                            {food.status}
                        </span>
                    </div>
                    <div className="text-sm text-gray-500 mb-3 truncate font-medium">
                        {food.supplier?.name || "Local Supplier"}
                    </div>

                    <div className="flex flex-wrap gap-1.5 mb-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-indigo-50 text-indigo-700">
                            {food.foodType}
                        </span>
                        {food.dietaryInformation?.slice(0, 2).map((diet, i) => (
                            <span key={i} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
                                <Tag className="w-3 h-3 mr-1" /> {diet}
                            </span>
                        ))}
                        {food.dietaryInformation?.length > 2 && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-gray-50 text-gray-500">
                                +{food.dietaryInformation.length - 2}
                            </span>
                        )}
                    </div>
                </div>

                <div className="space-y-2 mt-auto">
                    <div className="flex items-center text-xs text-gray-500 font-medium whitespace-nowrap">
                        <Clock className="w-4 h-4 mr-1.5 text-gray-400 shrink-0" />
                        <span className={`px-2 py-0.5 rounded ${expiryColor} font-bold mr-2 tracking-wide`}>{expiryText}</span>
                        {new Date(food.pickupStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(food.pickupEnd).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className="flex items-center text-xs text-gray-500 font-medium truncate">
                        <MapPin className="w-4 h-4 mr-1.5 text-gray-400 shrink-0" />
                        <span className="truncate">{food.location}</span>
                        {food.coordinates && <span className="ml-1 text-gray-400 shrink-0">(1.2 km)</span>}
                    </div>
                </div>

                {food.status === 'AVAILABLE' && (
                    <div className="mt-4 flex justify-end">
                        <Link to={`/listing/${food._id}`} className="bg-brand-600 hover:bg-brand-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm focus:ring-2 focus:ring-brand-500 focus:outline-none focus:ring-offset-2">
                            View & Reserve
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}

export default FoodCard;

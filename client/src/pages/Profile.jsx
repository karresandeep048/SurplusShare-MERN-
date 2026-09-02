import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

function Profile() {
    const { user } = useContext(AuthContext);

    if (!user) return <div className="p-8 text-center text-gray-600">Loading profile...</div>;

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-8">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="bg-green-700 p-8 text-center md:text-left flex flex-col md:flex-row items-center gap-6">
                    <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-3xl shadow-inner text-green-700 font-bold border-4 border-green-200">
                        {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="text-white flex-1">
                        <h1 className="text-3xl font-bold mb-1">{user.name}</h1>
                        <p className="text-green-100 mb-2">{user.email}</p>
                        <span className="bg-green-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider border border-green-500 shadow-sm">
                            {user.role}
                        </span>
                    </div>
                </div>

                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Profile Details</h2>
                        <div className="space-y-4 text-gray-600">
                            <div>
                                <p className="text-sm font-bold text-gray-400">Account Role</p>
                                <p className="font-medium capitalize">{user.role}</p>
                            </div>
                            <div>
                                <p className="text-sm font-bold text-gray-400">Member Since</p>
                                <p className="font-medium">2026</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-green-50 p-6 rounded-xl border border-green-100 flex flex-col items-center justify-center text-center">
                        <h2 className="text-lg font-bold text-green-800 mb-2">Impact Score</h2>
                        <div className="text-5xl font-black text-green-600 mb-2 drop-shadow-sm">{user.mealsRescued || 0}</div>
                        <p className="text-green-700 font-medium">Total Meals Rescued</p>
                        <p className="text-sm text-green-600/80 mt-4 leading-relaxed">
                            Every meal you rescue helps reduce food waste and greenhouse gas emissions!
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Profile;

import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { 
    User, 
    Mail, 
    MapPin, 
    Award, 
    Leaf, 
    Sparkles, 
    CheckCircle2, 
    ShieldCheck, 
    Loader2, 
    Tag, 
    Edit2, 
    RotateCcw,
    Droplet,
    Heart
} from 'lucide-react';

const DIETARY_OPTIONS = ['Vegetarian', 'Vegan', 'Halal', 'Gluten-Free', 'Dairy-Free', 'Nut-Free', 'Organic', 'No Onion/Garlic'];

function Profile() {
    const { user, updateProfile, refreshUser } = useContext(AuthContext);

    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(user?.name || '');
    const [location, setLocation] = useState(user?.location || 'Bengaluru, India');
    const [role, setRole] = useState(user?.role || 'receiver');
    const [dietaryPreferences, setDietaryPreferences] = useState(user?.dietaryPreferences || []);
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState(null);
    const [errorMsg, setErrorMsg] = useState(null);

    if (!user) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
            </div>
        );
    }

    const toggleDietary = (item) => {
        if (dietaryPreferences.includes(item)) {
            setDietaryPreferences(dietaryPreferences.filter(d => d !== item));
        } else {
            setDietaryPreferences([...dietaryPreferences, item]);
        }
    };

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMsg(null);
        setErrorMsg(null);
        try {
            await updateProfile({
                name,
                location,
                role,
                dietaryPreferences
            });
            setMsg('Profile updated successfully!');
            setIsEditing(false);
            setTimeout(() => setMsg(null), 4000);
        } catch (err) {
            setErrorMsg(err.response?.data?.message || 'Failed to update profile.');
        } finally {
            setSaving(false);
        }
    };

    const mealsCount = user.mealsRescued || 0;
    const co2AvoidedKg = (mealsCount * 2.5).toFixed(1);
    const waterSavedL = (mealsCount * 140).toLocaleString();

    const BADGES = [
        { name: 'First Rescue', desc: 'Rescued your 1st surplus meal', unlocked: mealsCount >= 1, icon: '🌱' },
        { name: 'Waste Advocate', desc: 'Rescued 10+ surplus meals', unlocked: mealsCount >= 10, icon: '⭐' },
        { name: 'Community Hero', desc: 'Rescued 25+ surplus meals', unlocked: mealsCount >= 25, icon: '🏆' },
        { name: 'Eco Titan', desc: 'Rescued 50+ surplus meals', unlocked: mealsCount >= 50, icon: '🌍' },
    ];

    return (
        <div className="max-w-4xl mx-auto pb-16 space-y-8">
            
            {/* Notifications */}
            {msg && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center gap-2 text-sm font-bold animate-fade-in">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span>{msg}</span>
                </div>
            )}

            {errorMsg && (
                <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl flex items-center gap-2 text-sm font-medium animate-fade-in">
                    <span>{errorMsg}</span>
                </div>
            )}

            {/* Profile Hero Card */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="bg-gradient-to-r from-brand-700 via-emerald-700 to-teal-800 p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6">
                    
                    <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
                        <div className="w-24 h-24 bg-white/10 backdrop-blur-md rounded-3xl flex items-center justify-center text-4xl font-black text-white border-2 border-white/20 shadow-xl shrink-0">
                            {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div>
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-1">
                                <h1 className="text-2xl sm:text-3xl font-black">{user.name}</h1>
                                <span className="bg-white/20 backdrop-blur-md text-white text-[11px] font-black px-3 py-0.5 rounded-full uppercase tracking-wider border border-white/30">
                                    {user.role}
                                </span>
                            </div>
                            <p className="text-emerald-100 text-sm font-medium mb-2">{user.email}</p>
                            <p className="text-xs text-white/80 flex items-center justify-center md:justify-start gap-1">
                                <MapPin className="w-3.5 h-3.5" /> {user.location || 'Bengaluru, India'}
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={() => setIsEditing(!isEditing)}
                        className="bg-white text-emerald-900 hover:bg-emerald-50 px-5 py-2.5 rounded-xl text-xs font-black shadow-md transition-all flex items-center gap-1.5 shrink-0"
                    >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>{isEditing ? 'Close Edit' : 'Edit Profile'}</span>
                    </button>

                </div>

                {/* Edit Form Drawer */}
                {isEditing && (
                    <form onSubmit={handleSaveProfile} className="p-6 sm:p-8 bg-slate-50 border-b border-slate-100 space-y-4 animate-fade-in">
                        <h3 className="text-base font-black text-slate-900 mb-2">Update Account Details</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Full Name</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 text-sm font-medium"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Default City / Area</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 text-sm font-medium"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Primary Role Mode</label>
                                <select
                                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 text-sm font-bold"
                                    value={role}
                                    onChange={(e) => setRole(e.target.value)}
                                >
                                    <option value="receiver">Receiver (Find & Claim Surplus Food)</option>
                                    <option value="supplier">Supplier (Donate Surplus Food)</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Dietary Preferences</label>
                            <div className="flex flex-wrap gap-2">
                                {DIETARY_OPTIONS.map(tag => {
                                    const isSelected = dietaryPreferences.includes(tag);
                                    return (
                                        <button
                                            type="button"
                                            key={tag}
                                            onClick={() => toggleDietary(tag)}
                                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                                                isSelected 
                                                    ? 'bg-brand-600 text-white border-brand-600 shadow-sm' 
                                                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                                            }`}
                                        >
                                            {isSelected && '✓ '} {tag}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => setIsEditing(false)}
                                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200 rounded-xl"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={saving}
                                className="bg-brand-600 hover:bg-brand-700 text-white px-5 py-2 rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5"
                            >
                                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Save Profile'}
                            </button>
                        </div>
                    </form>
                )}

                {/* Profile Overview Grid */}
                <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                    
                    {/* Impact Card 1: Meals */}
                    <div className="bg-emerald-50/60 p-5 rounded-3xl border border-emerald-100 flex flex-col justify-between">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-[10px] font-black text-emerald-800 uppercase tracking-widest">Rescued Meals</span>
                            <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
                                <Heart className="w-4 h-4 fill-current" />
                            </div>
                        </div>
                        <div>
                            <h3 className="text-4xl font-black text-emerald-950 mb-1">{mealsCount}</h3>
                            <p className="text-xs text-emerald-800 font-medium">Meals redirected from landfills</p>
                        </div>
                    </div>

                    {/* Impact Card 2: CO2 */}
                    <div className="bg-teal-50/60 p-5 rounded-3xl border border-teal-100 flex flex-col justify-between">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-[10px] font-black text-teal-800 uppercase tracking-widest">CO2 Offset</span>
                            <div className="p-2 bg-teal-100 text-teal-700 rounded-xl">
                                <Leaf className="w-4 h-4" />
                            </div>
                        </div>
                        <div>
                            <h3 className="text-4xl font-black text-teal-950 mb-1">{co2AvoidedKg} kg</h3>
                            <p className="text-xs text-teal-800 font-medium">Greenhouse gases prevented</p>
                        </div>
                    </div>

                    {/* Impact Card 3: Water */}
                    <div className="bg-blue-50/60 p-5 rounded-3xl border border-blue-100 flex flex-col justify-between">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-[10px] font-black text-blue-800 uppercase tracking-widest">Water Saved</span>
                            <div className="p-2 bg-blue-100 text-blue-700 rounded-xl">
                                <Droplet className="w-4 h-4" />
                            </div>
                        </div>
                        <div>
                            <h3 className="text-4xl font-black text-blue-950 mb-1">{waterSavedL} L</h3>
                            <p className="text-xs text-blue-800 font-medium">Agricultural water saved</p>
                        </div>
                    </div>

                </div>
            </div>

            {/* Achievements & Impact Badges */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 sm:p-8">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-lg font-black text-slate-900">Food Rescue Achievements</h3>
                        <p className="text-xs text-slate-500 font-medium">Milestones unlocked through verified food handovers</p>
                    </div>
                    <div className="flex items-center gap-1 text-xs font-black text-brand-600 bg-brand-50 px-3 py-1 rounded-full">
                        <Award className="w-4 h-4" />
                        <span>{BADGES.filter(b => b.unlocked).length} / {BADGES.length} Badges</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {BADGES.map((badge, idx) => (
                        <div
                            key={idx}
                            className={`p-4 rounded-2xl border text-center transition-all ${
                                badge.unlocked 
                                    ? 'bg-gradient-to-b from-brand-50/40 to-white border-brand-200 shadow-sm' 
                                    : 'bg-slate-50/50 border-slate-200/60 opacity-50 grayscale'
                            }`}
                        >
                            <span className="text-3xl block mb-2">{badge.icon}</span>
                            <h4 className="font-bold text-xs text-slate-900 mb-0.5">{badge.name}</h4>
                            <p className="text-[10px] text-slate-500 leading-tight font-medium">{badge.desc}</p>
                            {badge.unlocked && (
                                <span className="inline-block mt-2 text-[10px] font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                                    ✓ Unlocked
                                </span>
                            )}
                        </div>
                    ))}
                </div>
            </div>

        </div>
    );
}

export default Profile;

import React, { useContext, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { 
    LogOut, 
    User as UserIcon, 
    PlusSquare, 
    Search, 
    List, 
    Sparkles, 
    Menu, 
    X, 
    Bell, 
    ShieldCheck, 
    LayoutDashboard,
    Heart,
    ChevronDown
} from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/');
        setMobileMenuOpen(false);
        setProfileDropdownOpen(false);
    };

    const isSupplier = user?.role?.toLowerCase() === 'supplier';
    const isReceiver = user?.role?.toLowerCase() === 'receiver';

    const isActive = (path) => location.pathname === path;

    return (
        <nav className="bg-white/90 backdrop-blur-md border-b border-slate-100 sticky top-0 z-50 shadow-sm transition-all">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    
                    {/* Brand Logo */}
                    <div className="flex items-center space-x-8">
                        <Link to="/" className="flex items-center gap-2.5 group">
                            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 to-emerald-400 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
                                <Sparkles className="w-5 h-5 animate-spin-slow" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xl font-black bg-gradient-to-r from-brand-700 via-emerald-600 to-teal-600 bg-clip-text text-transparent tracking-tight">
                                    SurplusShare
                                </span>
                                <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 -mt-1">
                                    Zero Food Waste
                                </span>
                            </div>
                        </Link>

                        {/* Desktop Navigation Links */}
                        <div className="hidden md:flex items-center space-x-1">
                            <Link 
                                to="/find-food" 
                                className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
                                    isActive('/find-food') 
                                        ? 'bg-brand-50 text-brand-700 font-bold' 
                                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                                }`}
                            >
                                <Search className="w-4 h-4 text-brand-600" />
                                <span>Find Food</span>
                            </Link>

                            {user && isSupplier && (
                                <>
                                    <Link 
                                        to="/post-food" 
                                        className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
                                            isActive('/post-food') 
                                                ? 'bg-brand-50 text-brand-700 font-bold' 
                                                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                                        }`}
                                    >
                                        <PlusSquare className="w-4 h-4 text-brand-600" />
                                        <span>Share Food</span>
                                    </Link>
                                    <Link 
                                        to="/my-listings" 
                                        className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
                                            isActive('/my-listings') 
                                                ? 'bg-brand-50 text-brand-700 font-bold' 
                                                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                                        }`}
                                    >
                                        <List className="w-4 h-4 text-slate-400" />
                                        <span>My Listings</span>
                                    </Link>
                                </>
                            )}

                            {user && (isReceiver || user.role === 'admin') && (
                                <Link 
                                    to="/my-reservations" 
                                    className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
                                        isActive('/my-reservations') 
                                            ? 'bg-brand-50 text-brand-700 font-bold' 
                                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                                    }`}
                                >
                                    <Heart className="w-4 h-4 text-rose-500" />
                                    <span>My Reservations</span>
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* Right Side: User Menu or Auth CTAs */}
                    <div className="hidden md:flex items-center space-x-4">
                        {user ? (
                            <div className="flex items-center space-x-3">
                                <Link 
                                    to="/dashboard" 
                                    className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-1.5 ${
                                        isActive('/dashboard') 
                                            ? 'bg-brand-600 text-white shadow-sm shadow-brand-600/20' 
                                            : 'text-slate-700 hover:bg-slate-100'
                                    }`}
                                >
                                    <LayoutDashboard className="w-4 h-4" />
                                    <span>Dashboard</span>
                                </Link>

                                {/* User Profile Pill & Dropdown */}
                                <div className="relative">
                                    <button 
                                        onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                                        className="flex items-center gap-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 px-3 py-1.5 rounded-2xl transition-all cursor-pointer"
                                    >
                                        <div className="w-7 h-7 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-xs border border-brand-200">
                                            {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                                        </div>
                                        <div className="text-left">
                                            <p className="text-xs font-bold text-slate-800 leading-tight truncate max-w-[100px]">
                                                {user.name || 'User'}
                                            </p>
                                            <span className="text-[10px] font-semibold text-brand-600 uppercase tracking-wider block">
                                                {user.role}
                                            </span>
                                        </div>
                                        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                                    </button>

                                    {/* Dropdown Menu */}
                                    {profileDropdownOpen && (
                                        <div 
                                            className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-fade-in"
                                            onMouseLeave={() => setProfileDropdownOpen(false)}
                                        >
                                            <div className="px-4 py-2 border-b border-slate-100">
                                                <p className="text-xs font-semibold text-slate-400">Signed in as</p>
                                                <p className="text-sm font-bold text-slate-800 truncate">{user.email}</p>
                                            </div>
                                            
                                            <Link 
                                                to="/profile" 
                                                onClick={() => setProfileDropdownOpen(false)}
                                                className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                                            >
                                                <UserIcon className="w-4 h-4 text-slate-400" />
                                                <span>My Profile & Impact</span>
                                            </Link>

                                            <div className="border-t border-slate-100 my-1"></div>

                                            <button 
                                                onClick={handleLogout}
                                                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-bold text-rose-600 hover:bg-rose-50 transition-colors"
                                            >
                                                <LogOut className="w-4 h-4 text-rose-500" />
                                                <span>Log Out</span>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center space-x-3">
                                <Link 
                                    to="/login" 
                                    className="px-4 py-2 text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors"
                                >
                                    Log In
                                </Link>
                                <Link 
                                    to="/register" 
                                    className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-brand-600 hover:bg-brand-700 transition-all shadow-md shadow-brand-500/20 hover:shadow-lg hover:shadow-brand-500/30"
                                >
                                    Sign Up
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile Hamburger Button */}
                    <div className="flex items-center md:hidden">
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                        >
                            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>

                </div>
            </div>

            {/* Mobile Navigation Drawer */}
            {mobileMenuOpen && (
                <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-6 space-y-3 animate-fade-in shadow-xl">
                    <Link
                        to="/find-food"
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold ${
                            isActive('/find-food') ? 'bg-brand-50 text-brand-700' : 'text-slate-700 hover:bg-slate-50'
                        }`}
                    >
                        <Search className="w-4 h-4 text-brand-600" /> Find Surplus Food
                    </Link>

                    {user && isSupplier && (
                        <>
                            <Link
                                to="/post-food"
                                onClick={() => setMobileMenuOpen(false)}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold ${
                                    isActive('/post-food') ? 'bg-brand-50 text-brand-700' : 'text-slate-700 hover:bg-slate-50'
                                }`}
                            >
                                <PlusSquare className="w-4 h-4 text-brand-600" /> Share Surplus Food
                            </Link>
                            <Link
                                to="/my-listings"
                                onClick={() => setMobileMenuOpen(false)}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold ${
                                    isActive('/my-listings') ? 'bg-brand-50 text-brand-700' : 'text-slate-700 hover:bg-slate-50'
                                }`}
                            >
                                <List className="w-4 h-4 text-slate-400" /> My Food Listings
                            </Link>
                        </>
                    )}

                    {user && (isReceiver || user.role === 'admin') && (
                        <Link
                            to="/my-reservations"
                            onClick={() => setMobileMenuOpen(false)}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold ${
                                isActive('/my-reservations') ? 'bg-brand-50 text-brand-700' : 'text-slate-700 hover:bg-slate-50'
                            }`}
                        >
                            <Heart className="w-4 h-4 text-rose-500" /> My Reservations
                        </Link>
                    )}

                    {user ? (
                        <div className="pt-3 border-t border-slate-100 space-y-2">
                            <Link
                                to="/dashboard"
                                onClick={() => setMobileMenuOpen(false)}
                                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold bg-brand-600 text-white"
                            >
                                <LayoutDashboard className="w-4 h-4" /> Dashboard
                            </Link>
                            <Link
                                to="/profile"
                                onClick={() => setMobileMenuOpen(false)}
                                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50"
                            >
                                <UserIcon className="w-4 h-4 text-slate-400" /> Profile & Impact
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-rose-600 hover:bg-rose-50"
                            >
                                <LogOut className="w-4 h-4" /> Log Out
                            </button>
                        </div>
                    ) : (
                        <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-2">
                            <Link
                                to="/login"
                                onClick={() => setMobileMenuOpen(false)}
                                className="text-center py-2.5 rounded-xl text-sm font-bold text-slate-700 bg-slate-100"
                            >
                                Log In
                            </Link>
                            <Link
                                to="/register"
                                onClick={() => setMobileMenuOpen(false)}
                                className="text-center py-2.5 rounded-xl text-sm font-bold text-white bg-brand-600"
                            >
                                Sign Up
                            </Link>
                        </div>
                    )}
                </div>
            )}
        </nav>
    );
};

export default Navbar;

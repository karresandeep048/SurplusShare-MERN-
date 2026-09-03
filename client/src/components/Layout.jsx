import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { 
    LayoutDashboard, 
    List, 
    Search, 
    ShieldCheck, 
    User, 
    PackagePlus,
    Heart,
    Sparkles,
    ChevronRight,
    MapPin
} from 'lucide-react';
import Navbar from './Navbar';

const Sidebar = () => {
    const { user } = useContext(AuthContext);
    const location = useLocation();

    const supplierLinks = [
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { name: 'Share Food', path: '/post-food', icon: PackagePlus },
        { name: 'My Listings', path: '/my-listings', icon: List },
        { name: 'Reservations', path: '/my-reservations', icon: ShieldCheck },
        { name: 'Profile & Impact', path: '/profile', icon: User },
    ];

    const receiverLinks = [
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { name: 'Find Food', path: '/find-food', icon: Search },
        { name: 'My Reservations', path: '/my-reservations', icon: Heart },
        { name: 'Profile & Impact', path: '/profile', icon: User },
    ];

    const isSupplier = user?.role?.toLowerCase() === 'supplier';
    const links = isSupplier ? supplierLinks : receiverLinks;

    return (
        <aside className="w-64 bg-white border-r border-slate-200/80 hidden md:flex flex-col justify-between shrink-0 sticky top-16 h-[calc(100vh-64px)] z-30">
            <div className="p-4 space-y-6">
                
                {/* User Mini Card */}
                <div className="p-3.5 bg-gradient-to-br from-brand-50 to-emerald-50 rounded-2xl border border-brand-100 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-brand-600 text-white font-bold flex items-center justify-center text-sm shadow-md shadow-brand-500/20 shrink-0">
                        {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-slate-900 truncate">{user?.name || 'User'}</p>
                        <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-white/80 text-brand-700 border border-brand-200">
                            {user?.role}
                        </span>
                    </div>
                </div>

                {/* Navigation Menu */}
                <nav className="space-y-1">
                    {links.map((link) => {
                        const Icon = link.icon;
                        const isActive = location.pathname === link.path;
                        return (
                            <Link
                                key={link.name}
                                to={link.path}
                                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all font-semibold text-sm ${
                                    isActive 
                                        ? 'bg-brand-600 text-white shadow-md shadow-brand-600/20 font-bold' 
                                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                                    <span>{link.name}</span>
                                </div>
                                {isActive && <ChevronRight className="w-3.5 h-3.5 text-white/80" />}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            {/* Sidebar Footer Impact Badge */}
            <div className="p-4 border-t border-slate-100">
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between text-xs">
                    <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Impact Score</span>
                        <span className="font-black text-slate-900 text-sm">{user?.mealsRescued || 0} Meals</span>
                    </div>
                    <div className="p-2 bg-brand-100 text-brand-700 rounded-xl">
                        <Sparkles className="w-4 h-4" />
                    </div>
                </div>
            </div>
        </aside>
    );
};

export const AppLayout = ({ children }) => {
    const { user } = useContext(AuthContext);
    const location = useLocation();
    
    // Check if dashboard layout with sidebar applies
    const isDashboard = ['/dashboard', '/post-food', '/my-listings', '/my-reservations', '/profile'].includes(location.pathname);

    if (isDashboard && user) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col">
                <Navbar />
                <div className="flex flex-1 max-w-7xl w-full mx-auto">
                    <Sidebar />
                    <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 overflow-y-auto">
                        {children}
                    </main>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <Navbar />
            <main className="flex-1">
                {children}
            </main>
        </div>
    );
};

export default AppLayout;

import React, { useContext, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Menu, X, LayoutDashboard, List, Search, Map, Shield, User, LogOut, PackagePlus } from 'lucide-react';
import Navbar from './Navbar';

const Sidebar = () => {
    const { user, logout } = useContext(AuthContext);
    const location = useLocation();

    const supplierLinks = [
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { name: 'Post Food', path: '/post-food', icon: PackagePlus },
        { name: 'My Listings', path: '/my-listings', icon: List },
        { name: 'Reservations', path: '/my-reservations', icon: Shield },
    ];

    const receiverLinks = [
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { name: 'Find Food', path: '/find-food', icon: Search },
        { name: 'My Reservations', path: '/my-reservations', icon: List },
    ];

    const links = user?.role === 'supplier' ? supplierLinks : receiverLinks;

    return (
        <aside className="w-64 bg-white border-r border-gray-200 hidden md:block pt-6 min-h-screen">
            <div className="px-6 mb-8 mt-2 lg:mt-0 lg:mb-10 lg:-mt-16 flex items-center">
                {/* Reserved space if removing navbar from dash, else just padding */}
            </div>
            <nav className="px-4 space-y-1">
                {links.map((link) => {
                    const Icon = link.icon;
                    const isActive = location.pathname === link.path;
                    return (
                        <Link
                            key={link.name}
                            to={link.path}
                            className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all font-medium text-sm ${isActive ? 'bg-brand-50 text-brand-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
                        >
                            <Icon className={`w-5 h-5 ${isActive ? 'text-brand-600' : 'text-gray-400'}`} />
                            <span>{link.name}</span>
                        </Link>
                    )
                })}
            </nav>
        </aside>
    );
};

export const AppLayout = ({ children }) => {
    const { user } = useContext(AuthContext);
    const location = useLocation();
    const isDashboard = ['/dashboard', '/post-food', '/my-listings', '/my-reservations', '/profile'].includes(location.pathname);

    if (isDashboard && user) {
        return (
            <div className="flex bg-gray-50 min-h-screen">
                <Sidebar />
                <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                    <Navbar />
                    <main className="flex-1 overflow-y-auto px-4 py-6 md:px-8">
                        {children}
                    </main>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1">
                {children}
            </main>
        </div>
    );
};

export default AppLayout;

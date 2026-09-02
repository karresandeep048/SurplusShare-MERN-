import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LogOut, User, PlusSquare, Search, List } from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex">
                        <Link to="/" className="flex-shrink-0 flex items-center">
                            <span className="text-2xl font-black text-brand-600 tracking-tight">SurplusShare</span>
                        </Link>
                        <div className="hidden sm:ml-8 sm:flex sm:space-x-8">
                            <Link to="/find-food" className="border-transparent text-gray-600 hover:border-brand-300 hover:text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors">
                                <Search className="w-4 h-4 mr-1.5" /> Find Food
                            </Link>
                            {user && user.role === 'SUPPLIER' && (
                                <>
                                    <Link to="/post-food" className="border-transparent text-gray-600 hover:border-brand-300 hover:text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors">
                                        <PlusSquare className="w-4 h-4 mr-1.5" /> Post Food
                                    </Link>
                                    <Link to="/my-listings" className="border-transparent text-gray-600 hover:border-brand-300 hover:text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors">
                                        <List className="w-4 h-4 mr-1.5" /> My Listings
                                    </Link>
                                </>
                            )}
                            {user && user.role === 'RECEIVER' && (
                                <Link to="/my-reservations" className="border-transparent text-gray-600 hover:border-brand-300 hover:text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors">
                                    <List className="w-4 h-4 mr-1.5" /> My Reservations
                                </Link>
                            )}
                        </div>
                    </div>
                    <div className="hidden sm:flex sm:items-center">
                        {user ? (
                            <div className="flex items-center space-x-6">
                                <Link to="/dashboard" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">Dashboard</Link>
                                <Link to="/profile" className="flex items-center text-sm font-medium text-brand-700 hover:text-brand-800 bg-brand-50 px-3 py-1.5 rounded-full transition-colors font-bold">
                                    <User className="w-4 h-4 mr-1.5" /> {user.name}
                                </Link>
                                <button onClick={handleLogout} className="flex items-center px-4 py-2 border border-transparent rounded-xl shadow-sm text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 transition-colors">
                                    <LogOut className="w-4 h-4 mr-1.5" /> Logout
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center space-x-4">
                                <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">Login</Link>
                                <Link to="/register" className="inline-flex items-center justify-center px-5 py-2 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-brand-600 hover:bg-brand-700 transition-colors">
                                    Sign Up
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;

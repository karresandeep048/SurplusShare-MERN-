import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Leaf, Heart, Shield } from 'lucide-react';

const Home = () => {
    return (
        <div className="bg-white min-h-[calc(100vh-64px)] overflow-hidden">
            <main>
                <div className="relative flex items-center justify-center min-h-[calc(100vh-64px)] px-4 sm:px-6 lg:px-8 py-10 lg:py-0">
                    <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center w-full">

                        <div className="w-full lg:w-1/2 text-center lg:text-left z-10 relative">
                            <div className="absolute -top-10 -left-10 w-20 h-20 bg-brand-100 rounded-full mix-blend-multiply filter blur-2xl opacity-70 animate-blob"></div>
                            <div className="absolute top-20 -right-4 w-20 h-20 bg-green-100 rounded-full mix-blend-multiply filter blur-2xl opacity-70 animate-blob animation-delay-2000"></div>

                            <h1 className="text-5xl font-black text-gray-900 tracking-tight sm:text-7xl mb-2">
                                Save Food.
                            </h1>
                            <h1 className="text-5xl font-black text-brand-600 tracking-tight sm:text-7xl mb-6">
                                Share Good.
                            </h1>
                            <p className="mt-4 text-xl sm:text-2xl text-gray-500 max-w-2xl mx-auto lg:mx-0 mb-10 font-light leading-relaxed">
                                Connect surplus food with people who can use it before it goes to waste.
                            </p>
                            <div className="flex justify-center lg:justify-start flex-col sm:flex-row gap-4 relative z-20">
                                <Link to="/find-food" className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-lg font-medium rounded-xl text-white bg-brand-600 hover:bg-brand-700 transition-all shadow-lg hover:shadow-brand-500/30">
                                    Find Food
                                </Link>
                                <Link to="/post-food" className="inline-flex items-center justify-center px-8 py-4 border-2 border-brand-200 text-lg font-medium rounded-xl text-brand-700 bg-brand-50 hover:bg-brand-100 hover:border-brand-300 transition-all shadow-sm">
                                    Share Surplus Food
                                    <ArrowRight className="ml-2 w-5 h-5" />
                                </Link>
                            </div>
                        </div>

                        <div className="w-full lg:w-1/2 mt-16 lg:mt-0 relative z-0 flex justify-center lg:justify-end">
                            <div className="relative max-w-lg w-full aspect-square">
                                <div className="absolute inset-0 bg-brand-200 rounded-[3rem] transform rotate-3 scale-105 transition-transform duration-500 hover:rotate-6"></div>
                                <img
                                    src="https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=800&auto=format&fit=crop"
                                    alt="Fresh grocery and surplus food"
                                    className="relative w-full h-full object-cover rounded-[3rem] shadow-2xl transition-transform duration-500 hover:-translate-y-2 hover:scale-[1.02]"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Home;

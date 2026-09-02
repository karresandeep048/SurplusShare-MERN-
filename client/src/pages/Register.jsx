import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { 
    Sparkles, 
    Lock, 
    Mail, 
    User, 
    Building2, 
    Heart, 
    ArrowRight, 
    Loader2, 
    AlertCircle, 
    CheckCircle2,
    Eye,
    EyeOff
} from 'lucide-react';

function Register() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'receiver'
    });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const { register } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);
        try {
            await register(formData);
            setSuccess(true);
            setTimeout(() => navigate('/login'), 1500);
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Please check your info.');
            setSubmitting(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4">
                <div className="bg-white p-10 rounded-3xl shadow-xl border border-slate-100 max-w-md w-full text-center animate-fade-in">
                    <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 mb-2">Account Created! 🎉</h2>
                    <p className="text-slate-600 text-sm mb-4">Welcome to the SurplusShare community.</p>
                    <p className="text-xs text-brand-600 font-bold">Redirecting to login...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4 py-12 bg-gradient-to-b from-emerald-50/40 via-white to-slate-50 relative overflow-hidden">
            
            {/* Background Orbs */}
            <div className="absolute -top-24 -left-24 w-80 h-80 bg-brand-200/40 rounded-full filter blur-3xl pointer-events-none"></div>
            <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-emerald-200/40 rounded-full filter blur-3xl pointer-events-none"></div>

            <div className="w-full max-w-md bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8 sm:p-10 relative z-10">
                
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-brand-600 text-white flex items-center justify-center mx-auto mb-3 shadow-md shadow-brand-500/30">
                        <Sparkles className="w-6 h-6" />
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Join SurplusShare</h2>
                    <p className="text-xs font-semibold text-slate-500 mt-1">Start rescuing and sharing food in your area</p>
                </div>

                {error && (
                    <div className="mb-5 p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-2xl flex items-center gap-2 text-xs font-medium animate-fade-in">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    
                    {/* Role Selection Cards */}
                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Select Your Role</label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, role: 'receiver' })}
                                className={`p-3 rounded-2xl border text-left transition-all ${
                                    formData.role === 'receiver' 
                                        ? 'bg-emerald-50 border-brand-500 ring-2 ring-brand-500/20 text-slate-900' 
                                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-white'
                                }`}
                            >
                                <Heart className={`w-5 h-5 mb-1.5 ${formData.role === 'receiver' ? 'text-brand-600 fill-current' : 'text-slate-400'}`} />
                                <h4 className="text-xs font-black">Receiver</h4>
                                <p className="text-[10px] text-slate-500 leading-tight mt-0.5">Find & claim surplus food</p>
                            </button>

                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, role: 'supplier' })}
                                className={`p-3 rounded-2xl border text-left transition-all ${
                                    formData.role === 'supplier' 
                                        ? 'bg-emerald-50 border-brand-500 ring-2 ring-brand-500/20 text-slate-900' 
                                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-white'
                                }`}
                            >
                                <Building2 className={`w-5 h-5 mb-1.5 ${formData.role === 'supplier' ? 'text-brand-600' : 'text-slate-400'}`} />
                                <h4 className="text-xs font-black">Donor / Supplier</h4>
                                <p className="text-[10px] text-slate-500 leading-tight mt-0.5">Donate extra surplus food</p>
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Full Name / Organization</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                <User className="w-4 h-4 text-slate-400" />
                            </div>
                            <input
                                type="text"
                                name="name"
                                required
                                placeholder="Your Name or Business"
                                className="w-full pl-10 pr-4 py-3 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 text-sm font-medium transition-all"
                                value={formData.name}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Email Address</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                <Mail className="w-4 h-4 text-slate-400" />
                            </div>
                            <input
                                type="email"
                                name="email"
                                required
                                placeholder="name@example.com"
                                className="w-full pl-10 pr-4 py-3 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 text-sm font-medium transition-all"
                                value={formData.email}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Password</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                <Lock className="w-4 h-4 text-slate-400" />
                            </div>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                required
                                placeholder="At least 6 characters"
                                className="w-full pl-10 pr-10 py-3 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 text-sm font-medium transition-all"
                                value={formData.password}
                                onChange={handleChange}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                            >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full py-3.5 bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white rounded-xl font-bold text-sm shadow-md shadow-brand-500/20 transition-all flex items-center justify-center gap-2 mt-2"
                    >
                        {submitting ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>Creating Account...</span>
                            </>
                        ) : (
                            <>
                                <span>Create Account</span>
                                <ArrowRight className="w-4 h-4" />
                            </>
                        )}
                    </button>
                </form>

                <p className="mt-6 text-center text-xs font-semibold text-slate-500">
                    Already have an account?{' '}
                    <Link to="/login" className="text-brand-600 hover:underline font-bold">
                        Log in
                    </Link>
                </p>

            </div>
        </div>
    );
}

export default Register;

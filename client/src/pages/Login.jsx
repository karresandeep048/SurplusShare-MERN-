import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { 
    Sparkles, 
    Lock, 
    Mail, 
    ArrowRight, 
    Eye, 
    EyeOff, 
    Loader2, 
    AlertCircle,
    Building2,
    Heart,
    Shield
} from 'lucide-react';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        setSubmitting(true);
        setError(null);
        try {
            await login(email, password);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid email or password.');
        } finally {
            setSubmitting(false);
        }
    };

    // Quick 1-Click Demo Logins
    const handleQuickDemo = async (demoEmail, demoPass = 'password123') => {
        setEmail(demoEmail);
        setPassword(demoPass);
        setSubmitting(true);
        setError(null);
        try {
            await login(demoEmail, demoPass);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Demo login failed. Make sure database is seeded.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4 py-12 bg-gradient-to-b from-emerald-50/40 via-white to-slate-50 relative overflow-hidden">
            
            {/* Background Orbs */}
            <div className="absolute -top-24 -right-24 w-80 h-80 bg-brand-200/40 rounded-full filter blur-3xl pointer-events-none"></div>
            <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-emerald-200/40 rounded-full filter blur-3xl pointer-events-none"></div>

            <div className="w-full max-w-md bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8 sm:p-10 relative z-10">
                
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-brand-600 text-white flex items-center justify-center mx-auto mb-3 shadow-md shadow-brand-500/30">
                        <Sparkles className="w-6 h-6" />
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Welcome Back</h2>
                    <p className="text-xs font-semibold text-slate-500 mt-1">Log in to rescue or share surplus food</p>
                </div>

                {/* Quick 1-Click Demo Buttons */}
                <div className="mb-6 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-2 text-center">
                        ⚡ Quick 1-Click Demo Login
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                        <button
                            type="button"
                            onClick={() => handleQuickDemo('demo.supplier@surplusshare.com')}
                            className="p-2.5 bg-white hover:bg-brand-50 border border-slate-200 hover:border-brand-300 rounded-xl text-xs font-bold text-slate-800 flex items-center justify-center gap-1.5 transition-all shadow-sm"
                        >
                            <Building2 className="w-3.5 h-3.5 text-brand-600" />
                            <span>Supplier Demo</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => handleQuickDemo('demo.receiver@surplusshare.com')}
                            className="p-2.5 bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 rounded-xl text-xs font-bold text-slate-800 flex items-center justify-center gap-1.5 transition-all shadow-sm"
                        >
                            <Heart className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Receiver Demo</span>
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="mb-5 p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-2xl flex items-center gap-2 text-xs font-medium animate-fade-in">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                {/* Main Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Email Address</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                <Mail className="w-4 h-4 text-slate-400" />
                            </div>
                            <input
                                type="email"
                                required
                                placeholder="name@example.com"
                                className="w-full pl-10 pr-4 py-3 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 text-sm font-medium transition-all"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
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
                                required
                                placeholder="••••••••"
                                className="w-full pl-10 pr-10 py-3 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 text-sm font-medium transition-all"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
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
                                <span>Authenticating...</span>
                            </>
                        ) : (
                            <>
                                <span>Sign In</span>
                                <ArrowRight className="w-4 h-4" />
                            </>
                        )}
                    </button>
                </form>

                <p className="mt-6 text-center text-xs font-semibold text-slate-500">
                    Don't have an account yet?{' '}
                    <Link to="/register" className="text-brand-600 hover:underline font-bold">
                        Create an account
                    </Link>
                </p>

            </div>
        </div>
    );
}

export default Login;

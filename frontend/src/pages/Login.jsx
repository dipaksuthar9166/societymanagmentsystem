import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ToastProvider';
import { API_BASE_URL } from '../config';
import { Mail, Lock, Loader2, ArrowRight, Eye, EyeOff, Globe, Zap, ShieldCheck, Users, Building2, Star, CheckCircle } from 'lucide-react';
import { useEventTheme } from '../context/EventThemeContext';
import SEO from '../components/SEO';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const { login } = useAuth();
    const navigate = useNavigate();
    const { showSuccess, showError } = useToast();
    const { activeEvent } = useEventTheme();
    const canvasRef = useRef(null);

    // Mouse tracking for 3D effect
    useEffect(() => {
        const handleMouseMove = (e) => {
            setMousePosition({
                x: (e.clientX / window.innerWidth - 0.5) * 20,
                y: (e.clientY / window.innerHeight - 0.5) * 20
            });
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    // Animated particles canvas
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const particles = [];
        const particleCount = 100;

        class Particle {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.z = Math.random() * 1000;
                this.vx = (Math.random() - 0.5) * 0.5;
                this.vy = (Math.random() - 0.5) * 0.5;
                this.vz = Math.random() * 2;
            }

            update() {
                this.z -= this.vz;
                if (this.z <= 0) {
                    this.z = 1000;
                    this.x = Math.random() * canvas.width;
                    this.y = Math.random() * canvas.height;
                }
            }

            draw() {
                const scale = 1000 / (1000 + this.z);
                const x2d = (this.x - canvas.width / 2) * scale + canvas.width / 2;
                const y2d = (this.y - canvas.height / 2) * scale + canvas.height / 2;
                const size = scale * 2;

                ctx.beginPath();
                ctx.arc(x2d, y2d, size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(129, 140, 248, ${0.4 - this.z / 2500})`;
                ctx.fill();
            }
        }

        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }

        function animate() {
            ctx.fillStyle = 'rgba(15, 23, 42, 0.1)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            particles.forEach(particle => {
                particle.update();
                particle.draw();
            });

            requestAnimationFrame(animate);
        }

        animate();

        const handleResize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        window.addEventListener('resize', handleResize);

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                showSuccess('Login Successful', `Welcome back, ${data.name}!`);
                login(data);
            } else {
                const errorMsg = data.message || 'Invalid credentials';
                setError(errorMsg);
                showError('Login Failed', errorMsg);
                setIsLoading(false);
            }
        } catch (err) {
            const errorMsg = 'Connection failed. Please check your internet connection.';
            setError(errorMsg);
            showError('Connection Error', errorMsg);
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-indigo-950 flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-700">
            <SEO title="Login - Guru Kripa" description="Sign in to your Guru Kripa Society Management Portal" />
            {/* 3D Particle Canvas Background */}
            <canvas
                ref={canvasRef}
                className="absolute inset-0 z-0 opacity-40"
            />

            {/* Animated Grid Background */}
            <div className="absolute inset-0 z-0" style={{
                backgroundImage: `
                    linear-gradient(var(--theme-primary) 1px, transparent 1px),
                    linear-gradient(90deg, var(--theme-primary) 1px, transparent 1px)
                `,
                backgroundSize: '100px 100px',
                opacity: 0.05,
                transform: `perspective(1000px) rotateX(60deg) translateZ(-100px)`
            }}></div>

            {/* Glowing Orbs */}
            <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }}></div>

            <div className="w-full max-w-6xl relative z-10 flex items-center justify-center gap-12">
                {/* Features / Text Section (Nestgate Style) */}
                <div className="hidden lg:flex flex-col justify-center flex-1 max-w-xl">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 mb-8 w-fit shadow-xl shadow-black/20">
                        <CheckCircle size={14} className="text-emerald-400" />
                        <span className="text-xs font-semibold text-indigo-200">Trusted by 50K+ Residents</span>
                        <Star size={14} className="text-blue-400" />
                    </div>

                    <h1 className="text-5xl xl:text-6xl font-black text-white leading-tight tracking-tight mb-6">
                        Welcome Back to <br />
                        <span className="text-[#0066FF]">Guru Kripa</span>
                    </h1>

                    <p className="text-slate-400 text-lg mb-12 leading-relaxed">
                        Access your society dashboard instantly with secure login. No hassle, just quick and safe access to your community.
                    </p>

                    <div className="grid grid-cols-2 gap-4 mb-16">
                        {/* Box 1 */}
                        <div className="bg-[#0b1221] border border-white/5 rounded-2xl p-5 flex items-center gap-4 hover:bg-[#0f172a] transition-all shadow-lg">
                            <div className="w-10 h-10 flex items-center justify-center bg-[#0066FF]/20 rounded-xl shrink-0">
                                <Zap size={18} className="text-[#0066FF]" fill="currentColor" />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-white mb-0.5">Instant Access</h4>
                                <p className="text-[10px] text-slate-500 font-medium">Login in seconds</p>
                            </div>
                        </div>

                        {/* Box 2 */}
                        <div className="bg-[#0b1221] border border-white/5 rounded-2xl p-5 flex items-center gap-4 hover:bg-[#0f172a] transition-all shadow-lg">
                            <div className="w-10 h-10 flex items-center justify-center bg-emerald-500/20 rounded-xl shrink-0">
                                <ShieldCheck size={18} className="text-emerald-400" />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-white mb-0.5">High Security</h4>
                                <p className="text-[10px] text-slate-500 font-medium">Bank-level protection</p>
                            </div>
                        </div>

                        {/* Box 3 */}
                        <div className="bg-[#0b1221] border border-white/5 rounded-2xl p-5 flex items-center gap-4 hover:bg-[#0f172a] transition-all shadow-lg">
                            <div className="w-10 h-10 flex items-center justify-center bg-purple-500/20 rounded-xl shrink-0">
                                <Building2 size={18} className="text-purple-400" />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-white mb-0.5">Society Dashboard</h4>
                                <p className="text-[10px] text-slate-500 font-medium">Full access control</p>
                            </div>
                        </div>

                        {/* Box 4 */}
                        <div className="bg-[#0b1221] border border-white/5 rounded-2xl p-5 flex items-center gap-4 hover:bg-[#0f172a] transition-all shadow-lg">
                            <div className="w-10 h-10 flex items-center justify-center bg-orange-500/20 rounded-xl shrink-0">
                                <Users size={18} className="text-orange-400" fill="currentColor" />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-white mb-0.5">Community</h4>
                                <p className="text-[10px] text-slate-500 font-medium">Stay connected</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-12">
                        <div>
                            <h3 className="text-2xl font-black text-[#0066FF] mb-1">99.9%</h3>
                            <p className="text-xs text-slate-500 font-medium uppercase tracking-widest">Uptime</p>
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-[#0066FF] mb-1">24/7</h3>
                            <p className="text-xs text-slate-500 font-medium uppercase tracking-widest">Support</p>
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-[#0066FF] flex items-center gap-1 mb-1">5 <Star size={20} fill="currentColor" /></h3>
                            <p className="text-xs text-slate-500 font-medium uppercase tracking-widest">Rating</p>
                        </div>
                    </div>
                </div>

                {/* Login Card with 3D Effect */}
                <div
                    className="w-full max-w-md"
                    style={{
                        transform: `perspective(1000px) rotateY(${-mousePosition.x * 0.5}deg) rotateX(${mousePosition.y * 0.5}deg)`,
                        transition: 'transform 0.1s ease-out'
                    }}
                >
                    <div className="bg-indigo-950/40 backdrop-blur-2xl rounded-3xl shadow-2xl overflow-hidden border border-indigo-500/20 transform-gpu transition-all duration-500">
                        {/* Card Glow Effect */}
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-indigo-600/5 pointer-events-none"></div>

                        {/* Header */}
                        <div className="relative pt-10 pb-6 text-center">
                            <h1 className="text-[28px] font-black text-white tracking-tight mb-2">Welcome Back</h1>
                            <p className="text-slate-400 text-sm font-medium">Enter your credentials to securely login</p>
                        </div>

                        {/* Form */}
                        <div className="relative p-8">
                            {/* Error Message */}
                            {error && (
                                <div className="mb-6 p-3 bg-red-500/10 border border-red-500/30 rounded-lg backdrop-blur-sm">
                                    <p className="text-sm font-medium text-red-300">{error}</p>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-5">
                                {/* Email Field */}
                                <div className="group">
                                    <label className="block text-xs font-medium text-slate-400 mb-2 pl-1">
                                        Email / User ID
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Mail size={18} className="text-slate-500 group-focus-within:text-[#0066FF] transition-colors" />
                                        </div>
                                        <input
                                            type="text"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            className="w-full pl-12 pr-4 py-4 bg-[#080d19] border border-[#1e293b] text-white rounded-[1rem] text-sm focus:outline-none focus:ring-1 focus:ring-[#0066FF] focus:border-[#0066FF] transition-all placeholder-slate-600"
                                            placeholder="Enter your email or user ID"
                                        />
                                    </div>
                                </div>

                                <div className="group">
                                    <label className="block text-xs font-medium text-slate-400 mb-2 pl-1">
                                        Password
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Lock size={18} className="text-slate-500 group-focus-within:text-[#0066FF] transition-colors" />
                                        </div>
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            className="w-full pl-12 pr-12 py-4 bg-[#080d19] border border-[#1e293b] text-white rounded-[1rem] text-sm focus:outline-none focus:ring-1 focus:ring-[#0066FF] focus:border-[#0066FF] transition-all placeholder-slate-600"
                                            placeholder="Enter your password"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                                        >
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>

                                {/* Remember & Forgot */}
                                <div className="flex items-center justify-between text-xs font-bold">
                                    <label className="flex items-center gap-2 cursor-pointer group">
                                        <input
                                            type="checkbox"
                                            className="w-4 h-4 rounded border-indigo-500/30 bg-black/30 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                                        />
                                        <span className="text-indigo-300/60 group-hover:text-indigo-300 transition-colors uppercase tracking-wider">
                                            Remember me
                                        </span>
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => navigate('/forgot-password')}
                                        className="text-indigo-400 hover:text-indigo-300 transition-colors uppercase tracking-wider bg-transparent border-none p-0 cursor-pointer"
                                    >
                                        Forgot Password?
                                    </button>
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="relative w-full bg-[#0066FF] hover:bg-blue-600 text-white font-bold py-4 rounded-[1rem] shadow-[0_0_20px_rgba(0,102,255,0.2)] flex items-center justify-center gap-2 transition-all transform hover:-translate-y-1 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none mt-2"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 size={18} className="animate-spin" />
                                            <span>Signing in...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>Sign In</span>
                                            <ArrowRight size={18} />
                                        </>
                                    )}
                                </button>
                            </form>

                            {/* Divider */}
                            <div className="relative my-6">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-indigo-500/10"></div>
                                </div>
                                <div className="relative flex justify-center text-[10px] font-black uppercase tracking-[0.2em]">
                                    <span className="px-3 bg-indigo-950/80 text-indigo-400/50 backdrop-blur-md">Secure Login</span>
                                </div>
                            </div>

                            {/* OTP Login Button */}
                            <button
                                type="button"
                                onClick={() => navigate('/login-otp')}
                                className="w-full bg-black/30 hover:bg-black/50 text-white font-black py-4 rounded-2xl border border-indigo-500/20 flex items-center justify-center gap-3 transition-all active:scale-[0.98] uppercase tracking-widest text-xs"
                            >
                                <Zap size={16} className="text-indigo-400" />
                                <span>Login with OTP</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Custom Animations */}
            <style>{`
            `}</style>
        </div>
    );
};

export default Login;

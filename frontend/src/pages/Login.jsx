import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ToastProvider';
import { API_BASE_URL } from '../config';
import { Mail, Lock, Loader2, ArrowRight, Eye, EyeOff, Globe, Zap } from 'lucide-react';
import { useEventTheme } from '../context/EventThemeContext';

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
                setTimeout(() => login(data), 500);
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
                {/* 3D Globe Section */}
                <div className="hidden lg:flex flex-col items-center justify-center flex-1">
                    <div
                        className="relative"
                        style={{
                            transform: `perspective(1000px) rotateY(${mousePosition.x}deg) rotateX(${-mousePosition.y}deg)`,
                            transition: 'transform 0.1s ease-out'
                        }}
                    >
                        {/* Rotating Globe */}
                        <div className="relative w-80 h-80">
                            {/* Globe Core */}
                            <div className="absolute inset-0 rounded-full bg-[var(--theme-primary)] opacity-10 blur-3xl animate-pulse"></div>

                            {/* Globe Wireframe */}
                            <div className="absolute inset-0 rounded-full border-2 border-indigo-500/20 animate-spin-slow"></div>
                            <div className="absolute inset-4 rounded-full border-2 border-indigo-600/20 animate-spin-slow" style={{ animationDirection: 'reverse' }}></div>
                            <div className="absolute inset-8 rounded-full border-2 border-indigo-400/20 animate-spin-slow"></div>

                            {/* Center Glow */}
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-40 h-40 rounded-full bg-gradient-to-br from-indigo-500/30 to-indigo-600/30 blur-2xl animate-pulse"></div>
                            </div>

                            {/* Globe Icon */}
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-indigo-500 blur-2xl opacity-20 animate-pulse"></div>
                                    <Globe size={80} className="text-white relative z-10 opacity-80" />
                                </div>
                            </div>

                            {/* Orbiting Particles */}
                            {[...Array(8)].map((_, i) => (
                                <div
                                    key={i}
                                    className="absolute w-3 h-3 bg-indigo-400 rounded-full"
                                    style={{
                                        top: '50%',
                                        left: '50%',
                                        animation: `orbit${i % 4} ${4 + i}s linear infinite`,
                                        animationDelay: `${i * 0.5}s`
                                    }}
                                ></div>
                            ))}
                        </div>

                        {/* Floating Text */}
                        <div className="mt-8 text-center">
                            <h2 className="text-3xl font-bold text-white mb-2 animate-pulse">
                                Society Connect
                            </h2>
                            <p className="text-indigo-300 text-lg">
                                Next-Gen Management Platform
                            </p>
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
                        <div className="relative px-8 py-8 border-b border-indigo-500/10">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                                    <Globe size={24} className="text-white" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-black text-white tracking-tight">Sign In</h1>
                                    <p className="text-indigo-300/60 text-xs font-bold uppercase tracking-widest mt-0.5">Management Portal</p>
                                </div>
                            </div>
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
                                    <label className="block text-sm font-semibold text-slate-300 mb-2">
                                        Email Address
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Mail size={18} className="text-indigo-400/50 group-focus-within:text-indigo-400 transition-colors" />
                                        </div>
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            className="w-full pl-12 pr-4 py-4 bg-black/30 border border-indigo-500/20 text-white rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all placeholder-white/30"
                                            placeholder="your.email@example.com"
                                        />
                                    </div>
                                </div>

                                {/* Password Field */}
                                <div className="group">
                                    <label className="block text-xs font-black text-indigo-300 uppercase tracking-widest mb-2 pl-1">
                                        Password
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Lock size={18} className="text-indigo-400/50 group-focus-within:text-indigo-400 transition-colors" />
                                        </div>
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            className="w-full pl-12 pr-12 py-4 bg-black/30 border border-indigo-500/20 text-white rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all placeholder-white/30"
                                            placeholder="Enter your password"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute inset-y-0 right-0 pr-4 flex items-center text-indigo-400/50 hover:text-indigo-400 transition-colors"
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
                                    className="relative w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black py-4 rounded-2xl shadow-xl shadow-indigo-600/20 flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none overflow-hidden group uppercase tracking-widest text-sm"
                                >
                                    {/* Button Shimmer */}
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

                                    {isLoading ? (
                                        <>
                                            <Loader2 size={18} className="animate-spin" />
                                            <span>Signing in...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>Sign In</span>
                                            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
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
                @keyframes spin-slow {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                
                .animate-spin-slow {
                    animation: spin-slow 20s linear infinite;
                }

                @keyframes orbit0 {
                    0% { transform: translate(-50%, -50%) rotate(0deg) translateX(170px) rotate(0deg); }
                    100% { transform: translate(-50%, -50%) rotate(360deg) translateX(170px) rotate(-360deg); }
                }
                
                @keyframes orbit1 {
                    0% { transform: translate(-50%, -50%) rotate(90deg) translateX(170px) rotate(-90deg); }
                    100% { transform: translate(-50%, -50%) rotate(450deg) translateX(170px) rotate(-450deg); }
                }
                
                @keyframes orbit2 {
                    0% { transform: translate(-50%, -50%) rotate(180deg) translateX(170px) rotate(-180deg); }
                    100% { transform: translate(-50%, -50%) rotate(540deg) translateX(170px) rotate(-540deg); }
                }
                
                @keyframes orbit3 {
                    0% { transform: translate(-50%, -50%) rotate(270deg) translateX(170px) rotate(270deg); }
                    100% { transform: translate(-50%, -50%) rotate(630deg) translateX(170px) rotate(-630deg); }
                }
            `}</style>
        </div>
    );
};

export default Login;

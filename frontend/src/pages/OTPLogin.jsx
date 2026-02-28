import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Clock, RefreshCw, Globe, Zap, Loader2, ChevronLeft } from 'lucide-react';
import { useEventTheme } from '../context/EventThemeContext';
import { API_BASE_URL } from '../config';
import { useToast } from '../components/ToastProvider';
import { useAuth } from '../context/AuthContext';

const OTPLogin = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const { showSuccess, showError } = useToast();
    const { activeEvent } = useEventTheme();
    const canvasRef = useRef(null);

    const [step, setStep] = useState(1); // 1: Email, 2: OTP
    const [email, setEmail] = useState('');
    const [otp, setOTP] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [timer, setTimer] = useState(300); // 5 minutes
    const [canResend, setCanResend] = useState(false);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

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
        const particleCount = 80;

        class Particle {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.z = Math.random() * 1000;
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
                ctx.fillStyle = `rgba(129, 140, 248, ${0.3 - this.z / 3000})`;
                ctx.fill();
            }
        }
        for (let i = 0; i < particleCount; i++) particles.push(new Particle());
        function animate() {
            ctx.fillStyle = 'rgba(15, 23, 42, 0.1)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            particles.forEach(p => { p.update(); p.draw(); });
            requestAnimationFrame(animate);
        }
        animate();
        const handleResize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Timer countdown
    useEffect(() => {
        if (step === 2 && timer > 0) {
            const interval = setInterval(() => {
                setTimer(prev => {
                    if (prev <= 1) {
                        setCanResend(true);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [step, timer]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Send OTP
    const sendOTP = async (e) => {
        if (e) e.preventDefault();
        setError('');
        if (!email) { setError('Please enter email'); return; }
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/auth/login-otp/send`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            const data = await res.json();
            if (res.ok) {
                setStep(2);
                setTimer(300);
                setCanResend(false);
                showSuccess('OTP Sent', 'Please check your email.');
            } else {
                setError(data.message || 'Failed to send OTP');
            }
        } catch (error) {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Verify OTP and Login
    const verifyOTP = async (e) => {
        e.preventDefault();
        setError('');
        if (!otp || otp.length !== 6) { setError('Please enter 6-digit OTP'); return; }
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/auth/login-otp/verify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp })
            });
            const data = await res.json();
            if (res.ok) {
                showSuccess('Welcome back!', 'Login successful.');

                // Save token if application expects it separately
                if (data.token) localStorage.setItem('token', data.token);

                // Use the AuthContext login function to update global state and handle navigation
                login(data);
            } else {
                setError(data.message || 'Invalid OTP');
            }
        } catch (error) {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-indigo-950 flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-700">
            {/* 3D Particle Canvas Background */}
            <canvas ref={canvasRef} className="absolute inset-0 z-0 opacity-40" />

            {/* Animated Grid Background */}
            <div className="absolute inset-0 z-0" style={{
                backgroundImage: `linear-gradient(var(--theme-primary) 1px, transparent 1px), linear-gradient(90deg, var(--theme-primary) 1px, transparent 1px)`,
                backgroundSize: '100px 100px',
                opacity: 0.05,
                transform: `perspective(1000px) rotateX(60deg) translateZ(-100px)`
            }}></div>

            {/* Glowing Orbs */}
            <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }}></div>

            <div className="w-full max-w-md relative z-10">
                <div
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
                            <button
                                onClick={() => step === 2 ? setStep(1) : navigate('/login')}
                                className="absolute top-8 right-8 text-indigo-400/50 hover:text-indigo-400 transition-colors"
                            >
                                <ChevronLeft size={24} />
                            </button>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                                    <Zap size={24} className="text-white" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-black text-white tracking-tight">OTP Login</h1>
                                    <p className="text-indigo-300/60 text-xs font-bold uppercase tracking-widest mt-0.5">Secure Authentication</p>
                                </div>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-8">
                            {error && (
                                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl backdrop-blur-sm">
                                    <p className="text-xs font-bold text-red-300 uppercase tracking-wider text-center">{error}</p>
                                </div>
                            )}

                            {step === 1 ? (
                                <form onSubmit={sendOTP} className="space-y-6">
                                    <div className="group">
                                        <label className="block text-xs font-black text-indigo-300 uppercase tracking-widest mb-2 pl-1">
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
                                                className="w-full pl-12 pr-4 py-4 bg-black/30 border border-indigo-500/20 text-white rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all placeholder-white/30 font-medium"
                                                placeholder="your@email.com"
                                            />
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="relative w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black py-4 rounded-2xl shadow-xl shadow-indigo-600/20 flex items-center justify-center gap-3 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 overflow-hidden group uppercase tracking-widest text-sm"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                                        {loading ? <Loader2 className="animate-spin" size={18} /> : <span>Send OTP</span>}
                                        {!loading && <ArrowRight size={18} />}
                                    </button>
                                </form>
                            ) : (
                                <form onSubmit={verifyOTP} className="space-y-6">
                                    <div className="text-center mb-2">
                                        <p className="text-indigo-300/60 text-xs font-bold uppercase tracking-widest">
                                            OTP sent to <span className="text-indigo-300 underline">{email}</span>
                                        </p>
                                    </div>

                                    <div className="group">
                                        <label className="block text-xs font-black text-indigo-300 uppercase tracking-widest mb-2 pl-1">
                                            6-Digit Passcode
                                        </label>
                                        <input
                                            type="text"
                                            value={otp}
                                            onChange={(e) => setOTP(e.target.value.replace(/\D/g, ''))}
                                            placeholder="••••••"
                                            maxLength={6}
                                            className="w-full px-4 py-5 bg-black/30 border border-indigo-500/20 text-white rounded-2xl text-3xl font-black tracking-[0.5em] text-center focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all placeholder-white/10"
                                            required
                                        />
                                    </div>

                                    <div className="flex items-center justify-center gap-2 text-xs font-black text-indigo-400/60 tracking-widest uppercase">
                                        <Clock size={14} />
                                        <span>Expires in {formatTime(timer)}</span>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="relative w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black py-4 rounded-2xl shadow-xl shadow-indigo-600/20 flex items-center justify-center gap-3 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 overflow-hidden group uppercase tracking-widest text-sm"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                                        {loading ? <Loader2 className="animate-spin" size={18} /> : <span>Verify & Login</span>}
                                        {!loading && <Lock size={18} />}
                                    </button>

                                    <button
                                        type="button"
                                        onClick={sendOTP}
                                        disabled={!canResend || loading}
                                        className="w-full flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-indigo-400/50 hover:text-indigo-400 transition-colors disabled:opacity-30"
                                    >
                                        <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
                                        {canResend ? 'Resend OTP' : `Resend in ${formatTime(timer)}`}
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OTPLogin;

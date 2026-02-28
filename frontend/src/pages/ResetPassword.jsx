import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useToast } from '../components/ToastProvider';
import { API_BASE_URL } from '../config';
import { Lock, Loader2, ArrowRight, Eye, EyeOff, Globe, ArrowLeft } from 'lucide-react';

const ResetPassword = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const navigate = useNavigate();
    const { resetToken } = useParams();
    const { showSuccess, showError } = useToast();
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

        if (password !== confirmPassword) {
            showError('Mismatch', 'Passwords do not match');
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch(`${API_BASE_URL}/auth/resetpassword/${resetToken}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password }),
            });

            const data = await response.json();

            if (response.ok) {
                showSuccess('Success', 'Password reset successful. You can now login.');
                setTimeout(() => navigate('/login'), 2000);
            } else {
                showError('Error', data.message || 'Something went wrong');
            }
        } catch (err) {
            showError('Connection Error', 'Failed to connect to the server.');
        } finally {
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

            <div className="w-full max-w-6xl relative z-10 flex items-center justify-center gap-12">
                {/* 3D Globe Section - Hidden on small screens */}
                <div className="hidden lg:flex flex-col items-center justify-center flex-1">
                    <div
                        className="relative"
                        style={{
                            transform: `perspective(1000px) rotateY(${mousePosition.x}deg) rotateX(${-mousePosition.y}deg)`,
                            transition: 'transform 0.1s ease-out'
                        }}
                    >
                        {/* Globe (Simplified from Login) */}
                        <div className="relative w-80 h-80">
                            <div className="absolute inset-0 rounded-full bg-[var(--theme-primary)] opacity-10 blur-3xl animate-pulse"></div>
                            <div className="absolute inset-0 rounded-full border-2 border-indigo-500/20 animate-spin-slow"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Globe size={80} className="text-white relative z-10 opacity-80" />
                            </div>
                        </div>

                        <div className="mt-8 text-center">
                            <h2 className="text-3xl font-bold text-white mb-2 animate-pulse">
                                Reset Password
                            </h2>
                            <p className="text-indigo-300 text-lg">
                                Enter your new password to secure your account.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Form Card */}
                <div
                    className="w-full max-w-md"
                    style={{
                        transform: `perspective(1000px) rotateY(${-mousePosition.x * 0.5}deg) rotateX(${mousePosition.y * 0.5}deg)`,
                        transition: 'transform 0.1s ease-out'
                    }}
                >
                    <div className="bg-indigo-950/40 backdrop-blur-2xl rounded-3xl shadow-2xl overflow-hidden border border-indigo-500/20 transform-gpu transition-all duration-500">
                        {/* Header */}
                        <div className="relative px-8 py-8 border-b border-indigo-500/10">
                            <div className="flex items-center gap-3 mb-2">
                                <button onClick={() => navigate('/login')} className="p-2 -ml-2 hover:bg-white/5 rounded-full transition-colors">
                                    <ArrowLeft size={20} className="text-white" />
                                </button>
                                <div>
                                    <h1 className="text-2xl font-black text-white tracking-tight">Set New Password</h1>
                                    <p className="text-indigo-300/60 text-xs font-bold uppercase tracking-widest mt-0.5">Secure Your Account</p>
                                </div>
                            </div>
                        </div>

                        {/* Form */}
                        <div className="relative p-8">
                            <form onSubmit={handleSubmit} className="space-y-5">
                                {/* Password Field */}
                                <div className="group">
                                    <label className="block text-xs font-black text-indigo-300 uppercase tracking-widest mb-2 pl-1">
                                        New Password
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
                                            placeholder="Enter new password"
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

                                {/* Confirm Password Field */}
                                <div className="group">
                                    <label className="block text-xs font-black text-indigo-300 uppercase tracking-widest mb-2 pl-1">
                                        Confirm Password
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Lock size={18} className="text-indigo-400/50 group-focus-within:text-indigo-400 transition-colors" />
                                        </div>
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            required
                                            className="w-full pl-12 pr-12 py-4 bg-black/30 border border-indigo-500/20 text-white rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all placeholder-white/30"
                                            placeholder="Confirm new password"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="relative w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black py-4 rounded-2xl shadow-xl shadow-indigo-600/20 flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed group uppercase tracking-widest text-sm"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 size={18} className="animate-spin" />
                                            <span>Resetting...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>Reset Password</span>
                                            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
            <style>{`
                @keyframes spin-slow {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .animate-spin-slow {
                    animation: spin-slow 20s linear infinite;
                }
            `}</style>
        </div>
    );
};

export default ResetPassword;

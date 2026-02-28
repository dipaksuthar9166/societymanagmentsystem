
import React, { useEffect, useRef } from 'react';
import { useEventTheme } from '../context/EventThemeContext';
import confetti from 'canvas-confetti';
import Snowfall from 'react-snowfall';

// New Year Fireworks Setup
const fireWorks = () => {
    const duration = 15 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    const randomInRange = (min, max) => Math.random() * (max - min) + min;

    const interval = setInterval(function () {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
            return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        // since particles fall down, start a bit higher than random
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 250);
};

// Tricolor Confetti (Republic/Independence Day)
// Tricolor Confetti (Republic/Independence Day) - Gentle Loop
const tricolorConfetti = () => {
    // Initial Burst
    const duration = 3000;
    const end = Date.now() + duration;

    (function frame() {
        confetti({
            particleCount: 3,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            colors: ['#FF9933', '#FFFFFF', '#138808'] // Saffron, White, Green
        });
        confetti({
            particleCount: 3,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
            colors: ['#FF9933', '#FFFFFF', '#138808']
        });

        if (Date.now() < end) {
            requestAnimationFrame(frame);
        }
    }());

    // Ongoing gentle loop
    const interval = setInterval(() => {
        // Random bursts from sides
        confetti({
            particleCount: 20,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            colors: ['#FF9933', '#FFFFFF', '#138808']
        });
        confetti({
            particleCount: 20,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
            colors: ['#FF9933', '#FFFFFF', '#138808']
        });
    }, 4000); // Every 4 seconds

    return interval; // Return for cleanup
};

const DynamicEventBackground = () => {
    const { activeEvent } = useEventTheme();

    useEffect(() => {
        if (!activeEvent) return;

        if (activeEvent.animation === 'fireworks') {
            fireWorks();
        } else if (activeEvent.animation === 'tricolor-confetti' || activeEvent.animation === 'tricolor-flag') {
            const interval = tricolorConfetti();
            return () => clearInterval(interval);
        } else if (activeEvent.animation === 'color-splash') {
            // Holi Splash Logic
            const end = Date.now() + (5 * 1000);
            (function frame() {
                confetti({
                    particleCount: 5,
                    angle: 90,
                    spread: 90,
                    origin: { x: 0.5, y: 0.5 },
                    colors: ['#FF00FF', '#00FFFF', '#FFFF00', '#FF0000', '#00FF00']
                });
                if (Date.now() < end) requestAnimationFrame(frame);
            }());
        }
    }, [activeEvent]);

    if (!activeEvent) return null;

    return (
        <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">

            {/* --- Diwali: Sparkling Particles --- */}
            {activeEvent.animation === 'diyas-sparkle' && (
                <div className="absolute inset-0">
                    <div className="absolute top-10 left-1/4 animate-pulse opacity-30">✨</div>
                    <div className="absolute bottom-20 right-1/3 animate-pulse opacity-40">✨</div>
                </div>
            )}

            {/* --- Christmas: Snowfall --- */}
            {activeEvent.animation === 'snowfall' && (
                <Snowfall
                    color="#dee4fd"
                    snowflakeCount={80}
                    style={{ position: 'fixed', width: '100vw', height: '100vh', zIndex: 9999 }}
                />
            )}

            {/* --- Patriotic Overlay (Subtle) --- */}
            {(activeEvent.animation === 'tricolor-confetti' || activeEvent.animation === 'tricolor-flag') && (
                <div className="absolute top-0 w-full h-[1px] bg-gradient-to-r from-orange-500 via-white to-green-600"></div>
            )}

            {/* --- Gandhi Jayanti: Minimal --- */}
            {activeEvent.animation === 'peace-symbols' && (
                <div className="absolute bottom-10 right-10 opacity-10 animate-spin-slow">
                    <span className="text-6xl">☸️</span>
                </div>
            )}

            <style>{`
                @keyframes float-slow {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-20px); }
                }
                .animate-float-slow {
                    animation: float-slow 4s ease-in-out infinite;
                }
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

export default DynamicEventBackground;

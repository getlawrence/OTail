import React, { useEffect, useState } from 'react';

interface ConfettiProps {
    onComplete?: () => void;
}

const colors = [
    '#FFD700', // Gold
    '#FF69B4', // Hot Pink
    '#00FF00', // Lime
    '#4169E1', // Royal Blue
    '#FF4500', // Orange Red
    '#9370DB', // Medium Purple
    '#20B2AA', // Light Sea Green
    '#FF1493', // Deep Pink
    '#32CD32', // Lime Green
    '#FFA500', // Orange
];

const Confetti: React.FC<ConfettiProps> = ({ onComplete }) => {
    const [particles, setParticles] = useState<Array<{
        id: number;
        color: string;
        left: number;
        animationDuration: number;
        rotation: number;
        size: number;
    }>>([]);

    useEffect(() => {
        // Create 50 particles with random properties
        const newParticles = Array.from({ length: 50 }, (_, index) => ({
            id: index,
            color: colors[Math.floor(Math.random() * colors.length)],
            left: Math.random() * 100, // Random starting position
            animationDuration: 1 + Math.random() * 1, // Random duration between 1-2s
            rotation: Math.random() * 360, // Random rotation
            size: 8 + Math.random() * 8, // Random size between 8-16px
        }));

        setParticles(newParticles);

        // Call onComplete after the longest animation duration
        const maxDuration = Math.max(...newParticles.map(p => p.animationDuration));
        const timeout = setTimeout(() => {
            onComplete?.();
        }, maxDuration * 1000);

        return () => clearTimeout(timeout);
    }, [onComplete]);

    return (
        <>
            <style>
                {`
                    @keyframes fall {
                        0% {
                            transform: translateY(-100vh) rotate(0deg);
                            opacity: 1;
                        }
                        100% {
                            transform: translateY(100vh) rotate(360deg);
                            opacity: 0;
                        }
                    }
                `}
            </style>
            <div className="fixed inset-0 pointer-events-none z-50">
                {particles.map(particle => (
                    <div
                        key={particle.id}
                        className="absolute w-2 h-2"
                        style={{
                            left: `${particle.left}%`,
                            backgroundColor: particle.color,
                            transform: `rotate(${particle.rotation}deg)`,
                            width: `${particle.size}px`,
                            height: `${particle.size}px`,
                            animation: `fall ${particle.animationDuration}s ease-out forwards`,
                        }}
                    />
                ))}
            </div>
        </>
    );
};

export default Confetti; 
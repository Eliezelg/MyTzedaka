'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, useAnimation, useInView, AnimatePresence } from 'framer-motion';
import { 
  Heart, Star, Gift, Sparkles, TrendingUp, 
  Check, Plus, Minus, X, ChevronUp
} from 'lucide-react';

// Animated Counter Component
export const AnimatedCounter: React.FC<{
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}> = ({ value, duration = 2, prefix = '', suffix = '', className = '' }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView) {
      let start = 0;
      const end = value;
      const increment = end / (duration * 60);
      
      const timer = setInterval(() => {
        start += increment;
        if (start >= end) {
          setCount(end);
          clearInterval(timer);
        } else {
          setCount(Math.floor(start));
        }
      }, 1000 / 60);
      
      return () => clearInterval(timer);
    }
  }, [value, duration, isInView]);

  return (
    <span ref={ref} className={className}>
      {prefix}{count.toLocaleString()}{suffix}
    </span>
  );
};

// Floating Hearts Animation
export const FloatingHearts: React.FC = () => {
  const [hearts, setHearts] = useState<Array<{ id: number; x: number }>>([]);

  const addHeart = () => {
    const newHeart = {
      id: Date.now(),
      x: Math.random() * 100
    };
    setHearts(prev => [...prev, newHeart]);
    setTimeout(() => {
      setHearts(prev => prev.filter(h => h.id !== newHeart.id));
    }, 3000);
  };

  return (
    <div className="relative">
      <button
        onClick={addHeart}
        className="relative z-10 p-4 bg-gradient-to-r from-[#334e68] to-[#048271] text-white rounded-full hover:scale-110 transition-transform duration-300"
      >
        <Heart className="w-6 h-6" />
      </button>
      
      <AnimatePresence>
        {hearts.map(heart => (
          <motion.div
            key={heart.id}
            initial={{ y: 0, opacity: 1, scale: 0 }}
            animate={{ 
              y: -200, 
              opacity: 0, 
              scale: [0, 1.5, 1],
              x: [0, Math.random() * 40 - 20, Math.random() * 60 - 30]
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 3, ease: "easeOut" }}
            className="absolute pointer-events-none"
            style={{ left: `${heart.x}%` }}
          >
            <Heart className="w-8 h-8 text-red-500 fill-red-500" />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

// Progress Bar with Celebration
export const CelebrationProgress: React.FC<{
  value: number;
  max: number;
  showConfetti?: boolean;
}> = ({ value, max, showConfetti = true }) => {
  const percentage = (value / max) * 100;
  const [celebrated, setCelebrated] = useState(false);
  
  useEffect(() => {
    if (percentage >= 100 && !celebrated && showConfetti) {
      setCelebrated(true);
      // Trigger confetti animation
      const colors = ['#17b897', '#048271', '#334e68', '#5fe3c0'];
      const confettiCount = 50;
      
      for (let i = 0; i < confettiCount; i++) {
        setTimeout(() => {
          createConfettiParticle(colors[Math.floor(Math.random() * colors.length)]);
        }, i * 30);
      }
    }
  }, [percentage, celebrated, showConfetti]);

  const createConfettiParticle = (color: string) => {
    const particle = document.createElement('div');
    particle.style.position = 'fixed';
    particle.style.width = '10px';
    particle.style.height = '10px';
    particle.style.backgroundColor = color;
    particle.style.left = Math.random() * window.innerWidth + 'px';
    particle.style.top = '-10px';
    particle.style.zIndex = '9999';
    particle.style.transform = `rotate(${Math.random() * 360}deg)`;
    document.body.appendChild(particle);
    
    let position = -10;
    let rotation = Math.random() * 360;
    const gravity = 0.5;
    let velocity = Math.random() * 3 + 2;
    
    const fall = () => {
      position += velocity;
      velocity += gravity;
      rotation += 5;
      particle.style.top = position + 'px';
      particle.style.transform = `rotate(${rotation}deg)`;
      
      if (position < window.innerHeight) {
        requestAnimationFrame(fall);
      } else {
        particle.remove();
      }
    };
    
    requestAnimationFrame(fall);
  };

  return (
    <div className="relative">
      <div className="flex justify-between text-sm mb-2">
        <span className="text-[#627d98]">Progression</span>
        <span className="font-bold text-[#243b53]">{percentage.toFixed(0)}%</span>
      </div>
      <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(percentage, 100)}%` }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute h-full bg-gradient-to-r from-[#17b897] to-[#048271]"
        >
          {percentage >= 100 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="absolute right-2 top-1/2 -translate-y-1/2"
            >
              <Sparkles className="w-3 h-3 text-white" />
            </motion.div>
          )}
        </motion.div>
      </div>
      {percentage >= 100 && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mt-2 text-sm font-semibold text-[#17b897]"
        >
          Objectif atteint ! 🎉
        </motion.p>
      )}
    </div>
  );
};

// Ripple Button
export const RippleButton: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: 'primary' | 'secondary' | 'outline';
}> = ({ children, onClick, className = '', variant = 'primary' }) => {
  const [ripples, setRipples] = useState<Array<{ x: number; y: number; id: number }>>([]);

  const createRipple = (event: React.MouseEvent<HTMLButtonElement>) => {
    const button = event.currentTarget;
    const rect = button.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const id = Date.now();
    
    setRipples(prev => [...prev, { x, y, id }]);
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== id));
    }, 600);
  };

  const baseStyles = "relative overflow-hidden px-6 py-3 font-semibold rounded-lg transition-all duration-300";
  const variantStyles = {
    primary: "bg-gradient-to-r from-[#334e68] to-[#048271] text-white hover:shadow-lg",
    secondary: "bg-[#17b897] text-white hover:bg-[#079a82]",
    outline: "border-2 border-[#17b897] text-[#17b897] hover:bg-[#17b897] hover:text-white"
  };

  return (
    <button
      onClick={(e) => {
        createRipple(e);
        onClick && onClick();
      }}
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
    >
      {children}
      {ripples.map(ripple => (
        <span
          key={ripple.id}
          className="absolute bg-white/30 rounded-full pointer-events-none animate-ripple"
          style={{
            left: ripple.x,
            top: ripple.y,
            animation: 'ripple 600ms ease-out'
          }}
        />
      ))}
      <style jsx>{`
        @keyframes ripple {
          from {
            width: 0;
            height: 0;
            opacity: 1;
            transform: translate(-50%, -50%);
          }
          to {
            width: 300px;
            height: 300px;
            opacity: 0;
            transform: translate(-50%, -50%);
          }
        }
      `}</style>
    </button>
  );
};

// Skeleton Loader with Shimmer
export const ShimmerSkeleton: React.FC<{
  width?: string;
  height?: string;
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
}> = ({ width = '100%', height = '20px', className = '', variant = 'rectangular' }) => {
  const variantStyles = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg'
  };

  return (
    <div
      className={`relative overflow-hidden bg-gray-200 ${variantStyles[variant]} ${className}`}
      style={{ width, height }}
    >
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      <style jsx>{`
        @keyframes shimmer {
          100% {
            transform: translateX(100%);
          }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  );
};

// Animated Success Checkmark
export const SuccessAnimation: React.FC<{ show: boolean }> = ({ show }) => {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.2, 1] }}
            transition={{ duration: 0.5, times: [0, 0.6, 1] }}
            className="w-32 h-32 bg-white rounded-full shadow-2xl flex items-center justify-center"
          >
            <motion.div
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Check className="w-16 h-16 text-[#0e9f6e]" strokeWidth={3} />
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Magnetic Hover Card
export const MagneticCard: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) / 10;
    const y = (e.clientY - rect.top - rect.height / 2) / 10;
    setMousePosition({ x, y });
  };

  const handleMouseLeave = () => {
    setMousePosition({ x: 0, y: 0 });
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{
        x: mousePosition.x,
        y: mousePosition.y,
        rotateX: mousePosition.y / 2,
        rotateY: -mousePosition.x / 2
      }}
      transition={{ type: "spring", stiffness: 150, damping: 15 }}
      style={{ transformStyle: 'preserve-3d' }}
      className={`bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300 ${className}`}
    >
      {children}
    </motion.div>
  );
};

// Scroll Progress Indicator
export const ScrollProgress: React.FC = () => {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (window.scrollY / totalHeight) * 100;
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 h-1 bg-gray-200 z-50">
      <motion.div
        className="h-full bg-gradient-to-r from-[#17b897] to-[#048271]"
        style={{ width: `${scrollProgress}%` }}
        initial={{ width: 0 }}
        animate={{ width: `${scrollProgress}%` }}
        transition={{ ease: "linear" }}
      />
    </div>
  );
};

// Floating Action Button with Menu
export const FABMenu: React.FC<{
  items: Array<{ icon: React.ElementType; label: string; onClick: () => void }>;
}> = ({ items }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-8 right-8 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div className="absolute bottom-16 right-0 space-y-3">
            {items.map((item, index) => (
              <motion.button
                key={index}
                initial={{ opacity: 0, y: 20, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.8 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => {
                  item.onClick();
                  setIsOpen(false);
                }}
                className="flex items-center gap-3 px-4 py-3 bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow whitespace-nowrap"
              >
                <item.icon className="w-5 h-5 text-[#17b897]" />
                <span className="text-sm font-medium text-[#102a43]">{item.label}</span>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        animate={{ rotate: isOpen ? 45 : 0 }}
        className="w-14 h-14 bg-gradient-to-r from-[#334e68] to-[#048271] text-white rounded-full shadow-lg hover:shadow-xl transition-shadow flex items-center justify-center"
      >
        <Plus className="w-6 h-6" />
      </motion.button>
    </div>
  );
};

// Notification Toast
export const Toast: React.FC<{
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  show: boolean;
  onClose: () => void;
}> = ({ message, type, show, onClose }) => {
  const icons = {
    success: Check,
    error: X,
    warning: '⚠️',
    info: 'ℹ️'
  };

  const colors = {
    success: 'from-green-500 to-green-600',
    error: 'from-red-500 to-red-600',
    warning: 'from-yellow-500 to-yellow-600',
    info: 'from-blue-500 to-blue-600'
  };

  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ x: 300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 300, opacity: 0 }}
          className="fixed top-4 right-4 z-50"
        >
          <div className={`flex items-center gap-3 px-6 py-4 bg-gradient-to-r ${colors[type]} text-white rounded-lg shadow-lg`}>
            {type === 'success' && <Check className="w-5 h-5" />}
            {type === 'error' && <X className="w-5 h-5" />}
            <span className="font-medium">{message}</span>
            <button onClick={onClose} className="ml-4">
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default {
  AnimatedCounter,
  FloatingHearts,
  CelebrationProgress,
  RippleButton,
  ShimmerSkeleton,
  SuccessAnimation,
  MagneticCard,
  ScrollProgress,
  FABMenu,
  Toast
};
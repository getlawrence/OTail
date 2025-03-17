import React, { useState, useEffect } from 'react';
import { Monitor, Smartphone } from 'lucide-react';

export const MobileWarning: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    // Check if the device is mobile using window width
    const checkIfMobile = () => {
      return window.innerWidth <= 768; // Standard mobile breakpoint
    };

    const handleResize = () => {
      setIsVisible(checkIfMobile());
    };

    // Initial check
    setIsVisible(checkIfMobile());

    // Add resize listener
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-white flex items-center justify-center p-4 overflow-hidden animate-fade-in">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-white opacity-50"></div>
      <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center relative">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 animate-slide-up">
          <div className="mb-10">
            <div className="flex items-center justify-center gap-8 mb-8">
              <div className="flex flex-col items-center transform transition-transform hover:scale-110">
                <Smartphone className="w-14 h-14 text-gray-400" />
                <span className="text-sm font-medium text-gray-500 mt-2">Mobile</span>
              </div>
              <div className="text-gray-300 text-2xl">→</div>
              <div className="flex flex-col items-center transform transition-transform hover:scale-110">
                <Monitor className="w-14 h-14 text-blue-600" />
                <span className="text-sm font-medium text-blue-600 mt-2">Desktop</span>
              </div>
            </div>
            <div className="space-y-4">
              <p className="text-gray-700 text-lg leading-relaxed">
                OTail is designed exclusively for desktop use and cannot function properly on mobile devices.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Please access OTail from a computer to use all features.
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsVisible(false)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 text-lg shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
          >
            I Understand, Continue Anyway
          </button>
        </div>
      </div>
    </div>
  );
}; 
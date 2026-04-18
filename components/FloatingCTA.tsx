
import React, { useEffect, useState } from 'react';
import { Phone, MessageCircle } from 'lucide-react';

export const FloatingCTA: React.FC = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > window.innerHeight * 0.85);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div
      className={`fixed bottom-28 md:bottom-24 right-5 z-40 flex flex-col gap-3 transition-all duration-500 mb-16 md:mb-0 ${
        visible
          ? 'translate-y-0 opacity-100'
          : 'translate-y-12 opacity-0 pointer-events-none'
      }`}
      style={{ transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)' }}
    >
      {/* SMS / Text */}
      <a
        href="sms:+13213759685"
        aria-label="Text (321) 375-9685"
        className="group flex items-center justify-center w-14 h-14 rounded-full bg-brand-teal text-white shadow-lg hover:scale-110 active:scale-95 transition-transform"
      >
        <MessageCircle size={24} className="drop-shadow" />
      </a>

      {/* Phone Call */}
      <a
        href="tel:+13213759685"
        aria-label="Call (321) 375-9685"
        className="group flex items-center justify-center w-14 h-14 rounded-full bg-brand-teal text-white shadow-lg hover:scale-110 active:scale-95 transition-transform floating-cta-pulse"
      >
        <Phone size={24} className="drop-shadow" />
      </a>
    </div>
  );
};

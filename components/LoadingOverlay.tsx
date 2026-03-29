
import React, { useEffect, useState } from 'react';
import { Sprout, Palette, PenTool, LayoutTemplate, Loader2 } from 'lucide-react';

const STEPS = [
  { icon: Sprout, label: "Analyzing Market Landscape", detail: "Scanning industry trends & competitors..." },
  { icon: PenTool, label: "Defining Core Identity", detail: "Crafting mission, vision & values..." },
  { icon: Palette, label: "Synthesizing Visual Language", detail: "Selecting typography & color psychology..." },
  { icon: PenTool, label: "Drafting Brand Voice", detail: "Generating taglines & communication style..." },
  { icon: LayoutTemplate, label: "Designing Marketing Assets", detail: "Creating social posts & ad concepts..." },
  { icon: LayoutTemplate, label: "Finalizing Brand Package", detail: "Assembling your unique strategy..." },
];

export const LoadingOverlay = () => {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    // Simulate progress through steps
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev < STEPS.length - 1 ? prev + 1 : prev));
    }, 1500); // Change step every 1.5 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-black/40 backdrop-blur-xl transition-all duration-500">
      <div className="bg-white/95 p-8 rounded-3xl shadow-2xl max-w-md w-full mx-4 border-2 border-white relative overflow-hidden">
        {/* Animated Background Blob */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-brand-teal rounded-full blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-brand-lavender rounded-full blur-3xl opacity-20 animate-pulse delay-700"></div>

        <div className="relative z-10">
          <h2 className="text-2xl font-serif font-bold text-brand-black mb-8 text-center">Growing Your Brand</h2>
          
          <div className="space-y-4">
            {STEPS.map((step, index) => {
              const Icon = step.icon;
              const isActive = index === currentStep;
              const isCompleted = index < currentStep;

              return (
                <div 
                  key={index} 
                  className={`flex items-center gap-4 transition-all duration-500 ${
                    isActive ? 'scale-105 opacity-100' : isCompleted ? 'opacity-50 blur-[0.5px]' : 'opacity-30'
                  }`}
                >
                  <div className={`
                    p-3 rounded-xl transition-colors duration-500
                    ${isActive ? 'bg-brand-black text-white shadow-lg' : isCompleted ? 'bg-brand-teal/20 text-brand-teal' : 'bg-stone-100 text-stone-400'}
                  `}>
                    {isActive ? <Icon size={20} className="animate-bounce" /> : isCompleted ? <CheckMark /> : <Icon size={20} />}
                  </div>
                  <div>
                    <p className={`font-bold text-sm ${isActive ? 'text-brand-black' : 'text-stone-600'}`}>
                      {step.label}
                    </p>
                    <p className="text-xs text-stone-500 h-4">
                      {isActive && <span className="animate-pulse">{step.detail}</span>}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-8 pt-6 border-t border-stone-100 flex items-center justify-center gap-2 text-xs text-stone-400 font-mono">
            <Loader2 size={12} className="animate-spin text-brand-lavender" />
            AI GENERATION IN PROGRESS
          </div>
        </div>
      </div>
    </div>
  );
};

const CheckMark = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
  </svg>
);


import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, ChevronRight, ChevronLeft, Sparkles, 
  Layers, Film, Package, Briefcase, Play,
  CheckCircle2, MousePointer2, Info
} from 'lucide-react';

interface TutorialStep {
  id: string;
  title: string;
  description: string;
  tab: 'identity' | 'marketing' | 'packages' | 'management';
  tip: string;
  icon: React.ReactNode;
}

const steps: TutorialStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to XELA Creative Branding Studio',
    description: 'I am Xela, your elite AI creative consultant. I am here to guide you through the process of launching your legacy. We will build your identity, marketing, and legal foundation in 4 easy steps.',
    tab: 'identity',
    tip: 'Think of this as your business "Cake" - we are mixing the best ingredients.',
    icon: <Sparkles className="text-brand-lavender" size={32} />
  },
  {
    id: 'identity',
    title: 'Step 1: Identity Studio',
    description: 'This is where we define your brand catchphrases, mission, and visual logo. We use the Golden Ratio to ensure artistic balance.',
    tab: 'identity',
    tip: 'Try regenerating taglines until you find the one that "feels" like home.',
    icon: <Layers className="text-brand-teal" size={32} />
  },
  {
    id: 'marketing',
    title: 'Step 2: Ad Integration',
    description: 'We generate AI-powered video concepts, scripts, and social media profiles. This is your "Marketing Engine".',
    tab: 'marketing',
    tip: 'Review the hook-driven scripts; they are engineered for high-conversion.',
    icon: <Film className="text-brand-lavender" size={32} />
  },
  {
    id: 'packages',
    title: 'Step 3: Elite Packages',
    description: 'Choose from 10+ comprehensive packages. Each includes a Florida-compliant legitimacy checklist and a full budget breakdown.',
    tab: 'packages',
    tip: 'The "Registered Rebellion" package is perfect if you need help with Sunbiz and EIN.',
    icon: <Package className="text-brand-teal" size={32} />
  },
  {
    id: 'management',
    title: 'Step 4: Business Hub',
    description: 'Track your growth, inventory, and legal compliance. This is your mission control center.',
    tab: 'management',
    tip: 'Keep your legitimacy checklist updated to stay compliant in Florida.',
    icon: <Briefcase className="text-brand-lavender" size={32} />
  },
  {
    id: 'finalize',
    title: 'Ready to Launch?',
    description: 'Once you are satisfied with the results, click "Finalize & Complete Purchase" to receive your assets and start production.',
    tab: 'identity',
    tip: 'Remember our 100% Satisfaction Protocol - we refine until it is perfect.',
    icon: <CheckCircle2 className="text-green-500" size={32} />
  }
];

interface StudioTutorialProps {
  onClose: () => void;
  onTabChange: (tab: 'identity' | 'marketing' | 'packages' | 'management') => void;
}

export const StudioTutorial: React.FC<StudioTutorialProps> = ({ onClose, onTabChange }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      onTabChange(steps[nextStep].tab);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      onTabChange(steps[prevStep].tab);
    }
  };

  const step = steps[currentStep];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-brand-black/80 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white rounded-[3rem] shadow-2xl max-w-2xl w-full overflow-hidden border-4 border-brand-lavender"
      >
        <div className="p-8 md:p-12 space-y-8">
          <div className="flex justify-between items-start">
            <div className="p-4 bg-stone-50 rounded-2xl">
              {step.icon}
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-stone-100 rounded-full transition-colors"
            >
              <X size={24} className="text-stone-400" />
            </button>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-brand-lavender text-white text-[10px] font-black uppercase tracking-widest rounded-full">
                Step {currentStep + 1} of {steps.length}
              </span>
              <span className="text-[10px] font-black uppercase tracking-widest text-stone-400">
                Studio Tutorial
              </span>
            </div>
            <h2 className="text-4xl font-serif font-black text-brand-black leading-tight">
              {step.title}
            </h2>
            <p className="text-stone-600 text-lg leading-relaxed">
              {step.description}
            </p>
          </div>

          <div className="p-6 bg-brand-teal/5 rounded-2xl border border-brand-teal/10 flex items-start gap-4">
            <Info className="text-brand-teal shrink-0 mt-1" size={20} />
            <p className="text-sm font-bold text-brand-teal leading-snug italic">
              Pro Tip: {step.tip}
            </p>
          </div>

          <div className="flex items-center justify-between pt-4">
            <button 
              onClick={handlePrev}
              disabled={currentStep === 0}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${currentStep === 0 ? 'text-stone-300 cursor-not-allowed' : 'text-stone-500 hover:bg-stone-100'}`}
            >
              <ChevronLeft size={16} /> Back
            </button>
            <div className="flex gap-2">
              {steps.map((_, i) => (
                <div 
                  key={i} 
                  className={`w-2 h-2 rounded-full transition-all ${i === currentStep ? 'bg-brand-lavender w-6' : 'bg-stone-200'}`} 
                />
              ))}
            </div>
            <button 
              onClick={handleNext}
              className="flex items-center gap-2 px-10 py-4 bg-brand-black text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-xl"
            >
              {currentStep === steps.length - 1 ? 'Finish Tutorial' : 'Next Step'} <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

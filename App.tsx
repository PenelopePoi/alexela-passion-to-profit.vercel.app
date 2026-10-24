
import React, { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { LoadingOverlay } from './components/LoadingOverlay';
import { XelaLogo } from './components/XelaLogo';
import { FloatingCTA } from './components/FloatingCTA';
import SmartNav from './components/SmartNav';
import MobileBottomNav from './components/MobileBottomNav';

/* ── Lazy-loaded components — reduces initial bundle ── */
const InputForm = lazy(() => import('./components/InputForm').then(m => ({ default: m.InputForm })));
const Dashboard = lazy(() => import('./components/Dashboard').then(m => ({ default: m.Dashboard })));
const PortfolioGallery = lazy(() => import('./components/PortfolioGallery').then(m => ({ default: m.PortfolioGallery })));
const LiveAssistant = lazy(() => import('./components/LiveAssistant').then(m => ({ default: m.LiveAssistant })));
const ProjectsModal = lazy(() => import('./components/ProjectsModal').then(m => ({ default: m.ProjectsModal })));
const Pricing = lazy(() => import('./components/Pricing').then(m => ({ default: m.Pricing })));
const TrustGuarantee = lazy(() => import('./components/TrustGuarantee').then(m => ({ default: m.TrustGuarantee })));
const ConsultationWizard = lazy(() => import('./components/ConsultationWizard').then(m => ({ default: m.ConsultationWizard })));
const AlexSignalPanel = lazy(() => import('./components/AlexSignalPanel'));
const ChatIntake = lazy(() => import('./components/ChatIntake'));
const IntakeShuffler = lazy(() => import('./components/IntakeShuffler').then(m => ({ default: m.IntakeShuffler })));
const PaymentOptions = lazy(() => import('./components/PaymentOptions').then(m => ({ default: m.PaymentOptions })));
import { motion, AnimatePresence, useInView, useMotionValue, useSpring } from 'motion/react';
import { BrandInput, BrandStrategy, LogoCandidate, SavedProject } from './types';
import { generateBrandStrategy } from './services/geminiService';
import { useVariant } from './hooks/useVariant';
import { trackVariantConversion } from './services/variantRouter';
import VariantBanner from './components/VariantBanner';
import { canAccessView } from './services/authGuard';
import { pollPaymentStatus, formatCurrency } from './services/stripeService';
import ClientProfilePage from './components/ClientProfilePage';
import { getProfileBySlug } from './services/clientProfileService';
import { FolderOpen, Target, Zap, ArrowDown, TrendingUp, Anchor, CheckCircle, AlertCircle, ArrowLeft, Sparkles, Palette, Rocket, Clock, Users, Award, Star, ChevronDown, ChevronUp, Eye, Layers, BarChart3, Send, Phone, Quote, ArrowRight, Plus, Minus, MessageSquare, Shuffle, Mail, Globe, ExternalLink } from 'lucide-react';

/* ── Error Boundary — catches render errors and AI generation failures ── */
interface EBProps { children: React.ReactNode }
interface EBState { hasError: boolean; error: Error | null }

function ErrorBoundaryFallback({ error, onReset }: { error: Error | null; onReset: () => void }) {
  const isAiError = error?.message?.includes('API') || error?.message?.includes('Gemini') || error?.message?.includes('fetch');
  return (
    <div className="min-h-screen bg-brand-black flex items-center justify-center p-8">
      <div className="max-w-md text-center space-y-6">
        <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
          <span className="text-3xl">!</span>
        </div>
        <h1 className="text-2xl font-black text-white">Something went wrong</h1>
        <p className="text-white/60 text-sm leading-relaxed">
          {isAiError
            ? 'Our AI service is temporarily unavailable. Please try again in a moment.'
            : 'An unexpected error occurred. Please refresh the page and try again.'}
        </p>
        <button
          onClick={onReset}
          className="px-8 py-3 bg-brand-teal text-brand-black rounded-full font-black uppercase tracking-widest text-xs hover:scale-105 transition-transform"
        >
          Refresh Page
        </button>
        <p className="text-[10px] text-white/30 mt-4">
          Need help? Call <a href="tel:3213759685" className="text-brand-teal">(321) 375-9685</a>
        </p>
      </div>
    </div>
  );
}

const ErrorBoundary: React.FC<EBProps> = ({ children }) => {
  const [ebState, setEbState] = useState<EBState>({ hasError: false, error: null });

  useEffect(() => {
    const handler = (event: ErrorEvent) => {
      setEbState({ hasError: true, error: event.error || new Error(event.message) });
    };
    const rejectionHandler = (event: PromiseRejectionEvent) => {
      setEbState({ hasError: true, error: event.reason instanceof Error ? event.reason : new Error(String(event.reason)) });
    };
    window.addEventListener('error', handler);
    window.addEventListener('unhandledrejection', rejectionHandler);
    return () => {
      window.removeEventListener('error', handler);
      window.removeEventListener('unhandledrejection', rejectionHandler);
    };
  }, []);

  if (ebState.hasError) {
    return <ErrorBoundaryFallback error={ebState.error} onReset={() => { setEbState({ hasError: false, error: null }); window.location.reload(); }} />;
  }
  return <>{children}</>;
};

const SAMPLE_PROJECT: { data: BrandStrategy; input: BrandInput } = {
  input: {
    companyName: 'Velvet Bean Coffee Co.',
    ownerName: 'Elena Martinez',
    businessSuffix: 'LLC',
    industry: 'Coffee Roastery',
    services: ['Small-Batch Roasting', 'Wholesale Coffee', 'Barista Training', 'Direct Trade Sourcing'],
    vibe: 'Warm & Craft-Focused',
    location: 'Portland, OR',
    audience: 'Coffee enthusiasts & wholesale cafes',
    yearsExperience: '12 Years',
    phone: '(503) 555-0123',
    email: 'contact@velvetbean.coffee',
    website: 'www.velvetbean.coffee',
    googleBusinessLink: 'https://maps.google.com/velvet-bean-coffee',
    bookingLink: 'https://calendly.com/velvetbean/tasting',
    qrPreference: 'website',
    existingLogo: 'input_file_0.png'
  },
  data: {
    taglines: ['Ethically Sourced. Expertly Roasted.', 'Small Batch, Big Flavor.', 'Coffee With a Conscience.', 'From Bean to Cup.', 'Portland Roasted Daily.'],
    missionStatement: 'To source the world\'s finest coffee beans through direct trade partnerships and roast them in small batches that honor the farmers, the craft, and every cup served.',
    visionStatement: 'To be Portland\'s most trusted specialty coffee roastery — where ethics, quality, and community come first.',
    brandVoice: 'Warm, Authentic, Craft-Focused, Community-Driven.',
    colorPalette: {
      primary: '#4A2C17',
      secondary: '#D4A574',
      accent: '#8B4513',
      background: '#FAF4EC',
      explanation: 'Rich coffee browns anchor the brand with warmth and craftsmanship. Caramel and earthy tones evoke roasted beans, while the cream background feels like fresh espresso foam — inviting, authentic, and premium.'
    },
    typographyRecommendation: {
      headingFont: 'Playfair Display',
      bodyFont: 'Inter',
      reasoning: 'Playfair Display offers a classic, artisanal feel for headings that speaks to craft and tradition, while Inter provides clean, modern readability for body text and digital interfaces.'
    },
    socialMediaPostIdeas: [
      { platform: 'Instagram', caption: 'The first crack. ☕️ Watch the transformation of our Ethiopian Yirgacheffe. #CoffeeRoasting #VelvetBean', visualIdea: 'Slow-motion video of beans in the roaster.' },
      { platform: 'Facebook', caption: 'New batch alert! Our limited edition Honey Processed Costa Rican is now available for wholesale. 🍯🇨🇷', visualIdea: 'Close-up photo of roasted beans in a bag.' },
      { platform: 'LinkedIn', caption: 'Sustainability isn\'t just a buzzword for us. It\'s how we do business. Proud to support our farming partners. 🤝', visualIdea: 'Photo of Elena at a coffee farm.' },
      { platform: 'TikTok', caption: 'How to brew the perfect V60 at home. ⏱️💧 #BaristaTips #HomeBrewing', visualIdea: 'Fast-paced tutorial video.' }
    ],
    flyerCopy: {
      headline: "Experience Coffee Like Never Before.",
      hook: "Small-batch roasted in the heart of Portland. Ethically sourced, expertly crafted.",
      callToAction: "Visit us at www.velvetbean.coffee for a Free Tasting"
    },
    classifiedAdCopy: {
      title: "☕️ Premium Coffee Roastery - Wholesale & Retail - Fresh Daily!",
      body: "Velvet Bean LLC offers specialty roasted coffee beans and barista training. Direct trade sourcing and artisanal roasting. 12 years experience. Call Elena at (503) 555-0123."
    }
  }
};

/* ── Animated Counter Hook — animates on mount + on scroll-into-view ── */
function useAnimatedCounter(target: number, duration: number = 2000) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const hasStartedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    const startAnimation = () => {
      if (hasStartedRef.current || cancelled) return;
      hasStartedRef.current = true;
      const startTime = performance.now();
      const tick = (now: number) => {
        if (cancelled) return;
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setCount(Math.floor(target * eased));
        if (progress < 1) requestAnimationFrame(tick);
        else setCount(target);
      };
      requestAnimationFrame(tick);
    };

    // Start after a short delay regardless of viewport — guarantees animation runs
    const fallbackTimer = setTimeout(startAnimation, 800);

    // Also try IntersectionObserver for smoother on-scroll behavior if element exists
    if (ref.current && typeof IntersectionObserver !== 'undefined') {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              startAnimation();
              observer.disconnect();
            }
          });
        },
        { threshold: 0.1 }
      );
      observer.observe(ref.current);
      return () => {
        cancelled = true;
        clearTimeout(fallbackTimer);
        observer.disconnect();
      };
    }

    return () => {
      cancelled = true;
      clearTimeout(fallbackTimer);
    };
  }, [target, duration]);

  return { count, ref };
}

/* ── Floating Particle Component ── */
const FloatingParticle: React.FC<{ delay?: number; size?: number; color?: string; x?: string; y?: string }> = ({
  delay = 0, size = 6, color = 'bg-brand-teal/30', x = '10%', y = '20%'
}) => (
  <motion.div
    className={`absolute ${color} rounded-full pointer-events-none`}
    style={{ width: size, height: size, left: x, top: y }}
    animate={{
      y: [0, -30, 0, 20, 0],
      x: [0, 15, -10, 5, 0],
      opacity: [0.3, 0.7, 0.4, 0.8, 0.3],
      scale: [1, 1.3, 0.8, 1.1, 1],
    }}
    transition={{ duration: 8, delay, repeat: Infinity, ease: "easeInOut" }}
  />
);

/* ── Scroll-Triggered Section Wrapper ── */
const ScrollReveal: React.FC<{ children: React.ReactNode; className?: string; delay?: number }> = ({ children, className = '', delay = 0 }) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

/* ── Interactive Tilt Card ── */
const TiltCard: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const smoothX = useSpring(rotateX, { stiffness: 150, damping: 20 });
  const smoothY = useSpring(rotateY, { stiffness: 150, damping: 20 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    rotateX.set(((e.clientY - centerY) / (rect.height / 2)) * -6);
    rotateY.set(((e.clientX - centerX) / (rect.width / 2)) * 6);
  };

  const handleMouseLeave = () => {
    rotateX.set(0);
    rotateY.set(0);
  };

  return (
    <motion.div
      ref={cardRef}
      style={{ rotateX: smoothX, rotateY: smoothY, transformPerspective: 800 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={className}
    >
      {children}
    </motion.div>
  );
};

/* ── Rotating Gallery Strip (4 images at a time) ── */
const GALLERY_IMAGES = [
  '/gallery/work-01.jpg', '/gallery/work-02.jpg', '/gallery/work-03.jpg',
  '/gallery/work-06.jpg', '/gallery/work-08.jpg', '/gallery/work-09.jpg',
  '/gallery/work-10.jpg', '/gallery/work-11.jpg', '/gallery/work-13.jpg',
  '/gallery/work-14.jpg', '/gallery/work-15.jpg', '/gallery/work-16.jpg',
  '/gallery/work-17.jpg', '/gallery/work-18.jpg', '/gallery/work-19.jpg',
  '/gallery/work-20.jpg', '/gallery/work-21.jpg', '/gallery/work-22.jpg',
  '/gallery/work-23.jpg', '/gallery/work-24.jpg', '/gallery/work-25.jpg',
  '/gallery/work-26.jpg', '/gallery/work-27.jpg', '/gallery/work-28.jpg',
  '/gallery/work-29.jpg', '/gallery/work-30.jpg', '/gallery/work-31.jpg',
  '/gallery/work-32.jpg', '/gallery/work-33.jpg', '/gallery/work-34.jpg',
  '/gallery/work-35.jpg',
];

const GalleryStrip: React.FC = () => {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setOffset(prev => (prev + 1) % GALLERY_IMAGES.length);
    }, 2500);
    return () => clearInterval(timer);
  }, []);

  const visibleDesktop = 4;
  const visibleImages = Array.from({ length: visibleDesktop }, (_, i) => GALLERY_IMAGES[(offset + i) % GALLERY_IMAGES.length]);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4" style={{ minHeight: '200px' }}>
      <AnimatePresence mode="popLayout">
        {visibleImages.map((src, i) => (
          <motion.div
            key={`${src}-${offset}-${i}`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.5, delay: i * 0.08 }}
            layout
            className="aspect-square rounded-2xl overflow-hidden group relative"
          >
            <img
              src={src}
              alt={`Portfolio work ${(offset + i) % GALLERY_IMAGES.length + 1}`}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              loading="lazy"
              width={400}
              height={400}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

/* ── Intake Portfolio Sidebar ── */
const IntakeGallery: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const images = GALLERY_IMAGES;

  return (
    <div className="bg-white rounded-3xl border border-stone-200 shadow-lg overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
        aria-label={isExpanded ? 'Collapse recent work gallery' : 'Expand recent work gallery'}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-stone-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Eye size={16} className="text-brand-teal" />
          <span className="text-sm font-black uppercase tracking-widest text-brand-black">Our Recent Work</span>
          <span className="text-[10px] font-bold text-stone-400">({images.length} projects)</span>
        </div>
        {isExpanded ? <ChevronUp size={16} className="text-stone-400" /> : <ChevronDown size={16} className="text-stone-400" />}
      </button>
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-6 grid grid-cols-2 md:grid-cols-4 gap-3">
              {images.map((src, i) => (
                <motion.div
                  key={src}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="aspect-square rounded-xl overflow-hidden group cursor-pointer relative"
                >
                  <img src={src} alt={`Work ${i + 1}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" loading="lazy" width={200} height={200} />
                  <div className="absolute inset-0 bg-brand-black/0 group-hover:bg-brand-black/20 transition-colors duration-300" />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ── Tagline Rotator ── */
const taglines = [
  "From Pain to Purpose.",
  "Brand It. Launch It. Own It.",
  "Look Legit. Get Paid.",
  "Your Brand, Ready Today.",
  "Stop Looking Like a Side Hustle.",
  "Built With Heart. Delivered Same Day.",
  "Premium Brand, Budget Price.",
  "The Agency Alternative.",
];

const TaglineRotator: React.FC = () => {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setIndex(prev => (prev + 1) % taglines.length), 3500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative h-[2.5em] overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.span
          key={index}
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -40, opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="block text-brand-teal italic"
        >
          {taglines[index]}
        </motion.span>
      </AnimatePresence>
    </div>
  );
};


/* ── FAQ Accordion Item ── */
const FaqItem: React.FC<{ question: string; answer: string }> = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border border-white/10 rounded-2xl overflow-hidden hover:border-brand-teal/30 transition-colors">
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-label={`FAQ: ${question}`}
        className="w-full px-6 py-5 flex items-center justify-between text-left group focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal/50 focus-visible:rounded-2xl"
      >
        <span className="text-base font-bold text-white group-hover:text-brand-teal transition-colors pr-4">{question}</span>
        <motion.div
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.2 }}
          className="shrink-0 w-8 h-8 rounded-full bg-brand-teal/10 flex items-center justify-center"
        >
          <Plus size={16} className="text-brand-teal" />
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-5 text-white/60 text-sm leading-relaxed font-medium">
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ── Sticky Mobile CTA ── */
const StickyMobileCTA: React.FC<{ onCtaClick: () => void }> = ({ onCtaClick }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      const pricingEl = document.getElementById('pricing');
      if (pricingEl) {
        const rect = pricingEl.getBoundingClientRect();
        setVisible(rect.top > window.innerHeight || rect.bottom < 0);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          exit={{ y: 100 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
        >
          <div className="bg-white/80 backdrop-blur-xl border-t border-stone-200 px-4 py-3 flex items-center justify-between gap-3">
            <span className="text-xs font-bold text-brand-black">Start Your Brand — <span className="text-brand-teal">From $75</span></span>
            <button
              onClick={onCtaClick}
              aria-label="View pricing packages"
              className="px-6 py-3 bg-brand-teal text-brand-black text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-brand-teal/30 shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal"
            >
              Get Yours →
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/* ── Payment Success View — polls Stripe session for details ── */
function PaymentSuccessView({ onBack }: { onBack: () => void }) {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [paymentInfo, setPaymentInfo] = useState<{ amount?: number; currency?: string; email?: string } | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get('session_id');
    if (!sessionId) {
      setStatus('success');
      return;
    }
    let cancelled = false;
    pollPaymentStatus(sessionId)
      .then((result) => {
        if (cancelled) return;
        setPaymentInfo({ amount: result.amount, currency: result.currency, email: result.customerEmail });
        setStatus('success');
      })
      .catch(() => {
        if (cancelled) return;
        setStatus('error');
      });
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="max-w-md text-center space-y-6">
      {status === 'loading' && (
        <>
          <div className="w-20 h-20 bg-brand-teal/20 rounded-full flex items-center justify-center mx-auto animate-pulse">
            <Clock size={32} className="text-brand-teal" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">Confirming Payment...</h1>
          <p className="text-white/60 text-sm">Verifying your checkout session with Stripe.</p>
        </>
      )}
      {status === 'success' && (
        <>
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle size={32} className="text-green-400" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Payment Successful!</h1>
          {paymentInfo?.amount != null && (
            <p className="text-brand-teal text-2xl font-black">
              {formatCurrency(paymentInfo.amount, paymentInfo.currency)}
            </p>
          )}
          <p className="text-white/60 text-sm leading-relaxed">
            Thank you for your purchase! {paymentInfo?.email ? `A receipt has been sent to ${paymentInfo.email}.` : 'A receipt will be sent to your email shortly.'}
          </p>
          <button
            onClick={onBack}
            className="px-8 py-3 bg-brand-teal text-brand-black rounded-full font-black uppercase tracking-widest text-xs hover:scale-105 transition-transform"
          >
            Back to Dashboard
          </button>
        </>
      )}
      {status === 'error' && (
        <>
          <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle size={32} className="text-red-400" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">Payment Received</h1>
          <p className="text-white/60 text-sm leading-relaxed">
            Your payment went through, but we couldn't load the details right now. Check your email for a receipt.
          </p>
          <button
            onClick={onBack}
            className="px-8 py-3 bg-brand-teal text-brand-black rounded-full font-black uppercase tracking-widest text-xs hover:scale-105 transition-transform"
          >
            Back to Dashboard
          </button>
        </>
      )}
      <p className="text-[10px] text-white/30 mt-4">
        Questions? Call <a href="tel:3213759685" className="text-brand-teal">(321) 375-9685</a>
      </p>
    </div>
  );
}

const App: React.FC = () => {
  const { config: variantConfig } = useVariant();
  const [step, setStep] = useState<'landing' | 'intake' | 'dashboard' | 'consult' | 'chat' | 'shuffle' | 'payment-success' | 'payment-canceled'>('landing');
  const [selectedPackage, setSelectedPackage] = useState<'budget' | 'premium' | 'elite' | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [brandData, setBrandData] = useState<BrandStrategy | null>(null);
  const [inputData, setInputData] = useState<BrandInput | null>(null);
  const [logoCandidates, setLogoCandidates] = useState<LogoCandidate[]>([]);
  const [activeTemplate, setActiveTemplate] = useState('Modern Growth');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [projects, setProjects] = useState<SavedProject[]>([]);
  const [isProjectsModalOpen, setIsProjectsModalOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [headerSolid, setHeaderSolid] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [showPayment, setShowPayment] = useState(false);
  const [hasInteractedSinceAutoNav, setHasInteractedSinceAutoNav] = useState(true);
  const [profileSlug, setProfileSlug] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const onClick = () => setHasInteractedSinceAutoNav(true);
    window.addEventListener('click', onClick);
    return () => window.removeEventListener('click', onClick);
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('brand_projects');
    if (saved) {
      try {
        setProjects(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load projects", e);
      }
    }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const slug = params.get('p');
    if (slug) setProfileSlug(slug);
    if (params.get('view') === 'consult') setStep('consult');
    if (params.get('view') === 'chat') setStep('chat');
    if (params.get('view') === 'shuffle') setStep('shuffle');
    if (params.get('view') === 'payment-success') setStep('payment-success');
    if (params.get('view') === 'payment-canceled') setStep('payment-canceled');
    // Dashboard requires a valid project — don't allow direct URL access without one
    if (params.get('view') === 'dashboard') {
      const check = canAccessView('dashboard');
      if (check.allowed) {
        // Only if they have a valid project session
        // We'll set step to dashboard, but the actual dashboard will only render if brandData exists
      }
    }
  }, []);

  // Auth guard — only redirect dashboard if there's literally no brand data in state
  // (Either localStorage projects exist OR brandData is loaded in memory via demo/intake)
  useEffect(() => {
    if (step === 'dashboard' && !brandData && !inputData) {
      const check = canAccessView('dashboard');
      if (!check.allowed && check.redirectTo) {
        setStep(check.redirectTo);
      }
    }
  }, [step, brandData, inputData]);

  useEffect(() => {
    const titles: Record<string, string> = {
      landing: 'XELA Creative Branding Studio | Same-Day Brand Kits from $75',
      consult: 'Free Brand Consultation | XELA Creative Branding Studio',
      dashboard: 'Your Brand Dashboard | XELA Creative Branding Studio',
      chat: 'AI Brand Chat | XELA Creative Branding Studio',
      intake: 'Brand Intake | XELA Creative Branding Studio',
      shuffle: 'Brand Explorer | XELA Creative Branding Studio',
    };
    document.title = titles[step] || titles.landing;
  }, [step]);

  useEffect(() => {
    if (step !== 'landing') return;
    const handleScroll = () => setHeaderSolid(window.scrollY > 60);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [step]);

  const handleSelectPackage = (tier: 'budget' | 'premium' | 'elite') => {
    setSelectedPackage(tier);
    setInputData(null);
    setStep('intake');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToLanding = () => {
    setStep('landing');
    setSelectedPackage(null);
  };

  const handleLoadSample = () => {
    setInputData(SAMPLE_PROJECT.input);
    setBrandData(SAMPLE_PROJECT.data);
    setLogoCandidates([]);
    setStep('dashboard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (data: BrandInput) => {
    setSubmitError(null);
    setIsLoading(true);
    trackVariantConversion('intake_started');
    try {
      const inputWithTier = { ...data, selectedTier: selectedPackage || undefined };
      const strategy = await generateBrandStrategy(inputWithTier);
      setBrandData(strategy);
      setInputData(inputWithTier);
      setLogoCandidates([]);
      setStep('dashboard');
      setShowPayment(true);
      trackVariantConversion('intake_completed');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      console.error("Generation failed");
      setSubmitError("Our AI engine hit a hiccup — please try again in a moment. If this keeps happening, call us at (321) 375-9685 and we'll build it for you personally.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = (data: BrandStrategy, input: BrandInput, logos: LogoCandidate[], template: string) => {
    setIsSaving(true);
    const newProject: SavedProject = {
      id: Math.random().toString(36).substr(2, 9),
      name: input.companyName || "Untitled Project",
      lastModified: Date.now(),
      data,
      input,
      logos,
      template,
      status: 'completed'
    };

    const updatedProjects = [newProject, ...projects.filter(p => p.name !== input.companyName)];
    setProjects(updatedProjects);
    localStorage.setItem('brand_projects', JSON.stringify(updatedProjects));

    setIsSaving(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleSaveDraft = (input: BrandInput) => {
    const draftName = input.companyName || "Untitled Draft";
    const newProject: SavedProject = {
      id: Math.random().toString(36).substr(2, 9),
      name: draftName,
      lastModified: Date.now(),
      input,
      logos: [],
      template: 'Modern Growth',
      status: 'draft'
    };

    const updatedProjects = [newProject, ...projects.filter(p => p.id !== newProject.id && p.name !== draftName)];
    setProjects(updatedProjects);
    localStorage.setItem('brand_projects', JSON.stringify(updatedProjects));
  };

  const handleDeleteProject = (id: string) => {
    const updated = projects.filter(p => p.id !== id);
    setProjects(updated);
    localStorage.setItem('brand_projects', JSON.stringify(updated));
  };

  const handleLoadProject = (project: SavedProject) => {
    if (project.status === 'draft' || !project.data) {
      setInputData(project.input);
      setStep('intake');
    } else {
      setBrandData(project.data);
      setInputData(project.input);
      setLogoCandidates(project.logos || []);
      setActiveTemplate(project.template || 'Modern Growth');
      setStep('dashboard');
    }
    setIsProjectsModalOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReset = () => {
    setStep('landing');
    setBrandData(null);
    setInputData(null);
    setLogoCandidates([]);
    setSelectedPackage(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToPricing = () => {
    document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToPortfolio = () => {
    document.getElementById('portfolio-peek')?.scrollIntoView({ behavior: 'smooth' });
  };

  /* ── Animated counter data ── */
  const counter1 = useAnimatedCounter(68, 2000);
  const counter2 = useAnimatedCounter(50, 2500);
  const counter3 = useAnimatedCounter(98, 1800);

  // Client profile page — highest-priority route (QR target for CardCut $75 clients)
  if (profileSlug) {
    const profile = getProfileBySlug(profileSlug);
    return (
      <div className="min-h-screen bg-brand-black">
        {profile ? <ClientProfilePage profile={profile} /> : (
          <div className="min-h-screen flex items-center justify-center p-8">
            <div className="text-center">
              <h1 className="text-3xl font-black text-white mb-3">Profile Not Found</h1>
              <p className="text-white/60 mb-6">This client profile doesn't exist.</p>
              <a href="/" className="px-6 py-3 bg-brand-teal text-brand-black rounded-full font-bold uppercase tracking-widest text-xs inline-block">Visit XELA Studio</a>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col min-h-screen bg-brand-black">
      {/* Skip to main content — accessibility */}
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-[9999] focus:top-4 focus:left-4 focus:px-6 focus:py-3 focus:bg-brand-teal focus:text-brand-black focus:rounded-full focus:font-black focus:text-sm focus:uppercase focus:tracking-widest">
        Skip to main content
      </a>
      {/* Global logo watermark — 25% opacity, adds dimension */}
      <div className="fixed inset-0 pointer-events-none z-0 flex items-center justify-center overflow-hidden">
        <motion.img
          src="/xela-logo-new.png"
          alt=""
          aria-hidden="true"
          loading="lazy"
          className="w-[80vw] sm:w-[60vw] max-w-[600px] opacity-[0.04] select-none"
          animate={{
            scale: [1, 1.03, 1],
            rotate: [0, 1, -1, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          style={{ filter: 'grayscale(0.5) blur(1px)' }}
        />
      </div>
      {isLoading && <LoadingOverlay />}

      {/* ═══════════ UNIVERSAL HEADER (non-landing views) ═══════════ */}
      {step !== 'landing' && (
        <header className="fixed top-0 left-0 right-0 z-[90] px-4 sm:px-6 py-2.5 sm:py-3 flex justify-between items-center bg-brand-black/90 backdrop-blur-xl border-b border-white/5">
          <button onClick={() => { setStep('landing'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="flex items-center gap-1 group cursor-pointer">
            <img
              src="/xela-logo-new.png"
              alt="XELA"
              width={160}
              height={64}
              className="h-9 sm:h-12 md:h-16 w-auto max-w-[120px] sm:max-w-none object-contain group-hover:scale-105 transition-transform"
              style={{
                filter: 'brightness(1.1) saturate(1.3) drop-shadow(0 0 10px rgba(0, 224, 198, 0.55)) drop-shadow(0 0 20px rgba(255, 140, 66, 0.35))',
              }}
            />
          </button>
          <div className="flex items-center gap-3">
            <button onClick={() => { setStep('landing'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className="text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors hidden md:block">Home</button>
            <button onClick={() => { setStep('consult'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className="text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-brand-teal transition-colors hidden md:block">Consultation</button>
            <a href="tel:3213759685" className="flex items-center gap-1.5 px-4 py-2 bg-brand-teal text-brand-black text-[10px] font-black uppercase tracking-widest rounded-full hover:scale-105 transition-all">
              <Phone size={10} /> Call
            </a>
          </div>
        </header>
      )}

      {step === 'landing' && (
        <main id="main-content" className="flex flex-col w-full animate-fade-in-up">

          {/* Ethical urgency bar — bright teal + peach neon on black */}
          <div
            className="relative z-[60] py-2.5 text-center border-y border-brand-teal/20 overflow-hidden"
            style={{
              background: 'linear-gradient(90deg, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.85) 50%, rgba(0,0,0,0.95) 100%)',
              boxShadow: 'inset 0 0 40px rgba(0,224,198,0.08), 0 1px 24px rgba(255,140,66,0.15)',
            }}
          >
            {/* Subtle animated gradient sweep */}
            <div
              className="absolute inset-0 opacity-30 pointer-events-none"
              style={{
                background: 'linear-gradient(90deg, transparent 0%, rgba(0,224,198,0.4) 25%, rgba(255,140,66,0.4) 50%, rgba(0,224,198,0.4) 75%, transparent 100%)',
                backgroundSize: '200% 100%',
                animation: 'shimmer 6s ease-in-out infinite',
              }}
            />
            <p className="relative text-xs font-black uppercase tracking-[0.3em] flex items-center justify-center gap-2 flex-wrap px-4">
              <span className="text-brand-teal" style={{ textShadow: '0 0 12px rgba(0,224,198,0.8), 0 0 24px rgba(0,224,198,0.4)' }}>
                Now Booking
              </span>
              <span className="text-white/90">for</span>
              <span
                className="text-transparent bg-clip-text"
                style={{
                  backgroundImage: 'linear-gradient(90deg, #00E0C6 0%, #FF8C42 100%)',
                  WebkitBackgroundClip: 'text',
                  filter: 'drop-shadow(0 0 10px rgba(255,140,66,0.6))',
                }}
              >
                {new Date().toLocaleDateString('en-US', { month: 'long' })}
              </span>
              <span className="text-white/40">·</span>
              <span className="text-white/95">Same-Day Delivery</span>
              <span
                className="inline-block w-1.5 h-1.5 rounded-full ml-1"
                style={{
                  backgroundColor: '#FF8C42',
                  boxShadow: '0 0 8px #FF8C42, 0 0 16px rgba(255,140,66,0.6)',
                  animation: 'pulse 2s ease-in-out infinite',
                }}
              />
            </p>
          </div>

          {/* Scroll progress indicator */}
          <motion.div
            className="fixed top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-brand-teal via-brand-lavender to-brand-teal z-[100] origin-left"
            style={{ scaleX: scrollY / Math.max(document.documentElement.scrollHeight - window.innerHeight, 1) }}
          />

          {/* ═══════════ 1. STICKY HEADER ═══════════ */}
          <header
            className="fixed top-0 left-0 right-0 z-50 w-full transition-all duration-500 bg-brand-black/85 backdrop-blur-2xl border-b border-brand-teal/20"
            style={{ boxShadow: headerSolid ? '0 4px 32px rgba(0,224,198,0.1), 0 2px 8px rgba(0,0,0,0.6)' : '0 2px 16px rgba(0,0,0,0.4)' }}
          >
            <div className="max-w-[1600px] mx-auto px-4 sm:px-6 md:px-10 py-2.5 md:py-4 flex justify-between items-center gap-4 sm:gap-6">

              {/* LOGO */}
              <button onClick={handleReset} className="flex items-center shrink-0 group cursor-pointer" aria-label="XELA Home">
                <img
                  src="/xela-logo-new.png"
                  alt="XELA Creative Branding Studio"
                  width={200}
                  height={80}
                  className="h-14 sm:h-18 md:h-24 w-auto max-w-[200px] sm:max-w-[240px] md:max-w-none object-contain group-hover:scale-105 transition-transform duration-300"
                  style={{
                    filter: 'brightness(1.2) saturate(1.4) drop-shadow(0 0 16px rgba(0, 224, 198, 0.7)) drop-shadow(0 0 32px rgba(255, 140, 66, 0.5)) drop-shadow(0 2px 8px rgba(0, 0, 0, 0.6))',
                  }}
                />
              </button>

              {/* DESKTOP NAV LINKS — center */}
              <nav className="hidden lg:flex items-center gap-6 flex-1 justify-center">
                <button
                  onClick={scrollToPortfolio}
                  className="text-[11px] font-black uppercase tracking-[0.2em] text-white hover:text-brand-teal transition-colors"
                >
                  Portfolio
                </button>
                <span className="text-brand-teal/30">·</span>
                <button
                  onClick={scrollToPricing}
                  className="text-[11px] font-black uppercase tracking-[0.2em] text-white hover:text-brand-teal transition-colors"
                >
                  Packages
                </button>
                <span className="text-brand-teal/30">·</span>
                <button
                  onClick={() => { setStep('consult'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="text-[11px] font-black uppercase tracking-[0.2em] text-white hover:text-brand-teal transition-colors"
                >
                  Consultation
                </button>
              </nav>

              {/* RIGHT-SIDE CTAS */}
              <div className="flex items-center gap-2 md:gap-3 shrink-0">

                {/* Phone — desktop */}
                <a
                  href="tel:3213759685"
                  className="hidden xl:flex items-center gap-1.5 text-[11px] font-black uppercase tracking-[0.18em] text-brand-teal hover:text-white transition-colors"
                >
                  <Phone size={12} /> (321) 375-9685
                </a>
                {/* Email — desktop */}
                <a
                  href="mailto:xelabrandingstudio@gmail.com"
                  className="hidden xl:flex items-center gap-1.5 text-[11px] font-black uppercase tracking-[0.18em] text-brand-lavender hover:text-white transition-colors"
                >
                  <Mail size={12} /> Email
                </a>

                {/* Projects — desktop (only if projects exist) */}
                {projects.length > 0 && (
                  <button
                    onClick={() => setIsProjectsModalOpen(true)}
                    className="hidden md:flex px-3 py-2 bg-brand-lavender/10 border border-brand-lavender/40 text-brand-lavender text-[10px] font-black uppercase tracking-[0.15em] rounded-full hover:bg-brand-lavender/20 hover:scale-105 transition-all items-center gap-1.5"
                    aria-label="My projects"
                  >
                    <FolderOpen size={12} /> {projects.length}
                  </button>
                )}

                {/* Primary CTA — bright teal→peach gradient */}
                <button
                  onClick={() => { setStep('consult'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="group relative px-5 md:px-7 py-2.5 md:py-3 rounded-full font-black uppercase tracking-[0.15em] text-[10px] md:text-[11px] text-brand-black transition-all hover:scale-[1.03] active:scale-[0.97] overflow-hidden"
                  style={{
                    background: 'linear-gradient(135deg, #00E0C6 0%, #FF8C42 100%)',
                    boxShadow: '0 0 24px rgba(0,224,198,0.5), 0 0 40px rgba(255,140,66,0.3), 0 4px 16px rgba(0,0,0,0.4)',
                  }}
                >
                  <span className="flex items-center gap-2 relative z-10">
                    Start Now
                    <Rocket size={12} className="group-hover:translate-x-1 transition-transform" />
                  </span>
                </button>

                {/* Mobile call button */}
                <a
                  href="tel:3213759685"
                  className="md:hidden flex items-center justify-center w-10 h-10 bg-brand-teal/15 border border-brand-teal/50 text-brand-teal rounded-full"
                  aria-label="Call us"
                >
                  <Phone size={14} />
                </a>
              </div>
            </div>
          </header>

          {/* ═══════════ 2. HERO SECTION ═══════════ */}
          <div className="relative min-h-screen flex flex-col justify-center px-4 sm:px-6 lg:px-8 pt-28 sm:pt-32 lg:pt-24 pb-16 overflow-hidden bg-brand-black">
            {/* Floating decorative particles — trimmed to 4, pushed to edges so they frame content */}
            <FloatingParticle x="4%" y="18%" size={6} color="bg-brand-teal/30" delay={0} />
            <FloatingParticle x="94%" y="14%" size={5} color="bg-brand-lavender/30" delay={1.2} />
            <FloatingParticle x="95%" y="78%" size={6} color="bg-brand-teal/25" delay={0.5} />
            <FloatingParticle x="3%" y="82%" size={5} color="bg-brand-lavender/25" delay={2} />

            {/* Decorative gradient orbs */}
            <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-brand-teal/[0.06] rounded-full blur-[120px] pointer-events-none animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-brand-lavender/[0.06] rounded-full blur-[100px] pointer-events-none animate-pulse" style={{ animationDelay: '2s' }} />

            <div className="max-w-[1600px] mx-auto w-full grid lg:grid-cols-2 gap-10 lg:gap-20 items-center relative z-10">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="space-y-8 sm:space-y-12"
              >
                <motion.button
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  onClick={() => { setStep('consult'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="inline-flex items-center gap-3 px-4 py-2 bg-brand-teal/10 rounded-full border border-brand-teal/30 hover:bg-brand-teal/20 hover:scale-105 transition-all cursor-pointer group"
                >
                  <Sparkles size={14} className="text-brand-teal animate-pulse" />
                  <span className="text-[9px] font-black uppercase tracking-[0.4em] text-brand-teal group-hover:text-white transition-colors">AI-Powered Brand Engineering</span>
                  <span className="text-[9px] text-brand-teal/60 group-hover:text-brand-teal transition-colors">→ Try It Free</span>
                </motion.button>

                <div className="space-y-6">
                  <h1 className="relative text-4xl sm:text-5xl md:text-7xl lg:text-[7vw] max-w-full font-serif font-black tracking-tighter text-white leading-[0.9] uppercase break-words">
                    <div className="absolute inset-0 -z-10 blur-3xl opacity-60 bg-gradient-to-r from-brand-teal/40 via-brand-lavender/40 to-brand-teal/40 animate-pulse" />
                    <TaglineRotator />
                  </h1>
                  <div className="flex items-start gap-4 sm:gap-6 pt-4 sm:pt-6">
                    <motion.div
                      className="h-[1px] w-10 sm:w-20 bg-brand-teal mt-3 shrink-0"
                      initial={{ width: 0 }}
                      animate={{ width: 80 }}
                      transition={{ delay: 0.6, duration: 0.8 }}
                    />
                    <div className="space-y-3">
                      <p className="text-base sm:text-lg md:text-xl text-white/80 max-w-md font-medium leading-snug">
                        Logo, business cards, social posts, and marketing copy — delivered today. No contracts, no subscriptions. Built for Florida service businesses.
                      </p>
                      <p className="text-xs font-black uppercase tracking-[0.3em] text-brand-teal">
                        Passion to Prophet in 60 Seconds
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3 sm:gap-4 pt-6 sm:pt-10">
                  <motion.button
                    onClick={() => { setStep('consult'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.95 }}
                    className="group relative w-full sm:w-auto px-6 sm:px-12 py-5 sm:py-6 bg-gradient-to-r from-brand-teal to-brand-lavender text-brand-black rounded-full text-sm font-black uppercase tracking-widest shadow-2xl shadow-brand-teal/40 transition-all flex items-center justify-center gap-3 hover:shadow-brand-teal/60 ring-2 ring-brand-teal/50"
                  >
                    {variantConfig.hero.ctaLabel} <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </motion.button>
                  <motion.a
                    href="tel:3213759685"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full sm:w-auto px-6 sm:px-10 py-4 sm:py-5 bg-white/5 backdrop-blur-sm border border-white/20 text-white rounded-full text-xs font-black uppercase tracking-widest shadow-lg flex items-center justify-center gap-3 hover:bg-white/10 hover:border-brand-teal/50 transition-all"
                  >
                    <Phone size={14} /> Free Consultation
                  </motion.a>
                  <motion.button
                    onClick={handleLoadSample}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="hidden sm:flex w-full sm:w-auto px-6 sm:px-10 py-4 sm:py-5 bg-transparent text-white/70 border border-white/15 rounded-full text-xs font-black uppercase tracking-widest hover:text-white hover:border-brand-lavender/50 transition-all items-center justify-center"
                  >
                    View Example Output
                  </motion.button>
                </div>
                <p className="text-sm text-white/60 font-medium mt-6 flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50" />
                  No credit card. 3-minute quiz. Instant quote.
                </p>
                <div className="flex items-center gap-4 mt-3 text-[10px] font-bold uppercase tracking-widest text-white/40">
                  <span className="flex items-center gap-1.5"><CheckCircle size={12} className="text-green-400" /> Money-back guarantee</span>
                  <span className="flex items-center gap-1.5"><CheckCircle size={12} className="text-green-400" /> You own everything</span>
                  <span className="flex items-center gap-1.5 hidden sm:flex"><CheckCircle size={12} className="text-green-400" /> Same-day delivery</span>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, delay: 0.2 }}
                className="relative hidden lg:block"
              >
                <div className="relative w-full max-w-md mx-auto rounded-[3rem] shadow-2xl shadow-brand-teal/10 group">
                  <img
                    src="/xela-iquit-flyer.png"
                    alt="The I Quit Accelerator — XELA Creative Branding Studio"
                    className="w-full h-auto object-contain rounded-[3rem] group-hover:scale-[1.02] transition-all duration-1000"
                    referrerPolicy="no-referrer"
                    width={800}
                    height={1000}
                    loading="eager"
                    decoding="async"
                  />
                  {/* Dark-theme blend gradients */}
                  <div className="absolute inset-0 rounded-[3rem] bg-gradient-to-t from-brand-black/60 via-transparent to-transparent pointer-events-none"></div>
                  <div className="absolute inset-0 rounded-[3rem] bg-gradient-to-b from-brand-black/20 via-transparent to-transparent pointer-events-none"></div>
                  <div className="absolute inset-0 rounded-[3rem] ring-1 ring-inset ring-white/10 pointer-events-none"></div>
                </div>

                {/* Floating decorative elements around hero image */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="absolute -top-8 -right-8 w-16 h-16 border border-brand-teal/30 rounded-full"
                />
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                  className="absolute -bottom-4 -left-4 w-24 h-24 border border-brand-lavender/20 rounded-full"
                />
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-brand-lavender/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-brand-teal/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>

                <div className="absolute top-1/3 -right-4 vertical-text text-[9px] font-black uppercase tracking-[0.5em] text-white/30 hidden xl:block">
                  Precision Engineered • Florida Market
                </div>
              </motion.div>
            </div>

            {/* Background Text — muted watermark, pushed to 0.02 so it never competes */}
            <div className="absolute bottom-0 left-0 w-full overflow-hidden pointer-events-none opacity-[0.02] select-none">
              <span className="text-[30vw] font-serif font-black whitespace-nowrap leading-none uppercase -mb-10 block text-white">Xela Studio</span>
            </div>

            {/* Scroll indicator */}
            <motion.div
              className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/40">Scroll</span>
              <ArrowDown size={14} className="text-white/40" />
            </motion.div>
          </div>

          {/* Currently Building Ticker */}
          <div className="bg-brand-black/50 border-y border-white/5 py-3 overflow-hidden">
            <div className="max-w-[1600px] mx-auto px-4 sm:px-8 flex flex-wrap items-center justify-center gap-3 text-[11px] font-bold uppercase tracking-widest">
              <span className="w-2 h-2 bg-brand-teal rounded-full animate-pulse" />
              <span className="text-white/40">Currently building brands for:</span>
              <span className="text-brand-teal">Barbershops · Landscapers · Food Trucks · Tattoo Artists · Cleaners · Consultants · Coaches · Pet Services</span>
            </div>
          </div>

          {/* ═══════════ TRUST INDICATORS STRIP ═══════════ */}
          <div className="bg-brand-black py-6 px-4 sm:px-8 border-y border-white/5">
            <div className="max-w-[1600px] mx-auto flex flex-wrap justify-center items-center gap-x-12 gap-y-4">
              {[
                { label: "AI-Powered Brand Engine", icon: "◆" },
                { label: "Same-Day Delivery", icon: "◆" },
                { label: "Brevard County, FL", icon: "◆" },
                { label: "Col 3:23 — Our Standard", icon: "◆" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-brand-teal text-[8px]">{item.icon}</span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/90">{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ═══════════ SCROLLING MARQUEE STRIP ═══════════ */}
          <div className="bg-brand-black py-3 overflow-hidden border-y border-white/5">
            <div className="animate-marquee flex whitespace-nowrap">
              {[...Array(3)].map((_, rep) => (
                <span key={rep} className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-teal mx-0 shrink-0">
                  Same-Day Delivery&nbsp;&nbsp;·&nbsp;&nbsp;AI-Powered Branding&nbsp;&nbsp;·&nbsp;&nbsp;From Pain to Purpose&nbsp;&nbsp;·&nbsp;&nbsp;Look Legit Get Paid&nbsp;&nbsp;·&nbsp;&nbsp;Space Coast FL&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                </span>
              ))}
            </div>
          </div>

          {/* ═══════════ 3. SOCIAL PROOF STRIP ═══════════ */}
          <ScrollReveal>
            <div className="bg-brand-black py-12 sm:py-16 px-4 sm:px-8 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-brand-teal/5 via-transparent to-brand-lavender/5 pointer-events-none" />
              <div className="max-w-[1600px] mx-auto grid grid-cols-3 gap-8 relative z-10">
                <div ref={counter1.ref} className="text-center group">
                  <motion.div whileHover={{ scale: 1.05 }} className="cursor-default">
                    <span className="text-3xl sm:text-5xl md:text-7xl font-display font-black text-white">{counter1.count}+</span>
                    <p className="text-[8px] sm:text-[10px] font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] text-white/60 mt-2 group-hover:text-brand-teal transition-colors">Services Offered</p>
                  </motion.div>
                </div>
                <div ref={counter2.ref} className="text-center group">
                  <motion.div whileHover={{ scale: 1.05 }} className="cursor-default">
                    <span className="text-3xl sm:text-5xl md:text-7xl font-display font-black text-white">{counter2.count}+</span>
                    <p className="text-[8px] sm:text-[10px] font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] text-white/60 mt-2 group-hover:text-brand-teal transition-colors">Design Assets Per Package</p>
                  </motion.div>
                </div>
                <div ref={counter3.ref} className="text-center group">
                  <motion.div whileHover={{ scale: 1.05 }} className="cursor-default">
                    <span className="text-3xl sm:text-5xl md:text-7xl font-display font-black text-white">{counter3.count}x</span>
                    <p className="text-[8px] sm:text-[10px] font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] text-white/60 mt-2 group-hover:text-brand-teal transition-colors">Faster Than Agencies</p>
                  </motion.div>
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* ═══════════ 4. HOW IT WORKS ═══════════ */}
          <section className="bg-brand-black py-20 sm:py-32 px-4 sm:px-8 relative overflow-hidden">
            <FloatingParticle x="90%" y="20%" size={6} color="bg-brand-teal/20" delay={0.5} />
            <FloatingParticle x="5%" y="60%" size={8} color="bg-brand-lavender/15" delay={1.5} />

            <div className="max-w-[1600px] mx-auto">
              <ScrollReveal>
                <div className="text-center mb-20">
                  <div className="inline-flex items-center gap-3 px-4 py-2 bg-brand-teal/5 rounded-full border border-brand-teal/10 mb-6">
                    <Layers size={14} className="text-brand-teal" />
                    <span className="text-[9px] font-black uppercase tracking-[0.4em] text-white">The Process</span>
                  </div>
                  <h2 className="text-3xl sm:text-5xl md:text-7xl font-serif font-black text-white leading-[0.9] uppercase">Three Steps to <span className="text-brand-teal italic">Revenue.</span></h2>
                </div>
              </ScrollReveal>

              <div className="grid md:grid-cols-3 gap-8">
                {[
                  { icon: Send, step: "01", title: "Tell Us Your Vision", desc: "Fill out a quick intake form. Business name, vibe, audience. Takes 5 minutes.", color: "from-brand-teal/10 to-brand-teal/5" },
                  { icon: Sparkles, step: "02", title: "AI Builds Your Brand", desc: "Our AI engine generates logos, color palettes, marketing copy, flyers, social posts, and more — in minutes.", color: "from-brand-lavender/10 to-brand-lavender/5" },
                  { icon: Rocket, step: "03", title: "Launch & Get Paid", desc: "Download your complete brand kit. Print your cards. Post your content. Start collecting payments.", color: "from-brand-teal/10 to-brand-lavender/5" },
                ].map((item, i) => (
                  <ScrollReveal key={i} delay={i * 0.15}>
                    <TiltCard className={`relative bg-gradient-to-br ${item.color} rounded-[2rem] p-10 border border-stone-100 group cursor-default h-full`}>
                      <div className="absolute top-6 right-6 text-[80px] font-serif font-black text-brand-black/[0.04] leading-none select-none">{item.step}</div>
                      <motion.div
                        whileHover={{ rotate: [0, -10, 10, 0] }}
                        transition={{ duration: 0.5 }}
                        className="w-14 h-14 bg-brand-black text-white rounded-2xl flex items-center justify-center mb-8 group-hover:shadow-xl group-hover:shadow-brand-teal/20 transition-shadow"
                      >
                        <item.icon size={22} />
                      </motion.div>
                      <h3 className="text-2xl font-black font-serif text-white uppercase tracking-tight mb-4">{item.title}</h3>
                      <p className="text-white/60 text-sm leading-relaxed font-medium">{item.desc}</p>
                      <div className="mt-6 h-1 w-0 group-hover:w-full bg-gradient-to-r from-brand-teal to-brand-lavender rounded-full transition-all duration-700" />
                    </TiltCard>
                  </ScrollReveal>
                ))}
              </div>
            </div>
          </section>

          {/* ═══════════ 5. VALUE PROPS ═══════════ */}
          <div className="bg-brand-black py-20 sm:py-32 border-y border-white/5 relative overflow-hidden">
            <FloatingParticle x="95%" y="10%" size={5} color="bg-brand-lavender/25" delay={0} />
            <FloatingParticle x="3%" y="80%" size={9} color="bg-brand-teal/20" delay={2} />

            <div className="max-w-[1600px] mx-auto px-4 sm:px-8">
              <ScrollReveal>
                <div className="grid lg:grid-cols-2 gap-10 lg:gap-20 items-end mb-16 sm:mb-24">
                  <div className="space-y-6">
                    <h2 className="text-3xl sm:text-5xl md:text-7xl font-serif font-black text-white leading-[0.9] uppercase">This Is How You <span className="text-brand-teal">Get Customers.</span></h2>
                    <p className="text-xl text-white/60 max-w-xl font-medium">We handle the branding, marketing, and materials so you can focus on what you're good at — doing the work and getting paid.</p>
                  </div>
                  <div className="flex justify-end">
                    <motion.div
                      className="text-right cursor-default"
                      whileHover={{ scale: 1.05 }}
                    >
                      <motion.span
                        className="text-7xl font-serif font-black gradient-text inline-block"
                        animate={{ scale: [1, 1.02, 1] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                      >98x</motion.span>
                      <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Faster Than Agencies</p>
                    </motion.div>
                  </div>
                </div>
              </ScrollReveal>

              <div className="grid md:grid-cols-3 gap-12 mb-32">
                {[
                  { num: "01", title: "Ready Today", desc: <>Agencies take 4-6 weeks. We build your logo, cards, flyers, and marketing plan in <span className="text-white font-bold">one session</span>. You leave with everything you need to get customers.</>, icon: Clock },
                  { num: "02", title: "Look Like a Franchise", desc: <>Professional logos, business cards, flyers, and marketing materials that look like they cost <span className="text-white font-bold">$5,000+</span>. Your customers will think you've been in business for 10 years.</>, icon: Award },
                  { num: "03", title: "Start Making Money", desc: <>Save over <span className="text-white font-bold">$4,500</span> vs hiring an agency. No retainer, no hourly billing — just a flat rate for everything you need to start getting paid.</>, icon: TrendingUp },
                ].map((item, i) => (
                  <ScrollReveal key={i} delay={i * 0.12}>
                    <TiltCard className="group space-y-8 p-8 rounded-[2rem] border border-transparent hover:border-brand-teal/20 hover:bg-brand-teal/[0.02] transition-all duration-500 cursor-default">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-brand-black text-white rounded-full flex items-center justify-center font-serif italic text-xl group-hover:bg-brand-teal group-hover:text-brand-black transition-colors duration-500">{item.num}</div>
                        <item.icon size={20} className="text-white/30 group-hover:text-brand-teal transition-colors" />
                      </div>
                      <h3 className="text-2xl font-black font-serif text-white uppercase tracking-tight">{item.title}</h3>
                      <p className="text-white/60 text-sm leading-relaxed font-medium">{item.desc}</p>
                    </TiltCard>
                  </ScrollReveal>
                ))}
              </div>

              {/* ═══════════ 6. COMPARISON TABLE ═══════════ */}
              <ScrollReveal>
                <motion.div
                  initial={{ opacity: 0, y: 60 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8 }}
                  className="bg-brand-black rounded-[2rem] sm:rounded-[4rem] p-6 sm:p-12 md:p-24 text-white shadow-2xl overflow-hidden relative"
                >
                  <div className="absolute top-0 right-0 w-96 h-96 bg-brand-teal/10 rounded-full blur-[120px] pointer-events-none"></div>
                  <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-lavender/10 rounded-full blur-[100px] pointer-events-none"></div>
                  <div className="relative z-10 max-w-4xl mx-auto">
                    <h3 className="text-3xl sm:text-4xl font-serif font-black text-center mb-10 sm:mb-16 uppercase tracking-tight">The Xela Advantage</h3>
                    <div className="space-y-4">
                      {[
                        { label: "Time to First Draft", agency: "2-4 Weeks", xela: "30 Minutes", highlight: true },
                        { label: "Logo + Business Cards + Flyers", agency: "$2,500+", xela: "Included" },
                        { label: "Marketing Plan to Get Customers", agency: "$1,500+", xela: "Included" },
                        { label: "Video Ad That Gets Clicks", agency: "$1,000+", xela: "Included" },
                        { label: "How Fast You Get It", agency: "4-6 Weeks", xela: "Today", highlight: true }
                      ].map((row, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -30 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: i * 0.12, duration: 0.5 }}
                          className="flex items-center justify-between gap-3 py-4 sm:py-6 border-b border-white/10 group hover:bg-white/5 transition-colors px-2 sm:px-4 rounded-xl"
                        >
                          <span className="text-sm sm:text-lg font-serif italic text-white/60 flex-1 min-w-0">{row.label}</span>
                          <div className="flex items-center gap-3 sm:gap-12 shrink-0">
                            <span className="text-xs sm:text-sm text-stone-600 line-through">{row.agency}</span>
                            <motion.span
                              whileHover={{ scale: 1.1 }}
                              className={`text-sm sm:text-lg font-black uppercase tracking-widest ${row.highlight ? 'text-brand-teal' : 'text-white'}`}
                            >
                              {row.xela}
                            </motion.span>
                          </div>
                        </motion.div>
                      ))}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.6 }}
                        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-8 sm:pt-12"
                      >
                        <span className="text-2xl sm:text-3xl font-serif font-black uppercase">Total Cost</span>
                        <div className="text-left sm:text-right">
                          <span className="block text-stone-600 line-through text-base sm:text-lg">$5,000+</span>
                          <span className="text-3xl sm:text-5xl font-black text-brand-teal">$75 – $2,000</span>
                        </div>
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              </ScrollReveal>
            </div>
          </div>

          {/* ═══════════ TESTIMONIALS SECTION ═══════════ */}
          <section className="bg-brand-black py-20 sm:py-32 px-4 sm:px-8 relative overflow-hidden">
            <FloatingParticle x="8%" y="20%" size={6} color="bg-brand-teal/20" delay={0.3} />
            <FloatingParticle x="92%" y="70%" size={5} color="bg-brand-lavender/20" delay={1.2} />
            <div className="max-w-[1600px] mx-auto">
              <ScrollReveal>
                <div className="text-center mb-20">
                  <div className="inline-flex items-center gap-3 px-4 py-2 bg-brand-teal/5 rounded-full border border-brand-teal/10 mb-6">
                    <Quote size={14} className="text-brand-teal" />
                    <span className="text-[9px] font-black uppercase tracking-[0.4em] text-white">Our Values</span>
                  </div>
                  <h2 className="text-3xl sm:text-5xl md:text-7xl font-serif font-black text-white leading-[0.9] uppercase">What We <span className="text-brand-teal italic">Believe.</span></h2>
                </div>
              </ScrollReveal>

              <div className="grid md:grid-cols-2 gap-8">
                {[
                  { icon: "✦", title: "Built With Integrity", quote: "Whatever you do, work at it with all your heart, as working for the Lord, not for human masters.", source: "Colossians 3:23" },
                  { icon: "✦", title: "Your Brand, Your Future", quote: "We don't cut corners. Every logo, every flyer, every word — crafted like it's for our own business. Because your success is our success.", source: "The XELA Promise" },
                  { icon: "✦", title: "AI + Human Heart", quote: "Technology handles the speed. We bring the soul. Every brand gets the same care — whether it's a $75 card set or a $2,000 full launch.", source: "Our Approach" },
                  { icon: "✦", title: "Florida Entrepreneurs First", quote: "We built XELA for the hustlers, the dreamers, the people working two jobs while building something on the side. You deserve to look legit.", source: "Why We Exist" },
                ].map((t, i) => (
                  <ScrollReveal key={i} delay={i * 0.15}>
                    <TiltCard className="bg-white/5 backdrop-blur rounded-2xl p-8 border border-white/10 shadow-lg border-l-4 border-l-brand-teal relative group cursor-default h-full hover:bg-white/[0.07] transition-colors">
                      <Quote size={40} className="absolute top-6 right-6 text-brand-teal/20" />
                      <span className="text-brand-teal text-2xl block mb-4">{t.icon}</span>
                      <h3 className="text-white font-black text-lg mb-3">{t.title}</h3>
                      <p className="text-white/70 text-base leading-relaxed font-medium italic mb-6">"{t.quote}"</p>
                      <div className="border-t border-white/10 pt-4">
                        <p className="text-brand-teal text-[10px] font-black uppercase tracking-widest">{t.source}</p>
                      </div>
                    </TiltCard>
                  </ScrollReveal>
                ))}
              </div>
            </div>
          </section>

          {/* ═══════════ BEFORE / AFTER SHOWCASE ═══════════ */}
          <section className="bg-brand-black py-20 sm:py-32 px-4 sm:px-8 relative overflow-hidden">
            <FloatingParticle x="5%" y="25%" size={7} color="bg-brand-lavender/20" delay={0.8} />
            <FloatingParticle x="88%" y="60%" size={5} color="bg-brand-teal/25" delay={1.5} />
            <div className="max-w-[1600px] mx-auto">
              <ScrollReveal>
                <div className="text-center mb-20">
                  <div className="inline-flex items-center gap-3 px-4 py-2 bg-white/5 rounded-full border border-white/10 mb-6">
                    <Layers size={14} className="text-brand-lavender" />
                    <span className="text-[9px] font-black uppercase tracking-[0.4em] text-white">Transformations</span>
                  </div>
                  <h2 className="text-3xl sm:text-5xl md:text-7xl font-serif font-black text-white leading-[0.9] uppercase">Before Xela. <span className="text-brand-teal italic">After Xela.</span></h2>
                </div>
              </ScrollReveal>

              <div className="grid md:grid-cols-3 gap-8">
                {[
                  {
                    before: "Blurry, washed out, no branding",
                    beforeImg: "/gallery/before-01.jpg",
                    after: "Professional vehicle wrap + custom logo + business cards + branded uniforms + yard signs",
                    afterImg: "/gallery/work-06.jpg"
                  },
                  {
                    before: "Low quality, no identity, forgettable",
                    beforeImg: "/gallery/before-02.jpg",
                    after: "Google Business Profile + Nextdoor + FB/IG ads + Google Ads + flyers + door hangers + email campaigns + SMS marketing",
                    afterImg: "/gallery/work-11.jpg"
                  },
                  {
                    before: "Amateur, cheap-looking, no trust",
                    beforeImg: "/gallery/before-03.jpg",
                    after: "Premium pricing + professional brand + testimonials + reviews + case studies + landing page + referral program",
                    afterImg: "/gallery/work-16.jpg"
                  },
                ].map((item, i) => (
                  <ScrollReveal key={i} delay={i * 0.15}>
                    <TiltCard className="bg-white/5 rounded-[2rem] p-6 border border-white/10 shadow-lg overflow-hidden group cursor-default h-full backdrop-blur">
                      <div className="space-y-5">
                        {/* BEFORE */}
                        <div className="relative rounded-xl overflow-hidden border border-white/5">
                          <div className="aspect-[4/3] overflow-hidden bg-white/[0.03]">
                            <img
                              src={item.beforeImg}
                              alt={`Before — ${item.before}`}
                              className="w-full h-full object-cover grayscale opacity-60 group-hover:opacity-70 transition-opacity duration-500"
                              loading="lazy"
                              width={400}
                              height={300}
                              decoding="async"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-brand-black/80 via-brand-black/20 to-transparent" />
                          </div>
                          <div className="absolute top-0 left-0 right-0 p-3 flex items-start justify-between">
                            <span className="text-xs font-black uppercase tracking-widest text-white bg-red-600/80 backdrop-blur px-3 py-1.5 rounded-lg shadow-lg">BEFORE</span>
                            <div className="w-6 h-6 rounded-full bg-red-500/30 backdrop-blur flex items-center justify-center">
                              <Minus size={12} className="text-red-300" />
                            </div>
                          </div>
                          <div className="absolute bottom-0 left-0 right-0 p-3">
                            <p className="text-white/80 text-xs font-medium italic">{item.before}</p>
                          </div>
                        </div>

                        {/* ARROW */}
                        <div className="flex justify-center">
                          <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            whileInView={{ scale: 1, opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.3 + i * 0.1 }}
                            className="w-10 h-10 rounded-full bg-brand-teal flex items-center justify-center shadow-lg shadow-brand-teal/40"
                          >
                            <ArrowDown size={18} className="text-brand-black" />
                          </motion.div>
                        </div>

                        {/* AFTER */}
                        <div className="relative rounded-xl overflow-hidden border border-brand-teal/30">
                          <div className="aspect-[4/3] overflow-hidden bg-brand-teal/5">
                            <img
                              src={item.afterImg}
                              alt={`After — ${item.after}`}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                              loading="lazy"
                              width={400}
                              height={300}
                              decoding="async"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-brand-teal/40 via-transparent to-transparent" />
                          </div>
                          <div className="absolute top-0 left-0 right-0 p-3 flex items-start justify-between">
                            <span className="text-xs font-black uppercase tracking-widest text-brand-black bg-brand-teal/90 backdrop-blur px-3 py-1.5 rounded-lg shadow-lg">AFTER</span>
                            <div className="w-6 h-6 rounded-full bg-brand-teal/30 backdrop-blur flex items-center justify-center">
                              <CheckCircle size={12} className="text-brand-teal" />
                            </div>
                          </div>
                        </div>
                        <p className="text-white text-xs font-bold leading-relaxed">{item.after}</p>
                      </div>
                    </TiltCard>
                  </ScrollReveal>
                ))}
              </div>
            </div>
          </section>

          {/* ═══════════ 7. PORTFOLIO PEEK — Small rotating gallery strip ═══════════ */}
          <section id="portfolio-peek" className="bg-brand-black py-16 sm:py-24 px-4 sm:px-8 relative overflow-hidden">
            <FloatingParticle x="10%" y="30%" size={6} color="bg-brand-teal/20" delay={0.5} />
            <FloatingParticle x="80%" y="70%" size={4} color="bg-brand-lavender/20" delay={1} />

            <div className="max-w-[1600px] mx-auto">
              <ScrollReveal>
                <div className="flex items-end justify-between mb-12">
                  <div>
                    <div className="inline-flex items-center gap-3 px-4 py-2 bg-white/5 rounded-full border border-white/10 mb-6">
                      <Palette size={14} className="text-brand-lavender" />
                      <span className="text-[9px] font-black uppercase tracking-[0.4em] text-white">Recent Work</span>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-serif font-black text-white uppercase tracking-tight">Logos. Flyers. Cards. <span className="text-brand-teal italic">Everything.</span></h2>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={scrollToPricing}
                    className="hidden md:flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors"
                  >
                    Want yours? <ArrowDown size={12} className="text-brand-teal" />
                  </motion.button>
                </div>
              </ScrollReveal>

              <ScrollReveal delay={0.2}>
                <PortfolioGallery />
              </ScrollReveal>

              <ScrollReveal delay={0.3}>
                <div className="mt-8 flex items-center gap-4 justify-center">
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4, 5].map(i => (
                      <div key={i} className="w-8 h-8 rounded-full border-2 border-white overflow-hidden">
                        <img src={`/gallery/work-${String(i + 10).padStart(2, '0')}.jpg`} alt={`Client work sample ${i + 1}`} className="w-full h-full object-cover" loading="lazy" width={32} height={32} />
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-white/60 font-medium">
                    Every brand built with <span className="text-white font-bold">heart and precision</span>
                  </p>
                </div>
              </ScrollReveal>
            </div>
          </section>

          {/* ═══════════ 7.5 CONSULTATION CTA SECTION ═══════════ */}
          <section id="consultation" className="bg-brand-black py-20 sm:py-32 px-4 sm:px-8 relative overflow-hidden">
            <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] bg-brand-teal/[0.04] rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/3 w-[300px] h-[300px] bg-brand-lavender/[0.04] rounded-full blur-[100px] pointer-events-none" />
            <div className="max-w-4xl mx-auto text-center relative z-10">
              <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4">Ready to Transform Your Brand?</h2>
              <p className="text-white/60 text-lg mb-16">Book your free consultation &mdash; no obligation, just clarity.</p>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
                <a href="tel:3213759685" className="group bg-white/5 border border-white/10 rounded-3xl p-6 sm:p-10 hover:bg-white/10 transition-all hover:scale-[1.02] text-center block">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-brand-teal/20 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
                    <Phone size={22} className="text-brand-teal sm:hidden" /><Phone size={28} className="text-brand-teal hidden sm:block" />
                  </div>
                  <h3 className="text-white text-base sm:text-xl font-black tracking-tight mb-2">(321) 375-9685</h3>
                  <p className="text-white/60 text-xs sm:text-sm">Call or Text Alex</p>
                </a>
                <button onClick={() => { setStep('consult'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="group bg-white/5 border border-white/10 rounded-3xl p-6 sm:p-10 hover:bg-white/10 transition-all hover:scale-[1.02] text-center block w-full">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-brand-lavender/20 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
                    <Send size={22} className="text-brand-lavender sm:hidden" /><Send size={28} className="text-brand-lavender hidden sm:block" />
                  </div>
                  <h3 className="text-white text-base sm:text-xl font-black tracking-tight mb-2">3-Minute Brand Quiz</h3>
                  <p className="text-white/60 text-xs sm:text-sm">Get a personalized quote instantly</p>
                </button>
                <button onClick={() => { setStep('chat'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="group bg-white/5 border border-white/10 rounded-3xl p-6 sm:p-10 hover:bg-white/10 transition-all hover:scale-[1.02] text-center block w-full">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-brand-teal/20 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
                    <MessageSquare size={22} className="text-brand-teal sm:hidden" /><MessageSquare size={28} className="text-brand-teal hidden sm:block" />
                  </div>
                  <h3 className="text-white text-base sm:text-xl font-black tracking-tight mb-2">Chat with Xela</h3>
                  <p className="text-white/60 text-xs sm:text-sm">AI-powered brand consultation</p>
                </button>
                <a href="mailto:xelabrandingstudio@gmail.com" className="group bg-white/5 border border-white/10 rounded-3xl p-6 sm:p-10 hover:bg-white/10 transition-all hover:scale-[1.02] text-center block">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-brand-lavender/20 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
                    <Mail size={22} className="text-brand-lavender sm:hidden" /><Mail size={28} className="text-brand-lavender hidden sm:block" />
                  </div>
                  <h3 className="text-white text-base sm:text-xl font-black tracking-tight mb-2">Email Us</h3>
                  <p className="text-white/60 text-xs sm:text-sm">xelabrandingstudio@gmail.com</p>
                </a>
              </div>
              <a
                href="https://www.google.com/search?q=XELA+Creative+Branding+Studio+Cocoa+FL"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-10 inline-flex items-center gap-2 px-8 py-4 bg-white/5 border border-white/10 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-all text-sm font-bold tracking-wide"
              >
                <Globe size={16} className="text-brand-teal" /> Find Us on Google <ExternalLink size={12} className="text-white/40" />
              </a>
            </div>
          </section>

          {/* ═══════════ 8. PRICING SECTION ═══════════ */}
          <div id="pricing">
            <Pricing onSelectPackage={handleSelectPackage} />
          </div>

          {/* ═══════════ TRUST GUARANTEE ═══════════ */}
          <TrustGuarantee />

          {/* ═══════════ FAQ ACCORDION ═══════════ */}
          <section className="bg-brand-black py-20 sm:py-32 px-4 sm:px-8 relative overflow-hidden">
            <FloatingParticle x="90%" y="15%" size={5} color="bg-brand-teal/15" delay={0.6} />
            <FloatingParticle x="8%" y="75%" size={7} color="bg-brand-lavender/15" delay={1.8} />
            <div className="max-w-3xl mx-auto">
              <ScrollReveal>
                <div className="text-center mb-16">
                  <div className="inline-flex items-center gap-3 px-4 py-2 bg-brand-teal/5 rounded-full border border-brand-teal/10 mb-6">
                    <Layers size={14} className="text-brand-teal" />
                    <span className="text-[9px] font-black uppercase tracking-[0.4em] text-white">FAQ</span>
                  </div>
                  <h2 className="text-3xl sm:text-5xl md:text-7xl font-serif font-black text-white leading-[0.9] uppercase">Got <span className="text-brand-teal italic">Questions?</span></h2>
                </div>
              </ScrollReveal>

              <div className="space-y-3">
                {[
                  { q: "How fast do I get my brand?", a: "Same day for most packages. The Ultimate Suite is delivered within 2 hours with priority." },
                  { q: "What if I don't like the design?", a: "We revise until you love it. Unlimited revisions on all packages above $350." },
                  { q: "Do I own everything you create?", a: "100%. Every file, every design, every word — it's yours forever. No licensing fees, no subscriptions." },
                  { q: "I don't have a business yet. Can I still start?", a: "Absolutely. Most of our clients come to us with just an idea. We help you name it, brand it, and launch it." },
                  { q: "What do I need to bring?", a: "Just your idea and your phone number. We handle everything else." },
                  { q: "How is this so affordable?", a: "AI-powered design + expert human review. We pass the savings to you because we want Florida businesses to win." },
                  { q: "Do you do websites?", a: "Yes! The Site Sales Solution ($1,200) includes a landing page. Full websites start at $1,500." },
                  { q: "Can I add services later?", a: "Yes. Start with any package and upgrade anytime. We keep your brand files on record." },
                ].map((faq, i) => (
                  <ScrollReveal key={i} delay={i * 0.06}>
                    <FaqItem question={faq.q} answer={faq.a} />
                  </ScrollReveal>
                ))}
              </div>
            </div>
          </section>

          {/* ═══════════ 9. FINAL CTA ═══════════ */}
          <section className="bg-gradient-to-br from-brand-black via-brand-black to-brand-black relative overflow-hidden py-20 sm:py-32 px-4 sm:px-8">
            <div className="absolute inset-0 bg-gradient-to-r from-brand-teal/10 via-transparent to-brand-lavender/10 pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-teal/[0.08] rounded-full blur-[150px] pointer-events-none" />
            <div className="max-w-3xl mx-auto text-center relative z-10">
              <ScrollReveal>
                <h2 className="text-4xl md:text-6xl font-serif font-black text-white leading-[0.9] uppercase mb-6">
                  Ready to Look <span className="text-brand-teal italic">Legit?</span>
                </h2>
                <p className="text-xl text-white/60 mb-4 font-medium">
                  Your competitors already have a brand. Your customers are choosing between you and someone who looks more professional.
                </p>
                <p className="text-lg text-white/50 mb-12">
                  We're your marketing team. Digital, print, everything. Call us or start your brand package now.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                  <motion.button
                    onClick={() => { setStep('consult'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-14 py-6 bg-brand-teal text-brand-black rounded-full text-xs font-black uppercase tracking-widest shadow-2xl shadow-brand-teal/30 hover:shadow-brand-teal/50 transition-all flex items-center gap-3"
                  >
                    Start Your Brand <Rocket size={16} />
                  </motion.button>
                  <a
                    href="tel:3213759685"
                    className="px-14 py-6 border-2 border-white/20 text-white rounded-full text-xs font-black uppercase tracking-widest hover:border-brand-teal hover:text-brand-teal transition-all flex items-center gap-3"
                  >
                    <Phone size={14} /> Call (321) 375-9685
                  </a>
                </div>
                <p className="text-[10px] text-stone-600 mt-8 font-bold uppercase tracking-widest">
                  Brevard County / Space Coast FL — Serving All of Florida
                </p>
              </ScrollReveal>
            </div>
          </section>

          {/* ═══════════ STICKY MOBILE CTA ═══════════ */}
          <StickyMobileCTA onCtaClick={scrollToPricing} />

          {/* ═══════════ 10. FOOTER ═══════════ */}
          <footer className="bg-brand-black text-stone-400 py-16 sm:py-24 px-4 sm:px-8 pb-36 sm:pb-24 mt-auto safe-bottom">
            <div className="max-w-[1600px] mx-auto grid sm:grid-cols-2 md:grid-cols-4 gap-10 sm:gap-16 text-xs leading-relaxed">
              <div className="col-span-2 space-y-6">
                <div className="flex items-center gap-3">
                  <img src="/xela-logo-new.png" alt="XELA Creative Branding Studio" className="h-10 sm:h-14 w-auto max-w-[160px] object-contain brightness-0 invert opacity-90" loading="lazy" width={140} height={56} />
                </div>
                <p className="max-w-sm">Your full-service marketing team. Digital, print, everything. Brevard County / Space Coast, FL — serving all of Florida.</p>
                <a href="tel:3213759685" className="flex items-center gap-2 text-brand-teal hover:text-white transition-colors mt-2">
                  <Phone size={12} /> (321) 375-9685 — Call or Text Alex
                </a>
                <a href="mailto:xelabrandingstudio@gmail.com" className="flex items-center gap-2 text-brand-lavender hover:text-white transition-colors mt-2">
                  <Mail size={12} /> xelabrandingstudio@gmail.com
                </a>

                {/* Contact icons row */}
                <div className="flex items-center gap-4 mt-4 flex-wrap">
                  <a href="tel:3213759685" className="flex items-center gap-1.5 text-stone-400 hover:text-brand-teal transition-colors" aria-label="Phone">
                    <Phone size={14} /> <span className="text-[10px] font-bold uppercase tracking-widest">Phone</span>
                  </a>
                  <span className="text-white/10">|</span>
                  <a href="mailto:xelabrandingstudio@gmail.com" className="flex items-center gap-1.5 text-stone-400 hover:text-brand-lavender transition-colors" aria-label="Email">
                    <Mail size={14} /> <span className="text-[10px] font-bold uppercase tracking-widest">Email</span>
                  </a>
                  <span className="text-white/10">|</span>
                  <a href="https://www.google.com/search?q=XELA+Creative+Branding+Studio+Cocoa+FL" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-stone-400 hover:text-brand-teal transition-colors" aria-label="Google Business">
                    <Globe size={14} /> <span className="text-[10px] font-bold uppercase tracking-widest">Google Business</span>
                  </a>
                  <span className="text-white/10">|</span>
                  <a href="https://xela-creative-branding.vercel.app" className="flex items-center gap-1.5 text-stone-400 hover:text-brand-lavender transition-colors" aria-label="Website">
                    <ExternalLink size={14} /> <span className="text-[10px] font-bold uppercase tracking-widest">Website</span>
                  </a>
                </div>

                <p className="mt-4">&copy; {new Date().getFullYear()} XELA Creative Branding Studio. All rights reserved.</p>
              </div>
              <div>
                <h4 className="text-white font-bold uppercase tracking-widest mb-4">Legal Disclaimer</h4>
                <p className="mb-2">
                  Xela is a branding automation tool, not a law firm. Information regarding LLC filing, business licenses, and insurance is for educational purposes only.
                </p>
                <p>
                  Consult with a qualified attorney or tax professional for advice specific to your business situation.
                </p>
              </div>
              <div>
                <h4 className="text-white font-bold uppercase tracking-widest mb-4">Quick Links</h4>
                <ul className="space-y-2">
                  <li><button onClick={() => { setStep('consult'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-white transition-colors text-left">Free Consultation</button></li>
                  <li><button onClick={scrollToPricing} className="hover:text-white transition-colors text-left">Pricing & Services</button></li>
                  <li><button onClick={scrollToPortfolio} className="hover:text-white transition-colors text-left">Our Portfolio</button></li>
                  <li><a href="tel:3213759685" className="hover:text-white transition-colors flex items-center gap-1"><Phone size={10} /> Call Us</a></li>
                  <li><a href="mailto:xelabrandingstudio@gmail.com" className="hover:text-white transition-colors flex items-center gap-1"><Mail size={10} /> Email Us</a></li>
                  <li><a href="https://www.google.com/search?q=XELA+Creative+Branding+Studio+Cocoa+FL" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors flex items-center gap-1"><Globe size={10} /> Google Business</a></li>
                  <li><button onClick={() => setIsPrivacyOpen(true)} className="hover:text-white transition-colors text-left">Privacy Policy</button></li>
                </ul>
              </div>
            </div>
          </footer>
        </main>
      )}

      {/* ═══════════ INTAKE STEP ═══════════ */}
      {step === 'intake' && (
        <div className="flex flex-col w-full min-h-screen bg-stone-50 animate-fade-in-up pt-24">
          <div className="py-6 px-6 border-b border-stone-200 bg-white flex justify-between items-center shadow-sm">
            <div className="text-left">
              <div className="text-[10px] font-black uppercase tracking-widest text-stone-400">Consultant: Xela</div>
            </div>
            <div className="text-right">
              <div className="text-xl font-serif font-black text-brand-teal capitalize italic">
                {selectedPackage === 'budget' ? 'The Seedling' : selectedPackage === 'premium' ? 'The Growth' : selectedPackage === 'elite' ? 'The Sovereign' : 'Custom'} Package
              </div>
            </div>
          </div>

          <div className="py-12 px-4 max-w-4xl mx-auto w-full space-y-8">
            <div className="mb-8 text-center">
              <h2 className="text-3xl font-serif font-black text-brand-black mb-2">Design Brief Intake</h2>
              <p className="text-stone-500">Tell us about your business so we can build your assets.</p>
            </div>

            {submitError && (
              <div className="mb-6 rounded-2xl bg-red-50 border border-red-200 px-5 py-4 flex items-start gap-3">
                <span className="text-red-500 text-xl leading-none mt-0.5">⚠</span>
                <p className="text-red-700 text-sm flex-1">{submitError}</p>
                <button
                  onClick={() => setSubmitError(null)}
                  className="text-red-400 hover:text-red-600 text-lg leading-none font-bold"
                  aria-label="Dismiss error"
                >
                  ×
                </button>
              </div>
            )}

            {/* Portfolio proof section - collapsible */}
            <IntakeGallery />

            <InputForm
              initialData={inputData}
              onSubmit={handleSubmit}
              onSaveDraft={handleSaveDraft}
              isLoading={isLoading}
              submitLabel="Generate Brand Strategy & Enter Studio"
            />
          </div>
        </div>
      )}

      {/* ═══════════ CONSULTATION WIZARD ═══════════ */}
      {step === 'consult' && (
        <div className="w-full min-h-screen relative pt-24">
          <ConsultationWizard
            onComplete={(_data) => {
              /* noop — consultation completion handled downstream */
            }}
            onSelectPackage={(tier) => {
              // Store tier only — do NOT navigate. The wizard's step 8
              // shows the quote; user chooses next action from there.
              setSelectedPackage(tier);
            }}
            onGetStarted={(tier) => {
              setSelectedPackage(tier);
              setInputData(null);
              setStep('intake');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        </div>
      )}

      {/* ═══════════ CHAT INTAKE ═══════════ */}
      {step === 'chat' && (
        <div className="w-full min-h-screen pt-20">
          <ChatIntake
            onComplete={(data) => {
              setInputData(data);
              handleSubmit(data);
            }}
            onSaveDraft={(data) => {
              setInputData(data);
            }}
          />
        </div>
      )}

      {/* ═══════════ INTAKE SHUFFLER ═══════════ */}
      {step === 'shuffle' && (
        <div className="w-full min-h-screen pt-20">
          <IntakeShuffler
            onComplete={(data) => {
              setInputData(data as BrandInput);
              handleSubmit(data as BrandInput);
            }}
            onSaveDraft={(data) => {
              setInputData(data as BrandInput);
            }}
          />
        </div>
      )}

      {/* ═══════════ PAYMENT SUCCESS ═══════════ */}
      {step === 'payment-success' && (
        <div className="min-h-screen bg-brand-black flex items-center justify-center p-8">
          <PaymentSuccessView onBack={() => { window.history.replaceState({}, '', '/'); setStep('dashboard'); }} />
        </div>
      )}

      {/* ═══════════ PAYMENT CANCELED ═══════════ */}
      {step === 'payment-canceled' && (
        <div className="min-h-screen bg-brand-black flex items-center justify-center p-8">
          <div className="max-w-md text-center space-y-6">
            <div className="w-20 h-20 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto">
              <ArrowLeft size={32} className="text-orange-400" />
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">Payment Canceled</h1>
            <p className="text-white/60 text-sm leading-relaxed">
              No worries — your checkout session was canceled and you have not been charged. You can try again whenever you're ready.
            </p>
            <button
              onClick={() => { window.history.replaceState({}, '', '/'); setStep('landing'); }}
              className="px-8 py-3 bg-brand-teal text-brand-black rounded-full font-black uppercase tracking-widest text-xs hover:scale-105 transition-transform"
            >
              Back to Pricing
            </button>
            <p className="text-[10px] text-white/30 mt-4">
              Questions? Call <a href="tel:3213759685" className="text-brand-teal">(321) 375-9685</a>
            </p>
          </div>
        </div>
      )}

      {/* ═══════════ DASHBOARD STEP ═══════════ */}
      {step === 'dashboard' && brandData && inputData && (
        <>
        {inputData.companyName === 'Velvet Bean Coffee Co.' && (
          <div className="sticky top-0 left-0 right-0 z-[100] bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 text-white text-center py-2.5 px-4 shadow-lg">
            <span className="text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2">
              <Eye size={14} /> THIS IS A DEMO — Sample output for Velvet Bean Coffee Co. <Eye size={14} />
            </span>
          </div>
        )}
        <Dashboard
          data={brandData}
          input={inputData}
          logoCandidates={logoCandidates}
          setLogoCandidates={setLogoCandidates}
          activeTemplate={activeTemplate}
          setActiveTemplate={setActiveTemplate}
          onSave={handleSave}
          onReset={handleReset}
          onOpenProjects={() => setIsProjectsModalOpen(true)}
          isSaving={isSaving}
          saveSuccess={saveSuccess}
          onPaymentRequest={() => setShowPayment(true)}
        />
      </>
      )}

      <ProjectsModal
        isOpen={isProjectsModalOpen}
        onClose={() => setIsProjectsModalOpen(false)}
        projects={projects}
        onLoad={handleLoadProject}
        onDelete={handleDeleteProject}
      />

      {/* ═══════════ PRIVACY POLICY MODAL ═══════════ */}
      {isPrivacyOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-fade-in-up" onClick={() => setIsPrivacyOpen(false)}>
          <div className="bg-stone-900 border border-stone-700 rounded-3xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-stone-700 flex justify-between items-center">
              <h2 className="text-xl font-serif font-bold text-white">Privacy Policy</h2>
              <button onClick={() => setIsPrivacyOpen(false)} className="p-2 hover:bg-stone-700 rounded-full transition-colors text-stone-400 hover:text-white">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-5 text-stone-300 text-sm leading-relaxed scrollbar-thin">
              <p className="text-stone-400 text-xs uppercase tracking-widest font-bold">XELA Creative Branding Studio</p>

              <div>
                <h3 className="text-white font-bold mb-1">Data We Collect</h3>
                <p>When you use our intake form or consultation wizard, we collect the information you provide: your name, email address, business name, and details about your branding needs. We do not collect data beyond what you voluntarily submit.</p>
              </div>

              <div>
                <h3 className="text-white font-bold mb-1">How We Use Your Data</h3>
                <p>Your information is used solely to provide branding services — generating brand packages, logos, marketing assets, and delivering your completed work. We do not sell, rent, or share your personal data with third parties for marketing purposes.</p>
              </div>

              <div>
                <h3 className="text-white font-bold mb-1">Third-Party Services</h3>
                <p>To deliver our services, we use the following third-party platforms:</p>
                <ul className="list-disc list-inside mt-1 space-y-1 text-stone-400">
                  <li><span className="text-stone-300">Firebase</span> — authentication and data storage</li>
                  <li><span className="text-stone-300">Stripe</span> — secure payment processing</li>
                  <li><span className="text-stone-300">Google Gemini</span> — AI-powered brand asset generation</li>
                </ul>
                <p className="mt-2">Each service operates under its own privacy policy. We only share the minimum data necessary for each service to function.</p>
              </div>

              <div>
                <h3 className="text-white font-bold mb-1">Data Retention & Deletion</h3>
                <p>You may request export or deletion of your data at any time by contacting us. We retain project data only as long as needed to deliver your services.</p>
              </div>

              <div>
                <h3 className="text-white font-bold mb-1">Contact</h3>
                <p>Questions about this policy? Reach us at <a href="mailto:xelabrandingstudio@gmail.com" className="text-brand-teal hover:underline">xelabrandingstudio@gmail.com</a></p>
              </div>

              <p className="text-stone-500 text-xs pt-2 border-t border-stone-700">Last updated: April 2026</p>
            </div>
          </div>
        </div>
      )}

      <SmartNav
        currentView={step}
        scrollY={scrollY}
        hasInteractedSinceAutoNav={hasInteractedSinceAutoNav}
        onAutoNavFired={() => setHasInteractedSinceAutoNav(false)}
        onNavigate={(view) => {
          if (view === 'consult') { setStep('consult'); window.scrollTo({ top: 0, behavior: 'smooth' }); }
          else if (view === 'chat') { setStep('chat'); window.scrollTo({ top: 0, behavior: 'smooth' }); }
          else if (view === 'shuffle') { setStep('shuffle'); window.scrollTo({ top: 0, behavior: 'smooth' }); }
          else if (view === 'intake') { setSelectedPackage('premium'); setStep('intake'); window.scrollTo({ top: 0, behavior: 'smooth' }); }
          else if (view === 'landing') { handleReset(); }
          else if (view === 'dashboard') { /* already there */ }
        }}
      />
      <LiveAssistant />
      <FloatingCTA />
      <VariantBanner />
      <AlexSignalPanel services={inputData?.services || []} />
      <MobileBottomNav
        currentView={step}
        onNavigate={(view) => {
          if (view === 'landing') { setStep('landing'); window.scrollTo({ top: 0, behavior: 'smooth' }); }
          if (view === 'consult') { setStep('consult'); window.scrollTo({ top: 0, behavior: 'smooth' }); }
        }}
        onScrollToPricing={scrollToPricing}
        onScrollToPortfolio={scrollToPortfolio}
      />

      {/* ═══════════ PAYMENT OPTIONS MODAL ═══════════ */}
      <AnimatePresence>
        {showPayment && selectedPackage && (
          <PaymentOptions
            selectedTier={selectedPackage}
            customerName={inputData?.ownerName}
            customerEmail={inputData?.email}
            onContinue={() => setShowPayment(false)}
            onDismiss={() => setShowPayment(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

const AppWithErrorBoundary: React.FC = () => (
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);

export default AppWithErrorBoundary;

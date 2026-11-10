
import React, { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { LoadingOverlay } from './components/LoadingOverlay';
import { AleXelALogo } from './components/XelaLogo';
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
import StudioLanding from './components/StudioLanding';
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
    <div className="bg-brand-black rounded-3xl border border-brand-teal/25 shadow-lg overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
        aria-label={isExpanded ? 'Collapse recent work gallery' : 'Expand recent work gallery'}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Eye size={16} className="text-brand-teal" />
          <span className="text-sm font-black uppercase tracking-widest text-white">Our Recent Work</span>
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
                  <img src={src} alt={`AleXelA creative portfolio example ${i + 1}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" loading="lazy" width={200} height={200} />
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
const passionMission = "Stop working only to build someone else's dream while your own talents go unfulfilled. Do what you love, develop a real business around it, and discover how your passion can become profitable.";

const taglines = [
  "From Passion to Profit.",
  "From Idea to Income.",
  "From Pain to Purpose.",
  "FIRE YOUR BOSS!",
  "Brand It. Launch It. Own It.",
  "Look Legit. Get Paid.",
  "Your Brand, Ready Today.",
  "Stop Looking Like a Side Hustle.",
  "Built With Heart. Delivered With Care.",
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
      <span className="block text-brand-teal italic">{taglines[index]}</span>
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
  const [pendingSection, setPendingSection] = useState<string|null>(null);
  useEffect(() => {
    if (step === 'landing' && pendingSection) {
      document.getElementById(pendingSection)?.scrollIntoView({behavior:'smooth',block:'start'});
      setPendingSection(null);
    }
  }, [step, pendingSection]);
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
      landing: 'AleXelA Creative Branding Studio | Passion to Profit Creative Branding Studio',
      consult: 'Free Brand Consultation | AleXelA Creative Branding Studio',
      dashboard: 'Your Brand Dashboard | AleXelA Creative Branding Studio',
      chat: 'AI Brand Chat | AleXelA Creative Branding Studio',
      intake: 'Brand Intake | AleXelA Creative Branding Studio',
      shuffle: 'Brand Explorer | AleXelA Creative Branding Studio',
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

  const scrollToSection = (id: string) => {
    if (step !== 'landing') {setPendingSection(id);setStep('landing');}
    else document.getElementById(id)?.scrollIntoView({behavior:'smooth',block:'start'});
  };
  const scrollToPricing = () => scrollToSection('pricing');
  const scrollToPortfolio = () => scrollToSection('portfolio-peek');

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
              <a href="/" className="px-6 py-3 bg-brand-teal text-brand-black rounded-full font-bold uppercase tracking-widest text-xs inline-block">Visit AleXelA Studio</a>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="sg-app w-full flex flex-col min-h-screen bg-brand-black">
      {/* Skip to main content — accessibility */}
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-[9999] focus:top-4 focus:left-4 focus:px-6 focus:py-3 focus:bg-brand-teal focus:text-brand-black focus:rounded-full focus:font-black focus:text-sm focus:uppercase focus:tracking-widest">
        Skip to main content
      </a>
      {/* Global logo watermark — 25% opacity, adds dimension */}
      <div className="fixed inset-0 pointer-events-none z-0 flex items-center justify-center overflow-hidden">
        <motion.img
          src="/alexela-logo-cutout.png"
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
              src="/alexela-logo-cutout.png"
              alt="AleXelA"
              width={160}
              height={64}
              className="h-9 sm:h-12 md:h-16 w-auto max-w-[120px] sm:max-w-none object-contain group-hover:scale-105 transition-transform"
              style={{
                filter: 'none',
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

      {step === 'landing' && <StudioLanding
        onConsult={() => { setStep('consult'); window.scrollTo({top:0}); }}
        onChat={() => { setStep('chat'); window.scrollTo({top:0}); }}
        onSample={handleLoadSample}
        onPrivacy={() => setIsPrivacyOpen(true)}
      />}

      {/* ═══════════ INTAKE STEP ═══════════ */}
      {step === 'intake' && (
        <div className="flex flex-col w-full min-h-screen bg-brand-black animate-fade-in-up pt-24">
          <div className="py-6 px-6 border-b border-white/15 bg-brand-black flex justify-between items-center shadow-sm">
            <div className="text-left">
              <div className="text-[10px] font-black uppercase tracking-widest text-white/60">Consultant: AleXelA</div>
            </div>
            <div className="text-right">
              <div className="text-xl font-serif font-black text-brand-teal capitalize italic">
                {selectedPackage === 'budget' ? 'Get Started' : selectedPackage === 'premium' ? 'Get Customers' : selectedPackage === 'elite' ? 'Get Everything' : 'Custom'} · Design Brief
              </div>
            </div>
          </div>

          <div className="py-12 px-4 max-w-4xl mx-auto w-full space-y-8">
            <div className="mb-8 text-center">
              <h2 className="text-3xl font-serif font-black text-white mb-2">Design Brief Intake</h2>
              <p className="text-white/70">Tell us about your business so we can build your assets.</p>
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
              <p className="text-stone-400 text-xs uppercase tracking-widest font-bold">AleXelA Creative Branding Studio</p>

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
        onScrollToPricing={scrollToPricing}
        currentView={step}
        scrollY={scrollY}
        hasInteractedSinceAutoNav={hasInteractedSinceAutoNav}
        onAutoNavFired={() => setHasInteractedSinceAutoNav(false)}
        onNavigate={(view) => {
          if (view === 'consult') { setStep('consult'); window.scrollTo({ top: 0, behavior: 'smooth' }); }
          else if (view === 'chat') { setStep('chat'); window.scrollTo({ top: 0, behavior: 'smooth' }); }
          else if (view === 'shuffle') { setStep('shuffle'); window.scrollTo({ top: 0, behavior: 'smooth' }); }
          else if (view === 'intake') { if (brandData && inputData) handleSave(brandData,inputData,logoCandidates,activeTemplate); setInputData(null); setSelectedPackage(null); setStep('intake'); window.scrollTo({ top: 0, behavior: 'smooth' }); }
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

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BrandInput } from '../types';
import { MapPin, Users, Briefcase, Type, ArrowLeft, Sparkles, Plus, X, Loader2, ChevronRight, Upload, Phone, Mail, Zap, User, Calendar, CheckCircle2, Building2, Save, Award, Globe, Check } from 'lucide-react';
import { generateBusinessNames, generateMottos, generateLogoConcepts } from '../services/geminiService';

interface InputFormProps {
  initialData?: BrandInput | null;
  onSubmit: (data: BrandInput) => void;
  onSaveDraft: (data: BrandInput) => void;
  isLoading: boolean;
  submitLabel?: string;
}

const VIBE_OPTIONS = [
  "Modern & Minimalist", "Rustic & Traditional", "Eco-Friendly & Organic", 
  "Industrial & Rugged", "Luxury & High-End", "Friendly & Local", "Bold & Energetic", "Professional & Corporate",
  "Classic & Timeless", "Exclusive & Private", "High-Tech & Futuristic", "Artsy & Creative", "Vintage & Retro",
  "Dark & Gothic", "Bright & Playful", "Spiritual & Holistic", "Elegant & Sophisticated", "Neoclassical & Grand"
];

const INDUSTRY_SERVICES: Record<string, string[]> = {
  // --- ARTS & CREATIVE ---
  "Tattoo Artistry": ["Custom Design", "Black & Grey Realism", "American Traditional", "Cover-Ups", "Fine Line", "Microblading", "Body Piercing", "Cosmetic Tattooing", "Flash Tattoos", "Japanese Irezumi"],
  "Fine Art & Canvas": ["Oil Painting", "Acrylics", "Watercolor", "Commissioned Portraits", "Abstract Art", "Live Painting", "Gallery Exhibition", "Art Restoration", "Mixed Media", "Charcoal & Sketching"],
  "Performing Arts": ["Live Vocals", "Instrumental Performance", "Acting & Theater", "Dance Performance", "Circus Arts", "Magic & Illusion", "Stand-Up Comedy", "Spoken Word", "Event Emcee", "Voice Acting"],
  "Digital & Concept Art": ["Character Design", "Environment Art", "3D Modeling", "NFT Creation", "Game Asset Design", "Vector Illustration", "Matte Painting", "Digital Portraits", "Concept Art", "Storyboard"],
  "Mural & Street Art": ["Large Scale Murals", "Graffiti Art", "Public Installations", "Sign Painting", "Trompe-l'œil", "Chalk Art", "Vinyl Wall Graphics", "Community Art Projects"],
  "Sculpting & Ceramics": ["Pottery Wheel", "Clay Sculpting", "Metal Casting", "Wood Carving", "Glass Blowing", "Stone Carving", "3D Printing", "Mold Making", "Ceramic Glazing"],
  "Makeup Artistry & FX": ["Bridal Makeup", "Special FX (SFX)", "Theatrical Makeup", "Editorial/High Fashion", "Airbrushing", "Prosthetics", "Body Painting", "Film & TV Makeup"],
  "Photography": ["Wedding Photography", "Portraiture", "Product Photography", "Real Estate Photography", "Newborn & Maternity", "Event Coverage", "Fashion Photography", "Boudoir", "Drone Photography", "Film Photography"],
  "Videography": ["Wedding Films", "Music Videos", "Corporate Promo", "Documentary", "Social Media Content", "Drone Cinematography", "Post-Production/Editing", "Live Streaming", "Animation"],
  "Graphic Design": ["Logo Design", "Branding Identity", "Web Design (UI/UX)", "Print Layout", "Packaging Design", "Social Media Graphics", "Typography", "Infographics", "Book Cover Design"],
  "Fashion Design": ["Custom Apparel", "Pattern Making", "Tailoring & Alterations", "Costume Design", "Sustainable Fashion", "Accessory Design", "Textile Design", "Runway Styling"],
  "Interior Design": ["Residential Design", "Commercial Spaces", "Home Staging", "Space Planning", "Color Consultation", "Furniture Sourcing", "Lighting Design", "Kitchen & Bath Design"],
  "Music Production": ["Mixing & Mastering", "Beat Making", "Recording Studio", "Sound Design", "Jingle Composition", "Podcast Editing", "Audio Restoration", "Session Musician"],
  "Writing & Copywriting": ["Blog Writing", "Technical Writing", "Ghostwriting", "Ad Copy", "Grant Writing", "Scriptwriting", "Editing & Proofreading", "Resume Writing", "Creative Writing"],

  // --- TRADES & HOME SERVICES ---
  "General Contracting": ["New Construction", "Remodeling", "Project Management", "Site Preparation", "Demolition", "Framing", "Drywall", "Painting", "Flooring", "Roofing", "Siding"],
  "Plumbing & Septic": ["Leak Repair", "Drain Cleaning", "Water Heater Install", "Pipe Replacement", "Septic Pumping", "Gas Lines", "Emergency Services", "Backflow Testing"],
  "Electrical Services": ["Wiring & Rewiring", "Panel Upgrades", "Lighting Install", "Generator Install", "Smart Home Automation", "EV Charger Install", "Surge Protection", "Troubleshooting"],
  "HVAC & Refrigeration": ["AC Repair", "Furnace Installation", "Duct Cleaning", "System Maintenance", "Thermostat Install", "Commercial Refrigeration", "Ventilation", "Air Quality"],
  "Landscaping & Lawn": ["Lawn Mowing", "Landscape Design", "Irrigation/Sprinklers", "Hardscaping (Pavers)", "Sod Installation", "Mulching", "Tree Planting", "Outdoor Lighting"],
  "Tree Service": ["Tree Trimming", "Tree Removal", "Stump Grinding", "Storm Cleanup", "Arborist Consultation", "Moss Removal", "Palm Maintenance", "Emergency Service"],
  "Roofing & Gutters": ["Roof Replacement", "Leak Repair", "Shingle Roofing", "Metal Roofing", "Gutter Cleaning", "Gutter Installation", "Roof Inspections", "Skylight Install"],
  "Flooring & Tiling": ["Hardwood Install", "Carpet Installation", "Tile Setting", "Grout Cleaning", "Floor Refinishing", "Laminate/Vinyl", "Epoxy Coating", "Subfloor Repair"],
  "Handyman Services": ["Furniture Assembly", "TV Mounting", "Drywall Patching", "Door Repair", "Fixture Installation", "Shelf Hanging", "Minor Painting", "Smart Lock Install"],
  "Cleaning (Residential)": ["Deep Cleaning", "Move-In/Move-Out", "Regular Maintenance", "Carpet Cleaning", "Window Washing", "Organizing", "Post-Construction", "Laundry Service"],
  "Cleaning (Commercial)": ["Janitorial Services", "Office Cleaning", "Floor Buffing/Waxing", "Sanitization", "Window Cleaning", "Industrial Cleaning", "Pressure Washing"],
  "Pressure Washing": ["Driveway Cleaning", "Roof Soft Wash", "Deck Restoration", "Fence Cleaning", "Graffiti Removal", "Commercial Exterior", "Gutter Brightening", "Fleet Washing"],
  "Pest Control": ["Termite Treatment", "Mosquito Control", "Rodent Removal", "Bed Bug Treatment", "General Pest Control", "Wildlife Removal", "Insulation"],
  "Pool & Spa": ["Pool Cleaning", "Chemical Balancing", "Equipment Repair", "Leak Detection", "Resurfacing", "Hot Tub Maintenance", "Pool Opening/Closing", "Pool Inspections"],
  "Locksmith & Security": ["Emergency Lockout", "Key Duplication", "Lock Installation", "Security Systems", "Safe Opening", "Rekeying", "Car Key Programming", "Access Control"],
  "Moving & Storage": ["Local Moving", "Long Distance", "Packing Services", "Furniture Hoisting", "Storage Solutions", "Junk Removal", "Piano Moving", "Office Relocation"],
  "Solar Energy": ["Panel Installation", "Battery Backup", "System Maintenance", "Solar Cleaning", "Energy Audit", "Inverter Repair", "Off-Grid Setup"],
  
  // --- AUTOMOTIVE & TRANSPORT ---
  "Auto Repair & Mechanic": ["Oil Change", "Brake Repair", "Engine Diagnostics", "Transmission", "Suspension", "AC Service", "Battery Replacement", "Exhaust Systems"],
  "Auto Detailing": ["Exterior Wash", "Interior Detail", "Ceramic Coating", "Paint Correction", "Waxing", "Headlight Restoration", "Odor Removal", "Engine Bay Cleaning"],
  "Auto Body & Paint": ["Dent Repair", "Collision Repair", "Paint Matching", "Frame Straightening", "Bumper Repair", "Scratch Removal", "Rust Repair"],
  "Auto Upholstery": ["Seat Repair", "Headliner Replacement", "Custom Interiors", "Convertible Tops", "Carpet Replacement", "Dashboard Restoration", "Door Panels"],
  "Towing & Roadside": ["Emergency Towing", "Lockout Service", "Jump Starts", "Tire Changes", "Fuel Delivery", "Winch Out", "Flatbed Towing", "Heavy Duty Towing"],
  "Car Dealership": ["New Car Sales", "Used Car Sales", "Financing", "Trade-Ins", "Leasing", "Fleet Services", "Auto Insurance", "Warranty Services"],
  "Black Car & Limo": ["Airport Transfers", "Wedding Chauffeur", "Corporate Travel", "Party Bus", "Prom Service", "Executive Protection", "Wine Tours"],
  "Window Tinting": ["Auto Tinting", "Residential Tinting", "Commercial Tinting", "Security Film", "Decorative Film", "Paint Protection Film (PPF)", "Vinyl Wraps"],

  // --- HEALTH, BEAUTY & WELLNESS ---
  "Barbershop": ["Men's Haircuts", "Beard Trims", "Hot Towel Shave", "Fade Cuts", "Line Ups", "Facials", "Hair Design", "Scalp Treatment"],
  "Hair Salon": ["Women's Cuts", "Coloring/Highlights", "Balayage", "Extensions", "Blowouts", "Keratin Treatment", "Perms", "Bridal Styling"],
  "Nail Salon": ["Manicures", "Pedicures", "Acrylics", "Gel Polish", "Nail Art", "Dip Powder", "Paraffin Wax", "Nail Repair"],
  "Esthetician & Spa": ["Facials", "Chemical Peels", "Microdermabrasion", "Waxing", "Eyelash Extensions", "Brow Lamination", "Body Wraps", "Laser Hair Removal"],
  "Massage Therapy": ["Deep Tissue", "Swedish Massage", "Sports Massage", "Hot Stone", "Prenatal Massage", "Reflexology", "Cupping Therapy", "Aromatherapy"],
  "Personal Training": ["1-on-1 Coaching", "Group Fitness", "Nutrition Plans", "Strength Training", "Weight Loss", "Online Coaching", "Senior Fitness", "Athletic Conditioning"],
  "Yoga & Pilates": ["Vinyasa Flow", "Hatha Yoga", "Reformer Pilates", "Mat Pilates", "Hot Yoga", "Meditation", "Prenatal Yoga", "Private Sessions"],
  "Chiropractic": ["Spinal Adjustment", "Physical Therapy", "Decompression", "Massage", "Rehabilitation", "Sports Injury", "Wellness Care"],
  "Mental Health": ["Counseling", "Psychotherapy", "Couples Therapy", "Family Therapy", "CBT", "Trauma Therapy", "Life Coaching", "Support Groups"],
  "Med Spa": ["Botox/Fillers", "CoolSculpting", "IV Therapy", "Microneedling", "Laser Skin Resurfacing", "PRP Therapy", "Hormone Therapy"],

  // --- PROFESSIONAL SERVICES ---
  "Legal Services": ["Family Law", "Criminal Defense", "Personal Injury", "Estate Planning", "Business Law", "Immigration", "Real Estate Law", "Intellectual Property"],
  "Accounting & Tax": ["Tax Preparation", "Bookkeeping", "Payroll", "Auditing", "Financial Planning", "Business Consulting", "QuickBooks Training", "CFO Services"],
  "Real Estate Agent": ["Buying", "Selling", "Luxury Homes", "First-Time Buyers", "Commercial Real Estate", "Land Sales", "Relocation", "Property Management"],
  "Consulting": ["Business Strategy", "Marketing Consulting", "HR Consulting", "IT Consulting", "Financial Consulting", "Management Consulting", "Operations", "Sustainability"],
  "Notary Public": ["Mobile Notary", "Loan Signing", "Remote Online Notary", "Legal Document Notarization", "Wedding Officiant", "Apostille Services"],
  "Virtual Assistant": ["Admin Support", "Email Management", "Scheduling", "Data Entry", "Social Media Mgmt", "Customer Service", "Travel Booking", "Research"],
  "Translation": ["Document Translation", "Simultaneous Interpretation", "Localization", "Transcription", "Subtitling", "Proofreading", "Certified Translation"],

  // --- EVENTS & HOSPITALITY ---
  "Event Planning": ["Wedding Planning", "Corporate Events", "Party Planning", "Day-of Coordination", "Destination Weddings", "Proposal Planning", "Fundraisers"],
  "DJ & Entertainment": ["Wedding DJ", "Club DJ", "Karaoke Host", "Live Bands", "Lighting Design", "Photo Booth", "Silent Disco", "MC Services"],
  "Catering": ["Wedding Catering", "Corporate Lunch", "Private Chef", "Food Truck", "Buffet Service", "Grazing Tables", "Bartending", "Cake Design"],
  "Florist": ["Wedding Florals", "Bouquets", "Event Centerpieces", "Funeral Arrangements", "Flower Delivery", "Floral Subscription", "Corsages"],
  "Venue Rental": ["Wedding Venue", "Conference Center", "Party Hall", "Studio Rental", "Coworking Space", "Vacation Rental", "Meeting Rooms"],

  // --- TECH & DIGITAL ---
  "Web Development": ["Custom Websites", "E-commerce (Shopify/Woo)", "WordPress", "App Development", "Maintenance", "Hosting", "API Integration", "Landing Pages"],
  "IT Support": ["Computer Repair", "Network Setup", "Cybersecurity", "Data Recovery", "Cloud Services", "Hardware Upgrades", "Virus Removal", "Remote Support"],
  "Digital Marketing": ["SEO", "PPC (Google Ads)", "Social Media Ads", "Email Marketing", "Content Marketing", "Influencer Marketing", "Analytics", "Lead Generation"],
  "Software (SaaS)": ["B2B Software", "Mobile Apps", "Cloud Solutions", "AI Tools", "CRM Systems", "Project Management Tools", "Educational Tech"],

  // --- PETS ---
  "Pet Grooming": ["Dog Bathing", "Haircuts", "Nail Trimming", "Ear Cleaning", "De-shedding", "Teeth Brushing", "Cat Grooming", "Mobile Grooming"],
  "Pet Sitting": ["Dog Walking", "Overnight Sitting", "Drop-in Visits", "House Sitting", "Cat Care", "Bird/Exotic Care", "Medication Admin"],
  "Dog Training": ["Obedience", "Puppy Training", "Behavior Modification", "Agility", "Service Dog Training", "Board & Train", "Therapy Dog"],
  "Veterinary": ["Wellness Exams", "Vaccinations", "Surgery", "Dental Care", "Emergency Care", "Spay/Neuter", "Microchipping", "Holistic Vet"],

  // --- RETAIL & FOOD ---
  "Retail Store": ["Clothing Boutique", "Home Goods", "Gift Shop", "Electronics", "Bookstore", "Thrift/Vintage", "Sporting Goods", "Toy Store"],
  "E-Commerce": ["Online Store", "Dropshipping", "Handmade Crafts (Etsy)", "Digital Products", "Subscription Box", "Print on Demand", "Direct to Consumer"],
  "Restaurant": ["Fine Dining", "Casual Dining", "Fast Food", "Cafe/Bistro", "Pizzeria", "Steakhouse", "Vegan/Vegetarian", "Ethnic Cuisine"],
  "Bakery": ["Custom Cakes", "Pastries", "Bread", "Donuts", "Cookies", "Wedding Desserts", "Gluten-Free", "Bagels"],
  "Coffee Shop": ["Espresso Bar", "Cold Brew", "Tea Selection", "Roastery", "Smoothies", "Breakfast Items", "Mobile Coffee Cart"],
  "Bar & Lounge": ["Cocktail Bar", "Sports Bar", "Wine Bar", "Brewery", "Pub", "Nightclub", "Hookah Lounge", "Speakeasy"]
};

const COMMON_INDUSTRIES = Object.keys(INDUSTRY_SERVICES).sort();

const STEPS = [
  { id: 'foundation', title: 'The Foundation', icon: Building2, desc: 'Core business details' },
  { id: 'identity', title: 'Naming', icon: Type, desc: 'What should we call you?' },
  { id: 'vibe', title: 'Personality', icon: Zap, desc: 'How does it feel?' },
  { id: 'reach', title: 'Connectivity', icon: Globe, desc: 'How do customers reach you?' },
  { id: 'visuals', title: 'Visuals', icon: Upload, desc: 'First look' }
];

export const InputForm: React.FC<InputFormProps> = ({ initialData, onSubmit, onSaveDraft, isLoading, submitLabel }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<BrandInput>(initialData || {
    companyName: '',
    ownerName: '',
    businessSuffix: '',
    industry: '',
    services: [],
    vibe: '',
    location: '',
    audience: '',
    additionalNotes: '',
    existingLogo: undefined,
    existingMotto: '',
    existingTagline: '',
    yearsExperience: '',
    phone: '',
    email: '',
    website: '',
    googleBusinessLink: '',
    bookingLink: '',
    qrPreference: 'website'
  });
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [industrySearch, setIndustrySearch] = useState('');
  const [showIndustrySuggestions, setShowIndustrySuggestions] = useState(false);
  const [serviceSearch, setServiceSearch] = useState('');
  const [showServiceSuggestions, setShowServiceSuggestions] = useState(false);

  // AI Generation States
  const [isGeneratingNames, setIsGeneratingNames] = useState(false);
  const [generatedNames, setGeneratedNames] = useState<string[]>([]);
  const [isGeneratingLogo, setIsGeneratingLogo] = useState(false);

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, STEPS.length - 1));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 0));

  const handleAddService = (service: string) => {
    const s = service.trim();
    if (s && !formData.services.includes(s)) {
      setFormData(prev => ({ ...prev, services: [...prev.services, s] }));
      setServiceSearch('');
      setShowServiceSuggestions(false);
    }
  };

  const handleManualAddService = (e?: React.FormEvent) => {
    e?.preventDefault();
    handleAddService(serviceSearch);
  };

  const getSelectedIndustries = () => formData.industry.split(', ').filter(Boolean);

  const handleAddIndustry = (ind: string) => {
    if (!ind) return;
    const current = getSelectedIndustries();
    if (!current.includes(ind)) {
        const updated = [...current, ind].join(', ');
        setFormData({ ...formData, industry: updated });
    }
    setIndustrySearch('');
    setShowIndustrySuggestions(false);
  };

  const handleRemoveIndustry = (ind: string) => {
    const current = getSelectedIndustries();
    const updated = current.filter(i => i !== ind).join(', ');
    setFormData({ ...formData, industry: updated });
  };

  const filteredIndustries = COMMON_INDUSTRIES.filter(i => 
    i.toLowerCase().includes(industrySearch.toLowerCase()) && !formData.industry.includes(i)
  );

  const allServices = Array.from(new Set(Object.values(INDUSTRY_SERVICES).flat()));
  const filteredServices = allServices.filter(s => 
    s.toLowerCase().includes(serviceSearch.toLowerCase()) && !formData.services.includes(s)
  );

  const [nameKeywords, setNameKeywords] = useState('');

  const handleGenerateNames = async () => {
    if (!formData.industry || !formData.location) return;
    setIsGeneratingNames(true);
    try {
        const names = await generateBusinessNames(formData.industry, formData.vibe || "Professional", formData.location, nameKeywords);
        setGeneratedNames(names);
    } catch (e) { console.error(e); } finally { setIsGeneratingNames(false); }
  };

  const handleGenerateLogo = async () => {
    if (!formData.companyName || !formData.industry) return;
    setIsGeneratingLogo(true);
    try {
        const style = formData.vibe?.includes('Neoclassical') ? 'Neoclassical' : 'Minimalist';
        const concepts = await generateLogoConcepts(formData, style, '#111111');
        if (concepts && concepts.length > 0) {
            setFormData(prev => ({ ...prev, existingLogo: concepts[0].imageUrl }));
        }
    } catch(e) { console.error(e); } finally { setIsGeneratingLogo(false); }
  };

  const handleSave = () => {
    onSaveDraft(formData);
    setSaveMessage("Draft Saved!");
    setTimeout(() => setSaveMessage(null), 2000);
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 0: return !!(formData.industry && formData.location);
      case 1: return !!formData.companyName;
      case 2: return !!(formData.vibe && formData.audience && formData.services.length > 0);
      case 3: return !!(formData.ownerName && formData.phone);
      default: return true;
    }
  };

  // Helper to get suggested services based on selected industries
  const getSuggestedServices = () => {
    const selected = getSelectedIndustries();
    const allSuggestions = selected.flatMap(ind => INDUSTRY_SERVICES[ind] || []);
    // Filter out already selected services
    return [...new Set(allSuggestions)].filter(s => !formData.services.includes(s));
  };

  const renderProgress = () => (
    <div className="flex flex-col gap-6 mb-8">
      <div className="flex justify-end">
          <button
            type="button"
            onClick={handleSave}
            className={`flex items-center gap-2 px-4 py-2 rounded-full bg-stone-100 font-black uppercase tracking-widest text-[10px] transition-all hover:bg-brand-teal hover:text-white ${saveMessage ? 'text-green-600' : 'text-white/60'}`}
          >
            {saveMessage ? <CheckCircle2 size={14} /> : <Save size={14} />} 
            {saveMessage || 'Save Progress'}
          </button>
      </div>

      <div className="flex justify-between relative">
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-stone-100 -translate-y-1/2 z-0"></div>
        <div className="absolute top-1/2 left-0 h-0.5 bg-brand-teal -translate-y-1/2 z-0 transition-all duration-700 ease-out" style={{ width: `${(currentStep / (STEPS.length - 1)) * 100}%` }}></div>
        {STEPS.map((step, idx) => {
          const isActive = idx === currentStep;
          const isCompleted = idx < currentStep;
          return (
            <div key={step.id} className="relative z-10 flex flex-col items-center group cursor-pointer" onClick={() => idx < currentStep && setCurrentStep(idx)}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 border-2 ${
                isActive ? 'bg-brand-black border-brand-black text-white scale-110 shadow-lg ring-4 ring-brand-black/10 animate-pulse' :
                isCompleted ? 'bg-brand-teal border-brand-teal text-white hover:scale-105' : 'bg-white border-stone-200 text-stone-300'
              }`}>
                {isCompleted ? <CheckCircle2 size={20} /> : <step.icon size={16} />}
              </div>
              <div className={`absolute top-12 whitespace-nowrap text-center transition-all duration-300 ${isActive ? 'opacity-100 translate-y-0' : isCompleted ? 'opacity-70 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'}`}>
                  <p className={`text-[10px] font-black uppercase tracking-widest ${isActive ? 'text-brand-black' : 'text-brand-teal'}`}>{step.title}</p>
                  {isActive && <p className="text-[8px] text-white/40 mt-0.5">{step.desc}</p>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="glass p-8 md:p-14 rounded-[3.5rem] shadow-2xl relative overflow-hidden bg-white/[0.03] border border-white/10 min-h-[600px] flex flex-col"
      >
        {/* Decorative gradient orbs */}
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-brand-teal/[0.08] rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-brand-lavender/[0.08] rounded-full blur-[80px] pointer-events-none" />
        {renderProgress()}

        <div className="flex-1 mt-6">
          {currentStep === 0 && (
            <div className="space-y-8 animate-fade-in-up">
              <motion.div initial={{ opacity: 0, y: -15 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
                <span className="text-[9px] font-black uppercase tracking-[0.4em] text-brand-teal inline-block px-4 py-1.5 rounded-full bg-brand-teal/5 border border-brand-teal/10 mb-4">Step 1 of 5</span>
                <h3 className="text-4xl md:text-5xl font-serif font-black text-white">The Foundation</h3>
                <p className="text-white/60 mt-3 text-lg font-medium">Every empire starts with the dirt it's built on.</p>
              </motion.div>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <label className="flex items-center gap-3 text-[11px] font-black text-white uppercase tracking-[0.3em] ml-2">
                    <Briefcase size={16} className="text-brand-lavender" /> Business Sector(s) <span className="text-red-500">*</span>
                  </label>
                  <p className="text-[10px] text-white/40 ml-2 -mt-2 italic">Multi-industry? Go for it. We build hybrid brands daily.</p>

                  {/* Selected Industries Tags */}
                  <div className="flex flex-wrap gap-2 min-h-[40px] p-2 rounded-2xl bg-white/5 border-2 border-dashed border-white/10">
                    {getSelectedIndustries().length === 0 && <span className="text-sm text-white/40 font-bold self-center px-2 italic">Pick your lane (or several)</span>}
                    {getSelectedIndustries().map(ind => (
                      <span key={ind} className="px-3 py-1.5 bg-brand-black text-white rounded-lg text-xs font-bold flex items-center gap-2 animate-fade-in-up">
                        {ind}
                        <button onClick={() => handleRemoveIndustry(ind)} className="hover:text-brand-lavender transition-colors"><X size={12}/></button>
                      </span>
                    ))}
                    {getSelectedIndustries().length >= 3 && (
                      <span className="self-center text-[9px] text-brand-lavender font-bold ml-1">multi-threat. we see you.</span>
                    )}
                  </div>

                  <div className="relative">
                    <input
                      type="text"
                      autoFocus
                      placeholder="Barbershop, Landscaping, Tattoo..."
                      className="w-full p-5 rounded-2xl bg-white/5 border-2 border-white/20 text-white placeholder:text-white/30 focus:border-brand-teal outline-none transition-all font-bold"
                      value={industrySearch}
                      onChange={(e) => {
                        setIndustrySearch(e.target.value);
                        setShowIndustrySuggestions(true);
                      }}
                      onFocus={() => setShowIndustrySuggestions(true)}
                      onBlur={() => setTimeout(() => setShowIndustrySuggestions(false), 200)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && industrySearch.trim()) {
                          e.preventDefault();
                          if (filteredIndustries.length > 0) {
                            handleAddIndustry(filteredIndustries[0]);
                          } else {
                            handleAddIndustry(industrySearch.trim());
                          }
                        }
                      }}
                    />
                    {showIndustrySuggestions && industrySearch && (
                      <div className="absolute z-20 w-full mt-2 bg-brand-black border-2 border-white/10 rounded-2xl shadow-xl max-h-60 overflow-y-auto">
                        {filteredIndustries.length > 0 ? (
                          filteredIndustries.map(i => (
                            <div
                              key={i}
                              tabIndex={0}
                              role="option"
                              className="p-4 hover:bg-white/5 focus:bg-brand-teal/10 focus:outline-none cursor-pointer font-bold text-sm text-white border-b border-white/10 last:border-0 transition-colors duration-150 hover:pl-6"
                              onMouseDown={() => handleAddIndustry(i)}
                              onKeyDown={(e) => e.key === 'Enter' && handleAddIndustry(i)}
                            >
                              {i}
                              <span className="text-[9px] text-white/40 ml-2">({(INDUSTRY_SERVICES[i] || []).length} services)</span>
                            </div>
                          ))
                        ) : (
                          <div
                            className="p-4 hover:bg-stone-50 cursor-pointer font-bold text-sm text-brand-teal"
                            onMouseDown={() => handleAddIndustry(industrySearch.trim())}
                          >
                            + Add "{industrySearch}" — your niche, your rules
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="flex items-center gap-3 text-[11px] font-black text-white uppercase tracking-[0.3em] ml-2">
                    <MapPin size={16} className="text-brand-lavender" /> Your Service Area <span className="text-red-500">*</span>
                  </label>
                  <p className="text-[10px] text-white/40 ml-2 -mt-2 italic">City, county, or "everywhere" — we'll tailor the marketing.</p>
                  <input
                    type="text"
                    placeholder="Where are your customers? (e.g. Melbourne, FL)"
                    className="w-full p-5 rounded-2xl bg-white/5 border-2 border-white/20 text-white placeholder:text-white/30 focus:border-brand-teal outline-none transition-all font-bold"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                  />
                </div>

                <div className="md:col-span-2 space-y-4">
                  <label className="flex items-center gap-3 text-[11px] font-black text-white uppercase tracking-[0.3em] ml-2">
                    <Award size={16} className="text-brand-lavender" /> Years of Experience
                  </label>
                  <p className="text-[10px] text-white/40 ml-2 -mt-2 italic">This goes on your cards and ads. "15 Years" hits different than nothing.</p>
                  <input
                    type="text"
                    placeholder="e.g. 15 Years"
                    className="w-full p-5 rounded-2xl bg-white/5 border-2 border-white/20 text-white placeholder:text-white/30 focus:border-brand-teal outline-none transition-all font-bold"
                    value={formData.yearsExperience}
                    onChange={(e) => setFormData({...formData, yearsExperience: e.target.value})}
                  />
                </div>
              </div>

              {/* Completion hint */}
              <div className="flex items-center justify-center gap-2 pt-4">
                <div className={`w-2 h-2 rounded-full ${formData.industry ? 'bg-green-500' : 'bg-stone-200'}`} />
                <div className={`w-2 h-2 rounded-full ${formData.location ? 'bg-green-500' : 'bg-stone-200'}`} />
                <span className="text-[9px] text-white/40 font-bold uppercase tracking-widest ml-2">
                  {formData.industry && formData.location ? 'locked in. let\'s move.' : 'fill both to proceed'}
                </span>
              </div>

              {/* Brand promise */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
                className="text-center pt-4 border-t border-stone-100 mt-6">
                <p className="text-[10px] text-stone-300 font-bold uppercase tracking-widest">
                  "Whatever you do, work at it with all your heart" — Col 3:23
                </p>
              </motion.div>
            </div>
          )}

          {currentStep === 1 && (
            <div className="space-y-8 animate-fade-in-up">
              <motion.div initial={{ opacity: 0, y: -15 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
                <span className="text-[9px] font-black uppercase tracking-[0.4em] text-brand-lavender inline-block px-4 py-1.5 rounded-full bg-brand-lavender/5 border border-brand-lavender/10 mb-4">Step 2 of 5</span>
                <h3 className="text-4xl md:text-5xl font-serif font-black text-white">The Name</h3>
                <p className="text-white/60 mt-3 text-lg font-medium">This is the thing people Google. Make it count.</p>
              </motion.div>

              <div className="space-y-4">
                <label className="flex items-center gap-3 text-[11px] font-black text-white uppercase tracking-[0.3em] ml-2">
                  <Type size={16} className="text-brand-lavender" /> Company Name <span className="text-red-500">*</span>
                </label>
                <p className="text-[10px] text-white/40 ml-2 -mt-2 italic">We'll check Sunbiz availability and build every asset around this.</p>
                <div className="flex gap-4">
                  <input
                    type="text"
                    autoFocus
                    className="flex-1 p-5 rounded-2xl bg-white/5 border-2 border-white/20 text-white placeholder:text-white/30 focus:border-brand-teal outline-none transition-all text-xl font-serif font-black"
                    placeholder="What's your brand called?"
                    value={formData.companyName}
                    onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                  />
                  <select
                    className="w-1/4 p-5 rounded-2xl bg-white/5 border-2 border-white/20 text-white focus:border-brand-teal outline-none font-black text-[10px] uppercase"
                    value={formData.businessSuffix}
                    onChange={(e) => setFormData({...formData, businessSuffix: e.target.value})}
                  >
                    <option value="">No suffix</option>
                    <option value="LLC">LLC</option>
                    <option value="Inc.">Inc.</option>
                    <option value="Co.">Co.</option>
                    <option value="Corp.">Corp.</option>
                    <option value="Group">Group</option>
                    <option value="Studio">Studio</option>
                    <option value="Labs">Labs</option>
                  </select>
                </div>
                {formData.companyName && (
                  <div className="flex items-center gap-3 px-4 py-3 bg-stone-50 rounded-xl">
                    <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">Preview:</span>
                    <span className="text-lg font-serif font-black text-brand-black">
                      {formData.companyName}{formData.businessSuffix ? ` ${formData.businessSuffix}` : ''}
                    </span>
                  </div>
                )}
              </div>

              {/* Existing Motto/Tagline */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-2">Existing Motto / Slogan</label>
                  <input
                    type="text"
                    className="w-full p-4 rounded-xl border border-stone-200 text-sm focus:border-brand-teal outline-none font-bold"
                    placeholder="Got one? Drop it. No? We'll create one."
                    value={formData.existingMotto || ''}
                    onChange={(e) => setFormData({...formData, existingMotto: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-2">Existing Tagline</label>
                  <input
                    type="text"
                    className="w-full p-4 rounded-xl border border-stone-200 text-sm focus:border-brand-teal outline-none font-bold"
                    placeholder="A catchphrase, a hook, your elevator pitch"
                    value={formData.existingTagline || ''}
                    onChange={(e) => setFormData({...formData, existingTagline: e.target.value})}
                  />
                </div>
              </div>

              <div className="p-8 bg-stone-50 rounded-[2.5rem] border border-stone-200 border-dashed">
                <div className="mb-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-black uppercase tracking-widest text-white/40">Stuck? Let the AI throw some names at the wall.</h4>
                    <span className="text-[9px] text-white/40 italic">powered by Gemini</span>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Vibes, keywords, feelings... (e.g. sharp, fresh, elite)"
                      className="flex-1 p-3 rounded-xl border border-stone-200 text-sm focus:border-brand-teal outline-none"
                      value={nameKeywords}
                      onChange={(e) => setNameKeywords(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleGenerateNames()}
                    />
                    <button
                      type="button"
                      onClick={handleGenerateNames}
                      disabled={isGeneratingNames}
                      className="text-[10px] bg-brand-black text-white px-4 py-2 rounded-xl font-black uppercase tracking-widest hover:bg-brand-teal transition-all flex items-center gap-2"
                    >
                      {isGeneratingNames ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                      Generate
                    </button>
                  </div>
                </div>
                {generatedNames.length > 0 && (
                  <div className="space-y-3">
                    <p className="text-[9px] text-white/40 font-bold uppercase tracking-widest">Tap one to claim it:</p>
                    <div className="grid grid-cols-2 gap-3">
                      {generatedNames.map(name => (
                        <button
                          key={name}
                          onClick={() => setFormData({...formData, companyName: name})}
                          className={`text-left p-4 rounded-xl border-2 transition-all font-bold text-sm ${formData.companyName === name ? 'bg-brand-black border-brand-black text-white shadow-lg' : 'bg-white border-stone-100 hover:border-brand-teal'}`}
                        >
                          {name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-8 animate-fade-in-up">
              <motion.div initial={{ opacity: 0, y: -15 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
                <span className="text-[9px] font-black uppercase tracking-[0.4em] text-brand-teal inline-block px-4 py-1.5 rounded-full bg-brand-teal/5 border border-brand-teal/10 mb-4">Step 3 of 5</span>
                <h3 className="text-4xl md:text-5xl font-serif font-black text-white">Personality</h3>
                <p className="text-white/60 mt-3 text-lg font-medium">Your vibe attracts your tribe. Let's define it.</p>
              </motion.div>

              <div className="space-y-8">
                <div className="space-y-4">
                  <label className="flex items-center gap-3 text-[11px] font-black text-white uppercase tracking-[0.3em] ml-2">
                    <Zap size={16} className="text-brand-lavender" /> Brand vibe <span className="text-red-500">*</span>
                  </label>
                  <div className="flex flex-wrap gap-2 max-h-[280px] overflow-y-auto p-3 rounded-2xl border-2 border-white/20 bg-white/5">
                    {VIBE_OPTIONS.map(v => {
                      const isSelected = formData.vibe === v;
                      return (
                        <button
                          key={v}
                          type="button"
                          onClick={() => setFormData({...formData, vibe: isSelected ? '' : v})}
                          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 ease-out flex items-center gap-2 ${
                            isSelected
                              ? 'bg-brand-black text-white shadow-lg scale-105 ring-2 ring-brand-teal/30'
                              : 'bg-white/5 text-white/60 hover:bg-white/10 hover:shadow-md hover:scale-[1.02] active:scale-95'
                          }`}
                        >
                          {isSelected && <Check size={12} className="animate-fade-in-up" />}
                          {v}
                        </button>
                      );
                    })}
                  </div>
                  {!formData.vibe && <p className="text-[9px] text-white/40 italic ml-2">Pick the one that feels like you</p>}
                  {formData.vibe && <p className="text-[9px] text-brand-teal font-bold ml-2">Vibe locked: {formData.vibe}</p>}
                </div>

                <div className="space-y-4">
                  <label className="flex items-center gap-3 text-[11px] font-black text-white uppercase tracking-[0.3em] ml-2">
                    <Users size={16} className="text-brand-lavender" /> Ideal Client
                  </label>
                  <input
                    type="text"
                    autoFocus
                    placeholder="Who's paying you? (e.g. Luxury Homeowners, Young Professionals)"
                    className="w-full p-5 rounded-2xl bg-white/5 border-2 border-white/20 text-white placeholder:text-white/30 font-bold outline-none focus:border-brand-teal transition-all"
                    value={formData.audience}
                    onChange={(e) => setFormData({...formData, audience: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <label className="flex items-center gap-3 text-[11px] font-black text-white uppercase tracking-[0.3em] ml-2">
                  <Briefcase size={16} className="text-brand-lavender" /> Your Services
                </label>

                {/* Selected Services — the goods */}
                <div className="flex flex-wrap gap-2 mb-4 min-h-[40px] p-3 rounded-2xl bg-stone-50/50 border border-dashed border-stone-200">
                    {formData.services.length === 0 && (
                      <span className="text-sm text-white/40 font-bold self-center px-2 italic">
                        Nothing here yet — let's fix that, shall we?
                      </span>
                    )}
                    {formData.services.map(s => (
                        <span key={s} className="px-4 py-2 bg-stone-900 text-white rounded-full text-[10px] font-black uppercase flex items-center gap-2 animate-fade-in-up">
                            {s} <button onClick={() => setFormData({...formData, services: formData.services.filter(serv => serv !== s)})} className="hover:text-red-400 transition-colors"><X size={12}/></button>
                        </span>
                    ))}
                    {formData.services.length > 0 && formData.services.length < 3 && (
                      <span className="self-center text-[9px] text-white/40 italic ml-2">psst... more services = better results</span>
                    )}
                    {formData.services.length >= 8 && (
                      <span className="self-center text-[9px] text-brand-lavender font-bold ml-2">okay you're going all in — respect</span>
                    )}
                </div>

                {/* Quick-Add from Package Deliverables — seamless cross-package picker */}
                <div className="p-5 bg-gradient-to-br from-stone-50 to-white rounded-2xl border border-stone-100 space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/40 flex items-center gap-2">
                      <Sparkles size={12} className="text-brand-lavender" /> Quick-add from our packages
                    </p>
                    <span className="text-[9px] text-white/40 italic">tap to add — duplicates? we don't do those.</span>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: 'Print & Physical', color: 'brand-teal', items: ['Business Cards', 'Vinyl Stickers', 'Flyers & Print', 'Sticker System', 'Full Print Suite'] },
                      { label: 'Digital & Marketing', color: 'brand-lavender', items: ['Logo Design', 'Social Media Pack', 'Email Templates', 'Content Calendar', 'Landing Page Mockup', 'Video Ad'] },
                      { label: 'Strategy & Legal', color: 'brand-black', items: ['Brand Guidelines', 'Competitor Analysis', 'LLC Naming Scan', 'Marketing Strategy', 'Startup Checklist', 'Local Ad Strategy'] },
                    ].map((group) => (
                      <div key={group.label} className="space-y-2">
                        <p className={`text-[8px] font-black uppercase tracking-widest text-${group.color} px-1`}>{group.label}</p>
                        <div className="flex flex-col gap-1.5">
                          {group.items.map((item) => {
                            const isSelected = formData.services.includes(item);
                            return (
                              <button
                                key={item}
                                type="button"
                                onClick={() => !isSelected && handleAddService(item)}
                                className={`text-left px-3 py-2 rounded-lg text-[10px] font-bold transition-all flex items-center gap-2 ${
                                  isSelected
                                    ? 'bg-stone-900 text-white cursor-default'
                                    : 'bg-white border border-stone-100 text-stone-600 hover:bg-stone-900 hover:text-white hover:border-stone-900 hover:shadow-md'
                                }`}
                              >
                                {isSelected ? <Check size={10} /> : <Plus size={10} className="opacity-40" />}
                                {item}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Suggestions based on Industry */}
                {getSelectedIndustries().length > 0 && getSuggestedServices().length > 0 && (
                   <div className="mb-4">
                      <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-2 flex items-center gap-2">
                        <Zap size={10} className="text-brand-teal" /> Tailored to your industry — because we actually pay attention
                      </p>
                      <div className="flex flex-wrap gap-2">
                         {getSuggestedServices().slice(0, 15).map((s: string) => (
                           <button
                             key={s}
                             onClick={() => handleAddService(s)}
                             className="px-3 py-1.5 rounded-lg border border-stone-200 bg-stone-50 text-xs font-bold text-stone-600 hover:bg-brand-black hover:text-white hover:border-brand-black transition-all flex items-center gap-1"
                           >
                             <Plus size={10} /> {s}
                           </button>
                         ))}
                      </div>
                   </div>
                )}

                <div className="relative flex gap-2">
                    <input
                      type="text"
                      placeholder="Something custom? Type it — we won't judge..."
                      className="flex-1 p-4 rounded-xl border-2 border-stone-200 outline-none focus:border-brand-teal font-bold"
                      value={serviceSearch}
                      onChange={(e) => {
                        setServiceSearch(e.target.value);
                        setShowServiceSuggestions(true);
                      }}
                      onFocus={() => setShowServiceSuggestions(true)}
                      onBlur={() => setTimeout(() => setShowServiceSuggestions(false), 200)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && serviceSearch.trim()) {
                          e.preventDefault();
                          if (filteredServices.length > 0) {
                            handleAddService(filteredServices[0]);
                          } else {
                            handleManualAddService(e);
                          }
                        }
                      }}
                    />
                    <button onClick={handleManualAddService} className="p-4 bg-brand-black text-white rounded-xl hover:bg-brand-teal transition-all"><Plus/></button>

                    {showServiceSuggestions && serviceSearch && (
                      <div className="absolute top-full left-0 right-16 z-20 mt-2 bg-brand-black border-2 border-white/10 rounded-2xl shadow-xl max-h-60 overflow-y-auto">
                        {filteredServices.length > 0 ? (
                          filteredServices.map(s => (
                            <div
                              key={s}
                              className={`p-4 cursor-pointer font-bold text-sm border-b border-stone-100 last:border-0 ${
                                formData.services.includes(s)
                                  ? 'bg-stone-50 text-stone-300 cursor-default'
                                  : 'hover:bg-stone-50'
                              }`}
                              onMouseDown={() => !formData.services.includes(s) && handleAddService(s)}
                            >
                              {formData.services.includes(s) ? `${s} ✓ already added` : s}
                            </div>
                          ))
                        ) : (
                          <div
                            className="p-4 hover:bg-stone-50 cursor-pointer font-bold text-sm text-brand-teal"
                            onMouseDown={() => handleAddService(serviceSearch.trim())}
                          >
                            + Add "{serviceSearch}" — bold move, we like it
                          </div>
                        )}
                      </div>
                    )}
                </div>

                <div className="mt-8 pt-8 border-t border-stone-100">
                   <details className="group">
                      <summary className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/40 cursor-pointer hover:text-brand-black transition-colors">
                         <Plus size={12} /> Already have brand statements? Flex on us.
                      </summary>
                      <div className="mt-6 space-y-6 animate-fade-in-up">
                          <div className="space-y-2">
                             <label className="text-xs font-bold text-stone-600">Existing Mission Statement</label>
                             <textarea
                               className="w-full p-4 rounded-xl border border-stone-200 text-sm focus:border-brand-teal outline-none min-h-[80px]"
                               placeholder="Drop that mission — we'll make it hit different."
                               value={formData.existingMission || ''}
                               onChange={(e) => setFormData({...formData, existingMission: e.target.value})}
                             />
                          </div>
                          <div className="space-y-2">
                             <label className="text-xs font-bold text-stone-600">Existing Vision Statement</label>
                             <textarea
                               className="w-full p-4 rounded-xl border border-stone-200 text-sm focus:border-brand-teal outline-none min-h-[80px]"
                               placeholder="Where are you taking this empire?"
                               value={formData.existingVision || ''}
                               onChange={(e) => setFormData({...formData, existingVision: e.target.value})}
                             />
                          </div>
                          <div className="space-y-2">
                             <label className="text-xs font-bold text-stone-600">Existing Brand Voice/Values</label>
                             <input
                               type="text"
                               className="w-full p-4 rounded-xl border border-stone-200 text-sm focus:border-brand-teal outline-none"
                               placeholder="e.g. Friendly, Professional, Trustworthy — or Unhinged, we don't gatekeep"
                               value={formData.existingVoice || ''}
                               onChange={(e) => setFormData({...formData, existingVoice: e.target.value})}
                             />
                          </div>
                      </div>
                   </details>
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-8 animate-fade-in-up">
              <motion.div initial={{ opacity: 0, y: -15 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
                <span className="text-[9px] font-black uppercase tracking-[0.4em] text-brand-lavender inline-block px-4 py-1.5 rounded-full bg-brand-lavender/5 border border-brand-lavender/10 mb-4">Step 4 of 5</span>
                <h3 className="text-4xl md:text-5xl font-serif font-black text-white">Connectivity</h3>
                <p className="text-white/60 mt-3 text-lg font-medium">These go on every card, flyer, and QR code we build.</p>
              </motion.div>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <label className="flex items-center gap-3 text-[11px] font-black text-white uppercase tracking-[0.3em] ml-2">
                    <User size={16} className="text-brand-lavender" /> Owner / Operator Name
                  </label>
                  <p className="text-[10px] text-white/40 ml-2 -mt-2 italic">The face behind the brand. Goes on business cards.</p>
                  <input type="text" autoFocus placeholder="The face behind the brand" className="w-full p-5 rounded-2xl bg-white/5 border-2 border-white/20 text-white placeholder:text-white/30 font-bold outline-none focus:border-brand-teal" value={formData.ownerName} onChange={(e) => setFormData({...formData, ownerName: e.target.value})} />
                </div>
                <div className="space-y-4">
                  <label className="flex items-center gap-3 text-[11px] font-black text-white uppercase tracking-[0.3em] ml-2">
                    <Phone size={16} className="text-brand-lavender" /> Business Phone
                  </label>
                  <p className="text-[10px] text-white/40 ml-2 -mt-2 italic">This goes on every physical asset we produce.</p>
                  <input type="tel" placeholder="(321) 555-0123" className="w-full p-5 rounded-2xl bg-white/5 border-2 border-white/20 text-white placeholder:text-white/30 font-bold outline-none focus:border-brand-teal" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
                </div>
                <div className="space-y-4">
                  <label className="flex items-center gap-3 text-[11px] font-black text-white uppercase tracking-[0.3em] ml-2">
                    <Mail size={16} className="text-brand-lavender" /> Business Email
                  </label>
                  <p className="text-[10px] text-white/40 ml-2 -mt-2 italic">Pro tip: name@yourdomain.com looks 10x more legit than Gmail.</p>
                  <input type="email" placeholder="you@yourbusiness.com" className="w-full p-5 rounded-2xl bg-white/5 border-2 border-white/20 text-white placeholder:text-white/30 font-bold outline-none focus:border-brand-teal" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                </div>
                <div className="space-y-4">
                  <label className="flex items-center gap-3 text-[11px] font-black text-white uppercase tracking-[0.3em] ml-2">
                    <Calendar size={16} className="text-brand-lavender" /> Booking Link
                  </label>
                  <p className="text-[10px] text-white/40 ml-2 -mt-2 italic">Calendly, Square, Booksy — wherever clients grab a spot.</p>
                  <input type="url" placeholder="https://calendly.com/yourname" className="w-full p-5 rounded-2xl bg-white/5 border-2 border-white/20 text-white placeholder:text-white/30 font-bold outline-none focus:border-brand-teal" value={formData.bookingLink} onChange={(e) => setFormData({...formData, bookingLink: e.target.value})} />
                </div>
                <div className="space-y-4">
                  <label className="flex items-center gap-3 text-[11px] font-black text-white uppercase tracking-[0.3em] ml-2">
                    <Globe size={16} className="text-brand-lavender" /> Website
                  </label>
                  <p className="text-[10px] text-white/40 ml-2 -mt-2 italic">Don't have one? That's literally why we're here.</p>
                  <input type="url" placeholder="https://yourbusiness.com" className="w-full p-5 rounded-2xl bg-white/5 border-2 border-white/20 text-white placeholder:text-white/30 font-bold outline-none focus:border-brand-teal" value={formData.website} onChange={(e) => setFormData({...formData, website: e.target.value})} />
                </div>
                <div className="space-y-4">
                  <label className="flex items-center gap-3 text-[11px] font-black text-white uppercase tracking-[0.3em] ml-2">
                    <MapPin size={16} className="text-brand-lavender" /> Google Business Link
                  </label>
                  <p className="text-[10px] text-white/40 ml-2 -mt-2 italic">Gets embedded in your QR code. Free leads while you sleep.</p>
                  <input type="url" placeholder="https://maps.google.com/..." className="w-full p-5 rounded-2xl bg-white/5 border-2 border-white/20 text-white placeholder:text-white/30 font-bold outline-none focus:border-brand-teal" value={formData.googleBusinessLink} onChange={(e) => setFormData({...formData, googleBusinessLink: e.target.value})} />
                </div>
              </div>

              {/* QR Code Preference */}
              <div className="p-5 bg-stone-50 rounded-2xl border border-stone-100 space-y-3">
                <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Where should your QR code point?</p>
                <div className="flex flex-wrap gap-2">
                  {([
                    { value: 'website', label: 'Website', hint: 'Your homepage' },
                    { value: 'google', label: 'Google Business', hint: 'Reviews & map' },
                    { value: 'booking', label: 'Booking Page', hint: 'Direct appointments' },
                    { value: 'contact', label: 'Contact Card', hint: 'Save your info' },
                  ] as const).map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setFormData({...formData, qrPreference: opt.value})}
                      className={`px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                        formData.qrPreference === opt.value
                          ? 'bg-brand-black text-white shadow-lg'
                          : 'bg-white border border-stone-200 text-white/60 hover:border-brand-teal'
                      }`}
                    >
                      {opt.label}
                      <span className={`block text-[8px] font-medium normal-case tracking-normal mt-0.5 ${formData.qrPreference === opt.value ? 'text-white/60' : 'text-white/40'}`}>{opt.hint}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-8 animate-fade-in-up">
              <motion.div initial={{ opacity: 0, y: -15 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
                <span className="text-[9px] font-black uppercase tracking-[0.4em] text-brand-teal inline-block px-4 py-1.5 rounded-full bg-brand-teal/5 border border-brand-teal/10 mb-4">Step 5 of 5 -- Almost There</span>
                <h3 className="text-4xl md:text-5xl font-serif font-black text-white">The First Impression</h3>
                <p className="text-white/60 mt-3 text-lg font-medium">A logo isn't just art -- it's the first 3 seconds of trust.</p>
              </motion.div>

              {/* Logo status selector */}
              <div className="flex gap-3 mb-6">
                {([
                  { id: 'have' as const, label: 'I have a logo', desc: 'Upload your final logo' },
                  { id: 'iterate' as const, label: 'I have ideas', desc: 'Upload references & describe your vision' },
                  { id: 'none' as const, label: 'Start from scratch', desc: "We'll design one for you" },
                ] as const).map(opt => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, logoStatus: opt.id }))}
                    className={`flex-1 p-4 rounded-2xl border-2 text-left transition-all
                      ${formData.logoStatus === opt.id
                        ? 'border-brand-teal bg-brand-teal/5'
                        : 'border-white/10 hover:border-white/20 hover:bg-white/5'}
                    `}
                  >
                    <p className={`text-sm font-bold ${formData.logoStatus === opt.id ? 'text-brand-teal' : 'text-white'}`}>{opt.label}</p>
                    <p className="text-[10px] text-white/40 mt-1">{opt.desc}</p>
                  </button>
                ))}
              </div>

              {/* Upload area — shown for 'have' and 'iterate' */}
              {(formData.logoStatus === 'have' || formData.logoStatus === 'iterate') && (
                <div className={`border-2 border-dashed rounded-[2.5rem] p-10 transition-all text-center relative group ${(formData.existingLogos?.length || formData.existingLogo) ? 'border-brand-teal bg-brand-teal/5' : 'border-stone-300 bg-white hover:bg-stone-50 hover:border-brand-teal'}`}>
                  {/* Uploaded previews */}
                  {(formData.existingLogos?.length || formData.existingLogo) ? (
                    <div className="space-y-6">
                      <div className="flex flex-wrap justify-center gap-4">
                        {(formData.existingLogos || (formData.existingLogo ? [formData.existingLogo] : [])).map((logo, i) => (
                          <div key={i} className="relative group/img">
                            <img src={logo} alt={`Logo ${i + 1}`} className="h-28 w-28 object-contain bg-white rounded-2xl shadow-xl p-2" />
                            <button
                              type="button"
                              onClick={() => {
                                const updated = (formData.existingLogos || []).filter((_, idx) => idx !== i);
                                setFormData(prev => ({
                                  ...prev,
                                  existingLogos: updated,
                                  existingLogo: updated[0] || undefined,
                                }));
                              }}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                      <p className="text-xs font-bold text-white/60">
                        {formData.logoStatus === 'have' ? "Looking good. We'll build everything around this." : "Great references — tell us what you love about them below."}
                      </p>
                      {/* Add more button */}
                      <label className="cursor-pointer inline-flex items-center gap-2 text-brand-teal text-[10px] font-black uppercase tracking-widest hover:text-brand-teal/80 transition-colors">
                        <input type="file" className="hidden" accept="image/*" multiple onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          const files = Array.from(e.target.files || []);
                          files.forEach(file => {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              const result = reader.result;
                              if (typeof result === "string") {
                                setFormData(prev => ({
                                  ...prev,
                                  existingLogos: [...(prev.existingLogos || []), result],
                                  existingLogo: prev.existingLogo || result,
                                }));
                              }
                            };
                            reader.readAsDataURL(file);
                          });
                        }} />
                        <Plus size={14} /> Add More Files
                      </label>
                    </div>
                  ) : (
                    <label className="cursor-pointer block space-y-4">
                      <input type="file" className="hidden" accept="image/*" multiple onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        const files = Array.from(e.target.files || []);
                        const newLogos: string[] = [];
                        files.forEach(file => {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            const result = reader.result;
                            if (typeof result === "string") {
                              newLogos.push(result);
                              if (newLogos.length === files.length) {
                                setFormData(prev => ({
                                  ...prev,
                                  existingLogos: [...(prev.existingLogos || []), ...newLogos],
                                  existingLogo: prev.existingLogo || newLogos[0],
                                }));
                              }
                            }
                          };
                          reader.readAsDataURL(file);
                        });
                      }} />
                      <div className="mx-auto w-16 h-16 bg-white text-brand-lavender rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform"><Upload size={28} /></div>
                      <p className="text-lg font-bold">{formData.logoStatus === 'have' ? 'Drop your logo here' : 'Upload your references & ideas'}</p>
                      <p className="text-[10px] text-white/40 italic">PNG, JPG, SVG — you can upload multiple files</p>
                    </label>
                  )}
                </div>
              )}

              {/* Description field — shown for 'iterate' */}
              {formData.logoStatus === 'iterate' && (
                <div className="mt-6 space-y-3">
                  <label className="flex items-center gap-3 text-[11px] font-black text-white uppercase tracking-[0.3em] ml-2">
                    <Sparkles size={16} className="text-brand-lavender" /> Describe Your Vision
                  </label>
                  <textarea
                    value={formData.logoDescription || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, logoDescription: e.target.value }))}
                    className="w-full p-5 rounded-2xl bg-white/5 border-2 border-white/20 text-white placeholder:text-white/30 font-bold outline-none focus:border-brand-teal min-h-[100px] text-sm"
                    placeholder="What do you like about the references? Colors, shapes, style, vibe — anything that helps us nail your vision"
                  />
                </div>
              )}

              {/* AI generate option — shown for 'none' or 'iterate' */}
              {(formData.logoStatus === 'none' || formData.logoStatus === 'iterate') && (
                <div className="mt-6 flex items-center justify-center gap-4 pt-4 border-t border-dashed border-white/10">
                  <span className="text-xs text-white/40 font-bold uppercase">let us cook</span>
                  <button
                    type="button"
                    onClick={handleGenerateLogo}
                    disabled={isGeneratingLogo}
                    className="bg-brand-black text-white px-6 py-3 rounded-xl font-black text-xs uppercase flex items-center gap-2 hover:bg-brand-teal transition-all"
                  >
                    {isGeneratingLogo ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                    AI Generate Logo Draft
                  </button>
                </div>
              )}

              {(!formData.logoStatus || formData.logoStatus === 'none') && (
                <p className="text-[9px] text-white/40 italic mt-4 text-center">No worries — we'll create logo concepts during the full build.</p>
              )}

              {/* Additional Notes */}
              <div className="space-y-3">
                <label className="flex items-center gap-3 text-[11px] font-black text-white uppercase tracking-[0.3em] ml-2">
                  <Sparkles size={16} className="text-brand-lavender" /> Anything Else?
                </label>
                <textarea
                  className="w-full p-5 rounded-2xl bg-white/5 border-2 border-white/20 text-white placeholder:text-white/30 font-bold outline-none focus:border-brand-teal min-h-[100px] text-sm"
                  placeholder="Colors you love, competitors you admire, vibes you want to avoid, your origin story, whatever feels relevant. The more we know, the harder this hits."
                  value={formData.additionalNotes}
                  onChange={(e) => setFormData({...formData, additionalNotes: e.target.value})}
                />
                <p className="text-[9px] text-white/40 italic ml-2">This is your chance to tell us what no form field can capture. Go off.</p>
              </div>
            </div>
          )}
        </div>

        <div className="mt-12 pt-8 border-t border-stone-100 flex justify-between items-center">
            <div className="flex gap-4">
               <button 
                type="button" 
                onClick={prevStep} 
                className={`flex items-center gap-2 text-white/40 font-black uppercase tracking-widest text-xs transition-all ${currentStep === 0 ? 'opacity-0 pointer-events-none' : 'hover:text-brand-black'}`}
              >
                  <ArrowLeft size={16} /> Previous
              </button>
              
              <button
                type="button"
                onClick={handleSave}
                className={`flex items-center gap-2 text-brand-teal font-black uppercase tracking-widest text-xs transition-all hover:text-brand-tealDark ${saveMessage ? 'text-green-600' : ''}`}
              >
                {saveMessage ? <CheckCircle2 size={16} /> : <Save size={16} />} 
                {saveMessage || 'Save Progress'}
              </button>
            </div>
            
            {currentStep === STEPS.length - 1 ? (
              <button 
                type="button" 
                onClick={() => onSubmit(formData)}
                disabled={isLoading}
                className="bg-brand-black text-white px-10 py-5 rounded-full font-black uppercase tracking-[0.3em] text-xs shadow-xl hover:bg-brand-teal transition-all flex items-center gap-3"
              >
                {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                {submitLabel || 'Build My Brand'}
              </button>
            ) : (
              <button 
                type="button" 
                onClick={nextStep}
                disabled={!isStepValid()}
                className={`flex items-center gap-3 px-10 py-5 rounded-full font-black uppercase tracking-[0.3em] text-xs shadow-xl transition-all ${isStepValid() ? 'bg-brand-black text-white hover:bg-brand-teal' : 'bg-stone-100 text-stone-300 cursor-not-allowed'}`}
              >
                {currentStep === 0 ? 'Lock It In' : currentStep === 1 ? 'Name Claimed' : currentStep === 2 ? 'Vibe Set' : currentStep === 3 ? 'Almost Done' : 'Continue'} <ChevronRight size={16} />
              </button>
            )}
        </div>
      </motion.div>
    </div>
  );
};
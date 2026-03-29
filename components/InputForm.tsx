import React, { useState } from 'react';
import { BrandInput } from '../types';
import { MapPin, Users, Briefcase, Type, ArrowLeft, Sparkles, Plus, X, Loader2, ChevronRight, Upload, Phone, Mail, Zap, User, Calendar, CheckCircle2, Building2, Save, Award, Globe } from 'lucide-react';
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
            className={`flex items-center gap-2 px-4 py-2 rounded-full bg-stone-100 font-black uppercase tracking-widest text-[10px] transition-all hover:bg-brand-teal hover:text-white ${saveMessage ? 'text-green-600' : 'text-stone-500'}`}
          >
            {saveMessage ? <CheckCircle2 size={14} /> : <Save size={14} />} 
            {saveMessage || 'Save Progress'}
          </button>
      </div>

      <div className="flex justify-between relative">
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-stone-100 -translate-y-1/2 z-0"></div>
        {STEPS.map((step, idx) => {
          const isActive = idx === currentStep;
          const isCompleted = idx < currentStep;
          return (
            <div key={step.id} className="relative z-10 flex flex-col items-center group cursor-pointer" onClick={() => idx < currentStep && setCurrentStep(idx)}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 border-2 ${
                isActive ? 'bg-brand-black border-brand-black text-white scale-110 shadow-lg' : 
                isCompleted ? 'bg-brand-teal border-brand-teal text-white' : 'bg-white border-stone-200 text-stone-300'
              }`}>
                {isCompleted ? <CheckCircle2 size={20} /> : <span className="text-xs font-black">{idx + 1}</span>}
              </div>
              <div className={`absolute top-12 whitespace-nowrap text-center transition-all ${isActive ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'}`}>
                  <p className="text-[10px] font-black uppercase tracking-widest text-brand-black">{step.title}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-4xl mx-auto animate-fade-in-up">
      <div className="glass p-8 md:p-14 rounded-[3.5rem] shadow-2xl relative overflow-hidden bg-white/95 min-h-[600px] flex flex-col">
        {renderProgress()}

        <div className="flex-1 mt-6">
          {currentStep === 0 && (
            <div className="space-y-8 animate-fade-in-up">
              <div className="text-center mb-10">
                <h3 className="text-3xl font-serif font-black text-brand-black">The Foundation</h3>
                <p className="text-stone-500 mt-2">First, tell us the basics of your trade.</p>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <label className="flex items-center gap-3 text-[11px] font-black text-brand-black uppercase tracking-[0.3em] ml-2">
                    <Briefcase size={16} className="text-brand-lavender" /> Business Sector(s)
                  </label>
                  
                  {/* Selected Industries Tags */}
                  <div className="flex flex-wrap gap-2 min-h-[40px] p-2 rounded-2xl bg-stone-50 border-2 border-dashed border-stone-200">
                    {getSelectedIndustries().length === 0 && <span className="text-sm text-stone-400 font-bold self-center px-2">Select one or more industries...</span>}
                    {getSelectedIndustries().map(ind => (
                      <span key={ind} className="px-3 py-1.5 bg-brand-black text-white rounded-lg text-xs font-bold flex items-center gap-2 animate-fade-in-up">
                        {ind}
                        <button onClick={() => handleRemoveIndustry(ind)} className="hover:text-brand-lavender transition-colors"><X size={12}/></button>
                      </span>
                    ))}
                  </div>

                  <div className="relative">
                    <input 
                      type="text"
                      placeholder="Type to search industries..."
                      className="w-full p-5 rounded-2xl bg-white border-2 border-brand-black focus:border-brand-teal outline-none transition-all font-bold"
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
                      <div className="absolute z-20 w-full mt-2 bg-white border-2 border-stone-200 rounded-2xl shadow-xl max-h-60 overflow-y-auto">
                        {filteredIndustries.length > 0 ? (
                          filteredIndustries.map(i => (
                            <div 
                              key={i} 
                              className="p-4 hover:bg-stone-50 cursor-pointer font-bold text-sm border-b border-stone-100 last:border-0"
                              onMouseDown={() => handleAddIndustry(i)}
                            >
                              {i}
                            </div>
                          ))
                        ) : (
                          <div 
                            className="p-4 hover:bg-stone-50 cursor-pointer font-bold text-sm text-brand-teal"
                            onMouseDown={() => handleAddIndustry(industrySearch.trim())}
                          >
                            + Add "{industrySearch}" as custom industry
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="flex items-center gap-3 text-[11px] font-black text-brand-black uppercase tracking-[0.3em] ml-2">
                    <MapPin size={16} className="text-brand-lavender" /> Your Service Area
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Melbourne, FL or Orange County, CA"
                    className="w-full p-5 rounded-2xl bg-white border-2 border-brand-black focus:border-brand-teal outline-none transition-all font-bold"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                  />
                </div>

                <div className="md:col-span-2 space-y-4">
                  <label className="flex items-center gap-3 text-[11px] font-black text-brand-black uppercase tracking-[0.3em] ml-2">
                    <Award size={16} className="text-brand-lavender" /> Years of Experience
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 15 Years (Helps establish authority)"
                    className="w-full p-5 rounded-2xl bg-white border-2 border-brand-black focus:border-brand-teal outline-none transition-all font-bold"
                    value={formData.yearsExperience}
                    onChange={(e) => setFormData({...formData, yearsExperience: e.target.value})}
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep === 1 && (
            <div className="space-y-8 animate-fade-in-up">
              <div className="text-center mb-10">
                <h3 className="text-3xl font-serif font-black text-brand-black">The Name</h3>
                <p className="text-stone-500 mt-2">What will your legacy be called?</p>
              </div>

              <div className="space-y-4">
                <label className="flex items-center gap-3 text-[11px] font-black text-brand-black uppercase tracking-[0.3em] ml-2">
                  <Type size={16} className="text-brand-lavender" /> Company Name
                </label>
                <div className="flex gap-4">
                  <input 
                    type="text" 
                    className="flex-1 p-5 rounded-2xl bg-white border-2 border-brand-black focus:border-brand-teal outline-none transition-all text-xl font-serif font-black" 
                    placeholder="Enter Company Name" 
                    value={formData.companyName} 
                    onChange={(e) => setFormData({...formData, companyName: e.target.value})} 
                  />
                  <select 
                    className="w-1/4 p-5 rounded-2xl bg-white border-2 border-brand-black focus:border-brand-teal outline-none font-black text-[10px] uppercase" 
                    value={formData.businessSuffix} 
                    onChange={(e) => setFormData({...formData, businessSuffix: e.target.value})}
                  >
                    <option value="">None</option>
                    <option value="LLC">LLC</option>
                    <option value="Inc.">Inc.</option>
                    <option value="Co.">Co.</option>
                  </select>
                </div>
              </div>

              <div className="p-8 bg-stone-50 rounded-[2.5rem] border border-stone-200 border-dashed">
                <div className="mb-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-black uppercase tracking-widest text-stone-400">Need inspiration?</h4>
                  </div>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Keywords (e.g. fast, eco, green)..." 
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
                )}
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-8 animate-fade-in-up">
              <div className="text-center mb-10">
                <h3 className="text-3xl font-serif font-black text-brand-black">Personality</h3>
                <p className="text-stone-500 mt-2">Let's define your brand's spirit and services.</p>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <label className="flex items-center gap-3 text-[11px] font-black text-brand-black uppercase tracking-[0.3em] ml-2">
                    <Zap size={16} className="text-brand-lavender" /> Brand vibe
                  </label>
                  <select 
                    className="w-full p-5 rounded-2xl bg-white border-2 border-brand-black font-bold outline-none"
                    value={formData.vibe}
                    onChange={(e) => setFormData({...formData, vibe: e.target.value})}
                  >
                    <option value="">Select vibe...</option>
                    {VIBE_OPTIONS.map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                </div>

                <div className="space-y-4">
                  <label className="flex items-center gap-3 text-[11px] font-black text-brand-black uppercase tracking-[0.3em] ml-2">
                    <Users size={16} className="text-brand-lavender" /> Ideal Client
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Luxury Homeowners"
                    className="w-full p-5 rounded-2xl bg-white border-2 border-brand-black font-bold outline-none"
                    value={formData.audience}
                    onChange={(e) => setFormData({...formData, audience: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <label className="flex items-center gap-3 text-[11px] font-black text-brand-black uppercase tracking-[0.3em] ml-2">
                  <Briefcase size={16} className="text-brand-lavender" /> Your Services
                </label>
                
                {/* Selected Services */}
                <div className="flex flex-wrap gap-2 mb-4 min-h-[40px]">
                    {formData.services.length === 0 && <span className="text-sm text-stone-400 font-bold self-center px-2">No services added yet.</span>}
                    {formData.services.map(s => (
                        <span key={s} className="px-4 py-2 bg-stone-900 text-white rounded-full text-[10px] font-black uppercase flex items-center gap-2">
                            {s} <button onClick={() => setFormData({...formData, services: formData.services.filter(serv => serv !== s)})}><X size={12}/></button>
                        </span>
                    ))}
                </div>

                {/* Suggestions based on Industry */}
                {getSelectedIndustries().length > 0 && getSuggestedServices().length > 0 && (
                   <div className="mb-4">
                      <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-2">Suggested for you:</p>
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
                      placeholder="Type to search or add custom service..." 
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
                    <button onClick={handleManualAddService} className="p-4 bg-brand-black text-white rounded-xl"><Plus/></button>
                    
                    {showServiceSuggestions && serviceSearch && (
                      <div className="absolute top-full left-0 right-16 z-20 mt-2 bg-white border-2 border-stone-200 rounded-2xl shadow-xl max-h-60 overflow-y-auto">
                        {filteredServices.length > 0 ? (
                          filteredServices.map(s => (
                            <div 
                              key={s} 
                              className="p-4 hover:bg-stone-50 cursor-pointer font-bold text-sm border-b border-stone-100 last:border-0"
                              onMouseDown={() => handleAddService(s)}
                            >
                              {s}
                            </div>
                          ))
                        ) : (
                          <div 
                            className="p-4 hover:bg-stone-50 cursor-pointer font-bold text-sm text-brand-teal"
                            onMouseDown={() => handleAddService(serviceSearch.trim())}
                          >
                            + Add "{serviceSearch}" as custom service
                          </div>
                        )}
                      </div>
                    )}
                </div>

                <div className="mt-8 pt-8 border-t border-stone-100">
                   <details className="group">
                      <summary className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-stone-400 cursor-pointer hover:text-brand-black transition-colors">
                         <Plus size={12} /> Advanced: I already have brand statements
                      </summary>
                      <div className="mt-6 space-y-6 animate-fade-in-up">
                          <div className="space-y-2">
                             <label className="text-xs font-bold text-stone-600">Existing Mission Statement</label>
                             <textarea 
                               className="w-full p-4 rounded-xl border border-stone-200 text-sm focus:border-brand-teal outline-none min-h-[80px]"
                               placeholder="e.g. To provide the highest quality service..."
                               value={formData.existingMission || ''}
                               onChange={(e) => setFormData({...formData, existingMission: e.target.value})}
                             />
                          </div>
                          <div className="space-y-2">
                             <label className="text-xs font-bold text-stone-600">Existing Vision Statement</label>
                             <textarea 
                               className="w-full p-4 rounded-xl border border-stone-200 text-sm focus:border-brand-teal outline-none min-h-[80px]"
                               placeholder="e.g. To be the leading provider in the region..."
                               value={formData.existingVision || ''}
                               onChange={(e) => setFormData({...formData, existingVision: e.target.value})}
                             />
                          </div>
                          <div className="space-y-2">
                             <label className="text-xs font-bold text-stone-600">Existing Brand Voice/Values</label>
                             <input 
                               type="text"
                               className="w-full p-4 rounded-xl border border-stone-200 text-sm focus:border-brand-teal outline-none"
                               placeholder="e.g. Friendly, Professional, Trustworthy"
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
              <div className="text-center mb-10">
                <h3 className="text-3xl font-serif font-black text-brand-black">Connectivity</h3>
                <p className="text-stone-500 mt-2">How should your clients find and book you?</p>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <label className="flex items-center gap-3 text-[11px] font-black text-brand-black uppercase tracking-[0.3em] ml-2">
                    <User size={16} className="text-brand-lavender" /> Owner Name
                  </label>
                  <input type="text" placeholder="Your Name" className="w-full p-5 rounded-2xl bg-white border-2 border-brand-black font-bold" value={formData.ownerName} onChange={(e) => setFormData({...formData, ownerName: e.target.value})} />
                </div>
                <div className="space-y-4">
                  <label className="flex items-center gap-3 text-[11px] font-black text-brand-black uppercase tracking-[0.3em] ml-2">
                    <Phone size={16} className="text-brand-lavender" /> Business Phone
                  </label>
                  <input type="text" placeholder="(555) 000-0000" className="w-full p-5 rounded-2xl bg-white border-2 border-brand-black font-bold" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
                </div>
                <div className="space-y-4">
                  <label className="flex items-center gap-3 text-[11px] font-black text-brand-black uppercase tracking-[0.3em] ml-2">
                    <Mail size={16} className="text-brand-lavender" /> Business Email
                  </label>
                  <input type="email" placeholder="hello@company.com" className="w-full p-5 rounded-2xl bg-white border-2 border-brand-black font-bold" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                </div>
                <div className="space-y-4">
                  <label className="flex items-center gap-3 text-[11px] font-black text-brand-black uppercase tracking-[0.3em] ml-2">
                    <Calendar size={16} className="text-brand-lavender" /> Booking Link
                  </label>
                  <input type="text" placeholder="Calendly / Booking Link" className="w-full p-5 rounded-2xl bg-white border-2 border-brand-black font-bold" value={formData.bookingLink} onChange={(e) => setFormData({...formData, bookingLink: e.target.value})} />
                </div>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-8 animate-fade-in-up">
              <div className="text-center mb-10">
                <h3 className="text-3xl font-serif font-black text-brand-black">Visual Starting Point</h3>
                <p className="text-stone-500 mt-2">Upload a logo or let AI create a draft.</p>
              </div>

              <div className={`border-2 border-dashed rounded-[2.5rem] p-10 transition-all text-center relative group ${formData.existingLogo ? 'border-brand-teal bg-brand-teal/5' : 'border-stone-300 bg-white hover:bg-stone-50 hover:border-brand-teal'}`}>
                {formData.existingLogo ? (
                    <div className="flex flex-col items-center gap-4">
                        <img src={formData.existingLogo} className="h-32 w-32 object-contain bg-white rounded-2xl shadow-xl p-2" />
                        <button onClick={() => setFormData({...formData, existingLogo: undefined})} className="text-red-500 text-xs font-black uppercase">Remove</button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <label className="cursor-pointer block space-y-4">
                            <input type="file" className="hidden" accept="image/*" onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                    const reader = new FileReader();
                                    reader.onloadend = () => {
                                        const result = reader.result;
                                        if (typeof result === "string") {
                                            setFormData((prev) => ({ ...prev, existingLogo: result }));
                                        }
                                    };
                                    reader.readAsDataURL(file);
                                }
                            }} />
                            <div className="mx-auto w-16 h-16 bg-white text-brand-lavender rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform"><Upload size={28} /></div>
                            <p className="text-lg font-bold">Upload existing logo</p>
                        </label>
                        <div className="flex items-center justify-center gap-4 pt-4 border-t border-dashed border-stone-200">
                            <span className="text-xs text-stone-400 font-bold uppercase">or</span>
                            <button 
                              type="button" 
                              onClick={handleGenerateLogo}
                              disabled={isGeneratingLogo}
                              className="bg-brand-black text-white px-6 py-3 rounded-xl font-black text-xs uppercase flex items-center gap-2"
                            >
                                {isGeneratingLogo ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                                Generate Draft
                            </button>
                        </div>
                    </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="mt-12 pt-8 border-t border-stone-100 flex justify-between items-center">
            <div className="flex gap-4">
               <button 
                type="button" 
                onClick={prevStep} 
                className={`flex items-center gap-2 text-stone-400 font-black uppercase tracking-widest text-xs transition-all ${currentStep === 0 ? 'opacity-0 pointer-events-none' : 'hover:text-brand-black'}`}
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
                {submitLabel || 'Construct Legacy'}
              </button>
            ) : (
              <button 
                type="button" 
                onClick={nextStep}
                disabled={!isStepValid()}
                className={`flex items-center gap-3 px-10 py-5 rounded-full font-black uppercase tracking-[0.3em] text-xs shadow-xl transition-all ${isStepValid() ? 'bg-brand-black text-white hover:bg-brand-teal' : 'bg-stone-100 text-stone-300 cursor-not-allowed'}`}
              >
                Next Step <ChevronRight size={18} />
              </button>
            )}
        </div>
      </div>
    </div>
  );
};
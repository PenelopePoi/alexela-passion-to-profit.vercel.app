
import React, { useState } from 'react';
import { Rocket, Shield, Globe, FileText, CheckCircle2, ExternalLink, Search, Mail, MapPin, Zap, Building2, Landmark, Printer, Link as LinkIcon, ChevronDown, ChevronUp } from 'lucide-react';
import { BrandInput } from '../types';

interface LaunchpadProps {
  input: BrandInput;
}

const LAUNCH_RESOURCES = [
  {
    category: "Legal & Compliance",
    items: [
      {
        title: "Sunbiz™ Entity Search",
        description: "Official Florida Division of Corporations search.",
        link: "https://search.sunbiz.org/Inquiry/CorporationSearch/ByName",
        icon: Search,
        color: "text-orange-600",
        bg: "bg-orange-50",
        action: "Search Name"
      },
      {
        title: "Sunbiz™ LLC Filing",
        description: "File your Florida LLC Articles of Organization.",
        link: "https://dos.myflorida.com/sunbiz/start-business/efile/fl-llc/",
        icon: Landmark,
        color: "text-stone-900",
        bg: "bg-stone-100",
        action: "File LLC"
      },
      {
        title: "Apply for EIN",
        description: "Get your federal Employer Identification Number from the IRS.",
        link: "https://www.irs.gov/businesses/small-businesses-self-employed/apply-for-an-employer-identification-number-ein-online",
        icon: FileText,
        color: "text-green-600",
        bg: "bg-green-50",
        action: "Apply Online"
      },
      {
        title: "Business Insurance",
        description: "General liability and workers comp quotes.",
        link: "https://www.nextinsurance.com/",
        icon: Shield,
        color: "text-red-500",
        bg: "bg-red-50",
        action: "Get Quote"
      }
    ]
  },
  {
    category: "Digital Presence",
    items: [
      {
        title: "GoDaddy Domains",
        description: "Search and register your business domain name.",
        link: "https://www.godaddy.com/",
        icon: Globe,
        color: "text-teal-600",
        bg: "bg-teal-50",
        action: "Find Domain"
      },
      {
        title: "Google Business Profile",
        description: "Manage your online presence across Google Maps and Search.",
        link: "https://www.google.com/business/",
        icon: MapPin,
        color: "text-blue-500",
        bg: "bg-blue-50",
        action: "Create Profile"
      },
      {
        title: "Linktree",
        description: "Create a unified link for your social media bio.",
        link: "https://linktr.ee/",
        icon: LinkIcon,
        color: "text-green-500",
        bg: "bg-green-50",
        action: "Create Linktree"
      },
      {
        title: "Google Workspace",
        description: "Professional email and collaboration tools.",
        link: "https://workspace.google.com/",
        icon: Mail,
        color: "text-yellow-600",
        bg: "bg-yellow-50",
        action: "Setup Email"
      }
    ]
  },
  {
    category: "Marketing & Operations",
    items: [
       {
        title: "Vistaprint",
        description: "Order business cards, flyers, and marketing materials.",
        link: "https://www.vistaprint.com/",
        icon: Printer,
        color: "text-purple-600",
        bg: "bg-purple-50",
        action: "Order Print"
      },
       {
        title: "QuickBooks",
        description: "Accounting software to track income and expenses.",
        link: "https://quickbooks.intuit.com/",
        icon: FileText,
        color: "text-green-700",
        bg: "bg-green-50",
        action: "Start Accounting"
      }
    ]
  }
];

export const Launchpad: React.FC<LaunchpadProps> = ({ input }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [openCategory, setOpenCategory] = useState<string | null>("Legal & Compliance");

  const toggleCategory = (category: string) => {
    setOpenCategory(openCategory === category ? null : category);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-white/70 hover:text-white transition-colors text-[10px] font-black uppercase tracking-widest"
      >
        <Rocket size={18} className="text-orange-500" /> Launchpad
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute bottom-16 right-0 z-50 w-[90vw] max-w-2xl max-h-[70vh] overflow-y-auto glass rounded-[2.5rem] p-6 md:p-8 shadow-2xl border border-white/20 animate-fade-in-up">
            <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 blur-[100px] pointer-events-none"></div>

            <div className="flex justify-between items-center gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-stone-900 text-white rounded-2xl shadow-xl">
                  <Rocket size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-serif font-black text-stone-900">The Launchpad</h3>
                  <p className="text-stone-500 text-xs">Resources to launch {input.companyName}</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-2 rounded-full hover:bg-stone-100 transition-colors text-stone-400">
                <ChevronDown size={20} />
              </button>
            </div>

      <div className="space-y-6">
        {LAUNCH_RESOURCES.map((section, idx) => (
          <div key={idx} className="bg-white rounded-[2rem] border border-stone-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <button 
              onClick={() => toggleCategory(section.category)}
              className="w-full flex items-center justify-between p-6 md:p-8 text-left bg-stone-50/50 hover:bg-stone-50 transition-colors"
            >
              <h4 className="text-xl font-black font-serif text-stone-900">{section.category}</h4>
              {openCategory === section.category ? <ChevronUp size={20} className="text-stone-400"/> : <ChevronDown size={20} className="text-stone-400"/>}
            </button>
            
            {openCategory === section.category && (
              <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in-up">
                {section.items.map((res, i) => (
                  <div 
                    key={i} 
                    className="group relative bg-white p-6 rounded-3xl border border-stone-100 hover:border-orange-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full hover:-translate-y-1"
                  >
                    <div className={`w-12 h-12 ${res.bg} ${res.color} rounded-2xl flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform`}>
                      <res.icon size={20} />
                    </div>
                    <h5 className="font-black text-base text-stone-900 mb-2 font-serif group-hover:text-orange-600 transition-colors leading-tight">{res.title}</h5>
                    <p className="text-[11px] text-stone-500 leading-relaxed mb-6 flex-1">{res.description}</p>
                    
                    <a 
                        href={res.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className={`flex items-center justify-between gap-2 text-[9px] font-black uppercase tracking-widest transition-colors py-2.5 px-4 rounded-xl ${res.action.includes('$') ? 'bg-stone-900 text-white hover:bg-black' : 'bg-stone-50 text-stone-400 hover:text-stone-900'}`}
                    >
                      {res.action} <ExternalLink size={10} />
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-stone-900 text-white rounded-2xl flex items-center justify-between gap-4 border border-stone-800 shadow-xl">
         <div className="flex items-center gap-3">
            <Zap size={20} className="text-orange-500" />
            <div>
                <h4 className="text-sm font-bold">Startup Checklist</h4>
                <p className="text-stone-400 text-[10px]">Download your guide</p>
            </div>
         </div>
         <button className="px-6 py-2 bg-white text-stone-900 rounded-full font-black text-[9px] uppercase tracking-widest hover:bg-orange-50 transition-colors shadow-lg">
            Download
         </button>
      </div>
          </div>
        </>
      )}
    </div>
  );
};

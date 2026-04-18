import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { Phone, Mail, MapPin, Globe, Clock, Star, Facebook, Instagram, ExternalLink } from 'lucide-react';
import type { ClientProfile } from '../services/clientProfileService';
import { trackProfileView, trackCallClick } from '../services/clientProfileService';

interface ClientProfilePageProps {
  profile: ClientProfile;
}

const VIBE_GRADIENTS: Record<string, string> = {
  modern: 'from-slate-700 to-slate-900',
  bold: 'from-orange-600 to-red-700',
  luxury: 'from-stone-800 to-amber-900',
  friendly: 'from-amber-500 to-orange-600',
  eco: 'from-emerald-600 to-green-800',
  gothic: 'from-purple-900 to-slate-900',
};

export const ClientProfilePage: React.FC<ClientProfilePageProps> = ({ profile }) => {
  useEffect(() => {
    trackProfileView(profile.slug);
  }, [profile.slug]);

  const accent = profile.accentColor || '#00E0C6';
  const gradient = VIBE_GRADIENTS[profile.vibe || 'modern'];

  const handleCall = () => {
    trackCallClick(profile.slug);
    window.location.href = `tel:${profile.phone.replace(/\D/g, '')}`;
  };

  return (
    <div className="min-h-screen bg-brand-black text-white">
      {/* Hero — gradient based on vibe */}
      <div className={`relative bg-gradient-to-br ${gradient} px-6 py-20 text-center`}>
        <div className="absolute inset-0 bg-brand-black/40" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative max-w-2xl mx-auto"
        >
          {profile.photoUrl && (
            <div className="w-32 h-32 rounded-full mx-auto mb-6 overflow-hidden border-4 shadow-2xl" style={{ borderColor: accent }}>
              <img src={profile.photoUrl} alt={profile.businessName} className="w-full h-full object-cover" />
            </div>
          )}
          <h1 className="text-4xl md:text-6xl font-serif font-black text-white mb-2 drop-shadow-2xl">
            {profile.businessName}
          </h1>
          {profile.tagline && (
            <p className="text-lg text-white/90 italic font-medium">{profile.tagline}</p>
          )}
          {profile.industry && (
            <p className="text-xs font-black uppercase tracking-[0.4em] text-white/70 mt-3">
              {profile.industry} · {profile.location}
            </p>
          )}
        </motion.div>
      </div>

      {/* Primary CTA */}
      <div className="px-6 -mt-8 relative z-10">
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          onClick={handleCall}
          className="w-full max-w-md mx-auto block py-6 rounded-3xl font-black uppercase tracking-widest text-brand-black text-lg shadow-2xl hover:scale-105 active:scale-95 transition-transform"
          style={{
            background: `linear-gradient(135deg, ${accent} 0%, #FF8C42 100%)`,
            boxShadow: `0 0 40px ${accent}50, 0 0 80px ${accent}25`,
          }}
        >
          Call {profile.phone}
        </motion.button>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-6 py-12 space-y-8">
        {/* Services */}
        {profile.services && profile.services.length > 0 && (
          <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} className="bg-white/5 border border-white/10 rounded-3xl p-6">
            <h2 className="text-[10px] font-black uppercase tracking-widest mb-4" style={{ color: accent }}>What We Do</h2>
            <ul className="space-y-2">
              {profile.services.map((service, i) => (
                <li key={i} className="flex items-start gap-3 text-white">
                  <Star size={14} className="mt-1 shrink-0" style={{ color: accent }} />
                  <span>{service}</span>
                </li>
              ))}
            </ul>
          </motion.section>
        )}

        {/* Hours */}
        {profile.hours && (
          <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} className="bg-white/5 border border-white/10 rounded-3xl p-6 flex items-start gap-4">
            <Clock size={24} style={{ color: accent }} className="shrink-0 mt-1" />
            <div>
              <h2 className="text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: accent }}>Hours</h2>
              <p className="text-white whitespace-pre-line">{profile.hours}</p>
            </div>
          </motion.section>
        )}

        {/* Contact grid */}
        <div className="grid grid-cols-2 gap-3">
          <a href={`tel:${profile.phone.replace(/\D/g, '')}`} onClick={() => trackCallClick(profile.slug)} className="bg-white/5 border border-white/10 rounded-2xl p-4 hover:bg-white/10 transition-all flex items-center gap-3">
            <Phone size={18} style={{ color: accent }} />
            <span className="text-white text-sm font-bold truncate">{profile.phone}</span>
          </a>
          {profile.email && (
            <a href={`mailto:${profile.email}`} className="bg-white/5 border border-white/10 rounded-2xl p-4 hover:bg-white/10 transition-all flex items-center gap-3">
              <Mail size={18} style={{ color: accent }} />
              <span className="text-white text-sm font-bold truncate">{profile.email}</span>
            </a>
          )}
          {profile.location && (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-3">
              <MapPin size={18} style={{ color: accent }} />
              <span className="text-white text-sm font-bold truncate">{profile.location}</span>
            </div>
          )}
          {profile.websiteUrl && (
            <a href={profile.websiteUrl} target="_blank" rel="noreferrer" className="bg-white/5 border border-white/10 rounded-2xl p-4 hover:bg-white/10 transition-all flex items-center gap-3">
              <Globe size={18} style={{ color: accent }} />
              <span className="text-white text-sm font-bold truncate">Website</span>
            </a>
          )}
        </div>

        {/* Social links */}
        {(profile.facebook || profile.instagram || profile.googleBusinessUrl) && (
          <div className="flex items-center justify-center gap-4">
            {profile.facebook && (
              <a href={profile.facebook} target="_blank" rel="noreferrer" className="w-12 h-12 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 flex items-center justify-center transition-all" aria-label="Facebook">
                <Facebook size={18} style={{ color: accent }} />
              </a>
            )}
            {profile.instagram && (
              <a href={profile.instagram} target="_blank" rel="noreferrer" className="w-12 h-12 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 flex items-center justify-center transition-all" aria-label="Instagram">
                <Instagram size={18} style={{ color: accent }} />
              </a>
            )}
            {profile.googleBusinessUrl && (
              <a href={profile.googleBusinessUrl} target="_blank" rel="noreferrer" className="w-12 h-12 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 flex items-center justify-center transition-all" aria-label="Google Business">
                <ExternalLink size={18} style={{ color: accent }} />
              </a>
            )}
          </div>
        )}

        {/* XELA footer attribution */}
        <div className="text-center pt-8 border-t border-white/5">
          <p className="text-[10px] text-white/30 uppercase tracking-widest">
            Profile by <a href="/" className="text-brand-teal hover:underline">XELA Creative Branding Studio</a>
          </p>
          <p className="text-[9px] text-white/20 mt-1">Get yours at xela-elite-ai-creative-studio.vercel.app</p>
        </div>
      </div>
    </div>
  );
};

export default ClientProfilePage;

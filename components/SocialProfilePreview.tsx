import React from 'react';
import { BrandStrategy, BrandInput } from '../types';
import { Instagram, MapPin, Link as LinkIcon, MoreHorizontal } from 'lucide-react';

interface SocialProfilePreviewProps {
  data: BrandStrategy;
  input: BrandInput;
  logoUrl?: string;
}

export const SocialProfilePreview: React.FC<SocialProfilePreviewProps> = ({ data, input, logoUrl }) => {
  return (
    <div className="glass rounded-3xl p-6 shadow-lg border-white/50 flex flex-col">
       <div className="flex items-center gap-2 mb-4 text-forest-900 font-bold">
         <Instagram size={18} />
         <h3>Social Context</h3>
       </div>
       
       {/* Mockup Container */}
       <div className="flex-1 flex justify-center items-center py-2">
           <div className="w-[300px] bg-white rounded-3xl border border-stone-200 shadow-xl overflow-hidden flex flex-col">
               {/* Header */}
               <div className="px-4 py-3 border-b border-stone-100 flex justify-between items-center bg-white sticky top-0 z-10">
                   <div className="font-bold text-sm text-stone-900 flex items-center gap-1">
                       {input.companyName.toLowerCase().replace(/\s/g, '_')}
                       <div className="w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center text-[8px] text-white">✓</div>
                   </div>
                   <MoreHorizontal size={16} className="text-stone-800" />
               </div>

               {/* Profile Info */}
               <div className="p-4">
                   <div className="flex items-center gap-6 mb-4">
                       <div className="w-20 h-20 rounded-full p-1 bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 flex-shrink-0">
                           <div className="w-full h-full bg-white rounded-full p-0.5 overflow-hidden flex items-center justify-center border-2 border-white">
                                {logoUrl ? (
                                    <img src={logoUrl} alt="Profile" className="w-full h-full object-contain p-2" />
                                ) : (
                                    <div className="w-full h-full bg-stone-100 flex items-center justify-center font-bold text-stone-300">
                                        {input.companyName.charAt(0)}
                                    </div>
                                )}
                           </div>
                       </div>
                       <div className="flex-1 flex justify-between px-2 text-center">
                           <div>
                               <div className="font-bold text-sm">124</div>
                               <div className="text-[10px] text-stone-500">Posts</div>
                           </div>
                           <div>
                               <div className="font-bold text-sm">1.2k</div>
                               <div className="text-[10px] text-stone-500">Followers</div>
                           </div>
                           <div>
                               <div className="font-bold text-sm">85</div>
                               <div className="text-[10px] text-stone-500">Following</div>
                           </div>
                       </div>
                   </div>

                   {/* Bio */}
                   <div className="text-xs space-y-1 mb-4">
                       <div className="font-bold">{input.companyName}</div>
                       <div className="text-stone-600">{data.taglines[0]}</div>
                       <div className="text-stone-500 flex items-center gap-1">
                            <MapPin size={10} /> {input.location}
                       </div>
                       <div className="text-blue-900 font-medium flex items-center gap-1">
                           <LinkIcon size={10} /> {`www.${input.companyName.toLowerCase().replace(/\s/g, '')}.com`}
                       </div>
                   </div>

                   {/* Actions */}
                   <div className="flex gap-2">
                       <button className="flex-1 bg-stone-900 text-white py-1.5 rounded-lg text-xs font-bold">Follow</button>
                       <button className="flex-1 bg-stone-100 text-stone-900 py-1.5 rounded-lg text-xs font-bold">Message</button>
                   </div>
               </div>

               {/* Grid */}
               <div className="grid grid-cols-3 gap-0.5 bg-stone-100">
                   {[1,2,3].map(i => (
                       <div key={i} className="aspect-square bg-stone-200 relative overflow-hidden group">
                           <img 
                            src={`https://source.unsplash.com/random/200x200?${input.industry.split(' ')[0]}&sig=${i}`} 
                            alt="Post" 
                            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" 
                            onError={(e) => (e.currentTarget.src = `https://via.placeholder.com/200?text=${input.industry.split(' ')[0]}`)}
                           />
                       </div>
                   ))}
               </div>
           </div>
       </div>
    </div>
  );
};
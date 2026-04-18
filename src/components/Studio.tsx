
import React, { useState, useEffect, useRef } from 'react';
import { GeneratedAsset, BrandInput, LogoCandidate } from '../../types';
import { Download, Film, Image as ImageIcon, Play, GripVertical, Save, Share2, Plus, X } from 'lucide-react';
import { LogoGenerator } from '../../components/LogoGenerator';

interface StudioProps {
  assets: GeneratedAsset[];
  brandInput: BrandInput;
  primaryColor: string;
}

export default function Studio({ assets, brandInput, primaryColor }: StudioProps) {
  const [orderedAssets, setOrderedAssets] = useState<GeneratedAsset[]>(assets);
  const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  
  // Logo Generator State
  const [showLogoGenerator, setShowLogoGenerator] = useState(false);
  const [logoCandidates, setLogoCandidates] = useState<LogoCandidate[]>([]);

  // Sync internal state with props, appending new assets while preserving sort order of existing ones
  useEffect(() => {
    const newAssets = assets.filter(
      (a) => !orderedAssets.find((oa) => oa.id === a.id)
    );
    if (newAssets.length > 0) {
      setOrderedAssets((prev) => [...newAssets, ...prev]);
    }
  }, [assets]);

  // Drag and Drop Handlers
  const handleDragStart = (index: number) => {
    setDraggedItemIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault(); // Necessary to allow dropping
    if (draggedItemIndex === null) return;
    if (draggedItemIndex === index) return;

    // Reorder the list visually while dragging
    const newOrder = [...orderedAssets];
    const draggedItem = newOrder[draggedItemIndex];
    newOrder.splice(draggedItemIndex, 1);
    newOrder.splice(index, 0, draggedItem);

    setOrderedAssets(newOrder);
    setDraggedItemIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedItemIndex(null);
  };

  const handleExport = () => {
    if (orderedAssets.length === 0) return;
    
    setIsExporting(true);
    
    // Simulate export process
    setTimeout(() => {
      setIsExporting(false);
      alert(`Music Video Exported! Sequence contains ${orderedAssets.length} clips.`);
      // Export complete
    }, 2000);
  };

  const handleAddLogoToTimeline = (candidate: LogoCandidate) => {
    const newAsset: GeneratedAsset = {
      id: Math.random().toString(36).substr(2, 9),
      type: 'image',
      url: candidate.imageUrl,
      prompt: 'Generated Logo Concept',
      timestamp: Date.now()
    };
    setOrderedAssets(prev => [...prev, newAsset]);
    setShowLogoGenerator(false);
  };

  return (
    <div className="h-full flex flex-col bg-gray-900 text-white relative overflow-hidden">
      {/* Toolbar */}
      <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-gray-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Film className="w-5 h-5 text-purple-400" />
            Studio Timeline
          </h2>
          <p className="text-sm text-gray-400">
            Drag and drop clips to arrange your music video sequence
          </p>
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={() => setShowLogoGenerator(true)}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-full text-sm font-medium transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add Logo
          </button>
          <button 
            onClick={() => setOrderedAssets(assets)}
            className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
          >
            Reset Order
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting || orderedAssets.length === 0}
            className={`flex items-center gap-2 px-6 py-2 rounded-full font-medium transition-all ${
              isExporting 
                ? 'bg-purple-600/50 cursor-wait' 
                : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 shadow-lg hover:shadow-purple-500/25'
            }`}
          >
            {isExporting ? (
              <>Working...</>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Export Music Video
              </>
            )}
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Asset Grid / Timeline */}
        <div className="flex-1 overflow-y-auto p-6">
          {orderedAssets.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-500 border-2 border-dashed border-gray-800 rounded-xl">
              <ImageIcon className="w-12 h-12 mb-2 opacity-50" />
              <p>No assets generated yet.</p>
              <p className="text-sm">Generate some content to start building your video.</p>
              <button 
                onClick={() => setShowLogoGenerator(true)}
                className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-full text-sm font-bold hover:bg-purple-500 transition-colors"
              >
                Generate Logo Asset
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {orderedAssets.map((asset, index) => (
                <div
                  key={asset.id}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragEnd={handleDragEnd}
                  className={`group relative bg-gray-800 rounded-xl overflow-hidden border border-gray-700 transition-all cursor-move ${
                    draggedItemIndex === index ? 'opacity-50 scale-95 ring-2 ring-purple-500' : 'hover:border-gray-600 hover:shadow-xl'
                  }`}
                >
                  {/* Drag Handle Overlay */}
                  <div className="absolute top-2 left-2 z-20 p-1 bg-black/50 rounded cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity">
                    <GripVertical className="w-4 h-4 text-white" />
                  </div>

                  {/* Sequence Number */}
                  <div className="absolute top-2 right-2 z-20 w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-xs font-bold shadow-lg">
                    {index + 1}
                  </div>

                  {/* Content Preview */}
                  <div className="aspect-video w-full bg-black relative">
                    {asset.type === 'video' ? (
                      <video
                        src={asset.url}
                        controls
                        className="w-full h-full object-cover"
                        poster={asset.preview}
                      />
                    ) : (
                      <img
                        src={asset.url}
                        alt={asset.prompt}
                        className="w-full h-full object-cover"
                      />
                    )}
                    
                    {/* Type Indicator */}
                    <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/60 backdrop-blur-sm rounded text-xs font-medium flex items-center gap-1">
                      {asset.type === 'video' ? (
                        <><Film className="w-3 h-3" /> Video</>
                      ) : (
                        <><ImageIcon className="w-3 h-3" /> Image</>
                      )}
                    </div>
                  </div>

                  {/* Metadata */}
                  <div className="p-3">
                    <p className="text-sm text-gray-300 line-clamp-2 mb-2" title={asset.prompt}>
                      {asset.prompt}
                    </p>
                    <div className="flex justify-between items-center text-xs text-gray-500">
                      <span>{new Date(asset.timestamp).toLocaleTimeString()}</span>
                      <button className="hover:text-purple-400 transition-colors">
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Logo Generator Sidebar */}
        {showLogoGenerator && (
          <div className="w-96 border-l border-gray-800 bg-gray-900 flex flex-col shadow-2xl absolute right-0 top-0 bottom-0 z-20">
            <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-gray-800/50">
              <h3 className="font-bold text-white">Generate Logo Asset</h3>
              <button 
                onClick={() => setShowLogoGenerator(false)}
                className="p-1 hover:bg-gray-700 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 bg-gray-100">
               <LogoGenerator 
                 brandInput={brandInput}
                 primaryColor={primaryColor}
                 candidates={logoCandidates}
                 onUpdateCandidates={setLogoCandidates}
               />
            </div>
            {/* Add to Timeline Button for Selected Logo */}
            <div className="p-4 border-t border-gray-800 bg-gray-900">
               <p className="text-xs text-gray-400 mb-3 text-center">
                 Select a generated logo to add it to your timeline.
               </p>
               <div className="grid grid-cols-2 gap-2">
                 {logoCandidates.filter(c => c.status === 'liked').map(c => (
                   <button
                     key={c.id}
                     onClick={() => handleAddLogoToTimeline(c)}
                     className="relative aspect-square rounded-lg overflow-hidden border-2 border-purple-500 hover:opacity-80 transition-opacity"
                   >
                     <img src={c.imageUrl} className="w-full h-full object-contain bg-white" />
                     <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity">
                       <Plus className="w-6 h-6 text-white" />
                     </div>
                   </button>
                 ))}
               </div>
               {logoCandidates.filter(c => c.status === 'liked').length === 0 && (
                 <p className="text-center text-sm text-gray-500 italic">
                   Like a logo concept above to add it here.
                 </p>
               )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

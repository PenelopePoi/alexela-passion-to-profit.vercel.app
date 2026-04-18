
import React from 'react';
import { SavedProject } from '../types';
import { X, FolderOpen, Trash2, Clock, ArrowRight, Sprout, PenTool } from 'lucide-react';

interface ProjectsModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: SavedProject[];
  onLoad: (project: SavedProject) => void;
  onDelete: (projectId: string) => void;
}

export const ProjectsModal: React.FC<ProjectsModalProps> = ({ isOpen, onClose, projects, onLoad, onDelete }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-fade-in-up">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden border border-white/20">
        
        {/* Header */}
        <div className="p-6 border-b border-stone-100 flex justify-between items-center bg-stone-50/50">
          <div>
            <h2 className="text-xl font-serif font-bold text-stone-900 flex items-center gap-2">
              <FolderOpen className="text-brand-teal" size={24} />
              My Projects
            </h2>
            <p className="text-xs text-stone-500 mt-1">Manage your saved brand packages</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-stone-200 rounded-full transition-colors text-stone-500"
          >
            <X size={20} />
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
          {projects.length === 0 ? (
            <div className="text-center py-12 flex flex-col items-center">
              <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mb-4 text-stone-300">
                <Sprout size={32} />
              </div>
              <h3 className="text-stone-900 font-bold mb-1">No saved projects yet</h3>
              <p className="text-stone-500 text-sm max-w-xs mx-auto">
                Create a new brand package and hit save to see it here.
              </p>
            </div>
          ) : (
            <div className="grid gap-3">
              {projects.sort((a,b) => b.lastModified - a.lastModified).map((project) => (
                <div 
                  key={project.id} 
                  className="group bg-white border border-stone-200 rounded-xl p-4 hover:border-brand-teal/30 hover:shadow-md transition-all flex items-center justify-between"
                >
                  <div className="flex-1 cursor-pointer" onClick={() => onLoad(project)}>
                    <div className="flex items-center gap-2">
                        <h3 className="font-bold text-stone-900 text-lg group-hover:text-brand-teal transition-colors">
                        {project.name}
                        </h3>
                        {project.status === 'draft' && (
                            <span className="bg-orange-100 text-orange-600 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border border-orange-200">Draft</span>
                        )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-stone-400 mt-1">
                      <span className="flex items-center gap-1">
                        <Clock size={12} /> 
                        {new Date(project.lastModified).toLocaleDateString()}
                      </span>
                      {project.input.industry && (
                          <span className="bg-stone-100 px-2 py-0.5 rounded-full text-[10px] font-bold text-stone-500 uppercase">
                            {project.input.industry}
                          </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => onLoad(project)}
                      className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 ${project.status === 'draft' ? 'bg-orange-50 text-orange-700 hover:bg-orange-100' : 'bg-brand-teal/10 text-brand-teal hover:bg-brand-teal/20'}`}
                    >
                      {project.status === 'draft' ? <><PenTool size={12} /> Edit</> : <>Open <ArrowRight size={14} /></>}
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); if (window.confirm(`Delete "${project.name}"? This cannot be undone.`)) onDelete(project.id); }}
                      className="p-2 text-stone-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete Project"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-50 border-t border-stone-100 text-center">
          <button 
            onClick={onClose}
            className="text-xs font-bold text-stone-500 hover:text-stone-800"
          >
            Close Window
          </button>
        </div>

      </div>
    </div>
  );
};

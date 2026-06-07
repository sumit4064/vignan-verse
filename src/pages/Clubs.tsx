import React, { useState, useEffect, useMemo } from 'react';
import { Trophy, Users, Star, Plus, X, Calendar, ArrowUpRight, MessageCircle, Music, Palette, BookOpen, PenTool, Mic2, Globe, Landmark, Leaf, Shirt, Plane, Heart, Brain, Scale, Camera, Film, Laptop, User, Activity, Trash2 } from 'lucide-react';
import { dataService } from '../dataService';
import { Club } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface ClubsPageProps {
  currentRole: string;
}

const categoryIcons: Record<string, any> = {
  'TECHNICAL': Laptop,
  'CULTURAL': Music,
  'ACADEMIC': BookOpen,
  'Default': Trophy
};

const Clubs: React.FC<ClubsPageProps> = ({ currentRole }) => {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [formData, setFormData] = useState({ name: '', description: '', members: 0, achievement: '', president: '', category: 'TECHNICAL', qualities: '' });

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  useEffect(() => {
    const unsubscribe = dataService.subscribeClubs((data) => {
      setClubs(data);
    });
    return () => unsubscribe();
  }, []);

  const categories = useMemo(() => {
    const cats = Array.from(new Set(clubs.map(c => c.category || 'Other')));
    return ['All', ...cats];
  }, [clubs]);

  const filteredClubs = useMemo(() => {
    if (activeCategory === 'All') return clubs;
    return clubs.filter(c => c.category === activeCategory);
  }, [clubs, activeCategory]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const clubData = {
      ...formData,
      qualities: formData.qualities.split(',').map(q => q.trim()).filter(q => q !== '')
    };
    await dataService.addClub(clubData);
    setShowAddModal(false);
    setFormData({ name: '', description: '', members: 0, achievement: '', president: '', category: 'TECHNICAL', qualities: '' });
  };

  const handleDelete = async () => {
    if (deleteConfirmation) {
      console.log(`[DEBUG] Attempting to delete club with ID: ${deleteConfirmation}`);
      setIsDeleting(true);
      try {
        await dataService.deleteClub(deleteConfirmation);
        console.log(`[DEBUG] Successfully deleted club with ID: ${deleteConfirmation}`);
        setToast({ message: 'CLUB_DELETED_SUCCESSFULLY', type: 'success' });
        setDeleteConfirmation(null);
      } catch (error) {
        console.error(`[DEBUG] Failed to delete club with ID: ${deleteConfirmation}`, error);
        setToast({ message: 'ERROR_DELETING_CLUB', type: 'error' });
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <div className="space-y-8 md:space-y-12 py-4 md:py-8 px-4 md:px-6 max-w-[1600px] mx-auto">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 md:gap-8 border-b border-slate-800/50 pb-8">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="micro-label">Student Life</div>
            <div className="h-px w-12 bg-slate-800"></div>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white tracking-tight">
            SAC <span className="text-primary italic-serif lowercase">communities</span>
          </h2>
          <p className="text-slate-400 font-medium max-w-xl text-base md:text-lg">
            Join {clubs.length}+ active communities and discover your passion.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          {currentRole === 'Admin' && (
            <button 
              onClick={() => setShowAddModal(true)} 
              className="premium-btn whitespace-nowrap w-full md:w-auto"
            >
              <Plus size={18} /> Register Club
            </button>
          )}
        </div>
      </header>

      {/* Modern Recruitment Banner */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="relative overflow-hidden rounded-[2rem] md:rounded-[3rem] bg-slate-900 border border-slate-800 p-8 md:p-12 lg:p-20 shadow-xl"
      >
        <div className="absolute top-0 right-0 w-[200px] md:w-[400px] h-[200px] md:h-[400px] bg-primary/10 rounded-full blur-[60px] md:blur-[100px] -z-10 translate-x-1/4 -translate-y-1/4" />
        
        <div className="relative z-10 grid md:grid-cols-2 gap-10 lg:gap-16 items-center">
          <div className="space-y-6 md:space-y-8">
            <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-wider">
              <Activity size={14} className="animate-pulse" />
              SAC Recruitment 2026
            </div>
            <h3 className="text-3xl md:text-5xl font-black tracking-tight leading-none text-white uppercase">
              LEAD THE <br />
              <span className="text-primary italic-serif lowercase">frontier</span>
            </h3>
            <p className="text-base md:text-lg text-slate-400 font-medium leading-relaxed max-w-md">
              Apply for executive positions in the Student Activity Council and shape the future of campus life.
            </p>
            <button 
              onClick={() => setShowJoinModal(true)}
              className="premium-btn px-8 md:px-10 py-4 w-full sm:w-auto"
            >
              Apply Now <ArrowUpRight size={20} />
            </button>
          </div>
          
          <div className="card p-6 md:p-8 space-y-6 md:space-y-8 border-l-4 border-l-secondary">
            <h3 className="text-white font-bold uppercase tracking-tight text-xl md:text-2xl flex items-center gap-3 md:gap-4">
              <Users className="text-secondary w-6 md:w-8 h-6 md:h-8" />
              Leadership Nodes
            </h3>
            <div className="grid grid-cols-1 gap-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-5 md:p-6 rounded-2xl bg-slate-800/50 border border-slate-700 hover:bg-slate-800 hover:shadow-md transition-all group gap-2 sm:gap-0">
                <div>
                  <div className="micro-label opacity-40">President</div>
                  <div className="text-lg md:text-xl font-bold text-white group-hover:text-primary transition-colors">Praneetha</div>
                </div>
                <div className="text-primary font-bold text-xs md:text-sm">89775 04799</div>
              </div>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-5 md:p-6 rounded-2xl bg-slate-800/50 border border-slate-700 hover:bg-slate-800 hover:shadow-md transition-all group gap-2 sm:gap-0">
                <div>
                  <div className="micro-label opacity-40">General Secretary</div>
                  <div className="text-lg md:text-xl font-bold text-white group-hover:text-secondary transition-colors">Ojaswi</div>
                </div>
                <div className="text-secondary font-bold text-xs md:text-sm">94182 34545</div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="space-y-10">
        <div className="flex flex-wrap items-center gap-3">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all border",
                activeCategory === cat 
                  ? "bg-primary text-white border-primary shadow-lg" 
                  : "bg-slate-900 text-slate-500 border-slate-800 hover:bg-slate-800 hover:text-white"
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {filteredClubs.map((club, index) => {
              const Icon = categoryIcons[club.category || 'Default'] || Trophy;
              return (
                <motion.div 
                  key={club.id} 
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05 }}
                  className="card group flex flex-col justify-between min-h-[450px] border-t-4 border-t-primary/20 hover:border-t-primary transition-all"
                >
                  <div className="space-y-8">
                    <div className="flex justify-between items-start">
                      <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center text-slate-700 group-hover:text-primary group-hover:bg-primary/10 border border-slate-800 group-hover:border-primary/30 transition-all duration-500">
                        <Icon size={32} />
                      </div>
                      <div className="flex flex-col items-end gap-3">
                        <div className="px-3 py-1 rounded-lg bg-secondary/10 text-secondary border border-secondary/20 text-[8px] font-bold uppercase tracking-wider w-fit">{club.category || 'Club'}</div>
                        {currentRole === 'Admin' && (
                          <button 
                            onClick={() => setDeleteConfirmation(club.id)}
                            className="p-2 text-slate-600 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                            title="Delete Club"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h3 className="text-2xl font-bold text-white group-hover:text-primary transition-colors tracking-tight">{club.name}</h3>
                      <p className="text-slate-400 font-medium leading-relaxed text-sm line-clamp-3">{club.description}</p>
                      
                      {club.qualities && (
                        <div className="flex flex-wrap gap-2">
                          {club.qualities.map((quality, i) => (
                            <span key={i} className="px-3 py-1 rounded-lg bg-slate-800/50 border border-slate-700 text-[8px] font-bold uppercase tracking-wider text-slate-500">
                              {quality}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-8 border-t border-slate-800/50 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-600">
                        <User size={20} />
                      </div>
                      <div className="space-y-0.5">
                        <p className="micro-label opacity-40">President</p>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{club.president || 'TBA'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="micro-label opacity-40">Members</p>
                        <p className="text-xl font-bold text-primary tracking-tight">{club.members}+</p>
                      </div>
                      <button className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-600 group-hover:bg-primary group-hover:text-white transition-all border border-slate-700">
                        <ArrowUpRight size={18} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }} 
            className="bg-slate-900 p-6 md:p-8 rounded-[2rem] border border-slate-800 shadow-2xl w-full max-w-xl relative my-auto"
          >
            <button onClick={() => setShowAddModal(false)} className="absolute top-4 right-4 md:top-6 md:right-6 text-slate-500 hover:text-white transition-colors"><X size={20} /></button>
            
            <div className="mb-6 md:mb-8">
              <div className="micro-label mb-1 text-primary">System Protocol</div>
              <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight italic uppercase leading-tight">Register Club</h2>
            </div>

            <form onSubmit={handleAdd} className="space-y-4 md:space-y-6">
              <div className="space-y-1.5 md:space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 ml-1">Club Name</label>
                <input required placeholder="e.g. Photography Club" className="w-full bg-slate-800/50 border border-slate-700 rounded-xl p-3 focus:border-primary/50 transition-all outline-none text-white placeholder:text-slate-600" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="space-y-1.5 md:space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 ml-1">Description</label>
                <textarea required placeholder="What does this club do?" className="w-full min-h-[80px] bg-slate-800/50 border border-slate-700 rounded-xl p-3 focus:border-primary/50 transition-all outline-none text-white placeholder:text-slate-600 resize-none" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-1.5 md:space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 ml-1">Initial Members</label>
                  <input required type="number" className="w-full bg-slate-800/50 border border-slate-700 rounded-xl p-3 focus:border-primary/50 transition-all outline-none text-white placeholder:text-slate-600" value={isNaN(formData.members) ? '' : formData.members} onChange={e => setFormData({...formData, members: parseInt(e.target.value)})} />
                </div>
                <div className="space-y-1.5 md:space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 ml-1">Category</label>
                  <select 
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-xl p-3 focus:border-primary/50 transition-all outline-none text-white appearance-none"
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value})}
                  >
                    <option value="TECHNICAL" className="bg-slate-900">TECHNICAL</option>
                    <option value="CULTURAL" className="bg-slate-900">CULTURAL</option>
                    <option value="ACADEMIC" className="bg-slate-900">ACADEMIC</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1.5 md:space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 ml-1">President Name</label>
                <input placeholder="e.g. Nihal Kumar" className="w-full bg-slate-800/50 border border-slate-700 rounded-xl p-3 focus:border-primary/50 transition-all outline-none text-white placeholder:text-slate-600" value={formData.president} onChange={e => setFormData({...formData, president: e.target.value})} />
              </div>
              <div className="space-y-1.5 md:space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 ml-1">Qualities (comma separated)</label>
                <input placeholder="e.g. Creative, Energetic, Leadership" className="w-full bg-slate-800/50 border border-slate-700 rounded-xl p-3 focus:border-primary/50 transition-all outline-none text-white placeholder:text-slate-600" value={formData.qualities} onChange={e => setFormData({...formData, qualities: e.target.value})} />
              </div>
              <div className="space-y-1.5 md:space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 ml-1">Top Achievement</label>
                <input required placeholder="e.g. Best Club 2025" className="w-full bg-slate-800/50 border border-slate-700 rounded-xl p-3 focus:border-primary/50 transition-all outline-none text-white placeholder:text-slate-600" value={formData.achievement} onChange={e => setFormData({...formData, achievement: e.target.value})} />
              </div>
              <div className="flex gap-4 pt-2 md:pt-4">
                <button type="submit" className="premium-btn w-full justify-center py-4 text-sm">Register Club</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {showJoinModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }} 
            className="bg-slate-900 p-10 rounded-3xl border border-slate-800 shadow-2xl w-full max-w-md text-center relative"
          >
            <button 
              onClick={() => setShowJoinModal(false)}
              className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 text-primary border border-primary/20">
              <Users size={32} />
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight uppercase italic mb-2">SAC Application</h2>
            <p className="text-sm text-slate-400 mb-8 font-medium leading-relaxed">
              Join the Student Activities Council and lead the change. Fill in your details to apply for recruitment.
            </p>
            <form onSubmit={(e) => { e.preventDefault(); setShowJoinModal(false); /* alert removed as per guidelines */ }} className="space-y-4">
              <input required placeholder="Full Name" className="w-full bg-slate-800/50 border border-slate-700 rounded-xl p-3 focus:border-primary/50 transition-all outline-none text-white placeholder:text-slate-600" />
              <input required placeholder="Regd Number" className="w-full bg-slate-800/50 border border-slate-700 rounded-xl p-3 focus:border-primary/50 transition-all outline-none text-white placeholder:text-slate-600" />
              <select className="w-full bg-slate-800/50 border border-slate-700 rounded-xl p-3 focus:border-primary/50 transition-all outline-none text-white">
                <option className="bg-slate-900">Vertical: Technical</option>
                <option className="bg-slate-900">Vertical: Cultural</option>
                <option className="bg-slate-900">Vertical: Sports</option>
                <option className="bg-slate-900">Vertical: Media</option>
              </select>
              <button type="submit" className="premium-btn w-full justify-center py-4">Submit Application</button>
            </form>
          </motion.div>
        </div>
      )}

      {deleteConfirmation && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }} 
            className="bg-slate-900 p-10 rounded-3xl border border-slate-800 shadow-2xl w-full max-w-md text-center"
          >
            <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 text-red-500 border border-red-500/20">
              <Trash2 size={32} className={isDeleting ? 'animate-pulse' : ''} />
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight uppercase italic mb-2">Confirm Deletion</h2>
            <p className="text-sm text-slate-400 mb-8 font-medium leading-relaxed">
              {isDeleting ? 'Initializing deletion protocol...' : 'Are you sure you want to remove this club from the database? This action is permanent and cannot be undone.'}
            </p>
            <div className="flex gap-4">
              <button 
                disabled={isDeleting}
                onClick={() => setDeleteConfirmation(null)}
                className="flex-1 px-6 py-3 rounded-xl bg-slate-800 text-slate-300 font-bold uppercase tracking-wider text-[10px] hover:bg-slate-700 transition-all border border-slate-700 disabled:opacity-50"
              >
                Cancel
              </button>
              <button 
                disabled={isDeleting}
                onClick={handleDelete}
                className="flex-1 px-6 py-3 rounded-xl bg-red-500 text-white font-bold uppercase tracking-wider text-[10px] hover:bg-red-600 transition-all shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Deleting...
                  </>
                ) : 'Delete'}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className={cn(
            "fixed bottom-12 left-1/2 -translate-x-1/2 z-[200] px-6 py-3 rounded-xl border font-bold uppercase tracking-wider text-[10px] shadow-2xl flex items-center gap-3 bg-slate-900 backdrop-blur-xl",
            toast.type === 'success' ? "border-emerald-500 text-emerald-500" : "border-red-500 text-red-500"
          )}
        >
          <div className={cn("w-2 h-2 rounded-full animate-pulse", toast.type === 'success' ? "bg-emerald-500" : "bg-red-500")} />
          {toast.message}
        </motion.div>
      )}
    </div>
  );
};

export default Clubs;

import React, { useState, useEffect } from 'react';
import { Code, Plus, Trash2, X, ExternalLink, Calendar, Users, Briefcase, Video, Laptop, Clock, Share2, Bookmark } from 'lucide-react';
import { dataService } from '../dataService';
import { TechnicalEvent } from '../types';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

interface TechnicalPageProps {
  currentRole: string;
}

const Technical: React.FC<TechnicalPageProps> = ({ currentRole }) => {
  const [events, setEvents] = useState<TechnicalEvent[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
  const [formData, setFormData] = useState({ 
    title: '', 
    type: 'Hackathon' as any, 
    deadline: '', 
    link: '', 
    description: '' 
  });

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  useEffect(() => {
    const unsubscribe = dataService.subscribeTechnicalEvents((data) => {
      setEvents(data);
    });
    return () => unsubscribe();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    await dataService.addTechnicalEvent(formData);
    setShowAddModal(false);
    setFormData({ title: '', type: 'Hackathon', deadline: '', link: '', description: '' });
  };

  const handleDelete = async () => {
    if (deleteConfirmation) {
      console.log(`[DEBUG] Attempting to delete opportunity with ID: ${deleteConfirmation}`);
      setIsDeleting(true);
      try {
        await dataService.deleteTechnicalEvent(deleteConfirmation);
        console.log(`[DEBUG] Successfully deleted opportunity with ID: ${deleteConfirmation}`);
        setToast({ message: 'OPPORTUNITY_DELETED_SUCCESSFULLY', type: 'success' });
        setDeleteConfirmation(null);
      } catch (error) {
        console.error(`[DEBUG] Failed to delete opportunity with ID: ${deleteConfirmation}`, error);
        setToast({ message: 'ERROR_DELETING_OPPORTUNITY', type: 'error' });
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'Hackathon': return <Code size={32} />;
      case 'Internship': return <Briefcase size={32} />;
      case 'Workshop': return <Laptop size={32} />;
      case 'Webinar': return <Video size={32} />;
      default: return <Code size={32} />;
    }
  };

  const getBadgeColor = (type: string) => {
    switch (type) {
      case 'Hackathon': return 'purple';
      case 'Internship': return 'green';
      case 'Workshop': return 'orange';
      case 'Webinar': return 'blue';
      default: return 'purple';
    }
  };

  return (
    <div className="space-y-16 md:space-y-32 py-8 md:py-12 pb-24 md:pb-48 px-4 md:px-6">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10 md:gap-16 max-w-[1800px] mx-auto">
        <div className="space-y-6 md:space-y-8">
          <div className="flex items-center gap-4 md:gap-5">
            <div className="micro-label text-primary text-[8px] md:text-xs">INNOVATION_HUB</div>
            <div className="h-px w-16 md:w-24 bg-slate-800"></div>
          </div>
          <h2 className="text-5xl md:text-7xl lg:text-massive text-white tracking-tight leading-none font-black uppercase">
            TECHNICAL <br />
            <span className="italic-serif lowercase text-primary">protocols</span>
          </h2>
          <p className="text-lg md:text-2xl text-slate-400 font-medium max-w-xl leading-snug tracking-tight">
            Hackathons, internships, and the latest technical opportunities curated for Vignan students.
          </p>
        </div>
        {currentRole === 'Admin' && (
          <button 
            onClick={() => setShowAddModal(true)} 
            className="premium-btn px-8 md:px-12 py-4 md:py-6 w-full md:w-auto flex justify-center text-sm md:text-base"
          >
            <Plus size={24} /> POST_OPPORTUNITY
          </button>
        )}
      </header>

      <div className="max-w-[1800px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16">
        {events.map((event, index) => (
          <motion.div 
            key={event.id} 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.8 }}
            className="card group p-6 md:p-12 border-l-4 border-l-primary/30 hover:border-l-primary transition-all bg-slate-900 border border-slate-800 shadow-sm hover:shadow-xl"
          >
            <div className="flex flex-col md:flex-row gap-8 md:gap-12">
              <div className="w-20 h-20 md:w-32 md:h-32 bg-slate-950 rounded-2xl md:rounded-[2.5rem] flex items-center justify-center shrink-0 border border-slate-800 group-hover:border-primary/30 transition-all relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10 text-slate-700 group-hover:text-primary transition-colors duration-500">
                  {React.cloneElement(getIcon(event.type) as React.ReactElement, { size: 40, className: "md:w-12 md:h-12" })}
                </div>
              </div>
              
              <div className="flex-1 space-y-6 md:space-y-8 text-left">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                  <div className="space-y-3">
                    <div className={`px-4 py-1.5 rounded-lg text-[8px] font-black tracking-widest w-fit ${
                      event.type === 'Hackathon' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                      event.type === 'Internship' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                      event.type === 'Workshop' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' :
                      'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                    }`}>{event.type.toUpperCase()}</div>
                    <h3 className="text-3xl md:text-4xl font-black tracking-tighter uppercase group-hover:text-primary transition-colors leading-tight text-white">{event.title}</h3>
                  </div>
                  <div className="flex gap-2">
                    <button className="p-3 md:p-4 text-slate-600 hover:text-white hover:bg-slate-800 rounded-xl md:rounded-2xl transition-all">
                      <Bookmark size={20} />
                    </button>
                    {currentRole === 'Admin' && (
                      <button 
                        onClick={() => setDeleteConfirmation(event.id)}
                        className="p-3 md:p-4 text-slate-600 hover:text-red-500 hover:bg-red-500/10 rounded-xl md:rounded-2xl transition-all"
                      >
                        <Trash2 size={20} />
                      </button>
                    )}
                  </div>
                </div>

                <p className="text-slate-400 font-medium leading-relaxed text-base md:text-lg line-clamp-3">{event.description}</p>

                <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 pt-8 md:pt-10 border-t border-slate-800">
                  <div className="space-y-2 text-left">
                    <p className="micro-label text-slate-500 text-[8px]">Deadline</p>
                    <div className="flex items-center gap-2 md:gap-3 text-slate-400">
                      <Clock size={16} className="text-primary" />
                      <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest font-mono">{event.deadline}</span>
                    </div>
                  </div>
                  <div className="space-y-2 text-left">
                    <p className="micro-label text-slate-500 text-[8px]">Participants</p>
                    <div className="flex items-center gap-2 md:gap-3 text-slate-400">
                      <Users size={16} className="text-purple-400" />
                      <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest font-mono">500+</span>
                    </div>
                  </div>
                  <div className="col-span-2 lg:col-span-1 pt-2 lg:pt-0">
                    <a 
                      href={event.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="premium-btn w-full py-4 text-[10px] flex items-center justify-center gap-2"
                    >
                      APPLY <ExternalLink size={16} />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>


      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }} 
            className="bg-slate-900 p-8 md:p-12 rounded-[2rem] md:rounded-[3rem] border border-slate-800 shadow-2xl w-full max-w-2xl relative my-auto"
          >
            <button onClick={() => setShowAddModal(false)} className="absolute top-6 md:top-8 right-6 md:right-8 text-slate-500 hover:text-white transition-colors"><X size={24} /></button>
            <div className="mb-8 md:mb-12">
              <p className="micro-label text-primary mb-2">System Protocol</p>
              <h2 className="text-3xl md:text-4xl font-black tracking-tighter italic uppercase text-white leading-tight">Post Opportunity</h2>
            </div>
            <form onSubmit={handleAdd} className="space-y-6 md:space-y-8">
              <div className="space-y-2 text-left">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Title</label>
                <input required placeholder="e.g. Google Summer of Code" className="w-full bg-slate-800/50 border border-slate-700 rounded-xl p-4 focus:border-primary/50 transition-all outline-none text-white placeholder:text-slate-600" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                <div className="space-y-2 text-left">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Type</label>
                  <select className="w-full bg-slate-800/50 border border-slate-700 rounded-xl p-4 focus:border-primary/50 transition-all outline-none text-white appearance-none" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value as any})}>
                    <option value="Hackathon" className="bg-slate-900">Hackathon</option>
                    <option value="Internship" className="bg-slate-900">Internship</option>
                    <option value="Workshop" className="bg-slate-900">Workshop</option>
                    <option value="Webinar" className="bg-slate-900">Webinar</option>
                  </select>
                </div>
                <div className="space-y-2 text-left">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Deadline</label>
                  <input required type="date" className="w-full bg-slate-800/50 border border-slate-700 rounded-xl p-4 focus:border-primary/50 transition-all outline-none text-white placeholder:text-slate-600 appearance-none" value={formData.deadline} onChange={e => setFormData({...formData, deadline: e.target.value})} />
                </div>
              </div>
              <div className="space-y-2 text-left">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Application Link</label>
                <input required placeholder="https://..." className="w-full bg-slate-800/50 border border-slate-700 rounded-xl p-4 focus:border-primary/50 transition-all outline-none text-white placeholder:text-slate-600" value={formData.link} onChange={e => setFormData({...formData, link: e.target.value})} />
              </div>
              <div className="space-y-2 text-left">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Description</label>
                <textarea required placeholder="Details about this opportunity..." className="w-full min-h-[100px] bg-slate-800/50 border border-slate-700 rounded-xl p-4 focus:border-primary/50 transition-all outline-none text-white placeholder:text-slate-600 resize-none" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
              </div>
              <div className="flex gap-4 pt-4 md:pt-8">
                <button type="submit" className="premium-btn w-full justify-center py-5 md:py-6 text-base md:text-lg">POST_OPPORTUNITY</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {deleteConfirmation && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }} 
            className="bg-slate-900 p-12 rounded-[3rem] border border-slate-800 shadow-2xl w-full max-w-md text-center"
          >
            <div className="w-20 h-20 bg-red-500/10 rounded-3xl flex items-center justify-center mx-auto mb-8 text-red-500 border border-red-500/20">
              <Trash2 size={40} className={isDeleting ? 'animate-pulse' : ''} />
            </div>
            <h2 className="text-3xl font-black tracking-tighter uppercase italic mb-4 text-white">Confirm_Deletion</h2>
            <p className="text-slate-400 mb-10 font-medium leading-relaxed">
              {isDeleting ? 'Initializing deletion protocol...' : 'Are you sure you want to remove this opportunity from the database? This action is permanent and cannot be undone.'}
            </p>
            <div className="flex gap-4">
              <button 
                disabled={isDeleting}
                onClick={() => setDeleteConfirmation(null)}
                className="flex-1 px-8 py-4 rounded-2xl bg-slate-800 text-slate-400 font-black uppercase tracking-widest text-[10px] hover:bg-slate-700 transition-all border border-slate-700 disabled:opacity-50"
              >
                Cancel
              </button>
              <button 
                disabled={isDeleting}
                onClick={handleDelete}
                className="flex-1 px-8 py-4 rounded-2xl bg-red-500 text-white font-black uppercase tracking-widest text-[10px] hover:bg-red-600 transition-all shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    DELETING...
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
            "fixed bottom-12 left-1/2 -translate-x-1/2 z-[200] px-8 py-4 rounded-2xl border font-black uppercase tracking-widest text-xs shadow-2xl flex items-center gap-4 bg-slate-900 backdrop-blur-xl",
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

export default Technical;

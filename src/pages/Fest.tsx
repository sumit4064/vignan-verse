import React, { useState, useEffect } from 'react';
import { Music, Calendar, MapPin, Plus, Trash2, X, Code, Terminal, Cpu, Zap } from 'lucide-react';
import { dataService } from '../dataService';
import { FestEvent } from '../types';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

interface FestPageProps {
  currentRole: string;
}

const Fest: React.FC<FestPageProps> = ({ currentRole }) => {
  const [events, setEvents] = useState<FestEvent[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
  const [formData, setFormData] = useState({ title: '', date: '', venue: '', description: '', category: 'Technical' });

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  useEffect(() => {
    const unsubscribe = dataService.subscribeFestEvents((data) => {
      setEvents(data);
    });
    return () => unsubscribe();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    await dataService.addFestEvent(formData);
    setShowAddModal(false);
    setFormData({ title: '', date: '', venue: '', description: '', category: 'Technical' });
  };

  const handleDelete = async () => {
    if (deleteConfirmation) {
      console.log(`[DEBUG] Attempting to delete event with ID: ${deleteConfirmation}`);
      setIsDeleting(true);
      try {
        await dataService.deleteFestEvent(deleteConfirmation);
        console.log(`[DEBUG] Successfully deleted event with ID: ${deleteConfirmation}`);
        setToast({ message: 'EVENT_DELETED_SUCCESSFULLY', type: 'success' });
        setDeleteConfirmation(null);
      } catch (error) {
        console.error(`[DEBUG] Failed to delete event with ID: ${deleteConfirmation}`, error);
        setToast({ message: 'ERROR_DELETING_EVENT', type: 'error' });
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const getIcon = (title: string) => {
    const t = title.toLowerCase();
    if (t.includes('code') || t.includes('coding')) return <Code size={40} />;
    if (t.includes('prompt')) return <Terminal size={40} />;
    if (t.includes('debug')) return <Zap size={40} />;
    if (t.includes('quiz')) return <Cpu size={40} />;
    return <Music size={40} />;
  };

  return (
    <div className="space-y-16 md:space-y-32 py-8 md:py-12 pb-24 md:pb-48 px-4 md:px-6">
      <div className="relative overflow-hidden rounded-[2.5rem] md:rounded-[5rem] bg-slate-900 border border-slate-800 p-8 md:p-16 lg:p-32 shadow-xl">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(99,102,241,0.1),transparent_70%)]" />
          <div className="w-full h-full opacity-10 bg-[url('https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80')] bg-cover bg-center mix-blend-overlay" />
        </div>
        
        <div className="relative z-10 space-y-8 md:space-y-16 max-w-5xl">
          <div className="flex items-center gap-4 md:gap-8">
            <div className="micro-label text-primary tracking-[0.2em] md:tracking-[0.4em] text-[8px] md:text-xs">MARCH – APRIL 2025</div>
            <div className="h-px w-16 md:w-32 bg-slate-800"></div>
          </div>
          
          <h2 className="text-5xl md:text-7xl lg:text-massive text-white leading-[0.9] md:leading-[0.8] tracking-tighter uppercase font-black">
            VCODE <br />
            <span className="italic-serif lowercase text-primary">2025 edition</span>
          </h2>
          
          <p className="text-base md:text-2xl lg:text-4xl text-slate-400 font-medium leading-relaxed md:leading-tight max-w-3xl tracking-tight">
            The ultimate CSE Department Fest. Prompt Master, Debugging & Defend, Coding Contests, and more. 
            <span className="text-white block md:inline mt-2 md:mt-0"> Push your limits and define the future of technology.</span>
          </p>
          
          <div className="flex flex-col sm:flex-row flex-wrap items-center gap-6 md:gap-10 pt-6 md:pt-12">
            <button 
              onClick={() => setShowRegisterModal(true)}
              className="premium-btn text-base md:text-2xl px-12 md:px-24 py-5 md:py-10 w-full sm:w-auto text-center"
            >
              REGISTER_FOR_VCODE
            </button>
            {currentRole === 'Admin' && (
              <button 
                onClick={() => setShowAddModal(true)} 
                className="w-20 h-20 md:w-28 md:h-28 rounded-[2rem] md:rounded-[3rem] bg-slate-800 border border-slate-700 flex items-center justify-center hover:bg-primary/10 hover:border-primary/30 transition-all group shadow-sm shrink-0"
              >
                <Plus size={32} className="group-hover:rotate-90 transition-transform duration-700 text-primary md:w-12 md:h-12" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-[1800px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16">
        {events.map((event, index) => (
          <motion.div 
            key={event.id} 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.8 }}
            className="card group p-0 overflow-hidden border-slate-800 hover:border-primary/30 transition-all bg-slate-900 shadow-sm hover:shadow-xl"
          >
            <div className="relative h-80 bg-slate-950 flex items-center justify-center overflow-hidden">
              <img 
                src={event.image_url || `https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&q=80&w=800&seed=${event.title}`} 
                alt={event.title}
                className="absolute inset-0 w-full h-full object-cover opacity-20 group-hover:scale-110 transition-transform duration-1000"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent" />
              <div className="relative z-10 text-slate-700 group-hover:text-primary transition-colors duration-700">
                {getIcon(event.title)}
              </div>
              <div className="absolute bottom-8 left-10 right-10 flex justify-between items-end">
                <div className="px-5 py-2 rounded-xl bg-primary/10 text-primary border border-primary/20 text-[10px] font-black uppercase tracking-widest">{event.category}</div>
                {currentRole === 'Admin' && (
                  <button 
                    onClick={() => setDeleteConfirmation(event.id)}
                    className="p-4 text-slate-600 hover:text-red-500 hover:bg-red-500/10 rounded-2xl transition-all"
                  >
                    <Trash2 size={20} />
                  </button>
                )}
              </div>
            </div>
            
            <div className="p-8 md:p-12 space-y-6 md:space-y-8">
              <div className="space-y-3">
                <h3 className="text-3xl md:text-4xl font-black tracking-tighter uppercase group-hover:text-primary transition-colors leading-tight text-white">{event.title}</h3>
                <p className="text-slate-400 font-medium leading-relaxed line-clamp-2 text-sm">{event.description}</p>
              </div>
              
              <div className="flex flex-col gap-4 md:gap-5 pt-6 md:pt-8 border-t border-slate-800">
                <div className="flex items-center gap-4 md:gap-5 text-slate-400">
                  <Calendar size={18} className="text-primary md:w-5 md:h-5" />
                  <span className="text-[10px] font-black tracking-widest uppercase">{event.date}</span>
                </div>
                <div className="flex items-center gap-4 md:gap-5 text-slate-400">
                  <MapPin size={18} className="text-secondary md:w-5 md:h-5" />
                  <span className="text-[10px] font-black tracking-widest uppercase">{event.venue}</span>
                </div>
              </div>

              <button 
                onClick={() => setShowRegisterModal(true)}
                className="w-full py-5 md:py-6 rounded-2xl border border-slate-800 text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all text-slate-400 hover:text-white"
              >
                INITIALIZE_REGISTRATION
              </button>
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
              <h2 className="text-3xl md:text-4xl font-black tracking-tighter italic uppercase text-white leading-tight">Add Fest Event</h2>
            </div>
            <form onSubmit={handleAdd} className="space-y-6 md:space-y-8">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Event Title</label>
                <input required placeholder="e.g. Prompt Master" className="w-full bg-slate-800/50 border border-slate-700 rounded-xl p-4 focus:border-primary/50 transition-all outline-none text-white placeholder:text-slate-600" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Date</label>
                  <input required type="date" className="w-full bg-slate-800/50 border border-slate-700 rounded-xl p-4 focus:border-primary/50 transition-all outline-none text-white placeholder:text-slate-600 appearance-none" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Venue</label>
                  <input required placeholder="e.g. CSE Lab" className="w-full bg-slate-800/50 border border-slate-700 rounded-xl p-4 focus:border-primary/50 transition-all outline-none text-white placeholder:text-slate-600" value={formData.venue} onChange={e => setFormData({...formData, venue: e.target.value})} />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Description</label>
                <textarea required placeholder="What's happening in this event?" className="w-full min-h-[120px] bg-slate-800/50 border border-slate-700 rounded-xl p-4 focus:border-primary/50 transition-all outline-none text-white placeholder:text-slate-600 resize-none" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
              </div>
              <div className="flex gap-4 pt-4 md:pt-8">
                <button type="submit" className="premium-btn w-full justify-center py-5 md:py-6 text-base md:text-lg">CREATE_EVENT</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {showRegisterModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }} 
            className="bg-slate-900 p-12 rounded-[3rem] border border-slate-800 shadow-2xl w-full max-w-md text-center relative"
          >
            <button 
              onClick={() => setShowRegisterModal(false)}
              className="absolute top-8 right-8 text-slate-500 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>
            <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-8 text-primary border border-primary/20">
              <Zap size={40} />
            </div>
            <h2 className="text-3xl font-black tracking-tighter uppercase italic mb-4 text-white">Register_for_VCODE</h2>
            <p className="text-slate-400 mb-10 font-medium leading-relaxed">
              Ready to showcase your skills? Register now to participate in VCODE 2025 events and compete with the best.
            </p>
            <form onSubmit={(e) => { e.preventDefault(); setShowRegisterModal(false); /* alert removed */ }} className="space-y-4">
              <input required placeholder="Your Full Name" className="w-full bg-slate-800/50 border border-slate-700 rounded-xl p-4 focus:border-primary/50 transition-all outline-none text-white placeholder:text-slate-600" />
              <input required type="email" placeholder="Your College Email" className="w-full bg-slate-800/50 border border-slate-700 rounded-xl p-4 focus:border-primary/50 transition-all outline-none text-white placeholder:text-slate-600" />
              <button type="submit" className="premium-btn w-full justify-center py-5 mt-4">COMPLETE_REGISTRATION</button>
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
              {isDeleting ? 'Initializing deletion protocol...' : 'Are you sure you want to remove this event from the database? This action is permanent and cannot be undone.'}
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

export default Fest;

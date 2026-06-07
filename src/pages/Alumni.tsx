import React, { useState, useEffect } from 'react';
import { GraduationCap, Plus, ChevronLeft, ChevronRight, Trash2, Search, Filter, X, Briefcase, Linkedin, ExternalLink, MessageCircle } from 'lucide-react';
import { dataService } from '../dataService';
import { Alumni } from '../types';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

import { resizeImage } from '../lib/imageUtils';

interface AlumniPageProps {
  currentRole: string;
}

const AlumniPage: React.FC<AlumniPageProps> = ({ currentRole }) => {
  const [alumni, setAlumni] = useState<Alumni[]>([]);
  const [search, setSearch] = useState('');
  const [dept, setDept] = useState('');
  const [page, setPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
  const itemsPerPage = 6;

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  useEffect(() => {
    const unsubscribe = dataService.subscribeAlumni((data) => {
      setAlumni(data);
    });
    return () => unsubscribe();
  }, []);

  const filtered = alumni.filter(a => 
    a.name.toLowerCase().includes(search.toLowerCase()) &&
    (dept === '' || a.department === dept)
  );

  const paginated = filtered.slice((page - 1) * itemsPerPage, page * itemsPerPage);
  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  const handleDelete = async () => {
    if (deleteConfirmation) {
      console.log(`[DEBUG] Attempting to delete alumni with ID: ${deleteConfirmation}`);
      setIsDeleting(true);
      try {
        await dataService.deleteAlumni(deleteConfirmation);
        console.log(`[DEBUG] Successfully deleted alumni with ID: ${deleteConfirmation}`);
        setToast({ message: 'ALUMNI_RECORD_DELETED_SUCCESSFULLY', type: 'success' });
        setDeleteConfirmation(null);
      } catch (error) {
        console.error(`[DEBUG] Failed to delete alumni with ID: ${deleteConfirmation}`, error);
        setToast({ message: 'ERROR_DELETING_RECORD', type: 'error' });
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const [formData, setFormData] = useState({ 
    name: '', 
    email: '', 
    department: 'CSE', 
    yearOfGraduation: new Date().getFullYear().toString(),
    image_url: '', 
    photo: '' 
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const resized = await resizeImage(reader.result as string, 400, 400, 0.6);
        setFormData({ ...formData, photo: resized });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    await dataService.addAlumni(formData);
    setShowAddModal(false);
    setFormData({ name: '', email: '', department: 'CSE', yearOfGraduation: new Date().getFullYear().toString(), image_url: '', photo: '' });
  };

  return (
    <div className="space-y-8 md:space-y-12 py-4 md:py-8 px-4 md:px-6 max-w-[1600px] mx-auto">
      <header className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-8 border-b border-slate-800/50 pb-8">
        <div className="space-y-2 w-full">
          <div className="flex items-center gap-3">
            <div className="micro-label">Global Network</div>
            <div className="h-px w-12 bg-slate-800"></div>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white tracking-tight">
            ALUMNI <span className="text-primary italic-serif lowercase">connect</span>
          </h2>
          <p className="text-slate-400 font-medium max-w-xl text-base md:text-lg">
            Connect with {filtered.length} successful graduates from Vignan.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full xl:w-auto">
          <div className="relative w-full sm:w-80 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Search alumni..." 
              className="w-full pl-12 pr-4 py-3 bg-slate-900/50 border border-slate-800 rounded-xl focus:border-primary/50 transition-all text-sm font-medium text-white placeholder:text-slate-600"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <select 
              className="w-full sm:w-48 py-3 bg-slate-900/50 border border-slate-800 rounded-xl text-sm font-bold px-4 outline-none focus:border-primary/50 text-white"
              value={dept}
              onChange={(e) => { setDept(e.target.value); setPage(1); }}
            >
              <option value="" className="bg-slate-900">All Departments</option>
              <option value="CSE" className="bg-slate-900">CSE</option>
              <option value="ECE" className="bg-slate-900">ECE</option>
              <option value="IT" className="bg-slate-900">IT</option>
              <option value="MECH" className="bg-slate-900">MECH</option>
            </select>

            {currentRole === 'Admin' && (
              <button 
                onClick={() => setShowAddModal(true)} 
                className="premium-btn whitespace-nowrap w-full sm:w-auto"
              >
                <Plus size={18} /> Add Alumni
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {paginated.map((a, index) => (
          <motion.div 
            key={a.id} 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="card group"
          >
            <div className="flex items-start gap-6">
              <div className="relative shrink-0">
                <img 
                  src={a.photo || a.image_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${a.name}`} 
                  alt={a.name} 
                  className="w-24 h-24 rounded-2xl object-cover border-2 border-slate-800 group-hover:border-primary/30 transition-all duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-secondary rounded-lg flex items-center justify-center text-white shadow-lg border-2 border-slate-900">
                  <Briefcase size={14} />
                </div>
              </div>
              
              <div className="flex-1 min-w-0 space-y-4">
                <div className="flex justify-between items-start">
                  <div className="min-w-0">
                    <h3 className="text-xl font-bold text-white truncate group-hover:text-primary transition-colors">{a.name}</h3>
                    <p className="text-xs font-medium text-slate-500 truncate">{a.email}</p>
                  </div>
                  {currentRole === 'Admin' && (
                    <button 
                      onClick={() => setDeleteConfirmation(a.id)}
                      className="p-2 text-slate-600 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                      title="Delete Alumni"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 rounded-lg bg-primary/10 text-primary border border-primary/20 text-[10px] font-bold uppercase tracking-wider">{a.department}</span>
                  <span className="px-3 py-1 rounded-lg bg-slate-800/50 text-slate-400 border border-slate-700 text-[10px] font-bold uppercase tracking-wider">Class of {a.yearOfGraduation}</span>
                </div>

                <div className="flex items-center gap-3 pt-4 border-t border-slate-800/50">
                  <a 
                    href={`mailto:${a.email}`}
                    className="flex-1 py-2 px-4 bg-slate-800/50 hover:bg-slate-800 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 border border-slate-700 text-slate-300"
                  >
                    <Linkedin size={14} /> Profile
                  </a>
                  <button className="flex-1 py-2 px-4 bg-slate-800/50 hover:bg-slate-800 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 border border-slate-700 text-slate-300">
                    <MessageCircle size={14} /> Message
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>


      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 md:gap-6 mt-12 md:mt-16">
          <button 
            disabled={page === 1} 
            onClick={() => setPage(p => p - 1)} 
            className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center disabled:opacity-20 hover:bg-[#00f2ff]/10 hover:text-[#00f2ff] hover:border-[#00f2ff]/30 transition-all"
          >
            <ChevronLeft size={20} className="md:w-6 md:h-6" />
          </button>
          <div className="px-4 md:px-6 py-2 bg-white/5 rounded-xl border border-white/10 font-mono font-bold text-xs md:text-base">
            <span className="text-[#00f2ff]">{page}</span> / {totalPages}
          </div>
          <button 
            disabled={page === totalPages} 
            onClick={() => setPage(p => p + 1)} 
            className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center disabled:opacity-20 hover:bg-[#00f2ff]/10 hover:text-[#00f2ff] hover:border-[#00f2ff]/30 transition-all"
          >
            <ChevronRight size={20} className="md:w-6 md:h-6" />
          </button>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }} 
            animate={{ opacity: 1, scale: 1, y: 0 }} 
            className="bg-slate-900 p-8 md:p-12 rounded-[2rem] md:rounded-[3rem] border border-slate-800 shadow-2xl w-full max-w-2xl relative my-auto"
          >
            <button onClick={() => setShowAddModal(false)} className="absolute top-6 md:top-8 right-6 md:right-8 text-slate-500 hover:text-white transition-colors"><X size={24} /></button>
            <div className="mb-8 md:mb-12">
              <p className="micro-label text-primary mb-2">System Protocol</p>
              <h2 className="text-3xl md:text-4xl font-black tracking-tighter italic uppercase text-white leading-tight">Add Alumni Record</h2>
            </div>
            <form onSubmit={handleAdd} className="space-y-6 md:space-y-8">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Full Name</label>
                <input required placeholder="John Doe" className="w-full bg-slate-800/50 border border-slate-700 rounded-xl p-4 focus:border-primary/50 transition-all outline-none text-white placeholder:text-slate-600" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Email Address</label>
                <input required type="email" placeholder="john@alumni.com" className="w-full bg-slate-800/50 border border-slate-700 rounded-xl p-4 focus:border-primary/50 transition-all outline-none text-white placeholder:text-slate-600" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Department</label>
                  <select className="w-full bg-slate-800/50 border border-slate-700 rounded-xl p-4 focus:border-primary/50 transition-all outline-none text-white appearance-none" value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})}>
                    <option value="CSE" className="bg-slate-900">CSE</option>
                    <option value="ECE" className="bg-slate-900">ECE</option>
                    <option value="EEE" className="bg-slate-900">EEE</option>
                    <option value="MECH" className="bg-slate-900">MECH</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Year of Graduation</label>
                  <input 
                    required 
                    type="number" 
                    placeholder="2024" 
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-xl p-4 focus:border-primary/50 transition-all outline-none text-white placeholder:text-slate-600" 
                    value={formData.yearOfGraduation} 
                    onChange={e => setFormData({...formData, yearOfGraduation: e.target.value})} 
                  />
                </div>
              </div>
              <div className="space-y-4">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Alumni Photo</label>
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <div className="relative w-24 h-24 rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden flex items-center justify-center group shrink-0">
                    {formData.photo || formData.image_url ? (
                      <>
                        <img 
                          src={formData.photo || formData.image_url} 
                          alt="Preview" 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <button 
                          type="button"
                          onClick={() => setFormData({ ...formData, photo: '', image_url: '' })}
                          className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                        >
                          <X size={20} />
                        </button>
                      </>
                    ) : (
                      <GraduationCap size={32} className="text-slate-700" />
                    )}
                  </div>
                  <div className="flex-1 space-y-3 text-center sm:text-left w-full">
                    <input 
                      type="file"
                      id="alumni-photo"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                    <label 
                      htmlFor="alumni-photo"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-primary/10 text-primary rounded-xl text-xs font-bold cursor-pointer hover:bg-primary/20 transition-all border border-primary/20"
                    >
                      <Plus size={14} /> UPLOAD_IMAGE
                    </label>
                    <p className="text-[10px] text-slate-500 font-mono">JPG, PNG OR GIF. MAX 2MB.</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Or Avatar URL</label>
                <input 
                  placeholder="https://..."
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-xl p-4 focus:border-primary/50 transition-all outline-none text-white placeholder:text-slate-600"
                  value={formData.image_url}
                  onChange={e => setFormData({...formData, image_url: e.target.value})}
                />
              </div>
              <div className="flex gap-4 pt-8">
                <button type="submit" className="premium-btn w-full justify-center py-6 text-lg">SAVE_ALUMNI_RECORD</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {deleteConfirmation && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} 
            animate={{ opacity: 1, scale: 1 }} 
            className="bg-slate-900 p-12 rounded-[3rem] border border-slate-800 shadow-2xl w-full max-w-md text-center"
          >
            <div className="w-20 h-20 bg-red-500/10 rounded-3xl flex items-center justify-center mx-auto mb-8 text-red-500 border border-red-500/20">
              <Trash2 size={40} className={isDeleting ? 'animate-pulse' : ''} />
            </div>
            <h2 className="text-3xl font-black tracking-tighter uppercase italic mb-4 text-white">Confirm_Deletion</h2>
            <p className="text-slate-400 mb-10 font-medium leading-relaxed">
              {isDeleting ? 'Initializing deletion protocol...' : 'Are you sure you want to remove this alumni record from the database? This action is permanent and cannot be undone.'}
            </p>
            <div className="flex gap-4">
              <button 
                disabled={isDeleting}
                onClick={() => setDeleteConfirmation(null)}
                className="flex-1 px-8 py-4 rounded-2xl bg-slate-800 text-slate-300 font-black uppercase tracking-widest text-[10px] hover:bg-slate-700 transition-all border border-slate-700 disabled:opacity-50"
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

export default AlumniPage;

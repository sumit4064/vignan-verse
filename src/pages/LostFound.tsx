import React, { useState, useEffect } from 'react';
import { Search, Plus, CheckCircle2, X } from 'lucide-react';
import { dataService } from '../dataService';
import { LostFoundItem } from '../types';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

import { resizeImage } from '../lib/imageUtils';

const LostFound: React.FC = () => {
  const [items, setItems] = useState<LostFoundItem[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '', type: 'lost' as 'lost' | 'found', photo: '' });

  useEffect(() => {
    const unsubscribe = dataService.subscribeLostFound((data) => {
      setItems(data);
    });
    return () => unsubscribe();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const resized = await resizeImage(reader.result as string, 600, 600, 0.6);
        setFormData({ ...formData, photo: resized });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    await dataService.addLostFound({
      ...formData,
      status: formData.type === 'lost' ? 'Lost' : 'Found'
    });
    setShowAddModal(false);
    setFormData({ title: '', description: '', type: 'lost', photo: '' });
  };

  const handleResolve = async (id: string) => {
    await dataService.resolveLostFound(id);
  };

  return (
    <div className="space-y-8 md:space-y-12 py-4 md:py-8 px-4 md:px-6 max-w-[1600px] mx-auto">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 md:gap-8 border-b border-slate-800/50 pb-8">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="micro-label">Campus Support</div>
            <div className="h-px w-12 bg-slate-800"></div>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white tracking-tight">
            LOST & <span className="text-primary italic-serif lowercase">found items</span>
          </h2>
          <p className="text-slate-400 font-medium max-w-xl text-base md:text-lg">
            Helping the Vignan community recover lost belongings with a centralized reporting system.
          </p>
        </div>
        
        <button 
          onClick={() => setShowAddModal(true)} 
          className="premium-btn whitespace-nowrap w-full md:w-auto"
        >
          <Plus size={18} /> Report Item
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <section className="space-y-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center border border-red-500/20 shadow-sm">
              <Search size={24} />
            </div>
            <h3 className="text-2xl font-bold text-white tracking-tight">Lost Items</h3>
          </div>
          
          <div className="space-y-6">
            {items.filter(i => i.type === 'lost').map((item, index) => (
              <motion.div 
                key={item.id} 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="card group flex gap-6 p-6"
              >
                <div className="w-24 h-24 bg-slate-900 rounded-2xl flex items-center justify-center shrink-0 border border-slate-800 group-hover:border-red-500/30 transition-all overflow-hidden relative">
                  {item.photo ? (
                    <img 
                      src={item.photo} 
                      alt={item.title} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <Search size={32} className="text-red-500/20 group-hover:text-red-500 transition-colors" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0 space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="min-w-0">
                      <div className={`px-2 py-0.5 rounded text-[8px] font-bold tracking-wider w-fit mb-1 ${item.status === 'Resolved' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>{item.status.toUpperCase()}</div>
                      <h4 className="text-lg font-bold text-white group-hover:text-red-500 transition-colors truncate">{item.title}</h4>
                    </div>
                    {item.status !== 'Resolved' && (
                      <button 
                        onClick={() => handleResolve(item.id)}
                        className="p-2 text-slate-600 hover:text-emerald-500 hover:bg-emerald-500/10 rounded-lg transition-all"
                        title="Mark as Resolved"
                      >
                        <CheckCircle2 size={20} />
                      </button>
                    )}
                  </div>
                  <p className="text-sm text-slate-400 font-medium line-clamp-2">{item.description}</p>
                </div>
              </motion.div>
            ))}
            {items.filter(i => i.type === 'lost').length === 0 && (
              <div className="text-center py-20 bg-slate-900/50 rounded-3xl border border-dashed border-slate-800">
                <p className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">No lost items reported</p>
              </div>
            )}
          </div>
        </section>

        <section className="space-y-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20 shadow-sm">
              <CheckCircle2 size={24} />
            </div>
            <h3 className="text-2xl font-bold text-white tracking-tight">Found Items</h3>
          </div>
          
          <div className="space-y-6">
            {items.filter(i => i.type === 'found').map((item, index) => (
              <motion.div 
                key={item.id} 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="card group flex gap-6 p-6"
              >
                <div className="w-24 h-24 bg-slate-900 rounded-2xl flex items-center justify-center shrink-0 border border-slate-800 group-hover:border-primary/30 transition-all overflow-hidden relative">
                  {item.photo ? (
                    <img 
                      src={item.photo} 
                      alt={item.title} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <CheckCircle2 size={32} className="text-primary/20 group-hover:text-primary transition-colors" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0 space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="min-w-0">
                      <div className={`px-2 py-0.5 rounded text-[8px] font-bold tracking-wider w-fit mb-1 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20`}>{item.status.toUpperCase()}</div>
                      <h4 className="text-lg font-bold text-white group-hover:text-primary transition-colors truncate">{item.title}</h4>
                    </div>
                    {item.status !== 'Resolved' && (
                      <button 
                        onClick={() => handleResolve(item.id)}
                        className="p-2 text-slate-600 hover:text-emerald-500 hover:bg-emerald-500/10 rounded-lg transition-all"
                        title="Mark as Resolved"
                      >
                        <CheckCircle2 size={20} />
                      </button>
                    )}
                  </div>
                  <p className="text-sm text-slate-400 font-medium line-clamp-2">{item.description}</p>
                </div>
              </motion.div>
            ))}
            {items.filter(i => i.type === 'found').length === 0 && (
              <div className="text-center py-20 bg-slate-900/50 rounded-3xl border border-dashed border-slate-800">
                <p className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">No found items reported</p>
              </div>
            )}
          </div>
        </section>
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
              <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight italic uppercase leading-tight">Report Campus Item</h2>
            </div>
            <form onSubmit={handleAdd} className="space-y-5 md:space-y-6">
              <div className="space-y-1.5 md:space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 ml-1">Report Type</label>
                <select 
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-xl p-3 focus:border-primary/50 transition-all text-white outline-none appearance-none"
                  value={formData.type}
                  onChange={e => setFormData({...formData, type: e.target.value as 'lost' | 'found'})}
                >
                  <option value="lost" className="bg-slate-900">I Lost Something</option>
                  <option value="found" className="bg-slate-900">I Found Something</option>
                </select>
              </div>
              <div className="space-y-1.5 md:space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 ml-1">Item Name</label>
                <input required placeholder="e.g. Blue Backpack" className="w-full bg-slate-800/50 border border-slate-700 rounded-xl p-3 focus:border-primary/50 transition-all outline-none text-white placeholder:text-slate-600" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
              </div>
              <div className="space-y-1.5 md:space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 ml-1">Description & Location</label>
                <textarea required placeholder="e.g. Left in Library 2nd Floor near the windows..." className="w-full min-h-[100px] bg-slate-800/50 border border-slate-700 rounded-xl p-3 focus:border-primary/50 transition-all outline-none text-white placeholder:text-slate-600 resize-none" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 ml-1">Item Photo</label>
                <div className="flex flex-col sm:flex-row items-center gap-4 md:gap-6 p-4 bg-slate-800/30 border border-slate-800 rounded-2xl">
                  <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden flex items-center justify-center group shrink-0">
                    {formData.photo ? (
                      <>
                        <img 
                          src={formData.photo} 
                          alt="Preview" 
                          className="w-full h-full object-cover"
                        />
                        <button 
                          type="button"
                          onClick={() => setFormData({ ...formData, photo: '' })}
                          className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                        >
                          <X size={20} />
                        </button>
                      </>
                    ) : (
                      <Search className="text-slate-700 w-8 h-8 md:w-10 md:h-10" />
                    )}
                  </div>
                  <div className="flex-1 space-y-3 text-center sm:text-left w-full">
                    <input 
                      type="file"
                      id="item-photo"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                    <label 
                      htmlFor="item-photo"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 text-slate-300 rounded-lg text-[10px] font-bold tracking-wider uppercase cursor-pointer hover:bg-slate-700 transition-all border border-slate-700"
                    >
                      <Plus size={14} /> Upload Image
                    </label>
                    <p className="text-[10px] text-slate-500 font-medium">JPG, PNG or GIF. Max 2MB.</p>
                  </div>
                </div>
              </div>
              <div className="flex gap-4 pt-2 md:pt-4">
                <button type="submit" className="premium-btn w-full justify-center py-4 text-sm">Submit Report</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default LostFound;

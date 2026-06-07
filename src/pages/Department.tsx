import React, { useState, useEffect } from 'react';
import { Bell, Calendar, Plus, Trash2, X, BookOpen, Award, User, Mail, ChevronRight } from 'lucide-react';
import { dataService } from '../dataService';
import { Notice, DepartmentDetail } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface DepartmentPageProps {
  currentRole: string;
}

const Department: React.FC<DepartmentPageProps> = ({ currentRole }) => {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [departments, setDepartments] = useState<DepartmentDetail[]>([]);
  const [selectedDept, setSelectedDept] = useState<DepartmentDetail | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAddDeptModal, setShowAddDeptModal] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState<string | null>(null);
  const [deptDeleteConfirmation, setDeptDeleteConfirmation] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
  const [formData, setFormData] = useState({ title: '', content: '', department: 'CSE' });

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);
  const [deptFormData, setDeptFormData] = useState({ 
    name: '', 
    fullName: '', 
    description: '', 
    hod: '', 
    courses: '', 
    achievements: '', 
    contact: '',
    image_url: ''
  });

  useEffect(() => {
    const unsubscribeNotices = dataService.subscribeNotices((data) => {
      setNotices(data);
    });
    const unsubscribeDepts = dataService.subscribeDepartments((data) => {
      setDepartments(data);
    });
    return () => {
      unsubscribeNotices();
      unsubscribeDepts();
    };
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    await dataService.addNotice(formData);
    setShowAddModal(false);
    setFormData({ title: '', content: '', department: 'CSE' });
  };

  const handleAddDept = async (e: React.FormEvent) => {
    e.preventDefault();
    const deptData = {
      ...deptFormData,
      courses: deptFormData.courses.split(',').map(c => c.trim()).filter(c => c !== ''),
      achievements: deptFormData.achievements.split(',').map(a => a.trim()).filter(a => a !== '')
    };
    await dataService.addDepartment(deptData);
    setShowAddDeptModal(false);
    setDeptFormData({ name: '', fullName: '', description: '', hod: '', courses: '', achievements: '', contact: '', image_url: '' });
  };

  const handleDelete = async () => {
    if (deleteConfirmation) {
      console.log(`[DEBUG] Attempting to delete notice with ID: ${deleteConfirmation}`);
      setIsDeleting(true);
      try {
        await dataService.deleteNotice(deleteConfirmation);
        console.log(`[DEBUG] Successfully deleted notice with ID: ${deleteConfirmation}`);
        setToast({ message: 'NOTICE_DELETED_SUCCESSFULLY', type: 'success' });
        setDeleteConfirmation(null);
      } catch (error) {
        console.error(`[DEBUG] Failed to delete notice with ID: ${deleteConfirmation}`, error);
        setToast({ message: 'ERROR_DELETING_NOTICE', type: 'error' });
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleDeleteDept = async () => {
    if (deptDeleteConfirmation) {
      console.log(`[DEBUG] Attempting to delete department with ID: ${deptDeleteConfirmation}`);
      setIsDeleting(true);
      try {
        await dataService.deleteDepartment(deptDeleteConfirmation);
        console.log(`[DEBUG] Successfully deleted department with ID: ${deptDeleteConfirmation}`);
        setToast({ message: 'DEPARTMENT_DELETED_SUCCESSFULLY', type: 'success' });
        setDeptDeleteConfirmation(null);
        setSelectedDept(null);
      } catch (error) {
        console.error(`[DEBUG] Failed to delete department with ID: ${deptDeleteConfirmation}`, error);
        setToast({ message: 'ERROR_DELETING_DEPARTMENT', type: 'error' });
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
            <div className="micro-label">Academic Hub</div>
            <div className="h-px w-12 bg-slate-800"></div>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white tracking-tight">
            DEPARTMENTS <span className="text-primary italic-serif lowercase">& notices</span>
          </h2>
          <p className="text-slate-400 font-medium max-w-xl text-base md:text-lg">
            Explore our academic excellence and stay updated with official news.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
          {currentRole === 'Admin' && (
            <>
              <button 
                onClick={() => setShowAddDeptModal(true)} 
                className="premium-btn-outline whitespace-nowrap w-full sm:w-auto"
              >
                <Plus size={18} /> Add Dept
              </button>
              <button 
                onClick={() => setShowAddModal(true)} 
                className="premium-btn whitespace-nowrap w-full sm:w-auto"
              >
                <Plus size={18} /> Post Notice
              </button>
            </>
          )}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-10">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-sm">
              <BookOpen size={32} />
            </div>
            <h3 className="text-3xl font-black tracking-tight text-white uppercase">Departments</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {departments.map((dept, index) => (
              <motion.div 
                key={dept.id} 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => setSelectedDept(dept)}
                className="card group p-0 overflow-hidden cursor-pointer border-slate-800 hover:border-primary/30 transition-all"
              >
                <div className="relative h-64 bg-slate-900 flex items-center justify-center overflow-hidden">
                  <img 
                    src={dept.image_url || `https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&q=80&w=800&seed=${dept.name}`} 
                    alt={dept.name}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent" />
                  <div className="relative z-10 text-center space-y-2 p-6 mt-auto">
                    <h4 className="text-4xl font-black tracking-tight uppercase italic text-white group-hover:text-primary transition-colors leading-none">{dept.name}</h4>
                    <p className="text-[10px] font-bold text-white/70 uppercase tracking-widest">{dept.fullName}</p>
                  </div>
                </div>
                <div className="p-6 flex justify-between items-center bg-slate-900">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-500 group-hover:text-primary transition-colors">
                      <User size={18} />
                    </div>
                    <div className="space-y-0.5">
                      <p className="micro-label opacity-40">HOD</p>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{dept.hod}</p>
                    </div>
                  </div>
                  <ChevronRight size={24} className="text-slate-700 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="space-y-10">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20 shadow-sm">
              <Bell size={32} />
            </div>
            <h3 className="text-3xl font-black tracking-tight text-white uppercase">Notices</h3>
          </div>
          
          <div className="space-y-6">
            {notices.map((notice, index) => (
              <motion.div 
                key={notice.id} 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="card group p-6 border-l-4 border-l-emerald-500/20 hover:border-l-emerald-500 transition-all bg-slate-900 border border-slate-800"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="px-3 py-1 rounded-lg text-[8px] font-bold tracking-wider w-fit bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">{notice.department}</div>
                  {currentRole === 'Admin' && (
                    <button 
                      onClick={() => setDeleteConfirmation(notice.id)}
                      className="p-2 text-slate-600 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
                <h4 className="text-xl font-bold text-white tracking-tight uppercase italic mb-4 group-hover:text-emerald-500 transition-colors leading-tight">{notice.title}</h4>
                <p className="text-slate-400 font-medium leading-relaxed mb-6 line-clamp-3 text-sm">{notice.content}</p>
                <div className="flex items-center gap-3 text-slate-500">
                  <Calendar size={14} className="text-emerald-500" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">{notice.date}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>


      {/* Department Detail Modal */}
      <AnimatePresence>
        {selectedDept && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 p-6 md:p-10 rounded-[2rem] md:rounded-[2.5rem] border border-slate-800 shadow-2xl w-full max-w-4xl relative my-auto"
            >
              <button 
                onClick={() => setSelectedDept(null)}
                className="absolute top-6 md:top-8 right-6 md:right-8 text-slate-500 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 md:gap-12">
                <div className="lg:col-span-2 space-y-8 md:space-y-10">
                  <div className="space-y-4 md:space-y-6">
                    <div className="px-4 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20 font-bold tracking-wider text-[10px] uppercase w-fit">{selectedDept.name} Department</div>
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight leading-none uppercase italic text-white">{selectedDept.fullName}</h2>
                    <p className="text-base md:text-lg text-slate-400 font-medium leading-relaxed">{selectedDept.description}</p>
                  </div>
 
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                    <div className="space-y-6 p-6 md:p-8 rounded-3xl bg-slate-800/50 border border-slate-700">
                      <h4 className="text-[10px] font-bold uppercase tracking-wider text-primary">Offered Courses</h4>
                      <ul className="space-y-3">
                        {selectedDept.courses.map((course, i) => (
                          <li key={i} className="flex items-center gap-3 text-slate-300 font-medium text-sm">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary shadow-sm" />
                            {course}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="space-y-6 p-6 md:p-8 rounded-3xl bg-slate-800/50 border border-slate-700">
                      <h4 className="text-[10px] font-bold uppercase tracking-wider text-secondary">Achievements</h4>
                      <ul className="space-y-3">
                        {selectedDept.achievements.map((ach, i) => (
                          <li key={i} className="flex items-center gap-3 text-slate-300 font-medium text-sm">
                            <Award size={16} className="text-secondary shrink-0" />
                            {ach}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
 
                <div className="space-y-6 md:space-y-8 bg-slate-800/50 p-6 md:p-8 rounded-[32px] border border-slate-700 h-fit">
                  <div className="space-y-4 md:space-y-6">
                    <h4 className="micro-label opacity-40">Head of Department</h4>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                        <User size={28} />
                      </div>
                      <div>
                        <div className="font-bold italic uppercase tracking-tight text-base md:text-lg text-white leading-tight">{selectedDept.hod}</div>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-primary/60">Professor & HOD</div>
                      </div>
                    </div>
                  </div>
 
                  <div className="space-y-4 pt-6 border-t border-slate-700">
                    <h4 className="micro-label opacity-40">Contact Info</h4>
                    <div className="flex items-center gap-3 text-slate-300">
                      <Mail size={18} className="text-secondary" />
                      <span className="text-sm font-bold truncate">{selectedDept.contact}</span>
                    </div>
                  </div>
 
                  <button 
                    onClick={() => {/* alert removed */}}
                    className="premium-btn w-full justify-center py-4 mt-2 md:mt-4"
                  >
                    Initialize Portal
                  </button>
                  
                  {currentRole === 'Admin' && (
                    <button 
                      onClick={() => setDeptDeleteConfirmation(selectedDept.id)}
                      className="w-full py-3 rounded-xl bg-red-500/10 text-red-500 text-[10px] font-bold uppercase tracking-wider border border-red-500/20 hover:bg-red-500 hover:text-white transition-all mt-4"
                    >
                      Terminate Dept
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Notice Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }} 
            className="bg-slate-900 p-8 md:p-10 rounded-[2rem] md:rounded-[2.5rem] border border-slate-800 shadow-2xl w-full max-w-2xl relative my-auto"
          >
            <button onClick={() => setShowAddModal(false)} className="absolute top-6 md:top-8 right-6 md:right-8 text-slate-500 hover:text-white transition-colors"><X size={24} /></button>
            <div className="mb-6 md:mb-10">
              <div className="micro-label mb-1 text-primary">System Protocol</div>
              <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight italic uppercase leading-tight">Post Notice</h2>
            </div>
            <form onSubmit={handleAdd} className="space-y-5 md:space-y-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 ml-1">Notice Title</label>
                <input required placeholder="e.g. Mid-Term Exam Schedule" className="w-full bg-slate-800/50 border border-slate-700 rounded-xl p-3 focus:border-primary/50 transition-all outline-none text-white placeholder:text-slate-600" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 ml-1">Department</label>
                <select className="w-full bg-slate-800/50 border border-slate-700 rounded-xl p-3 focus:border-primary/50 transition-all outline-none text-white appearance-none" value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})}>
                  <option value="CSE" className="bg-slate-900">CSE</option>
                  <option value="ECE" className="bg-slate-900">ECE</option>
                  <option value="EEE" className="bg-slate-900">EEE</option>
                  <option value="MECH" className="bg-slate-900">MECH</option>
                  <option value="ALL" className="bg-slate-900">ALL DEPARTMENTS</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 ml-1">Content</label>
                <textarea required placeholder="Write the notice content here..." className="w-full min-h-[120px] bg-slate-800/50 border border-slate-700 rounded-xl p-3 focus:border-primary/50 transition-all outline-none text-white placeholder:text-slate-600 resize-none" value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} />
              </div>
              <div className="flex gap-4 pt-2 md:pt-4">
                <button type="submit" className="premium-btn w-full justify-center py-4 text-sm">Post Notice</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Add Dept Modal */}
      {showAddDeptModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }} 
            className="bg-slate-900 p-8 md:p-10 rounded-[2rem] md:rounded-[2.5rem] border border-slate-800 shadow-2xl w-full max-w-2xl relative my-auto"
          >
            <button onClick={() => setShowAddDeptModal(false)} className="absolute top-6 md:top-8 right-6 md:right-8 text-slate-500 hover:text-white transition-colors"><X size={24} /></button>
            <div className="mb-6 md:mb-10">
              <div className="micro-label mb-1 text-primary">System Protocol</div>
              <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight italic uppercase leading-tight">Add Department</h2>
            </div>
            <form onSubmit={handleAddDept} className="space-y-5 md:space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 ml-1">Short Name</label>
                  <input required placeholder="e.g. CSE" className="w-full bg-slate-800/50 border border-slate-700 rounded-xl p-3 focus:border-primary/50 transition-all outline-none text-white placeholder:text-slate-600" value={deptFormData.name} onChange={e => setDeptFormData({...deptFormData, name: e.target.value})} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 ml-1">Full Name</label>
                  <input required placeholder="e.g. Computer Science" className="w-full bg-slate-800/50 border border-slate-700 rounded-xl p-3 focus:border-primary/50 transition-all outline-none text-white placeholder:text-slate-600" value={deptFormData.fullName} onChange={e => setDeptFormData({...deptFormData, fullName: e.target.value})} />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 ml-1">Description</label>
                <textarea required placeholder="Department description..." className="w-full min-h-[80px] bg-slate-800/50 border border-slate-700 rounded-xl p-3 focus:border-primary/50 transition-all outline-none text-white placeholder:text-slate-600 resize-none" value={deptFormData.description} onChange={e => setDeptFormData({...deptFormData, description: e.target.value})} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 ml-1">HOD Name</label>
                  <input required placeholder="Dr. Name" className="w-full bg-slate-800/50 border border-slate-700 rounded-xl p-3 focus:border-primary/50 transition-all outline-none text-white placeholder:text-slate-600" value={deptFormData.hod} onChange={e => setDeptFormData({...deptFormData, hod: e.target.value})} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 ml-1">Contact Email</label>
                  <input required type="email" placeholder="hod@vignan.ac.in" className="w-full bg-slate-800/50 border border-slate-700 rounded-xl p-3 focus:border-primary/50 transition-all outline-none text-white placeholder:text-slate-600" value={deptFormData.contact} onChange={e => setDeptFormData({...deptFormData, contact: e.target.value})} />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 ml-1">Courses (comma separated)</label>
                <input required placeholder="B.Tech, M.Tech" className="w-full bg-slate-800/50 border border-slate-700 rounded-xl p-3 focus:border-primary/50 transition-all outline-none text-white placeholder:text-slate-600" value={deptFormData.courses} onChange={e => setDeptFormData({...deptFormData, courses: e.target.value})} />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 ml-1">Achievements (comma separated)</label>
                <input required placeholder="Best Dept 2024, Top Placements" className="w-full bg-slate-800/50 border border-slate-700 rounded-xl p-3 focus:border-primary/50 transition-all outline-none text-white placeholder:text-slate-600" value={deptFormData.achievements} onChange={e => setDeptFormData({...deptFormData, achievements: e.target.value})} />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 ml-1">Image URL</label>
                <input placeholder="https://..." className="w-full bg-slate-800/50 border border-slate-700 rounded-xl p-3 focus:border-primary/50 transition-all outline-none text-white placeholder:text-slate-600" value={deptFormData.image_url} onChange={e => setDeptFormData({...deptFormData, image_url: e.target.value})} />
              </div>
              <div className="flex gap-4 pt-2 md:pt-4">
                <button type="submit" className="premium-btn w-full justify-center py-4 text-sm">Initialize Department</button>
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
            className="bg-slate-900 p-10 rounded-3xl border border-slate-800 shadow-2xl w-full max-w-md text-center"
          >
            <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 text-red-500 border border-red-500/20">
              <Trash2 size={32} className={isDeleting ? 'animate-pulse' : ''} />
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight uppercase italic mb-2">Confirm Deletion</h2>
            <p className="text-sm text-slate-400 mb-8 font-medium leading-relaxed">
              {isDeleting ? 'Initializing deletion protocol...' : 'Are you sure you want to remove this notice from the database? This action is permanent and cannot be undone.'}
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
      {deptDeleteConfirmation && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }} 
            className="bg-slate-900 p-10 rounded-3xl border border-slate-800 shadow-2xl w-full max-w-md text-center"
          >
            <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 text-red-500 border border-red-500/20">
              <Trash2 size={32} className={isDeleting ? 'animate-pulse' : ''} />
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight uppercase italic mb-2">Delete Department</h2>
            <p className="text-sm text-slate-400 mb-8 font-medium leading-relaxed">
              {isDeleting ? 'Processing termination protocol...' : 'Are you sure you want to remove this department? This will permanently delete all associated data.'}
            </p>
            <div className="flex gap-4">
              <button 
                disabled={isDeleting}
                onClick={() => setDeptDeleteConfirmation(null)}
                className="flex-1 px-6 py-3 rounded-xl bg-slate-800 text-slate-300 font-bold uppercase tracking-wider text-[10px] hover:bg-slate-700 transition-all border border-slate-700 disabled:opacity-50"
              >
                Cancel
              </button>
              <button 
                disabled={isDeleting}
                onClick={handleDeleteDept}
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

export default Department;

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  GraduationCap, 
  Library, 
  PartyPopper, 
  ArrowUpRight, 
  Zap, 
  Trophy, 
  Search, 
  Activity, 
  Globe, 
  ShieldCheck, 
  Cpu, 
  Building2, 
  Database, 
  LayoutGrid, 
  BookOpen, 
  Calendar, 
  Laptop,
  Megaphone,
  Bell,
  Trash2,
  Plus,
  Volume2,
  Sparkles,
  X,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { dataService } from '../dataService';
import { cn } from '../lib/utils';
import { AppNotification } from '../types';

interface DashboardProps {
  currentRole: string;
}

const Dashboard: React.FC<DashboardProps> = ({ currentRole }) => {
  const [stats, setStats] = useState({ students: 0, alumni: 0, books: 0, clubs: 0 });
  const [liveActivity, setLiveActivity] = useState<any[]>([]);

  // Floating Broadcast notifications states
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [currentNotifIndex, setCurrentNotifIndex] = useState(0);
  const [isWidgetExpanded, setIsWidgetExpanded] = useState(false);
  
  // Admin posting form states direct on home screen
  const [newNotifTitle, setNewNotifTitle] = useState('');
  const [newNotifType, setNewNotifType] = useState('Technical');
  const [newNotifPath, setNewNotifPath] = useState('/technical');
  const [isPostingNotif, setIsPostingNotif] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    const unsubStudents = dataService.subscribeStudents((data) => {
      setStats(prev => ({ ...prev, students: data.length }));
    });
    const unsubAlumni = dataService.subscribeAlumni((data) => {
      setStats(prev => ({ ...prev, alumni: data.length }));
    });
    const unsubBooks = dataService.subscribeLibraryBooks((data) => {
      setStats(prev => ({ ...prev, books: data.length }));
    });
    const unsubClubs = dataService.subscribeClubs((data) => {
      setStats(prev => ({ ...prev, clubs: data.length }));
    });
    
    // Subscribe to dynamic notifications
    const unsubNotifications = dataService.subscribeNotifications((data) => {
      setNotifications(data);
    });
    
    setLiveActivity(dataService.getLiveActivity());

    return () => {
      unsubStudents();
      unsubAlumni();
      unsubBooks();
      unsubClubs();
      unsubNotifications();
    };
  }, []);

  // Notifications Auto-Rotation timer
  useEffect(() => {
    if (notifications.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentNotifIndex(prev => (prev + 1) % notifications.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [notifications.length]);

  const handlePostNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNotifTitle.trim()) return;
    setIsPostingNotif(true);
    try {
      await dataService.addNotification({
        title: newNotifTitle.trim(),
        type: newNotifType,
        path: newNotifPath
      });
      setNewNotifTitle('');
      setShowAddForm(false);
    } catch (err) {
      console.error("Failed to post notification inside Home (Dashboard):", err);
    } finally {
      setIsPostingNotif(false);
    }
  };

  const handleDeleteNotif = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this notification?")) {
      try {
        await dataService.deleteNotification(id);
        if (currentNotifIndex >= notifications.length - 1) {
          setCurrentNotifIndex(0);
        }
      } catch (err) {
        console.error("Failed to delete notification inside Home (Dashboard):", err);
      }
    }
  };

  const getRelativeTime = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    if (diff < 60000) return 'Just now';
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const typePresets = [
    { type: 'Technical', path: '/technical' },
    { type: 'Library', path: '/library' },
    { type: 'Fest', path: '/fest' },
    { type: 'Lost & Found', path: '/lostfound' },
    { type: 'SAC Clubs', path: '/clubs' },
    { type: 'Academic', path: '/department' },
    { type: 'General', path: '/' }
  ];

  const handleTypeChange = (type: string) => {
    setNewNotifType(type);
    const preset = typePresets.find(p => p.type === type);
    if (preset) {
      setNewNotifPath(preset.path);
    }
  };

  return (
    <div className={cn(
      "relative space-y-12 md:space-y-24 pb-32 px-4 md:px-6 max-w-[1600px] mx-auto overflow-hidden transition-all duration-300",
      notifications.length > 0 ? "pt-14 sm:pt-16" : "pt-8 md:pt-12"
    )}>
      {/* Dynamic Absolutely-Positioned Notification Title Pill */}
      <AnimatePresence mode="wait">
        {notifications.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10, x: "-50%" }}
            animate={{ opacity: 1, y: 12, x: "-50%" }}
            exit={{ opacity: 0, y: -10, x: "-50%" }}
            transition={{ type: "spring", stiffness: 220, damping: 22 }}
            className="absolute top-1 left-1/2 -translate-x-1/2 z-50 w-full max-w-xl px-4 pointer-events-none text-center"
          >
            <Link 
              to={notifications[currentNotifIndex]?.path || '#'}
              className="pointer-events-auto inline-flex items-center justify-center gap-2.5 px-4 py-1.5 bg-transparent text-slate-300 hover:text-white transition-all cursor-pointer group"
            >
              <span className="flex h-1.5 w-1.5 relative shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary"></span>
              </span>
              
              <span className="text-[10px] font-black uppercase tracking-widest text-primary shrink-0">
                {notifications[currentNotifIndex]?.type || 'ALERT'}
              </span>

              <span className="text-zinc-600 font-normal">|</span>
              
              <p className="text-xs font-bold italic tracking-wide truncate max-w-[280px] sm:max-w-md text-zinc-100 group-hover:text-primary transition-colors group-hover:underline decoration-primary/40 underline-offset-4">
                {notifications[currentNotifIndex]?.title}
              </p>

              <ChevronRight size={12} className="text-zinc-500 group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0" />
            </Link>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Expandable Broadcast Widget (Interactive HUD) */}
      <div className="fixed bottom-4 right-4 left-4 sm:left-auto sm:bottom-6 sm:right-6 z-[160] max-w-[calc(100vw-2rem)] sm:max-w-md">
        <AnimatePresence>
          {!isWidgetExpanded ? (
            /* Collapsed Floating Launcher Pill */
            <motion.button
              layoutId="floating-widget"
              onClick={() => setIsWidgetExpanded(true)}
              className="px-5 py-4 rounded-[2rem] bg-slate-900 border border-primary/40 text-white shadow-[0_15px_40px_-5px_rgba(99,102,241,0.4)] flex items-center gap-3 hover:border-primary/80 hover:bg-slate-850 cursor-pointer group shrink-0 ml-auto"
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              <div className="relative shrink-0">
                <Bell size={20} className="text-primary group-hover:animate-bounce" />
                {notifications.length > 0 && (
                  <span className="absolute -top-2.5 -right-2.5 bg-primary text-white text-[9px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-slate-900 animate-pulse">
                    {notifications.length}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-300 hidden md:block">
                Broadcast Deck
              </span>
            </motion.button>
          ) : (
            /* Expanded Floating HUD Desk */
            <motion.div
              layoutId="floating-widget"
              className="w-full sm:w-96 rounded-[24px] sm:rounded-[30px] bg-slate-950/95 backdrop-blur-2xl border border-slate-800 shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col relative text-left"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 26 }}
            >
              {/* Header */}
              <div className="p-5 border-b border-slate-800 bg-slate-900/30 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
                    <Sparkles size={16} className="animate-spin" style={{ animationDuration: '6s' }} />
                  </div>
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-100">Universe Radio</h3>
                    <p className="text-[9px] font-bold text-orange-400 uppercase tracking-widest flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" /> Live alerts
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {currentRole === 'Admin' && (
                    <button
                      onClick={() => setShowAddForm(!showAddForm)}
                      className={cn(
                        "w-7 h-7 rounded-lg border flex items-center justify-center transition-all cursor-pointer",
                        showAddForm 
                          ? "bg-primary border-primary text-white" 
                          : "bg-slate-900/80 border-slate-800 text-slate-400 hover:text-white"
                      )}
                      title="Post new Broadcast"
                    >
                      <Plus size={14} />
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setIsWidgetExpanded(false);
                      setShowAddForm(false);
                    }}
                    className="w-7 h-7 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-500 hover:text-white flex items-center justify-center transition-all cursor-pointer"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>

              {/* Admin quick Form inside widget */}
              <AnimatePresence>
                {currentRole === 'Admin' && showAddForm && (
                  <motion.form
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    onSubmit={handlePostNotification}
                    className="p-5 border-b border-slate-800/80 bg-slate-900/30 space-y-3.5 overflow-hidden text-left"
                  >
                    <div>
                      <label className="block text-[8px] font-bold uppercase tracking-widest text-slate-500 mb-1">Message Content</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Dynamic internship registration initialized"
                        value={newNotifTitle}
                        onChange={(e) => setNewNotifTitle(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-[11px] text-slate-200 focus:border-primary/50 outline-none transition-all placeholder:text-slate-600 font-semibold"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[8px] font-bold uppercase tracking-widest text-slate-500 mb-1">Channel</label>
                        <select 
                          value={newNotifType}
                          onChange={(e) => handleTypeChange(e.target.value)}
                          className="w-full px-2 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-[10px] text-slate-300 focus:border-primary/50 outline-none font-bold"
                        >
                          {typePresets.map(preset => (
                            <option key={preset.type} value={preset.type}>{preset.type}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[8px] font-bold uppercase tracking-widest text-slate-500 mb-1">Module Destination</label>
                        <input 
                          type="text" 
                          value={newNotifPath}
                          onChange={(e) => setNewNotifPath(e.target.value)}
                          className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-[10px] text-slate-500 focus:border-primary/50 font-mono outline-none"
                          required
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      disabled={isPostingNotif}
                      className="premium-btn w-full justify-center py-2 text-[9px] font-black uppercase tracking-widest cursor-pointer"
                    >
                      {isPostingNotif ? 'Dispatching...' : 'Dispatch Broadcast'}
                    </button>
                  </motion.form>
                )}
              </AnimatePresence>

              {/* Announcements Feed Area */}
              <div className="p-4 max-h-72 overflow-y-auto space-y-3 scrollbar-none text-left">
                {notifications.length === 0 ? (
                  <div className="text-center py-8 bg-slate-900/10 border border-dashed border-slate-800/80 rounded-2xl">
                    <Bell className="mx-auto text-slate-700 animate-pulse mb-2.5" size={24} />
                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Sky is clear. No alerts</p>
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className="p-3.5 bg-slate-900/40 hover:bg-slate-900/90 rounded-2xl border border-slate-800/60 flex items-start gap-3 relative group transition-colors"
                    >
                      <Link 
                        to={notif.path}
                        className="flex-1 pr-1 cursor-pointer"
                      >
                        <p className="text-xs font-black italic text-slate-300 hover:text-white transition-colors line-clamp-2 leading-tight">
                          {notif.title}
                        </p>
                        <div className="flex items-center gap-1.5 mt-2">
                          <span className="text-[7.5px] font-black bg-slate-950/70 text-primary border border-primary/20 px-1.5 py-0.2 rounded uppercase tracking-wider">
                            {notif.type}
                          </span>
                          <span className="text-[8.5px] font-bold text-slate-500 uppercase">
                            {getRelativeTime(notif.createdAt)}
                          </span>
                        </div>
                      </Link>

                      {currentRole === 'Admin' && (
                        <button
                          onClick={(e) => handleDeleteNotif(notif.id, e)}
                          className="bg-red-500/10 hover:bg-red-500/20 p-2 rounded-lg border border-red-500/20 text-red-400 hover:text-red-300 transition-all opacity-100 sm:opacity-0 group-hover:opacity-100 shrink-0 cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 size={11} />
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {/* Modern Hero Section */}
      <section className="relative min-h-[60vh] lg:min-h-[70vh] flex flex-col lg:flex-row items-center gap-10 lg:gap-16 overflow-hidden rounded-3xl sm:rounded-[2.5rem] md:rounded-[4rem] bg-slate-900/40 border border-slate-800/50 p-5 sm:p-8 md:p-12 lg:p-24 shadow-2xl backdrop-blur-xl">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[140px] -z-10 translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-secondary/10 rounded-full blur-[120px] -z-10 -translate-x-1/3 translate-y-1/3" />
        
        <div className="relative z-10 flex-1 space-y-8 sm:space-y-12 text-left">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="inline-flex items-center gap-4 px-4 py-1.5 rounded-full bg-slate-800/50 border border-slate-700 shadow-sm"
          >
            <div className="flex -space-x-1.5">
              {[1, 2, 3].map(i => (
                <div key={i} className="w-5 h-5 rounded-full border border-slate-900 bg-slate-800 overflow-hidden">
                  <img src={`https://picsum.photos/seed/user${i}/100/100`} alt="User" referrerPolicy="no-referrer" />
                </div>
              ))}
            </div>
            <span className="text-[9px] sm:text-[10px] font-bold tracking-wider text-slate-400 uppercase">Trusted by 5,000+ Students</span>
          </motion.div>

          <div className="space-y-4 md:space-y-8">
            <h2 className="text-3xl sm:text-5xl md:text-6xl lg:text-massive text-white tracking-tighter leading-[0.95] sm:leading-[0.9] lg:leading-[0.85] font-black">
              VIGNAN <br className="hidden md:block" />
              <span className="text-primary italic-serif lowercase md:ml-0">universe</span>
            </h2>
            <p className="text-slate-400 font-medium max-w-xl text-sm sm:text-lg md:text-2xl leading-relaxed">
              The next-generation campus management ecosystem. Seamlessly integrated, beautifully designed, and built for the future of education.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 md:gap-8 pt-2 md:pt-6">
            <button className="premium-btn px-6 sm:px-8 md:px-12 py-3.5 sm:py-4 md:py-5 text-xs sm:text-sm md:text-base rounded-xl sm:rounded-2xl shadow-[0_20px_40px_-10px_rgba(99,102,241,0.4)] w-full sm:w-auto">
              Explore Modules <ArrowUpRight size={18} />
            </button>
            <button className="px-6 sm:px-8 md:px-10 py-3.5 sm:py-4 md:py-5 rounded-xl sm:rounded-2xl border-2 border-slate-800 hover:border-primary hover:bg-slate-800/50 transition-all text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-primary w-full sm:w-auto text-center">
              System Docs
            </button>
          </div>
        </div>

        <div className="relative flex-1 w-full flex items-center justify-center py-6 lg:py-0">
          <div className="relative w-48 h-48 sm:w-64 sm:h-64 md:w-80 md:h-80 lg:w-[500px] lg:h-[500px]">
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 rounded-full border-[1.5px] md:border-[3px] border-dashed border-slate-100/30"
            />
            <motion.div 
              animate={{ rotate: -360 }}
              transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
              className="absolute inset-6 sm:inset-8 md:inset-12 rounded-full border border-slate-200/20"
            />
            
            <div className="absolute inset-12 sm:inset-16 md:inset-20 rounded-full bg-gradient-to-br from-slate-900 to-slate-950 shadow-inner flex items-center justify-center border border-slate-800">
              <div className="w-16 h-16 sm:w-24 sm:h-24 md:w-40 md:h-40 lg:w-64 lg:h-64 rounded-xl sm:rounded-[2rem] md:rounded-[3rem] bg-slate-900 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)] flex items-center justify-center border border-slate-800 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <Building2 className="text-primary relative z-10 w-8 h-8 sm:w-12 sm:h-12 md:w-20 md:h-20" />
              </div>
            </div>
            
            {/* Floating Icons with enhanced styling */}
            {[
              { icon: Users, top: '5%', left: '15%', color: 'text-blue-400', bg: 'bg-blue-500/10' },
              { icon: GraduationCap, top: '10%', right: '10%', color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
              { icon: BookOpen, bottom: '15%', left: '10%', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
              { icon: Calendar, bottom: '5%', right: '20%', color: 'text-orange-400', bg: 'bg-orange-500/10' }
            ].map((item, i) => (
              <motion.div
                key={i}
                animate={{ 
                  y: [0, -12, 0],
                  rotate: [0, 5, 0]
                }}
                transition={{ duration: 5 + i, repeat: Infinity, delay: i * 0.7 }}
                className={cn("absolute w-8 h-8 sm:w-12 sm:h-12 md:w-16 md:h-16 rounded-lg sm:rounded-xl md:rounded-2xl bg-slate-900/80 backdrop-blur-md shadow-2xl border border-slate-800 flex items-center justify-center", item.bg)}
                style={{ top: item.top, left: item.left, right: item.right, bottom: item.bottom }}
              >
                <item.icon className={cn(item.color, "w-5 h-5 md:w-7 md:h-7")} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
        {[
          { label: 'Active Students', value: stats.students, icon: Users, color: 'bg-blue-500/10 text-blue-400' },
          { label: 'Library Books', value: stats.books, icon: BookOpen, color: 'bg-emerald-500/10 text-emerald-400' },
          { label: 'System Uptime', value: '99.9%', icon: Activity, color: 'bg-indigo-500/10 text-indigo-400' },
          { label: 'Student Clubs', value: stats.clubs, icon: Globe, color: 'bg-orange-500/10 text-orange-400' }
        ].map((stat, i) => (
          <div key={i} className="card flex flex-col gap-3 md:gap-4 p-6 md:p-8">
            <div className={cn("w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center", stat.color)}>
              <stat.icon size={20} className="md:w-6 md:h-6" />
            </div>
            <div>
              <p className="text-[10px] md:text-[11px] font-bold uppercase tracking-wider text-slate-500">{stat.label}</p>
              <p className="text-2xl md:text-3xl font-bold text-white">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>
      
      {/* Bento Grid */}
      <div className="space-y-10">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-3xl font-bold text-white tracking-tight">University Modules</h3>
            <p className="text-sm text-slate-400 font-medium">Access all campus management protocols</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-slate-900/50 border border-slate-800 flex items-center justify-center text-slate-500">
            <LayoutGrid size={20} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          <Link to="/students" className="md:col-span-2 md:row-span-2">
            <motion.div 
              whileHover={{ y: -8 }}
              className="card group h-full flex flex-col justify-between bg-gradient-to-br from-primary/10 to-slate-900/40 border-primary/20 p-8 md:p-12"
            >
              <div className="space-y-6 md:space-y-10">
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-slate-900 shadow-xl border border-slate-800 flex items-center justify-center text-primary">
                  <Users size={32} className="md:w-10 md:h-10" />
                </div>
                <div className="space-y-3 md:space-y-4">
                  <h4 className="text-2xl md:text-4xl font-bold text-white group-hover:text-primary transition-colors tracking-tight">STUDENT_DB</h4>
                  <p className="text-slate-400 font-medium leading-relaxed text-base md:text-lg max-w-md">Comprehensive access to student profiles, academic history, and performance metrics.</p>
                </div>
              </div>
              <div className="pt-6 md:pt-10 flex items-center justify-between border-t border-slate-800 mt-6 md:mt-10">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Initialize Access</span>
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-slate-800 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all duration-300">
                  <ArrowUpRight size={18} className="md:w-5 md:h-5" />
                </div>
              </div>
            </motion.div>
          </Link>

          {[
            { title: 'Alumni Network', desc: 'Connect with successful graduates.', icon: GraduationCap, color: 'text-indigo-400', path: '/alumni' },
            { title: 'Event Horizon', desc: 'University fests & workshops.', icon: Calendar, color: 'text-orange-400', path: '/fest' },
            { title: 'Resource Hub', desc: 'Digital library management.', icon: BookOpen, color: 'text-emerald-400', path: '/library' },
            { title: 'Tech Protocols', desc: 'Hackathons & internships.', icon: Laptop, color: 'text-blue-400', path: '/technical' }
          ].map((item, i) => (
            <Link key={i} to={item.path}>
              <motion.div 
                whileHover={{ y: -8 }}
                className="card group h-full flex flex-col justify-between"
              >
                <div className="space-y-8">
                  <div className="w-16 h-16 rounded-xl bg-slate-900/50 border border-slate-800 flex items-center justify-center text-slate-500 group-hover:text-primary transition-all">
                    <item.icon size={28} />
                  </div>
                  <div className="space-y-3">
                    <h4 className="text-xl font-bold text-white group-hover:text-primary transition-colors tracking-tight">{item.title}</h4>
                    <p className="text-slate-400 font-medium leading-relaxed text-sm">{item.desc}</p>
                  </div>
                </div>
                <div className="pt-8 flex items-center justify-between border-t border-slate-800 mt-8">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Access</span>
                  <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all duration-300">
                    <ArrowUpRight size={16} />
                  </div>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 card p-6 md:p-10 bg-slate-900/40 border-slate-800">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 md:mb-10">
              <div className="space-y-1">
                <h4 className="text-xl md:text-2xl font-bold text-white tracking-tight">System Activity</h4>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Real-time synchronization</p>
              </div>
              <div className="flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <p className="text-[10px] font-bold text-emerald-500 tracking-wider uppercase">Live Sync</p>
              </div>
            </div>
            
            <div className="space-y-3">
              {liveActivity.slice(0, 5).map((activity, i) => (
                <div key={i} className="flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-xl bg-slate-900/50 border border-slate-800 hover:bg-slate-800/50 transition-all group overflow-hidden">
                  <span className="text-slate-500 text-[9px] md:text-[10px] font-mono shrink-0">[{activity.time}]</span>
                  <p className="text-xs md:text-sm font-medium text-slate-400 truncate">
                    <span className="text-primary font-bold">{activity.user}</span> 
                    <span className="mx-2 opacity-60">initialized</span>
                    <span className="text-slate-200 font-bold">{activity.action}</span>
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-4 space-y-8">
            <Link to="/lostfound" className="card p-8 flex items-center justify-between group border-l-4 border-l-orange-500 hover:bg-orange-500/10 transition-all block">
              <div className="space-y-1">
                <h4 className="text-xl font-bold text-white tracking-tight">Lost & Found</h4>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Support Center</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center group-hover:bg-orange-500 group-hover:text-white transition-all">
                <Search size={20} />
              </div>
            </Link>
            <Link to="/clubs" className="card p-8 flex items-center justify-between group border-l-4 border-l-indigo-500 hover:bg-indigo-500/10 transition-all block">
              <div className="space-y-1">
                <h4 className="text-xl font-bold text-white tracking-tight">SAC Clubs</h4>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{stats.clubs} Communities</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center group-hover:bg-indigo-500 group-hover:text-white transition-all">
                <Trophy size={20} />
              </div>
            </Link>
            <div className="card p-8 bg-slate-900/50 border-slate-800">
              <div className="flex justify-between items-center mb-6">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">System Status</p>
                <ShieldCheck size={16} className="text-emerald-500" />
              </div>
              <div className="space-y-4">
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: '94%' }} className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                </div>
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  <span>Stability</span>
                  <span className="text-white">94% Secure</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

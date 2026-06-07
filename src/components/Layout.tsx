import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Users, 
  GraduationCap, 
  Search, 
  Trophy, 
  Building2, 
  PartyPopper, 
  Library, 
  Laptop, 
  Home, 
  Moon, 
  Sun, 
  Bell,
  User as UserIcon,
  Settings,
  LogOut,
  Command,
  ChevronDown,
  LogIn,
  Menu,
  X as CloseIcon,
  Plus,
  Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { dataService } from '../dataService';
import { User, signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { Chatbot } from './Chatbot';
import { AppNotification } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  toggleTheme: () => void;
  isDark: boolean;
  currentRole: string;
  toggleRole: () => void;
  user: User | null;
  userData: any;
}

const Layout: React.FC<LayoutProps> = ({ children, toggleTheme, isDark, currentRole, toggleRole, user, userData }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const location = useLocation();
  const navigate = useNavigate();

  // Dynamic Notifications States
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [newNotifTitle, setNewNotifTitle] = useState('');
  const [newNotifType, setNewNotifType] = useState('Technical');
  const [newNotifPath, setNewNotifPath] = useState('/technical');
  const [isPostingNotif, setIsPostingNotif] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    const unsubscribe = dataService.subscribeNotifications((data) => {
      setNotifications(data);
    });
    return () => unsubscribe();
  }, []);

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
      console.error("Failed to post notification:", err);
    } finally {
      setIsPostingNotif(false);
    }
  };

  const handleDeleteNotification = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this notification?")) {
      try {
        await dataService.deleteNotification(id);
      } catch (err) {
        console.error("Failed to delete notification:", err);
      }
    }
  };

  const handleDismissAll = async () => {
    if (currentRole === 'Admin') {
      if (confirm("Are you sure you want to delete all notifications from the board? This action is permanent.")) {
        try {
          await Promise.all(notifications.map(n => dataService.deleteNotification(n.id)));
          setShowNotifications(false);
        } catch (err) {
          console.error("Failed to dismiss all notifications:", err);
        }
      }
    } else {
      // Local dismissal for students
      setShowNotifications(false);
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

  const navItems = [
    { path: '/', icon: Home, label: 'Dashboard' },
    { path: '/students', icon: Users, label: 'Students' },
    { path: '/alumni', icon: GraduationCap, label: 'Alumni' },
    { path: '/fest', icon: PartyPopper, label: 'Fest Events' },
    { path: '/technical', icon: Laptop, label: 'Technical' },
    { path: '/library', icon: Library, label: 'Library' },
    { path: '/lostfound', icon: Search, label: 'Lost & Found' },
    { path: '/clubs', icon: Trophy, label: 'SAC Clubs' },
    { path: '/department', icon: Building2, label: 'Departments' },
  ];

  useEffect(() => {
    let isActive = true;
    if (globalSearch.length > 2) {
      dataService.globalSearch(globalSearch).then((results) => {
        if (isActive) {
          setSearchResults(results);
        }
      }).catch((err) => {
        console.error("Global search failed:", err);
      });
    } else {
      setSearchResults([]);
    }
    return () => {
      isActive = false;
    };
  }, [globalSearch]);

  const handleSearchResultClick = (path: string) => {
    navigate(path);
    setGlobalSearch('');
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchResults.length > 0) {
      handleSearchResultClick(searchResults[0].path);
    }
  };

  return (
    <div className={cn("min-h-screen flex flex-col relative selection:bg-primary selection:text-white")}>
      <div className="atmosphere-bg" />
      
      <header className="glass-header px-4 sm:px-8 lg:px-12 py-3 sm:py-4 flex justify-between items-center sticky top-0 z-[100]">
        <div className="flex items-center gap-3 sm:gap-4 lg:gap-8">
          <button 
            onClick={() => setShowMobileMenu(true)}
            className="md:hidden w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl bg-slate-900/50 border border-slate-800 text-slate-400 hover:text-white"
          >
            <Menu size={18} />
          </button>
          
          <Link to="/" className="flex items-center gap-2 sm:gap-3 lg:gap-4 group">
            <div className="w-7 h-7 sm:w-8 sm:h-8 lg:w-11 lg:h-11 bg-primary rounded-xl flex items-center justify-center transition-all duration-500 group-hover:rotate-12 shadow-[0_0_20px_rgba(99,102,241,0.4)]">
              <span className="text-xs sm:text-base lg:text-2xl font-black text-white">V</span>
            </div>
            <div className="hidden xs:block">
              <h1 className="text-sm sm:text-lg lg:text-2xl font-black tracking-tight leading-none text-white">
                VIGNAN<span className="text-primary italic-serif lowercase ml-0.5 sm:ml-1">verse</span>
              </h1>
              <p className="hidden md:block text-[9px] font-bold uppercase tracking-widest text-slate-500 mt-0.5">Campus Management System</p>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-8">
          {/* Tech Search Bar */}
          <form onSubmit={handleSearchSubmit} className="hidden md:flex relative group">
            <button 
              type="submit"
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary active:scale-95 transition-all cursor-pointer z-10"
              title="Search"
            >
              <Search size={14} />
            </button>
            <input 
              type="text" 
              placeholder="Quick search..." 
              className="w-56 lg:w-64 pl-10 pr-4 py-2 bg-slate-900/50 border border-slate-800 rounded-xl focus:bg-slate-900 focus:w-[300px] focus:border-primary/50 transition-all text-xs font-medium outline-none text-slate-200 placeholder:text-slate-600 focus:pl-10"
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
            />
            
            <AnimatePresence>
              {searchResults.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl backdrop-blur-xl"
                >
                  <div className="p-1 max-h-80 overflow-y-auto no-scrollbar">
                    {searchResults.map((result, i) => (
                      <button 
                        key={i}
                        onClick={() => handleSearchResultClick(result.path)}
                        className="w-full flex items-center gap-3 p-2 hover:bg-slate-800/50 rounded-lg transition-all group text-left"
                      >
                        <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-500 group-hover:text-primary transition-colors">
                          <result.icon size={14} />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-slate-300 group-hover:text-white">{result.title}</p>
                          <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500">{result.type}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </form>

          <div className="flex items-center gap-6">
            {user ? (
              <>
                <div className="hidden sm:flex bg-slate-900/50 p-1 rounded-xl border border-slate-800">
                  <button 
                    onClick={toggleRole}
                    className={cn(
                      "px-4 py-1.5 rounded-lg text-[10px] uppercase tracking-wider font-bold transition-all",
                      currentRole === 'Admin' ? "bg-slate-800 text-white shadow-sm" : "text-slate-500 hover:text-slate-300"
                    )}
                  >
                    Admin
                  </button>
                  <button 
                    onClick={toggleRole}
                    className={cn(
                      "px-4 py-1.5 rounded-lg text-[10px] uppercase tracking-wider font-bold transition-all",
                      currentRole === 'Student' ? "bg-slate-800 text-white shadow-sm" : "text-slate-500 hover:text-slate-300"
                    )}
                  >
                    Student
                  </button>
                </div>

                <div className="flex items-center gap-2 sm:gap-3">
                  <button 
                    onClick={toggleTheme}
                    className="hidden sm:flex w-10 h-10 items-center justify-center rounded-xl bg-slate-900/50 border border-slate-800 hover:bg-slate-800 transition-all text-slate-500 hover:text-white"
                  >
                    {isDark ? <Sun size={18} /> : <Moon size={18} />}
                  </button>
                  
                  <button 
                    onClick={() => setShowNotifications(true)}
                    className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl bg-slate-900/50 border border-slate-800 hover:bg-slate-800 transition-all text-slate-500 hover:text-white relative group"
                  >
                    <Bell size={18} />
                    <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-primary rounded-full border border-slate-950 group-hover:scale-125 transition-transform shadow-sm" />
                  </button>

                  <div className="h-5 w-px bg-slate-800 mx-0.5 sm:mx-1" />

                  <div className="relative">
                    <button 
                      onClick={() => setShowProfileMenu(!showProfileMenu)}
                      className="flex items-center gap-2 p-1 pr-1.5 sm:pr-3 rounded-xl bg-slate-900/50 border border-slate-800 hover:bg-slate-800 transition-all group"
                    >
                      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-xs shadow-[0_0_15px_rgba(99,102,241,0.3)]">
                        {currentRole[0]}
                      </div>
                      <div className="hidden lg:block text-left">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{currentRole}</p>
                      </div>
                      <ChevronDown size={10} className="text-slate-500 transition-transform" />
                    </button>

                    <AnimatePresence>
                      {showProfileMenu && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          className="absolute top-full right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl p-1 backdrop-blur-xl"
                        >
                          <div className="p-3 border-b border-slate-800 mb-1">
                            <p className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Account</p>
                            <p className="text-xs font-semibold text-slate-200 truncate">{user.displayName || user.email}</p>
                            {userData?.registrationNumber && (
                              <p className="text-[10px] font-mono text-primary mt-1 font-bold tracking-wider">
                                REG: {userData.registrationNumber}
                              </p>
                            )}
                          </div>
                          <button className="w-full flex items-center gap-2.5 p-2.5 hover:bg-slate-800 rounded-lg transition-all text-slate-400 hover:text-white text-xs font-medium">
                            <UserIcon size={14} /> Profile Settings
                          </button>
                          <button className="w-full flex items-center gap-2.5 p-2.5 hover:bg-slate-800 rounded-lg transition-all text-slate-400 hover:text-white text-xs font-medium">
                            <Settings size={14} /> System Preferences
                          </button>
                          <div className="h-px bg-slate-800 my-1" />
                          <button 
                            onClick={() => {
                              localStorage.removeItem('isVuidVerified');
                              signOut(auth);
                            }}
                            className="w-full flex items-center gap-2.5 p-2.5 hover:bg-red-500/10 rounded-lg transition-all text-red-400 text-xs font-medium"
                          >
                            <LogOut size={14} /> Sign Out
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2 sm:gap-4">
                <button 
                  onClick={toggleTheme}
                  className="hidden sm:flex w-9 h-9 sm:w-10 sm:h-10 items-center justify-center rounded-xl bg-slate-900/50 border border-slate-800 hover:bg-slate-800 transition-all text-slate-500 hover:text-white"
                >
                  {isDark ? <Sun size={18} /> : <Moon size={18} />}
                </button>
                <Link 
                  to="/login"
                  className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-6 py-1.5 sm:py-2 rounded-xl bg-primary text-white font-bold uppercase tracking-wider text-[9px] sm:text-[10px] hover:brightness-110 transition-all shadow-[0_0_20px_rgba(99,102,241,0.3)]"
                >
                  <LogIn size={12} />
                  Sign In
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="flex-1 flex flex-col md:flex-row">
        {/* Sidebar Navigation */}
        <aside className="hidden md:flex w-72 flex-col bg-slate-950/50 border-r border-slate-800/50 sticky top-[73px] h-[calc(100vh-73px)] z-40 backdrop-blur-xl">
          <div className="flex-1 overflow-y-auto py-8 px-4 no-scrollbar">
            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-600 px-4 mb-4">Main Menu</p>
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden",
                      isActive 
                        ? "bg-primary/10 text-primary shadow-[0_0_20px_rgba(99,102,241,0.1)]" 
                        : "text-slate-500 hover:bg-slate-900/50 hover:text-slate-200"
                    )}
                  >
                    {isActive && (
                      <motion.div 
                        layoutId="active-nav"
                        className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full shadow-[0_0_10px_rgba(99,102,241,0.8)]"
                      />
                    )}
                    <item.icon size={18} className={cn("transition-transform group-hover:scale-110", isActive ? "text-primary" : "text-slate-600 group-hover:text-slate-400")} />
                    <span className="text-sm font-semibold tracking-tight">{item.label}</span>
                  </Link>
                );
              })}
            </div>

            <div className="mt-12 pt-8 border-t border-slate-800/50">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-600 px-4 mb-4">System Status</p>
              <div className="px-4 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-500">Database</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-500">Auth Service</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 border-t border-slate-800/50 bg-slate-950/30">
            <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800 shadow-sm">
              <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-2">Current Role</p>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <UserIcon size={14} />
                </div>
                <span className="text-xs font-bold text-slate-300">{currentRole}</span>
              </div>
            </div>
          </div>
        </aside>

        <main className="flex-1 p-4 md:p-8 lg:p-12 max-w-[1600px] mx-auto w-full overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Mobile Drawer Navigation */}
      <AnimatePresence>
        {showMobileMenu && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMobileMenu(false)}
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[200] md:hidden"
            />
            <motion.aside 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-80 bg-slate-950 border-r border-slate-800 z-[201] md:hidden flex flex-col h-full"
            >
              {/* Drawer Top Header Row */}
              <div className="p-5 border-b border-slate-800/60 flex items-center justify-between bg-slate-900/40">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center text-white font-black text-xs">V</div>
                  <span className="text-xs font-bold tracking-tight text-white uppercase font-display">VIGNAN<span className="text-primary italic-serif lowercase ml-0.5">verse</span></span>
                </div>
                <button 
                  onClick={() => setShowMobileMenu(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-900 border border-slate-800 text-slate-500 hover:text-white"
                >
                  <CloseIcon size={16} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-5 py-6 space-y-6">
                
                {/* User / Persona Deck */}
                {user && (
                  <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-850 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-white font-black text-sm shadow-[0_0_15px_rgba(99,102,241,0.35)]">
                        {currentRole[0]}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-black text-slate-200 truncate">{user.displayName || user.email}</p>
                        {userData?.registrationNumber ? (
                          <p className="text-[9px] font-mono text-primary font-bold">REG: {userData.registrationNumber}</p>
                        ) : (
                          <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">{currentRole} account</p>
                        )}
                      </div>
                    </div>

                    <div className="h-px bg-slate-800" />

                    {/* Dual Switch Role Deck */}
                    <div className="space-y-1.5">
                      <p className="text-[8px] font-black uppercase tracking-wider text-slate-500">Persona Profile</p>
                      <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-850">
                        <button 
                          onClick={toggleRole}
                          className={cn(
                            "flex-1 py-1 text-[9px] uppercase tracking-wider font-bold transition-all text-center rounded-lg",
                            currentRole === 'Admin' ? "bg-slate-800 text-white shadow-sm font-black border border-slate-700" : "text-slate-500 hover:text-slate-300"
                          )}
                        >
                          Admin
                        </button>
                        <button 
                          onClick={toggleRole}
                          className={cn(
                            "flex-1 py-1 text-[9px] uppercase tracking-wider font-bold transition-all text-center rounded-lg",
                            currentRole === 'Student' ? "bg-slate-800 text-white shadow-sm font-black border border-slate-700" : "text-slate-500 hover:text-slate-300"
                          )}
                        >
                          Student
                        </button>
                      </div>
                    </div>

                    {/* Quick Preference Deck */}
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <button
                        onClick={toggleTheme}
                        className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl bg-slate-950 border border-slate-850 text-[10px] font-bold text-slate-300 uppercase tracking-widest hover:text-white"
                      >
                        {isDark ? <Sun size={11} className="text-amber-400" /> : <Moon size={11} className="text-primary" />}
                        <span className="text-[8px]">{isDark ? "Light" : "Dark"}</span>
                      </button>
                      <button
                        onClick={() => {
                          localStorage.removeItem('isVuidVerified');
                          signOut(auth);
                          setShowMobileMenu(false);
                        }}
                        className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl bg-red-500/10 border border-red-500/20 text-[9px] font-bold text-red-400 uppercase tracking-widest"
                      >
                        <LogOut size={11} />
                        Exit
                      </button>
                    </div>
                  </div>
                )}
                
                {/* Mobile Search */}
                <form onSubmit={handleSearchSubmit} className="relative w-full">
                  <div className="relative group">
                    <button 
                      type="submit"
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors cursor-pointer"
                    >
                      <Search size={14} />
                    </button>
                    <input 
                      type="text" 
                      placeholder="Search campus..." 
                      className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl outline-none focus:border-primary/50 text-xs font-semibold text-white placeholder:text-slate-650 transition-all"
                      value={globalSearch}
                      onChange={(e) => setGlobalSearch(e.target.value)}
                    />
                  </div>

                  {/* Mobile Search Results */}
                  <AnimatePresence>
                    {globalSearch.length > 2 && searchResults.length > 0 && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-2 bg-slate-950 border border-slate-800 rounded-xl overflow-hidden max-h-60 overflow-y-auto no-scrollbar"
                      >
                        {searchResults.map((result, i) => (
                          <button 
                            key={i}
                            type="button"
                            onClick={() => {
                              handleSearchResultClick(result.path);
                              setShowMobileMenu(false);
                            }}
                            className="w-full flex items-center gap-3 p-2.5 hover:bg-slate-800/50 transition-all text-left"
                          >
                            <div className="w-7 h-7 rounded-lg bg-slate-900 flex items-center justify-center text-slate-500 shrink-0">
                              <result.icon size={11} />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-slate-300 truncate">{result.title}</p>
                              <p className="text-[8px] font-black uppercase tracking-widest text-slate-500">{result.type}</p>
                            </div>
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </form>

                <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2 px-4">Menu Selection</p>
                  <div className="grid grid-cols-1 gap-1">
                    {navItems.map((item) => {
                      const isActive = location.pathname === item.path;
                      return (
                        <Link
                          key={item.path}
                          to={item.path}
                          onClick={() => setShowMobileMenu(false)}
                          className={cn(
                            "flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all font-medium text-xs border border-transparent",
                            isActive 
                              ? "bg-primary/10 text-primary border-primary/20 shadow-[0_0_15px_rgba(99,102,241,0.08)] font-black" 
                              : "text-slate-400 hover:bg-slate-900 hover:text-white"
                          )}
                        >
                          <item.icon size={16} className={cn(isActive ? "text-primary" : "text-slate-500")} />
                          <span className="uppercase tracking-wider font-bold text-[10px]">{item.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="p-5 border-t border-slate-800 bg-slate-900/20 mt-auto">
                <div className="flex justify-between items-center text-slate-500 text-[10px] uppercase font-bold tracking-widest px-1">
                  <span>System Active</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Notification Modal */}
      <AnimatePresence>
        {showNotifications && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/90 backdrop-blur-xl p-4 overflow-y-auto w-full h-full">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-slate-900 p-8 sm:p-12 rounded-[40px] sm:rounded-[60px] w-full max-w-xl border border-slate-800 shadow-[0_0_100px_rgba(99,102,241,0.2)] relative my-8"
            >
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-3xl sm:text-5xl font-black flex items-center gap-4 sm:gap-6 tracking-tighter uppercase italic text-white">
                  <Bell className="text-primary" size={32} /> Notifications
                </h3>
                <button onClick={() => setShowNotifications(false)} className="text-slate-500 hover:text-white transition-colors">
                  <ChevronDown size={32} />
                </button>
              </div>

              {/* Admin Panel to Post Notification */}
              {currentRole === 'Admin' && (
                <div className="mb-8 p-6 bg-slate-950/60 rounded-[24px] border border-slate-800/80">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-xs font-black tracking-widest text-primary uppercase">POST NEW NOTIFICATION</h4>
                    <button 
                      onClick={() => setShowAddForm(!showAddForm)}
                      className="text-[10px] font-bold text-slate-400 hover:text-white transition-colors underline uppercase tracking-wider"
                    >
                      {showAddForm ? 'Collapse form' : '+ Expand form'}
                    </button>
                  </div>

                  <AnimatePresence>
                    {showAddForm && (
                      <motion.form 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        onSubmit={handlePostNotification}
                        className="space-y-4 overflow-hidden text-left"
                      >
                        <div>
                          <label className="block text-[9px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">Notification Message</label>
                          <input 
                            type="text" 
                            placeholder="e.g. Live placement report updated direct from campus"
                            className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-semibold text-slate-200 focus:border-primary/50 transition-all outline-none"
                            value={newNotifTitle}
                            onChange={(e) => setNewNotifTitle(e.target.value)}
                            required
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[9px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">Category</label>
                            <select 
                              className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-semibold text-slate-200 focus:border-primary/50 transition-all outline-none"
                              value={newNotifType}
                              onChange={(e) => handleTypeChange(e.target.value)}
                            >
                              {typePresets.map(preset => (
                                <option key={preset.type} value={preset.type}>{preset.type}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-[9px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">Destination Path</label>
                            <input 
                              type="text" 
                              className="w-full px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-slate-400 focus:border-primary/50 transition-all outline-none"
                              value={newNotifPath}
                              onChange={(e) => setNewNotifPath(e.target.value)}
                              required
                            />
                          </div>
                        </div>

                        <button 
                          type="submit" 
                          disabled={isPostingNotif}
                          className="premium-btn w-full justify-center py-3 text-[10px] font-black uppercase tracking-widest"
                        >
                          {isPostingNotif ? 'Publishing...' : 'Broadcast Notification'}
                        </button>
                      </motion.form>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {notifications.length === 0 ? (
                <div className="text-center py-12 bg-slate-850/30 rounded-[32px] border border-dashed border-slate-800 mb-8">
                  <Bell className="mx-auto text-slate-600 mb-3 animate-pulse" size={32} />
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">No notifications posted</p>
                </div>
              ) : (
                <div className="max-h-[350px] overflow-y-auto no-scrollbar space-y-4 mb-8 text-left">
                  {notifications.map((notif) => (
                    <div 
                      key={notif.id} 
                      className="p-6 bg-slate-800/30 hover:bg-slate-800/60 rounded-[24px] border border-slate-800 flex justify-between items-center group transition-all relative"
                    >
                      <Link 
                        to={notif.path}
                        onClick={() => setShowNotifications(false)}
                        className="flex-1 pr-4 text-left"
                      >
                        <div className="space-y-1">
                          <p className="text-base sm:text-lg font-black italic text-slate-300 group-hover:text-white transition-colors">{notif.title}</p>
                          <p className="text-[9px] font-black uppercase tracking-widest text-primary">{notif.type}</p>
                        </div>
                      </Link>
                      <div className="flex items-center gap-4">
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">{getRelativeTime(notif.createdAt)}</span>
                        {currentRole === 'Admin' && (
                          <button 
                            onClick={(e) => handleDeleteNotification(notif.id, e)}
                            className="bg-red-500/10 hover:bg-red-500/20 p-2.5 rounded-xl border border-red-500/20 text-red-400 hover:text-red-300 transition-all opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                            title="Delete Notification"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <button 
                onClick={handleDismissAll}
                className="premium-btn w-full justify-center py-5 sm:py-6 text-[10px] font-black uppercase tracking-[0.4em]"
              >
                {currentRole === 'Admin' ? 'Clear Notification Board' : 'Dismiss All Alerts'}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Chatbot />
    </div>
  );
};

export default Layout;

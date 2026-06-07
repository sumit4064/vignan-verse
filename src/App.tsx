import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';

// Import Pages
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import AlumniPage from './pages/Alumni';
import LostFound from './pages/LostFound';
import Clubs from './pages/Clubs';
import Department from './pages/Department';
import Fest from './pages/Fest';
import Library from './pages/Library';
import Technical from './pages/Technical';

import { dataService } from './dataService';
import { initialData } from './initialData';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, testConnection, db } from './firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import Login from './components/Login';
import { motion, AnimatePresence } from 'motion/react';
import { X, ShieldCheck } from 'lucide-react';
import { cn } from './lib/utils';

export default function App() {
  const [isDark, setIsDark] = useState(false);
  const [currentRole, setCurrentRole] = useState('Student');
  const [isInitializing, setIsInitializing] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [isSessionVerified, setIsSessionVerified] = useState(() => {
    return localStorage.getItem('isVuidVerified') === 'true';
  });

  const [showAdminAuthModal, setShowAdminAuthModal] = useState(false);
  const [adminCode, setAdminCode] = useState('');
  const [adminError, setAdminError] = useState(false);

  useEffect(() => {
    let unsubscribeUser: (() => void) | undefined;

    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        try {
          // Parallelize connection test and user doc check
          const [userDoc] = await Promise.all([
            getDoc(doc(db, 'users', currentUser.uid)),
            testConnection()
          ]);
          
          if (!userDoc.exists()) {
            const isDefaultAdmin = currentUser.email?.toLowerCase() === "itzsumit2005@gmail.com";
            await setDoc(doc(db, 'users', currentUser.uid), {
              uid: currentUser.uid,
              email: currentUser.email,
              displayName: currentUser.displayName,
              photoURL: currentUser.photoURL,
              role: isDefaultAdmin ? 'Admin' : 'Student',
              verified: isDefaultAdmin, // Default admin is auto-verified
              createdAt: Date.now()
            });

            // Only seed data if this is the default admin's first login
            if (isDefaultAdmin) {
              dataService.seedInitialData(initialData);
            }
          } else {
            // Seed check
            const data = userDoc.data();
            const isDefaultAdmin = currentUser.email?.toLowerCase() === "itzsumit2005@gmail.com";
            if (data?.role === 'Admin' || isDefaultAdmin) {
              dataService.seedInitialData(initialData);
            }
          }
          
          // Subscribe to full user data
          if (unsubscribeUser) unsubscribeUser();
          unsubscribeUser = dataService.subscribeUserData(currentUser.uid, (data) => {
            setUserData(data);
            setCurrentRole(data?.role || 'Student');
            if (data?.registrationNumber && localStorage.getItem('isVuidVerified') === 'true') {
              setIsSessionVerified(true);
            }
            setIsInitializing(false);
          });
        } catch (error) {
          console.error("Initialization error:", error);
          setIsInitializing(false);
        }
      } else {
        if (unsubscribeUser) unsubscribeUser();
        setUserData(null);
        setIsSessionVerified(false);
        setIsInitializing(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeUser) unsubscribeUser();
    };
  }, []);

  const toggleTheme = () => setIsDark(!isDark);
  const toggleRole = async () => {
    if (user) {
      if (currentRole === 'Student') {
        setShowAdminAuthModal(true);
        setAdminCode('');
        setAdminError(false);
      } else {
        await dataService.updateUserRole(user.uid, 'Student');
      }
    }
  };

  const handleAdminAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (adminCode === 'vignan@4064') {
      if (user) {
        await dataService.updateUserRole(user.uid, 'Admin');
        setShowAdminAuthModal(false);
      }
    } else {
      setAdminError(true);
      setTimeout(() => setAdminError(false), 2000);
    }
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center gap-8 overflow-hidden relative">
        {/* Atmospheric background elements */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] -z-10" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-secondary/10 rounded-full blur-[80px] -z-10" />
        
        <div className="relative">
          <div className="w-24 h-24 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-center animate-pulse shadow-2xl">
            <div className="w-12 h-12 rounded-xl bg-primary shadow-[0_0_30px_rgba(99,102,241,0.4)] flex items-center justify-center">
              <span className="text-2xl font-black text-white">V</span>
            </div>
          </div>
          <div className="absolute -inset-4 border border-primary/20 rounded-[40px] animate-[spin_10s_linear_infinite]" />
        </div>
        <div className="space-y-4 text-center relative z-10">
          <h2 className="text-2xl font-black tracking-tighter text-white uppercase italic-serif">Vignan Universe</h2>
          <div className="flex items-center gap-2 justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.3s] shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.15s] shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
          </div>
          <p className="text-[10px] font-bold tracking-[0.2em] text-slate-500 uppercase">Initializing Campus Ecosystem</p>
        </div>
      </div>
    );
  }

  // Identity Verification Wall
  if (!user || !isSessionVerified) {
    return <Login user={user} userData={userData} onVerified={() => setIsSessionVerified(true)} />;
  }

  return (
    <Router>
      <Layout 
        isDark={isDark} 
        toggleTheme={toggleTheme} 
        currentRole={currentRole} 
        toggleRole={toggleRole}
        user={user}
        userData={userData}
      >
        <Routes>
          <Route path="/" element={<Dashboard currentRole={currentRole} />} />
          <Route path="/students" element={<Students currentRole={currentRole} />} />
          <Route path="/alumni" element={<AlumniPage currentRole={currentRole} />} />
          <Route path="/lostfound" element={<LostFound />} />
          <Route path="/clubs" element={<Clubs currentRole={currentRole} />} />
          <Route path="/department" element={<Department currentRole={currentRole} />} />
          <Route path="/fest" element={<Fest currentRole={currentRole} />} />
          <Route path="/library" element={<Library currentRole={currentRole} />} />
          <Route path="/technical" element={<Technical currentRole={currentRole} />} />
          <Route path="*" element={<Dashboard currentRole={currentRole} />} />
        </Routes>
      </Layout>

      <AnimatePresence>
        {showAdminAuthModal && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/80 backdrop-blur-xl p-6">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-slate-900 p-12 rounded-[3rem] border border-slate-800 shadow-2xl w-full max-w-md relative"
            >
              <button 
                onClick={() => setShowAdminAuthModal(false)}
                className="absolute top-8 right-8 text-slate-500 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
              
              <div className="text-center mb-10">
                <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-6 text-primary border border-primary/20">
                  <ShieldCheck size={40} />
                </div>
                <h2 className="text-3xl font-black tracking-tighter uppercase italic text-white">Admin Access</h2>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-2">Authorization Required</p>
              </div>

              <form onSubmit={handleAdminAuth} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 ml-2">Secret Access Code</label>
                  <input 
                    type="password"
                    autoFocus
                    placeholder="••••••••"
                    className={cn(
                      "w-full bg-slate-800/50 border rounded-2xl p-5 transition-all text-center text-xl font-black tracking-[0.5em] outline-none text-white placeholder:text-slate-700 placeholder:tracking-normal",
                      adminError ? "border-red-500 animate-shake" : "border-slate-700 focus:border-primary/50"
                    )}
                    value={adminCode}
                    onChange={e => setAdminCode(e.target.value)}
                  />
                  {adminError && (
                    <p className="text-red-500 text-[10px] font-black uppercase tracking-widest text-center mt-2">Invalid Access Protocol</p>
                  )}
                </div>
                <button 
                  type="submit"
                  className="premium-btn w-full justify-center py-6 text-sm"
                >
                  INITIALIZE_ADMIN_MODE
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </Router>
  );
}

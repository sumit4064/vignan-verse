import React, { useState } from 'react';
import { LogIn, ShieldCheck, Zap, Fingerprint, ArrowRight, CheckCircle2 } from 'lucide-react';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../firebase';
import { motion, AnimatePresence } from 'motion/react';
import { dataService } from '../dataService';
import { cn } from '../lib/utils';

interface LoginProps {
  user: any;
  userData: any;
  onVerified: () => void;
}

const Login: React.FC<LoginProps> = ({ user, userData, onVerified }) => {
  const [regNumber, setRegNumber] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    const regPattern = /^[0-9]{2}[0-9A-Z]{8}$/i;
    const formattedInput = regNumber.toUpperCase();
    
    if (!regPattern.test(formattedInput)) {
      setError("INVALID_AUTH_FORMAT: Please enter a valid 10-digit University Registration Number.");
      return;
    }

    setIsVerifying(true);
    try {
      if (user) {
        if (userData?.registrationNumber) {
          // Returning user: Check if it matches stored ID
          if (formattedInput !== userData.registrationNumber) {
            setError("IDENTITY_MISMATCH: The registration number entered does not match our records.");
            setIsVerifying(false);
            return;
          }
        } else {
          // First time user: Save to database
          await dataService.updateRegistrationNumber(user.uid, formattedInput);
        }
        
        // Save verification flag to localStorage
        localStorage.setItem('isVuidVerified', 'true');
        
        // Signal success to App
        onVerified();
      }
    } catch (err) {
      setError("SECURITY_BLOCK: Failed to verify identity. Terminal error.");
    } finally {
      setIsVerifying(false);
    }
  };

  const isStep2 = !!user; // Step 2 triggers if logged in via Google (even if verified in DB)

  return (
    <div className="min-h-screen bg-[#020204] flex items-center justify-center p-6 overflow-hidden relative">
      {/* Background Effects */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,242,255,0.05),transparent_70%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent,rgba(2,2,4,0.8))]" />
        <div className="w-full h-full opacity-5 bg-[url('https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80')] bg-cover bg-center mix-blend-overlay" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="card p-10 md:p-14 space-y-10 border-[#00f2ff]/10 bg-black/40 backdrop-blur-3xl rounded-[3rem] shadow-[0_0_100px_rgba(0,242,255,0.05)] border-t-[#00f2ff]/20">
          <div className="text-center space-y-6">
            <AnimatePresence mode="wait">
              {!isStep2 ? (
                <motion.div 
                  key="step1-icon"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 1.2, opacity: 0 }}
                  className="w-20 h-20 rounded-[28px] bg-[#00f2ff]/10 flex items-center justify-center text-[#00f2ff] mx-auto border border-[#00f2ff]/20"
                >
                  <Zap size={32} className="animate-pulse" />
                </motion.div>
              ) : (
                <motion.div 
                  key="step2-icon"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 1.2, opacity: 0 }}
                  className="w-20 h-20 rounded-[28px] bg-[#00ff88]/10 flex items-center justify-center text-[#00ff88] mx-auto border border-[#00ff88]/20"
                >
                  <Fingerprint size={32} />
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-2">
              <div className="flex items-center justify-center gap-3">
                <div className={cn("h-1 w-8 rounded-full transition-all duration-500", !isStep2 ? "bg-primary" : "bg-primary/20")} />
                <div className={cn("h-1 w-8 rounded-full transition-all duration-500", isStep2 ? "bg-[#00ff88]" : "bg-white/5")} />
              </div>
              <div className="micro-label text-white/40 tracking-[0.4em] uppercase">
                {isStep2 ? 'Identity_Verification' : 'System_Access_Protocol'}
              </div>
              <h1 className="text-4xl font-black tracking-tighter italic uppercase text-white">
                {isStep2 ? 'Verify_VUID' : 'VignanVerse'}
              </h1>
            </div>
            
            <p className="text-white/40 text-sm font-medium leading-relaxed px-4">
              {isStep2 
                ? 'Enter your official university registration number to finalize your digital identity.'
                : 'Initialize secure connection to the campus digital frontier via authorized Google portal.'}
            </p>
          </div>

          <div className="space-y-6">
            {!isStep2 ? (
              <button 
                onClick={handleLogin}
                className="premium-btn w-full justify-center py-6 text-sm group"
              >
                <LogIn size={20} className="group-hover:translate-x-1 transition-transform" />
                AUTHENTICATE_WITH_GOOGLE
              </button>
            ) : (
              <form onSubmit={handleVerify} className="space-y-6">
                <div className="space-y-3">
                  <input 
                    required
                    maxLength={10}
                    placeholder="REG_NUMBER (e.g. 221A0501)"
                    className={cn(
                      "w-full bg-white/5 border rounded-2xl p-5 text-center text-xl font-bold tracking-[0.2em] outline-none transition-all placeholder:text-white/10 placeholder:tracking-normal",
                      error ? "border-red-500 animate-shake" : "border-white/10 focus:border-[#00ff88]/50"
                    )}
                    value={regNumber}
                    onChange={e => setRegNumber(e.target.value)}
                  />
                  {error && <p className="text-[10px] font-black uppercase text-red-500 text-center tracking-widest">{error}</p>}
                </div>
                <button 
                  disabled={isVerifying}
                  type="submit"
                  className="premium-btn w-full justify-center py-6 text-sm bg-[#00ff88]/10 border-[#00ff88]/20 text-[#00ff88] hover:bg-[#00ff88]/20"
                >
                  {isVerifying ? (
                    <div className="flex items-center gap-2">
                       <ShieldCheck className="animate-spin" size={20} />
                       ESTABLISHING_IDENTITY...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      INITIALIZE_VERIFICATION
                      <ArrowRight size={20} />
                    </div>
                  )}
                </button>
              </form>
            )}

            <div className="flex items-center gap-4 text-white/20 justify-center">
              <CheckCircle2 size={16} className={isStep2 ? "text-[#00ff88]" : "text-primary"} />
              <span className="text-[9px] font-black uppercase tracking-widest font-mono">
                {isStep2 ? 'Waiting_for_Reg_ID' : 'OAuth_Secure_Socket_Active'}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-10 text-center">
          <p className="text-[9px] font-black uppercase tracking-[0.6em] text-white/10">
            © 2026 VIGNAN_UNIVERSITY // CYBER_CORE
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;

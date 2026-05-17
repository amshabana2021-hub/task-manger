import React, { useState } from 'react';
import { 
  signInWithPopup, 
  GoogleAuthProvider,
  signOut 
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import { motion, AnimatePresence } from 'motion/react';
import { LogIn, UserPlus, Mail, Lock, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '../lib/utils';

export default function AuthScreen() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      if (err.code === 'auth/popup-closed-by-user') {
        setError('Login cancelled. Please try again.');
      } else {
        setError(err.message || 'An error occurred during Google Sign-In');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-[#16162a]/60 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-8 sm:p-10 border border-white/5 text-center mx-2"
      >
        <div className="mb-8 sm:mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-[#ff2d92] to-[#aa00ff] text-white mb-6 shadow-[0_10px_30px_rgba(170,0,255,0.3)] border-2 border-white/20">
            <LogIn size={40} className="sm:scale-100 scale-90" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
            Taskly
          </h1>
          <p className="text-purple-200/50 mt-2 sm:mt-3 font-medium text-sm sm:text-base px-4 sm:px-0">
            Your personal task sanctuary.<br className="hidden sm:block" /> Sign in to begin.
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full bg-white/5 hover:bg-white/10 text-white font-black py-4 rounded-2xl border border-white/10 shadow-xl transition-all flex items-center justify-center gap-3 disabled:opacity-70 group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-[#aa00ff]/10 to-[#ff2d92]/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            {loading ? (
              <Loader2 className="animate-spin text-purple-400" size={24} />
            ) : (
              <>
                <svg className="w-6 h-6 z-10" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span className="z-10">Continue with Google</span>
              </>
            )}
          </button>

          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-rose-500/20 text-white p-4 rounded-2xl flex items-start gap-3 text-sm border border-rose-500/30 backdrop-blur-md mt-4"
              >
                <AlertCircle size={20} className="shrink-0 mt-0.5" />
                <span className="font-medium">{error}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <p className="mt-8 text-white/40 text-[10px] font-bold uppercase tracking-widest">
          Secure Multi-User Environment
        </p>
      </motion.div>
    </div>
  );
}

import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { toast } from 'sonner'; // Import toast for modern notifications

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { error, data } = isSignUp 
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      // Modern error toast
      toast.error(error.message);
    } else {
      if (isSignUp) {
        toast.success("Account created! Welcome to KD-PRO.");
      } else {
        toast.success("Welcome back!");
      }
    }
    
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin }
    });

    if (error) toast.error("Google login failed: " + error.message);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4 font-sans">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 p-8 rounded-[3rem] shadow-2xl text-center animate-in fade-in zoom-in duration-500">
        <h1 className="text-4xl font-black text-pink-500 mb-6 italic tracking-tighter">KD-PRO</h1>
        
        <button 
          onClick={handleGoogleLogin} 
          className="w-full bg-white text-slate-900 py-4 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-slate-100 transition-all mb-6 shadow-lg active:scale-95"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5" alt="Google" />
          Continue with Google
        </button>

        <div className="flex items-center my-6 gap-4">
          <div className="flex-1 border-t border-slate-800"></div>
          <span className="text-slate-600 text-[10px] font-black uppercase tracking-widest">OR EMAIL</span>
          <div className="flex-1 border-t border-slate-800"></div>
        </div>

        <form onSubmit={handleAuth} className="space-y-4 text-left">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-500 uppercase ml-4">Email Address</label>
            <input 
              type="email" 
              placeholder="name@example.com" 
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white outline-none focus:ring-2 focus:ring-pink-500 transition-all placeholder:text-slate-700" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
          </div>
          
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-500 uppercase ml-4">Password</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white outline-none focus:ring-2 focus:ring-pink-500 transition-all placeholder:text-slate-700" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
          </div>

          <button 
            disabled={loading} 
            className="w-full bg-pink-600 py-4 rounded-2xl text-white font-black hover:bg-pink-500 transition-all shadow-lg shadow-pink-500/20 active:scale-95 disabled:opacity-50 mt-2"
          >
            {loading ? "AUTHENTICATING..." : isSignUp ? "CREATE ACCOUNT" : "SIGN IN"}
          </button>
        </form>

        <button 
          onClick={() => setIsSignUp(!isSignUp)} 
          className="mt-8 text-slate-500 text-sm font-bold hover:text-pink-400 transition-colors"
        >
          {isSignUp ? "Already a member? Sign In" : "Need an account? Sign Up"}
        </button>
      </div>
    </div>
  );
}
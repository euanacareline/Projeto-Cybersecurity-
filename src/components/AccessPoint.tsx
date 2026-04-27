import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Lock, Terminal, Loader2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { AccessLevel, UserAccount } from '../types';

interface AccessPointProps {
  onAccessGranted: (level: AccessLevel, user: string) => void;
  users: UserAccount[];
}

export const AccessPoint = ({ onAccessGranted, users }: AccessPointProps) => {
  const [username, setUsername] = useState('');
  const [token, setToken] = useState('');
  const [showToken, setShowToken] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [ip, setIp] = useState('0.0.0.0');

  useEffect(() => {
    // Fetch user IP for visual effect and logging
    fetch('https://api.ipify.org?format=json')
      .then(res => res.json())
      .then(data => setIp(data.ip))
      .catch(() => setIp('Localhost/Internal'));
  }, []);

  const handleAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    // Simulate network delay for "Scanning Environment"
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Admin Access Logic
    if (username === 'admincarollamas' && token === '@@@Fe321') {
      onAccessGranted('admin', 'Ana Caroline Lamas');
      return;
    }

    // Userland Access Logic (Dynamic list from Admin)
    const matchedUser = users.find(u => 
      u.username.toLowerCase() === username.toLowerCase() && 
      u.token === token
    );

    if (matchedUser) {
      // Hardware-Level Binding Check
      if (matchedUser.linkedIP && matchedUser.linkedIP !== ip) {
        setError('HARDWARE_MISMATCH: Your IP does not match the registered device for this node.');
        setIsLoading(false);
        return;
      }

      onAccessGranted('userland', matchedUser.username);
      return;
    }

    // Legacy/Hardcoded fallback for specific development tokens if needed
    const userlandTokens = ['PREMIUM-777', 'HUNTER-VRP', 'BETA-PILOT'];
    if (userlandTokens.includes(token.toUpperCase())) {
      onAccessGranted('userland', username || 'Operator');
      return;
    }

    setError('ACCESS_DENIED: Invalid token or unauthorized credentials.');
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 selection:bg-emerald-500/30 selection:text-emerald-400">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.05),transparent_70%)] pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-[#0a0a0a] border border-zinc-900 rounded-lg p-8 shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden group">
          {/* Scanline Effect */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />
          
          <div className="relative z-10 space-y-8">
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center group-hover:border-emerald-500/30 transition-colors duration-500">
                <Shield className="text-zinc-500 group-hover:text-emerald-500 transition-colors duration-500" size={32} />
              </div>
              <div className="text-center">
                <h1 className="text-xs font-mono font-bold uppercase tracking-[0.4em] text-zinc-100">
                  Secure Access Node
                </h1>
                <p className="text-[10px] font-mono text-zinc-600 mt-2 flex items-center justify-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                  Origin: {ip}
                </p>
              </div>
            </div>

            <form onSubmit={handleAccess} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-mono uppercase text-zinc-500 ml-1 tracking-widest">Identity</label>
                  <div className="relative">
                    <Terminal className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-700" size={14} />
                    <input 
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Username (Admin only)"
                      className="w-full bg-[#050505] border border-zinc-800 rounded px-10 py-3 text-xs font-mono text-zinc-300 placeholder:text-zinc-800 focus:outline-none focus:border-emerald-500/50 transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-mono uppercase text-zinc-500 ml-1 tracking-widest">Auth Token / Key</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-700" size={14} />
                    <input 
                      type={showToken ? "text" : "password"}
                      value={token}
                      onChange={(e) => setToken(e.target.value)}
                      placeholder="Activation Code..."
                      className="w-full bg-[#050505] border border-zinc-800 rounded px-10 py-3 text-xs font-mono text-emerald-400 placeholder:text-zinc-800 focus:outline-none focus:border-emerald-500/50 transition-colors"
                    />
                    <button 
                      type="button"
                      onClick={() => setShowToken(!showToken)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-700 hover:text-zinc-500 transition-colors"
                    >
                      {showToken ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>
              </div>

              <AnimatePresence>
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-center gap-2 p-3 bg-red-500/5 border border-red-500/20 rounded text-[10px] font-mono text-red-400"
                  >
                    <AlertCircle size={14} className="shrink-0" />
                    <span>{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <button 
                type="submit"
                disabled={isLoading || !token}
                className="w-full h-12 bg-zinc-900 border border-zinc-800 rounded flex items-center justify-center gap-2 text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-zinc-400 hover:bg-emerald-500 hover:text-black hover:border-emerald-400 transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
              >
                {isLoading ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : (
                  <>ESTABLISH_CONNECTION</>
                )}
              </button>
            </form>
          </div>
        </div>

        <div className="mt-8 text-center space-y-4">
          <p className="text-[9px] font-mono text-zinc-700 uppercase tracking-widest">
            End-to-End Encrypted Node • Cyber Hunter Lab © 2026
          </p>
          <div className="flex items-center justify-center gap-4">
            <span className="w-1 h-1 rounded-full bg-zinc-800" />
            <span className="w-1 h-1 rounded-full bg-zinc-800" />
            <span className="w-1 h-1 rounded-full bg-zinc-800" />
          </div>
        </div>
      </motion.div>
    </div>
  );
};

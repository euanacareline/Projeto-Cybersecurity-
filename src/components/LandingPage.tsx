import React from 'react';
import { motion } from 'motion/react';
import { Shield, ChevronRight, Lock } from 'lucide-react';

interface LandingPageProps {
  onStart: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center py-40 md:py-64 relative overflow-hidden font-sans">
      {/* Background Hero Image with Overlay */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <img 
          src="https://images.unsplash.com/photo-1558494949-ef010cbdcc51?auto=format&fit=crop&q=80&w=2070" 
          alt="Cybernetic Core" 
          className="w-full h-full object-cover opacity-[0.08] grayscale hover:grayscale-0 transition-all duration-1000 scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#050505] via-transparent to-[#050505]" />
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Cybernetic Grid / Scanning Effect */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-1">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#10b981_1px,transparent_1px),linear-gradient(to_bottom,#10b981_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-[0.03]" />
        <motion.div 
          animate={{ 
            y: ['-100%', '100%'],
            opacity: [0, 0.4, 0]
          }}
          transition={{ 
            duration: 10, 
            repeat: Infinity, 
            ease: "linear" 
          }}
          className="absolute left-0 right-0 h-[2px] bg-emerald-500/30 shadow-[0_0_25px_rgba(16,185,129,0.5)]"
        />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="relative z-10 w-full max-w-5xl px-8 flex flex-col items-center"
      >
        {/* Elite Badge */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="inline-flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/30 px-6 py-2 rounded-full mb-24 backdrop-blur-md"
        >
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse ring-4 ring-emerald-500/20" />
          <span className="text-[10px] uppercase tracking-[0.5em] font-mono font-bold text-emerald-400">
            Acesso Restrito • Protocolo v5.5 Elite Turbo
          </span>
        </motion.div>

        {/* Hero Section */}
        <div className="mb-12">
          <h1 
            translate="no" 
            className="text-6xl md:text-8xl font-black mb-6 tracking-tighter bg-gradient-to-b from-white via-white to-zinc-600 bg-clip-text text-transparent leading-none"
          >
            Cyber Hunter Lab
          </h1>
          
          <div className="flex flex-col items-center gap-4">
            <p className="text-emerald-500 font-mono text-xs md:text-sm uppercase tracking-[0.6em] font-bold">
              A porta de entrada para vulnerabilidades de elite. 🛡️
            </p>
            <div className="h-px w-24 bg-emerald-500/30" />
          </div>
        </div>

        {/* Core Message */}
        <div className="max-w-3xl mx-auto space-y-12 mb-20 text-center">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="space-y-8"
          >
            <h2 className="text-3xl md:text-5xl font-black text-white tracking-tighter leading-tight italic">
              AUDITANDO O <span className="text-emerald-500">INEVITÁVEL</span>.
            </h2>
            <p className="text-lg md:text-2xl text-zinc-400 leading-relaxed font-light max-w-3xl mx-auto">
              No Cyber Hunter Lab, a vulnerabilidade não é um erro, é uma <span className="text-white font-medium">oportunidade de mitigação estrutural</span>. Operamos onde a lógica de negócio falha em ser binária.
            </p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center"
          >
            <div className="text-left space-y-6 border-l-2 border-emerald-500/40 pl-10">
              <p className="text-xs font-mono text-emerald-500 uppercase tracking-[0.3em] font-bold">Arquitetura de Hunt</p>
              <p className="text-zinc-500 text-sm leading-relaxed italic border-b border-zinc-900 pb-4">
                "Não scaneamos portas; mapeamos comportamentos imprevistos. O Kernel de Auditoria é alimentado por heurísticas proprietárias calibradas para severidade máxima."
              </p>
            </div>
            
            <div className="text-left space-y-6 border-l-2 border-emerald-500/40 pl-10">
              <p className="text-xs font-mono text-emerald-500 uppercase tracking-[0.3em] font-bold">DNA Offensive</p>
              <p className="text-zinc-500 text-sm leading-relaxed italic border-b border-zinc-900 pb-4">
                "Onde outros veem um SdkKey, nós vemos um vetor de Excessive Data Exposure. O hunt é cirúrgico, o patch é definitivo."
              </p>
            </div>
          </motion.div>
        </div>

        {/* Action Button */}
        <div className="flex flex-col items-center gap-6 mb-24">
          <motion.button
            whileHover={{ scale: 1.05, backgroundColor: '#10b981', color: '#fff' }}
            whileTap={{ scale: 0.95 }}
            onClick={onStart}
            className="group relative bg-white text-black px-16 py-6 rounded-full font-bold text-sm uppercase tracking-[0.3em] overflow-hidden transition-all shadow-[0_0_30px_rgba(255,255,255,0.1)]"
          >
            <span className="relative z-10 flex items-center gap-3">
              Engajar Protocolo de Hunt
              <ChevronRight size={18} className="transition-transform group-hover:translate-x-1" />
            </span>
          </motion.button>
          <p className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest">
            Acesso Restrito: Sujeito a Termos de Engajamento Ético
          </p>
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="pt-24 border-t border-zinc-900 w-full mt-32"
        >
          <div className="flex flex-col items-center mb-16">
            <p className="text-[10px] font-mono text-emerald-500/50 uppercase tracking-[0.6em] mb-6">Redes Validadas & Alvos Críticos</p>
            <div className="h-0.5 w-16 bg-emerald-500/30" />
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-16 items-center justify-items-center opacity-30 grayscale hover:opacity-100 transition-opacity duration-1000">
            <div className="flex flex-col items-center gap-3 group">
              <span className="text-3xl font-black tracking-tighter text-white group-hover:text-emerald-400 transition-all duration-500">google.com</span>
              <span className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all">Bug Hunter Elite</span>
            </div>
            <div className="flex flex-col items-center gap-3 group">
              <span className="text-3xl font-black tracking-tighter text-white group-hover:text-blue-400 transition-all duration-500">vercel.com</span>
              <span className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all">Security Partner</span>
            </div>
            <div className="flex flex-col items-center gap-3 group">
              <span className="text-3xl font-black tracking-tighter text-white group-hover:text-purple-400 transition-all duration-500">moovit.com</span>
              <span className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all">Critical Infrastructure</span>
            </div>
            <div className="flex flex-col items-center gap-3 group">
              <span className="text-3xl font-black tracking-tighter text-white group-hover:text-amber-400 transition-all duration-500">grok.com</span>
              <span className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all">Logic Verification</span>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4 }}
          className="my-32 text-center"
        >
          <div className="inline-block p-[1px] rounded-full bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent">
            <div className="bg-[#050505] px-8 py-2 rounded-full">
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-[0.4em]">
                O hunt continua. 🔎
              </span>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Bible Verse Section */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6 }}
        className="w-full max-w-4xl px-8 mb-48 text-center mt-32"
      >
        <div className="relative">
          <div className="absolute left-1/2 -top-12 -translate-x-1/2 w-64 h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />
          <p className="text-base md:text-lg text-zinc-400 leading-relaxed max-w-2xl mx-auto italic font-light font-serif">
            "Pelo contrário, Deus escolheu as coisas loucas do mundo para confundir os sábios; e Deus escolheu as coisas fracas do mundo para confundir as fortes."
          </p>
          <div className="mt-6 text-[11px] font-mono text-emerald-500/50 uppercase tracking-[0.5em] font-bold">
            — 1 Coríntios 1:27
          </div>
          <div className="absolute left-1/2 -bottom-12 -translate-x-1/2 w-64 h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />
        </div>
      </motion.div>

      {/* Footer Branding - Adjusted for better spacing */}
      <footer className="w-full mt-auto py-12 px-6 border-t border-zinc-900/50 bg-black/20 backdrop-blur-sm relative z-10">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex flex-col items-center md:items-start gap-2">
            <div className="text-[10px] font-mono text-zinc-700 tracking-[0.3em] uppercase font-bold">
              Propriedade de Ana Caroline Lamas
            </div>
            <div className="text-[9px] font-mono text-zinc-800 tracking-[0.2em] uppercase">
              Auditoria de Sistemas Críticos • © 2026
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row items-center gap-6 md:gap-12">
            <div className="flex flex-col items-center md:items-end gap-1">
              <span className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest">Canal Estrutural</span>
              <span className="text-[10px] font-mono text-zinc-400 tracking-wider">contato@cyberhuntlab.com.br</span>
            </div>
            <div className="h-8 w-px bg-zinc-900 hidden md:block" />
            <div className="flex flex-col items-center md:items-end gap-1">
              <span className="text-[9px] font-mono text-emerald-500/40 uppercase tracking-widest font-bold">Direct WhatsApp (Prioridade)</span>
              <a 
                href="https://wa.me/5531972442973" 
                target="_blank" 
                rel="no-referrer"
                className="text-[11px] font-mono text-emerald-500 hover:text-emerald-400 transition-colors tracking-widest font-bold"
              >
                +55 31 97244-2973
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

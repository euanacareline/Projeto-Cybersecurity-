import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Zap, 
  Terminal, 
  Shield, 
  Cpu, 
  Code, 
  Search, 
  ChevronRight,
  Sparkles,
  Command,
  FileCode,
  Globe,
  Bug,
  Activity,
  AlertTriangle
} from 'lucide-react';
import { cn } from '../lib/utils';

interface Step {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const STEPS: Step[] = [
  {
    id: 'recon',
    title: 'Intelligent Recon',
    description: 'Mapeamento de tecnologias e vetores prováveis usando Lógica Avançada.',
    icon: <Globe size={18} />,
    color: 'text-blue-400'
  },
  {
    id: 'logic',
    title: 'Business Logic Audit',
    description: 'Análise de fluxo de chamadas para detectar IDOR e Logic Bypass.',
    icon: <Activity size={18} />,
    color: 'text-purple-400'
  },
  {
    id: 'payload',
    title: 'Payload Evolution',
    description: 'Geração de bypasses em tempo real para WAF e filtragem.',
    icon: <Zap size={18} />,
    color: 'text-amber-400'
  },
  {
    id: 'poc',
    title: 'Automated PoC',
    description: 'Conversão de logs em scripts de exploração Python/cURL.',
    icon: <Code size={18} />,
    color: 'text-emerald-400'
  }
];

export function AgenticPipeline() {
  const [activeStep, setActiveStep] = useState<string>('recon');
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [output, setOutput] = useState<string | null>(null);

  const simulateProcess = () => {
    if (!inputText) return;
    setIsProcessing(true);
    setTimeout(() => {
      const isRecon = activeStep === 'recon';
      const isPoC = activeStep === 'poc' || activeStep === 'payload';
      
      const reconEthics = "\n\n[CLÁUSULA ÉTICA]: Auditoria de superfície concluída. Este mapeamento foi realizado de forma passiva/não intrusiva, respeitando os limites do programa de Bug Bounty. Nenhuma alteração foi feita nos ativos do alvo.";
      const pocEthics = "\n\n# AVISO: Este script de PoC (Prova de Conceito) destina-se exclusivamente a fins de validação técnica autorizada.\n# O uso contra sistemas sem permissão explícita é ilegal e viola os termos de conduta do Cyber Hunter Lab.";

      setIsProcessing(false);
      setOutput(`[ANALYSIS COMPLETE]
> Targeted vectors identified for step: ${activeStep.toUpperCase()}
> Context: ${inputText.substring(0, 30)}...

RECOMENDAÇÕES DO AGENTE:
- Monitorar tráfego em endpoints /api/v2/secure*
- Testar variação de 'Content-Type: application/x-yaml'
- Aplicar bypass de WAF via Double URL Encoding no parâmetro de redirecionamento.

SCRIPT DE POC SUGERIDO (DRAFT):
import requests
# Payload gerado dinamicamente para bypass
payload = "...encoded_payload..."
r = requests.get("https://target.com/vuln", params={"id": payload})
print(r.status_code)${isRecon ? reconEthics : ''}${isPoC ? pocEthics : ''}`);
    }, 2000);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.1)]">
            <Cpu className="text-emerald-500" size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              Pipeline de Segurança Avançada <span className="text-[10px] bg-emerald-500/20 text-emerald-500 px-2 py-0.5 rounded-full font-mono font-bold uppercase">v5.0 Elite</span>
            </h2>
            <p className="text-xs text-zinc-500 font-mono flex items-center gap-2">
              <Activity size={12} className="text-emerald-500 animate-pulse" /> LABORATÓRIO DE CAÇADORES CIBERNÉTICOS • KERNEL INTEGRATED
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg">
          <Shield size={14} className="text-zinc-500" />
          <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">WAF Status: Monitoring</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Steps */}
        <div className="space-y-2 lg:col-span-1">
          {STEPS.map((step) => (
            <button
              key={step.id}
              onClick={() => {
                setActiveStep(step.id);
                setOutput(null);
              }}
              className={cn(
                "w-full flex items-start gap-4 p-4 rounded-xl border transition-all text-left group",
                activeStep === step.id 
                  ? "bg-zinc-800/80 border-zinc-700 shadow-xl" 
                  : "bg-transparent border-transparent hover:bg-zinc-900 group-hover:border-zinc-800"
              )}
            >
              <div className={cn(
                "p-2 rounded-lg transition-colors",
                activeStep === step.id ? "bg-zinc-900" : "bg-zinc-800/30 group-hover:bg-zinc-800",
                activeStep === step.id ? step.color : "text-zinc-500"
              )}>
                {step.icon}
              </div>
              <div className="min-w-0">
                <h3 className={cn(
                  "text-xs font-bold uppercase tracking-widest",
                  activeStep === step.id ? "text-white" : "text-zinc-500"
                )}>{step.title}</h3>
                <p className="text-[10px] text-zinc-600 leading-tight mt-1 truncate">{step.description}</p>
              </div>
            </button>
          ))}
        </div>

        {/* Main Interface */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-[#121212] border border-zinc-800 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
              <Command size={120} />
            </div>

            <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-500 uppercase tracking-[0.2em] mb-4">
              <Terminal size={14} /> Agent Input Console
            </div>

            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`Cole aqui o contexto para ${STEPS.find(s => s.id === activeStep)?.title} (ex: logs de tráfego, endpoints do Nuclei, dumps da API)...`}
              className="w-full h-40 bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 text-sm font-mono text-zinc-300 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all resize-none"
            />

            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center gap-4 text-[10px] font-mono text-zinc-500">
                <span className="flex items-center gap-1.5"><Sparkles size={12} className="text-emerald-500" /> Deep Analysis Enabled</span>
                <span className="flex items-center gap-1.5"><FileCode size={12} /> Format: Raw Context</span>
              </div>
              
              <button
                onClick={simulateProcess}
                disabled={isProcessing || !inputText}
                className={cn(
                  "flex items-center gap-2 px-6 py-2 rounded-lg font-mono text-xs uppercase tracking-widest font-bold transition-all",
                  isProcessing || !inputText
                    ? "bg-zinc-800 text-zinc-600 cursor-not-allowed"
                    : "bg-emerald-500 text-black hover:bg-emerald-400 active:scale-95 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                )}
              >
                {isProcessing ? (
                  <>Analizando via Cyber Kernel...</>
                ) : (
                  <>Executar Fase de {activeStep.toUpperCase()} <ChevronRight size={14} /></>
                )}
              </button>
            </div>
          </div>

          <AnimatePresence>
            {output && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#0f0f0f] border border-zinc-800/50 rounded-2xl p-0 overflow-hidden"
              >
                <div className="bg-zinc-900/50 px-6 py-3 border-b border-zinc-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-[10px] font-mono font-bold text-zinc-400 tracking-widest uppercase">Agent Output: Success</span>
                  </div>
                  <button 
                    onClick={() => navigator.clipboard.writeText(output)}
                    className="text-zinc-500 hover:text-white transition-colors"
                  >
                    <Code size={14} />
                  </button>
                </div>
                <div className="p-6">
                  <pre className="text-[11px] font-mono text-emerald-500/90 leading-relaxed whitespace-pre-wrap">
                    {output}
                  </pre>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-zinc-900/30 border border-zinc-800 rounded-xl space-y-2">
              <h4 className="text-[10px] font-mono font-bold text-zinc-500 uppercase flex items-center gap-2">
                <Search size={12} /> Insight do TriageBot
              </h4>
              <p className="text-[11px] text-zinc-400 leading-relaxed italic">
                "Bugs de lógica frequentemente ocorrem em mudanças de estado onde o token do usuário não é revalidado contra o objeto de destino (Object ID). Considere usar o Agent para iterar sobre diferentes seqID."
              </p>
            </div>
            <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-xl space-y-2">
              <h4 className="text-[10px] font-mono font-bold text-emerald-500/70 uppercase flex items-center gap-2">
                <AlertTriangle size={12} /> Alerta de Bounty
              </h4>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Google VRP recentemente atualizou recompensas para falhas de <strong>Lógica Complexa</strong> em pipelines sensíveis. Use a fase de Payload Evolution para explorar escapes de sandboxes.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

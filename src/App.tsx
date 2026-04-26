import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldAlert, 
  Activity, 
  Search, 
  History, 
  Zap, 
  Bug, 
  Lock, 
  AlertCircle,
  Loader2,
  FileCode,
  Image as ImageIcon,
  Target,
  ArrowLeft,
  Shield,
  Zap as Power
} from 'lucide-react';
import { CodeInput } from './components/CodeInput';
import { AnalysisDashboard } from './components/AnalysisDashboard';
import { analyzePatch } from './services/gemini';
import { SecurityAnalysis } from './types';
import { MethodologyCard } from './components/MethodologyCard';
import { Badge } from './components/ui/Badge';
import { cn } from './lib/utils';

export default function App() {
  const [codeBefore, setCodeBefore] = useState('');
  const [codeAfter, setCodeAfter] = useState('');
  const [diff, setDiff] = useState('');
  const [customRules, setCustomRules] = useState('');
  const [showCustomRules, setShowCustomRules] = useState(false);
  const [useThinking, setUseThinking] = useState(false);
  const [targetPlatform, setTargetPlatform] = useState<'google_vrp' | 'hackerone'>('google_vrp');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<SecurityAnalysis[]>(() => {
    const saved = localStorage.getItem('validator_history');
    return saved ? JSON.parse(saved) : [];
  });

  const [currentAnalysis, setCurrentAnalysis] = useState<SecurityAnalysis | null>(() => {
    const saved = localStorage.getItem('validator_current');
    return saved ? JSON.parse(saved) : null;
  });

  // Persistence side effects
  useEffect(() => {
    localStorage.setItem('validator_history', JSON.stringify(history.slice(0, 20))); // Keep last 20
  }, [history]);

  useEffect(() => {
    localStorage.setItem('validator_current', JSON.stringify(currentAnalysis));
  }, [currentAnalysis]);

  const loadExample = () => {
    setCodeBefore(`// API de Gerenciamento de Arquivos - v1.0\napp.get('/download', (req, res) => {\n  const { filename } = req.query;\n  // Falha Crítica: Path Traversal direto sem sanitização\n  const filePath = path.join(__dirname, 'public', filename);\n  res.download(filePath);\n});`);
    setCodeAfter(`// API de Gerenciamento de Arquivos - v1.1 (Patch)\napp.get('/download', (req, res) => {\n  const { filename } = req.query;\n  // Fix: Sanitização usando basename e verificação de diretório\n  const safePath = path.basename(filename);\n  const finalPath = path.join(__dirname, 'public', safePath);\n  res.download(finalPath);\n});`);
    setDiff(`-  const filePath = path.join(__dirname, 'public', filename);\n+  const safePath = path.basename(filename);\n+  const finalPath = path.join(__dirname, 'public', safePath);`);
  };

  const handleStartAnalysis = async () => {
    if (!codeBefore && !codeAfter && !diff) {
      setError('Forneça ao menos um dos campos de código ou diff.');
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setCurrentAnalysis(null);

    try {
      const { analysis, verification } = await analyzePatch(
        codeBefore, 
        codeAfter, 
        diff, 
        useThinking, 
        customRules,
        history.map(h => h.result),
        targetPlatform
      );
      
      const session: SecurityAnalysis = {
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        code_before: codeBefore,
        code_after: codeAfter,
        diff: diff,
        result: analysis,
        verification: verification
      };

      setCurrentAnalysis(session);
      setHistory(prev => [session, ...prev]);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Erro durante a análise de IA.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-zinc-300 font-sans selection:bg-zinc-700 selection:text-white">
      {/* Top Navigation - Technical Header */}
      <header className="border-bottom border-zinc-800 bg-[#121212] py-4 px-6 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-zinc-800/50 rounded-lg border border-zinc-700/50">
            <ShieldAlert size={20} className="text-zinc-100" />
          </div>
          <div>
            <h1 className="text-xs font-mono font-bold uppercase tracking-[0.2em] text-zinc-100">
              Google VRP TriageBot <span className="text-zinc-500 font-normal">v3.3</span>
            </h1>
            <p className="text-[10px] font-mono text-zinc-500 uppercase flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Status: AI Triage Engineer (P1 Elite)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-4 text-[11px] font-mono text-zinc-500">
            <span className="flex items-center gap-1"><Search size={12} /> SCAN_MODE: CONTROLLED</span>
            <span className="flex items-center gap-1 text-emerald-500/80"><Lock size={12} /> AUTH: VERIFIED</span>
          </div>
          <button 
            onClick={() => setUseThinking(!useThinking)}
            className={cn(
              "p-2 rounded border transition-all flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest",
              useThinking ? "bg-amber-500/10 border-amber-500/50 text-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.2)]" : "bg-zinc-800 border-zinc-700 text-zinc-500 hover:text-zinc-400"
            )}
          >
            <Activity size={14} className={useThinking ? "animate-pulse" : ""} />
            {useThinking ? "High Reasoning (Deep Scan)" : "High Speed (Quick Scan)"}
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 md:p-8 space-y-12">
        <AnimatePresence mode="wait">
          {!currentAnalysis ? (
            <motion.div 
              key="input-form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-8"
            >
              {/* Introduction Card */}
              <div className="bg-[#121212] border border-zinc-800 rounded-xl p-8 flex flex-col md:flex-row items-center gap-8 justify-between shadow-2xl">
                <div className="max-w-2xl space-y-4 text-center md:text-left">
                  <Badge variant="info">Análise Baseada nas Regras do Google VRP (2025)</Badge>
                  <h2 className="text-3xl font-bold text-white tracking-tight leading-none">
                    Cace bugs <span className="text-zinc-500 underline decoration-zinc-800 underline-offset-8">não-triviais</span> com IA.
                  </h2>
              <p className="text-zinc-400 text-sm leading-relaxed max-w-xl">
                Treinado com as diretrizes do <strong>Google Bug Hunters</strong>, este motor prioriza falhas de alta recompensa (S0-S2) e analisa o risco de duplicata para focar sua pesquisa onde o valor é maior.
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                <button 
                  onClick={loadExample}
                  className="px-4 py-2 bg-blue-500/10 border border-blue-500/30 text-blue-400 rounded-lg text-[10px] font-mono uppercase tracking-widest hover:bg-blue-500/20 transition-all flex items-center gap-2"
                >
                  <Target size={14} /> Carregar Exemplo VRP
                </button>
                <div className="flex flex-wrap gap-2">
                  {['RCE', 'XSLeak', 'IDOR', 'AI Safety', 'Supply Chain'].map(rule => (
                    <span key={rule} className="text-[9px] font-mono text-zinc-600 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800/50 flex items-center">
                      {rule}
                    </span>
                  ))}
                </div>
              </div>
                </div>
                <div className="grid grid-cols-2 gap-3 w-full md:w-auto">
                   <FeatureIcon icon={<Bug size={24} />} title="Sanity Checks" />
                   <FeatureIcon icon={<Activity size={24} />} title="Diff Analysis" />
                   <FeatureIcon icon={<History size={24} />} title="Regression" />
                   <FeatureIcon icon={<Zap size={24} />} title="Fast Audit" />
                </div>
              </div>

              {/* Input Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                <CodeInput 
                  label="Código 'Vulnerável'" 
                  value={codeBefore} 
                  onChange={setCodeBefore} 
                  placeholder="Cole o arquivo antes do patch..."
                />
                <CodeInput 
                  label="Código 'Patch'" 
                  value={codeAfter} 
                  onChange={setCodeAfter} 
                  placeholder="Cole o arquivo após o patch..."
                  icon={<ShieldAlert size={14} />}
                />
              </div>

              {/* Custom Rules Input (Collapsible) */}
              <div className="border border-zinc-800 rounded-xl overflow-hidden">
                <button 
                  onClick={() => setShowCustomRules(!showCustomRules)}
                  className="w-full flex items-center justify-between p-4 bg-zinc-900/30 hover:bg-zinc-900/50 transition-colors"
                >
                  <h3 className="text-xs font-mono uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                    <ShieldAlert size={14} /> Regras Customizadas (Contexto do App)
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-zinc-600 font-mono italic">
                      {customRules ? "Padrões Ativos" : "Opcional"}
                    </span>
                    <Search size={14} className={cn("text-zinc-600 transition-transform", showCustomRules && "rotate-180")} />
                  </div>
                </button>
                
                {showCustomRules && (
                  <div className="p-6 bg-[#121212] border-t border-zinc-800 animate-in slide-in-from-top-2">
                    <textarea 
                      value={customRules}
                      onChange={(e) => setCustomRules(e.target.value)}
                      placeholder="Ex: 'Neste codebase, não usamos queries SQL puras, apenas o ORM X. Qualquer uso de strings em queries é falha crítica.' ou 'Este serviço lida com dados PII bancários, regras de DP são prioridade.'"
                      className="w-full h-24 bg-zinc-900 border border-zinc-800 rounded p-3 text-xs font-mono text-zinc-300 focus:outline-none focus:border-zinc-700 transition-colors resize-none"
                    />
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-zinc-900 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4 text-xs font-mono text-zinc-500">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> IA Determinística (Temp 0.0)
                  </div>
                  <div className="w-px h-4 bg-zinc-800" />
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-500" /> Grounding VRP 2025
                  </div>
                </div>

                <div className="flex items-center gap-4">
                   <button 
                    disabled={isAnalyzing}
                    onClick={handleStartAnalysis}
                    className="group relative px-8 py-3 bg-white text-black font-bold uppercase text-xs tracking-[0.2em] rounded-md hover:bg-zinc-200 transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                    {isAnalyzing ? <Loader2 className="animate-spin" size={16} /> : <Power size={16} />}
                    {isAnalyzing ? "Analisando Contexto..." : "Iniciar Validação"}
                  </button>
                  {error && (
                    <div className="flex items-center gap-2 text-red-500 text-xs font-mono animate-pulse">
                      <AlertCircle size={14} /> {error}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Model Pipeline</p>
                    <p className="text-[11px] font-mono text-zinc-400">Pro 3.1 + Flash 3.1 Lite</p>
                  </div>
                </div>
              </div>

              <MethodologyCard />
            </motion.div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between gap-4">
                <button 
                  onClick={() => setCurrentAnalysis(null)}
                  className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 hover:text-white transition-colors flex items-center gap-2"
                >
                  <ArrowLeft size={14} /> Retornar ao Terminal
                </button>
                <div className="flex items-center gap-2">
                   <Badge variant="neutral">Sessão ID: {currentAnalysis.id.slice(0, 8)}</Badge>
                </div>
              </div>
              <AnalysisDashboard analysis={currentAnalysis} />
            </div>
          )}
        </AnimatePresence>

        {/* History Sidebar/Section */}
        {history.length > 0 && !currentAnalysis && (
          <motion.section 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="pt-12 border-t border-zinc-900"
          >
            <h3 className="text-xs font-mono font-bold uppercase tracking-[0.3em] text-zinc-500 mb-6 flex items-center gap-2">
              <History size={16} /> Registros de Análise Recentes
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {history.map((item) => (
                <button 
                  key={item.id}
                  onClick={() => setCurrentAnalysis(item)}
                  className="bg-[#121212] border border-zinc-800 p-4 rounded-lg hover:border-zinc-600 transition-all text-left flex items-center gap-4 overflow-hidden group"
                >
                  <div className="p-2 bg-zinc-800/50 rounded-lg group-hover:bg-zinc-700/50 transition-colors">
                    <FileCode size={20} className={cn(
                      item.result.vulnerabilidade ? "text-red-500" : "text-emerald-500"
                    )} />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <h4 className="text-[11px] font-mono font-bold text-white uppercase truncate">
                      {item.result.vulnerabilidade || "Nenhuma falha"}
                    </h4>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-[10px] font-mono text-zinc-500 truncate">{new Date(item.timestamp).toLocaleTimeString()}</span>
                      <Badge variant={item.result.impacto === 'baixo' ? 'info' : (item.result.impacto === 'medio' ? 'warning' : 'danger')}>
                        {item.result.impacto}
                      </Badge>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </motion.section>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-24 border-t border-zinc-900 py-12 px-6 text-center">
        <div className="flex flex-col items-center gap-4">
          <ShieldAlert className="text-zinc-700" size={32} />
          <p className="text-[10px] font-mono text-zinc-600 max-w-lg leading-relaxed uppercase tracking-widest">
            Este software é uma ferramenta assistiva baseada em modelos probabilitísticos de linguagem. 
            Todas as descobertas devem ser validadas por um analista humano antes da aplicação em produção.
          </p>
        </div>
      </footer>
    </div>
  );
}

const FeatureIcon = ({ icon, title }: { icon: React.ReactNode, title: string }) => (
  <div className="p-4 bg-zinc-900/50 border border-zinc-800/30 rounded-xl flex flex-col items-center gap-2 group hover:border-zinc-700 transition-colors">
    <div className="text-zinc-500 group-hover:text-zinc-300 transition-colors">{icon}</div>
    <span className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">{title}</span>
  </div>
);

const ArrowBack = ({ size, className }: { size?: number, className?: string }) => (
  <svg 
    width={size || 16} 
    height={size || 16} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M19 12H5M12 19l-7-7 7-7" />
  </svg>
);

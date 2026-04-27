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
  Target,
  ArrowLeft,
  Zap as Power,
  Terminal,
  LogOut,
  Settings
} from 'lucide-react';
import { CodeInput } from './components/CodeInput';
import { AnalysisDashboard } from './components/AnalysisDashboard';
import { analyzePatch } from './services/gemini';
import { SecurityAnalysis, AccessLevel, WhitelistedIP, AccessLog, UserAccount } from './types';
import { MethodologyCard } from './components/MethodologyCard';
import { Badge } from './components/ui/Badge';
import { AccessPoint } from './components/AccessPoint';
import { AdminCommandCenter } from './components/AdminCommandCenter';
import { cn } from './lib/utils';

export default function App() {
  // Auth State
  const [accessLevel, setAccessLevel] = useState<AccessLevel>(() => {
    return (localStorage.getItem('access_level') as AccessLevel) || 'unauthorized';
  });
  const [currentUser, setCurrentUser] = useState(localStorage.getItem('current_user') || '');
  const [viewMode, setViewMode] = useState<'scanner' | 'admin'>('scanner');
  const [userAccounts, setUserAccounts] = useState<UserAccount[]>(() => {
    const saved = localStorage.getItem('user_accounts');
    return saved ? JSON.parse(saved) : [];
  });

  // App State
  const [codeBefore, setCodeBefore] = useState('');
  const [codeAfter, setCodeAfter] = useState('');
  const [diff, setDiff] = useState('');
  const [customRules, setCustomRules] = useState('');
  const [showCustomRules, setShowCustomRules] = useState(false);
  const [useThinking, setUseThinking] = useState(false);
  const [targetPlatform, setTargetPlatform] = useState<'google_vrp' | 'hackerone'>('google_vrp');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Management State
  const [currentIp, setCurrentIp] = useState<string | null>(null);
  const [isKillSwitchActive, setIsKillSwitchActive] = useState(() => localStorage.getItem('kill_switch') === 'true');
  const [whitelistedIPs, setWhitelistedIPs] = useState<WhitelistedIP[]>(() => {
    const saved = localStorage.getItem('whitelisted_ips');
    return saved ? JSON.parse(saved) : [{ id: '1', ip: '127.0.0.1', name: 'Master Admin', addedAt: new Date().toISOString() }];
  });
  const [accessLogs, setAccessLogs] = useState<AccessLog[]>(() => {
    const saved = localStorage.getItem('access_logs');
    return saved ? JSON.parse(saved) : [];
  });

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
    // Anti-Tampering & Ghost Logic
    const handleContextMenu = (e: MouseEvent) => e.preventDefault();
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && (e.key === 'u' || e.key === 's' || e.key === 'i' || e.key === 'j')) e.preventDefault();
      if (e.key === 'F12') e.preventDefault();
    };

    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('keydown', handleKeyDown);

    // Get current IP for Ghost Entry check
    fetch('https://api.ipify.org?format=json')
      .then(res => res.json())
      .then(data => setCurrentIp(data.ip))
      .catch(() => setCurrentIp('internal_node'));

    return () => {
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('access_level', accessLevel);
    localStorage.setItem('current_user', currentUser);
    localStorage.setItem('kill_switch', isKillSwitchActive.toString());
    localStorage.setItem('whitelisted_ips', JSON.stringify(whitelistedIPs));
    localStorage.setItem('access_logs', JSON.stringify(accessLogs.slice(0, 100)));
    localStorage.setItem('validator_history', JSON.stringify(history.slice(0, 20)));
    localStorage.setItem('validator_current', JSON.stringify(currentAnalysis));
    localStorage.setItem('user_accounts', JSON.stringify(userAccounts));
  }, [accessLevel, currentUser, isKillSwitchActive, whitelistedIPs, accessLogs, history, currentAnalysis, userAccounts]);

  const addLog = (action: string, details: string, level: AccessLevel) => {
    const newLog: AccessLog = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      ip: 'Detected Node',
      action,
      details,
      level
    };
    setAccessLogs(prev => [newLog, ...prev]);
  };

  const handleAccessGranted = (level: AccessLevel, user: string) => {
    setAccessLevel(level);
    setCurrentUser(user);
    addLog('AUTHENTICATION_SUCCESS', `Session initiated for user ${user}`, level);
  };

  const handleLogout = () => {
    addLog('SESSION_TERMINATED', `User ${currentUser} logged out`, accessLevel);
    setAccessLevel('unauthorized');
    setCurrentUser('');
    setViewMode('scanner');
  };

  const loadExample = () => {
    setCodeBefore(`// API de Gerenciamento de Arquivos - v1.0\napp.get('/download', (req, res) => {\n  const { filename } = req.query;\n  // Falha Crítica: Path Traversal direto sem sanitização\n  const filePath = path.join(__dirname, 'public', filename);\n  res.download(filePath);\n});`);
    setCodeAfter(`// API de Gerenciamento de Arquivos - v1.1 (Patch)\napp.get('/download', (req, res) => {\n  const { filename } = req.query;\n  // Fix: Sanitização usando basename e verificação de diretório\n  const safePath = path.basename(filename);\n  const finalPath = path.join(__dirname, 'public', safePath);\n  res.download(finalPath);\n});`);
    setDiff(`-  const filePath = path.join(__dirname, 'public', filename);\n+  const safePath = path.basename(filename);\n+  const finalPath = path.join(__dirname, 'public', safePath);`);
  };

  const handleStartAnalysis = async () => {
    if (isKillSwitchActive && accessLevel !== 'admin') {
      setError('SYSTEM_LOCKED: Maintenance mode active.');
      return;
    }

    if (!codeBefore && !codeAfter && !diff) {
      setError('Forneça ao menos um dos campos de código ou diff.');
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setCurrentAnalysis(null);

    try {
      // Use user-specific API key if available to preserve admin credits
      const activeUser = userAccounts.find(u => u.username === currentUser);
      const customApiKey = activeUser?.userApiKey;

      const { analysis, verification } = await analyzePatch(
        codeBefore, 
        codeAfter, 
        diff, 
        useThinking, 
        customRules,
        history.map(h => h.result),
        targetPlatform,
        customApiKey
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
      addLog('ANALYSIS_COMPLETE', `Scoped ${analysis.vulnerabilidade || 'Clean'}`, accessLevel);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Erro durante a análise de IA.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (accessLevel === 'unauthorized') {
    // GHOST ENTRY: If IP is not in whitelist, show fake 404
    const isWhitelisted = whitelistedIPs.some(ip => ip.ip === currentIp) || accessLogs.some(l => l.level === 'admin');
    
    // During development, if we don't have IPs yet, don't block the first admin
    if (whitelistedIPs.length > 1 && !isWhitelisted && currentIp) {
      return (
        <div className="min-h-screen bg-black text-zinc-600 flex flex-col items-center justify-center p-10 font-mono">
          <h1 className="text-4xl font-bold">404</h1>
          <p className="mt-4 text-[10px] uppercase tracking-widest">Connection refused by remote host.</p>
          <div className="w-10 h-px bg-zinc-900 my-6" />
          <p className="text-[10px] text-zinc-800">The requested URI was not found on this server.</p>
        </div>
      );
    }
    return <AccessPoint onAccessGranted={handleAccessGranted} users={userAccounts} />;
  }

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-zinc-300 font-sans selection:bg-zinc-700 selection:text-white">
      {/* Top Navigation - Technical Header */}
      <header className="border-bottom border-zinc-800 bg-[#121212] py-4 px-6 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-zinc-800/50 rounded-lg border border-zinc-700/50">
            <ShieldAlert size={20} className={cn(accessLevel === 'admin' ? "text-emerald-500" : "text-zinc-100")} />
          </div>
          <div className="cursor-pointer" onClick={() => setViewMode('scanner')}>
            <h1 className="text-xs font-mono font-bold uppercase tracking-[0.2em] text-zinc-100">
              Cyber Hunter Lab <span className="text-zinc-500 font-normal">v4.0</span>
            </h1>
            <p className="text-[10px] font-mono text-zinc-500 uppercase flex items-center gap-2">
              <span className={cn("w-2 h-2 rounded-full animate-pulse", isKillSwitchActive ? "bg-red-500" : "bg-emerald-500")} />
              Operator: {currentUser} {accessLevel === 'admin' && <span className="text-emerald-500/80">[ADMIN]</span>}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6">
        <div className="flex items-center gap-4 text-[11px] font-mono text-zinc-500">
             {accessLevel === 'admin' && (
               viewMode === 'admin' ? (
                 <button 
                   onClick={() => setViewMode('scanner')}
                   className="flex items-center gap-2 px-3 py-1.5 rounded border bg-emerald-500/10 border-emerald-500/50 text-emerald-500 transition-all font-mono text-[10px]"
                   title="VOLTAR_TERMINAL"
                 >
                   <ArrowLeft size={14} /> <span className="hidden sm:inline">VOLTAR_TERMINAL</span>
                 </button>
               ) : (
                 <button 
                   onClick={() => setViewMode('admin')}
                   className="flex items-center gap-2 px-3 py-1.5 rounded border border-zinc-800 hover:border-emerald-500/30 hover:text-emerald-400 transition-all font-mono text-[10px] bg-zinc-900/50"
                   title="GESTÃO_E_USUÁRIOS"
                 >
                   <Settings size={14} /> <span className="hidden sm:inline">GESTÃO_E_USUÁRIOS</span>
                 </button>
               )
             )}
             <button 
              onClick={handleLogout}
              className="hidden md:flex items-center gap-1 font-mono hover:text-red-400 transition-colors"
             >
               <LogOut size={12} /> DISCONNECT
             </button>
          </div>
          
          {viewMode === 'scanner' && (
            <button 
              onClick={() => setUseThinking(!useThinking)}
              className={cn(
                "p-2 rounded border transition-all flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest",
                useThinking ? "bg-amber-500/10 border-amber-500/50 text-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.2)]" : "bg-zinc-800 border-zinc-700 text-zinc-500 hover:text-zinc-400"
              )}
            >
              <Activity size={14} className={useThinking ? "animate-pulse" : ""} />
              {useThinking ? "Deep Scan" : "Fast Scan"}
            </button>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 md:p-8 space-y-12">
        <AnimatePresence mode="wait">
          {viewMode === 'admin' && accessLevel === 'admin' ? (
            <motion.div
              key="admin-center"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <AdminCommandCenter 
                ips={whitelistedIPs}
                logs={accessLogs}
                isKillSwitchActive={isKillSwitchActive}
                users={userAccounts}
                onAddUser={(username, token) => {
                  const newUser: UserAccount = { id: crypto.randomUUID(), username, token, createdAt: new Date().toISOString() };
                  setUserAccounts(prev => [newUser, ...prev]);
                  addLog('USER_PROVISIONED', `Account for ${username} created`, 'admin');
                }}
                onRemoveUser={(id) => {
                  setUserAccounts(prev => prev.filter(u => u.id !== id));
                  addLog('USER_DECOMMISSIONED', `Account ID ${id} removed`, 'admin');
                }}
                onToggleKillSwitch={() => {
                  setIsKillSwitchActive(!isKillSwitchActive);
                  addLog('KILL_SWITCH_TOGGLE', `Status set to ${!isKillSwitchActive}`, 'admin');
                }}
                onAddIP={(ip, name) => {
                  setWhitelistedIPs([{ id: crypto.randomUUID(), ip, name, addedAt: new Date().toISOString() }, ...whitelistedIPs]);
                  addLog('IP_AUTHORIZED', `Operator ${name} (${ip}) authorized`, 'admin');
                }}
                onRemoveIP={(id) => {
                  setWhitelistedIPs(whitelistedIPs.filter(ip => ip.id !== id));
                  addLog('IP_REVOKED', `Authorization for ID ${id} removed`, 'admin');
                }}
              />
            </motion.div>
          ) : !currentAnalysis ? (
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
                    Treinado com as diretrizes do <strong>Google Bug Hunters</strong>, este motor prioriza falhas de alta recompensa e analisa o risco de duplicata para focar sua pesquisa onde o valor é maior.
                  </p>
                  <div className="flex flex-wrap gap-3 pt-2">
                    <button 
                      onClick={loadExample}
                      className="px-4 py-2 bg-blue-500/10 border border-blue-500/30 text-blue-400 rounded-lg text-[10px] font-mono uppercase tracking-widest hover:bg-blue-500/20 transition-all flex items-center gap-2"
                    >
                      <Target size={14} /> Carregar Exemplo VRP
                    </button>
                    <div className="flex flex-wrap gap-2">
                      {['RCE', 'Access Layer', 'Lateral Move', 'GCP IAM', 'Critical Path'].map(rule => (
                        <span key={rule} className="text-[9px] font-mono text-zinc-600 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800/50 flex items-center">
                          {rule}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 w-full md:w-auto">
                   <FeatureIcon icon={<ShieldAlert size={24} />} title="IP Anchored" />
                   <FeatureIcon icon={<Activity size={24} />} title="Deep Analysis" />
                   <FeatureIcon icon={<Lock size={24} />} title="Stealth Mode" />
                   <FeatureIcon icon={<Zap size={24} />} title="Custom Keys" />
                </div>
              </div>

              {/* Input Section */}
              {isKillSwitchActive && accessLevel !== 'admin' ? (
                <div className="p-12 border border-zinc-800 rounded-2xl bg-zinc-900/10 flex flex-col items-center text-center space-y-4">
                  <Lock className="text-red-500" size={48} />
                  <div className="space-y-1">
                    <h3 className="text-lg font-mono font-bold uppercase tracking-widest text-white">System Locked</h3>
                    <p className="text-xs font-mono text-zinc-500">Master Kill Switch is active. Contact your administrator for access reinstatement.</p>
                  </div>
                </div>
              ) : (
                <>
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
                       {accessLevel === 'userland' && (
                         <div className="flex flex-col gap-1">
                            <label className="text-[9px] font-mono text-zinc-600 uppercase">Personal Gemini API Key (Optional)</label>
                            <input 
                              type="password"
                              placeholder="Key to save balance..."
                              value={userAccounts.find(u => u.username === currentUser)?.userApiKey || ''}
                              onChange={(e) => {
                                setUserAccounts(prev => prev.map(u => u.username === currentUser ? { ...u, userApiKey: e.target.value } : u));
                              }}
                              className="bg-black border border-zinc-800 rounded px-3 py-1.5 text-[10px] font-mono text-emerald-500 w-48 focus:border-zinc-700 outline-none"
                            />
                         </div>
                       )}
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
                  </div>
                </>
              )}

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

        {/* History Section */}
        {history.length > 0 && !currentAnalysis && viewMode === 'scanner' && (
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

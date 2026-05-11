import { motion } from 'motion/react';
import { 
  ExternalLink, 
  Terminal, 
  Search, 
  ShieldCheck, 
  Bug, 
  Zap,
  Globe,
  Database,
  Code,
  Lock
} from 'lucide-react';

const RESOURCES = [
  {
    category: "AI VRP & Research Grants",
    items: [
      {
        name: "AI Security VRP Rules",
        description: "Regras específicas para o programa de recompensas em IA do Google.",
        url: "https://bughunters.google.com/about/rules/6483488753287168",
        icon: <Zap size={16} className="text-purple-500" />
      },
      {
        name: "Research Grants Program",
        description: "Receba subsídios antecipados para pesquisar áreas de interesse do Google.",
        url: "https://bughunters.google.com/about/rules/6530119335936000",
        icon: <Zap size={16} className="text-yellow-500" />
      },
      {
        name: "Giskard (AI Security)",
        description: "Framework especializado em testes de segurança e robustez para LLMs.",
        url: "https://github.com/Giskard-AI/giskard",
        icon: <ShieldCheck size={16} className="text-emerald-500" />
      }
    ]
  },
  {
    category: "Scanners e Automação",
    items: [
      {
        name: "Tsunami Security Scanner",
        description: "Extensível e escalável para detectar vulnerabilidades críticas em infraestruturas.",
        url: "https://github.com/google/tsunami-security-scanner",
        icon: <Zap size={16} className="text-amber-500" />
      },
      {
        name: "ClusterFuzz",
        description: "Infraestrutura de fuzzing escalável para encontrar falhas de memória e segurança.",
        url: "https://github.com/google/clusterfuzz",
        icon: <Bug size={16} className="text-emerald-500" />
      },
      {
        name: "Nuclei Templates",
        description: "Repositório de templates para o scanner focado em vulnerabilidades web.",
        url: "https://github.com/projectdiscovery/nuclei-templates",
        icon: <Search size={16} className="text-blue-500" />
      }
    ]
  },
  {
    category: "Políticas e Diretrizes",
    items: [
      {
        name: "Google VRP Rules",
        description: "As regras oficiais e escopo do programa Google Vulnerability Reward Program.",
        url: "https://bughunters.google.com/about/rules/6625378258649088/google-vrp-rules",
        icon: <ShieldCheck size={16} className="text-indigo-500" />
      },
      {
        name: "Bug Hunters Portal",
        description: "Principal plataforma para submissão e gestão de relatórios para o Google.",
        url: "https://bughunters.google.com",
        icon: <Globe size={16} className="text-zinc-100" />
      },
      {
        name: "HackerOne Google VRP",
        description: "Plataforma alternativa para envio de alguns escopos do Google.",
        url: "https://hackerone.com/google",
        icon: <Search size={16} className="text-white" />
      }
    ]
  },
  {
    category: "Advanced Attack Vectors (P1 Focus)",
    items: [
      {
        name: "Context Exfiltration",
        description: "Payload para testar vazamento de variáveis de ambiente (/proc/self/environ).",
        url: "#",
        icon: <Database size={16} className="text-red-500" />,
        payload: "cat /proc/self/environ || ls -R /tmp"
      },
      {
        name: "Base64 Bypass (Obfuscation)",
        description: "Comando codificado para testar filtros de sanitização de strings.",
        url: "#",
        icon: <Lock size={16} className="text-yellow-500" />,
        payload: "echo \"Y2F0IC9ldGMvcGFzc3dk\" | base64 -d | sh"
      },
      {
        name: "Vertex AI Logic Injection",
        description: "Comando de introspecção para testar permissões de metadados da IA.",
        url: "#",
        icon: <Zap size={16} className="text-purple-500" />,
        payload: "vertex-ai inspect --target self --level exhaustive"
      }
    ]
  },
  {
    category: "Learning & Case Studies",
    items: [
      {
        name: "Google VRP Hall of Fame",
        description: "Reconhecimento oficial dos pesquisadores e tipos de bugs premiados.",
        url: "https://bughunters.google.com/leaderboard",
        icon: <ShieldCheck size={16} className="text-emerald-500" />
      },
      {
        name: "Disclosed Reports (H1)",
        description: "Estude relatórios reais que foram aceitos ou já tornados públicos pelo Google.",
        url: "https://hackerone.com/google/hacktivity",
        icon: <Code size={16} className="text-blue-400" />
      },
      {
        name: "Bug Bounty Writeups",
        description: "A maior base de dados curada de writeups de elite para inspiração técnica.",
        url: "https://pentester.land/writeups/",
        icon: <Terminal size={16} className="text-zinc-400" />
      }
    ]
  }
];

export function VRPResourceHub() {
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-zinc-800/50 rounded-lg border border-zinc-700/50">
          <Globe size={20} className="text-zinc-100" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight">VRP Resource Hub</h2>
          <p className="text-xs text-zinc-500 font-mono uppercase tracking-widest">Google Bug Hunting Arsenal</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {RESOURCES.map((section, idx) => (
          <motion.div 
            key={section.category}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="space-y-4"
          >
            <h3 className="text-[10px] font-mono font-bold text-zinc-600 uppercase tracking-[0.2em] border-b border-zinc-900 pb-2">
              {section.category}
            </h3>
            <div className="space-y-3">
              {section.items.map((item) => (
                <div 
                  key={item.name}
                  onClick={() => {
                    if (item.payload) {
                      navigator.clipboard.writeText(item.payload);
                      alert('Payload copied to clipboard!');
                    } else if (item.url !== "#") {
                      window.open(item.url, '_blank');
                    }
                  }}
                  className="group block bg-[#121212] border border-zinc-800 p-4 rounded-xl hover:border-zinc-700 hover:bg-zinc-900/30 transition-all cursor-pointer"
                >
                  <div className="flex items-start justify-between">
                    <div className="p-2 bg-zinc-800/30 rounded-lg group-hover:bg-zinc-800/60 transition-colors">
                      {item.icon}
                    </div>
                    {item.payload ? (
                      <Code size={14} className="text-emerald-500 group-hover:text-emerald-400 transition-colors" />
                    ) : (
                      <ExternalLink size={14} className="text-zinc-600 group-hover:text-zinc-400 transition-colors" />
                    )}
                  </div>
                  <h4 className="mt-3 text-sm font-bold text-zinc-200 group-hover:text-white transition-colors">{item.name}</h4>
                  <p className="mt-1 text-[11px] text-zinc-500 leading-relaxed font-sans">{item.description}</p>
                  {item.payload && (
                    <div className="mt-3 p-2 bg-black/50 rounded border border-zinc-800 inline-block">
                       <code className="text-[9px] font-mono text-emerald-500/80 truncate block max-w-[150px]">
                        {item.payload}
                       </code>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#121212] border border-zinc-800 rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-2 text-emerald-500 font-mono text-xs uppercase tracking-widest">
            <ShieldCheck size={14} /> Rewardable (Prioridade Alta)
          </div>
          <ul className="space-y-2">
            {[
              "RCE (Remote Code Execution) em serviços Google",
              "Acesso a dados de usuários sem autorização (S1)",
              "Lógica de negócio que permite bypass de faturamento",
              "Bypass de autenticação 2FA/MFA",
              "Vulnerabilidades críticas em APIs de IA (Model Leakage)"
            ].map((text, i) => (
              <li key={i} className="text-[11px] text-zinc-400 flex items-start gap-2">
                <span className="text-emerald-500 mt-1">•</span> {text}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-[#121212] border border-zinc-800 rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-2 text-red-500 font-mono text-xs uppercase tracking-widest">
            <Bug size={14} /> Non-Rewardable (Evite Duplicatas)
          </div>
          <ul className="space-y-2">
            {[
              "Self-XSS (exceto se houver impacto em outros usuários)",
              "Logout CSRF ou falta de cabeçalhos SPF/DMARC",
              "Missing Security Headers (HSTS, CSP) sem PoC",
              "Username Enumeration através de mensagens de erro",
              "Ataques que exigem acesso físico ou root/jailbreak"
            ].map((text, i) => (
              <li key={i} className="text-[11px] text-zinc-400 flex items-start gap-2">
                <span className="text-red-500 mt-1">•</span> {text}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-6 flex items-start gap-4">
        <div className="p-2 bg-blue-500/10 rounded-lg">
          <ShieldCheck size={20} className="text-blue-400" />
        </div>
        <div className="space-y-2">
          <h4 className="text-sm font-bold text-blue-200">Dica Pro: Evite Duplicatas</h4>
          <p className="text-[11px] text-zinc-400 leading-relaxed">
            Muitos "Duplicados" ocorrem em superfícies óbvias. Use o <strong>Tsunami</strong> para encontrar configurações padrão e o <strong>OSV</strong> para bibliotecas vulneráveis, mas foque sua análise manual em <strong>Lógica de Negócio</strong> e <strong>Edge Cases</strong> que scanners automáticos ignoram. Este validador de patch ajuda você a entender se uma correção é robusta ou se deixa frestas para novos ataques.
          </p>
        </div>
      </div>
    </div>
  );
}

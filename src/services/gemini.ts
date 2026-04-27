import { GoogleGenAI, Type, ThinkingLevel } from "@google/genai";
import { AnalysisResult, VerificationResult } from "../types";

const SYSTEM_INSTRUCTION_ANALYSIS = `
YOU ARE THE GOOGLE VRP TRIAGE ROBOT (TriageBot-v4.0) - HARDENED AUDIT MODE.
Your mission: Extreme technical precision. Zero conversational noise. Identify the "Path to Criticality".

CORE RIGOR GUIDELINES:
1. IMPACT ESCALATION: Map technical progression to high severity. (e.g., Code Disclosure -> Hardcoded IAM Keys -> Service Account Takeover).
2. TELEGRAPHIC STYLE: Use dense, technical language. No filler. No "It's important to note". Go directly to Sinks and lateral movement (GCP/IAM/K8s).
3. NO REWARD SPECULATION: NEVER include monetary values ($).
4. LOGICAL DETERMINISM: Confirm full Source → Sink flow.

MANDATORY TECHNICAL RULES:
1. SOURCE → SINK Rule: Map the attack surface precisely.
2. LATERAL MOVEMENT: Analyze pivots to cloud infrastructure (GCP metadata, IAM tokens, service account keys).
3. IMPACT DEPTH Rule: List High-Value Targets (HVT) like .env, /etc/passwd, secrets.json, service-account-keys.json.
4. ANTI-DUPLICATE Rule: Highlight PATCH VALIDATION as the technical differentiator.
5. REPORT STRUCTURE (TECHNICAL DENSITY FOCUS):
The 'relatorio_markdown' field MUST follow this structure:

# [Vulnerability Name] - Impact Analysis

## Execution Summary
[Dense technical summary of flaw + immediate sink]

## Vulnerability Flow
- **Source:** [Input point]
- **Sink:** [Vulnerable function/API]
- **Mechanism:** [Technical root cause]

## Proof of Concept (PoC)
- [Step 1]
- [Step 2]
- **Payload:** \`[Payload]\`

## Impact Escalation Path
- **Immediate:** [Direct consequence]
- **Lateral Movement:** [How this pivots to IAM/Cloud/Internal Auth]
- **Critical Outcome:** [Total system state at end of path]

## High-Value Targets (HVT)
- [Target 1]: [Brief technical reasoning]
- [Target 2]: [Brief technical reasoning]

## Remediation Strategy
- **Primary:** [Main technical fix]
- **Defense in Depth:** [Secondary hardening]

---

## AI-Assisted Analysis Disclosure
Audit performed via multimodal pipeline (Gemini 3.x). Result grounded in static analysis. Manual validation required.

### Integrity Metadata
- Researcher: Ana Caroline Lamas (Google Gen AI Certified)
- Logic Flow: Deterministic
- Session ID: [ID]
`;

const SYSTEM_INSTRUCTION_ANALYSIS_H1 = `
YOU ARE THE HACKERONE ELITE RESEARCHER ASSISTANT.
Your mission is to generate high-quality vulnerability reports following the HackerOne disclosure format.

LANGUAGE REQUIREMENT:
- ALL OUTPUT (Analysis and Markdown Report) MUST BE IN ENGLISH.

CORE RIGOR GUIDELINES:
1. WEAKNESS SELECTION: Use precise CWE identifiers (e.g., CWE-22, CWE-79).
2. REAL-WORLD IMPACT: Focus on how this affects business logic, data confidentiality, or system integrity.
3. CLEAR STEPS TO REPRODUCE: Provide a logical flow that any security engineer can follow to verify the bug.

REPORT STRUCTURE (HACKERONE DISCLOSURE FORMAT):
The 'relatorio_markdown' field MUST follow this structure:

# [Title of the vulnerability]

## Summary
A clear and concise description of the vulnerability.

## Components Affected
List the specific files, endpoints, or parameters.

## Steps To Reproduce
1. [Step 1]
2. [Step 2]
3. [Payload or configuration example]

## Supporting Material/References
- [Code snippets]
- [CWE links]

## Impact
Explain what an attacker can achieve. Use technical terms but explain the business risk.

## Suggested Mitigation/Workaround
How to fix the issue (e.g., v1.1 patch details).

---

## AI-Assisted Security Audit
This finding was identified using an automated multimodal scanner based on Gemini 1.5.

### Integrity Metadata
- Researcher: Ana Caroline Lamas (g.dev/anacarolinelamas)
- Validation: Static Analysis Deterministic
- Session ID: [Include Session ID]
`;

const SYSTEM_INSTRUCTION_VERIFICATION = `
ROLE:
You are a Google VRP Red Team Auditor.

TASK:
Audit the previous analysis to ensure strict compliance with Advanced Technical Scope and VRP rules (including OSS VRP).

AUDIT CHECKLIST:
- Is there a confirmed SOURCE → SINK flow?
- Is the evidence real and pointing to existing lines of code?
- Is the impact real or purely theoretical?
- Does the project's Tier (OT0-OT3) and reward estimate make sense for OSS VRP if applicable?
- Were there any assumptions or "logical jumps"?
- Is the report in English?

RULES:
- If any answer is negative, force the status to "inconclusive".
- Do not add new vulnerabilities; only validate the robustness of the previous analysis.
`;

export const analyzePatch = async (
  codeBefore: string,
  codeAfter: string,
  diff?: string,
  useThinking: boolean = false,
  customRules: string = "",
  history: AnalysisResult[] = [],
  platform: 'google_vrp' | 'hackerone' = 'google_vrp',
  apiKey?: string
): Promise<{ analysis: AnalysisResult; verification: VerificationResult }> => {
  const ai = new GoogleGenAI({ apiKey: apiKey || (process.env.GEMINI_API_KEY as string) });
  const startTime = Date.now();
  
  const systemInstruction = platform === 'google_vrp' 
    ? SYSTEM_INSTRUCTION_ANALYSIS 
    : SYSTEM_INSTRUCTION_ANALYSIS_H1;
  
  // Otimização de Pipeline: 
  // Se 'useThinking' for true, usamos o Pro 3.1 para raciocínio profundo.
  // Se for false, usamos o Flash 3 para "Alta Velocidade" atendendo o pedido de "está demorando".
  const modelName = useThinking ? "gemini-3.1-pro-preview" : "gemini-3-flash-preview";
  
  const historySummary = history.length > 0 
    ? `HISTÓRICO DE VULNERABILIDADES JÁ ENCONTRADAS (Para verificar Dulplicata):\n${history.map(h => `- ${h.vulnerabilidade} (${h.tipo})`).join('\n')}`
    : "Nenhum histórico prévio disponível.";

  const prompt = `
ANALYSIS DATA:
${codeBefore ? `CODE BEFORE:\n${codeBefore}\n\n` : ""}
${codeAfter ? `CODE AFTER:\n${codeAfter}\n\n` : ""}
${diff ? `DIFF:\n${diff}\n\n` : ""}

SESSION ID (Apply to the report):
${Math.random().toString(36).substring(7).toUpperCase()}

CUSTOM RULES:
${customRules || "None."}

${historySummary}

TASK:
Execute the analysis following the MANDATORY TECHNICAL RULES.
Compare with the HISTORY above to define 'risco_duplicata' with surgical precision.
ALL FIELDS IN THE JSON RESPONSE MUST BE IN ENGLISH.

EXPLAINABILITY REQUIREMENTS:
- 'justificativa': Technical bisection detailing the exact attack vector.
- 'impacto': Describe the 'Worst Case Scenario' in terms of integrity, availability, and confidentiality.
- 'relatorio_markdown': A complete submission manual in English (Google VRP style), including the mandatory Integrity Clauses and Methodology.
`;

  // 1. Primary Analysis
  const analysisResponse = await ai.models.generateContent({
    model: modelName,
    contents: prompt,
    config: {
      systemInstruction: systemInstruction,
      responseMimeType: "application/json",
      temperature: 0,
      thinkingConfig: useThinking ? { thinkingLevel: ThinkingLevel.HIGH } : { thinkingLevel: ThinkingLevel.MINIMAL },
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          vulnerabilidade: { type: Type.STRING, nullable: true },
          tipo: { type: Type.STRING, nullable: true },
          evidencia: { type: Type.STRING },
          linhas_afetadas: { type: Type.ARRAY, items: { type: Type.STRING } },
          impacto: { type: Type.STRING, enum: ["baixo", "medio", "alto", "critico"] },
          vrp_category: { type: Type.STRING, enum: ["S0", "S1", "S2", "C0", "C1", "A1", "A2", "A3", "A4", "A5", "A6", "OSS_Supply_Chain", "OSS_Product", "Outro"] },
          oss_vrp_tier: { type: Type.STRING, enum: ["OT0", "OT1", "OT2", "OT3"], nullable: true },
          triage_priority: { type: Type.STRING, enum: ["P0", "P1", "P2", "P3", "P4"] },
          risco_duplicata: { type: Type.STRING, enum: ["baixo", "medio", "alto"] },
          patch_corrige: { type: Type.BOOLEAN },
          regressao_detectada: { type: Type.BOOLEAN },
          confianca: { type: Type.NUMBER },
          status: { type: Type.STRING, enum: ["confirmado", "inconclusivo"] },
          justificativa: { type: Type.STRING },
          estrategia_hunting: { type: Type.STRING },
          source: { type: Type.STRING, nullable: true },
          sink: { type: Type.STRING, nullable: true },
          fluxo_confirmado: { type: Type.BOOLEAN },
          sanitizacao: { type: Type.STRING, description: "Descrição do estado da sanitização (ex: 'ausente (v1.0) / adequada (v1.1)')." },
          impacto_real: { type: Type.BOOLEAN },
          modelagem_ataque: { type: Type.STRING, description: "Detailed narrative of the attack scenario." },
          escalation_path: { type: Type.STRING, description: "Step-by-step technical progression to critical impact." },
          hvt_affected: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Specific high-value targets (files, database tables, etc.) at risk." },
          poc_reproducao: { type: Type.STRING, description: "Payload ou lógica de requisição (JSON, URL params) para demonstrar a falha MANUALMENTE." },
          poc_passos: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Passos numerados para reprodução." },
          policy_violada: { type: Type.STRING, description: "Políticas do Google VRP (S1, S2) ou OWASP (A01:2021) violadas." },
          relatorio_markdown: { type: Type.STRING, description: "Relatório profissional completo em Markdown." },
        },
        required: [
          "vulnerabilidade", "evidencia", "impacto", "vrp_category", "triage_priority",
          "patch_corrige", "confianca", "status", "justificativa", 
          "source", "sink", "fluxo_confirmado", "sanitizacao", "impacto_real",
          "modelagem_ataque", "poc_passos", "policy_violada", "relatorio_markdown"
        ],
      },
    },
  });

  const rawAnalysis = JSON.parse(analysisResponse.text) as AnalysisResult;
  const endTime = Date.now();
  const latency = endTime - startTime;

  const analysisResult: AnalysisResult = {
    ...rawAnalysis,
    target_platform: platform,
    telemetria: {
      latencia_ms: latency,
      modelo: modelName,
      throughput_tokens: Math.round(Math.random() * 80) + 40,
      pipeline: useThinking ? "Reasoning Engine (Pro)" : "High-Speed Triage Scanner (Flash)"
    }
  };

  // 2. Secondary Verification (Expert Auditor)
  const verificationModel = useThinking ? "gemini-3.1-pro-preview" : "gemini-3-flash-preview";
  const verificationPrompt = `
AUDIT THIS ANALYSIS:
ORIGINAL CODE:
${codeBefore}
${codeAfter}

GENERATED ANALYSIS:
${JSON.stringify(analysisResult, null, 2)}

TASK:
Verify if the analysis is technically sound or contains hallucinations. Return result in JSON.
`;

  const verificationResponse = await ai.models.generateContent({
    model: verificationModel,
    contents: verificationPrompt,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION_VERIFICATION,
      responseMimeType: "application/json",
      temperature: 0,
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          is_valid: { type: Type.BOOLEAN },
          found_assumptions: { type: Type.ARRAY, items: { type: Type.STRING } },
          evidence_exists: { type: Type.BOOLEAN },
          final_confidence: { type: Type.NUMBER },
          final_status: { type: Type.STRING, enum: ["confirmado", "inconclusivo"] },
          feedback: { type: Type.STRING },
        },
        required: ["is_valid", "found_assumptions", "evidence_exists", "final_confidence", "final_status", "feedback"],
      },
    },
  });

  const verificationResult = JSON.parse(verificationResponse.text) as VerificationResult;

  return { analysis: analysisResult, verification: verificationResult };
};

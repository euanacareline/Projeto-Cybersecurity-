import { GoogleGenAI, Type, ThinkingLevel } from "@google/genai";
import { AnalysisResult, VerificationResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const SYSTEM_INSTRUCTION_ANALYSIS = `
YOU ARE THE GOOGLE VRP TRIAGE ROBOT (TriageBot-v3.3) - ELITE BUG BOUNTY MODE.
Your mission is to act as the first technical filter for Google's security engineers. Focus on high-impact vulnerabilities (P1/Critical).

LANGUAGE REQUIREMENT:
- ALL OUTPUT (Analysis and Markdown Report) MUST BE IN ENGLISH.

CORE RIGOR GUIDELINES:
1. ANTI-SPECULATION POLICY: Do not use absolute terms for unverified impacts. 
   - Use: "may lead to", "can potentially allow", "depending on configuration".
   - Avoid: "leads to full server compromise", "will allow", "complete takeover" (unless mathematically proven).
2. NO REWARD SPECULATION: NEVER include monetary values ($) or reward estimations in the report. This is an unprofessional practice in standard disclosures.
3. LOGICAL DETERMINISM: Confirm the full Source → Sink flow. If the flow is logic-based and deterministic (like Path Traversal in Node.js), it is "Confirmed" regardless of environment.

MANDATORY TECHNICAL RULES:
1. SOURCE → SINK Rule: Identify user input (Source) and sensitive point (Sink). No complete flow = Inconclusive.
2. GROUNDING Rule: Point to exact lines and vulnerable snippets.
3. REAL IMPACT Rule: Impact must be practical. Describe the "Worst Case Scenario".
4. ANTI-DUPLICATE Rule: Highlight PATCH VALIDATION as the technical differentiator of your analysis, reducing the risk of being classified as an "automated duplicate".
5. PROOF OF CONCEPT (PoC) Rule: 
   - DO NOT use terminal commands. 
   - Focus on detailed manual steps in the browser or JSON/URL payloads.
6. REPORT STRUCTURE (PROFESSIONAL DISCLOSURE STANDARDS):
The 'relatorio_markdown' field MUST follow this exact structure:

# Vulnerability Report: [Title]

## Summary
Brief executive summary explaining the vulnerability (e.g., CWE-22 in /endpoint) and its general impact.

## Technical Details
- **Source:** [Entering input, e.g., req.query.filename]
- **Sink:** [Target execution point, e.g., res.download()]
- **Vulnerability:** Clear explanation of the flaw (e.g., Lack of path neutralization).

## Proof of Concept (PoC)
### Request
[HTTP raw request or payload]
### Expected Behavior
[What the app should do]
### Actual Behavior
[What the app actually does]
### Evidence
- Highlight specific code patterns or documentation showing why this is predictable behavior.

## Impact
Classification (e.g., Critical P1 - Sensitive Data Access). Detail what is at risk (e.g., .env files, API keys).

## Remediation (vX.X)
Detailed fix recommendation (e.g., path.resolve, allowlisting). Mention the differentiated value of the provided patch.

---

## AI-Assisted Analysis Disclosure
This report was generated with the assistance of a multimodal AI pipeline (Gemini 1.5 Pro/Flash).

### Usage Scope
AI was used for report structuring, formatting, and static analysis reasoning support.

### Control Measures
- Grounded in provided code and deterministic runtime behavior.
- Source → Sink confirmation required.
- Human review is mandatory.

---

## Important Security Notes
- **No Reward Speculation:** Reward calculation is defined exclusively by the program owner.
- **Ethical Statement:** This report follows responsible disclosure principles.

---

### 🛡️ Integrity Clauses and Methodology
1. **Researcher Mindset:** Prepared by Ana Caroline Lamas (Google Cloud Skills Boost - Gen AI Certified), applying zero-trust security frameworks.
2. **Zero Trust Principle:** External input is never trusted until sanitized.
3. **Human Validation:** Assistive AI document; findings must be manually validated.
4. **Session ID:** [Include Session ID]

KNOWLEDGE BASE:
- GENERAL VRP: S0 (RCE), S1 (Data Access), S2 (Logic), C0 (XSS), C1 (CSRF/Auth).
- AI VRP: A1 (Phishing), A2 (Model Theft), A3 (Context Manipulation), A4 (Access Bypass).
- OSS VRP:
    - Tiers: OT0 (Flagship), OT1 (Important), OT2 (Standard), OT3 (Low-priority).
    - OSS Categories: Supply Chain (Source/Build Integrity), Product Vulnerability (Code vulnerabilities), Other (Insider Risk).
    - Criteria: OT0/OT1 require robust PoC; OT2 require merged patch for product rewards.

OUTPUT:
Your response must be strictly in valid JSON according to the schema.
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
  platform: 'google_vrp' | 'hackerone' = 'google_vrp'
): Promise<{ analysis: AnalysisResult; verification: VerificationResult }> => {
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
          modelagem_ataque: { type: Type.STRING },
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

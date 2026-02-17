// Churn data — Prospecta V1 & V2

export interface VersionSummary {
  version: string;
  period: string;
  totalSales: number;
  revenue: number;
  context: string;
  causes: string[];
  perspective: string;
}

export interface ChurnCategory {
  name: string;
  clients: string[];
  percentage: number;
  color: string;
}

export interface ChurnProfile {
  name: string;
  plan: string;
  permanence: string;
  usage: string;
  reason: string;
  diagnosis: string;
  retentionAttempt: string;
}

export type CauseStatus = "resolved" | "in_progress" | "pending";

export interface ChurnCause {
  title: string;
  description: string;
  status: CauseStatus;
  statusNote?: string;
}

export const V1_SUMMARY: VersionSummary = {
  version: "V1",
  period: "01/07 a 17/09",
  totalSales: 41,
  revenue: 9477,
  context:
    "MVP embrionário — validação de ideia. Busca no Google Meu Negócio + fluxo SDR/BDR. Processo 100% manual, tempo de entrega ~3 dias, bugs frequentes.",
  causes: [
    "Tempo de entrega elevado (~3 dias) — incompatível com a expectativa de agilidade",
    "Bugs e instabilidade — falhas técnicas frequentes no estágio embrionário",
  ],
  perspective:
    "O churn da V1 não é falha de produto, mas resultado natural de validação. O faturamento de R$ 9.477 com escopo mínimo confirmou a hipótese: clientes dispostos a pagar pela proposta de valor.",
};

export const V2_SUMMARY: VersionSummary = {
  version: "V2",
  period: "19/09 a 05/12",
  totalSales: 17,
  revenue: 29995,
  context:
    "SaaS estruturado. Salto de R$ 9.477 para R$ 29.995. Boa aceitação comercial, sem objeção de preço. Desafios operacionais e de experiência.",
  causes: [
    "Desalinhamento entre promessa comercial e modelo de entrega",
    "Dashboard sem clareza para decisão",
    "Instabilidade de funcionalidades",
    "Onboarding frágil e sem documentação",
    "Notas de ligação inconsistentes",
    "LinkedIn com resultado abaixo do esperado",
    "Suporte com percepção negativa",
  ],
  perspective:
    "O churn da V2 não invalida a tese. Ausência de objeção de preço e forte entrada de leads confirmam valor. Cancelamentos concentrados em usabilidade, eficiência percebida e expectativa — todos pontos atacáveis.",
};

export const CHURN_CATEGORIES: ChurnCategory[] = [
  {
    name: "Pré-Ativação",
    clients: ["Nicolas", "Gustavo + Sócio"],
    percentage: 28.6,
    color: "hsl(0, 72%, 51%)",
  },
  {
    name: "Imaturidade",
    clients: ["Gabriel"],
    percentage: 14.3,
    color: "hsl(25, 90%, 55%)",
  },
  {
    name: "Contexto Externo",
    clients: ["Leonardo"],
    percentage: 14.3,
    color: "hsl(45, 95%, 63%)",
  },
  {
    name: "Silencioso",
    clients: ["Alexandre"],
    percentage: 14.3,
    color: "hsl(210, 60%, 55%)",
  },
  {
    name: "Fantasma",
    clients: ["Eduardo"],
    percentage: 14.3,
    color: "hsl(270, 50%, 55%)",
  },
  {
    name: "Fraudulento",
    clients: ["Rubenio"],
    percentage: 14.3,
    color: "hsl(0, 0%, 50%)",
  },
];

export const CHURN_PROFILES: ChurnProfile[] = [
  {
    name: "Nicolas dos Santos Nunes",
    plan: "Pro",
    permanence: "< 24 horas",
    usage: "Não utilizou",
    reason: "Cancelamento em menos de 1 dia, sem testar a plataforma",
    diagnosis:
      "Churn pré-ativação. Possível arrependimento de compra por impulso, falta de clareza na proposta de valor, ou incompatibilidade descoberta após a compra. Indica necessidade de melhor qualificação pré-venda e/ou trial.",
    retentionAttempt: "Não aplicável (tempo insuficiente)",
  },
  {
    name: "Leonardo Pereira",
    plan: "Starter",
    permanence: "1 mês",
    usage: "Utilizou ativamente",
    reason: "Gostou da plataforma, mas não tinha equipe para operacionalizar",
    diagnosis:
      "Churn por contexto — não por produto. Validou o valor da solução, mas esbarrou em limitação interna (falta de RH). Oportunidade de reativação futura ou plano com serviço gerenciado.",
    retentionAttempt: "Cliente deixou feedback voluntariamente",
  },
  {
    name: "Alexandre Rios",
    plan: "Pro",
    permanence: "3 meses",
    usage: "Pouquíssimo (subutilizado)",
    reason: "Baixo engajamento ao longo do período",
    diagnosis:
      "Churn silencioso por falta de adoção. Pagou 3 meses sem usar — sinal de que não entendeu como extrair valor ou faltou acompanhamento no onboarding. Reforça necessidade de alertas de uso e CS proativo.",
    retentionAttempt: "Não informado",
  },
  {
    name: "Eduardo Rossi",
    plan: "Starter",
    permanence: "Não especificado",
    usage: "Alto (disparos personalizados e pesquisa frequente)",
    reason: "Desapareceu sem explicação",
    diagnosis:
      "Churn fantasma — cliente engajado que sumiu. Possíveis causas: problema financeiro, mudança estratégica, insatisfação não verbalizada, ou migração para concorrente. Reforça necessidade de pesquisa de churn automatizada.",
    retentionAttempt: "Múltiplas tentativas sem retorno",
  },
  {
    name: "Rubenio Sales Lima",
    plan: "Starter",
    permanence: "Não especificado",
    usage: "Uma única vez",
    reason: "Contestação de compra — cartão não reconhecido",
    diagnosis:
      "Churn fraudulento ou não intencional. Compra com cartão de terceiro — pode ser fraude, teste não autorizado, ou erro operacional. Exige revisão do processo de validação de pagamento.",
    retentionAttempt: "Sem sucesso (sem resposta)",
  },
  {
    name: "Gabriel Moraes",
    plan: "Não informado",
    permanence: "Desde o lançamento",
    usage: "Tentou usar, esbarrou em limitações",
    reason: "IA de ligação/e-mail não liberados + instabilidade WhatsApp",
    diagnosis:
      "Churn por imaturidade do produto. Early adopter que pagou o preço da fase beta. Oportunidade clara de reativação quando funcionalidades prometidas estiverem estáveis — cliente sinalizou abertura para retorno.",
    retentionAttempt: "Cliente deixou porta aberta para retorno",
  },
  {
    name: "Gustavo Santos Abreu (+ Sócio)",
    plan: "Starter",
    permanence: "< 24 horas",
    usage: "Não logaram na plataforma",
    reason: "Reembolso simultâneo sem teste prévio",
    diagnosis:
      "Churn pré-ativação em conjunto. Ambos pediram reembolso sem logar — não houve alinhamento interno antes da compra ou perceberam incompatibilidade ao revisar juntos. Reforça qualificação comercial para vendas B2B com múltiplos decisores.",
    retentionAttempt: "Tentativa de contato sem sucesso",
  },
];

export const V2_CAUSES: ChurnCause[] = [
  {
    title: "Desalinhamento Promessa vs Entrega",
    description:
      "Promessa de 25 reuniões + modelo self-service. Performance da IA depende da configuração do cliente — quando configura errado, a culpa recai sobre a ferramenta.",
    status: "in_progress",
  },
  {
    title: "Dashboard sem Clareza",
    description:
      "Métricas confusas, falta de visibilidade sobre campanhas, disparos e taxa de qualificação. Cliente não enxerga valor nos dados.",
    status: "in_progress",
    statusNote: "Ajustes parciais realizados",
  },
  {
    title: "Instabilidade de Funcionalidades",
    description:
      "Disparo de e-mail desativado por falha operacional. Gera percepção de amadorismo.",
    status: "resolved",
    statusNote: "Funcionalidade inativa — usuários não utilizaram",
  },
  {
    title: "Onboarding Frágil",
    description:
      "Modelo via reunião ao vivo insuficiente. Informação se perde, cliente configura errado, performance cai.",
    status: "in_progress",
    statusNote: "Gravação em andamento — deadline 23/02",
  },
  {
    title: "Notas de Ligação Inconsistentes",
    description:
      "Notas positivas em ligações sem conversa real. Desconfiança sobre qualidade da IA.",
    status: "resolved",
  },
  {
    title: "LinkedIn com Resultado Fraco",
    description:
      "Reflexo de copy ruim, segmentação equivocada ou ICP mal definido — fragilidade do modelo self-service sem guardrails.",
    status: "resolved",
  },
  {
    title: "Suporte com Percepção Negativa",
    description:
      "Ausência de SLA definido, canal claro e comunicação de acompanhamento. Percepção > realidade.",
    status: "pending",
    statusNote: "Relato de cliente específico (perfil plano personalizado)",
  },
];

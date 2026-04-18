/**
 * Prospecta IA 360 — Financial Engine
 */

// Helpers
export const brl = (v: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
  }).format(Math.round(v));

export const pct = (v: number, digits = 1) => `${(v * 100).toFixed(digits)}%`;

export type PlanKey = "basic" | "lite" | "starter" | "pro" | "enterprise";

export interface CostItem {
  id: string;
  label: string;
  value: number;
}

export interface UsdCostItem {
  id: string;
  label: string;
  usd: number;
}

export interface EditableCostsState {
  rhItems: CostItem[];
  toolsBrlItems: CostItem[];
  toolsUsdItems: UsdCostItem[];
  usdFx: number;
  iofAndFeesRate: number;
  twilioNumberUsdPerCustomer: number;
  twilioNumberShareOfCustomers: number;
}

export const DEFAULT_FIXED_COSTS: EditableCostsState = {
  rhItems: [
    { id: "support", label: "Suporte", value: 1000 },
    { id: "automationManager", label: "Gestor de Automação", value: 1300 },
    { id: "closerFixed", label: "Closer (fixo)", value: 500 },
    { id: "accounting", label: "Contabilidade", value: 450 },
    { id: "videoProduction", label: "Produção de Vídeo", value: 1800 },
    { id: "socialMedia", label: "Social Media", value: 1000 },
    { id: "marcosSimao", label: "Marcos Simão", value: 3000 },
    { id: "gestorProjeto", label: "Gestor do Projeto", value: 4000 },
    { id: "prolaboreSocios", label: "Pro-labore Sócios", value: 12000 },
  ],
  toolsBrlItems: [
    { id: "infra", label: "Infraestrutura", value: 245 },
    { id: "lovable", label: "Lovable", value: 1000 },
    { id: "gptClaude", label: "GPT / Claude", value: 300 },
    { id: "db", label: "Banco de Dados", value: 180 },
    { id: "domain", label: "Domínio", value: 150 },
    { id: "leadsReceita", label: "Leads Receita (CNPJ)", value: 29.90 },
  ],
  toolsUsdItems: [
    { id: "serpApi", label: "SerpAPI", usd: 250 },
    { id: "instantly", label: "Instantly", usd: 97 },
    { id: "resend", label: "Resend (email)", usd: 90 },
    { id: "unipile", label: "Unipile LinkedIn API", usd: 5.5 },
  ],
  usdFx: 5.22,
  iofAndFeesRate: 0.08,
  twilioNumberUsdPerCustomer: 4.25,
  twilioNumberShareOfCustomers: 0.15,
};

export function sumFixedCostsFromItems(costs: EditableCostsState, activeCustomers: number) {
  const usdToBrl = (usd: number) => usd * costs.usdFx * (1 + costs.iofAndFeesRate);
  const rhTotal = costs.rhItems.reduce((a, i) => a + i.value, 0);
  const toolsBrlTotal = costs.toolsBrlItems.reduce((a, i) => a + i.value, 0);
  const toolsUsdTotalBrl = costs.toolsUsdItems.reduce((a, i) => a + usdToBrl(i.usd), 0);
  const baseFixed = rhTotal + toolsBrlTotal + toolsUsdTotalBrl;
  const twilioNumbersCost = usdToBrl(costs.twilioNumberUsdPerCustomer) * activeCustomers * costs.twilioNumberShareOfCustomers;
  return { baseFixed, twilioNumbersCost, totalFixed: baseFixed + twilioNumbersCost };
}

export const ASSUMPTIONS = {
  voiceCostPerMinuteUsd: 0.175,
  voicePackOptions: [
    { price: 250, minutes: 100 },
    { price: 650, minutes: 300 },
    { price: 1200, minutes: 600 },
    { price: 1997, minutes: 1000 },
    { price: 3997, minutes: 2000 },
  ],
  plans: {
    basic: { label: "Basic", price: 147, includedSearches: 300, includedWhatsApps: 1, includedVoiceMinutes: 0 },
    lite: { label: "Lite", price: 297, includedSearches: 1000, includedWhatsApps: 1, includedVoiceMinutes: 0 },
    starter: { label: "Starter", price: 797, includedSearches: 1500, includedWhatsApps: 1, includedVoiceMinutes: 0 },
    pro: { label: "Pro", price: 1997, includedSearches: 5000, includedWhatsApps: 2, includedVoiceMinutes: 150 },
    enterprise: { label: "Enterprise", price: 4447, includedSearches: 18000, includedWhatsApps: 4, includedVoiceMinutes: 350 },
  } as Record<PlanKey, { label: string; price: number; includedSearches: number; includedWhatsApps: number; includedVoiceMinutes: number }>,
  mix: { basic: 0.25, lite: 0.35, starter: 0.28, pro: 0.09, enterprise: 0.03 } as Record<PlanKey, number>,
  churnMonthlyBase: 0.035,
  churnMonthlyPessimistic: 0.06,
  cacByPlanGross: { basic: 120, lite: 220, starter: 350, pro: 700, enterprise: 1600 } as Record<PlanKey, number>,
  paidTest: { enabled: true, price: 49, attachRateOfNewCustomers: 0.7, creditToCAC: 1.0 },
  onboarding: { enabled: true, price: 397, attachRateOfNewCustomers: 0.25 },
  upsells: {
    enabled: true,
    whatsappExtra: { pricePerConnection: 100, avgExtraConnectionsPerActiveCustomer: 0.12 },
    searchesExtra: { blendedMonthlyRevenuePerActiveCustomer: 18 },
  },
  voicePacks: {
    enabled: true,
    attachRateOfActiveCustomers: 0.08,
    avgRevenuePerBuyer: 1250,
    cogsRateOfVoiceRevenue: 0.50,
  },
  cogsByPlan: { basic: 28, lite: 96, starter: 176, pro: 810, enterprise: 2005 } as Record<PlanKey, number>,
  fixedMonthlyCosts: {
    support: 1000, automationManager: 1300, closerFixed: 500, accounting: 450,
    videoProduction: 1800, infra: 245, lovable: 1000, gptClaude: 300, db: 180, domain: 150,
    socialMedia: 1000, marcosSimao: 3000, gestorProjeto: 4000,
    usdFx: 5.22, iofAndFeesRate: 0.08,
    serpApiUsd: 250, instantlyUsd: 97,
    twilioNumberUsdPerCustomer: 4.25, twilioNumberShareOfCustomers: 0.15,
  },
  closer: {
    commissionRate: 0.15,
    shareOfNewSalesClosedByCloser: 0.4,
    includeOnboardingInCommissionBase: true,
  },
  taxSimples: {
    fatorRThreshold: 0.28,
    anexoIII: [
      { capAnual: 180_000, rate: 0.06 },
      { capAnual: 360_000, rate: 0.112 },
      { capAnual: 720_000, rate: 0.135 },
      { capAnual: 1_800_000, rate: 0.16 },
      { capAnual: 3_600_000, rate: 0.21 },
      { capAnual: 4_800_000, rate: 0.33 },
    ],
    anexoV: [
      { capAnual: 180_000, rate: 0.155 },
      { capAnual: 360_000, rate: 0.18 },
      { capAnual: 720_000, rate: 0.195 },
      { capAnual: 1_800_000, rate: 0.205 },
      { capAnual: 3_600_000, rate: 0.23 },
      { capAnual: 4_800_000, rate: 0.305 },
    ],
  },
  lucroPresumido: {
    irpjRate: 0.048,
    csllRate: 0.0288,
    pisRate: 0.0065,
    cofinsRate: 0.03,
    issRate: 0.05,
  },
} as const;

function calcTax(monthlyRevenue: number, monthlyPayroll: number) {
  if (monthlyRevenue <= 0) return { rate: 0, tax: 0, fatorR: 0, anexo: "III" as const, regime: "Simples III" };
  const fatorR = monthlyPayroll / monthlyRevenue;
  const ts = ASSUMPTIONS.taxSimples;

  // Simples Nacional
  const simplesTable = fatorR >= ts.fatorRThreshold ? ts.anexoIII : ts.anexoV;
  const simplesAnexo = fatorR >= ts.fatorRThreshold ? "III" : "V";
  const anual = monthlyRevenue * 12;
  const bracket = simplesTable.find((b) => anual <= b.capAnual) || simplesTable[simplesTable.length - 1];
  const simplesRate = bracket.rate;
  const simplesTax = monthlyRevenue * simplesRate;

  // Lucro Presumido
  const lp = ASSUMPTIONS.lucroPresumido;
  const lpRate = lp.irpjRate + lp.csllRate + lp.pisRate + lp.cofinsRate + lp.issRate;
  const lpTax = monthlyRevenue * lpRate;

  // Escolher o menor
  if (lpTax < simplesTax) {
    return { rate: lpRate, tax: lpTax, fatorR, anexo: simplesAnexo as "III" | "V", regime: "Lucro Presumido" };
  }
  return { rate: simplesRate, tax: simplesTax, fatorR, anexo: simplesAnexo as "III" | "V", regime: `Simples ${simplesAnexo}` };
}

export function sumFixedCosts(activeCustomers: number) {
  return sumFixedCostsFromItems(DEFAULT_FIXED_COSTS, activeCustomers);
}

export function planCounts(totalActive: number) {
  const m = ASSUMPTIONS.mix;
  const keys = Object.keys(m) as PlanKey[];
  const raw = keys.map((k) => ({ k, v: totalActive * m[k] }));
  const out: Record<PlanKey, number> = { basic: 0, lite: 0, starter: 0, pro: 0, enterprise: 0 };
  raw.forEach((r) => (out[r.k] = Math.floor(r.v)));
  let remaining = totalActive - keys.reduce((a, k) => a + out[k], 0);
  const frac = raw.map((r) => ({ k: r.k, frac: r.v - Math.floor(r.v) })).sort((a, b) => b.frac - a.frac);
  for (let i = 0; i < remaining; i++) out[frac[i % frac.length].k] += 1;
  return out;
}

function revenueFromPlans(activeCounts: Record<PlanKey, number>) {
  return (Object.keys(activeCounts) as PlanKey[]).reduce((acc, k) => acc + activeCounts[k] * ASSUMPTIONS.plans[k].price, 0);
}

function cogsFromPlans(activeCounts: Record<PlanKey, number>) {
  return (Object.keys(activeCounts) as PlanKey[]).reduce((acc, k) => acc + activeCounts[k] * ASSUMPTIONS.cogsByPlan[k], 0);
}

function acquisitionSpend(newCounts: Record<PlanKey, number>, pessimistic = false) {
  const factor = pessimistic ? 2 : 1;
  const marketingGross = (Object.keys(newCounts) as PlanKey[]).reduce((acc, k) => acc + newCounts[k] * ASSUMPTIONS.cacByPlanGross[k] * factor, 0);
  const pt = ASSUMPTIONS.paidTest;
  const newTotal = (Object.keys(newCounts) as PlanKey[]).reduce((a, k) => a + newCounts[k], 0);
  const paidTestRevenue = pt.enabled ? newTotal * pt.attachRateOfNewCustomers * pt.price : 0;
  const marketingNet = marketingGross - paidTestRevenue * pt.creditToCAC;
  return {
    marketingGross, marketingNet, paidTestRevenue,
    cacBlendedGross: newTotal > 0 ? marketingGross / newTotal : 0,
    cacBlendedNet: newTotal > 0 ? marketingNet / newTotal : 0,
  };
}

function onboardingRev(newTotal: number) {
  const o = ASSUMPTIONS.onboarding;
  if (!o.enabled) return { onboardingRevenue: 0 };
  return { onboardingRevenue: newTotal * o.attachRateOfNewCustomers * o.price };
}

function upsellRev(activeTotal: number) {
  const u = ASSUMPTIONS.upsells;
  if (!u.enabled) return { upsellRevenue: 0 };
  return {
    upsellRevenue:
      activeTotal * u.whatsappExtra.avgExtraConnectionsPerActiveCustomer * u.whatsappExtra.pricePerConnection +
      activeTotal * u.searchesExtra.blendedMonthlyRevenuePerActiveCustomer,
  };
}

function voiceRev(activeTotal: number) {
  const v = ASSUMPTIONS.voicePacks;
  if (!v.enabled) return { voiceRevenue: 0, voiceCogs: 0 };
  const rev = activeTotal * v.attachRateOfActiveCustomers * v.avgRevenuePerBuyer;
  return { voiceRevenue: rev, voiceCogs: rev * v.cogsRateOfVoiceRevenue };
}

function closerCommission(newCounts: Record<PlanKey, number>, onbRev: number) {
  const c = ASSUMPTIONS.closer;
  const newSubRev = (Object.keys(newCounts) as PlanKey[]).reduce((acc, k) => acc + newCounts[k] * ASSUMPTIONS.plans[k].price, 0);
  const base = c.includeOnboardingInCommissionBase ? newSubRev + onbRev : newSubRev;
  return base * c.shareOfNewSalesClosedByCloser * c.commissionRate;
}

export interface MonthResult {
  month: number;
  activeCustomers: number;
  newCustomers: number;
  churnRate: number;
  subscriptionRevenue: number;
  onboardingRevenue: number;
  upsellRevenue: number;
  voiceRevenue: number;
  revenueTotal: number;
  cogsPlans: number;
  voiceCogs: number;
  cogsTotal: number;
  fixedCosts: number;
  marketingGross: number;
  paidTestRevenue: number;
  marketingNet: number;
  closerCommission: number;
  taxRate: number;
  taxes: number;
  fatorR: number;
  anexo: "III" | "V";
  regime: string;
  profit: number;
  margin: number;
  cacBlendedGross: number;
  cacBlendedNet: number;
  arpu: number;
  cogsPerActive: number;
  fixedPerActive: number;
  unitCostPerActiveExMarketing: number;
}

export function monthModel(params: {
  month: number;
  activePrev: number;
  newTarget?: number;
  churnRate: number;
  pessimisticCAC: boolean;
  hormoziImpact: boolean;
  fixedCostOverride?: number;
  monthlyPayroll?: number;
}): MonthResult {
  const { month, activePrev, churnRate, pessimisticCAC, fixedCostOverride } = params;
  const hormozi = params.hormoziImpact;
  const active = activePrev * (1 - churnRate) + (params.newTarget ?? 0);
  const activeCounts = planCounts(Math.round(active));
  const newTotal = Math.round(params.newTarget ?? 0);
  const newCounts = planCounts(newTotal);

  const subscriptionRevenue = revenueFromPlans(activeCounts);
  const onbR = hormozi ? onboardingRev(newTotal).onboardingRevenue : 0;
  const upR = hormozi ? upsellRev(Math.round(active)).upsellRevenue : 0;
  const { voiceRevenue: vR, voiceCogs: vC } = hormozi ? voiceRev(Math.round(active)) : { voiceRevenue: 0, voiceCogs: 0 };
  const revenueTotal = subscriptionRevenue + onbR + upR + vR;

  const cogsPlans = cogsFromPlans(activeCounts);
  const cogsTotal = cogsPlans + vC;
  
  const roundedActive = Math.round(active);
  const fixedTotal = fixedCostOverride != null
    ? fixedCostOverride
    : sumFixedCosts(roundedActive).totalFixed;
    
  const acq = acquisitionSpend(newCounts, pessimisticCAC);
  const commission = closerCommission(newCounts, onbR);
  const payroll = params.monthlyPayroll ?? DEFAULT_FIXED_COSTS.rhItems.reduce((a, i) => a + i.value, 0);
  const taxes = calcTax(revenueTotal, payroll);
  const profit = revenueTotal - cogsTotal - fixedTotal - acq.marketingNet - commission - taxes.tax;

  return {
    month,
    activeCustomers: roundedActive,
    newCustomers: newTotal,
    churnRate,
    subscriptionRevenue,
    onboardingRevenue: onbR,
    upsellRevenue: upR,
    voiceRevenue: vR,
    revenueTotal,
    cogsPlans,
    voiceCogs: vC,
    cogsTotal,
    fixedCosts: fixedTotal,
    marketingGross: acq.marketingGross,
    paidTestRevenue: acq.paidTestRevenue,
    marketingNet: acq.marketingNet,
    closerCommission: commission,
    taxRate: taxes.rate,
    taxes: taxes.tax,
    fatorR: taxes.fatorR,
    anexo: taxes.anexo,
    regime: taxes.regime,
    profit,
    margin: revenueTotal > 0 ? profit / revenueTotal : 0,
    cacBlendedGross: acq.cacBlendedGross,
    cacBlendedNet: acq.cacBlendedNet,
    arpu: roundedActive > 0 ? revenueTotal / roundedActive : 0,
    cogsPerActive: roundedActive > 0 ? cogsTotal / roundedActive : 0,
    fixedPerActive: roundedActive > 0 ? fixedTotal / roundedActive : 0,
    unitCostPerActiveExMarketing: roundedActive > 0 ? (cogsTotal + fixedTotal) / roundedActive : 0,
  };
}

function rampWeight(month: number): number {
  return 0.5 + (1.0 * (month - 1)) / 11;
}

export function build12MonthProjection(opts: {
  startActive: number;
  targetActive: number;
  churnRate: number;
  pessimisticCAC: boolean;
  hormoziImpact: boolean;
  fixedCostOverrideFn?: (activeCustomers: number) => number;
  monthlyPayroll?: number;
}) {
  const months = 12;

  const solveRamp = (): number[] => {
    let low = 0, high = 2000;
    for (let i = 0; i < 40; i++) {
      const mid = (low + high) / 2;
      let active = opts.startActive;
      for (let m = 1; m <= months; m++) {
        const newM = Math.round(mid * rampWeight(m));
        active = active * (1 - opts.churnRate) + newM;
      }
      if (active < opts.targetActive) low = mid; else high = mid;
    }
    const avg = high;
    return Array.from({ length: months }, (_, i) => Math.round(avg * rampWeight(i + 1)));
  };

  const newSchedule = solveRamp();
  const avgNewPerMonth = Math.round(newSchedule.reduce((a, b) => a + b, 0) / months);
  const rows: MonthResult[] = [];
  let activePrev = opts.startActive;
  for (let m = 1; m <= months; m++) {
    const activeNext = Math.round(activePrev * (1 - opts.churnRate) + newSchedule[m - 1]);
    const fixedCostOverride = opts.fixedCostOverrideFn ? opts.fixedCostOverrideFn(activeNext) : undefined;
    const r = monthModel({
      month: m, activePrev, newTarget: newSchedule[m - 1],
      churnRate: opts.churnRate, pessimisticCAC: opts.pessimisticCAC, hormoziImpact: opts.hormoziImpact,
      fixedCostOverride, monthlyPayroll: opts.monthlyPayroll,
    });
    rows.push(r);
    activePrev = r.activeCustomers;
  }
  return { rows, newSchedule, avgNewPerMonth };
}

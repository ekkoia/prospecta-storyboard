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

export type PlanKey = "lite" | "starter" | "pro" | "enterprise";

export const ASSUMPTIONS = {
  plans: {
    lite: { label: "Lite", price: 397, includedSearches: 1000, includedWhatsApps: 1 },
    starter: { label: "Starter", price: 897, includedSearches: 1500, includedWhatsApps: 1 },
    pro: { label: "Pro", price: 1497, includedSearches: 5000, includedWhatsApps: 2 },
    enterprise: { label: "Enterprise", price: 2997, includedSearches: 18000, includedWhatsApps: 4 },
  } as Record<PlanKey, { label: string; price: number; includedSearches: number; includedWhatsApps: number }>,
  mix: { lite: 0.45, starter: 0.35, pro: 0.15, enterprise: 0.05 } as Record<PlanKey, number>,
  churnMonthlyBase: 0.035,
  churnMonthlyPessimistic: 0.06,
  cacByPlanGross: { lite: 220, starter: 350, pro: 700, enterprise: 1600 } as Record<PlanKey, number>,
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
    avgRevenuePerBuyer: 980,
    cogsRateOfVoiceRevenue: 0.32,
  },
  cogsByPlan: { lite: 95, starter: 140, pro: 586, enterprise: 1470 } as Record<PlanKey, number>,
  fixedMonthlyCosts: {
    support: 1000, automationManager: 1300, closerFixed: 500, accounting: 450,
    videoProduction: 1800, infra: 245, lovable: 1000, gptClaude: 300, db: 180, domain: 150,
    socialMedia: 1000, marcosSimao: 3000, gestorProjeto: 4000,
    usdFx: 5.69, iofAndFeesRate: 0.08,
    serpApiUsd: 250, instantlyUsd: 97,
    twilioNumberUsdPerCustomer: 4.25, twilioNumberShareOfCustomers: 0.15,
  },
  closer: {
    commissionRate: 0.15,
    shareOfNewSalesClosedByCloser: 0.4,
    includeOnboardingInCommissionBase: true,
  },
  taxBrackets: [
    { cap: 180_000 / 12, rate: 0.06 },
    { cap: 360_000 / 12, rate: 0.112 },
    { cap: 720_000 / 12, rate: 0.135 },
    { cap: 1_800_000 / 12, rate: 0.16 },
    { cap: 3_600_000 / 12, rate: 0.21 },
    { cap: Infinity, rate: 0.25 },
  ],
} as const;

function calcTaxProgressive(monthlyRevenue: number) {
  const b = ASSUMPTIONS.taxBrackets.find((x) => monthlyRevenue <= x.cap) || ASSUMPTIONS.taxBrackets[ASSUMPTIONS.taxBrackets.length - 1];
  return { rate: b.rate, tax: monthlyRevenue * b.rate };
}

export function sumFixedCosts(activeCustomers: number) {
  const f = ASSUMPTIONS.fixedMonthlyCosts;
  const usdToBrl = (usd: number) => usd * f.usdFx * (1 + f.iofAndFeesRate);
  const baseFixed =
    f.support + f.automationManager + f.closerFixed + f.accounting + f.videoProduction +
    f.infra + f.lovable + f.gptClaude + f.db + f.domain +
    f.socialMedia + f.marcosSimao + f.gestorProjeto +
    usdToBrl(f.serpApiUsd + f.instantlyUsd);
  const twilioNumbersCost = usdToBrl(f.twilioNumberUsdPerCustomer) * activeCustomers * f.twilioNumberShareOfCustomers;
  return { baseFixed, twilioNumbersCost, totalFixed: baseFixed + twilioNumbersCost };
}

export function planCounts(totalActive: number) {
  const m = ASSUMPTIONS.mix;
  const keys = Object.keys(m) as PlanKey[];
  const raw = keys.map((k) => ({ k, v: totalActive * m[k] }));
  const out: Record<PlanKey, number> = { lite: 0, starter: 0, pro: 0, enterprise: 0 };
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
}): MonthResult {
  const { month, activePrev, churnRate, pessimisticCAC } = params;
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
  const fixed = sumFixedCosts(Math.round(active));
  const acq = acquisitionSpend(newCounts, pessimisticCAC);
  const commission = closerCommission(newCounts, onbR);
  const taxes = calcTaxProgressive(revenueTotal);
  const profit = revenueTotal - cogsTotal - fixed.totalFixed - acq.marketingNet - commission - taxes.tax;
  const roundedActive = Math.round(active);

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
    fixedCosts: fixed.totalFixed,
    marketingGross: acq.marketingGross,
    paidTestRevenue: acq.paidTestRevenue,
    marketingNet: acq.marketingNet,
    closerCommission: commission,
    taxRate: taxes.rate,
    taxes: taxes.tax,
    profit,
    margin: revenueTotal > 0 ? profit / revenueTotal : 0,
    cacBlendedGross: acq.cacBlendedGross,
    cacBlendedNet: acq.cacBlendedNet,
    arpu: roundedActive > 0 ? revenueTotal / roundedActive : 0,
    cogsPerActive: roundedActive > 0 ? cogsTotal / roundedActive : 0,
    fixedPerActive: roundedActive > 0 ? fixed.totalFixed / roundedActive : 0,
    unitCostPerActiveExMarketing: roundedActive > 0 ? (cogsTotal + fixed.totalFixed) / roundedActive : 0,
  };
}

function rampWeight(month: number): number {
  // month 1 = 0.5x average, month 12 = 1.5x average (linear)
  return 0.5 + (1.0 * (month - 1)) / 11;
}

export function build12MonthProjection(opts: {
  startActive: number;
  targetActive: number;
  churnRate: number;
  pessimisticCAC: boolean;
  hormoziImpact: boolean;
}) {
  const months = 12;

  // Solver: find avgNew such that ramped acquisition hits target
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
    const r = monthModel({
      month: m, activePrev, newTarget: newSchedule[m - 1],
      churnRate: opts.churnRate, pessimisticCAC: opts.pessimisticCAC, hormoziImpact: opts.hormoziImpact,
    });
    rows.push(r);
    activePrev = r.activeCustomers;
  }
  return { rows, newSchedule, avgNewPerMonth };
}

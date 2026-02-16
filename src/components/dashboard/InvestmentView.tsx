import { useMemo, useState } from "react";
import { type MonthResult, brl, pct, DEFAULT_FIXED_COSTS, type EditableCostsState } from "@/lib/financial-engine";
import { KpiCard } from "./KpiCard";
import { Section } from "./Section";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";

const TRACK_RECORD = {
  totalInvested: 34383,
  grossRevenue: 47863,
  netRevenue: 40875,
  fixedCostsV2: 8444,
  currentResult: -1952,
  validatedMRR: 2713,
  period: "Jun/24 – Dez/24",
};

interface MonthDetail {
  month: number;
  revenue: number;
  totalCosts: number;
  gap: number;
}

interface PhaseData {
  name: string;
  label: string;
  months: number[];
  investmentNeeded: number;
  clientsEnd: number;
  revenueEnd: number;
  churnEnd: number;
  kpis: { clients: number; revenue: number; churn: number };
  monthDetails: MonthDetail[];
}

function computePhases(rows: MonthResult[]): {
  phases: PhaseData[];
  cumulativeData: { month: string; cumulative: number; flow: number }[];
  totalInvestmentNeeded: number;
  breakEvenMonth: number | null;
  marginMonth12: number;
  paybackMonth: number | null;
} {
  // Cumulative cash flow starting from historical deficit
  let cumulative = TRACK_RECORD.currentResult;
  const cumulativeData: { month: string; cumulative: number; flow: number }[] = [
    { month: "Hist.", cumulative: TRACK_RECORD.currentResult, flow: TRACK_RECORD.currentResult },
  ];

  let minCumulative = cumulative;
  let breakEvenMonth: number | null = null;

  for (const row of rows) {
    cumulative += row.profit;
    cumulativeData.push({
      month: `M${row.month}`,
      cumulative: Math.round(cumulative),
      flow: Math.round(row.profit),
    });
    if (cumulative < minCumulative) minCumulative = cumulative;
    if (breakEvenMonth === null && cumulative >= 0) breakEvenMonth = row.month;
  }

  const totalInvestmentNeeded = Math.abs(Math.min(0, minCumulative));

  // Phases: 3 groups of 4 months
  const phaseConfig = [
    { name: "Fase 1", label: "Validação", months: [0, 1, 2, 3] },
    { name: "Fase 2", label: "Tração", months: [4, 5, 6, 7] },
    { name: "Fase 3", label: "Escala", months: [8, 9, 10, 11] },
  ];

  const phases: PhaseData[] = phaseConfig.map((pc, idx) => {
    const phaseRows = pc.months.filter((i) => i < rows.length).map((i) => rows[i]);
    const deficit = phaseRows.reduce((acc, r) => acc + Math.min(0, r.profit), 0);
    const lastRow = phaseRows[phaseRows.length - 1];

    let investmentNeeded = Math.abs(deficit);
    // Fase 1 inclui o déficit histórico
    if (idx === 0) {
      investmentNeeded += Math.abs(TRACK_RECORD.currentResult);
    }

    const monthDetails: MonthDetail[] = phaseRows.map(r => ({
      month: r.month,
      revenue: r.revenueTotal,
      totalCosts: r.cogsTotal + r.fixedCosts + r.marketingNet + r.closerCommission + r.taxes,
      gap: r.profit,
    }));

    return {
      ...pc,
      investmentNeeded,
      clientsEnd: lastRow?.activeCustomers ?? 0,
      revenueEnd: lastRow?.revenueTotal ?? 0,
      churnEnd: lastRow?.churnRate ?? 0,
      kpis: {
        clients: lastRow?.activeCustomers ?? 0,
        revenue: lastRow?.revenueTotal ?? 0,
        churn: lastRow?.churnRate ?? 0,
      },
      monthDetails,
    };
  });

  const lastRow = rows[rows.length - 1];
  const marginMonth12 = lastRow?.margin ?? 0;

  // Payback: month where cumulative recovers total investment
  let paybackMonth: number | null = null;
  if (totalInvestmentNeeded > 0) {
    let cum2 = TRACK_RECORD.currentResult;
    for (const row of rows) {
      cum2 += row.profit;
      if (cum2 >= totalInvestmentNeeded && paybackMonth === null) {
        paybackMonth = row.month;
      }
    }
  }

  return { phases, cumulativeData, totalInvestmentNeeded, breakEvenMonth, marginMonth12, paybackMonth };
}

const formatBrl = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0 }).format(Math.round(v));

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const cumulativeEntry = payload.find((p: any) => p.dataKey === "cumulative");
  const flowValue = cumulativeEntry?.payload?.flow;
  return (
    <div className="bg-slate-800 border border-slate-600 rounded-lg p-3 text-sm shadow-xl">
      <p className="text-slate-300 font-semibold mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ color: p.color }}>
          {p.name}: {formatBrl(p.value)}
        </p>
      ))}
      {flowValue !== undefined && (
        <p className={flowValue >= 0 ? "text-emerald-400" : "text-red-400"}>
          Fluxo do mês: {formatBrl(flowValue)}
        </p>
      )}
    </div>
  );
};

function BurnRatePanel({ costs, marketingMonth1 }: { costs: EditableCostsState; marketingMonth1: number }) {
  const [open, setOpen] = useState(false);

  const rhTotal = costs.rhItems.reduce((a, i) => a + i.value, 0);
  const toolsBrlTotal = costs.toolsBrlItems.reduce((a, i) => a + i.value, 0);
  const usdToBrl = (usd: number) => usd * costs.usdFx * (1 + costs.iofAndFeesRate);
  const toolsUsdTotalBrl = costs.toolsUsdItems.reduce((a, i) => a + usdToBrl(i.usd), 0);
  const fixedTotal = rhTotal + toolsBrlTotal + toolsUsdTotalBrl;
  const burnTotal = fixedTotal + marketingMonth1;

  return (
    <Section title="🔥 Custo Mensal de Operação (Burn Rate)">
      <Collapsible open={open} onOpenChange={setOpen}>
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-3xl font-bold text-white">~{formatBrl(burnTotal)}<span className="text-base text-slate-400 font-normal">/mês</span></div>
            <div className="text-slate-400 text-sm mt-1">Custos fixos {formatBrl(fixedTotal)} + Tráfego {formatBrl(marketingMonth1)}</div>
          </div>
          <CollapsibleTrigger asChild>
            <button className="text-slate-400 hover:text-white transition-colors flex items-center gap-1 text-sm">
              {open ? "Recolher" : "Ver detalhes"}
              <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
            </button>
          </CollapsibleTrigger>
        </div>

        <CollapsibleContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
            {/* RH */}
            <div className="bg-slate-700/60 rounded-xl p-4 border border-slate-600">
              <div className="text-slate-400 text-xs font-medium mb-2 uppercase tracking-wide">Equipe (RH)</div>
              <div className="text-lg font-bold text-white mb-2">{formatBrl(rhTotal)}<span className="text-xs text-slate-400">/mês</span></div>
              <div className="space-y-1">
                {costs.rhItems.map(item => (
                  <div key={item.id} className="flex justify-between text-xs">
                    <span className="text-slate-400">{item.label}</span>
                    <span className="text-slate-300">{formatBrl(item.value)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Ferramentas BRL */}
            <div className="bg-slate-700/60 rounded-xl p-4 border border-slate-600">
              <div className="text-slate-400 text-xs font-medium mb-2 uppercase tracking-wide">Ferramentas (BRL)</div>
              <div className="text-lg font-bold text-white mb-2">{formatBrl(toolsBrlTotal)}<span className="text-xs text-slate-400">/mês</span></div>
              <div className="space-y-1">
                {costs.toolsBrlItems.map(item => (
                  <div key={item.id} className="flex justify-between text-xs">
                    <span className="text-slate-400">{item.label}</span>
                    <span className="text-slate-300">{formatBrl(item.value)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Ferramentas USD */}
            <div className="bg-slate-700/60 rounded-xl p-4 border border-slate-600">
              <div className="text-slate-400 text-xs font-medium mb-2 uppercase tracking-wide">Ferramentas (USD)</div>
              <div className="text-lg font-bold text-white mb-2">~{formatBrl(toolsUsdTotalBrl)}<span className="text-xs text-slate-400">/mês</span></div>
              <div className="space-y-1">
                {costs.toolsUsdItems.map(item => (
                  <div key={item.id} className="flex justify-between text-xs">
                    <span className="text-slate-400">{item.label} (${item.usd})</span>
                    <span className="text-slate-300">~{formatBrl(usdToBrl(item.usd))}</span>
                  </div>
                ))}
                <div className="text-slate-500 text-xs mt-1">Câmbio: R$ {costs.usdFx} + IOF {(costs.iofAndFeesRate * 100).toFixed(0)}%</div>
              </div>
            </div>

            {/* Tráfego */}
            <div className="bg-slate-700/60 rounded-xl p-4 border border-slate-600">
              <div className="text-slate-400 text-xs font-medium mb-2 uppercase tracking-wide">Tráfego Pago</div>
              <div className="text-lg font-bold text-white mb-2">{formatBrl(marketingMonth1)}<span className="text-xs text-slate-400">/mês</span></div>
              <div className="text-slate-500 text-xs">Investimento bruto em mídia do mês 1. Varia conforme o ritmo de aquisição do cenário.</div>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      <p className="text-slate-500 text-sm mt-4 italic border-l-2 border-slate-600 pl-3">
        Esse é o custo para manter a operação rodando. Nos primeiros meses, a receita não cobre esse custo — por isso o aporte cobre o gap até a receita escalar.
      </p>
    </Section>
  );
}

export function InvestmentView({ projectionRows }: { projectionRows: MonthResult[] }) {
  const { phases, cumulativeData, totalInvestmentNeeded, breakEvenMonth, marginMonth12, paybackMonth } =
    useMemo(() => computePhases(projectionRows), [projectionRows]);

  const marketingMonth1 = projectionRows[0]?.marketingGross ?? 0;
  const phaseColors = ["from-amber-600 to-amber-700", "from-cyan-600 to-cyan-700", "from-emerald-600 to-emerald-700"];
  const phaseEmojis = ["🏗️", "🚀", "📈"];

  // Summary table
  const tableRows = useMemo(() => {
    let cumulative = TRACK_RECORD.currentResult;
    return projectionRows.map((r) => {
      const totalExpenses = r.cogsTotal + r.fixedCosts + r.marketingNet + r.closerCommission + r.taxes;
      cumulative += r.profit;
      return {
        month: r.month,
        revenue: r.revenueTotal,
        expenses: totalExpenses,
        flow: r.profit,
        cumulative,
        clients: r.activeCustomers,
      };
    });
  }, [projectionRows]);

  return (
    <div className="space-y-6">
      {/* Track Record */}
      <Section title="📊 Track Record — Produto Validado">
        <p className="text-slate-400 text-sm mb-4">
          Período: <span className="text-slate-200 font-semibold">{TRACK_RECORD.period}</span> — O produto já rodou, faturou e está a R$ 2k do breakeven.
        </p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-700/60 rounded-xl p-4 border border-slate-600">
            <div className="text-slate-400 text-xs font-medium mb-1">Investido até aqui</div>
            <div className="text-2xl font-bold text-slate-200">{formatBrl(TRACK_RECORD.totalInvested)}</div>
          </div>
          <div className="bg-slate-700/60 rounded-xl p-4 border border-slate-600">
            <div className="text-slate-400 text-xs font-medium mb-1">Receita bruta gerada</div>
            <div className="text-2xl font-bold text-slate-200">{formatBrl(TRACK_RECORD.grossRevenue)}</div>
          </div>
          <div className="bg-slate-700/60 rounded-xl p-4 border border-slate-600">
            <div className="text-slate-400 text-xs font-medium mb-1">Gap atual</div>
            <div className="text-2xl font-bold text-red-400">{formatBrl(TRACK_RECORD.currentResult)}</div>
            <div className="text-slate-500 text-xs mt-1">Quase breakeven</div>
          </div>
          <div className="bg-slate-700/60 rounded-xl p-4 border border-slate-600">
            <div className="text-slate-400 text-xs font-medium mb-1">MRR validado (V2)</div>
            <div className="text-2xl font-bold text-emerald-400">{formatBrl(TRACK_RECORD.validatedMRR)}<span className="text-sm text-slate-400">/mês</span></div>
          </div>
        </div>
      </Section>

      {/* Projection KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Aporte adicional necessário"
          value={totalInvestmentNeeded > 0 ? brl(totalInvestmentNeeded) : "R$ 0"}
          sub="Soma dos déficits acumulados"
          tone="orange"
        />
        <KpiCard
          title="Meses até breakeven"
          value={breakEvenMonth ? `Mês ${breakEvenMonth}` : "—"}
          sub="Fluxo acumulado ≥ 0"
          tone="blue"
        />
        <KpiCard
          title="Margem no mês 12"
          value={pct(marginMonth12)}
          sub={`Lucro: ${brl(projectionRows[projectionRows.length - 1]?.profit ?? 0)}`}
          tone="green"
        />
        <KpiCard
          title="Payback estimado"
          value={paybackMonth ? `Mês ${paybackMonth}` : "Após 12m"}
          sub="Acumulado recupera aporte"
          tone="purple"
        />
      </div>

      {/* Burn Rate Panel */}
      <BurnRatePanel costs={DEFAULT_FIXED_COSTS} marketingMonth1={marketingMonth1} />

      {/* Phases */}
      <Section title="🎯 Aporte Faseado — Liberação por KPIs">
        <p className="text-slate-400 text-sm mb-4">
          O aporte de cada fase cobre o déficit operacional dos meses em que a receita ainda não paga todos os custos (RH, ferramentas, tráfego pago, COGS e impostos). O investidor só libera a próxima fase quando os KPIs forem atingidos.
        </p>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {phases.map((phase, i) => (
            <div key={phase.name} className={`bg-gradient-to-br ${phaseColors[i]} rounded-xl p-5 shadow-lg`}>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">{phaseEmojis[i]}</span>
                <div>
                  <div className="text-white font-bold text-lg">{phase.name}</div>
                  <div className="text-white/70 text-xs">{phase.label} — Meses {phase.months[0] + 1}–{phase.months[phase.months.length - 1] + 1}</div>
                </div>
              </div>

              <div className="bg-black/20 rounded-lg p-3 mb-3">
                <div className="text-white/70 text-xs mb-1">Aporte da fase</div>
                <div className="text-2xl font-bold text-white">
                  {phase.investmentNeeded > 0 ? formatBrl(phase.investmentNeeded) : "R$ 0"}
                </div>
                {phase.investmentNeeded === 0 && (
                  <div className="text-emerald-300 text-xs mt-1">✅ Auto-sustentável</div>
                )}
              </div>

              <div className="space-y-2 text-sm">
                <div className="text-white/80 font-semibold text-xs uppercase tracking-wide">KPIs de liberação</div>
                <div className="flex justify-between text-white/90">
                  <span>Clientes ativos</span>
                  <span className="font-bold">{phase.kpis.clients}</span>
                </div>
                <div className="flex justify-between text-white/90">
                  <span>Receita mensal</span>
                  <span className="font-bold">{formatBrl(phase.kpis.revenue)}</span>
                </div>
                <div className="flex justify-between text-white/90">
                  <span>Churn máx.</span>
                  <span className="font-bold">{pct(phase.kpis.churn)}</span>
                </div>
              </div>

              {/* Monthly breakdown */}
              {phase.monthDetails.some(m => m.gap < 0) && (
                <div className="mt-3 pt-3 border-t border-white/20">
                  <div className="text-white/80 font-semibold text-xs uppercase tracking-wide mb-2">Composição mensal</div>
                  <div className="space-y-1.5">
                    {phase.monthDetails.map(m => (
                      <div key={m.month} className="flex items-center justify-between text-xs">
                        <span className="text-white/70">Mês {m.month}</span>
                        <div className="flex gap-3">
                          <span className="text-emerald-300">{formatBrl(m.revenue)}</span>
                          <span className="text-red-300">-{formatBrl(m.totalCosts)}</span>
                          <span className={`font-bold ${m.gap >= 0 ? "text-emerald-300" : "text-red-300"}`}>
                            {formatBrl(m.gap)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  {i === 0 && (
                    <div className="flex items-center justify-between text-xs mt-1.5 pt-1.5 border-t border-white/10">
                      <span className="text-white/70">Déficit histórico</span>
                      <span className="font-bold text-red-300">{formatBrl(TRACK_RECORD.currentResult)}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </Section>

      {/* Cumulative Cash Flow Chart */}
      <Section title="📈 Fluxo de Caixa Acumulado (12 meses)">
        <p className="text-slate-400 text-sm mb-4">
          Iniciando do resultado histórico de {formatBrl(TRACK_RECORD.currentResult)}. O ponto de breakeven é quando a linha cruza o zero.
        </p>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={cumulativeData} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="colorCumulative" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine y={0} stroke="#ef4444" strokeDasharray="6 3" label={{ value: "Breakeven", fill: "#ef4444", fontSize: 12 }} />
              <Area
                type="monotone"
                dataKey="cumulative"
                name="Acumulado"
                stroke="#3b82f6"
                fill="url(#colorCumulative)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Section>

      {/* Summary Table */}
      <Section title="📋 Resumo Mensal">
        <ScrollArea className="w-full">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-600 text-slate-400">
                <th className="text-left py-2 px-3">Mês</th>
                <th className="text-right py-2 px-3">Clientes</th>
                <th className="text-right py-2 px-3">Receita</th>
                <th className="text-right py-2 px-3">Despesas</th>
                <th className="text-right py-2 px-3">Fluxo</th>
                <th className="text-right py-2 px-3">Acumulado</th>
              </tr>
            </thead>
            <tbody>
              {tableRows.map((r) => (
                <tr key={r.month} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                  <td className="py-2 px-3 text-slate-300 font-medium">Mês {r.month}</td>
                  <td className="py-2 px-3 text-right text-slate-300">{r.clients}</td>
                  <td className="py-2 px-3 text-right text-emerald-400">{formatBrl(r.revenue)}</td>
                  <td className="py-2 px-3 text-right text-red-400">{formatBrl(r.expenses)}</td>
                  <td className={`py-2 px-3 text-right font-semibold ${r.flow >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                    {formatBrl(r.flow)}
                  </td>
                  <td className={`py-2 px-3 text-right font-semibold ${r.cumulative >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                    {formatBrl(r.cumulative)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </Section>
    </div>
  );
}

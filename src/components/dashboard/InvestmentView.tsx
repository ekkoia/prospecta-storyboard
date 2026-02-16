import { useMemo, useState } from "react";
import { type MonthResult, brl, pct, type EditableCostsState } from "@/lib/financial-engine";
import { KpiCard } from "./KpiCard";
import { Section } from "./Section";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, CheckCircle, Flame } from "lucide-react";

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
    <div className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm">
      <p className="text-slate-300 font-medium mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ color: p.color }}>
          {p.name}: {formatBrl(p.value)}
        </p>
      ))}
      {flowValue !== undefined && (
        <p className={flowValue >= 0 ? "text-blue-400" : "text-slate-400"}>
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
    <Section title="Custo Mensal de Operação (Burn Rate)">
      <Collapsible open={open} onOpenChange={setOpen}>
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="flex items-center gap-2">
              <Flame className="h-5 w-5 text-slate-400" />
              <span className="text-3xl font-semibold text-white">~{formatBrl(burnTotal)}<span className="text-base text-slate-500 font-normal">/mês</span></span>
            </div>
            <div className="text-slate-500 text-sm mt-1">Custos fixos {formatBrl(fixedTotal)} + Tráfego {formatBrl(marketingMonth1)}</div>
          </div>
          <CollapsibleTrigger asChild>
            <button className="text-slate-500 hover:text-white transition-colors flex items-center gap-1 text-sm">
              {open ? "Recolher" : "Ver detalhes"}
              <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
            </button>
          </CollapsibleTrigger>
        </div>

        <CollapsibleContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
            <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/40">
              <div className="text-slate-500 text-xs font-medium mb-2 uppercase tracking-wider">Equipe (RH)</div>
              <div className="text-lg font-semibold text-white mb-2">{formatBrl(rhTotal)}<span className="text-xs text-slate-500">/mês</span></div>
              <div className="space-y-1">
                {costs.rhItems.map(item => (
                  <div key={item.id} className="flex justify-between text-xs">
                    <span className="text-slate-500">{item.label}</span>
                    <span className="text-slate-400">{formatBrl(item.value)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/40">
              <div className="text-slate-500 text-xs font-medium mb-2 uppercase tracking-wider">Ferramentas (BRL)</div>
              <div className="text-lg font-semibold text-white mb-2">{formatBrl(toolsBrlTotal)}<span className="text-xs text-slate-500">/mês</span></div>
              <div className="space-y-1">
                {costs.toolsBrlItems.map(item => (
                  <div key={item.id} className="flex justify-between text-xs">
                    <span className="text-slate-500">{item.label}</span>
                    <span className="text-slate-400">{formatBrl(item.value)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/40">
              <div className="text-slate-500 text-xs font-medium mb-2 uppercase tracking-wider">Ferramentas (USD)</div>
              <div className="text-lg font-semibold text-white mb-2">~{formatBrl(toolsUsdTotalBrl)}<span className="text-xs text-slate-500">/mês</span></div>
              <div className="space-y-1">
                {costs.toolsUsdItems.map(item => (
                  <div key={item.id} className="flex justify-between text-xs">
                    <span className="text-slate-500">{item.label} (${item.usd})</span>
                    <span className="text-slate-400">~{formatBrl(usdToBrl(item.usd))}</span>
                  </div>
                ))}
                <div className="text-slate-600 text-xs mt-1">Câmbio: R$ {costs.usdFx} + IOF {(costs.iofAndFeesRate * 100).toFixed(0)}%</div>
              </div>
            </div>

            <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/40">
              <div className="text-slate-500 text-xs font-medium mb-2 uppercase tracking-wider">Tráfego Pago</div>
              <div className="text-lg font-semibold text-white mb-2">{formatBrl(marketingMonth1)}<span className="text-xs text-slate-500">/mês</span></div>
              <div className="text-slate-600 text-xs">Investimento bruto em mídia do mês 1. Varia conforme o ritmo de aquisição do cenário.</div>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      <p className="text-slate-600 text-sm mt-4 italic border-l-2 border-slate-700 pl-3">
        Esse é o custo para manter a operação rodando. Nos primeiros meses, a receita não cobre esse custo — por isso o aporte cobre o gap até a receita escalar.
      </p>
    </Section>
  );
}

const phaseBorders = ["border-l-amber-500", "border-l-blue-500", "border-l-emerald-500"];

export function InvestmentView({ projectionRows, editableCosts }: { projectionRows: MonthResult[]; editableCosts: EditableCostsState }) {
  const { phases, cumulativeData, totalInvestmentNeeded, breakEvenMonth, marginMonth12, paybackMonth } =
    useMemo(() => computePhases(projectionRows), [projectionRows]);

  const marketingMonth1 = projectionRows[0]?.marketingGross ?? 0;

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
      <Section title="Track Record — Produto Validado">
        <p className="text-slate-500 text-sm mb-4">
          Período: <span className="text-slate-300 font-medium">{TRACK_RECORD.period}</span> — O produto já rodou, faturou e está a R$ 2k do breakeven.
        </p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/40">
            <div className="text-slate-500 text-xs font-medium mb-1">Investido até aqui</div>
            <div className="text-2xl font-semibold text-slate-200">{formatBrl(TRACK_RECORD.totalInvested)}</div>
          </div>
          <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/40">
            <div className="text-slate-500 text-xs font-medium mb-1">Receita bruta gerada</div>
            <div className="text-2xl font-semibold text-slate-200">{formatBrl(TRACK_RECORD.grossRevenue)}</div>
          </div>
          <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/40">
            <div className="text-slate-500 text-xs font-medium mb-1">Gap atual</div>
            <div className="text-2xl font-semibold text-slate-400">{formatBrl(TRACK_RECORD.currentResult)}</div>
            <div className="text-slate-600 text-xs mt-1">Quase breakeven</div>
          </div>
          <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/40">
            <div className="text-slate-500 text-xs font-medium mb-1">MRR validado (V2)</div>
            <div className="text-2xl font-semibold text-blue-400">{formatBrl(TRACK_RECORD.validatedMRR)}<span className="text-sm text-slate-500">/mês</span></div>
          </div>
        </div>
      </Section>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard title="Aporte adicional necessário" value={totalInvestmentNeeded > 0 ? brl(totalInvestmentNeeded) : "R$ 0"} sub="Soma dos déficits acumulados" />
        <KpiCard title="Meses até breakeven" value={breakEvenMonth ? `Mês ${breakEvenMonth}` : "—"} sub="Fluxo acumulado ≥ 0" />
        <KpiCard title="Margem no mês 12" value={pct(marginMonth12)} sub={`Lucro: ${brl(projectionRows[projectionRows.length - 1]?.profit ?? 0)}`} />
        <KpiCard title="Payback estimado" value={paybackMonth ? `Mês ${paybackMonth}` : "Após 12m"} sub="Acumulado recupera aporte" />
      </div>

      <BurnRatePanel costs={editableCosts} marketingMonth1={marketingMonth1} />

      <Section title="Aporte Faseado — Liberação por KPIs">
        <p className="text-slate-500 text-sm mb-4">
          O aporte de cada fase cobre o déficit operacional dos meses em que a receita ainda não paga todos os custos (RH, ferramentas, tráfego pago, COGS e impostos). O investidor só libera a próxima fase quando os KPIs forem atingidos.
        </p>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {phases.map((phase, i) => (
            <div key={phase.name} className={`bg-slate-800 border border-slate-700/50 border-l-4 ${phaseBorders[i]} rounded-xl p-5`}>
              <div className="mb-3">
                <div className="text-white font-semibold text-lg">{phase.name}</div>
                <div className="text-slate-500 text-xs">{phase.label} — Meses {phase.months[0] + 1}–{phase.months[phase.months.length - 1] + 1}</div>
              </div>

              <div className="bg-slate-700/30 rounded-lg p-3 mb-3">
                <div className="text-slate-500 text-xs mb-1">Aporte da fase</div>
                <div className="text-2xl font-semibold text-white">
                  {phase.investmentNeeded > 0 ? formatBrl(phase.investmentNeeded) : "R$ 0"}
                </div>
                {phase.investmentNeeded === 0 && (
                  <div className="flex items-center gap-1 text-blue-400 text-xs mt-1">
                    <CheckCircle className="h-3.5 w-3.5" /> Auto-sustentável
                  </div>
                )}
              </div>

              <div className="space-y-2 text-sm">
                <div className="text-slate-500 font-medium text-xs uppercase tracking-wider">KPIs de liberação</div>
                <div className="flex justify-between text-slate-300">
                  <span>Clientes ativos</span>
                  <span className="font-semibold text-white">{phase.kpis.clients}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Receita mensal</span>
                  <span className="font-semibold text-white">{formatBrl(phase.kpis.revenue)}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Churn máx.</span>
                  <span className="font-semibold text-white">{pct(phase.kpis.churn)}</span>
                </div>
              </div>

              {phase.monthDetails.some(m => m.gap < 0) && (
                <div className="mt-3 pt-3 border-t border-slate-700/50">
                  <div className="text-slate-500 font-medium text-xs uppercase tracking-wider mb-2">Composição mensal</div>
                  <div className="space-y-1.5">
                    {phase.monthDetails.map(m => (
                      <div key={m.month} className="flex items-center justify-between text-xs">
                        <span className="text-slate-500">Mês {m.month}</span>
                        <div className="flex gap-3">
                          <span className="text-slate-300">{formatBrl(m.revenue)}</span>
                          <span className="text-slate-500">-{formatBrl(m.totalCosts)}</span>
                          <span className={`font-semibold ${m.gap >= 0 ? "text-blue-400" : "text-slate-400"}`}>
                            {formatBrl(m.gap)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  {i === 0 && (
                    <div className="flex items-center justify-between text-xs mt-1.5 pt-1.5 border-t border-slate-700/30">
                      <span className="text-slate-500">Déficit histórico</span>
                      <span className="font-semibold text-slate-400">{formatBrl(TRACK_RECORD.currentResult)}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </Section>

      <Section title="Fluxo de Caixa Acumulado (12 meses)">
        <p className="text-slate-500 text-sm mb-4">
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
              <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine y={0} stroke="#64748b" strokeDasharray="6 3" label={{ value: "Breakeven", fill: "#64748b", fontSize: 12 }} />
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

      <Section title="Resumo Mensal">
        <ScrollArea className="w-full">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700 uppercase text-xs tracking-wider text-slate-500">
                <th className="text-left py-2 px-3 font-medium">Mês</th>
                <th className="text-right py-2 px-3 font-medium">Clientes</th>
                <th className="text-right py-2 px-3 font-medium">Receita</th>
                <th className="text-right py-2 px-3 font-medium">Despesas</th>
                <th className="text-right py-2 px-3 font-medium">Fluxo</th>
                <th className="text-right py-2 px-3 font-medium">Acumulado</th>
              </tr>
            </thead>
            <tbody>
              {tableRows.map((r, idx) => (
                <tr key={r.month} className={`border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors ${idx % 2 === 0 ? "bg-slate-800/30" : ""}`}>
                  <td className="py-2 px-3 text-slate-300 font-medium">Mês {r.month}</td>
                  <td className="py-2 px-3 text-right text-slate-400">{r.clients}</td>
                  <td className="py-2 px-3 text-right text-slate-300">{formatBrl(r.revenue)}</td>
                  <td className="py-2 px-3 text-right text-slate-400">{formatBrl(r.expenses)}</td>
                  <td className={`py-2 px-3 text-right font-medium ${r.flow >= 0 ? "text-blue-400" : "text-slate-400"}`}>
                    {formatBrl(r.flow)}
                  </td>
                  <td className={`py-2 px-3 text-right font-medium ${r.cumulative >= 0 ? "text-blue-400" : "text-slate-400"}`}>
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

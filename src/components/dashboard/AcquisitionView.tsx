import { useState } from "react";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, ComposedChart,
  Legend, Line, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { brl, ASSUMPTIONS, type MonthResult, type PlanKey } from "@/lib/financial-engine";
import { KpiCard } from "./KpiCard";
import { Section } from "./Section";
import { Slider } from "@/components/ui/slider";

interface Props {
  projectionRows: MonthResult[];
  avgNewPerMonth: number;
  newSchedule: number[];
  last: MonthResult;
}

export function AcquisitionView({ projectionRows, avgNewPerMonth, newSchedule, last }: Props) {
  const [budget, setBudget] = useState(5000);

  const enrichedRows = projectionRows.reduce<(MonthResult & { marketingCumulative: number })[]>((acc, row, idx) => {
    const prev = idx > 0 ? acc[idx - 1].marketingCumulative : 0;
    acc.push({ ...row, marketingCumulative: prev + row.marketingNet });
    return acc;
  }, []);

  const totalInvestment = projectionRows.reduce((acc, r) => acc + r.marketingNet, 0);
  const totalMarketingGross = projectionRows.reduce((acc, r) => acc + r.marketingGross, 0);
  const avgMonthlyGross = totalMarketingGross / 12;

  const mix = ASSUMPTIONS.mix;
  const cacByPlan = ASSUMPTIONS.cacByPlanGross;
  const plans = ASSUMPTIONS.plans;
  const planKeys = Object.keys(mix) as PlanKey[];
  const cacBlendedGross = planKeys.reduce((acc, k) => acc + cacByPlan[k] * mix[k], 0);

  const clientesNovos = cacBlendedGross > 0 ? budget / cacBlendedGross : 0;
  const clientesPorPlano = planKeys.map(k => ({
    key: k,
    label: plans[k].label,
    count: clientesNovos * mix[k],
    revenue: clientesNovos * mix[k] * plans[k].price,
  }));
  const receitaEstimada = clientesPorPlano.reduce((acc, p) => acc + p.revenue, 0);
  const roi = budget > 0 ? receitaEstimada / budget : 0;

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard title="Novos clientes/mês" value={`${avgNewPerMonth}`} sub="média (rampa progressiva)" />
        <KpiCard title="Novos mês 1" value={`${newSchedule[0]}`} sub="início da rampa" />
        <KpiCard title="Novos mês 12" value={`${newSchedule[11]}`} sub="fim da rampa" />
        <KpiCard title="Investimento médio/mês" value={brl(avgMonthlyGross)} sub="tráfego pago (bruto)" />
        <KpiCard title="Teste pago (mês 12)" value={brl(last.paidTestRevenue)} sub="abatimento do CAC" />
        <KpiCard title="CAC líquido (mês 12)" value={brl(last.cacBlendedNet)} sub="custo por cliente novo" />
        <KpiCard title="Investimento total 12m" value={brl(totalInvestment)} sub="marketing líquido acumulado" />
      </div>

      <Section title="Evolução de Clientes">
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={projectionRows}>
            <defs>
              <linearGradient id="gradActive" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="month" stroke="hsl(var(--muted))" />
            <YAxis stroke="hsl(var(--muted))" />
            <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }}
              itemStyle={{ color: "hsl(var(--foreground))" }} labelStyle={{ color: "hsl(var(--foreground))" }}
              formatter={(value: number) => `${value} clientes`} />
            <Legend />
            <Area type="monotone" dataKey="activeCustomers" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#gradActive)" name="Clientes ativos" />
            <Line type="monotone" dataKey="newCustomers" stroke="hsl(var(--muted))" strokeWidth={1.5} dot={false} name="Novos/mês" />
          </AreaChart>
        </ResponsiveContainer>
        <div className="mt-2 text-xs text-muted-foreground">
          A base de clientes cresce mês a mês com aquisição constante. A linha cinza mostra a reposição + crescimento mensal.
        </div>
      </Section>

      <Section title="Marketing — Mensal vs Acumulado">
        <ResponsiveContainer width="100%" height={260}>
          <ComposedChart data={enrichedRows}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="month" stroke="hsl(var(--muted))" />
            <YAxis yAxisId="left" stroke="hsl(var(--muted))" tickFormatter={(v: number) => `R$${(v / 1000).toFixed(0)}k`} />
            <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--muted))" tickFormatter={(v: number) => `R$${(v / 1000).toFixed(0)}k`} />
            <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }}
              itemStyle={{ color: "hsl(var(--foreground))" }} labelStyle={{ color: "hsl(var(--foreground))" }}
              formatter={(value: number) => brl(value)} />
            <Legend />
            <Bar yAxisId="left" dataKey="marketingNet" fill="hsl(var(--muted))" opacity={0.6} name="Marketing líquido/mês" />
            <Line yAxisId="right" type="monotone" dataKey="marketingCumulative" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} name="Acumulado 12m" />
          </ComposedChart>
        </ResponsiveContainer>
        <div className="mt-2 text-xs text-muted-foreground">
          Barras = gasto líquido mensal (após abatimento do teste pago). Linha = investimento total acumulado ao longo dos 12 meses.
        </div>
      </Section>

      <Section title="CAC por Cliente — Bruto vs Líquido">
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={projectionRows}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="month" stroke="hsl(var(--muted))" />
            <YAxis stroke="hsl(var(--muted))" tickFormatter={(v: number) => brl(v)} />
            <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }}
              itemStyle={{ color: "hsl(var(--foreground))" }} labelStyle={{ color: "hsl(var(--foreground))" }}
              formatter={(value: number) => brl(value)} />
            <Legend />
            <Bar dataKey="cacBlendedGross" fill="hsl(var(--muted))" opacity={0.5} name="CAC bruto" />
            <Bar dataKey="cacBlendedNet" fill="hsl(var(--primary))" name="CAC líquido" />
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-2 text-xs text-muted-foreground">
          A diferença entre o CAC bruto e líquido mostra o impacto do teste pago na redução do custo de aquisição.
        </div>
      </Section>

      <Section title="Simulador de Orçamento de Tráfego Pago">
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">Orçamento mensal:</span>
              <span className="text-2xl font-semibold text-foreground">{brl(budget)}</span>
            </div>
            <Slider
              value={[budget]}
              onValueChange={(v) => setBudget(v[0])}
              min={1000}
              max={50000}
              step={500}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground/60 mt-1">
              <span>R$ 1.000</span>
              <span>R$ 50.000</span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-accent/60 border border-border rounded-lg p-4 text-center">
              <div className="text-muted text-xs mb-1">Clientes novos/mês</div>
              <div className="text-2xl font-semibold text-foreground">{clientesNovos.toFixed(1)}</div>
              <div className="text-muted-foreground/60 text-xs mt-1">CAC blended: {brl(cacBlendedGross)}</div>
            </div>
            <div className="bg-accent/60 border border-border rounded-lg p-4">
              <div className="text-muted text-xs mb-2">Distribuição por plano</div>
              {clientesPorPlano.map(p => (
                <div key={p.key} className="flex justify-between text-sm text-muted-foreground">
                  <span>{p.label}</span>
                  <span className="font-medium text-foreground">{p.count.toFixed(1)}</span>
                </div>
              ))}
            </div>
            <div className="bg-accent/60 border border-border rounded-lg p-4 text-center">
              <div className="text-muted text-xs mb-1">Receita mensal estimada</div>
              <div className="text-2xl font-semibold text-foreground">{brl(receitaEstimada)}</div>
              <div className="text-muted-foreground/60 text-xs mt-1">dos novos clientes</div>
            </div>
            <div className="bg-accent/60 border border-border rounded-lg p-4 text-center">
              <div className="text-muted text-xs mb-1">ROI estimado</div>
              <div className="text-2xl font-semibold text-primary">{roi.toFixed(1)}x</div>
              <div className="text-muted-foreground/60 text-xs mt-1">receita / investimento</div>
            </div>
          </div>

          <div className="text-xs text-muted-foreground/60">
            * Simulação baseada no CAC blended bruto ({brl(cacBlendedGross)}/cliente) e no mix atual de planos. Não considera churn, sazonalidade ou variações de conversão.
          </div>
        </div>
      </Section>

      <div className="mt-4 bg-card border border-border rounded-lg p-4 text-xs text-muted-foreground leading-relaxed">
        <span className="text-foreground/70 font-medium">Sobre o modelo:</span> A projeção usa uma <span className="text-foreground font-medium">rampa progressiva de aquisição</span> — o mês 1 começa com ~50% da média e o mês 12 atinge ~150%, simulando o aquecimento natural do marketing. O solver encontra a média ideal para atingir a meta de clientes ao final de 12 meses.
      </div>
    </>
  );
}

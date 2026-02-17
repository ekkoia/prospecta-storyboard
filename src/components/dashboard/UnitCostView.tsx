import { useMemo } from "react";
import { ASSUMPTIONS, brl, pct, sumFixedCosts, type MonthResult, type PlanKey } from "@/lib/financial-engine";
import { KpiCard } from "./KpiCard";
import { Section } from "./Section";
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from "recharts";

interface Props {
  last: MonthResult;
  projectionRows: MonthResult[];
}

export function UnitCostView({ last, projectionRows }: Props) {
  const activeCount = last.activeCustomers;

  const rows = useMemo(() => {
    const fixed = sumFixedCosts(activeCount).totalFixed;
    return (Object.keys(ASSUMPTIONS.plans) as PlanKey[]).map((k) => {
      const price = ASSUMPTIONS.plans[k].price;
      const cogs = ASSUMPTIONS.cogsByPlan[k];
      return {
        plano: ASSUMPTIONS.plans[k].label,
        preco: price,
        cogs,
        margemBruta: price > 0 ? (price - cogs) / price : 0,
        fixedAlloc: fixed / activeCount,
        unitCostTotal: cogs + fixed / activeCount,
      };
    });
  }, [activeCount]);

  const weightedMargin = useMemo(() => {
    const keys = Object.keys(ASSUMPTIONS.plans) as PlanKey[];
    return keys.reduce((acc, k) => {
      const price = ASSUMPTIONS.plans[k].price;
      const cogs = ASSUMPTIONS.cogsByPlan[k];
      const margin = price > 0 ? (price - cogs) / price : 0;
      return acc + ASSUMPTIONS.mix[k] * margin;
    }, 0);
  }, []);

  const chartData = useMemo(() => {
    return projectionRows.map((r) => ({
      month: `Mês ${r.month}`,
      cogs: Math.round(r.cogsPerActive),
      fixos: Math.round(r.fixedPerActive),
      margem: Math.round(r.margin * 1000) / 10,
    }));
  }, [projectionRows]);

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
        <KpiCard title="COGS por cliente (mês 12)" value={brl(last.cogsPerActive)} sub="inclui voz (se habilitado)" />
        <KpiCard title="Fixos por cliente (mês 12)" value={brl(last.fixedPerActive)} sub="fixos / clientes ativos" />
        <KpiCard title="Custo unitário (sem mkt)" value={brl(last.unitCostPerActiveExMarketing)} sub="COGS + rateio fixo" />
        <KpiCard title="Margem líquida (mês 12)" value={pct(last.margin)} sub="já com impostos" />
        <KpiCard title="Margem bruta ponderada" value={pct(weightedMargin)} sub="média pelo mix de planos" />
      </div>

      <Section title="Evolução de custos unitários (12 meses)">
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={{ fill: "hsl(var(--muted))", fontSize: 12 }} />
              <YAxis yAxisId="left" tick={{ fill: "hsl(var(--muted))", fontSize: 12 }} tickFormatter={(v) => `R$${v}`} />
              <YAxis yAxisId="right" orientation="right" tick={{ fill: "hsl(var(--muted))", fontSize: 12 }} tickFormatter={(v) => `${v}%`} />
              <Tooltip
                contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }}
                labelStyle={{ color: "hsl(var(--foreground))" }}
                formatter={(value: number, name: string) => {
                  if (name === "margem") return [`${value}%`, "Margem líquida"];
                  const label = name === "cogs" ? "COGS/cliente" : "Fixos/cliente";
                  return [`R$ ${value}`, label];
                }}
                itemStyle={{ color: "hsl(var(--foreground))" }}
              />
              <Legend
                formatter={(value) => {
                  const labels: Record<string, string> = { cogs: "COGS/cliente", fixos: "Fixos/cliente", margem: "Margem líquida (%)" };
                  return <span style={{ color: "hsl(var(--muted))" }}>{labels[value] || value}</span>;
                }}
              />
              <Bar yAxisId="left" dataKey="cogs" stackId="cost" fill="hsl(var(--muted))" radius={[0, 0, 0, 0]} />
              <Bar yAxisId="left" dataKey="fixos" stackId="cost" fill="hsl(var(--muted-foreground))" radius={[4, 4, 0, 0]} />
              <Line yAxisId="right" type="monotone" dataKey="margem" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ fill: "hsl(var(--primary))", r: 4 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-3 text-xs text-muted-foreground leading-relaxed">
          <span className="text-foreground/70 font-medium">Leitura:</span> À medida que a base cresce, os custos fixos se diluem por cliente, melhorando a margem líquida.
        </div>
        <div className="mt-2 text-xs text-muted-foreground leading-relaxed">
          <span className="text-foreground/70 font-medium">Importante:</span> A margem líquida neste gráfico reflete a <strong className="text-foreground">fase de crescimento</strong> (50 → {activeCount} clientes), onde os custos de marketing e aquisição são maiores. A margem no <strong className="text-foreground">Investor View</strong> assume a base já estabilizada no target, com marketing apenas de reposição de churn — por isso é naturalmente mais alta.
        </div>
      </Section>

      <Section title={`Custo por cliente — separado por plano (${activeCount} clientes ativos)`}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-border">
                {["Plano", "Preço", "COGS (variável)", "Margem Bruta", "Fixos/cliente", "Custo total/cliente"].map((h, i) => (
                  <th key={h} className={`${i === 0 ? "text-left" : "text-right"} uppercase text-xs tracking-wider text-muted font-medium py-3 px-3`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, idx) => (
                <tr key={idx} className={`border-b border-border/50 ${idx % 2 === 0 ? "bg-accent/20" : ""}`}>
                  <td className="py-3 px-3 text-foreground font-medium">{r.plano}</td>
                  <td className="py-3 px-3 text-right text-foreground font-medium">{brl(r.preco)}</td>
                  <td className="py-3 px-3 text-right text-muted-foreground">{brl(r.cogs)}</td>
                  <td className="py-3 px-3 text-right text-foreground/80 font-medium">{pct(r.margemBruta)}</td>
                  <td className="py-3 px-3 text-right text-muted-foreground">{brl(r.fixedAlloc)}</td>
                  <td className="py-3 px-3 text-right text-foreground font-medium">{brl(r.unitCostTotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-3 text-xs text-muted-foreground leading-relaxed">
          <span className="text-foreground/70 font-medium">Nota:</span> Rateio de custos fixos baseado em <strong className="text-foreground">{activeCount}</strong> clientes ativos (mês 12 do cenário selecionado). COGS por plano é o custo variável por cliente/mês.
        </div>
      </Section>
    </>
  );
}

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
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <KpiCard title="COGS por cliente (mês 12)" value={brl(last.cogsPerActive)} sub="inclui voz (se habilitado)" tone="pink" />
        <KpiCard title="Fixos por cliente (mês 12)" value={brl(last.fixedPerActive)} sub="fixos / clientes ativos" tone="orange" />
        <KpiCard title="Custo unitário (sem mkt)" value={brl(last.unitCostPerActiveExMarketing)} sub="COGS + rateio fixo" tone="blue" />
        <KpiCard title="Margem líquida (mês 12)" value={pct(last.margin)} sub="já com impostos" tone="purple" />
        <KpiCard title="Margem bruta ponderada" value={pct(weightedMargin)} sub="média pelo mix de planos" tone="green" />
      </div>

      <Section title="📈 Evolução de custos unitários (12 meses)">
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="month" tick={{ fill: "#94a3b8", fontSize: 12 }} />
              <YAxis yAxisId="left" tick={{ fill: "#94a3b8", fontSize: 12 }} tickFormatter={(v) => `R$${v}`} />
              <YAxis yAxisId="right" orientation="right" tick={{ fill: "#94a3b8", fontSize: 12 }} tickFormatter={(v) => `${v}%`} />
              <Tooltip
                contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569", borderRadius: "8px" }}
                labelStyle={{ color: "#e2e8f0" }}
                formatter={(value: number, name: string) => {
                  if (name === "margem") return [`${value}%`, "Margem líquida"];
                  const label = name === "cogs" ? "COGS/cliente" : "Fixos/cliente";
                  return [`R$ ${value}`, label];
                }}
                itemStyle={{ color: "#e2e8f0" }}
              />
              <Legend
                formatter={(value) => {
                  const labels: Record<string, string> = { cogs: "COGS/cliente", fixos: "Fixos/cliente", margem: "Margem líquida (%)" };
                  return <span style={{ color: "#cbd5e1" }}>{labels[value] || value}</span>;
                }}
              />
              <Bar yAxisId="left" dataKey="cogs" stackId="cost" fill="#f472b6" radius={[0, 0, 0, 0]} />
              <Bar yAxisId="left" dataKey="fixos" stackId="cost" fill="#fb923c" radius={[4, 4, 0, 0]} />
              <Line yAxisId="right" type="monotone" dataKey="margem" stroke="#a78bfa" strokeWidth={3} dot={{ fill: "#a78bfa", r: 4 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-3 text-xs text-slate-400 leading-relaxed">
          <span className="text-slate-200 font-semibold">Leitura:</span> À medida que a base cresce, os custos fixos se diluem por cliente, melhorando a margem líquida.
        </div>
      </Section>

      <Section title={`🧾 Custo por cliente — separado por plano (${activeCount} clientes ativos)`}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-slate-600">
                {["Plano", "Preço", "COGS (variável)", "Margem Bruta", "Fixos/cliente", "Custo total/cliente"].map((h, i) => (
                  <th key={h} className={`${i === 0 ? "text-left" : "text-right"} text-slate-300 font-bold py-3 px-3 bg-slate-900`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, idx) => (
                <tr key={idx} className={`border-b border-slate-700 ${idx % 2 === 0 ? "bg-slate-800/50" : ""}`}>
                  <td className="py-3 px-3 text-white font-bold">{r.plano}</td>
                  <td className="py-3 px-3 text-right text-green-400 font-semibold">{brl(r.preco)}</td>
                  <td className="py-3 px-3 text-right text-red-400">{brl(r.cogs)}</td>
                  <td className="py-3 px-3 text-right text-purple-400 font-bold">{pct(r.margemBruta)}</td>
                  <td className="py-3 px-3 text-right text-slate-300">{brl(r.fixedAlloc)}</td>
                  <td className="py-3 px-3 text-right text-slate-100 font-semibold">{brl(r.unitCostTotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-3 text-xs text-slate-400 leading-relaxed">
          <span className="text-slate-200 font-semibold">Nota:</span> Rateio de custos fixos baseado em <strong className="text-white">{activeCount}</strong> clientes ativos (mês 12 do cenário selecionado). COGS por plano é o custo variável por cliente/mês.
        </div>
      </Section>
    </>
  );
}

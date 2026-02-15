import { useMemo } from "react";
import { ASSUMPTIONS, brl, pct, sumFixedCosts, type MonthResult, type PlanKey } from "@/lib/financial-engine";
import { KpiCard } from "./KpiCard";
import { Section } from "./Section";

interface Props {
  last: MonthResult;
}

export function UnitCostView({ last }: Props) {
  const rows = useMemo(() => {
    const fixed = sumFixedCosts(500).totalFixed;
    return (Object.keys(ASSUMPTIONS.plans) as PlanKey[]).map((k) => {
      const price = ASSUMPTIONS.plans[k].price;
      const cogs = ASSUMPTIONS.cogsByPlan[k];
      return {
        plano: ASSUMPTIONS.plans[k].label,
        preco: price,
        cogs,
        margemBruta: price > 0 ? (price - cogs) / price : 0,
        fixedAlloc: fixed / 500,
        unitCostTotal: cogs + fixed / 500,
      };
    });
  }, []);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <KpiCard title="COGS por cliente (mês 12)" value={brl(last.cogsPerActive)} sub="inclui voz (se habilitado)" tone="pink" />
        <KpiCard title="Fixos por cliente (mês 12)" value={brl(last.fixedPerActive)} sub="fixos / clientes ativos" tone="orange" />
        <KpiCard title="Custo unitário (sem marketing)" value={brl(last.unitCostPerActiveExMarketing)} sub="COGS + rateio fixo" tone="blue" />
        <KpiCard title="Margem líquida (mês 12)" value={pct(last.margin)} sub="já com impostos" tone="purple" />
      </div>

      <Section title="🧾 Custo por cliente — separado por plano">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-slate-600">
                {["Plano", "Preço", "COGS (variável)", "Margem Bruta", "Fixos/cliente (ex.)", "Custo total/cliente (ex.)"].map((h, i) => (
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
          <span className="text-slate-200 font-semibold">Como usar:</span> COGS por plano é "custo variável por cliente/mês". O campo de fixos/cliente é só um exemplo de rateio para mostrar pressão de break-even.
        </div>
      </Section>
    </>
  );
}

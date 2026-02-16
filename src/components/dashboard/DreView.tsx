import { useMemo } from "react";
import { brl, pct, type MonthResult } from "@/lib/financial-engine";
import { KpiCard } from "./KpiCard";
import { Section } from "./Section";
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from "recharts";

interface Props {
  currentStatic: MonthResult;
  projectionRows: MonthResult[];
}

export function DreView({ currentStatic, projectionRows }: Props) {
  const totals = useMemo(() => {
    const revenue = projectionRows.reduce((a, r) => a + r.revenueTotal, 0);
    const marketingGross = projectionRows.reduce((a, r) => a + r.marketingGross, 0);
    const marketing = projectionRows.reduce((a, r) => a + r.marketingNet, 0);
    const profit = projectionRows.reduce((a, r) => a + r.profit, 0);
    const newCust = projectionRows.reduce((a, r) => a + r.newCustomers, 0);
    return { revenue, marketingGross, marketing, profit, newCust, margin: revenue > 0 ? profit / revenue : 0 };
  }, [projectionRows]);

  const chartData = useMemo(() =>
    projectionRows.map(r => ({
      name: `M${r.month}`,
      receita: Math.round(r.revenueTotal),
      lucro: Math.round(r.profit),
      margem: +(r.margin * 100).toFixed(1),
    })), [projectionRows]);

  const last = projectionRows[projectionRows.length - 1];

  return (
    <>
      {/* KPIs — 5 colunas */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <KpiCard title="Receita total (cenário)" value={brl(currentStatic.revenueTotal)} sub="assinaturas + extras" tone="green" />
        <KpiCard title="COGS total" value={brl(currentStatic.cogsTotal)} sub="variáveis (incl. voz)" tone="pink" />
        <KpiCard title="Marketing líquido" value={brl(currentStatic.marketingNet)} sub="gasto do mês" tone="orange" />
        <KpiCard title="Lucro líquido" value={brl(currentStatic.profit)} sub={`Margem: ${pct(currentStatic.margin)}`} tone="blue" />
        <KpiCard title="Lucro acum. 12 meses" value={brl(totals.profit)} sub={`Margem média: ${pct(totals.margin)}`} tone="purple" />
      </div>

      {/* DRE estática com decomposição */}
      <Section title="📑 DRE (detalhada) — cenário selecionado">
        <div className="space-y-3">
          {/* Bloco de receitas decompostas */}
          <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">Receitas</div>
          {[
            ["(+) Assinaturas", currentStatic.subscriptionRevenue],
            ["(+) Onboarding premium", currentStatic.onboardingRevenue],
            ["(+) Upsells (WhatsApp + buscas)", currentStatic.upsellRevenue],
            ["(+) Packs de voz", currentStatic.voiceRevenue],
          ].map(([label, val]) => (
            <div key={label as string} className="flex justify-between items-center p-3 bg-green-900/20 rounded-lg">
              <span className="text-green-300/80 text-sm">{label as string}</span>
              <span className="text-green-400 font-semibold">{brl(val as number)}</span>
            </div>
          ))}
          <div className="flex justify-between items-center p-4 bg-green-900/30 rounded-lg border border-green-700">
            <span className="text-green-300 font-semibold">(=) Receita total</span>
            <span className="text-green-400 text-xl font-bold">{brl(currentStatic.revenueTotal)}</span>
          </div>

          {/* Deduções */}
          <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold mt-4 mb-1">Deduções</div>
          {[
            ["(-) COGS (custos variáveis)", currentStatic.cogsTotal],
            ["(-) Fixos", currentStatic.fixedCosts],
            ["(-) Comissão closer (somente novas vendas)", currentStatic.closerCommission],
            [`(-) Impostos — ${currentStatic.regime} (Fator R: ${pct(currentStatic.fatorR)}, alíq.: ${pct(currentStatic.taxRate)})`, currentStatic.taxes],
          ].map(([label, val]) => (
            <div key={label as string} className="flex justify-between items-center p-4 bg-slate-700 rounded-lg">
              <span className="text-slate-300">{label as string}</span>
              <span className="text-red-400 font-semibold">{brl(val as number)}</span>
            </div>
          ))}

          {/* Marketing com decomposição */}
          <div className="flex justify-between items-center p-4 bg-slate-700 rounded-lg">
            <span className="text-slate-300">(-) Marketing líquido do mês</span>
            <span className="text-red-400 font-semibold">{brl(currentStatic.marketingNet)}</span>
          </div>
          <div className="ml-6 space-y-1">
            <div className="flex justify-between items-center p-2 bg-slate-700/50 rounded text-xs">
              <span className="text-slate-400">Marketing bruto</span>
              <span className="text-orange-300">{brl(currentStatic.marketingGross)}</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-slate-700/50 rounded text-xs">
              <span className="text-slate-400">(-) Receita teste pago</span>
              <span className="text-green-300">{brl(currentStatic.paidTestRevenue)}</span>
            </div>
          </div>

          {/* Resultado */}
          <div className="flex justify-between items-center p-4 bg-gradient-to-r from-blue-900/50 to-purple-900/50 rounded-lg border-2 border-blue-600 mt-4">
            <span className="text-blue-300 font-bold text-lg">(=) Lucro líquido</span>
            <span className="text-blue-400 text-2xl font-bold">{brl(currentStatic.profit)}</span>
          </div>
        </div>
        <div className="mt-4 text-xs text-slate-400 leading-relaxed">
          <span className="text-slate-200 font-semibold">Ponto crítico:</span> comissão do closer NÃO incide sobre toda a receita — apenas sobre vendas novas fechadas por ele.
        </div>
      </Section>

      {/* Gráfico Receita vs Lucro */}
      <Section title="📈 Evolução — Receita vs Lucro (12 meses)">
        <ResponsiveContainer width="100%" height={350}>
          <ComposedChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
            <YAxis yAxisId="left" stroke="#94a3b8" fontSize={11} tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`} />
            <YAxis yAxisId="right" orientation="right" stroke="#94a3b8" fontSize={11} tickFormatter={(v: number) => `${v}%`} />
            <Tooltip
              contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569", borderRadius: 8 }}
              labelStyle={{ color: "#e2e8f0" }}
              formatter={(value: number, name: string) =>
                name === "margem" ? [`${value}%`, "Margem %"] : [brl(value), name === "receita" ? "Receita" : "Lucro"]
              }
            />
            <Legend />
            <Bar yAxisId="left" dataKey="receita" name="Receita" fill="#22c55e" radius={[4, 4, 0, 0]} opacity={0.7} />
            <Line yAxisId="left" dataKey="lucro" name="Lucro" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 3 }} />
            <Line yAxisId="right" dataKey="margem" name="Margem %" stroke="#a78bfa" strokeWidth={2} strokeDasharray="5 5" dot={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </Section>

      {/* Tabela 12 meses com totais */}
      <div className="mt-6 bg-slate-800 rounded-xl p-6 shadow-xl">
        <h3 className="text-xl font-semibold text-white mb-4">📋 Projeção 12 meses — tabela resumida</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-slate-600">
                {["Mês", "Ativos", "Novos", "Receita", "Mkt Bruto", "Marketing (líq.)", "CAC/cliente", "Lucro", "Margem"].map((h, i) => (
                  <th key={h} className={`${i === 0 ? "text-left" : "text-right"} text-slate-300 font-bold py-3 px-3 bg-slate-900`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {projectionRows.map((r, idx) => (
                <tr key={idx} className={`border-b border-slate-700 hover:bg-slate-700/40 ${idx % 2 === 0 ? "bg-slate-800/50" : ""}`}>
                  <td className="py-3 px-3 text-white font-bold">{r.month}</td>
                  <td className="py-3 px-3 text-right text-orange-400 font-semibold">{r.activeCustomers}</td>
                  <td className="py-3 px-3 text-right text-sky-300 font-semibold">{r.newCustomers}</td>
                  <td className="py-3 px-3 text-right text-green-400 font-semibold">{brl(r.revenueTotal)}</td>
                  <td className="py-3 px-3 text-right text-orange-300">{brl(r.marketingGross)}</td>
                  <td className="py-3 px-3 text-right text-red-400">{brl(r.marketingNet)}</td>
                  <td className="py-3 px-3 text-right text-purple-400 font-bold">{brl(r.cacBlendedNet)}</td>
                  <td className="py-3 px-3 text-right text-blue-400 font-bold">{brl(r.profit)}</td>
                  <td className="py-3 px-3 text-right text-slate-100 font-bold">{pct(r.margin)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-slate-500 bg-slate-900/80">
                <td className="py-3 px-3 text-white font-bold">Total</td>
                <td className="py-3 px-3 text-right text-orange-300 font-bold">{last?.activeCustomers ?? "—"}</td>
                <td className="py-3 px-3 text-right text-sky-200 font-bold">{totals.newCust}</td>
                <td className="py-3 px-3 text-right text-green-300 font-bold">{brl(totals.revenue)}</td>
                <td className="py-3 px-3 text-right text-orange-200 font-bold">{brl(totals.marketingGross)}</td>
                <td className="py-3 px-3 text-right text-red-300 font-bold">{brl(totals.marketing)}</td>
                <td className="py-3 px-3 text-right text-purple-300">—</td>
                <td className="py-3 px-3 text-right text-blue-300 font-bold">{brl(totals.profit)}</td>
                <td className="py-3 px-3 text-right text-slate-100 font-bold">{pct(totals.margin)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
        <div className="mt-3 text-xs text-slate-400">
          "Mkt Bruto" é o valor total investido em tráfego pago. "Marketing (líq.)" é o bruto menos a receita do teste pago. "CAC/cliente" é gasto líquido dividido por novos clientes.
        </div>
      </div>

      {/* Nota explicativa */}
      <div className="mt-4 text-xs text-slate-400 leading-relaxed">
        <span className="text-amber-400 font-semibold">Importante:</span> A DRE estática (acima) assume a base <strong className="text-white">já estabilizada</strong> no cenário selecionado, com marketing apenas de reposição de churn. A tabela e o gráfico de 12 meses refletem a <strong className="text-white">fase de crescimento</strong> (50 → {last?.activeCustomers ?? "—"} clientes), onde os custos de aquisição são significativamente maiores — por isso a margem tende a ser menor durante a expansão.
      </div>
    </>
  );
}

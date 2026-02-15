import { brl, pct, type MonthResult } from "@/lib/financial-engine";
import { KpiCard } from "./KpiCard";
import { Section } from "./Section";

interface Props {
  currentStatic: MonthResult;
  projectionRows: MonthResult[];
}

export function DreView({ currentStatic, projectionRows }: Props) {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <KpiCard title="Receita total (cenário)" value={brl(currentStatic.revenueTotal)} sub="assinaturas + extras" tone="green" />
        <KpiCard title="COGS total" value={brl(currentStatic.cogsTotal)} sub="variáveis (incl. voz)" tone="pink" />
        <KpiCard title="Marketing líquido" value={brl(currentStatic.marketingNet)} sub="gasto do mês" tone="orange" />
        <KpiCard title="Lucro líquido" value={brl(currentStatic.profit)} sub={`Margem: ${pct(currentStatic.margin)}`} tone="blue" />
      </div>

      <Section title="📑 DRE (claro) — cenário selecionado">
        <div className="space-y-3">
          <div className="flex justify-between items-center p-4 bg-green-900/30 rounded-lg border border-green-700">
            <span className="text-green-300 font-semibold">Receita total</span>
            <span className="text-green-400 text-xl font-bold">{brl(currentStatic.revenueTotal)}</span>
          </div>
          {[
            ["(-) COGS (custos variáveis)", currentStatic.cogsTotal],
            ["(-) Fixos", currentStatic.fixedCosts],
            ["(-) Marketing líquido do mês", currentStatic.marketingNet],
            ["(-) Comissão closer (somente novas vendas)", currentStatic.closerCommission],
            [`(-) Impostos (faixa: ${pct(currentStatic.taxRate)})`, currentStatic.taxes],
          ].map(([label, val]) => (
            <div key={label as string} className="flex justify-between items-center p-4 bg-slate-700 rounded-lg">
              <span className="text-slate-300">{label as string}</span>
              <span className="text-red-400 font-semibold">{brl(val as number)}</span>
            </div>
          ))}
          <div className="flex justify-between items-center p-4 bg-gradient-to-r from-blue-900/50 to-purple-900/50 rounded-lg border-2 border-blue-600">
            <span className="text-blue-300 font-bold text-lg">(=) Lucro líquido</span>
            <span className="text-blue-400 text-2xl font-bold">{brl(currentStatic.profit)}</span>
          </div>
        </div>
        <div className="mt-4 text-xs text-slate-400 leading-relaxed">
          <span className="text-slate-200 font-semibold">Ponto crítico:</span> comissão do closer NÃO incide sobre toda a receita — apenas sobre vendas novas fechadas por ele.
        </div>
      </Section>

      <div className="mt-6 bg-slate-800 rounded-xl p-6 shadow-xl">
        <h3 className="text-xl font-semibold text-white mb-4">📋 Projeção 12 meses — tabela resumida</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-slate-600">
                {["Mês", "Ativos", "Novos", "Receita", "Marketing (líq.)", "CAC/cliente", "Lucro", "Margem"].map((h, i) => (
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
                  <td className="py-3 px-3 text-right text-red-400">{brl(r.marketingNet)}</td>
                  <td className="py-3 px-3 text-right text-purple-400 font-bold">{brl(r.cacBlendedNet)}</td>
                  <td className="py-3 px-3 text-right text-blue-400 font-bold">{brl(r.profit)}</td>
                  <td className="py-3 px-3 text-right text-slate-100 font-bold">{pct(r.margin)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-3 text-xs text-slate-400">
          "Marketing (líq.)" é gasto do mês. "CAC/cliente" é gasto do mês dividido por novos clientes.
        </div>
      </div>
    </>
  );
}

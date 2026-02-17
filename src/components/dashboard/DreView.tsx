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
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
        <KpiCard title="Receita total (cenário)" value={brl(currentStatic.revenueTotal)} sub="assinaturas + extras" />
        <KpiCard title="COGS total" value={brl(currentStatic.cogsTotal)} sub="variáveis (incl. voz)" />
        <KpiCard title="Marketing líquido" value={brl(currentStatic.marketingNet)} sub="gasto do mês" />
        <KpiCard title="Lucro líquido" value={brl(currentStatic.profit)} sub={`Margem: ${pct(currentStatic.margin)}`} />
        <KpiCard title="Lucro acum. 12 meses" value={brl(totals.profit)} sub={`Margem média: ${pct(totals.margin)}`} />
      </div>

      <Section title="DRE (detalhada) — cenário selecionado">
        <div className="space-y-3">
          <div className="text-xs text-muted uppercase tracking-wider font-medium mb-1">Receitas</div>
          {[
            ["(+) Assinaturas", currentStatic.subscriptionRevenue],
            ["(+) Onboarding premium", currentStatic.onboardingRevenue],
            ["(+) Upsells (WhatsApp + buscas)", currentStatic.upsellRevenue],
            ["(+) Packs de voz", currentStatic.voiceRevenue],
          ].map(([label, val]) => (
            <div key={label as string} className="flex justify-between items-center p-3 bg-accent/40 border border-border rounded-lg">
              <span className="text-muted-foreground text-sm">{label as string}</span>
              <span className="text-foreground font-semibold">{brl(val as number)}</span>
            </div>
          ))}
          <div className="flex justify-between items-center p-4 bg-accent/60 rounded-lg border border-primary/30">
            <span className="text-foreground font-semibold">(=) Receita total</span>
            <span className="text-foreground text-xl font-semibold">{brl(currentStatic.revenueTotal)}</span>
          </div>

          <div className="text-xs text-muted uppercase tracking-wider font-medium mt-4 mb-1">Deduções</div>
          {[
            ["(-) COGS (custos variáveis)", currentStatic.cogsTotal],
            ["(-) Fixos", currentStatic.fixedCosts],
            ["(-) Comissão closer (somente novas vendas)", currentStatic.closerCommission],
            [`(-) Impostos — ${currentStatic.regime} (Fator R: ${pct(currentStatic.fatorR)}, alíq.: ${pct(currentStatic.taxRate)})`, currentStatic.taxes],
          ].map(([label, val]) => (
            <div key={label as string} className="flex justify-between items-center p-4 bg-accent/40 border border-border rounded-lg">
              <span className="text-muted-foreground">{label as string}</span>
              <span className="text-foreground/80 font-semibold">{brl(val as number)}</span>
            </div>
          ))}

          <div className="flex justify-between items-center p-4 bg-accent/40 border border-border rounded-lg">
            <span className="text-muted-foreground">(-) Marketing líquido do mês</span>
            <span className="text-foreground/80 font-semibold">{brl(currentStatic.marketingNet)}</span>
          </div>
          <div className="ml-6 space-y-1">
            <div className="flex justify-between items-center p-2 bg-accent/30 rounded text-xs">
              <span className="text-muted-foreground">Marketing bruto</span>
              <span className="text-muted-foreground">{brl(currentStatic.marketingGross)}</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-accent/30 rounded text-xs">
              <span className="text-muted-foreground">(-) Receita teste pago</span>
              <span className="text-muted-foreground">{brl(currentStatic.paidTestRevenue)}</span>
            </div>
          </div>

          <div className="flex justify-between items-center p-4 bg-accent/60 rounded-lg border-2 border-primary/50 mt-4">
            <span className="text-primary font-semibold text-lg">(=) Lucro líquido</span>
            <span className="text-foreground text-2xl font-semibold">{brl(currentStatic.profit)}</span>
          </div>
        </div>
        <div className="mt-4 text-xs text-muted-foreground leading-relaxed">
          <span className="text-foreground/70 font-medium">Ponto crítico:</span> comissão do closer NÃO incide sobre toda a receita — apenas sobre vendas novas fechadas por ele.
        </div>
      </Section>

      <Section title="Evolução — Receita vs Lucro (12 meses)">
        <ResponsiveContainer width="100%" height={350}>
          <ComposedChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="name" stroke="hsl(var(--muted))" fontSize={12} />
            <YAxis yAxisId="left" stroke="hsl(var(--muted))" fontSize={11} tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`} />
            <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--muted))" fontSize={11} tickFormatter={(v: number) => `${v}%`} />
            <Tooltip
              contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }}
              itemStyle={{ color: "hsl(var(--foreground))" }}
              labelStyle={{ color: "hsl(var(--foreground))" }}
              formatter={(value: number, name: string) =>
                name === "margem" ? [`${value}%`, "Margem %"] : [brl(value), name === "receita" ? "Receita" : "Lucro"]
              }
            />
            <Legend />
            <Bar yAxisId="left" dataKey="receita" name="Receita" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} opacity={0.7} />
            <Line yAxisId="left" dataKey="lucro" name="Lucro" stroke="hsl(var(--crextio-yellow-hover))" strokeWidth={2.5} dot={{ r: 3 }} />
            <Line yAxisId="right" dataKey="margem" name="Margem %" stroke="hsl(var(--muted))" strokeWidth={2} strokeDasharray="5 5" dot={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </Section>

      <div className="mt-6 bg-card border border-border rounded-2xl p-6" style={{ boxShadow: 'var(--shadow-card)' }}>
        <h3 className="text-lg font-semibold text-foreground tracking-tight mb-4">Projeção 12 meses — tabela resumida</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-border">
                {["Mês", "Ativos", "Novos", "Receita", "Mkt Bruto", "Marketing (líq.)", "CAC/cliente", "Lucro", "Margem"].map((h, i) => (
                  <th key={h} className={`${i === 0 ? "text-left" : "text-right"} uppercase text-xs tracking-wider text-muted font-medium py-3 px-3`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {projectionRows.map((r, idx) => (
                <tr key={idx} className={`border-b border-border/50 hover:bg-accent/30 ${idx % 2 === 0 ? "bg-accent/20" : ""}`}>
                  <td className="py-3 px-3 text-foreground font-medium">{r.month}</td>
                  <td className="py-3 px-3 text-right text-foreground/80">{r.activeCustomers}</td>
                  <td className="py-3 px-3 text-right text-muted-foreground">{r.newCustomers}</td>
                  <td className="py-3 px-3 text-right text-foreground font-medium">{brl(r.revenueTotal)}</td>
                  <td className="py-3 px-3 text-right text-muted-foreground">{brl(r.marketingGross)}</td>
                  <td className="py-3 px-3 text-right text-muted-foreground">{brl(r.marketingNet)}</td>
                  <td className="py-3 px-3 text-right text-foreground/80 font-medium">{brl(r.cacBlendedNet)}</td>
                  <td className="py-3 px-3 text-right text-primary font-medium">{brl(r.profit)}</td>
                  <td className="py-3 px-3 text-right text-foreground font-medium">{pct(r.margin)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-border">
                <td className="py-3 px-3 text-foreground font-semibold">Total</td>
                <td className="py-3 px-3 text-right text-foreground/80 font-semibold">{last?.activeCustomers ?? "—"}</td>
                <td className="py-3 px-3 text-right text-foreground/80 font-semibold">{totals.newCust}</td>
                <td className="py-3 px-3 text-right text-foreground font-semibold">{brl(totals.revenue)}</td>
                <td className="py-3 px-3 text-right text-muted-foreground font-semibold">{brl(totals.marketingGross)}</td>
                <td className="py-3 px-3 text-right text-muted-foreground font-semibold">{brl(totals.marketing)}</td>
                <td className="py-3 px-3 text-right text-muted">—</td>
                <td className="py-3 px-3 text-right text-primary font-semibold">{brl(totals.profit)}</td>
                <td className="py-3 px-3 text-right text-foreground font-semibold">{pct(totals.margin)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
        <div className="mt-3 text-xs text-muted-foreground">
          "Mkt Bruto" é o valor total investido em tráfego pago. "Marketing (líq.)" é o bruto menos a receita do teste pago. "CAC/cliente" é gasto líquido dividido por novos clientes.
        </div>
      </div>

      <div className="mt-4 text-xs text-muted-foreground leading-relaxed">
        <span className="text-foreground/70 font-medium">Importante:</span> A DRE estática (acima) assume a base <strong className="text-foreground">já estabilizada</strong> no cenário selecionado, com marketing apenas de reposição de churn. A tabela e o gráfico de 12 meses refletem a <strong className="text-foreground">fase de crescimento</strong> (50 → {last?.activeCustomers ?? "—"} clientes), onde os custos de aquisição são significativamente maiores — por isso a margem tende a ser menor durante a expansão.
      </div>
    </>
  );
}

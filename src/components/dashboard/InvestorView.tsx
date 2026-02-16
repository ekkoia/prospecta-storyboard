import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ASSUMPTIONS, brl, pct, planCounts, type MonthResult, type PlanKey } from "@/lib/financial-engine";
import { AlertTriangle } from "lucide-react";
import { KpiCard } from "./KpiCard";
import { Section } from "./Section";

interface Props {
  currentStatic: MonthResult;
  churnRate: number;
  staticScenarios: (MonthResult & { name: string })[];
}

export function InvestorView({ currentStatic, churnRate, staticScenarios }: Props) {
  const distribution = useMemo(() => {
    const activeCounts = planCounts(currentStatic.activeCustomers);
    const colors: Record<PlanKey, string> = { lite: "#94a3b8", starter: "#64748b", pro: "hsl(45, 95%, 63%)", enterprise: "hsl(45, 89%, 57%)" };
    return (Object.keys(activeCounts) as PlanKey[]).map((k) => ({
      name: `${ASSUMPTIONS.plans[k].label} (R$${ASSUMPTIONS.plans[k].price})`,
      value: activeCounts[k],
      color: colors[k],
    }));
  }, [currentStatic.activeCustomers]);

  const comparisonData = useMemo(
    () => staticScenarios.map((s) => ({
      name: s.name,
      "Receita Total": s.revenueTotal,
      "Lucro Líquido": s.profit,
      "Margem %": Math.round(s.margin * 1000) / 10,
    })),
    [staticScenarios]
  );

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <KpiCard title="Clientes Ativos" value={`${currentStatic.activeCustomers}`} sub={`Churn: ${pct(churnRate)} · Repos.: ${currentStatic.newCustomers}/mês`} />
        <KpiCard title="Receita Total" value={brl(currentStatic.revenueTotal)} sub="Recorrência + Money Models" />
        <KpiCard title="Lucro Líquido" value={brl(currentStatic.profit)} sub={`Margem: ${pct(currentStatic.margin)}`} />
        <KpiCard title="CAC por Cliente (blended)" value={brl(currentStatic.cacBlendedNet)} sub={`Líq.: ${brl(currentStatic.cacBlendedNet)} · Bruto: ${brl(currentStatic.cacBlendedGross)}`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Section title="Resumo Financeiro Mensal">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            {[
              ["Clientes ativos", `${currentStatic.activeCustomers}`],
              ["Novos necessários (repos. churn)", `${currentStatic.newCustomers}`],
              ["MRR (assinaturas)", brl(currentStatic.subscriptionRevenue)],
              ["Receita total", brl(currentStatic.revenueTotal)],
              ["Regime tributário", `${currentStatic.regime} (Fator R: ${pct(currentStatic.fatorR)}, alíq.: ${pct(currentStatic.taxRate)})`],
              ["Marketing bruto do mês", brl(currentStatic.marketingGross)],
              ["Marketing líquido do mês", brl(currentStatic.marketingNet)],
              ["CAC por cliente (líquido)", brl(currentStatic.cacBlendedNet)],
              ["CAC por cliente (bruto)", brl(currentStatic.cacBlendedGross)],
              ["Margem líquida", pct(currentStatic.margin)],
            ].map(([label, val]) => (
              <div key={label} className="flex justify-between bg-accent/60 border border-border rounded-lg p-3">
                <span className="text-muted-foreground">{label}</span>
                <span className="text-foreground font-semibold">{val}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 text-xs text-muted-foreground/70 leading-relaxed space-y-1">
            <div><span className="text-foreground/70 font-medium">Tradução:</span> CAC bruto = investimento total em tráfego por cliente. CAC líquido = após abater receita do teste pago. Marketing = gasto do mês.</div>
            <div className="flex items-start gap-1.5">
              <AlertTriangle className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
              <span><span className="text-foreground/70 font-medium">Pessimista:</span> churn maior exige mais reposições, e o CAC dobrado encarece cada aquisição — por isso o custo de marketing sobe desproporcionalmente.</span>
            </div>
          </div>
        </Section>

        <Section title="Distribuição de clientes por plano">
          <ResponsiveContainer width="100%" height={320}>
            <PieChart>
              <Pie data={distribution} cx="50%" cy="50%" labelLine={false}
                label={({ name, percent }: any) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={110} dataKey="value">
                {distribution.map((entry, idx) => (<Cell key={idx} fill={entry.color} />))}
              </Pie>
              <Tooltip formatter={(v: any) => `${v} clientes`} contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
            </PieChart>
          </ResponsiveContainer>
        </Section>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Section title="Comparação (100 vs 200 vs 500)">
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={comparisonData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" stroke="hsl(var(--muted))" />
              <YAxis stroke="hsl(var(--muted))" />
              <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }}
                formatter={(value: any, key: any) => (key === "Margem %" ? `${value}%` : brl(value))} />
              <Legend />
              <Bar dataKey="Receita Total" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
              <Bar dataKey="Lucro Líquido" fill="hsl(var(--crextio-yellow-hover))" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Section>

        <Section title="Por que a margem sobe com escala">
          <div className="space-y-3 text-muted-foreground text-sm leading-relaxed">
            {[
              ["1) Fixos diluem", "Os custos fixos (time, tools, infra) ficam quase estáveis. Mais clientes = menor fixo por cliente."],
              ["2) CAC não cresce proporcionalmente", "Marketing é puxado por clientes novos. Receita vem da base inteira (ativos)."],
              ["3) Money Models aumentam ARPU", "Onboarding + upsells aumentam ticket médio sem exigir o mesmo aumento de CAC."],
            ].map(([title, desc]) => (
              <div key={title} className="bg-accent/60 border border-border rounded-lg p-4">
                <div className="text-foreground font-semibold mb-1">{title}</div>
                <div>{desc}</div>
              </div>
            ))}
          </div>
        </Section>
      </div>
    </>
  );
}

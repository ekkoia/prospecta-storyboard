import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ASSUMPTIONS, brl, pct, planCounts, type MonthResult, type PlanKey } from "@/lib/financial-engine";
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
    const colors: Record<PlanKey, string> = { lite: "#3b82f6", starter: "#8b5cf6", pro: "#ec4899", enterprise: "#10b981" };
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
        <KpiCard title="Clientes Ativos" value={`${currentStatic.activeCustomers}`} sub={`Churn: ${pct(churnRate)} · Repos.: ${currentStatic.newCustomers}/mês`} tone="orange" />
        <KpiCard title="Receita Total" value={brl(currentStatic.revenueTotal)} sub="Recorrência + Money Models" tone="green" />
        <KpiCard title="Lucro Líquido" value={brl(currentStatic.profit)} sub={`Margem: ${pct(currentStatic.margin)}`} tone="blue" />
        <KpiCard title="CAC por Cliente (blended)" value={brl(currentStatic.cacBlendedNet)} sub="CAC líquido = marketing líquido / novos" tone="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Section title="📌 1 tela / 8 números (o resumo que o investidor quer)">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            {[
              ["Clientes ativos", `${currentStatic.activeCustomers}`],
              ["Novos necessários (repos. churn)", `${currentStatic.newCustomers}`],
              ["MRR (assinaturas)", brl(currentStatic.subscriptionRevenue)],
              ["Receita total", brl(currentStatic.revenueTotal)],
              ["Marketing bruto do mês", brl(currentStatic.marketingGross)],
              ["Marketing líquido do mês", brl(currentStatic.marketingNet)],
              ["CAC por cliente (líquido)", brl(currentStatic.cacBlendedNet)],
              ["Margem líquida", pct(currentStatic.margin)],
            ].map(([label, val]) => (
              <div key={label} className="flex justify-between bg-slate-700 rounded-lg p-3">
                <span className="text-slate-300">{label}</span>
                <span className="text-white font-bold">{val}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 text-xs text-slate-400 leading-relaxed space-y-1">
            <div><span className="text-slate-200 font-semibold">Tradução:</span> aqui ninguém confunde CAC com gasto mensal. CAC é por cliente. Marketing é gasto do mês.</div>
            <div><span className="text-yellow-400 font-semibold">⚠ Pessimista:</span> churn maior exige mais reposições, e o CAC dobrado encarece cada aquisição — por isso o custo de marketing sobe desproporcionalmente.</div>
          </div>
        </Section>

        <Section title="🍰 Distribuição de clientes por plano">
          <ResponsiveContainer width="100%" height={320}>
            <PieChart>
              <Pie data={distribution} cx="50%" cy="50%" labelLine={false}
                label={({ name, percent }: any) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={110} dataKey="value">
                {distribution.map((entry, idx) => (<Cell key={idx} fill={entry.color} />))}
              </Pie>
              <Tooltip formatter={(v: any) => `${v} clientes`} />
            </PieChart>
          </ResponsiveContainer>
        </Section>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Section title="📊 Comparação (100 vs 200 vs 500)">
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={comparisonData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "none", borderRadius: 8 }}
                formatter={(value: any, key: any) => (key === "Margem %" ? `${value}%` : brl(value))} />
              <Legend />
              <Bar dataKey="Receita Total" fill="#10b981" radius={[8, 8, 0, 0]} />
              <Bar dataKey="Lucro Líquido" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Section>

        <Section title="🧠 O porquê da margem subir com escala">
          <div className="space-y-3 text-slate-300 text-sm leading-relaxed">
            {[
              ["1) Fixos diluem", "Os custos fixos (time, tools, infra) ficam quase estáveis. Mais clientes = menor fixo por cliente."],
              ["2) CAC não cresce proporcionalmente", "Marketing é puxado por clientes novos. Receita vem da base inteira (ativos)."],
              ["3) Money Models aumentam ARPA", "Onboarding + upsells aumentam ticket médio sem exigir o mesmo aumento de CAC."],
            ].map(([title, desc]) => (
              <div key={title} className="bg-slate-700 rounded-lg p-4">
                <div className="text-white font-bold mb-1">{title}</div>
                <div>{desc}</div>
              </div>
            ))}
          </div>
        </Section>
      </div>
    </>
  );
}

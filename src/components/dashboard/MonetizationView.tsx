import { Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ASSUMPTIONS, brl, type MonthResult } from "@/lib/financial-engine";
import { KpiCard } from "./KpiCard";
import { Section } from "./Section";

interface Props {
  projectionRows: MonthResult[];
  last: MonthResult;
}

export function MonetizationView({ projectionRows, last }: Props) {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <KpiCard title="ARPU (mês 12)" value={brl(last.arpu)} sub="ticket médio por cliente ativo" tone="green" />
        <KpiCard title="Onboarding (mês 12)" value={brl(last.onboardingRevenue)} sub="receita não recorrente" tone="blue" />
        <KpiCard title="Upsells (mês 12)" value={brl(last.upsellRevenue)} sub="add-ons recorrentes" tone="purple" />
        <KpiCard title="Voz (mês 12)" value={brl(last.voiceRevenue)} sub="packs de voz" tone="pink" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Section title="💎 Impacto no ticket (ARPA) — receita total vs assinaturas">
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={projectionRows}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="month" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "none", borderRadius: 8 }} formatter={(v: any) => brl(v)} />
              <Legend />
              <Area type="monotone" dataKey="subscriptionRevenue" stroke="#10b981" fill="#10b981" fillOpacity={0.15} name="Receita recorrente (assinaturas)" />
              <Area type="monotone" dataKey="revenueTotal" stroke="#60a5fa" fill="#60a5fa" fillOpacity={0.15} name="Receita total (com Money Models)" />
            </AreaChart>
          </ResponsiveContainer>
        </Section>

        <Section title="🧩 Mini-mapa Hormozi (o funil de dinheiro)">
          <div className="space-y-3 text-slate-300 text-sm">
            {[
              ["Front-end", `Teste pago (R$${ASSUMPTIONS.paidTest.price}) → reduz CAC líquido`],
              ["Upsell imediato", `Onboarding premium (R$${ASSUMPTIONS.onboarding.price}) em ${Math.round(ASSUMPTIONS.onboarding.attachRateOfNewCustomers * 100)}% dos novos`],
              ["Continuidade", "Add-ons recorrentes (Whats extra + buscas extra) elevam ARPA"],
              ["Alavanca extra", "Packs de voz: receita adicional com COGS proporcional"],
            ].map(([title, desc]) => (
              <div key={title} className="bg-slate-700 rounded-lg p-4">
                <div className="text-white font-bold">{title}</div>
                <div>{desc}</div>
              </div>
            ))}
          </div>
        </Section>
      </div>

      <Section title="📊 Receita por componente (mês a mês)">
        <ResponsiveContainer width="100%" height={330}>
          <AreaChart data={projectionRows}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="month" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
            <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "none", borderRadius: 8 }} formatter={(v: any) => brl(v)} />
            <Legend />
            <Area type="monotone" dataKey="subscriptionRevenue" stackId="1" stroke="#10b981" fill="#10b981" name="Assinaturas" />
            <Area type="monotone" dataKey="upsellRevenue" stackId="1" stroke="#a78bfa" fill="#a78bfa" name="Upsells" />
            <Area type="monotone" dataKey="onboardingRevenue" stackId="1" stroke="#60a5fa" fill="#60a5fa" name="Onboarding" />
            <Area type="monotone" dataKey="voiceRevenue" stackId="1" stroke="#f472b6" fill="#f472b6" name="Voz" />
          </AreaChart>
        </ResponsiveContainer>
      </Section>
    </>
  );
}

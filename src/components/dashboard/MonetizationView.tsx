import { Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ASSUMPTIONS, brl, pct, type MonthResult } from "@/lib/financial-engine";
import { KpiCard } from "./KpiCard";
import { Section } from "./Section";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";

interface Props {
  projectionRows: MonthResult[];
  last: MonthResult;
  mode: string;
}

function PercentTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const total = payload.reduce((s: number, p: any) => s + (p.value || 0), 0);
  return (
    <div className="bg-slate-800 border border-slate-600 rounded-lg p-3 text-sm">
      <div className="text-slate-300 font-semibold mb-1">Mês {label}</div>
      {payload.map((p: any) => {
        const share = total > 0 ? (p.value / total) * 100 : 0;
        return (
          <div key={p.dataKey} className="flex justify-between gap-4" style={{ color: p.color }}>
            <span>{p.name}</span>
            <span>{brl(p.value)} ({share.toFixed(1)}%)</span>
          </div>
        );
      })}
      <div className="border-t border-slate-600 mt-1 pt-1 text-white font-semibold flex justify-between">
        <span>Total</span><span>{brl(total)}</span>
      </div>
    </div>
  );
}

export function MonetizationView({ projectionRows, last, mode }: Props) {
  const isHormozi = mode === "hormozi";
  const noMoneyModels = last.onboardingRevenue === 0 && last.upsellRevenue === 0 && last.voiceRevenue === 0;
  const upliftPct = last.subscriptionRevenue > 0
    ? (last.revenueTotal - last.subscriptionRevenue) / last.subscriptionRevenue
    : 0;

  const enrichedData = projectionRows.map(row => ({
    ...row,
    moneyModelsDelta: row.revenueTotal - row.subscriptionRevenue,
  }));

  return (
    <>
      {!isHormozi && noMoneyModels && (
        <Alert className="mb-6 bg-amber-900/30 border-amber-600/50 text-amber-200">
          <InfoIcon className="h-4 w-4 text-amber-400" />
          <AlertTitle className="text-amber-300">Money Models inativos</AlertTitle>
          <AlertDescription>
            Você está no modo <strong>{mode === "pessimistic" ? "Pessimista" : "Moderado"}</strong>. Os Money Models (onboarding, upsells, voz) só aparecem no modo <strong>"Impacto Hormozi"</strong>. Troque o modo acima para ver o impacto completo.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <KpiCard title="Receita total (mês 12)" value={brl(last.revenueTotal)} sub="soma de todas as fontes" tone="green" />
        <KpiCard title="ARPU (mês 12)" value={brl(last.arpu)} sub="ticket médio por cliente ativo" tone="blue" />
        <KpiCard
          title="Uplift Money Models"
          value={upliftPct > 0 ? `+${pct(upliftPct)}` : "0%"}
          sub="acréscimo sobre assinaturas"
          tone={upliftPct > 0 ? "orange" : "purple"}
        />
        <KpiCard title="Upsells + Voz (mês 12)" value={brl(last.upsellRevenue + last.voiceRevenue)} sub="receita recorrente adicional" tone="purple" />
        <KpiCard title="Onboarding (mês 12)" value={brl(last.onboardingRevenue)} sub="receita não recorrente" tone="pink" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Section title="💎 Receita total vs Assinaturas + Delta Money Models">
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={enrichedData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="month" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "none", borderRadius: 8 }} formatter={(v: any) => brl(v)} />
              <Legend />
              <Area type="monotone" dataKey="subscriptionRevenue" stroke="#10b981" fill="#10b981" fillOpacity={0.15} name="Assinaturas" />
              <Area type="monotone" dataKey="moneyModelsDelta" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.25} name="Delta Money Models" />
              <Area type="monotone" dataKey="revenueTotal" stroke="#60a5fa" fill="#60a5fa" fillOpacity={0.1} name="Receita total" />
            </AreaChart>
          </ResponsiveContainer>
        </Section>

        <Section title="🧩 Mini-mapa Hormozi (o funil de dinheiro)">
          <div className="space-y-3 text-slate-300 text-sm">
            {[
              { title: "Front-end", desc: `Teste pago (R$${ASSUMPTIONS.paidTest.price}) → reduz CAC líquido`, value: last.paidTestRevenue },
              { title: "Upsell imediato", desc: `Onboarding premium em ${Math.round(ASSUMPTIONS.onboarding.attachRateOfNewCustomers * 100)}% dos novos`, value: last.onboardingRevenue },
              { title: "Continuidade", desc: "Add-ons recorrentes (Whats extra + buscas extra)", value: last.upsellRevenue },
              { title: "Alavanca extra", desc: "Packs de voz: receita adicional com COGS proporcional", value: last.voiceRevenue },
            ].map(({ title, desc, value }) => (
              <div key={title} className="bg-slate-700 rounded-lg p-4 flex justify-between items-center">
                <div>
                  <div className="text-white font-bold">{title}</div>
                  <div>{desc}</div>
                </div>
                <div className="text-white font-bold text-lg ml-4 whitespace-nowrap">{brl(value)}</div>
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
            <Tooltip content={<PercentTooltip />} />
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

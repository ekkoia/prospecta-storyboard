import { useMemo, useState } from "react";
import { ASSUMPTIONS, build12MonthProjection, monthModel, type MonthResult } from "@/lib/financial-engine";
import { InvestorView } from "./InvestorView";
import { AcquisitionView } from "./AcquisitionView";
import { MonetizationView } from "./MonetizationView";
import { UnitCostView } from "./UnitCostView";
import { DreView } from "./DreView";

const TABS = [
  { key: "investor", label: "👔 Investor View" },
  { key: "acquisition", label: "🎯 Aquisição" },
  { key: "monetization", label: "💎 Monetização (Hormozi)" },
  { key: "unit", label: "🧾 Custo por Cliente" },
  { key: "dre", label: "📑 DRE" },
] as const;

type TabKey = (typeof TABS)[number]["key"];
type ScenarioKey = "100" | "200" | "500";
type ModeKey = "moderate" | "pessimistic" | "hormozi";

const scenarioTargets = { "100": 100, "200": 200, "500": 500 } as const;

export default function FinancialDashboard() {
  const [tab, setTab] = useState<TabKey>("investor");
  const [scenario, setScenario] = useState<ScenarioKey>("200");
  const [mode, setMode] = useState<ModeKey>("moderate");

  const churnRate = mode === "pessimistic" ? ASSUMPTIONS.churnMonthlyPessimistic : ASSUMPTIONS.churnMonthlyBase;
  const pessimisticCAC = mode === "pessimistic";
  const hormoziImpact = mode === "hormozi";

  const staticScenarios = useMemo(() => {
    return [100, 200, 500].map((t) => {
      const newCustomers = Math.round(t * churnRate);
      const r = monthModel({ month: 0, activePrev: t, newTarget: newCustomers, churnRate, pessimisticCAC, hormoziImpact });
      return { name: `${t} clientes`, ...r };
    });
  }, [churnRate, pessimisticCAC, hormoziImpact]);

  const currentStatic = useMemo(() => {
    const scenarioIndex = { "100": 0, "200": 1, "500": 2 } as const;
    return staticScenarios[scenarioIndex[scenario]];
  }, [scenario, staticScenarios]);

  const projection = useMemo(() => {
    return build12MonthProjection({
      startActive: 50, targetActive: scenarioTargets[scenario],
      churnRate, pessimisticCAC, hormoziImpact,
    });
  }, [scenario, churnRate, pessimisticCAC, hormoziImpact]);

  const projectionRows = projection.rows;
  const last = projectionRows[projectionRows.length - 1];
  const { newSchedule, avgNewPerMonth } = projection;

  const btnClass = (active: boolean) =>
    `px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
      active ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white" : "bg-slate-700 text-slate-200 hover:bg-slate-600"
    }`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-white mb-2">Prospecta IA 360 — Financial Storyboard</h1>
          <p className="text-slate-400">Dashboard reestruturado para contar uma história clara para sócio/investidor.</p>
        </div>

        {/* Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          <div className="bg-slate-800 rounded-xl p-4 shadow-xl">
            <div className="text-slate-300 text-sm font-semibold mb-2">Modo</div>
            <div className="flex flex-wrap gap-2">
              {([
                { k: "moderate" as ModeKey, t: "Moderado" },
                { k: "pessimistic" as ModeKey, t: "Pessimista (CAC x2 + churn 6%)" },
                { k: "hormozi" as ModeKey, t: "Impacto Hormozi (teste + upsell)" },
              ]).map((m) => (
                <button key={m.k} onClick={() => setMode(m.k)} className={btnClass(mode === m.k)}>{m.t}</button>
              ))}
            </div>
            <div className="mt-3 text-xs text-slate-400 leading-relaxed">
              <span className="text-slate-200 font-semibold">Nota:</span> "Marketing líquido do mês" = Marketing bruto − receita do teste pago.
            </div>
          </div>

          <div className="bg-slate-800 rounded-xl p-4 shadow-xl">
            <div className="text-slate-300 text-sm font-semibold mb-2">Cenário (DRE estático)</div>
            <div className="flex gap-2">
              {(["100", "200", "500"] as ScenarioKey[]).map((s) => (
                <button key={s} onClick={() => setScenario(s)} className={`flex-1 ${btnClass(scenario === s)}`}>{s}</button>
              ))}
            </div>
            <div className="mt-3 text-xs text-slate-400">Snapshot assume novos clientes ≈ churn do mês (reposições).</div>
          </div>

          <div className="bg-slate-800 rounded-xl p-4 shadow-xl">
            <div className="text-slate-300 text-sm font-semibold mb-2">Abas</div>
            <div className="flex flex-wrap gap-2">
              {TABS.map((t) => (
                <button key={t.key} onClick={() => setTab(t.key)} className={btnClass(tab === t.key)}>{t.label}</button>
              ))}
            </div>
          </div>
        </div>

        {tab === "investor" && <InvestorView currentStatic={currentStatic} churnRate={churnRate} staticScenarios={staticScenarios} />}
        {tab === "acquisition" && <AcquisitionView projectionRows={projectionRows} avgNewPerMonth={avgNewPerMonth} newSchedule={newSchedule} last={last} />}
        {tab === "monetization" && <MonetizationView projectionRows={projectionRows} last={last} mode={mode} />}
        {tab === "unit" && <UnitCostView last={last} />}
        {tab === "dre" && <DreView currentStatic={currentStatic} projectionRows={projectionRows} />}

        <div className="mt-8 text-xs text-slate-500">
          Ajustes recomendados: substituir COGS por plano por custos reais, calibrar CAC por plano com dados por canal, e validar impostos efetivos com contador.
        </div>
      </div>
    </div>
  );
}

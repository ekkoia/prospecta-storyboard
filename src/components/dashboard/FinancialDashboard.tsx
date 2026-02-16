import { useMemo, useState, useCallback } from "react";
import { ASSUMPTIONS, build12MonthProjection, monthModel, sumFixedCostsFromItems, DEFAULT_FIXED_COSTS, type MonthResult, type EditableCostsState } from "@/lib/financial-engine";
import { InvestorView } from "./InvestorView";
import { AcquisitionView } from "./AcquisitionView";
import { MonetizationView } from "./MonetizationView";
import { UnitCostView } from "./UnitCostView";
import { DreView } from "./DreView";
import { FixedCostsView } from "./FixedCostsView";
import { InvestmentView } from "./InvestmentView";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";

const TABS = [
  { key: "investor", label: "Investor View" },
  { key: "acquisition", label: "Aquisição" },
  { key: "monetization", label: "Monetização" },
  { key: "unit", label: "Custo Unitário" },
  { key: "dre", label: "DRE" },
  { key: "costs", label: "Custos Fixos" },
  { key: "investment", label: "Aporte & Fases" },
] as const;

type TabKey = (typeof TABS)[number]["key"];
type ScenarioKey = "100" | "200" | "500";
type ModeKey = "moderate" | "pessimistic" | "hormozi";

const scenarioTargets = { "100": 100, "200": 200, "500": 500 } as const;

export default function FinancialDashboard() {
  const [tab, setTab] = useState<TabKey>("investor");
  const [scenario, setScenario] = useState<ScenarioKey>("200");
  const [mode, setMode] = useState<ModeKey>("moderate");
  const [editableCosts, setEditableCosts] = useState<EditableCostsState>(() => structuredClone(DEFAULT_FIXED_COSTS));
  const { theme, setTheme } = useTheme();

  const churnRate = mode === "pessimistic" ? ASSUMPTIONS.churnMonthlyPessimistic : ASSUMPTIONS.churnMonthlyBase;
  const pessimisticCAC = mode === "pessimistic";
  const hormoziImpact = mode === "hormozi";

  const monthlyPayroll = useMemo(() => editableCosts.rhItems.reduce((a, i) => a + i.value, 0), [editableCosts]);

  const fixedCostOverrideFn = useCallback(
    (activeCustomers: number) => sumFixedCostsFromItems(editableCosts, activeCustomers).totalFixed,
    [editableCosts]
  );

  const staticScenarios = useMemo(() => {
    return [100, 200, 500].map((t) => {
      const newCustomers = Math.round(t * churnRate);
      const override = fixedCostOverrideFn(t);
      const r = monthModel({ month: 0, activePrev: t, newTarget: newCustomers, churnRate, pessimisticCAC, hormoziImpact, fixedCostOverride: override, monthlyPayroll });
      return { name: `${t} clientes`, ...r };
    });
  }, [churnRate, pessimisticCAC, hormoziImpact, fixedCostOverrideFn, monthlyPayroll]);

  const currentStatic = useMemo(() => {
    const scenarioIndex = { "100": 0, "200": 1, "500": 2 } as const;
    return staticScenarios[scenarioIndex[scenario]];
  }, [scenario, staticScenarios]);

  const projection = useMemo(() => {
    return build12MonthProjection({
      startActive: 5, targetActive: scenarioTargets[scenario],
      churnRate, pessimisticCAC, hormoziImpact,
      fixedCostOverrideFn, monthlyPayroll,
    });
  }, [scenario, churnRate, pessimisticCAC, hormoziImpact, fixedCostOverrideFn, monthlyPayroll]);

  const projectionRows = projection.rows;
  const last = projectionRows[projectionRows.length - 1];
  const { newSchedule, avgNewPerMonth } = projection;

  const btnClass = (active: boolean) =>
    `px-4 py-2 rounded-lg text-sm font-medium transition-all ${
      active ? "bg-primary text-primary-foreground" : "bg-transparent border border-input text-muted-foreground hover:border-foreground/30 hover:text-foreground"
    }`;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-foreground tracking-tight mb-1">Prospecta IA 360</h1>
            <p className="text-muted-foreground text-sm">Dashboard Financeiro</p>
          </div>
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2 rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground transition-colors"
          >
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
        </div>

        {/* Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          <div className="bg-card border border-border rounded-2xl p-4" style={{ boxShadow: 'var(--shadow-card)' }}>
            <div className="text-muted text-xs font-medium uppercase tracking-wider mb-2">Modo</div>
            <div className="flex flex-wrap gap-2">
              {([
                { k: "moderate" as ModeKey, t: "Moderado" },
                { k: "pessimistic" as ModeKey, t: "Pessimista (CAC x2 + churn 6%)" },
                { k: "hormozi" as ModeKey, t: "Impacto Hormozi (teste + upsell)" },
              ]).map((m) => (
                <button key={m.k} onClick={() => setMode(m.k)} className={btnClass(mode === m.k)}>{m.t}</button>
              ))}
            </div>
            <div className="mt-3 text-xs text-muted-foreground leading-relaxed">
              <span className="text-foreground/70 font-medium">Nota:</span> "Marketing líquido do mês" = Marketing bruto − receita do teste pago.
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl p-4" style={{ boxShadow: 'var(--shadow-card)' }}>
            <div className="text-muted text-xs font-medium uppercase tracking-wider mb-2">Cenário (DRE estático)</div>
            <div className="flex gap-2">
              {(["100", "200", "500"] as ScenarioKey[]).map((s) => (
                <button key={s} onClick={() => setScenario(s)} className={`flex-1 ${btnClass(scenario === s)}`}>{s}</button>
              ))}
            </div>
            <div className="mt-3 text-xs text-muted-foreground">Snapshot assume novos clientes ≈ churn do mês (reposições).</div>
          </div>

          <div className="bg-card border border-border rounded-2xl p-4" style={{ boxShadow: 'var(--shadow-card)' }}>
            <div className="text-muted text-xs font-medium uppercase tracking-wider mb-2">Abas</div>
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
        {tab === "unit" && <UnitCostView last={last} projectionRows={projectionRows} />}
        {tab === "dre" && <DreView currentStatic={currentStatic} projectionRows={projectionRows} />}
        {tab === "costs" && (
          <FixedCostsView
            costs={editableCosts}
            activeCustomers={currentStatic.activeCustomers}
            onUpdate={setEditableCosts}
            onReset={() => setEditableCosts(structuredClone(DEFAULT_FIXED_COSTS))}
          />
        )}
        {tab === "investment" && <InvestmentView projectionRows={projectionRows} editableCosts={editableCosts} />}

        <div className="mt-8 text-xs text-muted-foreground/60">
          Ajustes recomendados: substituir COGS por plano por custos reais, calibrar CAC por plano com dados por canal, e validar impostos efetivos com contador.
        </div>
      </div>
    </div>
  );
}

import { useState } from "react";
import { Section } from "./Section";
import { KpiCard } from "./KpiCard";
import {
  V1_SUMMARY,
  V2_SUMMARY,
  CHURN_CATEGORIES,
  CHURN_PROFILES,
  V2_CAUSES,
  type CauseStatus,
} from "@/lib/churn-data";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import {
  ShoppingCart,
  DollarSign,
  ChevronDown,
  AlertTriangle,
  Lightbulb,
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

const statusConfig: Record<CauseStatus, { label: string; className: string }> = {
  resolved: {
    label: "Resolvido",
    className: "bg-[hsl(var(--success-bg))] text-[hsl(var(--success-text))] border border-[hsl(var(--success-border))]",
  },
  in_progress: {
    label: "Em andamento",
    className: "bg-primary/15 text-primary border border-primary/30",
  },
  pending: {
    label: "Pendente",
    className: "bg-[hsl(var(--destructive-bg))] text-destructive border border-[hsl(var(--destructive-border))]",
  },
};

const fmt = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0 });

export function ChurnView() {
  const isMobile = useIsMobile();
  const [openProfile, setOpenProfile] = useState<string | null>(null);

  const pieData = CHURN_CATEGORIES.map((c) => ({
    name: c.name,
    value: c.percentage,
    color: c.color,
    clients: c.clients.join(", "),
  }));

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard title="V1 — Vendas" value="41" icon={ShoppingCart} sub="01/07 a 17/09" />
        <KpiCard title="V2 — Vendas" value="17" icon={ShoppingCart} sub="19/09 a 05/12" />
        <KpiCard title="V1 — Faturamento" value={fmt(V1_SUMMARY.revenue)} icon={DollarSign} />
        <KpiCard title="V2 — Faturamento" value={fmt(V2_SUMMARY.revenue)} icon={DollarSign} />
      </div>

      {/* Contexto V1 vs V2 */}
      <Section title="Contexto V1 vs V2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[V1_SUMMARY, V2_SUMMARY].map((v) => (
            <div key={v.version} className="bg-accent/40 border border-border rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-primary text-primary-foreground">
                  {v.version}
                </span>
                <span className="text-xs text-muted-foreground">{v.period}</span>
              </div>
              <p className="text-sm text-foreground/80 leading-relaxed">{v.context}</p>
              <div className="space-y-1">
                <span className="text-xs font-medium text-muted uppercase tracking-wider">Causas principais</span>
                <ul className="text-xs text-muted-foreground space-y-1">
                  {v.causes.map((c, i) => (
                    <li key={i} className="flex gap-1.5">
                      <span className="text-primary mt-0.5">•</span>
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <p className="text-xs text-muted-foreground italic border-t border-border pt-2">{v.perspective}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Categorias de Churn V2 */}
      <Section title="Categorias de Churn — V2">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pie chart */}
          <div className="flex flex-col items-center">
            <ResponsiveContainer width="100%" height={isMobile ? 260 : 300}>
              <PieChart style={{ outline: "none" }}>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={isMobile ? 80 : 110}
                  dataKey="value"
                  activeShape={() => null}
                  label={({ name, percent, x, y, textAnchor, fill }: any) => {
                    const pct = `${(percent * 100).toFixed(0)}%`;
                    if (isMobile) {
                      return (
                        <text x={x} y={y} textAnchor={textAnchor} fill="hsl(var(--foreground))" fontSize={9}>
                          <tspan x={x} dy="0">{name}</tspan>
                          <tspan x={x} dy="1.2em">{pct}</tspan>
                        </text>
                      );
                    }
                    return (
                      <text x={x} y={y} textAnchor={textAnchor} fill="hsl(var(--foreground))" fontSize={11}>
                        {`${name}: ${pct}`}
                      </text>
                    );
                  }}
                  labelLine={!isMobile}
                  stroke="none"
                >
                  {pieData.map((d, i) => (
                    <Cell key={i} fill={d.color} stroke="none" style={{ outline: "none" }} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const d = payload[0].payload;
                    return (
                      <div className="bg-card border border-border rounded-lg px-3 py-2 text-xs shadow-lg">
                        <p className="font-medium text-foreground">{d.name}</p>
                        <p className="text-muted-foreground">{d.value.toFixed(1)}% — {d.clients}</p>
                      </div>
                    );
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 text-xs uppercase tracking-wider text-muted font-medium">Categoria</th>
                  <th className="text-left py-2 text-xs uppercase tracking-wider text-muted font-medium">Clientes</th>
                  <th className="text-right py-2 text-xs uppercase tracking-wider text-muted font-medium">%</th>
                </tr>
              </thead>
              <tbody>
                {CHURN_CATEGORIES.map((c) => (
                  <tr key={c.name} className="border-b border-border/50">
                    <td className="py-2.5 flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: c.color }} />
                      <span className="text-foreground">{c.name}</span>
                    </td>
                    <td className="py-2.5 text-muted-foreground">{c.clients.join(", ")}</td>
                    <td className="py-2.5 text-right font-medium text-foreground">{c.percentage.toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Section>

      {/* Perfis de Churn V2 */}
      <Section title="Perfis de Churn — V2">
        <div className="space-y-3">
          {CHURN_PROFILES.map((p) => (
            <Collapsible
              key={p.name}
              open={openProfile === p.name}
              onOpenChange={(open) => setOpenProfile(open ? p.name : null)}
            >
              <CollapsibleTrigger className="w-full text-left">
                <div className="flex items-center justify-between bg-accent/30 hover:bg-accent/50 border border-border rounded-xl px-4 py-3 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-foreground">{p.name}</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-secondary text-secondary-foreground">{p.plan}</span>
                  </div>
                  <ChevronDown
                    className={`h-4 w-4 text-muted-foreground transition-transform ${
                      openProfile === p.name ? "rotate-180" : ""
                    }`}
                  />
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="border border-t-0 border-border rounded-b-xl px-4 py-4 space-y-3 bg-card">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <span className="text-muted uppercase tracking-wider font-medium">Permanência</span>
                      <p className="text-foreground mt-0.5">{p.permanence}</p>
                    </div>
                    <div>
                      <span className="text-muted uppercase tracking-wider font-medium">Uso</span>
                      <p className="text-foreground mt-0.5">{p.usage}</p>
                    </div>
                    <div>
                      <span className="text-muted uppercase tracking-wider font-medium">Retenção</span>
                      <p className="text-foreground mt-0.5">{p.retentionAttempt}</p>
                    </div>
                  </div>
                  <div>
                    <span className="text-xs text-muted uppercase tracking-wider font-medium">Motivo</span>
                    <p className="text-sm text-foreground/80 mt-0.5">{p.reason}</p>
                  </div>
                  <div className="border-t border-border pt-3">
                    <span className="text-xs text-muted uppercase tracking-wider font-medium">Diagnóstico</span>
                    <p className="text-sm text-muted-foreground leading-relaxed mt-0.5">{p.diagnosis}</p>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          ))}
        </div>
      </Section>

      {/* Causas Principais V2 */}
      <Section title="Causas Principais — V2">
        <div className="space-y-3">
          {V2_CAUSES.map((c) => {
            const s = statusConfig[c.status];
            return (
              <div key={c.title} className="flex flex-col sm:flex-row sm:items-start gap-3 border-b border-border/50 pb-3 last:border-0 last:pb-0">
                <div className="flex items-center gap-2 sm:w-48 shrink-0">
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${s.className}`}>{s.label}</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{c.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{c.description}</p>
                  {c.statusNote && (
                    <p className="text-xs text-muted-foreground/70 mt-1 italic">Nota: {c.statusNote}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Section>

      {/* Insight Principal */}
      <div className="bg-primary/10 border border-primary/30 rounded-2xl p-6" style={{ boxShadow: "var(--shadow-card)" }}>
        <div className="flex items-start gap-3">
          <Lightbulb className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Insight Principal</h3>
            <p className="text-sm text-foreground/80 leading-relaxed">
              <span className="font-semibold text-primary">~43% do churn</span> ocorre antes de o cliente sequer ativar a plataforma
              (Nicolas + Gustavo/Sócio) ou por produto imaturo (Gabriel). Dois vetores de correção imediata:{" "}
              <strong>(1)</strong> melhorar qualificação comercial e período de teste, e{" "}
              <strong>(2)</strong> garantir estabilidade das funcionalidades antes de escalar vendas.
            </p>
            <p className="text-xs text-muted-foreground mt-2 italic">
              Esses dois pontos foram ajustados, com a IA qualificando melhor os leads e com os ajustes realizados para melhoria do sistema.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

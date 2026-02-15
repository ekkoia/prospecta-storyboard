import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, ComposedChart,
  Legend, Line, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { brl, type MonthResult } from "@/lib/financial-engine";
import { KpiCard } from "./KpiCard";
import { Section } from "./Section";

interface Props {
  projectionRows: MonthResult[];
  newPerMonth: number;
  last: MonthResult;
}

export function AcquisitionView({ projectionRows, newPerMonth, last }: Props) {
  // Dados com marketing acumulado
  const enrichedRows = projectionRows.reduce<(MonthResult & { marketingCumulative: number })[]>((acc, row, idx) => {
    const prev = idx > 0 ? acc[idx - 1].marketingCumulative : 0;
    acc.push({ ...row, marketingCumulative: prev + row.marketingNet });
    return acc;
  }, []);

  const totalInvestment = projectionRows.reduce((acc, r) => acc + r.marketingNet, 0);

  return (
    <>
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <KpiCard title="Novos clientes/mês" value={`${newPerMonth}`} sub="constante (solver)" tone="orange" />
        <KpiCard title="Marketing bruto (mês 12)" value={brl(last.marketingGross)} sub="gasto bruto do mês" tone="pink" />
        <KpiCard title="Teste pago (mês 12)" value={brl(last.paidTestRevenue)} sub="abatimento do CAC" tone="green" />
        <KpiCard title="CAC líquido (mês 12)" value={brl(last.cacBlendedNet)} sub="custo por cliente novo" tone="purple" />
        <KpiCard title="Investimento total 12m" value={brl(totalInvestment)} sub="marketing líquido acumulado" tone="blue" />
      </div>

      {/* Gráfico 1: Evolução de Clientes */}
      <Section title="👥 Evolução de Clientes">
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={projectionRows}>
            <defs>
              <linearGradient id="gradActive" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="month" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
            <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "none", borderRadius: 8 }}
              formatter={(value: number) => `${value} clientes`} />
            <Legend />
            <Area type="monotone" dataKey="activeCustomers" stroke="#f59e0b" strokeWidth={3} fill="url(#gradActive)" name="Clientes ativos" />
            <Line type="monotone" dataKey="newCustomers" stroke="#60a5fa" strokeWidth={2} dot={false} name="Novos/mês" />
          </AreaChart>
        </ResponsiveContainer>
        <div className="mt-2 text-xs text-slate-400">
          A base de clientes cresce mês a mês com aquisição constante. A linha azul mostra a reposição + crescimento mensal.
        </div>
      </Section>

      {/* Gráfico 2: Marketing Mensal vs Acumulado */}
      <Section title="💰 Marketing — Mensal vs Acumulado">
        <ResponsiveContainer width="100%" height={260}>
          <ComposedChart data={enrichedRows}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="month" stroke="#9ca3af" />
            <YAxis yAxisId="left" stroke="#9ca3af" tickFormatter={(v: number) => `R$${(v / 1000).toFixed(0)}k`} />
            <YAxis yAxisId="right" orientation="right" stroke="#9ca3af" tickFormatter={(v: number) => `R$${(v / 1000).toFixed(0)}k`} />
            <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "none", borderRadius: 8 }}
              formatter={(value: number) => brl(value)} />
            <Legend />
            <Bar yAxisId="left" dataKey="marketingNet" fill="#ef4444" opacity={0.7} name="Marketing líquido/mês" />
            <Line yAxisId="right" type="monotone" dataKey="marketingCumulative" stroke="#fbbf24" strokeWidth={3} dot={false} name="Acumulado 12m" />
          </ComposedChart>
        </ResponsiveContainer>
        <div className="mt-2 text-xs text-slate-400">
          Barras = gasto líquido mensal (após abatimento do teste pago). Linha = investimento total acumulado ao longo dos 12 meses.
        </div>
      </Section>

      {/* Gráfico 3: CAC Bruto vs Líquido */}
      <Section title="🎯 CAC por Cliente — Bruto vs Líquido">
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={projectionRows}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="month" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" tickFormatter={(v: number) => brl(v)} />
            <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "none", borderRadius: 8 }}
              formatter={(value: number) => brl(value)} />
            <Legend />
            <Bar dataKey="cacBlendedGross" fill="#a78bfa" opacity={0.5} name="CAC bruto" />
            <Bar dataKey="cacBlendedNet" fill="#8b5cf6" name="CAC líquido" />
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-2 text-xs text-slate-400">
          A diferença entre o CAC bruto e líquido mostra o impacto do teste pago na redução do custo de aquisição.
        </div>
      </Section>

      {/* Nota explicativa */}
      <div className="mt-4 bg-slate-800/50 rounded-lg p-4 text-xs text-slate-400 leading-relaxed">
        <span className="text-slate-200 font-semibold">ℹ️ Sobre o modelo:</span> A projeção usa aquisição constante (solver) — o número de novos clientes/mês é fixo para atingir a meta de 12 meses. Por isso, marketing e CAC mensais são constantes. A variação real está no <span className="text-amber-400 font-medium">crescimento acumulado da base</span> e no <span className="text-yellow-400 font-medium">investimento total acumulado</span>.
      </div>
    </>
  );
}

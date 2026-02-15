import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { brl, type MonthResult } from "@/lib/financial-engine";
import { KpiCard } from "./KpiCard";
import { Section } from "./Section";

interface Props {
  projectionRows: MonthResult[];
  newPerMonth: number;
  last: MonthResult;
}

export function AcquisitionView({ projectionRows, newPerMonth, last }: Props) {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <KpiCard title="Novos clientes/mês (projeção)" value={`${newPerMonth}`} sub="constante para atingir meta" tone="orange" />
        <KpiCard title="Marketing bruto (mês 12)" value={brl(last.marketingGross)} sub="R$ gasto do mês" tone="pink" />
        <KpiCard title="Teste pago (mês 12)" value={brl(last.paidTestRevenue)} sub="abatimento parcial do CAC" tone="green" />
        <KpiCard title="CAC por cliente (mês 12)" value={brl(last.cacBlendedNet)} sub="CAC líquido blended" tone="purple" />
      </div>

      <Section title="📈 12 meses — Clientes, Marketing e CAC">
        <ResponsiveContainer width="100%" height={340}>
          <LineChart data={projectionRows}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="month" stroke="#9ca3af" />
            <YAxis yAxisId="left" stroke="#9ca3af" />
            <YAxis yAxisId="right" orientation="right" stroke="#9ca3af" />
            <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "none", borderRadius: 8 }}
              formatter={(value: any, key: any) => {
                if (["activeCustomers", "newCustomers"].includes(key)) return `${value} clientes`;
                return brl(value);
              }} />
            <Legend />
            <Line yAxisId="left" type="monotone" dataKey="activeCustomers" stroke="#f59e0b" strokeWidth={3} name="Clientes ativos" />
            <Line yAxisId="left" type="monotone" dataKey="newCustomers" stroke="#60a5fa" strokeWidth={2} name="Novos clientes" />
            <Line yAxisId="right" type="monotone" dataKey="marketingNet" stroke="#ef4444" strokeWidth={2} name="Marketing líquido do mês" />
            <Line yAxisId="right" type="monotone" dataKey="cacBlendedNet" stroke="#a78bfa" strokeWidth={3} name="CAC por cliente (líquido)" />
          </LineChart>
        </ResponsiveContainer>
        <div className="mt-3 text-xs text-slate-400 leading-relaxed">
          <span className="text-slate-200 font-semibold">Leitura correta:</span> "Marketing líquido do mês" é quanto você gastou no mês para adquirir novos clientes (abatendo teste pago). "CAC por cliente" é o custo médio por cliente novo.
        </div>
      </Section>
    </>
  );
}

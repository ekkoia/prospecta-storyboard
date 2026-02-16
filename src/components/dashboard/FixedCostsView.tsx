import { ASSUMPTIONS, brl } from "@/lib/financial-engine";
import { Section } from "./Section";
import { KpiCard } from "./KpiCard";

interface FixedCostsViewProps {
  activeCustomers: number;
}

export function FixedCostsView({ activeCustomers }: FixedCostsViewProps) {
  const f = ASSUMPTIONS.fixedMonthlyCosts;
  const usdToBrl = (usd: number) => usd * f.usdFx * (1 + f.iofAndFeesRate);

  const rhItems = [
    { label: "Suporte", value: f.support },
    { label: "Gestor de Automação", value: f.automationManager },
    { label: "Closer (fixo)", value: f.closerFixed },
    { label: "Contabilidade", value: f.accounting },
    { label: "Produção de Vídeo", value: f.videoProduction },
    { label: "Social Media", value: f.socialMedia },
    { label: "Marcos Simão", value: f.marcosSimao },
    { label: "Gestor do Projeto", value: f.gestorProjeto },
  ];
  const rhTotal = rhItems.reduce((a, i) => a + i.value, 0);

  const toolsBrlItems = [
    { label: "Infraestrutura", value: f.infra },
    { label: "Lovable", value: f.lovable },
    { label: "GPT / Claude", value: f.gptClaude },
    { label: "Banco de Dados", value: f.db },
    { label: "Domínio", value: f.domain },
  ];
  const toolsBrlTotal = toolsBrlItems.reduce((a, i) => a + i.value, 0);

  const toolsUsdItems = [
    { label: "SerpAPI", usd: f.serpApiUsd },
    { label: "Instantly", usd: f.instantlyUsd },
  ];
  const toolsUsdTotalUsd = toolsUsdItems.reduce((a, i) => a + i.usd, 0);
  const toolsUsdTotalBrl = usdToBrl(toolsUsdTotalUsd);

  const twilioPerClient = usdToBrl(f.twilioNumberUsdPerCustomer);
  const twilioCost = twilioPerClient * activeCustomers * f.twilioNumberShareOfCustomers;

  const totalFixedBase = rhTotal + toolsBrlTotal + toolsUsdTotalBrl;
  const totalWithTwilio = totalFixedBase + twilioCost;

  const tableClass = "w-full text-sm";
  const thClass = "text-left text-slate-400 font-medium py-2 border-b border-slate-700";
  const tdClass = "py-2 border-b border-slate-700/50 text-slate-200";
  const tdRight = `${tdClass} text-right font-mono`;
  const totalRow = "font-bold text-white";

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KpiCard title="RH (BRL)" value={brl(rhTotal)} tone="blue" />
        <KpiCard title="Ferramentas (BRL)" value={brl(toolsBrlTotal)} tone="purple" />
        <KpiCard title="SaaS (USD→BRL)" value={brl(toolsUsdTotalBrl)} sub={`US$ ${toolsUsdTotalUsd}`} tone="orange" />
        <KpiCard title="Total Fixo + Twilio" value={brl(totalWithTwilio)} sub={`Base ${brl(totalFixedBase)} + Twilio ${brl(twilioCost)}`} tone="green" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* RH */}
        <Section title="👥 Recursos Humanos">
          <table className={tableClass}>
            <thead>
              <tr><th className={thClass}>Item</th><th className={`${thClass} text-right`}>Valor</th></tr>
            </thead>
            <tbody>
              {rhItems.map((i) => (
                <tr key={i.label}><td className={tdClass}>{i.label}</td><td className={tdRight}>{brl(i.value)}</td></tr>
              ))}
              <tr className={totalRow}><td className="py-2 pt-3">Subtotal</td><td className="py-2 pt-3 text-right font-mono">{brl(rhTotal)}</td></tr>
            </tbody>
          </table>
        </Section>

        {/* Ferramentas BRL */}
        <Section title="🛠️ Ferramentas & Infra (BRL)">
          <table className={tableClass}>
            <thead>
              <tr><th className={thClass}>Item</th><th className={`${thClass} text-right`}>Valor</th></tr>
            </thead>
            <tbody>
              {toolsBrlItems.map((i) => (
                <tr key={i.label}><td className={tdClass}>{i.label}</td><td className={tdRight}>{brl(i.value)}</td></tr>
              ))}
              <tr className={totalRow}><td className="py-2 pt-3">Subtotal</td><td className="py-2 pt-3 text-right font-mono">{brl(toolsBrlTotal)}</td></tr>
            </tbody>
          </table>
        </Section>

        {/* Ferramentas USD */}
        <Section title="🌐 SaaS (USD)">
          <table className={tableClass}>
            <thead>
              <tr><th className={thClass}>Item</th><th className={`${thClass} text-right`}>USD</th><th className={`${thClass} text-right`}>BRL</th></tr>
            </thead>
            <tbody>
              {toolsUsdItems.map((i) => (
                <tr key={i.label}>
                  <td className={tdClass}>{i.label}</td>
                  <td className={tdRight}>${i.usd}</td>
                  <td className={tdRight}>{brl(usdToBrl(i.usd))}</td>
                </tr>
              ))}
              <tr className={totalRow}>
                <td className="py-2 pt-3">Subtotal</td>
                <td className="py-2 pt-3 text-right font-mono">${toolsUsdTotalUsd}</td>
                <td className="py-2 pt-3 text-right font-mono">{brl(toolsUsdTotalBrl)}</td>
              </tr>
            </tbody>
          </table>
          <div className="mt-3 text-xs text-slate-400">
            Câmbio: R$ {f.usdFx.toFixed(2)} + {(f.iofAndFeesRate * 100).toFixed(0)}% IOF/taxas
          </div>
        </Section>
      </div>

      {/* Twilio variável */}
      <Section title="📞 Custo Variável — Números Twilio">
        <div className="text-slate-300 text-sm space-y-1">
          <p>Custo por número: <span className="text-white font-mono">${f.twilioNumberUsdPerCustomer}</span> → <span className="text-white font-mono">{brl(twilioPerClient)}</span></p>
          <p>Penetração: <span className="text-white font-mono">{(f.twilioNumberShareOfCustomers * 100).toFixed(0)}%</span> dos clientes ativos</p>
          <p>Clientes ativos no cenário: <span className="text-white font-mono">{activeCustomers}</span></p>
          <p className="text-white font-bold pt-2">Custo Twilio total: {brl(twilioCost)}/mês</p>
        </div>
      </Section>

      <div className="bg-slate-800 rounded-xl p-4 shadow-xl text-center">
        <span className="text-slate-400 text-sm">Total geral (fixo + Twilio): </span>
        <span className="text-2xl font-bold text-white">{brl(totalWithTwilio)}</span>
        <span className="text-slate-500 text-xs ml-2">/mês</span>
      </div>
    </div>
  );
}

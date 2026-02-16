import { useState, useRef, useEffect } from "react";
import { brl, type CostItem, type UsdCostItem, type EditableCostsState, DEFAULT_FIXED_COSTS } from "@/lib/financial-engine";
import { Section } from "./Section";
import { KpiCard } from "./KpiCard";
import { Plus, Trash2, RotateCcw, Check } from "lucide-react";

interface FixedCostsViewProps {
  costs: EditableCostsState;
  activeCustomers: number;
  onUpdate: (costs: EditableCostsState) => void;
  onReset: () => void;
}

/* ---- Editable Cell ---- */
function EditableCell({ value, onChange, prefix = "", isCurrency = true }: {
  value: number; onChange: (v: number) => void; prefix?: string; isCurrency?: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(value));
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { if (editing) inputRef.current?.select(); }, [editing]);

  const commit = () => {
    const parsed = parseFloat(draft.replace(",", "."));
    if (!isNaN(parsed) && parsed >= 0) onChange(parsed);
    setEditing(false);
  };

  if (editing) {
    return (
      <input
        ref={inputRef}
        className="w-24 bg-slate-700 border border-blue-500 rounded px-2 py-1 text-right text-sm text-white font-mono focus:outline-none"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => { if (e.key === "Enter") commit(); if (e.key === "Escape") setEditing(false); }}
      />
    );
  }

  const display = isCurrency ? (prefix ? `${prefix}${value}` : brl(value)) : `${(value * 100).toFixed(0)}%`;
  return (
    <span
      className="cursor-pointer hover:text-blue-400 transition-colors border-b border-dashed border-slate-600 hover:border-blue-400"
      onClick={() => { setDraft(String(value)); setEditing(true); }}
    >
      {display}
    </span>
  );
}

/* ---- Editable Label ---- */
function EditableLabel({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { if (editing) inputRef.current?.select(); }, [editing]);

  const commit = () => {
    if (draft.trim()) onChange(draft.trim());
    setEditing(false);
  };

  if (editing) {
    return (
      <input
        ref={inputRef}
        className="w-36 bg-slate-700 border border-blue-500 rounded px-2 py-1 text-sm text-white focus:outline-none"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => { if (e.key === "Enter") commit(); if (e.key === "Escape") setEditing(false); }}
      />
    );
  }

  return (
    <span
      className="cursor-pointer hover:text-blue-400 transition-colors border-b border-dashed border-transparent hover:border-blue-400"
      onClick={() => { setDraft(value); setEditing(true); }}
    >
      {value}
    </span>
  );
}

/* ---- Add Item Row ---- */
function AddItemRow({ onAdd, isUsd = false }: { onAdd: (label: string, value: number) => void; isUsd?: boolean }) {
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState("");
  const [val, setVal] = useState("");

  const commit = () => {
    const parsed = parseFloat(val.replace(",", "."));
    if (label.trim() && !isNaN(parsed) && parsed > 0) {
      onAdd(label.trim(), parsed);
      setLabel(""); setVal(""); setOpen(false);
    }
  };

  if (!open) {
    return (
      <tr>
        <td colSpan={isUsd ? 3 : 2} className="pt-2">
          <button onClick={() => setOpen(true)} className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors">
            <Plus size={14} /> Adicionar item
          </button>
        </td>
      </tr>
    );
  }

  return (
    <tr>
      <td className="py-1">
        <input
          autoFocus
          placeholder="Nome"
          className="w-full bg-slate-700 border border-slate-600 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-blue-500"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") commit(); if (e.key === "Escape") setOpen(false); }}
        />
      </td>
      {isUsd && <td />}
      <td className="py-1 text-right">
        <div className="flex items-center gap-1 justify-end">
          <input
            placeholder={isUsd ? "USD" : "BRL"}
            className="w-20 bg-slate-700 border border-slate-600 rounded px-2 py-1 text-sm text-white text-right font-mono focus:outline-none focus:border-blue-500"
            value={val}
            onChange={(e) => setVal(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") commit(); if (e.key === "Escape") setOpen(false); }}
          />
          <button onClick={commit} className="text-green-400 hover:text-green-300"><Check size={16} /></button>
        </div>
      </td>
    </tr>
  );
}

/* ---- Main Component ---- */
export function FixedCostsView({ costs, activeCustomers, onUpdate, onReset }: FixedCostsViewProps) {
  const usdToBrl = (usd: number) => usd * costs.usdFx * (1 + costs.iofAndFeesRate);

  const rhTotal = costs.rhItems.reduce((a, i) => a + i.value, 0);
  const toolsBrlTotal = costs.toolsBrlItems.reduce((a, i) => a + i.value, 0);
  const toolsUsdTotalUsd = costs.toolsUsdItems.reduce((a, i) => a + i.usd, 0);
  const toolsUsdTotalBrl = costs.toolsUsdItems.reduce((a, i) => a + usdToBrl(i.usd), 0);
  const twilioPerClient = usdToBrl(costs.twilioNumberUsdPerCustomer);
  const twilioCost = twilioPerClient * activeCustomers * costs.twilioNumberShareOfCustomers;
  const totalFixedBase = rhTotal + toolsBrlTotal + toolsUsdTotalBrl;
  const totalWithTwilio = totalFixedBase + twilioCost;

  const updateRh = (id: string, patch: Partial<CostItem>) => {
    onUpdate({ ...costs, rhItems: costs.rhItems.map((i) => i.id === id ? { ...i, ...patch } : i) });
  };
  const updateToolBrl = (id: string, patch: Partial<CostItem>) => {
    onUpdate({ ...costs, toolsBrlItems: costs.toolsBrlItems.map((i) => i.id === id ? { ...i, ...patch } : i) });
  };
  const updateToolUsd = (id: string, patch: Partial<UsdCostItem>) => {
    onUpdate({ ...costs, toolsUsdItems: costs.toolsUsdItems.map((i) => i.id === id ? { ...i, ...patch } : i) });
  };

  const tableClass = "w-full text-sm";
  const thClass = "text-left text-slate-400 font-medium py-2 border-b border-slate-700";
  const tdClass = "py-2 border-b border-slate-700/50 text-slate-200";
  const tdRight = `${tdClass} text-right font-mono`;
  const totalRow = "font-bold text-white";

  const isModified = JSON.stringify(costs) !== JSON.stringify(DEFAULT_FIXED_COSTS);

  return (
    <div className="space-y-6">
      {/* Reset button */}
      {isModified && (
        <div className="flex justify-end">
          <button
            onClick={onReset}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white text-sm transition-all"
          >
            <RotateCcw size={14} /> Resetar valores originais
          </button>
        </div>
      )}

      {/* KPI Cards */}
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
              <tr><th className={thClass}>Item</th><th className={`${thClass} text-right`}>Valor</th><th className={`${thClass} w-8`} /></tr>
            </thead>
            <tbody>
              {costs.rhItems.map((i) => (
                <tr key={i.id}>
                  <td className={tdClass}><EditableLabel value={i.label} onChange={(v) => updateRh(i.id, { label: v })} /></td>
                  <td className={tdRight}><EditableCell value={i.value} onChange={(v) => updateRh(i.id, { value: v })} /></td>
                  <td className="py-2 text-center">
                    <button onClick={() => onUpdate({ ...costs, rhItems: costs.rhItems.filter((x) => x.id !== i.id) })} className="text-slate-500 hover:text-red-400 transition-colors"><Trash2 size={14} /></button>
                  </td>
                </tr>
              ))}
              <AddItemRow onAdd={(label, value) => onUpdate({ ...costs, rhItems: [...costs.rhItems, { id: crypto.randomUUID(), label, value }] })} />
              <tr className={totalRow}><td className="py-2 pt-3">Subtotal</td><td className="py-2 pt-3 text-right font-mono">{brl(rhTotal)}</td><td /></tr>
            </tbody>
          </table>
        </Section>

        {/* Ferramentas BRL */}
        <Section title="🛠️ Ferramentas & Infra (BRL)">
          <table className={tableClass}>
            <thead>
              <tr><th className={thClass}>Item</th><th className={`${thClass} text-right`}>Valor</th><th className={`${thClass} w-8`} /></tr>
            </thead>
            <tbody>
              {costs.toolsBrlItems.map((i) => (
                <tr key={i.id}>
                  <td className={tdClass}><EditableLabel value={i.label} onChange={(v) => updateToolBrl(i.id, { label: v })} /></td>
                  <td className={tdRight}><EditableCell value={i.value} onChange={(v) => updateToolBrl(i.id, { value: v })} /></td>
                  <td className="py-2 text-center">
                    <button onClick={() => onUpdate({ ...costs, toolsBrlItems: costs.toolsBrlItems.filter((x) => x.id !== i.id) })} className="text-slate-500 hover:text-red-400 transition-colors"><Trash2 size={14} /></button>
                  </td>
                </tr>
              ))}
              <AddItemRow onAdd={(label, value) => onUpdate({ ...costs, toolsBrlItems: [...costs.toolsBrlItems, { id: crypto.randomUUID(), label, value }] })} />
              <tr className={totalRow}><td className="py-2 pt-3">Subtotal</td><td className="py-2 pt-3 text-right font-mono">{brl(toolsBrlTotal)}</td><td /></tr>
            </tbody>
          </table>
        </Section>

        {/* Ferramentas USD */}
        <Section title="🌐 SaaS (USD)">
          <table className={tableClass}>
            <thead>
              <tr><th className={thClass}>Item</th><th className={`${thClass} text-right`}>USD</th><th className={`${thClass} text-right`}>BRL</th><th className={`${thClass} w-8`} /></tr>
            </thead>
            <tbody>
              {costs.toolsUsdItems.map((i) => (
                <tr key={i.id}>
                  <td className={tdClass}><EditableLabel value={i.label} onChange={(v) => updateToolUsd(i.id, { label: v })} /></td>
                  <td className={tdRight}><EditableCell value={i.usd} onChange={(v) => updateToolUsd(i.id, { usd: v })} prefix="$" /></td>
                  <td className={tdRight}>{brl(usdToBrl(i.usd))}</td>
                  <td className="py-2 text-center">
                    <button onClick={() => onUpdate({ ...costs, toolsUsdItems: costs.toolsUsdItems.filter((x) => x.id !== i.id) })} className="text-slate-500 hover:text-red-400 transition-colors"><Trash2 size={14} /></button>
                  </td>
                </tr>
              ))}
              <AddItemRow isUsd onAdd={(label, usd) => onUpdate({ ...costs, toolsUsdItems: [...costs.toolsUsdItems, { id: crypto.randomUUID(), label, usd }] })} />
              <tr className={totalRow}>
                <td className="py-2 pt-3">Subtotal</td>
                <td className="py-2 pt-3 text-right font-mono">${toolsUsdTotalUsd}</td>
                <td className="py-2 pt-3 text-right font-mono">{brl(toolsUsdTotalBrl)}</td>
                <td />
              </tr>
            </tbody>
          </table>
        </Section>
      </div>

      {/* Editable params */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Section title="💱 Parâmetros de Câmbio">
          <div className="text-slate-300 text-sm space-y-3">
            <div className="flex justify-between items-center">
              <span>Câmbio USD/BRL:</span>
              <span className="text-white font-mono">R$ <EditableCell value={costs.usdFx} onChange={(v) => onUpdate({ ...costs, usdFx: v })} prefix="" /></span>
            </div>
            <div className="flex justify-between items-center">
              <span>IOF + Taxas:</span>
              <span className="text-white font-mono"><EditableCell value={costs.iofAndFeesRate} onChange={(v) => onUpdate({ ...costs, iofAndFeesRate: v })} isCurrency={false} /></span>
            </div>
          </div>
        </Section>

        <Section title="📞 Custo Variável — Números Twilio">
          <div className="text-slate-300 text-sm space-y-3">
            <div className="flex justify-between items-center">
              <span>Custo por número (USD):</span>
              <span className="text-white font-mono">$<EditableCell value={costs.twilioNumberUsdPerCustomer} onChange={(v) => onUpdate({ ...costs, twilioNumberUsdPerCustomer: v })} prefix="" /></span>
            </div>
            <div className="flex justify-between items-center">
              <span>Penetração:</span>
              <span className="text-white font-mono"><EditableCell value={costs.twilioNumberShareOfCustomers} onChange={(v) => onUpdate({ ...costs, twilioNumberShareOfCustomers: v })} isCurrency={false} /></span>
            </div>
            <div className="flex justify-between items-center">
              <span>Clientes ativos:</span>
              <span className="text-white font-mono">{activeCustomers}</span>
            </div>
            <p className="text-white font-bold pt-2">Custo Twilio total: {brl(twilioCost)}/mês</p>
          </div>
        </Section>
      </div>

      <div className="bg-slate-800 rounded-xl p-4 shadow-xl text-center">
        <span className="text-slate-400 text-sm">Total geral (fixo + Twilio): </span>
        <span className="text-2xl font-bold text-white">{brl(totalWithTwilio)}</span>
        <span className="text-slate-500 text-xs ml-2">/mês</span>
      </div>
    </div>
  );
}

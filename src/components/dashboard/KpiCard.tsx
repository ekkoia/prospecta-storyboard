import { type LucideIcon } from "lucide-react";

interface KpiCardProps {
  title: string;
  value: string;
  sub?: string;
  icon?: LucideIcon;
  tone?: string; // kept for backward compat but ignored visually
}

export function KpiCard({ title, value, sub, icon: Icon }: KpiCardProps) {
  return (
    <div className="bg-slate-800 border border-slate-700/50 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-1">
        {Icon && <Icon className="h-4 w-4 text-blue-500" />}
        <span className="text-xs uppercase tracking-wider text-slate-500 font-medium">{title}</span>
      </div>
      <div className="text-2xl font-semibold text-white">{value}</div>
      {sub && <div className="text-slate-500 text-xs mt-1">{sub}</div>}
    </div>
  );
}

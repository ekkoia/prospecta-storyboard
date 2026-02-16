import { type LucideIcon } from "lucide-react";

interface KpiCardProps {
  title: string;
  value: string;
  sub?: string;
  icon?: LucideIcon;
  tone?: string;
}

export function KpiCard({ title, value, sub, icon: Icon }: KpiCardProps) {
  return (
    <div className="bg-card border border-border rounded-2xl p-5" style={{ boxShadow: 'var(--shadow-card)' }}>
      <div className="flex items-center gap-2 mb-1">
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
        <span className="text-xs uppercase tracking-wider text-muted font-medium">{title}</span>
      </div>
      <div className="text-2xl font-semibold text-foreground">{value}</div>
      {sub && <div className="text-muted-foreground text-xs mt-1">{sub}</div>}
    </div>
  );
}

import { ReactNode } from "react";

export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="bg-card border border-border rounded-2xl p-6" style={{ boxShadow: 'var(--shadow-card)' }}>
      <h3 className="text-lg font-semibold text-foreground tracking-tight mb-4">{title}</h3>
      {children}
    </div>
  );
}

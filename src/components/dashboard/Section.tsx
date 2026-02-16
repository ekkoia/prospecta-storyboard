import { ReactNode } from "react";

export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-slate-100 tracking-tight mb-4">{title}</h3>
      {children}
    </div>
  );
}

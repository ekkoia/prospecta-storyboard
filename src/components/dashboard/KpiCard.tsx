interface KpiCardProps {
  title: string;
  value: string;
  sub?: string;
  tone?: "green" | "blue" | "purple" | "orange" | "pink";
}

const tones = {
  green: "from-green-600 to-green-700",
  blue: "from-blue-600 to-blue-700",
  purple: "from-purple-600 to-purple-700",
  orange: "from-orange-600 to-orange-700",
  pink: "from-pink-600 to-pink-700",
};

export function KpiCard({ title, value, sub, tone = "blue" }: KpiCardProps) {
  return (
    <div className={`bg-gradient-to-br ${tones[tone]} rounded-xl p-6 shadow-lg`}>
      <div className="text-white/80 text-sm font-medium mb-1">{title}</div>
      <div className="text-3xl font-bold text-white">{value}</div>
      {sub && <div className="text-white/70 text-xs mt-1">{sub}</div>}
    </div>
  );
}

'use client';

/** Single stat card in the Analytics section. */
export function AnalyticsStatCard({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  accent: 'emerald' | 'teal' | 'orange' | 'indigo';
}) {
  const bg: Record<string, string> = {
    emerald: 'bg-emerald-50 border-emerald-200',
    teal: 'bg-teal-50 border-teal-200',
    orange: 'bg-orange-50 border-orange-200',
    indigo: 'bg-indigo-50 border-indigo-200',
  };
  const text: Record<string, string> = {
    emerald: 'text-emerald-700',
    teal: 'text-teal-700',
    orange: 'text-orange-700',
    indigo: 'text-indigo-700',
  };
  return (
    <div className={`rounded-xl border-2 ${bg[accent]} p-4 text-center`}>
      <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-white/80 shadow-sm">
        {icon}
      </div>
      <p className={`text-3xl font-black ${text[accent]}`}>{value}</p>
      <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500">{label}</p>
    </div>
  );
}

/** Inline pill stat (e.g. "On-track taps: 42"). */
export function MiniStat({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-lab-line/60 bg-white px-3 py-1 text-sm">
      <strong className={color}>{value}</strong>
      <span className="text-lab-soft">{label}</span>
    </span>
  );
}

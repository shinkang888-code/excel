import { AlertTriangle, CheckCircle2, Wrench } from "lucide-react";

import type { CompatibilityItem } from "@/types/conversion";

const iconByLevel = {
  preserved: CheckCircle2,
  partial: Wrench,
  unsupported: AlertTriangle,
  failed: AlertTriangle,
};

const colorByLevel = {
  preserved: "text-emerald-600 bg-emerald-50 border-emerald-200",
  partial: "text-amber-600 bg-amber-50 border-amber-200",
  unsupported: "text-rose-600 bg-rose-50 border-rose-200",
  failed: "text-rose-600 bg-rose-50 border-rose-200",
};

export function ConversionReport({ items }: { items: CompatibilityItem[] }) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-slate-900">호환성 리포트</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        자동 보존된 요소와 수동 확인이 필요한 요소를 함께 보여줍니다.
      </p>

      <div className="mt-6 space-y-3">
        {items.map((item) => {
          const Icon = iconByLevel[item.level];
          const colorClass = colorByLevel[item.level];

          return (
            <div
              key={`${item.feature}-${item.level}`}
              className={`rounded-2xl border p-4 ${colorClass}`}
            >
              <div className="flex items-start gap-3">
                <Icon className="mt-0.5 h-5 w-5" />
                <div>
                  <p className="text-sm font-semibold">{item.feature}</p>
                  <p className="mt-1 text-sm leading-6">{item.message}</p>
                  <p className="mt-2 text-xs font-medium">다음 조치: {item.action}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

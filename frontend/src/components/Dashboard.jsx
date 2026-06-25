import { useEffect, useState } from "react";

import { getDashboardSummary } from "../services/api";

function formatMetricValue(metric) {
  if (metric.type === "currency") {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(metric.value ?? 0);
  }

  return new Intl.NumberFormat("en-US").format(metric.value ?? 0);
}

function metricToneClassName(tone) {
  if (tone === "success") {
    return "border-emerald-200 bg-emerald-50";
  }

  if (tone === "warning") {
    return "border-amber-200 bg-amber-50";
  }

  if (tone === "danger") {
    return "border-rose-200 bg-rose-50";
  }

  return "border-stone-200 bg-white";
}

function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadSummary();
  }, []);

  async function loadSummary() {
    setIsLoading(true);
    setError("");

    try {
      const data = await getDashboardSummary();
      setSummary(data);
    } catch (loadError) {
      setError(loadError.message || "Could not load dashboard summary");
    } finally {
      setIsLoading(false);
    }
  }

  const metrics = summary
    ? [
        { label: "Total companies", value: summary.total_companies, tone: "neutral" },
        { label: "Total contacts", value: summary.total_contacts, tone: "neutral" },
        { label: "Open deals", value: summary.total_open_deals, tone: "neutral" },
        { label: "Won deals", value: summary.total_won_deals, tone: "success" },
        { label: "Lost deals", value: summary.total_lost_deals, tone: "danger" },
        {
          label: "Open pipeline value",
          value: summary.total_open_pipeline_value,
          tone: "neutral",
          type: "currency",
        },
        { label: "Open tasks", value: summary.total_open_tasks, tone: "warning" },
        { label: "Overdue tasks", value: summary.total_overdue_tasks, tone: "danger" },
      ]
    : [];

  return (
    <section className="space-y-5">
      <div className="rounded-3xl border border-stone-200 bg-white px-5 py-5 shadow-sm sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h3 className="text-xl font-semibold text-slate-900">Dashboard</h3>
            <p className="mt-1.5 text-sm text-slate-500">
              Review the current CRM summary across companies, deals, and tasks.
            </p>
          </div>

          <button
            className="crm-control crm-button crm-button-secondary"
            onClick={loadSummary}
            type="button"
          >
            Refresh
          </button>
        </div>
      </div>

      <div className="rounded-3xl border border-stone-200 bg-white px-5 py-5 shadow-sm sm:px-6">
        {error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        ) : null}

        {isLoading ? (
          <div className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-8 text-sm text-slate-600">
            Loading dashboard summary...
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {metrics.map((metric) => (
              <article
                className={`rounded-2xl border px-4 py-4 shadow-sm ${metricToneClassName(
                  metric.tone,
                )}`}
                key={metric.label}
              >
                <p className="text-sm font-medium text-slate-500">{metric.label}</p>
                <p className="mt-3 text-2xl font-semibold text-slate-900">
                  {formatMetricValue(metric)}
                </p>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default Dashboard;

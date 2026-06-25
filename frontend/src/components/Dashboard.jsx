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

function metricCardClassName(metric) {
  const toneMap = {
    blue: "border-blue-100 bg-blue-50/70",
    cyan: "border-cyan-100 bg-cyan-50/70",
    indigo: "border-indigo-100 bg-indigo-50/70",
    emerald: "border-emerald-100 bg-emerald-50/75",
    rose: "border-rose-100 bg-rose-50/75",
    amber: "border-amber-100 bg-amber-50/75",
    violet: "border-violet-100 bg-violet-50/70",
    roseAmber: "border-amber-100 bg-rose-50/55",
  };

  return toneMap[metric.tone] ?? "border-slate-200 bg-white";
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
        { label: "Total companies", value: summary.total_companies, tone: "blue" },
        { label: "Total contacts", value: summary.total_contacts, tone: "cyan" },
        { label: "Open deals", value: summary.total_open_deals, tone: "indigo" },
        { label: "Won deals", value: summary.total_won_deals, tone: "emerald" },
        { label: "Lost deals", value: summary.total_lost_deals, tone: "rose" },
        {
          label: "Open pipeline value",
          value: summary.total_open_pipeline_value,
          type: "currency",
          tone: "amber",
          helper: "Current value across active opportunities",
        },
        { label: "Open tasks", value: summary.total_open_tasks, tone: "violet" },
        { label: "Overdue tasks", value: summary.total_overdue_tasks, tone: "roseAmber" },
      ]
    : [];

  return (
    <section className="space-y-4">
      <div className="crm-panel px-5 py-5 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h3 className="text-xl font-semibold tracking-tight text-slate-950">
              Dashboard
            </h3>
            <p className="mt-1.5 text-sm leading-6 text-slate-500">
              Review your CRM summary and follow-up health.
            </p>
          </div>

          <button
            className="crm-control crm-button crm-button-secondary self-start"
            onClick={loadSummary}
            type="button"
          >
            Refresh
          </button>
        </div>
      </div>

      <div className="crm-panel px-5 py-5 sm:px-6">
        {error ? (
          <div className="crm-alert crm-alert-danger">{error}</div>
        ) : isLoading ? (
          <div className="crm-empty-state">Loading dashboard summary...</div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {metrics.map((metric) => (
              <article
                className={`crm-metric-card ${metricCardClassName(metric)}`}
                key={metric.label}
              >
                <p className="text-sm font-medium text-slate-500">{metric.label}</p>
                <p className="mt-3 text-[2rem] font-semibold tracking-tight text-slate-950">
                  {formatMetricValue(metric)}
                </p>
                {metric.helper ? (
                  <p className="mt-2 text-xs leading-5 text-slate-500">{metric.helper}</p>
                ) : null}
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default Dashboard;

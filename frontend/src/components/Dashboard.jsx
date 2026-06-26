import { useEffect, useState } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
    blue: "border-blue-200 bg-blue-100/80",
    cyan: "border-cyan-200 bg-cyan-100/80",
    indigo: "border-indigo-200 bg-indigo-100/80",
    emerald: "border-emerald-200 bg-emerald-100/80",
    rose: "border-rose-200 bg-rose-100/80",
    amber: "border-amber-200 bg-amber-100/85",
    violet: "border-violet-200 bg-violet-100/80",
    roseAmber: "border-amber-200 bg-orange-100/75",
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
    <section className="crm-theme-dashboard space-y-5">
      <Card className="crm-page-surface crm-module-header py-0">
        <CardContent className="px-5 py-4 sm:px-6">
          <div className="crm-action-panel flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="min-w-0">
              <h3 className="text-base font-semibold tracking-tight text-slate-950">
                Dashboard summary
              </h3>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                Refresh and review CRM performance metrics.
              </p>
            </div>

            <div className="flex w-full xl:w-auto xl:justify-end">
              <div className="crm-action-row xl:justify-end">
                <Button
                  className="crm-button crm-button-secondary"
                  onClick={loadSummary}
                  type="button"
                  variant="outline"
                >
                  Refresh
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="crm-page-surface crm-module-list-panel py-0">
        <CardContent className="px-5 py-5 sm:px-6">
          {error ? (
            <Alert className="border-rose-200 bg-rose-50 text-rose-700">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : isLoading ? (
            <Alert className="border-slate-200 bg-slate-50/80 text-slate-600">
              <AlertDescription>Loading dashboard summary...</AlertDescription>
            </Alert>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {metrics.map((metric) => (
                <Card
                  className={`crm-dashboard-card border shadow-sm ${metricCardClassName(metric)}`}
                  key={metric.label}
                >
                  <CardContent className="px-5 py-5">
                    <div className="crm-dashboard-marker">
                      <span className="crm-dashboard-marker-dot" />
                      <span>{metric.label}</span>
                    </div>
                    <p className="mt-3 text-[2rem] font-semibold tracking-tight text-slate-950">
                      {formatMetricValue(metric)}
                    </p>
                    {metric.helper ? (
                      <p className="mt-2 text-xs leading-5 text-slate-500">{metric.helper}</p>
                    ) : null}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}

export default Dashboard;

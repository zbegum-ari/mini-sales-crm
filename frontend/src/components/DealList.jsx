import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function dealStageClassName(stage) {
  if (stage === "Won") {
    return "bg-emerald-50 text-emerald-700 ring-emerald-200";
  }

  if (stage === "Lost") {
    return "bg-rose-50 text-rose-700 ring-rose-200";
  }

  if (stage === "Proposal") {
    return "bg-amber-50 text-amber-700 ring-amber-200";
  }

  if (stage === "Qualified" || stage === "Negotiation") {
    return "bg-cyan-50 text-cyan-700 ring-cyan-200";
  }

  return "bg-teal-50 text-teal-700 ring-teal-200";
}

function DealList({ deals, deletingDealId, emptyMessage, onDelete, onEdit }) {
  if (deals.length === 0) {
    return (
      <Alert className="crm-empty-state border-slate-200 bg-slate-50/80 text-slate-600">
        <AlertDescription>{emptyMessage}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-3">
      {deals.map((deal) => (
        <Card className="crm-list-card border-slate-200/90 py-0" key={deal.id}>
          <CardContent className="px-5 py-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0 space-y-3">
              <div className="flex flex-wrap items-center gap-2.5">
                <h3 className="text-lg font-semibold text-slate-900">{deal.title}</h3>
                <Badge
                  className={`crm-chip px-3 py-1 text-xs font-semibold ring-1 ${dealStageClassName(
                    deal.pipeline_stage,
                  )}`}
                >
                  {deal.pipeline_stage}
                </Badge>
              </div>

              <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-slate-600">
                <p>
                  Company:{" "}
                  <span className="font-medium text-slate-700">
                    {deal.company?.name ?? "Unknown company"}
                  </span>
                </p>
                <p>
                  Value:{" "}
                  <span className="font-medium text-slate-700">
                    {formatCurrency(deal.value)}
                  </span>
                </p>
                <p>Expected close: {deal.expected_close_date}</p>
              </div>

              {deal.notes ? (
                <div className="crm-inline-note">
                  <span className="font-medium text-slate-700">Notes:</span> {deal.notes}
                </div>
              ) : null}
            </div>

            <div className="flex shrink-0 gap-2">
              <Button
                className="crm-button crm-button-inline crm-button-secondary"
                onClick={() => onEdit(deal)}
                size="sm"
                type="button"
                variant="outline"
              >
                Edit
              </Button>
              <Button
                className="crm-button crm-button-inline crm-button-danger"
                disabled={deletingDealId === deal.id}
                onClick={() => onDelete(deal)}
                size="sm"
                type="button"
                variant="destructive"
              >
                {deletingDealId === deal.id ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default DealList;

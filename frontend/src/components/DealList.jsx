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
    return <div className="crm-empty-state">{emptyMessage}</div>;
  }

  return (
    <div className="space-y-3">
      {deals.map((deal) => (
        <article
          className="crm-list-card"
          key={deal.id}
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0 space-y-3">
              <div className="flex flex-wrap items-center gap-2.5">
                <h3 className="text-lg font-semibold text-slate-900">{deal.title}</h3>
                <span
                  className={`crm-chip px-3 py-1 text-xs font-semibold ring-1 ${dealStageClassName(
                    deal.pipeline_stage,
                  )}`}
                >
                  {deal.pipeline_stage}
                </span>
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
              <button
                className="crm-button crm-button-inline crm-button-secondary"
                onClick={() => onEdit(deal)}
                type="button"
              >
                Edit
              </button>
              <button
                className="crm-button crm-button-inline crm-button-danger"
                disabled={deletingDealId === deal.id}
                onClick={() => onDelete(deal)}
                type="button"
              >
                {deletingDealId === deal.id ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

export default DealList;

function activityTypeClassName(activityType) {
  if (activityType === "Call") {
    return "bg-teal-50 text-teal-700 ring-teal-200";
  }

  if (activityType === "Meeting") {
    return "bg-cyan-50 text-cyan-700 ring-cyan-200";
  }

  if (activityType === "Follow-up") {
    return "bg-amber-50 text-amber-700 ring-amber-200";
  }

  if (activityType === "Email") {
    return "bg-sky-50 text-sky-700 ring-sky-200";
  }

  return "bg-slate-100 text-slate-700 ring-slate-200";
}

function activityHeading(activity) {
  const companyName = activity.company?.name;

  if (companyName) {
    return `${activity.activity_type} with ${companyName}`;
  }

  return `${activity.activity_type} activity`;
}

function ActivityList({ activities, deletingActivityId, emptyMessage, onDelete, onEdit }) {
  if (activities.length === 0) {
    return <div className="crm-empty-state">{emptyMessage}</div>;
  }

  return (
    <div className="space-y-3">
      {activities.map((activity) => (
        <article
          className="crm-list-card"
          key={activity.id}
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0 space-y-3">
              <div className="flex flex-wrap items-center gap-2.5">
                <h3 className="text-lg font-semibold text-slate-900">{activityHeading(activity)}</h3>
                <span
                  className={`crm-chip px-3 py-1 text-xs font-semibold ring-1 ${activityTypeClassName(
                    activity.activity_type,
                  )}`}
                >
                  {activity.activity_type}
                </span>
              </div>

              <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-slate-600">
                <p>
                  Company:{" "}
                  <span className="font-medium text-slate-700">
                    {activity.company?.name ?? "Unknown company"}
                  </span>
                </p>
                <p>
                  Deal:{" "}
                  <span className="font-medium text-slate-700">
                    {activity.deal?.title ?? "Company-level activity"}
                  </span>
                </p>
                <p>
                  Date: <span className="font-medium text-slate-700">{activity.activity_date}</span>
                </p>
              </div>

              <p className="crm-inline-note">
                {activity.note}
              </p>
            </div>

            <div className="flex shrink-0 gap-2">
              <button
                className="crm-button crm-button-inline crm-button-secondary"
                onClick={() => onEdit(activity)}
                type="button"
              >
                Edit
              </button>
              <button
                className="crm-button crm-button-inline crm-button-danger"
                disabled={deletingActivityId === activity.id}
                onClick={() => onDelete(activity)}
                type="button"
              >
                {deletingActivityId === activity.id ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

export default ActivityList;

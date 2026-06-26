import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

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
    return (
      <Alert className="crm-empty-state border-slate-200 bg-slate-50/80 text-slate-600">
        <AlertDescription>{emptyMessage}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-3">
      {activities.map((activity) => (
        <Card className="crm-list-card border-slate-200/90 py-0" key={activity.id}>
          <CardContent className="px-5 py-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0 space-y-3">
              <div className="flex flex-wrap items-center gap-2.5">
                <h3 className="text-lg font-semibold text-slate-900">{activityHeading(activity)}</h3>
                <Badge
                  className={`crm-chip px-3 py-1 text-xs font-semibold ring-1 ${activityTypeClassName(
                    activity.activity_type,
                  )}`}
                >
                  {activity.activity_type}
                </Badge>
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
              <Button
                className="crm-button crm-button-inline crm-button-secondary"
                onClick={() => onEdit(activity)}
                size="sm"
                type="button"
                variant="outline"
              >
                Edit
              </Button>
              <Button
                className="crm-button crm-button-inline crm-button-danger"
                disabled={deletingActivityId === activity.id}
                onClick={() => onDelete(activity)}
                size="sm"
                type="button"
                variant="destructive"
              >
                {deletingActivityId === activity.id ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default ActivityList;

function getTodayDateString() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function isOverdue(task) {
  return task.status === "Open" && task.due_date < getTodayDateString();
}

function statusClassName(status) {
  if (status === "Completed") {
    return "bg-emerald-50 text-emerald-700 ring-emerald-200";
  }

  if (status === "Cancelled") {
    return "bg-slate-100 text-slate-700 ring-slate-200";
  }

  return "bg-teal-50 text-teal-700 ring-teal-200";
}

function TaskList({
  completingTaskId,
  deletingTaskId,
  emptyMessage,
  onComplete,
  onDelete,
  onEdit,
  tasks,
}) {
  if (tasks.length === 0) {
    return <div className="crm-empty-state">{emptyMessage}</div>;
  }

  return (
    <div className="space-y-3">
      {tasks.map((task) => {
        const overdue = isOverdue(task);

        return (
          <article
            className="crm-list-card"
            key={task.id}
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0 space-y-3">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h3 className="text-lg font-semibold text-slate-900">{task.title}</h3>
                  <span
                    className={`crm-chip px-3 py-1 text-xs font-semibold ring-1 ${statusClassName(
                      task.status,
                    )}`}
                  >
                    {task.status}
                  </span>
                  {overdue ? (
                    <span className="crm-chip rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 ring-1 ring-amber-200">
                      Overdue
                    </span>
                  ) : null}
                </div>

                <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-slate-600">
                  <p>
                    Company:{" "}
                    <span className="font-medium text-slate-700">
                      {task.company?.name ?? "Unknown company"}
                    </span>
                  </p>
                  <p>
                    Deal:{" "}
                    <span className="font-medium text-slate-700">
                      {task.deal?.title ?? "Company-level task"}
                    </span>
                  </p>
                  <p>Due date: {task.due_date}</p>
                </div>

                {task.description ? (
                  <div className="crm-inline-note">
                    <span className="font-medium text-slate-700">Description:</span>{" "}
                    {task.description}
                  </div>
                ) : null}
              </div>

              <div className="flex shrink-0 flex-wrap gap-2">
                <button
                  className="crm-button crm-button-inline crm-button-secondary"
                  onClick={() => onEdit(task)}
                  type="button"
                >
                  Edit
                </button>
                {task.status === "Open" ? (
                  <button
                    className="crm-button crm-button-inline crm-button-success"
                    disabled={completingTaskId === task.id}
                    onClick={() => onComplete(task)}
                    type="button"
                  >
                    {completingTaskId === task.id ? "Saving..." : "Mark completed"}
                  </button>
                ) : null}
                <button
                  className="crm-button crm-button-inline crm-button-danger"
                  disabled={deletingTaskId === task.id}
                  onClick={() => onDelete(task)}
                  type="button"
                >
                  {deletingTaskId === task.id ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}

export default TaskList;

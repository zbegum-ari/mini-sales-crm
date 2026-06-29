import { Button } from "./ui/button";

function TeamPanel({
  approvingUserId,
  pendingEmployees,
  rejectingUserId,
  teamUsers,
  onApprove,
  onReject,
}) {
  return (
    <div className="space-y-5">
      <section>
        <h4 className="text-base font-semibold tracking-tight text-slate-950">
          Pending employee requests
        </h4>
        <p className="mt-1 text-sm leading-6 text-slate-500">
          Review employees waiting to join your company workspace.
        </p>

        <div className="mt-4 space-y-3">
          {pendingEmployees.length === 0 ? (
            <div className="crm-empty-state">No pending employee requests.</div>
          ) : (
            pendingEmployees.map((user) => (
              <div className="crm-list-card" key={user.id}>
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-950">{user.name}</p>
                    <p className="mt-1 text-sm text-slate-500">{user.email}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.16em] text-slate-400">
                      Pending employee request
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <Button
                      className="crm-button crm-button-success crm-button-inline"
                      disabled={approvingUserId === user.id}
                      onClick={() => onApprove(user.id)}
                      type="button"
                    >
                      {approvingUserId === user.id ? "Approving..." : "Approve"}
                    </Button>
                    <Button
                      className="crm-button crm-button-danger crm-button-inline"
                      disabled={rejectingUserId === user.id}
                      onClick={() => onReject(user.id)}
                      type="button"
                    >
                      {rejectingUserId === user.id ? "Rejecting..." : "Reject"}
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <section>
        <h4 className="text-base font-semibold tracking-tight text-slate-950">Workspace users</h4>
        <p className="mt-1 text-sm leading-6 text-slate-500">
          Active and pending users in your company workspace.
        </p>

        <div className="mt-4 space-y-3">
          {teamUsers.length === 0 ? (
            <div className="crm-empty-state">No users found in this workspace.</div>
          ) : (
            teamUsers.map((user) => (
              <div className="crm-list-card" key={user.id}>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-950">{user.name}</p>
                    <p className="mt-1 text-sm text-slate-500">
                      {user.email} · {user.role} · {user.status}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

export default TeamPanel;

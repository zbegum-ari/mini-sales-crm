import { Button } from "./ui/button";

function PlatformAdminPanel({
  approvingOrganizationId,
  organizations,
  pendingManagers,
  rejectingOrganizationId,
  onApprove,
  onReject,
}) {
  return (
    <div className="space-y-5">
      <section>
        <h4 className="text-base font-semibold tracking-tight text-slate-950">
          Pending manager requests
        </h4>
        <p className="mt-1 text-sm leading-6 text-slate-500">
          Review pending company workspace requests from new managers.
        </p>

        <div className="mt-4 space-y-3">
          {pendingManagers.length === 0 ? (
            <div className="crm-empty-state">No pending manager requests.</div>
          ) : (
            pendingManagers.map((request) => (
              <div className="crm-list-card" key={request.organization_id}>
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-950">{request.organization_name}</p>
                    <p className="mt-1 text-sm text-slate-500">
                      {request.manager_name} · {request.manager_email}
                    </p>
                    <p className="mt-1 text-xs uppercase tracking-[0.16em] text-slate-400">
                      Pending org_admin request
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <Button
                      className="crm-button crm-button-success crm-button-inline"
                      disabled={approvingOrganizationId === request.organization_id}
                      onClick={() => onApprove(request.organization_id)}
                      type="button"
                    >
                      {approvingOrganizationId === request.organization_id ? "Approving..." : "Approve"}
                    </Button>
                    <Button
                      className="crm-button crm-button-danger crm-button-inline"
                      disabled={rejectingOrganizationId === request.organization_id}
                      onClick={() => onReject(request.organization_id)}
                      type="button"
                    >
                      {rejectingOrganizationId === request.organization_id ? "Rejecting..." : "Reject"}
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <section>
        <h4 className="text-base font-semibold tracking-tight text-slate-950">Organizations</h4>
        <p className="mt-1 text-sm leading-6 text-slate-500">
          Basic workspace list with status and user counts.
        </p>

        <div className="mt-4 space-y-3">
          {organizations.length === 0 ? (
            <div className="crm-empty-state">No organizations found.</div>
          ) : (
            organizations.map((organization) => (
              <div className="crm-list-card" key={organization.id}>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-950">{organization.name}</p>
                    <p className="mt-1 text-sm text-slate-500">
                      Status: {organization.status} · Users: {organization.user_count} · Pending:{" "}
                      {organization.pending_user_count}
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

export default PlatformAdminPanel;

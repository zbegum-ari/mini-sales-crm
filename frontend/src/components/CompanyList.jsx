function companyStatusClassName(status) {
  if (status === "Active" || status === "Customer") {
    return "bg-emerald-50 text-emerald-700 ring-emerald-200";
  }

  if (status === "Inactive") {
    return "bg-slate-100 text-slate-700 ring-slate-200";
  }

  if (status === "Lost") {
    return "bg-rose-50 text-rose-700 ring-rose-200";
  }

  return "bg-teal-50 text-teal-700 ring-teal-200";
}

function CompanyList({ companies, deletingCompanyId, emptyMessage, onDelete, onEdit }) {
  if (companies.length === 0) {
    return <div className="crm-empty-state">{emptyMessage}</div>;
  }

  return (
    <div className="space-y-3">
      {companies.map((company) => (
        <article
          className="crm-list-card"
          key={company.id}
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0 space-y-3">
              <div className="flex flex-wrap items-center gap-2.5">
                <h3 className="text-lg font-semibold text-slate-900">{company.name}</h3>
                <span
                  className={`crm-chip px-3 py-1 text-xs font-semibold ring-1 ${companyStatusClassName(
                    company.status,
                  )}`}
                >
                  {company.status}
                </span>
              </div>

              <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-slate-600">
                {company.industry ? <p>Industry: {company.industry}</p> : null}
                {company.company_size ? <p>Size: {company.company_size}</p> : null}
                {company.website ? (
                  <p>
                    Website:{" "}
                    <a
                      className="font-medium text-teal-700 underline decoration-teal-300 underline-offset-2"
                      href={company.website}
                      rel="noreferrer"
                      target="_blank"
                    >
                      {company.website}
                    </a>
                  </p>
                ) : null}
                {company.phone ? <p>Phone: {company.phone}</p> : null}
                {company.email ? <p>Email: {company.email}</p> : null}
              </div>

              {company.notes ? (
                <div className="crm-inline-note">
                  <span className="font-medium text-slate-700">Notes:</span> {company.notes}
                </div>
              ) : null}
            </div>

            <div className="flex shrink-0 gap-2">
              <button
                className="crm-button crm-button-inline crm-button-secondary"
                onClick={() => onEdit(company)}
                type="button"
              >
                Edit
              </button>
              <button
                className="crm-button crm-button-inline crm-button-danger"
                disabled={deletingCompanyId === company.id}
                onClick={() => onDelete(company)}
                type="button"
              >
                {deletingCompanyId === company.id ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

export default CompanyList;

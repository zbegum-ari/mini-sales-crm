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
    return (
      <div className="rounded-2xl border border-dashed border-stone-300 bg-stone-50 px-5 py-8 text-center text-sm text-slate-600">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {companies.map((company) => (
        <article
          className="rounded-2xl border border-stone-200 bg-white px-5 py-4 shadow-sm transition hover:border-stone-300"
          key={company.id}
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0 space-y-3">
              <div className="flex flex-wrap items-center gap-2.5">
                <h3 className="text-lg font-semibold text-slate-900">{company.name}</h3>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ${companyStatusClassName(
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
                <div className="rounded-xl bg-slate-50 px-3.5 py-3 text-sm text-slate-600 ring-1 ring-slate-200">
                  <span className="font-medium text-slate-700">Notes:</span> {company.notes}
                </div>
              ) : null}
            </div>

            <div className="flex shrink-0 gap-2">
              <button
                className="rounded-xl border border-stone-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-stone-50 focus:outline-none focus:ring-4 focus:ring-stone-100"
                onClick={() => onEdit(company)}
                type="button"
              >
                Edit
              </button>
              <button
                className="rounded-xl bg-rose-600 px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-700 focus:outline-none focus:ring-4 focus:ring-rose-100 disabled:cursor-not-allowed disabled:bg-rose-300"
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

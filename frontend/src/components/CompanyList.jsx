function CompanyList({ companies, deletingCompanyId, onDelete, onEdit }) {
  if (companies.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-slate-600">
        No companies yet. Add your first company using the form.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {companies.map((company) => (
        <article
          className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
          key={company.id}
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-slate-900">{company.name}</h3>

              <div className="space-y-1 text-sm text-slate-600">
                {company.industry ? <p>Industry: {company.industry}</p> : null}
                {company.website ? (
                  <p>
                    Website:{" "}
                    <a
                      className="text-slate-900 underline"
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
                {company.notes ? <p>Notes: {company.notes}</p> : null}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                onClick={() => onEdit(company)}
                type="button"
              >
                Edit
              </button>
              <button
                className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-rose-500 disabled:cursor-not-allowed disabled:bg-rose-300"
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

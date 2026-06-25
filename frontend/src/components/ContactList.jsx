function ContactList({ contacts, deletingContactId, emptyMessage, onDelete, onEdit }) {
  if (contacts.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center text-slate-600">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {contacts.map((contact) => (
        <article
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-slate-300"
          key={contact.id}
        >
          <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <h3 className="text-xl font-semibold text-slate-900">
                  {contact.first_name} {contact.last_name}
                </h3>
                <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 ring-1 ring-indigo-200">
                  {contact.job_title}
                </span>
              </div>

              <div className="grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
                <p>
                  Company:{" "}
                  <span className="font-medium text-slate-700">
                    {contact.company?.name ?? "Unknown company"}
                  </span>
                </p>
                <p>Email: {contact.email}</p>
                <p>Phone: {contact.phone}</p>
              </div>

              {contact.notes ? (
                <div className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600 ring-1 ring-slate-200">
                  <span className="font-medium text-slate-700">Notes:</span> {contact.notes}
                </div>
              ) : null}
            </div>

            <div className="flex shrink-0 gap-3">
              <button
                className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-100"
                onClick={() => onEdit(contact)}
                type="button"
              >
                Edit
              </button>
              <button
                className="rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-500 focus:outline-none focus:ring-4 focus:ring-rose-100 disabled:cursor-not-allowed disabled:bg-rose-300"
                disabled={deletingContactId === contact.id}
                onClick={() => onDelete(contact)}
                type="button"
              >
                {deletingContactId === contact.id ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

export default ContactList;

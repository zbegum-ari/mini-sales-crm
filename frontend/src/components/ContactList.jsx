function ContactList({ contacts, deletingContactId, emptyMessage, onDelete, onEdit }) {
  if (contacts.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-stone-300 bg-stone-50 px-5 py-8 text-center text-sm text-slate-600">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {contacts.map((contact) => (
        <article
          className="rounded-2xl border border-stone-200 bg-white px-5 py-4 shadow-sm transition hover:border-stone-300"
          key={contact.id}
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0 space-y-3">
              <div className="flex flex-wrap items-center gap-2.5">
                <h3 className="text-lg font-semibold text-slate-900">
                  {contact.first_name} {contact.last_name}
                </h3>
                <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700 ring-1 ring-teal-200">
                  {contact.job_title}
                </span>
              </div>

              <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-slate-600">
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
                <div className="rounded-xl bg-slate-50 px-3.5 py-3 text-sm text-slate-600 ring-1 ring-slate-200">
                  <span className="font-medium text-slate-700">Notes:</span> {contact.notes}
                </div>
              ) : null}
            </div>

            <div className="flex shrink-0 gap-2">
              <button
                className="rounded-xl border border-stone-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-stone-50 focus:outline-none focus:ring-4 focus:ring-stone-100"
                onClick={() => onEdit(contact)}
                type="button"
              >
                Edit
              </button>
              <button
                className="rounded-xl bg-rose-600 px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-700 focus:outline-none focus:ring-4 focus:ring-rose-100 disabled:cursor-not-allowed disabled:bg-rose-300"
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

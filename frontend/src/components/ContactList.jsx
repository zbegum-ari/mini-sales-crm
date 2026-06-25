function ContactList({ contacts, deletingContactId, emptyMessage, onDelete, onEdit }) {
  if (contacts.length === 0) {
    return <div className="crm-empty-state">{emptyMessage}</div>;
  }

  return (
    <div className="space-y-3">
      {contacts.map((contact) => (
        <article
          className="crm-list-card"
          key={contact.id}
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0 space-y-3">
              <div className="flex flex-wrap items-center gap-2.5">
                <h3 className="text-lg font-semibold text-slate-900">
                  {contact.first_name} {contact.last_name}
                </h3>
                <span className="crm-chip rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-700 ring-1 ring-cyan-200">
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
                <div className="crm-inline-note">
                  <span className="font-medium text-slate-700">Notes:</span> {contact.notes}
                </div>
              ) : null}
            </div>

            <div className="flex shrink-0 gap-2">
              <button
                className="crm-button crm-button-inline crm-button-secondary"
                onClick={() => onEdit(contact)}
                type="button"
              >
                Edit
              </button>
              <button
                className="crm-button crm-button-inline crm-button-danger"
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

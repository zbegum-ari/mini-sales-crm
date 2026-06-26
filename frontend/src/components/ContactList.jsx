import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

function ContactList({ contacts, deletingContactId, emptyMessage, onDelete, onEdit }) {
  if (contacts.length === 0) {
    return (
      <Alert className="crm-empty-state border-slate-200 bg-slate-50/80 text-slate-600">
        <AlertDescription>{emptyMessage}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-3">
      {contacts.map((contact) => (
        <Card className="crm-list-card border-slate-200/90 py-0" key={contact.id}>
          <CardContent className="px-5 py-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0 space-y-3">
              <div className="flex flex-wrap items-center gap-2.5">
                <h3 className="text-lg font-semibold text-slate-900">
                  {contact.first_name} {contact.last_name}
                </h3>
                <Badge className="crm-chip rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-700 ring-1 ring-cyan-200">
                  {contact.job_title}
                </Badge>
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
              <Button
                className="crm-button crm-button-inline crm-button-secondary"
                onClick={() => onEdit(contact)}
                size="sm"
                type="button"
                variant="outline"
              >
                Edit
              </Button>
              <Button
                className="crm-button crm-button-inline crm-button-danger"
                disabled={deletingContactId === contact.id}
                onClick={() => onDelete(contact)}
                size="sm"
                type="button"
                variant="destructive"
              >
                {deletingContactId === contact.id ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default ContactList;

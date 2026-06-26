import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

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
      <Alert className="crm-empty-state border-slate-200 bg-slate-50/80 text-slate-600">
        <AlertDescription>{emptyMessage}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-3">
      {companies.map((company) => (
        <Card className="crm-list-card border-slate-200/90 py-0" key={company.id}>
          <CardContent className="px-5 py-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0 space-y-3">
              <div className="flex flex-wrap items-center gap-2.5">
                <h3 className="text-lg font-semibold text-slate-900">{company.name}</h3>
                <Badge
                  className={`crm-chip px-3 py-1 text-xs font-semibold ring-1 ${companyStatusClassName(
                    company.status,
                  )}`}
                >
                  {company.status}
                </Badge>
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
              <Button
                className="crm-button crm-button-inline crm-button-secondary"
                onClick={() => onEdit(company)}
                size="sm"
                type="button"
                variant="outline"
              >
                Edit
              </Button>
              <Button
                className="crm-button crm-button-inline crm-button-danger"
                disabled={deletingCompanyId === company.id}
                onClick={() => onDelete(company)}
                size="sm"
                type="button"
                variant="destructive"
              >
                {deletingCompanyId === company.id ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default CompanyList;

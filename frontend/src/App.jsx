import { useEffect, useState } from "react";

import CompanyForm from "./components/CompanyForm";
import CompanyList from "./components/CompanyList";
import {
  checkHealth,
  createCompany,
  deleteCompany,
  getCompanies,
  updateCompany,
} from "./services/api";

function App() {
  const [status, setStatus] = useState("Checking backend...");
  const [isConnected, setIsConnected] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [isLoadingCompanies, setIsLoadingCompanies] = useState(true);
  const [companiesError, setCompaniesError] = useState("");
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingCompanyId, setDeletingCompanyId] = useState(null);
  const [editingCompany, setEditingCompany] = useState(null);

  useEffect(() => {
    async function checkBackend() {
      try {
        const data = await checkHealth();

        if (data.status === "ok") {
          setStatus("Backend is connected");
          setIsConnected(true);
          return;
        }

        setStatus("Backend returned an unexpected response");
      } catch {
        setStatus("Could not connect to backend");
      }
    }

    checkBackend();
  }, []);

  useEffect(() => {
    loadCompanies();
  }, []);

  async function loadCompanies() {
    setIsLoadingCompanies(true);
    setCompaniesError("");

    try {
      const data = await getCompanies();
      setCompanies(data);
    } catch (error) {
      setCompaniesError(error.message || "Could not load companies");
    } finally {
      setIsLoadingCompanies(false);
    }
  }

  async function handleCreateCompany(companyData) {
    setIsSubmitting(true);
    setFormError("");

    try {
      await createCompany(companyData);
      await loadCompanies();
      return true;
    } catch (error) {
      setFormError(error.message || "Could not create company");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleUpdateCompany(companyData) {
    if (!editingCompany) {
      return;
    }

    setIsSubmitting(true);
    setFormError("");

    try {
      await updateCompany(editingCompany.id, companyData);
      setEditingCompany(null);
      await loadCompanies();
      return true;
    } catch (error) {
      setFormError(error.message || "Could not update company");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDeleteCompany(company) {
    const confirmed = window.confirm(`Delete ${company.name}?`);

    if (!confirmed) {
      return;
    }

    setDeletingCompanyId(company.id);
    setCompaniesError("");

    try {
      await deleteCompany(company.id);
      if (editingCompany?.id === company.id) {
        setEditingCompany(null);
      }
      await loadCompanies();
    } catch (error) {
      setCompaniesError(error.message || "Could not delete company");
    } finally {
      setDeletingCompanyId(null);
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 px-6 py-16">
      <div className="mx-auto max-w-6xl space-y-8">
        <section className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
            Mini Sales CRM v1
          </p>
          <h1 className="mt-3 text-3xl font-bold text-slate-900">
            Milestone 2: Company CRUD
          </h1>
          <p className="mt-3 text-slate-600">
            This page keeps the backend health check and adds a simple company
            management screen.
          </p>

          <div
            className={`mt-8 rounded-xl border px-4 py-4 ${
              isConnected
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-amber-200 bg-amber-50 text-amber-700"
            }`}
          >
            <span className="font-medium">Connection status:</span> {status}
          </div>
        </section>

        <section className="grid gap-8 lg:grid-cols-[1fr_1.2fr]">
          <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
            <h2 className="text-2xl font-bold text-slate-900">
              {editingCompany ? "Edit company" : "Add company"}
            </h2>
            <p className="mt-2 text-slate-600">
              Fill in the company details below. Only the company name is
              required.
            </p>

            {formError ? (
              <div className="mt-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-rose-700">
                {formError}
              </div>
            ) : null}

            <div className="mt-6">
              <CompanyForm
                initialValues={editingCompany}
                isSubmitting={isSubmitting}
                onCancel={editingCompany ? () => setEditingCompany(null) : null}
                onSubmit={editingCompany ? handleUpdateCompany : handleCreateCompany}
                submitLabel={editingCompany ? "Update company" : "Add company"}
              />
            </div>
          </div>

          <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Companies</h2>
                <p className="mt-2 text-slate-600">
                  View, edit, and delete companies from your first CRM resource.
                </p>
              </div>

              <button
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                onClick={loadCompanies}
                type="button"
              >
                Refresh list
              </button>
            </div>

            {companiesError ? (
              <div className="mt-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-rose-700">
                {companiesError}
              </div>
            ) : null}

            <div className="mt-6">
              {isLoadingCompanies ? (
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-6 text-slate-600">
                  Loading companies...
                </div>
              ) : (
                <CompanyList
                  companies={companies}
                  deletingCompanyId={deletingCompanyId}
                  onDelete={handleDeleteCompany}
                  onEdit={setEditingCompany}
                />
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

export default App;

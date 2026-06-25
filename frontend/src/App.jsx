import { useEffect, useState } from "react";

import CompanyForm from "./components/CompanyForm";
import CompanyList from "./components/CompanyList";
import ContactForm from "./components/ContactForm";
import ContactList from "./components/ContactList";
import {
  checkHealth,
  createCompany,
  createContact,
  deleteCompany,
  deleteContact,
  getCompanies,
  getContacts,
  updateCompany,
  updateContact,
} from "./services/api";

function App() {
  const statusOptions = ["All", "Lead", "Active", "Inactive", "Customer", "Lost"];
  const allCompaniesValue = "all";
  const [status, setStatus] = useState("Checking backend...");
  const [isConnected, setIsConnected] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [isLoadingCompanies, setIsLoadingCompanies] = useState(true);
  const [companiesError, setCompaniesError] = useState("");
  const [companyFormError, setCompanyFormError] = useState("");
  const [isSubmittingCompany, setIsSubmittingCompany] = useState(false);
  const [deletingCompanyId, setDeletingCompanyId] = useState(null);
  const [editingCompany, setEditingCompany] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [contacts, setContacts] = useState([]);
  const [isLoadingContacts, setIsLoadingContacts] = useState(true);
  const [contactsError, setContactsError] = useState("");
  const [contactFormError, setContactFormError] = useState("");
  const [isSubmittingContact, setIsSubmittingContact] = useState(false);
  const [deletingContactId, setDeletingContactId] = useState(null);
  const [editingContact, setEditingContact] = useState(null);
  const [selectedContactCompany, setSelectedContactCompany] = useState(allCompaniesValue);

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

  useEffect(() => {
    loadContacts(selectedContactCompany);
  }, [selectedContactCompany]);

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

  async function loadContacts(companyFilter = selectedContactCompany) {
    setIsLoadingContacts(true);
    setContactsError("");

    try {
      const companyId =
        companyFilter === allCompaniesValue ? undefined : Number(companyFilter);
      const data = await getContacts(companyId);
      setContacts(data);
    } catch (error) {
      setContactsError(error.message || "Could not load contacts");
    } finally {
      setIsLoadingContacts(false);
    }
  }

  async function handleCreateCompany(companyData) {
    setIsSubmittingCompany(true);
    setCompanyFormError("");

    try {
      await createCompany(companyData);
      await loadCompanies();
      await loadContacts(selectedContactCompany);
      return true;
    } catch (error) {
      setCompanyFormError(error.message || "Could not create company");
      return false;
    } finally {
      setIsSubmittingCompany(false);
    }
  }

  async function handleUpdateCompany(companyData) {
    if (!editingCompany) {
      return;
    }

    setIsSubmittingCompany(true);
    setCompanyFormError("");

    try {
      await updateCompany(editingCompany.id, companyData);
      setEditingCompany(null);
      await loadCompanies();
      await loadContacts(selectedContactCompany);
      return true;
    } catch (error) {
      setCompanyFormError(error.message || "Could not update company");
      return false;
    } finally {
      setIsSubmittingCompany(false);
    }
  }

  async function handleDeleteCompany(company) {
    const confirmed = window.confirm(`Delete ${company.name}?`);

    if (!confirmed) {
      return;
    }

    setDeletingCompanyId(company.id);
    setCompaniesError("");
    const nextContactCompanyFilter =
      selectedContactCompany === String(company.id)
        ? allCompaniesValue
        : selectedContactCompany;

    try {
      await deleteCompany(company.id);
      if (editingCompany?.id === company.id) {
        setEditingCompany(null);
      }
      if (editingContact?.company_id === company.id) {
        setEditingContact(null);
      }
      if (selectedContactCompany === String(company.id)) {
        setSelectedContactCompany(allCompaniesValue);
      }
      await loadCompanies();
      await loadContacts(nextContactCompanyFilter);
    } catch (error) {
      setCompaniesError(error.message || "Could not delete company");
    } finally {
      setDeletingCompanyId(null);
    }
  }

  async function handleCreateContact(contactData) {
    setIsSubmittingContact(true);
    setContactFormError("");

    try {
      await createContact(contactData);
      await loadContacts(selectedContactCompany);
      return true;
    } catch (error) {
      setContactFormError(error.message || "Could not create contact");
      return false;
    } finally {
      setIsSubmittingContact(false);
    }
  }

  async function handleUpdateContact(contactData) {
    if (!editingContact) {
      return false;
    }

    setIsSubmittingContact(true);
    setContactFormError("");

    try {
      await updateContact(editingContact.id, contactData);
      setEditingContact(null);
      await loadContacts(selectedContactCompany);
      return true;
    } catch (error) {
      setContactFormError(error.message || "Could not update contact");
      return false;
    } finally {
      setIsSubmittingContact(false);
    }
  }

  async function handleDeleteContact(contact) {
    const confirmed = window.confirm(
      `Delete ${contact.first_name} ${contact.last_name}?`
    );

    if (!confirmed) {
      return;
    }

    setDeletingContactId(contact.id);
    setContactsError("");

    try {
      await deleteContact(contact.id);
      if (editingContact?.id === contact.id) {
        setEditingContact(null);
      }
      await loadContacts(selectedContactCompany);
    } catch (error) {
      setContactsError(error.message || "Could not delete contact");
    } finally {
      setDeletingContactId(null);
    }
  }

  const filteredCompanies =
    selectedStatus === "All"
      ? companies
      : companies.filter((company) => company.status === selectedStatus);

  const emptyMessage =
    selectedStatus === "All"
      ? "No companies yet. Add your first company using the form."
      : `No companies found with status "${selectedStatus}".`;

  const contactsEmptyMessage =
    selectedContactCompany === allCompaniesValue
      ? "No contacts yet. Add your first contact using the form."
      : "No contacts found for the selected company.";

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 bg-gradient-to-r from-indigo-600 to-blue-600 px-8 py-6 text-white">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-indigo-100">
              Mini Sales CRM v1
            </p>
            <h1 className="mt-2 text-3xl font-bold">Milestone 3: Contacts</h1>
            <p className="mt-2 max-w-2xl text-sm text-indigo-50">
              This page keeps the backend health check and extends the CRM with
              company and contact management.
            </p>
          </div>

          <div className="px-8 py-6">
            <div
              className={`rounded-2xl border px-4 py-4 text-sm ${
                isConnected
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-rose-200 bg-rose-50 text-rose-700"
              }`}
            >
              <span className="inline-flex items-center gap-2 font-semibold">
                <span
                  className={`h-2.5 w-2.5 rounded-full ${
                    isConnected ? "bg-emerald-500" : "bg-rose-500"
                  }`}
                />
                Connection status:
              </span>{" "}
              {status}
            </div>
          </div>
        </section>

        <section className="grid gap-8 lg:grid-cols-[1fr_1.2fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="border-b border-slate-200 pb-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600">
                Company Form
              </p>
              <h2 className="mt-2 text-2xl font-bold text-slate-900">
                {editingCompany ? "Edit company" : "Add company"}
              </h2>
              <p className="mt-2 text-slate-600">
                Fill in the company details below. Fields marked with * are
                required.
              </p>
            </div>

            {companyFormError ? (
              <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {companyFormError}
              </div>
            ) : null}

            <div className="mt-6">
              <CompanyForm
                initialValues={editingCompany}
                isSubmitting={isSubmittingCompany}
                onCancel={editingCompany ? () => setEditingCompany(null) : null}
                onSubmit={editingCompany ? handleUpdateCompany : handleCreateCompany}
                submitLabel={editingCompany ? "Update company" : "Add company"}
              />
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600">
                  Company List
                </p>
                <h2 className="mt-2 text-2xl font-bold text-slate-900">Companies</h2>
                <p className="mt-2 text-slate-600">
                  View, edit, and delete companies from your first CRM resource.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <select
                  className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                  onChange={(event) => setSelectedStatus(event.target.value)}
                  value={selectedStatus}
                >
                  {statusOptions.map((option) => (
                    <option key={option} value={option}>
                      {option === "All" ? "All statuses" : option}
                    </option>
                  ))}
                </select>

                <button
                  className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100"
                  onClick={loadCompanies}
                  type="button"
                >
                  Refresh list
                </button>
              </div>
            </div>

            {companiesError ? (
              <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {companiesError}
              </div>
            ) : null}

            <div className="mt-6">
              {isLoadingCompanies ? (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-8 text-sm text-slate-600">
                  Loading companies...
                </div>
              ) : (
                <CompanyList
                  companies={filteredCompanies}
                  deletingCompanyId={deletingCompanyId}
                  emptyMessage={emptyMessage}
                  onDelete={handleDeleteCompany}
                  onEdit={setEditingCompany}
                />
              )}
            </div>
          </div>
        </section>

        <section className="grid gap-8 lg:grid-cols-[1fr_1.2fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="border-b border-slate-200 pb-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600">
                Contact Form
              </p>
              <h2 className="mt-2 text-2xl font-bold text-slate-900">
                {editingContact ? "Edit contact" : "Add contact"}
              </h2>
              <p className="mt-2 text-slate-600">
                Add people under companies and keep their core details in one place.
              </p>
            </div>

            {contactFormError ? (
              <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {contactFormError}
              </div>
            ) : null}

            <div className="mt-6">
              {companies.length === 0 ? (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-700">
                  Create a company before adding contacts.
                </div>
              ) : (
                <ContactForm
                  companies={companies}
                  initialValues={editingContact}
                  isSubmitting={isSubmittingContact}
                  onCancel={editingContact ? () => setEditingContact(null) : null}
                  onSubmit={editingContact ? handleUpdateContact : handleCreateContact}
                  submitLabel={editingContact ? "Update contact" : "Add contact"}
                />
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600">
                  Contact List
                </p>
                <h2 className="mt-2 text-2xl font-bold text-slate-900">Contacts</h2>
                <p className="mt-2 text-slate-600">
                  View, edit, and delete contacts linked to your companies.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <select
                  className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                  onChange={(event) => setSelectedContactCompany(event.target.value)}
                  value={selectedContactCompany}
                >
                  <option value={allCompaniesValue}>All companies</option>
                  {companies.map((company) => (
                    <option key={company.id} value={company.id}>
                      {company.name}
                    </option>
                  ))}
                </select>

                <button
                  className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100"
                  onClick={() => loadContacts(selectedContactCompany)}
                  type="button"
                >
                  Refresh list
                </button>
              </div>
            </div>

            {contactsError ? (
              <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {contactsError}
              </div>
            ) : null}

            <div className="mt-6">
              {isLoadingContacts ? (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-8 text-sm text-slate-600">
                  Loading contacts...
                </div>
              ) : (
                <ContactList
                  contacts={contacts}
                  deletingContactId={deletingContactId}
                  emptyMessage={contactsEmptyMessage}
                  onDelete={handleDeleteContact}
                  onEdit={setEditingContact}
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

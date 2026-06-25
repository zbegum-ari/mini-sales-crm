import { useEffect, useState } from "react";

import CompanyForm from "./components/CompanyForm";
import CompanyList from "./components/CompanyList";
import ContactForm from "./components/ContactForm";
import ContactList from "./components/ContactList";
import DealForm from "./components/DealForm";
import DealList from "./components/DealList";
import {
  checkHealth,
  createCompany,
  createContact,
  createDeal,
  deleteCompany,
  deleteContact,
  deleteDeal,
  getDeals,
  getCompanies,
  getContacts,
  updateCompany,
  updateContact,
  updateDeal,
} from "./services/api";

function App() {
  const statusOptions = ["All", "Lead", "Active", "Inactive", "Customer", "Lost"];
  const dealStageOptions = ["All", "Lead", "Qualified", "Proposal", "Negotiation", "Won", "Lost"];
  const allCompaniesValue = "all";
  const sections = [
    { id: "companies", label: "Companies" },
    { id: "contacts", label: "Contacts" },
    { id: "deals", label: "Deals" },
    { id: "dashboard", label: "Dashboard" },
  ];
  const [status, setStatus] = useState("Checking backend...");
  const [isConnected, setIsConnected] = useState(false);
  const [activeSection, setActiveSection] = useState("companies");
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
  const [deals, setDeals] = useState([]);
  const [isLoadingDeals, setIsLoadingDeals] = useState(true);
  const [dealsError, setDealsError] = useState("");
  const [dealFormError, setDealFormError] = useState("");
  const [isSubmittingDeal, setIsSubmittingDeal] = useState(false);
  const [deletingDealId, setDeletingDealId] = useState(null);
  const [editingDeal, setEditingDeal] = useState(null);
  const [selectedDealStage, setSelectedDealStage] = useState("All");

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

  useEffect(() => {
    loadDeals(selectedDealStage);
  }, [selectedDealStage]);

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

  async function loadDeals(stageFilter = selectedDealStage) {
    setIsLoadingDeals(true);
    setDealsError("");

    try {
      const pipelineStage = stageFilter === "All" ? undefined : stageFilter;
      const data = await getDeals({ pipelineStage });
      setDeals(data);
    } catch (error) {
      setDealsError(error.message || "Could not load deals");
    } finally {
      setIsLoadingDeals(false);
    }
  }

  async function handleCreateCompany(companyData) {
    setIsSubmittingCompany(true);
    setCompanyFormError("");

    try {
      await createCompany(companyData);
      await loadCompanies();
      await loadContacts(selectedContactCompany);
      await loadDeals(selectedDealStage);
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
      await loadDeals(selectedDealStage);
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
      if (editingDeal?.company_id === company.id) {
        setEditingDeal(null);
      }
      if (selectedContactCompany === String(company.id)) {
        setSelectedContactCompany(allCompaniesValue);
      }
      await loadCompanies();
      await loadContacts(nextContactCompanyFilter);
      await loadDeals(selectedDealStage);
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

  async function handleCreateDeal(dealData) {
    setIsSubmittingDeal(true);
    setDealFormError("");

    try {
      await createDeal(dealData);
      await loadDeals(selectedDealStage);
      return true;
    } catch (error) {
      setDealFormError(error.message || "Could not create deal");
      return false;
    } finally {
      setIsSubmittingDeal(false);
    }
  }

  async function handleUpdateDeal(dealData) {
    if (!editingDeal) {
      return false;
    }

    setIsSubmittingDeal(true);
    setDealFormError("");

    try {
      await updateDeal(editingDeal.id, dealData);
      setEditingDeal(null);
      await loadDeals(selectedDealStage);
      return true;
    } catch (error) {
      setDealFormError(error.message || "Could not update deal");
      return false;
    } finally {
      setIsSubmittingDeal(false);
    }
  }

  async function handleDeleteDeal(deal) {
    const confirmed = window.confirm(`Delete ${deal.title}?`);

    if (!confirmed) {
      return;
    }

    setDeletingDealId(deal.id);
    setDealsError("");

    try {
      await deleteDeal(deal.id);
      if (editingDeal?.id === deal.id) {
        setEditingDeal(null);
      }
      await loadDeals(selectedDealStage);
    } catch (error) {
      setDealsError(error.message || "Could not delete deal");
    } finally {
      setDeletingDealId(null);
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

  const dealsEmptyMessage =
    selectedDealStage === "All"
      ? "No deals yet. Add your first deal using the form."
      : `No deals found in the "${selectedDealStage}" stage.`;

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 bg-gradient-to-r from-indigo-600 to-blue-600 px-8 py-6 text-white">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-indigo-100">
              Mini Sales CRM v1
            </p>
            <h1 className="mt-2 text-3xl font-bold">Milestone 4: Deals</h1>
            <p className="mt-2 max-w-2xl text-sm text-indigo-50">
              This page keeps the backend health check and organizes the CRM
              into simple working sections with companies, contacts, and deals.
            </p>
          </div>

          <div className="space-y-6 px-8 py-6">
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

            <nav className="flex flex-wrap gap-3" aria-label="Primary">
              {sections.map((section) => (
                <button
                  key={section.id}
                  className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition focus:outline-none focus:ring-4 ${
                    activeSection === section.id
                      ? "bg-indigo-600 text-white shadow-sm focus:ring-indigo-100"
                      : "border border-slate-300 bg-white text-slate-700 shadow-sm hover:bg-slate-50 focus:ring-slate-100"
                  }`}
                  onClick={() => setActiveSection(section.id)}
                  type="button"
                >
                  {section.label}
                </button>
              ))}
            </nav>
          </div>
        </section>

        {activeSection === "companies" ? (
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
        ) : null}

        {activeSection === "contacts" ? (
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
        ) : null}

        {activeSection === "deals" ? (
          <section className="grid gap-8 lg:grid-cols-[1fr_1.2fr]">
            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
              <div className="border-b border-slate-200 pb-5">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600">
                  Deal Form
                </p>
                <h2 className="mt-2 text-2xl font-bold text-slate-900">
                  {editingDeal ? "Edit deal" : "Add deal"}
                </h2>
                <p className="mt-2 text-slate-600">
                  Track revenue opportunities under companies and keep the pipeline up to date.
                </p>
              </div>

              {dealFormError ? (
                <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {dealFormError}
                </div>
              ) : null}

              <div className="mt-6">
                {companies.length === 0 ? (
                  <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-700">
                    Create a company before adding deals.
                  </div>
                ) : (
                  <DealForm
                    companies={companies}
                    initialValues={editingDeal}
                    isSubmitting={isSubmittingDeal}
                    onCancel={editingDeal ? () => setEditingDeal(null) : null}
                    onSubmit={editingDeal ? handleUpdateDeal : handleCreateDeal}
                    submitLabel={editingDeal ? "Update deal" : "Add deal"}
                  />
                )}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
              <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600">
                    Deal List
                  </p>
                  <h2 className="mt-2 text-2xl font-bold text-slate-900">Deals</h2>
                  <p className="mt-2 text-slate-600">
                    View, edit, and delete deals while tracking pipeline progress.
                  </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <select
                    className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                    onChange={(event) => setSelectedDealStage(event.target.value)}
                    value={selectedDealStage}
                  >
                    {dealStageOptions.map((option) => (
                      <option key={option} value={option}>
                        {option === "All" ? "All stages" : option}
                      </option>
                    ))}
                  </select>

                  <button
                    className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100"
                    onClick={() => loadDeals(selectedDealStage)}
                    type="button"
                  >
                    Refresh list
                  </button>
                </div>
              </div>

              {dealsError ? (
                <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {dealsError}
                </div>
              ) : null}

              <div className="mt-6">
                {isLoadingDeals ? (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-8 text-sm text-slate-600">
                    Loading deals...
                  </div>
                ) : (
                  <DealList
                    deals={deals}
                    deletingDealId={deletingDealId}
                    emptyMessage={dealsEmptyMessage}
                    onDelete={handleDeleteDeal}
                    onEdit={setEditingDeal}
                  />
                )}
              </div>
            </div>
          </section>
        ) : null}

        {activeSection === "dashboard" ? (
          <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600">
              Dashboard
            </p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900">Dashboard</h2>
            <p className="mt-3 text-slate-600">
              Dashboard will be implemented in Milestone 6.
            </p>
          </section>
        ) : null}
      </div>
    </main>
  );
}

export default App;

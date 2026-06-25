import { useEffect, useState } from "react";

import ActivityForm from "./components/ActivityForm";
import ActivityList from "./components/ActivityList";
import CompanyForm from "./components/CompanyForm";
import CompanyList from "./components/CompanyList";
import ContactForm from "./components/ContactForm";
import ContactList from "./components/ContactList";
import DealForm from "./components/DealForm";
import DealList from "./components/DealList";
import Dashboard from "./components/Dashboard";
import TaskForm from "./components/TaskForm";
import TaskList from "./components/TaskList";
import {
  checkHealth,
  createActivity,
  createCompany,
  createContact,
  createDeal,
  createTask,
  deleteActivity,
  deleteCompany,
  deleteContact,
  deleteDeal,
  deleteTask,
  getActivities,
  getDeals,
  getCompanies,
  getContacts,
  getTasks,
  updateActivity,
  updateCompany,
  updateContact,
  updateDeal,
  updateTask,
} from "./services/api";

const statusOptions = ["All", "Lead", "Active", "Inactive", "Customer", "Lost"];
const dealStageOptions = ["All", "Lead", "Qualified", "Proposal", "Negotiation", "Won", "Lost"];
const activityTypeOptions = ["All", "Note", "Call", "Meeting", "Email", "Follow-up"];
const taskStatusOptions = ["All", "Open", "Completed", "Cancelled"];
const allCompaniesValue = "all";
const sections = [
  { id: "companies", label: "Companies" },
  { id: "contacts", label: "Contacts" },
  { id: "deals", label: "Deals" },
  { id: "activities", label: "Activities" },
  { id: "tasks", label: "Tasks" },
  { id: "dashboard", label: "Dashboard" },
];
const sectionMeta = {
  companies: {
    title: "Companies",
    description: "Manage organization records and core account details.",
  },
  contacts: {
    title: "Contacts",
    description: "Keep key people linked to the right companies.",
  },
  deals: {
    title: "Deals",
    description: "Track active revenue opportunities across the pipeline.",
  },
  activities: {
    title: "Activities",
    description: "Log notes, calls, meetings, and follow-ups in the timeline.",
  },
  tasks: {
    title: "Tasks",
    description: "Manage follow-up work, due dates, and completion status.",
  },
  dashboard: {
    title: "Dashboard",
    description: "Overview panels will be added in Milestone 6.",
  },
};

function getStatusBadge(isConnected, status) {
  if (isConnected) {
    return {
      className: "border-emerald-200 bg-emerald-50 text-emerald-700",
      dotClassName: "bg-emerald-500",
      label: "Backend connected",
    };
  }

  if (status === "Checking backend...") {
    return {
      className: "border-amber-200 bg-amber-50 text-amber-700",
      dotClassName: "bg-amber-500",
      label: "Checking backend",
    };
  }

  return {
    className: "border-rose-200 bg-rose-50 text-rose-700",
    dotClassName: "bg-rose-500",
    label: "Backend disconnected",
  };
}

function AppShellHeader({ activeSection, isConnected, sections, status, onSectionChange }) {
  const activeMeta = sectionMeta[activeSection];
  const badge = getStatusBadge(isConnected, status);

  return (
    <section className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm">
      <div className="h-1 w-full bg-gradient-to-r from-teal-600 via-cyan-500 to-sky-400" />
      <div className="border-b border-stone-200 px-6 py-5 sm:px-7">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-700">
                Mini Sales CRM
              </p>
              <h1 className="mt-1 text-2xl font-semibold text-slate-950">
                Mini Sales CRM
              </h1>
              <p className="mt-1 text-sm text-slate-500">Internal sales workspace</p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
                Current section
              </p>
              <h2 className="mt-1 text-lg font-semibold text-slate-900">
                {activeMeta.title}
              </h2>
              <p className="mt-1 text-sm text-slate-500">{activeMeta.description}</p>
            </div>
          </div>

          <div
            className={`inline-flex items-center gap-2 self-start rounded-full border px-3.5 py-2 text-sm font-medium ${badge.className}`}
          >
            <span className={`h-2.5 w-2.5 rounded-full ${badge.dotClassName}`} />
            {badge.label}
          </div>
        </div>
      </div>

      <nav className="flex flex-wrap gap-2 bg-stone-50/70 px-6 py-4 sm:px-7" aria-label="Primary">
        {sections.map((section) => (
          <button
            key={section.id}
            className={`rounded-xl border px-3.5 py-2 text-sm font-medium transition focus:outline-none focus:ring-4 ${
              activeSection === section.id
                ? "border-teal-200 bg-teal-50 text-teal-700 shadow-sm focus:ring-teal-100"
                : "border-stone-200 bg-white text-slate-600 hover:border-stone-300 hover:bg-stone-50 focus:ring-stone-100"
            }`}
            onClick={() => onSectionChange(section.id)}
            type="button"
          >
            {section.label}
          </button>
        ))}
      </nav>
    </section>
  );
}

function ModuleSection({
  actionLabel,
  description,
  controls,
  formContent,
  formError,
  formTitle,
  isFormOpen,
  listContent,
  listError,
  onCloseForm,
  onPrimaryAction,
  onRefresh,
  title,
}) {
  return (
    <section className="space-y-5">
      <div className="rounded-3xl border border-stone-200 bg-white px-5 py-5 shadow-sm sm:px-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div className="max-w-2xl">
            <h3 className="text-xl font-semibold text-slate-900">{title}</h3>
            <p className="mt-1.5 text-sm text-slate-500">{description}</p>
          </div>

          <div className="flex w-full xl:w-auto xl:justify-end">
            <div className="crm-action-row xl:justify-end">
              {controls}
              {onRefresh ? (
                <button
                  className="crm-control crm-button crm-button-secondary"
                  onClick={onRefresh}
                  type="button"
                >
                  Refresh
                </button>
              ) : null}

              <button
                className="crm-control crm-button crm-button-primary"
                onClick={onPrimaryAction}
                type="button"
              >
                {actionLabel}
              </button>
            </div>
          </div>
        </div>
      </div>

      {isFormOpen ? (
        <div className="rounded-3xl border border-stone-200 bg-white px-5 py-5 shadow-sm sm:px-6">
          <div className="flex flex-col gap-3 border-b border-stone-200 pb-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h4 className="text-lg font-semibold text-slate-900">{formTitle}</h4>
              <p className="mt-1 text-sm text-slate-500">
                Fields marked with * are required.
              </p>
            </div>

            <button
              className="rounded-xl border border-stone-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-stone-50 focus:outline-none focus:ring-4 focus:ring-stone-100"
              onClick={onCloseForm}
              type="button"
            >
              Close
            </button>
          </div>

          {formError ? (
            <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {formError}
            </div>
          ) : null}

          <div className="mt-5">{formContent}</div>
        </div>
      ) : null}

      <div className="rounded-3xl border border-stone-200 bg-white px-5 py-5 shadow-sm sm:px-6">
        {listError ? (
          <div className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {listError}
          </div>
        ) : null}

        {listContent}
      </div>
    </section>
  );
}

function App() {
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
  const [isCompanyFormOpen, setIsCompanyFormOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [contacts, setContacts] = useState([]);
  const [isLoadingContacts, setIsLoadingContacts] = useState(true);
  const [contactsError, setContactsError] = useState("");
  const [contactFormError, setContactFormError] = useState("");
  const [isSubmittingContact, setIsSubmittingContact] = useState(false);
  const [deletingContactId, setDeletingContactId] = useState(null);
  const [editingContact, setEditingContact] = useState(null);
  const [isContactFormOpen, setIsContactFormOpen] = useState(false);
  const [selectedContactCompany, setSelectedContactCompany] = useState(allCompaniesValue);
  const [deals, setDeals] = useState([]);
  const [allDeals, setAllDeals] = useState([]);
  const [isLoadingDeals, setIsLoadingDeals] = useState(true);
  const [dealsError, setDealsError] = useState("");
  const [dealFormError, setDealFormError] = useState("");
  const [isSubmittingDeal, setIsSubmittingDeal] = useState(false);
  const [deletingDealId, setDeletingDealId] = useState(null);
  const [editingDeal, setEditingDeal] = useState(null);
  const [isDealFormOpen, setIsDealFormOpen] = useState(false);
  const [selectedDealStage, setSelectedDealStage] = useState("All");
  const [activities, setActivities] = useState([]);
  const [isLoadingActivities, setIsLoadingActivities] = useState(true);
  const [activitiesError, setActivitiesError] = useState("");
  const [activityFormError, setActivityFormError] = useState("");
  const [isSubmittingActivity, setIsSubmittingActivity] = useState(false);
  const [deletingActivityId, setDeletingActivityId] = useState(null);
  const [editingActivity, setEditingActivity] = useState(null);
  const [isActivityFormOpen, setIsActivityFormOpen] = useState(false);
  const [selectedActivityCompany, setSelectedActivityCompany] = useState(allCompaniesValue);
  const [selectedActivityType, setSelectedActivityType] = useState("All");
  const [tasks, setTasks] = useState([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(true);
  const [tasksError, setTasksError] = useState("");
  const [taskFormError, setTaskFormError] = useState("");
  const [isSubmittingTask, setIsSubmittingTask] = useState(false);
  const [deletingTaskId, setDeletingTaskId] = useState(null);
  const [completingTaskId, setCompletingTaskId] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [selectedTaskCompany, setSelectedTaskCompany] = useState(allCompaniesValue);
  const [selectedTaskStatus, setSelectedTaskStatus] = useState("All");
  const [showOverdueTasksOnly, setShowOverdueTasksOnly] = useState(false);

  useEffect(() => {
    async function checkBackend() {
      try {
        const data = await checkHealth();

        if (data.status === "ok") {
          setStatus("Backend connected");
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
    loadAllDeals();
  }, []);

  useEffect(() => {
    loadContacts(selectedContactCompany);
  }, [selectedContactCompany]);

  useEffect(() => {
    loadDeals(selectedDealStage);
  }, [selectedDealStage]);

  useEffect(() => {
    loadActivities(selectedActivityCompany, selectedActivityType);
  }, [selectedActivityCompany, selectedActivityType]);

  useEffect(() => {
    loadTasks(selectedTaskCompany, selectedTaskStatus, showOverdueTasksOnly);
  }, [selectedTaskCompany, selectedTaskStatus, showOverdueTasksOnly]);

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

  async function loadAllDeals() {
    try {
      const data = await getDeals();
      setAllDeals(data);
    } catch {
      setAllDeals([]);
    }
  }

  async function loadActivities(
    companyFilter = selectedActivityCompany,
    typeFilter = selectedActivityType,
  ) {
    setIsLoadingActivities(true);
    setActivitiesError("");

    try {
      const companyId =
        companyFilter === allCompaniesValue ? undefined : Number(companyFilter);
      const activityType = typeFilter === "All" ? undefined : typeFilter;
      const data = await getActivities({ companyId, activityType });
      setActivities(data);
    } catch (error) {
      setActivitiesError(error.message || "Could not load activities");
    } finally {
      setIsLoadingActivities(false);
    }
  }

  async function loadTasks(
    companyFilter = selectedTaskCompany,
    statusFilter = selectedTaskStatus,
    overdueOnly = showOverdueTasksOnly,
  ) {
    setIsLoadingTasks(true);
    setTasksError("");

    try {
      const companyId =
        companyFilter === allCompaniesValue ? undefined : Number(companyFilter);
      const status = statusFilter === "All" ? undefined : statusFilter;
      const data = await getTasks({ companyId, status, overdue: overdueOnly });
      setTasks(data);
    } catch (error) {
      setTasksError(error.message || "Could not load tasks");
    } finally {
      setIsLoadingTasks(false);
    }
  }

  function openCompanyCreateForm() {
    setEditingCompany(null);
    setCompanyFormError("");
    setIsCompanyFormOpen(true);
  }

  function closeCompanyForm() {
    setEditingCompany(null);
    setCompanyFormError("");
    setIsCompanyFormOpen(false);
  }

  function openContactCreateForm() {
    setEditingContact(null);
    setContactFormError("");
    setIsContactFormOpen(true);
  }

  function closeContactForm() {
    setEditingContact(null);
    setContactFormError("");
    setIsContactFormOpen(false);
  }

  function openDealCreateForm() {
    setEditingDeal(null);
    setDealFormError("");
    setIsDealFormOpen(true);
  }

  function closeDealForm() {
    setEditingDeal(null);
    setDealFormError("");
    setIsDealFormOpen(false);
  }

  function openActivityCreateForm() {
    setEditingActivity(null);
    setActivityFormError("");
    setIsActivityFormOpen(true);
  }

  function closeActivityForm() {
    setEditingActivity(null);
    setActivityFormError("");
    setIsActivityFormOpen(false);
  }

  function openTaskCreateForm() {
    setEditingTask(null);
    setTaskFormError("");
    setIsTaskFormOpen(true);
  }

  function closeTaskForm() {
    setEditingTask(null);
    setTaskFormError("");
    setIsTaskFormOpen(false);
  }

  async function handleCreateCompany(companyData) {
    setIsSubmittingCompany(true);
    setCompanyFormError("");

    try {
      await createCompany(companyData);
      closeCompanyForm();
      await loadCompanies();
      await loadContacts(selectedContactCompany);
      await loadDeals(selectedDealStage);
      await loadAllDeals();
      await loadActivities(selectedActivityCompany, selectedActivityType);
      await loadTasks(selectedTaskCompany, selectedTaskStatus, showOverdueTasksOnly);
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
      return false;
    }

    setIsSubmittingCompany(true);
    setCompanyFormError("");

    try {
      await updateCompany(editingCompany.id, companyData);
      closeCompanyForm();
      await loadCompanies();
      await loadContacts(selectedContactCompany);
      await loadDeals(selectedDealStage);
      await loadAllDeals();
      await loadActivities(selectedActivityCompany, selectedActivityType);
      await loadTasks(selectedTaskCompany, selectedTaskStatus, showOverdueTasksOnly);
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
    const nextActivityCompanyFilter =
      selectedActivityCompany === String(company.id)
        ? allCompaniesValue
        : selectedActivityCompany;
    const nextTaskCompanyFilter =
      selectedTaskCompany === String(company.id)
        ? allCompaniesValue
        : selectedTaskCompany;

    try {
      await deleteCompany(company.id);
      if (editingCompany?.id === company.id) {
        closeCompanyForm();
      }
      if (editingContact?.company_id === company.id) {
        closeContactForm();
      }
      if (editingDeal?.company_id === company.id) {
        closeDealForm();
      }
      if (editingActivity?.company_id === company.id) {
        closeActivityForm();
      }
      if (editingTask?.company_id === company.id) {
        closeTaskForm();
      }
      if (selectedContactCompany === String(company.id)) {
        setSelectedContactCompany(allCompaniesValue);
      }
      if (selectedActivityCompany === String(company.id)) {
        setSelectedActivityCompany(allCompaniesValue);
      }
      if (selectedTaskCompany === String(company.id)) {
        setSelectedTaskCompany(allCompaniesValue);
      }
      await loadCompanies();
      await loadContacts(nextContactCompanyFilter);
      await loadDeals(selectedDealStage);
      await loadAllDeals();
      await loadActivities(nextActivityCompanyFilter, selectedActivityType);
      await loadTasks(nextTaskCompanyFilter, selectedTaskStatus, showOverdueTasksOnly);
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
      closeContactForm();
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
      closeContactForm();
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
      `Delete ${contact.first_name} ${contact.last_name}?`,
    );

    if (!confirmed) {
      return;
    }

    setDeletingContactId(contact.id);
    setContactsError("");

    try {
      await deleteContact(contact.id);
      if (editingContact?.id === contact.id) {
        closeContactForm();
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
      closeDealForm();
      await loadDeals(selectedDealStage);
      await loadAllDeals();
      await loadActivities(selectedActivityCompany, selectedActivityType);
      await loadTasks(selectedTaskCompany, selectedTaskStatus, showOverdueTasksOnly);
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
      closeDealForm();
      await loadDeals(selectedDealStage);
      await loadAllDeals();
      await loadActivities(selectedActivityCompany, selectedActivityType);
      await loadTasks(selectedTaskCompany, selectedTaskStatus, showOverdueTasksOnly);
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
        closeDealForm();
      }
      if (editingActivity?.deal_id === deal.id) {
        closeActivityForm();
      }
      if (editingTask?.deal_id === deal.id) {
        closeTaskForm();
      }
      await loadDeals(selectedDealStage);
      await loadAllDeals();
      await loadActivities(selectedActivityCompany, selectedActivityType);
      await loadTasks(selectedTaskCompany, selectedTaskStatus, showOverdueTasksOnly);
    } catch (error) {
      setDealsError(error.message || "Could not delete deal");
    } finally {
      setDeletingDealId(null);
    }
  }

  async function handleCreateActivity(activityData) {
    setIsSubmittingActivity(true);
    setActivityFormError("");

    try {
      await createActivity(activityData);
      closeActivityForm();
      await loadActivities(selectedActivityCompany, selectedActivityType);
      return true;
    } catch (error) {
      setActivityFormError(error.message || "Could not create activity");
      return false;
    } finally {
      setIsSubmittingActivity(false);
    }
  }

  async function handleUpdateActivity(activityData) {
    if (!editingActivity) {
      return false;
    }

    setIsSubmittingActivity(true);
    setActivityFormError("");

    try {
      await updateActivity(editingActivity.id, activityData);
      closeActivityForm();
      await loadActivities(selectedActivityCompany, selectedActivityType);
      return true;
    } catch (error) {
      setActivityFormError(error.message || "Could not update activity");
      return false;
    } finally {
      setIsSubmittingActivity(false);
    }
  }

  async function handleDeleteActivity(activity) {
    const confirmed = window.confirm("Delete this activity?");

    if (!confirmed) {
      return;
    }

    setDeletingActivityId(activity.id);
    setActivitiesError("");

    try {
      await deleteActivity(activity.id);
      if (editingActivity?.id === activity.id) {
        closeActivityForm();
      }
      await loadActivities(selectedActivityCompany, selectedActivityType);
    } catch (error) {
      setActivitiesError(error.message || "Could not delete activity");
    } finally {
      setDeletingActivityId(null);
    }
  }

  async function handleCreateTask(taskData) {
    setIsSubmittingTask(true);
    setTaskFormError("");

    try {
      await createTask(taskData);
      closeTaskForm();
      await loadTasks(selectedTaskCompany, selectedTaskStatus, showOverdueTasksOnly);
      return true;
    } catch (error) {
      setTaskFormError(error.message || "Could not create task");
      return false;
    } finally {
      setIsSubmittingTask(false);
    }
  }

  async function handleUpdateTask(taskData) {
    if (!editingTask) {
      return false;
    }

    setIsSubmittingTask(true);
    setTaskFormError("");

    try {
      await updateTask(editingTask.id, taskData);
      closeTaskForm();
      await loadTasks(selectedTaskCompany, selectedTaskStatus, showOverdueTasksOnly);
      return true;
    } catch (error) {
      setTaskFormError(error.message || "Could not update task");
      return false;
    } finally {
      setIsSubmittingTask(false);
    }
  }

  async function handleCompleteTask(task) {
    setCompletingTaskId(task.id);
    setTasksError("");

    try {
      await updateTask(task.id, {
        company_id: task.company_id,
        deal_id: task.deal_id,
        title: task.title,
        description: task.description,
        due_date: task.due_date,
        status: "Completed",
      });

      if (editingTask?.id === task.id) {
        setEditingTask((current) =>
          current
            ? {
                ...current,
                status: "Completed",
              }
            : null,
        );
      }

      await loadTasks(selectedTaskCompany, selectedTaskStatus, showOverdueTasksOnly);
    } catch (error) {
      setTasksError(error.message || "Could not update task");
    } finally {
      setCompletingTaskId(null);
    }
  }

  async function handleDeleteTask(task) {
    const confirmed = window.confirm(`Delete ${task.title}?`);

    if (!confirmed) {
      return;
    }

    setDeletingTaskId(task.id);
    setTasksError("");

    try {
      await deleteTask(task.id);
      if (editingTask?.id === task.id) {
        closeTaskForm();
      }
      await loadTasks(selectedTaskCompany, selectedTaskStatus, showOverdueTasksOnly);
    } catch (error) {
      setTasksError(error.message || "Could not delete task");
    } finally {
      setDeletingTaskId(null);
    }
  }

  function handleEditCompany(company) {
    setEditingCompany(company);
    setCompanyFormError("");
    setIsCompanyFormOpen(true);
  }

  function handleEditContact(contact) {
    setEditingContact(contact);
    setContactFormError("");
    setIsContactFormOpen(true);
  }

  function handleEditDeal(deal) {
    setEditingDeal(deal);
    setDealFormError("");
    setIsDealFormOpen(true);
  }

  function handleEditActivity(activity) {
    setEditingActivity(activity);
    setActivityFormError("");
    setIsActivityFormOpen(true);
  }

  function handleEditTask(task) {
    setEditingTask(task);
    setTaskFormError("");
    setIsTaskFormOpen(true);
  }

  const filteredCompanies =
    selectedStatus === "All"
      ? companies
      : companies.filter((company) => company.status === selectedStatus);

  const companiesEmptyMessage =
    selectedStatus === "All"
      ? "No companies yet. Add your first company."
      : `No companies found with status "${selectedStatus}".`;

  const contactsEmptyMessage =
    selectedContactCompany === allCompaniesValue
      ? "No contacts yet. Add your first contact."
      : "No contacts found for the selected company.";

  const dealsEmptyMessage =
    selectedDealStage === "All"
      ? "No deals yet. Add your first deal."
      : `No deals found in the "${selectedDealStage}" stage.`;

  const activitiesEmptyMessage =
    selectedActivityCompany === allCompaniesValue && selectedActivityType === "All"
      ? "No activities yet. Add your first activity."
      : "No activities found for the selected filters.";

  const tasksEmptyMessage =
    showOverdueTasksOnly
      ? "No overdue open tasks found for the selected filters."
      : selectedTaskCompany === allCompaniesValue && selectedTaskStatus === "All"
        ? "No tasks yet. Add your first task."
        : "No tasks found for the selected filters.";

  return (
    <main className="min-h-screen bg-stone-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <AppShellHeader
          activeSection={activeSection}
          isConnected={isConnected}
          sections={sections}
          status={status}
          onSectionChange={setActiveSection}
        />

        {activeSection === "companies" ? (
          <ModuleSection
            actionLabel="Add company"
            description="View and manage account records, company details, and notes."
            controls={
              <select
                className="crm-control crm-select w-40 sm:w-44"
                onChange={(event) => setSelectedStatus(event.target.value)}
                value={selectedStatus}
              >
                {statusOptions.map((option) => (
                  <option key={option} value={option}>
                    {option === "All" ? "All statuses" : option}
                  </option>
                ))}
              </select>
            }
            formContent={
              <CompanyForm
                initialValues={editingCompany}
                isSubmitting={isSubmittingCompany}
                onCancel={closeCompanyForm}
                onSubmit={editingCompany ? handleUpdateCompany : handleCreateCompany}
                submitLabel={editingCompany ? "Update company" : "Add company"}
              />
            }
            formError={companyFormError}
            formTitle={editingCompany ? "Edit company" : "Add company"}
            isFormOpen={isCompanyFormOpen}
            listContent={
              isLoadingCompanies ? (
                <div className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-8 text-sm text-slate-600">
                  Loading companies...
                </div>
              ) : (
                <CompanyList
                  companies={filteredCompanies}
                  deletingCompanyId={deletingCompanyId}
                  emptyMessage={companiesEmptyMessage}
                  onDelete={handleDeleteCompany}
                  onEdit={handleEditCompany}
                />
              )
            }
            listError={companiesError}
            onCloseForm={closeCompanyForm}
            onPrimaryAction={openCompanyCreateForm}
            onRefresh={loadCompanies}
            title="Companies"
          />
        ) : null}

        {activeSection === "contacts" ? (
          <ModuleSection
            actionLabel="Add contact"
            description="Manage people linked to your companies and keep their details up to date."
            controls={
              <select
                className="crm-control crm-select w-44 sm:w-48"
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
            }
            formContent={
              companies.length === 0 ? (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-700">
                  Create a company before adding contacts.
                </div>
              ) : (
                <ContactForm
                  companies={companies}
                  initialValues={editingContact}
                  isSubmitting={isSubmittingContact}
                  onCancel={closeContactForm}
                  onSubmit={editingContact ? handleUpdateContact : handleCreateContact}
                  submitLabel={editingContact ? "Update contact" : "Add contact"}
                />
              )
            }
            formError={contactFormError}
            formTitle={editingContact ? "Edit contact" : "Add contact"}
            isFormOpen={isContactFormOpen}
            listContent={
              isLoadingContacts ? (
                <div className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-8 text-sm text-slate-600">
                  Loading contacts...
                </div>
              ) : (
                <ContactList
                  contacts={contacts}
                  deletingContactId={deletingContactId}
                  emptyMessage={contactsEmptyMessage}
                  onDelete={handleDeleteContact}
                  onEdit={handleEditContact}
                />
              )
            }
            listError={contactsError}
            onCloseForm={closeContactForm}
            onPrimaryAction={openContactCreateForm}
            onRefresh={() => loadContacts(selectedContactCompany)}
            title="Contacts"
          />
        ) : null}

        {activeSection === "deals" ? (
          <ModuleSection
            actionLabel="Add deal"
            description="Keep the sales pipeline organized and update opportunity progress."
            controls={
              <select
                className="crm-control crm-select w-44 sm:w-48"
                onChange={(event) => setSelectedDealStage(event.target.value)}
                value={selectedDealStage}
              >
                {dealStageOptions.map((option) => (
                  <option key={option} value={option}>
                    {option === "All" ? "All stages" : option}
                  </option>
                ))}
              </select>
            }
            formContent={
              companies.length === 0 ? (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-700">
                  Create a company before adding deals.
                </div>
              ) : (
                <DealForm
                  companies={companies}
                  initialValues={editingDeal}
                  isSubmitting={isSubmittingDeal}
                  onCancel={closeDealForm}
                  onSubmit={editingDeal ? handleUpdateDeal : handleCreateDeal}
                  submitLabel={editingDeal ? "Update deal" : "Add deal"}
                />
              )
            }
            formError={dealFormError}
            formTitle={editingDeal ? "Edit deal" : "Add deal"}
            isFormOpen={isDealFormOpen}
            listContent={
              isLoadingDeals ? (
                <div className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-8 text-sm text-slate-600">
                  Loading deals...
                </div>
              ) : (
                <DealList
                  deals={deals}
                  deletingDealId={deletingDealId}
                  emptyMessage={dealsEmptyMessage}
                  onDelete={handleDeleteDeal}
                  onEdit={handleEditDeal}
                />
              )
            }
            listError={dealsError}
            onCloseForm={closeDealForm}
            onPrimaryAction={openDealCreateForm}
            onRefresh={() => loadDeals(selectedDealStage)}
            title="Deals"
          />
        ) : null}

        {activeSection === "activities" ? (
          <ModuleSection
            actionLabel="Add activity"
            description="Capture timeline updates linked to companies or related deals."
            controls={
              <>
                <select
                  className="crm-control crm-select w-44 sm:w-48"
                  onChange={(event) => setSelectedActivityCompany(event.target.value)}
                  value={selectedActivityCompany}
                >
                  <option value={allCompaniesValue}>All companies</option>
                  {companies.map((company) => (
                    <option key={company.id} value={company.id}>
                      {company.name}
                    </option>
                  ))}
                </select>

                <select
                  className="crm-control crm-select w-40 sm:w-44"
                  onChange={(event) => setSelectedActivityType(event.target.value)}
                  value={selectedActivityType}
                >
                  {activityTypeOptions.map((option) => (
                    <option key={option} value={option}>
                      {option === "All" ? "All activity types" : option}
                    </option>
                  ))}
                </select>
              </>
            }
            formContent={
              companies.length === 0 ? (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-700">
                  Create a company before adding activities.
                </div>
              ) : (
                <ActivityForm
                  companies={companies}
                  deals={allDeals}
                  initialValues={editingActivity}
                  isSubmitting={isSubmittingActivity}
                  onCancel={closeActivityForm}
                  onSubmit={editingActivity ? handleUpdateActivity : handleCreateActivity}
                  submitLabel={editingActivity ? "Update activity" : "Add activity"}
                />
              )
            }
            formError={activityFormError}
            formTitle={editingActivity ? "Edit activity" : "Add activity"}
            isFormOpen={isActivityFormOpen}
            listContent={
              isLoadingActivities ? (
                <div className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-8 text-sm text-slate-600">
                  Loading activities...
                </div>
              ) : (
                <ActivityList
                  activities={activities}
                  deletingActivityId={deletingActivityId}
                  emptyMessage={activitiesEmptyMessage}
                  onDelete={handleDeleteActivity}
                  onEdit={handleEditActivity}
                />
              )
            }
            listError={activitiesError}
            onCloseForm={closeActivityForm}
            onPrimaryAction={openActivityCreateForm}
            onRefresh={() => loadActivities(selectedActivityCompany, selectedActivityType)}
            title="Activities"
          />
        ) : null}

        {activeSection === "tasks" ? (
          <ModuleSection
            actionLabel="Add task"
            description="Track open work, overdue items, and completed follow-up actions."
            controls={
              <>
                <select
                  className="crm-control crm-select w-44 sm:w-48"
                  onChange={(event) => setSelectedTaskCompany(event.target.value)}
                  value={selectedTaskCompany}
                >
                  <option value={allCompaniesValue}>All companies</option>
                  {companies.map((company) => (
                    <option key={company.id} value={company.id}>
                      {company.name}
                    </option>
                  ))}
                </select>

                <select
                  className="crm-control crm-select w-40 sm:w-44"
                  onChange={(event) => setSelectedTaskStatus(event.target.value)}
                  value={selectedTaskStatus}
                >
                  {taskStatusOptions.map((option) => (
                    <option key={option} value={option}>
                      {option === "All" ? "All statuses" : option}
                    </option>
                  ))}
                </select>

                <button
                  className={`crm-control crm-button ${
                    showOverdueTasksOnly
                      ? "crm-button-secondary crm-button-toggle-active"
                      : "crm-button-secondary"
                  }`}
                  onClick={() => setShowOverdueTasksOnly((current) => !current)}
                  type="button"
                >
                  {showOverdueTasksOnly ? "Overdue only" : "Show overdue"}
                </button>
              </>
            }
            formContent={
              companies.length === 0 ? (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-700">
                  Create a company before adding tasks.
                </div>
              ) : (
                <TaskForm
                  companies={companies}
                  deals={allDeals}
                  initialValues={editingTask}
                  isSubmitting={isSubmittingTask}
                  onCancel={closeTaskForm}
                  onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
                  submitLabel={editingTask ? "Update task" : "Add task"}
                />
              )
            }
            formError={taskFormError}
            formTitle={editingTask ? "Edit task" : "Add task"}
            isFormOpen={isTaskFormOpen}
            listContent={
              isLoadingTasks ? (
                <div className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-8 text-sm text-slate-600">
                  Loading tasks...
                </div>
              ) : (
                <TaskList
                  completingTaskId={completingTaskId}
                  deletingTaskId={deletingTaskId}
                  emptyMessage={tasksEmptyMessage}
                  onComplete={handleCompleteTask}
                  onDelete={handleDeleteTask}
                  onEdit={handleEditTask}
                  tasks={tasks}
                />
              )
            }
            listError={tasksError}
            onCloseForm={closeTaskForm}
            onPrimaryAction={openTaskCreateForm}
            onRefresh={() =>
              loadTasks(selectedTaskCompany, selectedTaskStatus, showOverdueTasksOnly)
            }
            title="Tasks"
          />
        ) : null}

        {activeSection === "dashboard" ? (
          <Dashboard />
        ) : null}
      </div>
    </main>
  );
}

export default App;

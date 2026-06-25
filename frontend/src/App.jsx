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
    description: "Review key CRM totals, pipeline value, and task health in one place.",
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
    <section className="crm-panel overflow-hidden">
      <div className="border-b border-slate-200/90 px-6 py-6 sm:px-7">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div className="min-w-0 space-y-5">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-blue-100 bg-blue-50 text-sm font-semibold text-blue-700 shadow-sm">
                MS
              </div>

              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-700">
                  Mini Sales CRM
                </p>
                <h1 className="mt-1 text-[1.8rem] font-semibold tracking-tight text-slate-950">
                  Internal sales workspace
                </h1>
                <p className="mt-1.5 max-w-2xl text-sm leading-6 text-slate-500">
                  Keep your pipeline, follow-ups, and customer records in one calm,
                  focused local workspace.
                </p>
              </div>
            </div>

            <div className="crm-panel-subtle max-w-2xl px-4 py-3.5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                Current section
              </p>
              <h2 className="mt-1.5 text-lg font-semibold tracking-tight text-slate-900">
                {activeMeta.title}
              </h2>
              <p className="mt-1.5 text-sm leading-6 text-slate-500">
                {activeMeta.description}
              </p>
            </div>
          </div>

          <div
            className={`inline-flex items-center gap-2 self-start rounded-full border px-3 py-1.5 text-xs font-semibold shadow-sm ${badge.className}`}
          >
            <span className={`h-2 w-2 rounded-full ${badge.dotClassName}`} />
            {badge.label}
          </div>
        </div>
      </div>

      <nav
        className="flex flex-wrap gap-2 bg-slate-50/70 px-6 py-4 sm:px-7"
        aria-label="Primary"
      >
        {sections.map((section) => (
          <button
            key={section.id}
            className={`crm-nav-tab ${activeSection === section.id ? "crm-nav-tab-active" : ""}`}
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
    <section className="space-y-4">
      <div className="crm-panel px-5 py-5 sm:px-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div className="max-w-2xl">
            <h3 className="text-xl font-semibold tracking-tight text-slate-950">{title}</h3>
            <p className="mt-1.5 text-sm leading-6 text-slate-500">{description}</p>
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
        <div className="crm-panel px-5 py-5 sm:px-6">
          <div className="flex flex-col gap-3 border-b border-slate-200 pb-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h4 className="text-lg font-semibold tracking-tight text-slate-950">
                {formTitle}
              </h4>
            </div>

            <button
              className="crm-control crm-button crm-button-secondary"
              onClick={onCloseForm}
              type="button"
            >
              Close
            </button>
          </div>

          {formError ? (
            <div className="crm-alert crm-alert-danger mt-5">
              {formError}
            </div>
          ) : null}

          <div className="mt-5">{formContent}</div>
        </div>
      ) : null}

      <div className="crm-panel px-5 py-5 sm:px-6">
        {listError ? (
          <div className="crm-alert crm-alert-danger mb-5">
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
  const [companySearchQuery, setCompanySearchQuery] = useState("");
  const [contacts, setContacts] = useState([]);
  const [isLoadingContacts, setIsLoadingContacts] = useState(true);
  const [contactsError, setContactsError] = useState("");
  const [contactFormError, setContactFormError] = useState("");
  const [isSubmittingContact, setIsSubmittingContact] = useState(false);
  const [deletingContactId, setDeletingContactId] = useState(null);
  const [editingContact, setEditingContact] = useState(null);
  const [isContactFormOpen, setIsContactFormOpen] = useState(false);
  const [selectedContactCompany, setSelectedContactCompany] = useState(allCompaniesValue);
  const [contactSearchQuery, setContactSearchQuery] = useState("");
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
    const confirmed = window.confirm(
      `Are you sure you want to delete this company: ${company.name}?`,
    );

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
      `Are you sure you want to delete this contact: ${contact.first_name} ${contact.last_name}?`,
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
    const confirmed = window.confirm(
      `Are you sure you want to delete this deal: ${deal.title}?`,
    );

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
    const confirmed = window.confirm("Are you sure you want to delete this activity?");

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
    const confirmed = window.confirm(
      `Are you sure you want to delete this task: ${task.title}?`,
    );

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

  const normalizedCompanySearchQuery = companySearchQuery.trim().toLowerCase();
  const filteredCompanies = companies.filter((company) => {
    const matchesStatus =
      selectedStatus === "All" ? true : company.status === selectedStatus;
    const matchesSearch = normalizedCompanySearchQuery
      ? company.name.toLowerCase().includes(normalizedCompanySearchQuery)
      : true;

    return matchesStatus && matchesSearch;
  });

  const normalizedContactSearchQuery = contactSearchQuery.trim().toLowerCase();
  const filteredContacts = contacts.filter((contact) => {
    if (!normalizedContactSearchQuery) {
      return true;
    }

    return [contact.first_name, contact.last_name, contact.email].some((value) =>
      value.toLowerCase().includes(normalizedContactSearchQuery),
    );
  });

  let companiesEmptyMessage = "No companies yet. Add your first company.";

  if (normalizedCompanySearchQuery && selectedStatus !== "All") {
    companiesEmptyMessage = `No companies found for "${companySearchQuery.trim()}" with status "${selectedStatus}".`;
  } else if (normalizedCompanySearchQuery) {
    companiesEmptyMessage = `No companies found for "${companySearchQuery.trim()}".`;
  } else if (selectedStatus !== "All") {
    companiesEmptyMessage = `No companies found with status "${selectedStatus}".`;
  }

  let contactsEmptyMessage = "No contacts yet. Add your first contact.";

  if (normalizedContactSearchQuery && selectedContactCompany !== allCompaniesValue) {
    contactsEmptyMessage = "No contacts found for the selected company and search.";
  } else if (normalizedContactSearchQuery) {
    contactsEmptyMessage = `No contacts found for "${contactSearchQuery.trim()}".`;
  } else if (selectedContactCompany !== allCompaniesValue) {
    contactsEmptyMessage = "No contacts found for the selected company.";
  }

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
    <main className="relative min-h-screen overflow-x-hidden px-4 py-6 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-80 overflow-hidden">
        <div className="absolute left-[8%] top-0 h-56 w-56 rounded-full bg-blue-200/20 blur-3xl" />
        <div className="absolute right-[12%] top-10 h-48 w-48 rounded-full bg-cyan-200/20 blur-3xl" />
      </div>

      <div className="relative mx-auto flex max-w-[1180px] flex-col gap-5">
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
              <>
                <input
                  className="crm-control crm-text-control w-full min-w-0 sm:w-56"
                  onChange={(event) => setCompanySearchQuery(event.target.value)}
                  placeholder="Search company name"
                  type="text"
                  value={companySearchQuery}
                />

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
              </>
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
                <div className="crm-empty-state">
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
              <>
                <input
                  className="crm-control crm-text-control w-full min-w-0 sm:w-64"
                  onChange={(event) => setContactSearchQuery(event.target.value)}
                  placeholder="Search name or email"
                  type="text"
                  value={contactSearchQuery}
                />

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
              </>
            }
            formContent={
              companies.length === 0 ? (
                <div className="crm-alert crm-alert-warning">
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
                <div className="crm-empty-state">
                  Loading contacts...
                </div>
              ) : (
                <ContactList
                  contacts={filteredContacts}
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
                <div className="crm-alert crm-alert-warning">
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
                <div className="crm-empty-state">
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
                <div className="crm-alert crm-alert-warning">
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
                <div className="crm-empty-state">
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
                <div className="crm-alert crm-alert-warning">
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
                <div className="crm-empty-state">
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

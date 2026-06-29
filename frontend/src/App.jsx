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
import LoginForm from "./components/LoginForm";
import PlatformAdminPanel from "./components/PlatformAdminPanel";
import TaskForm from "./components/TaskForm";
import TaskList from "./components/TaskList";
import TeamPanel from "./components/TeamPanel";
import konvoLogo from "./assets/konvo-logo.png";
import { Badge } from "./components/ui/badge";
import CRMSelectField from "./components/ui/crm-select-field";
import { Alert, AlertDescription } from "./components/ui/alert";
import { Button } from "./components/ui/button";
import { Card, CardContent } from "./components/ui/card";
import { Input } from "./components/ui/input";
import {
  checkHealth,
  clearAccessToken,
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
  getAccessToken,
  getActivities,
  getDeals,
  getCompanies,
  getContacts,
  getCurrentUser,
  getOrganizations,
  getPendingEmployees,
  getPendingManagers,
  getTasks,
  getTeamUsers,
  loginUser,
  approveOrganization,
  approveTeamUser,
  rejectOrganization,
  rejectTeamUser,
  registerUser,
  setAccessToken,
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
const crmSections = [
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
  platform: {
    title: "Platform Admin",
    description: "Approve company managers and review workspace requests across Konvo.",
  },
  team: {
    title: "Team",
    description: "Approve employee requests and review users in your company workspace.",
  },
};

function getSectionsForRole(role) {
  if (role === "platform_admin") {
    return [{ id: "platform", label: "Platform Admin" }, ...crmSections];
  }

  if (role === "org_admin") {
    return [...crmSections, { id: "team", label: "Team" }];
  }

  return crmSections;
}

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

function StatusBadge({ isConnected, status }) {
  const badge = getStatusBadge(isConnected, status);

  return (
    <Badge
      className={`inline-flex h-auto items-center gap-2 self-start rounded-full border px-3 py-1.5 text-xs font-semibold shadow-sm ${badge.className}`}
    >
      <span className={`h-2 w-2 rounded-full ${badge.dotClassName}`} />
      {badge.label}
    </Badge>
  );
}

function AppSidebar({ activeSection, currentUser, onLogout, onSectionChange, sections }) {
  const [showLogoFallback, setShowLogoFallback] = useState(false);

  return (
    <Card className={`crm-page-surface crm-sidebar-surface crm-theme-${activeSection} py-0`}>
      <div className="crm-sidebar-brand px-5 py-5 sm:px-6">
        <div className="space-y-4">
          <div className="crm-sidebar-logo-wrap">
            {showLogoFallback ? (
              <span className="text-base font-semibold text-slate-800">Konvo</span>
            ) : (
              <img
                alt="Konvo logo"
                className="crm-sidebar-logo"
                onError={() => setShowLogoFallback(true)}
                src={konvoLogo}
              />
            )}
          </div>

          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-700">
              Mini Sales CRM
            </p>
            <h1 className="mt-1 text-lg font-semibold tracking-tight text-slate-950">
              Internal workspace
            </h1>
          </div>
        </div>
      </div>

      <nav className="crm-sidebar-nav px-5 py-5 sm:px-6" aria-label="Primary">
        {sections.map((section) => (
          <button
            key={section.id}
            className={`crm-sidebar-link ${activeSection === section.id ? "crm-sidebar-link-active" : ""}`}
            onClick={() => onSectionChange(section.id)}
            type="button"
          >
            {section.label}
          </button>
        ))}
      </nav>

      <div className="border-t border-slate-200/90 px-5 py-5 sm:px-6">
        <div className="rounded-2xl border border-slate-200/90 bg-white/88 px-4 py-4 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Signed in as
          </p>
          <p className="mt-2 text-sm font-semibold text-slate-950">{currentUser.name}</p>
          <p className="mt-1 text-sm text-slate-500">{currentUser.role}</p>

          <Button
            className="crm-button crm-button-secondary mt-4 w-full"
            onClick={onLogout}
            type="button"
            variant="outline"
          >
            Logout
          </Button>
        </div>
      </div>
    </Card>
  );
}

function MainContentHeader({ activeSection, isConnected, status }) {
  const activeMeta = sectionMeta[activeSection];

  return (
    <Card className={`crm-page-surface crm-content-header crm-theme-${activeSection} py-0`}>
      <CardContent className="px-5 py-5 sm:px-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              Current section
            </p>
            <h2 className="mt-1.5 text-[1.55rem] font-semibold tracking-tight text-slate-950">
              {activeMeta.title}
            </h2>
            <p className="mt-1.5 max-w-2xl text-sm leading-6 text-slate-500">
              {activeMeta.description}
            </p>
          </div>

          <StatusBadge isConnected={isConnected} status={status} />
        </div>
      </CardContent>
    </Card>
  );
}

function ModuleSection({
  actionLabel,
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
  panelDescription,
  panelTitle,
  showPrimaryAction = true,
  theme,
}) {
  return (
    <section className={`crm-module-section crm-theme-${theme} space-y-5`}>
      <Card className="crm-page-surface crm-module-header py-0">
        <CardContent className="px-5 py-4 sm:px-6">
          <div className="crm-action-panel flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="min-w-0">
              <h3 className="text-base font-semibold tracking-tight text-slate-950">
                {panelTitle}
              </h3>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                {panelDescription}
              </p>
            </div>

            <div className="flex w-full xl:w-auto xl:justify-end">
              <div className="crm-action-row xl:justify-end">
                {controls}
                {onRefresh ? (
                  <Button
                    className="crm-button crm-button-secondary"
                    onClick={onRefresh}
                    type="button"
                    variant="outline"
                  >
                    Refresh
                  </Button>
                ) : null}

                {showPrimaryAction ? (
                  <Button
                    className="crm-button crm-button-primary crm-button-module"
                    onClick={onPrimaryAction}
                    type="button"
                  >
                    {actionLabel}
                  </Button>
                ) : null}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {showPrimaryAction && isFormOpen ? (
        <Card className="crm-page-surface crm-module-form-panel py-0">
          <CardContent className="px-5 py-5 sm:px-6">
            <div className="flex flex-col gap-3 border-b border-slate-200 pb-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h4 className="text-lg font-semibold tracking-tight text-slate-950">
                  {formTitle}
                </h4>
              </div>

              <Button
                className="crm-button crm-button-secondary"
                onClick={onCloseForm}
                type="button"
                variant="outline"
              >
                Close
              </Button>
            </div>

            {formError ? (
              <Alert className="mt-5 border-rose-200 bg-rose-50 text-rose-700">
                <AlertDescription>{formError}</AlertDescription>
              </Alert>
            ) : null}

            <div className="mt-5">{formContent}</div>
          </CardContent>
        </Card>
      ) : null}

      <Card className="crm-page-surface crm-module-list-panel py-0">
        <CardContent className="px-5 py-5 sm:px-6">
          {listError ? (
            <Alert className="mb-5 border-rose-200 bg-rose-50 text-rose-700">
              <AlertDescription>{listError}</AlertDescription>
            </Alert>
          ) : null}

          {listContent}
        </CardContent>
      </Card>
    </section>
  );
}

function App() {
  const [status, setStatus] = useState("Checking backend...");
  const [isConnected, setIsConnected] = useState(false);
  const [authStatus, setAuthStatus] = useState("checking");
  const [currentUser, setCurrentUser] = useState(null);
  const [authError, setAuthError] = useState("");
  const [authNotice, setAuthNotice] = useState("");
  const [isSubmittingAuth, setIsSubmittingAuth] = useState(false);
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
  const [pendingManagers, setPendingManagers] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [platformError, setPlatformError] = useState("");
  const [isLoadingPlatform, setIsLoadingPlatform] = useState(true);
  const [approvingOrganizationId, setApprovingOrganizationId] = useState(null);
  const [rejectingOrganizationId, setRejectingOrganizationId] = useState(null);
  const [pendingEmployees, setPendingEmployees] = useState([]);
  const [teamUsers, setTeamUsers] = useState([]);
  const [teamError, setTeamError] = useState("");
  const [isLoadingTeam, setIsLoadingTeam] = useState(true);
  const [approvingTeamUserId, setApprovingTeamUserId] = useState(null);
  const [rejectingTeamUserId, setRejectingTeamUserId] = useState(null);

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
    async function restoreSession() {
      const accessToken = getAccessToken();

      if (!accessToken) {
        setAuthStatus("unauthenticated");
        return;
      }

      try {
        const user = await getCurrentUser();
        setCurrentUser(user);
        setActiveSection(user.role === "platform_admin" ? "platform" : "companies");
        setAuthStatus("authenticated");
      } catch {
        clearAccessToken();
        setCurrentUser(null);
        setAuthStatus("unauthenticated");
      }
    }

    restoreSession();
  }, []);

  useEffect(() => {
    if (authStatus !== "authenticated") {
      return;
    }

    loadCompanies();
    loadAllDeals();
  }, [authStatus]);

  useEffect(() => {
    if (authStatus !== "authenticated") {
      return;
    }

    loadContacts(selectedContactCompany);
  }, [authStatus, selectedContactCompany]);

  useEffect(() => {
    if (authStatus !== "authenticated") {
      return;
    }

    loadDeals(selectedDealStage);
  }, [authStatus, selectedDealStage]);

  useEffect(() => {
    if (authStatus !== "authenticated") {
      return;
    }

    loadActivities(selectedActivityCompany, selectedActivityType);
  }, [authStatus, selectedActivityCompany, selectedActivityType]);

  useEffect(() => {
    if (authStatus !== "authenticated") {
      return;
    }

    loadTasks(selectedTaskCompany, selectedTaskStatus, showOverdueTasksOnly);
  }, [authStatus, selectedTaskCompany, selectedTaskStatus, showOverdueTasksOnly]);

  useEffect(() => {
    if (authStatus !== "authenticated" || !currentUser) {
      return;
    }

    if (currentUser.role === "platform_admin") {
      loadPlatformData();
      return;
    }

    if (currentUser.role === "org_admin") {
      loadTeamData();
    }
  }, [authStatus, currentUser]);

  useEffect(() => {
    if (!currentUser) {
      return;
    }

    const allowedSectionIds = new Set(getSectionsForRole(currentUser.role).map((section) => section.id));
    if (!allowedSectionIds.has(activeSection)) {
      setActiveSection(currentUser.role === "platform_admin" ? "platform" : "companies");
    }
  }, [activeSection, currentUser]);

  async function handleLogin(credentials) {
    setIsSubmittingAuth(true);
    setAuthError("");
    setAuthNotice("");

    try {
      const response = await loginUser(credentials);
      setAccessToken(response.access_token);
      setCurrentUser(response.user);
      setActiveSection(response.user.role === "platform_admin" ? "platform" : "companies");
      setAuthStatus("authenticated");
      return true;
    } catch (error) {
      clearAccessToken();
      setCurrentUser(null);
      setAuthStatus("unauthenticated");
      setAuthError(error.message || "Could not log in");
      return false;
    } finally {
      setIsSubmittingAuth(false);
    }
  }

  async function handleRegister(payload) {
    setIsSubmittingAuth(true);
    setAuthError("");
    setAuthNotice("");

    try {
      const response = await registerUser(payload);
      clearAccessToken();
      setCurrentUser(null);
      setAuthStatus("unauthenticated");
      setAuthNotice(response.message);
      return { success: true };
    } catch (error) {
      clearAccessToken();
      setCurrentUser(null);
      setAuthStatus("unauthenticated");
      setAuthError(error.message || "Could not create account");
      return false;
    } finally {
      setIsSubmittingAuth(false);
    }
  }

  function handleLogout() {
    clearAccessToken();
    setCurrentUser(null);
    setAuthError("");
    setAuthNotice("");
    setAuthStatus("unauthenticated");
    setActiveSection("companies");
  }

  function handleAuthModeChange() {
    setAuthError("");
    setAuthNotice("");
  }

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

  async function loadPlatformData() {
    setIsLoadingPlatform(true);
    setPlatformError("");

    try {
      const [pending, organizationList] = await Promise.all([
        getPendingManagers(),
        getOrganizations(),
      ]);
      setPendingManagers(pending);
      setOrganizations(organizationList);
    } catch (error) {
      setPlatformError(error.message || "Could not load platform admin data");
    } finally {
      setIsLoadingPlatform(false);
    }
  }

  async function loadTeamData() {
    setIsLoadingTeam(true);
    setTeamError("");

    try {
      const [pending, users] = await Promise.all([getPendingEmployees(), getTeamUsers()]);
      setPendingEmployees(pending);
      setTeamUsers(users);
    } catch (error) {
      setTeamError(error.message || "Could not load team data");
    } finally {
      setIsLoadingTeam(false);
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

  async function handleApproveOrganization(organizationId) {
    setApprovingOrganizationId(organizationId);
    setPlatformError("");

    try {
      await approveOrganization(organizationId);
      await loadPlatformData();
    } catch (error) {
      setPlatformError(error.message || "Could not approve organization");
    } finally {
      setApprovingOrganizationId(null);
    }
  }

  async function handleRejectOrganization(organizationId) {
    setRejectingOrganizationId(organizationId);
    setPlatformError("");

    try {
      await rejectOrganization(organizationId);
      await loadPlatformData();
    } catch (error) {
      setPlatformError(error.message || "Could not reject organization");
    } finally {
      setRejectingOrganizationId(null);
    }
  }

  async function handleApproveTeamUser(userId) {
    setApprovingTeamUserId(userId);
    setTeamError("");

    try {
      await approveTeamUser(userId);
      await loadTeamData();
    } catch (error) {
      setTeamError(error.message || "Could not approve user");
    } finally {
      setApprovingTeamUserId(null);
    }
  }

  async function handleRejectTeamUser(userId) {
    setRejectingTeamUserId(userId);
    setTeamError("");

    try {
      await rejectTeamUser(userId);
      await loadTeamData();
    } catch (error) {
      setTeamError(error.message || "Could not reject user");
    } finally {
      setRejectingTeamUserId(null);
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
  const sections = currentUser ? getSectionsForRole(currentUser.role) : crmSections;

  if (authStatus === "checking") {
    return (
      <main className="crm-app-shell relative min-h-screen overflow-x-hidden px-4 py-6 sm:px-6 lg:px-8">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-80 overflow-hidden">
          <div className="crm-bg-orb crm-bg-orb-primary absolute left-[6%] top-0 h-64 w-64 rounded-full blur-3xl" />
          <div className="crm-bg-orb crm-bg-orb-secondary absolute right-[10%] top-8 h-56 w-56 rounded-full blur-3xl" />
          <div className="crm-bg-orb crm-bg-orb-tertiary absolute left-1/2 top-28 h-44 w-44 -translate-x-1/2 rounded-full blur-3xl" />
        </div>

        <div className="relative mx-auto flex min-h-screen max-w-[1320px] items-center justify-center">
          <Card className="crm-page-surface crm-theme-dashboard w-full max-w-xl py-0">
            <CardContent className="px-6 py-6 text-center sm:px-8">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-blue-700">
                Mini Sales CRM v2
              </p>
              <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                Checking your session
              </h1>
              <p className="mt-3 text-sm leading-6 text-slate-500">
                Verifying saved login details before opening the CRM workspace.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  if (authStatus !== "authenticated" || !currentUser) {
    return (
      <main className="crm-app-shell relative min-h-screen overflow-x-hidden">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-80 overflow-hidden">
          <div className="crm-bg-orb crm-bg-orb-primary absolute left-[6%] top-0 h-64 w-64 rounded-full blur-3xl" />
          <div className="crm-bg-orb crm-bg-orb-secondary absolute right-[10%] top-8 h-56 w-56 rounded-full blur-3xl" />
          <div className="crm-bg-orb crm-bg-orb-tertiary absolute left-1/2 top-28 h-44 w-44 -translate-x-1/2 rounded-full blur-3xl" />
        </div>

        <LoginForm
          errorMessage={authError}
          isSubmitting={isSubmittingAuth}
          noticeMessage={authNotice}
          onLogin={handleLogin}
          onModeChange={handleAuthModeChange}
          onRegister={handleRegister}
          statusBadge={getStatusBadge(isConnected, status)}
        />
      </main>
    );
  }

  return (
    <main className={`crm-app-shell crm-theme-${activeSection} relative min-h-screen overflow-x-hidden px-4 py-6 sm:px-6 lg:px-8`}>
      <div className="pointer-events-none absolute inset-x-0 top-0 h-80 overflow-hidden">
        <div className="crm-bg-orb crm-bg-orb-primary absolute left-[6%] top-0 h-64 w-64 rounded-full blur-3xl" />
        <div className="crm-bg-orb crm-bg-orb-secondary absolute right-[10%] top-8 h-56 w-56 rounded-full blur-3xl" />
        <div className="crm-bg-orb crm-bg-orb-tertiary absolute left-1/2 top-28 h-44 w-44 -translate-x-1/2 rounded-full blur-3xl" />
      </div>

      <div className="crm-dashboard-shell relative mx-auto max-w-[1320px]">
        <div className="crm-sidebar-shell">
          <AppSidebar
            activeSection={activeSection}
            currentUser={currentUser}
            onLogout={handleLogout}
            sections={sections}
            onSectionChange={setActiveSection}
          />
        </div>

        <div className="crm-content-column">
          <MainContentHeader
            activeSection={activeSection}
            isConnected={isConnected}
            status={status}
          />

          {activeSection === "platform" ? (
            <ModuleSection
              controls={null}
              formContent={null}
              formError=""
              formTitle=""
              isFormOpen={false}
              listContent={
                isLoadingPlatform ? (
                  <Alert className="crm-empty-state border-slate-200 bg-slate-50/80 text-slate-600">
                    <AlertDescription>Loading platform admin data...</AlertDescription>
                  </Alert>
                ) : (
                  <PlatformAdminPanel
                    approvingOrganizationId={approvingOrganizationId}
                    onApprove={handleApproveOrganization}
                    onReject={handleRejectOrganization}
                    organizations={organizations}
                    pendingManagers={pendingManagers}
                    rejectingOrganizationId={rejectingOrganizationId}
                  />
                )
              }
              listError={platformError}
              onCloseForm={() => {}}
              onPrimaryAction={() => {}}
              onRefresh={loadPlatformData}
              panelDescription="Approve company manager requests and review workspaces across the platform."
              panelTitle="Platform approvals"
              showPrimaryAction={false}
              theme="dashboard"
            />
          ) : null}

          {activeSection === "team" ? (
            <ModuleSection
              controls={null}
              formContent={null}
              formError=""
              formTitle=""
              isFormOpen={false}
              listContent={
                isLoadingTeam ? (
                  <Alert className="crm-empty-state border-slate-200 bg-slate-50/80 text-slate-600">
                    <AlertDescription>Loading team data...</AlertDescription>
                  </Alert>
                ) : (
                  <TeamPanel
                    approvingUserId={approvingTeamUserId}
                    onApprove={handleApproveTeamUser}
                    onReject={handleRejectTeamUser}
                    pendingEmployees={pendingEmployees}
                    rejectingUserId={rejectingTeamUserId}
                    teamUsers={teamUsers}
                  />
                )
              }
              listError={teamError}
              onCloseForm={() => {}}
              onPrimaryAction={() => {}}
              onRefresh={loadTeamData}
              panelDescription="Approve employees and review users in your company workspace."
              panelTitle="Team approvals"
              showPrimaryAction={false}
              theme="contacts"
            />
          ) : null}

          {activeSection === "companies" ? (
            <ModuleSection
            actionLabel="Add company"
            controls={
              <>
                <Input
                  className="w-full min-w-0 sm:w-56"
                  onChange={(event) => setCompanySearchQuery(event.target.value)}
                  placeholder="Search company name"
                  type="text"
                  value={companySearchQuery}
                />

                <CRMSelectField
                  items={statusOptions.map((option) => ({
                    value: option,
                    label: option === "All" ? "All statuses" : option,
                  }))}
                  onValueChange={setSelectedStatus}
                  triggerClassName="w-40 sm:w-44"
                  value={selectedStatus}
                />
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
                <Alert className="crm-empty-state border-slate-200 bg-slate-50/80 text-slate-600">
                  <AlertDescription>Loading companies...</AlertDescription>
                </Alert>
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
            panelDescription="Search, filter, and manage saved companies."
            panelTitle="Company records"
            theme="companies"
            />
          ) : null}

          {activeSection === "contacts" ? (
            <ModuleSection
            actionLabel="Add contact"
            controls={
              <>
                <Input
                  className="w-full min-w-0 sm:w-64"
                  onChange={(event) => setContactSearchQuery(event.target.value)}
                  placeholder="Search name or email"
                  type="text"
                  value={contactSearchQuery}
                />

                <CRMSelectField
                  items={[
                    { value: allCompaniesValue, label: "All companies" },
                    ...companies.map((company) => ({
                      value: String(company.id),
                      label: company.name,
                    })),
                  ]}
                  onValueChange={setSelectedContactCompany}
                  triggerClassName="w-44 sm:w-48"
                  value={selectedContactCompany}
                />
              </>
            }
            formContent={
              companies.length === 0 ? (
                <Alert className="crm-alert crm-alert-warning border-amber-200 bg-amber-50/80 text-amber-700">
                  <AlertDescription>Create a company before adding contacts.</AlertDescription>
                </Alert>
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
                <Alert className="crm-empty-state border-slate-200 bg-slate-50/80 text-slate-600">
                  <AlertDescription>Loading contacts...</AlertDescription>
                </Alert>
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
            panelDescription="Search, filter, and manage people linked to companies."
            panelTitle="Contact records"
            theme="contacts"
            />
          ) : null}

          {activeSection === "deals" ? (
            <ModuleSection
            actionLabel="Add deal"
            controls={
              <CRMSelectField
                items={dealStageOptions.map((option) => ({
                  value: option,
                  label: option === "All" ? "All stages" : option,
                }))}
                onValueChange={setSelectedDealStage}
                triggerClassName="w-44 sm:w-48"
                value={selectedDealStage}
              />
            }
            formContent={
              companies.length === 0 ? (
                <Alert className="crm-alert crm-alert-warning border-amber-200 bg-amber-50/80 text-amber-700">
                  <AlertDescription>Create a company before adding deals.</AlertDescription>
                </Alert>
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
                <Alert className="crm-empty-state border-slate-200 bg-slate-50/80 text-slate-600">
                  <AlertDescription>Loading deals...</AlertDescription>
                </Alert>
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
            panelDescription="Filter and update sales opportunities."
            panelTitle="Deal pipeline"
            theme="deals"
            />
          ) : null}

          {activeSection === "activities" ? (
            <ModuleSection
            actionLabel="Add activity"
            controls={
              <>
                <CRMSelectField
                  items={[
                    { value: allCompaniesValue, label: "All companies" },
                    ...companies.map((company) => ({
                      value: String(company.id),
                      label: company.name,
                    })),
                  ]}
                  onValueChange={setSelectedActivityCompany}
                  triggerClassName="w-44 sm:w-48"
                  value={selectedActivityCompany}
                />

                <CRMSelectField
                  items={activityTypeOptions.map((option) => ({
                    value: option,
                    label: option === "All" ? "All activity types" : option,
                  }))}
                  onValueChange={setSelectedActivityType}
                  triggerClassName="w-40 sm:w-44"
                  value={selectedActivityType}
                />
              </>
            }
            formContent={
              companies.length === 0 ? (
                <Alert className="crm-alert crm-alert-warning border-amber-200 bg-amber-50/80 text-amber-700">
                  <AlertDescription>Create a company before adding activities.</AlertDescription>
                </Alert>
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
                <Alert className="crm-empty-state border-slate-200 bg-slate-50/80 text-slate-600">
                  <AlertDescription>Loading activities...</AlertDescription>
                </Alert>
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
            panelDescription="Review notes, calls, meetings, and follow-ups."
            panelTitle="Activity timeline"
            theme="activities"
            />
          ) : null}

          {activeSection === "tasks" ? (
            <ModuleSection
            actionLabel="Add task"
            controls={
              <>
                <CRMSelectField
                  items={[
                    { value: allCompaniesValue, label: "All companies" },
                    ...companies.map((company) => ({
                      value: String(company.id),
                      label: company.name,
                    })),
                  ]}
                  onValueChange={setSelectedTaskCompany}
                  triggerClassName="w-44 sm:w-48"
                  value={selectedTaskCompany}
                />

                <CRMSelectField
                  items={taskStatusOptions.map((option) => ({
                    value: option,
                    label: option === "All" ? "All statuses" : option,
                  }))}
                  onValueChange={setSelectedTaskStatus}
                  triggerClassName="w-40 sm:w-44"
                  value={selectedTaskStatus}
                />

                <Button
                  className={`crm-control crm-button ${
                    showOverdueTasksOnly
                      ? "crm-button-secondary crm-button-toggle-active"
                      : "crm-button-secondary"
                  }`}
                  onClick={() => setShowOverdueTasksOnly((current) => !current)}
                  type="button"
                  variant="outline"
                >
                  {showOverdueTasksOnly ? "Overdue only" : "Show overdue"}
                </Button>
              </>
            }
            formContent={
              companies.length === 0 ? (
                <Alert className="crm-alert crm-alert-warning border-amber-200 bg-amber-50/80 text-amber-700">
                  <AlertDescription>Create a company before adding tasks.</AlertDescription>
                </Alert>
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
                <Alert className="crm-empty-state border-slate-200 bg-slate-50/80 text-slate-600">
                  <AlertDescription>Loading tasks...</AlertDescription>
                </Alert>
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
            panelDescription="Track open, completed, and overdue follow-ups."
            panelTitle="Task board"
            theme="tasks"
            />
          ) : null}

          {activeSection === "dashboard" ? (
            <Dashboard />
          ) : null}
        </div>
      </div>
    </main>
  );
}

export default App;

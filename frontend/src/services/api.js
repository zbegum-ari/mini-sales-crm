const API_BASE_URL = "http://localhost:8000";

function getErrorMessage(data) {
  if (Array.isArray(data?.detail)) {
    return data.detail
      .map((item) => item.msg || "Request failed")
      .join(", ");
  }

  if (typeof data?.detail === "string") {
    return data.detail;
  }

  return "Request failed";
}

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  if (response.status === 204) {
    return null;
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(getErrorMessage(data));
  }

  return data;
}

export function checkHealth() {
  return request("/health");
}

export function getCompanies() {
  return request("/companies");
}

export function createCompany(companyData) {
  return request("/companies", {
    method: "POST",
    body: JSON.stringify(companyData),
  });
}

export function updateCompany(companyId, companyData) {
  return request(`/companies/${companyId}`, {
    method: "PUT",
    body: JSON.stringify(companyData),
  });
}

export function deleteCompany(companyId) {
  return request(`/companies/${companyId}`, {
    method: "DELETE",
  });
}

export function getContacts(companyId) {
  const searchParams = new URLSearchParams();

  if (companyId) {
    searchParams.set("company_id", companyId);
  }

  const queryString = searchParams.toString();
  const path = queryString ? `/contacts?${queryString}` : "/contacts";

  return request(path);
}

export function createContact(contactData) {
  return request("/contacts", {
    method: "POST",
    body: JSON.stringify(contactData),
  });
}

export function updateContact(contactId, contactData) {
  return request(`/contacts/${contactId}`, {
    method: "PUT",
    body: JSON.stringify(contactData),
  });
}

export function deleteContact(contactId) {
  return request(`/contacts/${contactId}`, {
    method: "DELETE",
  });
}

export function getDeals(filters = {}) {
  const searchParams = new URLSearchParams();

  if (filters.companyId) {
    searchParams.set("company_id", filters.companyId);
  }

  if (filters.pipelineStage) {
    searchParams.set("pipeline_stage", filters.pipelineStage);
  }

  const queryString = searchParams.toString();
  const path = queryString ? `/deals?${queryString}` : "/deals";

  return request(path);
}

export function createDeal(dealData) {
  return request("/deals", {
    method: "POST",
    body: JSON.stringify(dealData),
  });
}

export function updateDeal(dealId, dealData) {
  return request(`/deals/${dealId}`, {
    method: "PUT",
    body: JSON.stringify(dealData),
  });
}

export function deleteDeal(dealId) {
  return request(`/deals/${dealId}`, {
    method: "DELETE",
  });
}

export function getActivities(filters = {}) {
  const searchParams = new URLSearchParams();

  if (filters.companyId) {
    searchParams.set("company_id", filters.companyId);
  }

  if (filters.dealId) {
    searchParams.set("deal_id", filters.dealId);
  }

  if (filters.activityType) {
    searchParams.set("activity_type", filters.activityType);
  }

  const queryString = searchParams.toString();
  const path = queryString ? `/activities?${queryString}` : "/activities";

  return request(path);
}

export function createActivity(activityData) {
  return request("/activities", {
    method: "POST",
    body: JSON.stringify(activityData),
  });
}

export function updateActivity(activityId, activityData) {
  return request(`/activities/${activityId}`, {
    method: "PUT",
    body: JSON.stringify(activityData),
  });
}

export function deleteActivity(activityId) {
  return request(`/activities/${activityId}`, {
    method: "DELETE",
  });
}

export function getTasks(filters = {}) {
  const searchParams = new URLSearchParams();

  if (filters.companyId) {
    searchParams.set("company_id", filters.companyId);
  }

  if (filters.dealId) {
    searchParams.set("deal_id", filters.dealId);
  }

  if (filters.status) {
    searchParams.set("status", filters.status);
  }

  if (filters.overdue) {
    searchParams.set("overdue", "true");
  }

  const queryString = searchParams.toString();
  const path = queryString ? `/tasks?${queryString}` : "/tasks";

  return request(path);
}

export function createTask(taskData) {
  return request("/tasks", {
    method: "POST",
    body: JSON.stringify(taskData),
  });
}

export function updateTask(taskId, taskData) {
  return request(`/tasks/${taskId}`, {
    method: "PUT",
    body: JSON.stringify(taskData),
  });
}

export function deleteTask(taskId) {
  return request(`/tasks/${taskId}`, {
    method: "DELETE",
  });
}

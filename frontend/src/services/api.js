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

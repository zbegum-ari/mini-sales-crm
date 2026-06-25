const API_BASE_URL = "http://localhost:8000";

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
    throw new Error(data?.detail || "Request failed");
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

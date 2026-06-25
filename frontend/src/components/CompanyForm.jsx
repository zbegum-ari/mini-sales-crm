import { useEffect, useState } from "react";

const emptyForm = {
  name: "",
  industry: "",
  company_size: "Unknown",
  status: "Lead",
  website: "",
  phone: "",
  email: "",
  notes: "",
};

const statusOptions = ["Lead", "Active", "Inactive", "Customer", "Lost"];
const companySizeOptions = ["Unknown", "1-10", "11-50", "51-200", "201-500", "500+"];
const baseFieldClassName =
  "w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:ring-4";
const defaultFieldClassName =
  "border-stone-200 focus:border-teal-600 focus:ring-teal-100";
const errorFieldClassName = "border-rose-500 focus:border-rose-500 focus:ring-rose-100";
const emailErrorMessage = "Email must be a valid email address.";

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function normalizeFormValues(initialValues) {
  return {
    name: initialValues?.name ?? "",
    industry: initialValues?.industry ?? "",
    company_size: initialValues?.company_size ?? "Unknown",
    status: initialValues?.status ?? "Lead",
    website: initialValues?.website ?? "",
    phone: initialValues?.phone ?? "",
    email: initialValues?.email ?? "",
    notes: initialValues?.notes ?? "",
  };
}

function CompanyForm({
  initialValues,
  onSubmit,
  onCancel,
  isSubmitting,
  submitLabel,
}) {
  const [formData, setFormData] = useState(emptyForm);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setFormData(normalizeFormValues(initialValues));
    setErrors({});
  }, [initialValues]);

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: value,
    }));

    const trimmedValue = typeof value === "string" ? value.trim() : value;
    if (trimmedValue) {
      setErrors((current) => {
        if (!current[name]) {
          return current;
        }

        if (name === "email" && !isValidEmail(trimmedValue)) {
          return current;
        }

        const nextErrors = { ...current };
        delete nextErrors[name];
        return nextErrors;
      });
    }
  }

  function buildPayload() {
    return {
      name: formData.name.trim(),
      industry: formData.industry.trim() || null,
      company_size: formData.company_size.trim() || null,
      status: formData.status,
      website: formData.website.trim() || null,
      phone: formData.phone.trim() || null,
      email: formData.email.trim() || null,
      notes: formData.notes.trim() || null,
    };
  }

  function validateForm() {
    const nextErrors = {};

    if (!formData.name.trim()) {
      nextErrors.name = "Company name is required.";
    }

    if (!formData.website.trim()) {
      nextErrors.website = "Website is required.";
    }

    if (!formData.industry.trim()) {
      nextErrors.industry = "Industry is required.";
    }

    if (!formData.company_size.trim()) {
      nextErrors.company_size = "Company size is required.";
    }

    if (!formData.status.trim()) {
      nextErrors.status = "Status is required.";
    }

    if (formData.email.trim() && !isValidEmail(formData.email.trim())) {
      nextErrors.email = emailErrorMessage;
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function inputClassName(fieldName) {
    return `${baseFieldClassName} ${
      errors[fieldName] ? errorFieldClassName : defaultFieldClassName
    }`;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!validateForm()) {
      return;
    }

    const didSave = await onSubmit(buildPayload());

    if (didSave && !initialValues) {
      setFormData(emptyForm);
      setErrors({});
    }
  }

  return (
    <form className="space-y-5" noValidate onSubmit={handleSubmit}>
      <p className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
        Fields marked with * are required.
      </p>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700" htmlFor="name">
          Company name *
        </label>
        <input
          className={inputClassName("name")}
          id="name"
          name="name"
          onChange={handleChange}
          value={formData.name}
        />
        {errors.name ? <p className="mt-1 text-sm text-rose-600">{errors.name}</p> : null}
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700" htmlFor="industry">
          Industry *
        </label>
        <input
          className={inputClassName("industry")}
          id="industry"
          name="industry"
          onChange={handleChange}
          placeholder="Software, Retail, Consulting..."
          value={formData.industry}
        />
        {errors.industry ? (
          <p className="mt-1 text-sm text-rose-600">{errors.industry}</p>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label
            className="mb-1.5 block text-sm font-medium text-slate-700"
            htmlFor="company_size"
          >
            Company size *
          </label>
          <select
            className={inputClassName("company_size")}
            id="company_size"
            name="company_size"
            onChange={handleChange}
            value={formData.company_size}
          >
            {companySizeOptions.map((companySize) => (
              <option key={companySize} value={companySize}>
                {companySize}
              </option>
            ))}
          </select>
          {errors.company_size ? (
            <p className="mt-1 text-sm text-rose-600">{errors.company_size}</p>
          ) : null}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700" htmlFor="status">
            Status *
          </label>
          <select
            className={inputClassName("status")}
            id="status"
            name="status"
            onChange={handleChange}
            value={formData.status}
          >
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          {errors.status ? <p className="mt-1 text-sm text-rose-600">{errors.status}</p> : null}
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700" htmlFor="website">
          Website *
        </label>
        <input
          className={inputClassName("website")}
          id="website"
          name="website"
          onChange={handleChange}
          placeholder="example.com"
          value={formData.website}
        />
        {errors.website ? <p className="mt-1 text-sm text-rose-600">{errors.website}</p> : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700" htmlFor="phone">
            Phone
          </label>
          <input
            className={`${baseFieldClassName} ${defaultFieldClassName}`}
            id="phone"
            name="phone"
            onChange={handleChange}
            placeholder="+90 555 555 55 55"
            value={formData.phone}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700" htmlFor="email">
            Email
          </label>
          <input
            className={inputClassName("email")}
            id="email"
            inputMode="email"
            name="email"
            onChange={handleChange}
            placeholder="team@example.com"
            value={formData.email}
          />
          {errors.email ? <p className="mt-1 text-sm text-rose-600">{errors.email}</p> : null}
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700" htmlFor="notes">
          Notes
        </label>
        <textarea
          className={`min-h-32 ${baseFieldClassName} ${defaultFieldClassName}`}
          id="notes"
          name="notes"
          onChange={handleChange}
          placeholder="Anything helpful for future follow-up..."
          value={formData.notes}
        />
      </div>

      <div className="flex flex-wrap gap-3 pt-2">
        <button
          className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-blue-300"
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? "Saving..." : submitLabel}
        </button>

        {onCancel ? (
          <button
            className="rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-stone-50 focus:outline-none focus:ring-4 focus:ring-stone-100"
            onClick={onCancel}
            type="button"
          >
            Cancel
          </button>
        ) : null}
      </div>
    </form>
  );
}

export default CompanyForm;

import { useEffect, useState } from "react";

const emptyForm = {
  company_id: "",
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
  job_title: "",
  notes: "",
};

const baseFieldClassName =
  "w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:ring-4";
const defaultFieldClassName =
  "border-stone-200 focus:border-teal-600 focus:ring-teal-100";
const errorFieldClassName = "border-rose-500 focus:border-rose-500 focus:ring-rose-100";
const phoneErrorMessage =
  "Phone must contain only digits and be 10 or 11 digits long.";
const emailErrorMessage = "Email must be a valid email address.";

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function normalizeFormValues(initialValues) {
  return {
    company_id: initialValues?.company_id ? String(initialValues.company_id) : "",
    first_name: initialValues?.first_name ?? "",
    last_name: initialValues?.last_name ?? "",
    email: initialValues?.email ?? "",
    phone: initialValues?.phone ?? "",
    job_title: initialValues?.job_title ?? "",
    notes: initialValues?.notes ?? "",
  };
}

function ContactForm({
  companies,
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
    const nextValue =
      name === "phone" ? value.replace(/\D/g, "").slice(0, 11) : value;

    setFormData((current) => ({
      ...current,
      [name]: nextValue,
    }));

    setErrors((current) => {
      if (!current[name]) {
        return current;
      }

      const trimmedValue = typeof nextValue === "string" ? nextValue.trim() : nextValue;
      const phoneIsValid = /^\d{10,11}$/.test(nextValue);

      if (name === "phone" && !phoneIsValid) {
        return current;
      }

      if (name === "email" && !isValidEmail(trimmedValue)) {
        return current;
      }

      if (!trimmedValue) {
        return current;
      }

      const nextErrors = { ...current };
      delete nextErrors[name];
      return nextErrors;
    });
  }

  function validateForm() {
    const nextErrors = {};

    if (!formData.company_id) {
      nextErrors.company_id = "Company is required.";
    }

    if (!formData.first_name.trim()) {
      nextErrors.first_name = "First name is required.";
    }

    if (!formData.last_name.trim()) {
      nextErrors.last_name = "Last name is required.";
    }

    if (!formData.email.trim()) {
      nextErrors.email = "Email is required.";
    } else if (!isValidEmail(formData.email.trim())) {
      nextErrors.email = emailErrorMessage;
    }

    if (!formData.phone.trim()) {
      nextErrors.phone = "Phone is required.";
    } else if (!/^\d{10,11}$/.test(formData.phone.trim())) {
      nextErrors.phone = phoneErrorMessage;
    }

    if (!formData.job_title.trim()) {
      nextErrors.job_title = "Job title is required.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function inputClassName(fieldName) {
    return `${baseFieldClassName} ${
      errors[fieldName] ? errorFieldClassName : defaultFieldClassName
    }`;
  }

  function buildPayload() {
    return {
      company_id: Number(formData.company_id),
      first_name: formData.first_name.trim(),
      last_name: formData.last_name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      job_title: formData.job_title.trim(),
      notes: formData.notes.trim() || null,
    };
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
        <label className="mb-1.5 block text-sm font-medium text-slate-700" htmlFor="company_id">
          Company *
        </label>
        <select
          className={inputClassName("company_id")}
          id="company_id"
          name="company_id"
          onChange={handleChange}
          value={formData.company_id}
        >
          <option value="">Select a company</option>
          {companies.map((company) => (
            <option key={company.id} value={company.id}>
              {company.name}
            </option>
          ))}
        </select>
        {errors.company_id ? (
          <p className="mt-1 text-sm text-rose-600">{errors.company_id}</p>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label
            className="mb-1.5 block text-sm font-medium text-slate-700"
            htmlFor="first_name"
          >
            First name *
          </label>
          <input
            className={inputClassName("first_name")}
            id="first_name"
            name="first_name"
            onChange={handleChange}
            value={formData.first_name}
          />
          {errors.first_name ? (
            <p className="mt-1 text-sm text-rose-600">{errors.first_name}</p>
          ) : null}
        </div>

        <div>
          <label
            className="mb-1.5 block text-sm font-medium text-slate-700"
            htmlFor="last_name"
          >
            Last name *
          </label>
          <input
            className={inputClassName("last_name")}
            id="last_name"
            name="last_name"
            onChange={handleChange}
            value={formData.last_name}
          />
          {errors.last_name ? (
            <p className="mt-1 text-sm text-rose-600">{errors.last_name}</p>
          ) : null}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700" htmlFor="email">
            Email *
          </label>
          <input
            className={inputClassName("email")}
            id="email"
            inputMode="email"
            name="email"
            onChange={handleChange}
            placeholder="person@example.com"
            value={formData.email}
          />
          {errors.email ? <p className="mt-1 text-sm text-rose-600">{errors.email}</p> : null}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700" htmlFor="phone">
            Phone *
          </label>
          <input
            className={inputClassName("phone")}
            id="phone"
            inputMode="numeric"
            maxLength={11}
            name="phone"
            onChange={handleChange}
            placeholder="05555555555"
            value={formData.phone}
          />
          {errors.phone ? <p className="mt-1 text-sm text-rose-600">{errors.phone}</p> : null}
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700" htmlFor="job_title">
          Job title *
        </label>
        <input
          className={inputClassName("job_title")}
          id="job_title"
          name="job_title"
          onChange={handleChange}
          placeholder="Sales Manager"
          value={formData.job_title}
        />
        {errors.job_title ? (
          <p className="mt-1 text-sm text-rose-600">{errors.job_title}</p>
        ) : null}
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
          placeholder="Any useful context about this contact..."
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

export default ContactForm;

import { useEffect, useState } from "react";

const emptyForm = {
  company_id: "",
  deal_id: "",
  activity_type: "Note",
  activity_date: "",
  note: "",
};

const activityTypeOptions = ["Note", "Call", "Meeting", "Email", "Follow-up"];
const baseFieldClassName =
  "w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:ring-4";
const defaultFieldClassName =
  "border-stone-200 focus:border-teal-600 focus:ring-teal-100";
const errorFieldClassName = "border-rose-500 focus:border-rose-500 focus:ring-rose-100";

function normalizeFormValues(initialValues) {
  return {
    company_id: initialValues?.company_id ? String(initialValues.company_id) : "",
    deal_id: initialValues?.deal_id ? String(initialValues.deal_id) : "",
    activity_type: initialValues?.activity_type ?? "Note",
    activity_date: initialValues?.activity_date ?? "",
    note: initialValues?.note ?? "",
  };
}

function ActivityForm({
  companies,
  deals,
  initialValues,
  isSubmitting,
  onCancel,
  onSubmit,
  submitLabel,
}) {
  const [formData, setFormData] = useState(emptyForm);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setFormData(normalizeFormValues(initialValues));
    setErrors({});
  }, [initialValues]);

  const companyDeals = formData.company_id
    ? deals.filter((deal) => String(deal.company_id) === formData.company_id)
    : [];

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((current) => {
      const nextFormData = {
        ...current,
        [name]: value,
      };

      if (name === "company_id") {
        const nextDealExists = deals.some(
          (deal) =>
            String(deal.id) === current.deal_id && String(deal.company_id) === value,
        );

        if (!nextDealExists) {
          nextFormData.deal_id = "";
        }
      }

      return nextFormData;
    });

    setErrors((current) => {
      if (!current[name] && !(name === "company_id" && current.deal_id)) {
        return current;
      }

      const trimmedValue = typeof value === "string" ? value.trim() : value;
      const nextErrors = { ...current };

      if (name === "company_id" && trimmedValue) {
        delete nextErrors.company_id;
        delete nextErrors.deal_id;
      }

      if (name === "deal_id") {
        delete nextErrors.deal_id;
      }

      if (name !== "company_id" && name !== "deal_id" && trimmedValue) {
        delete nextErrors[name];
      }

      return nextErrors;
    });
  }

  function validateForm() {
    const nextErrors = {};

    if (!formData.company_id) {
      nextErrors.company_id = "Company is required.";
    }

    if (!formData.activity_type.trim()) {
      nextErrors.activity_type = "Activity type is required.";
    }

    if (!formData.activity_date.trim()) {
      nextErrors.activity_date = "Activity date is required.";
    }

    if (!formData.note.trim()) {
      nextErrors.note = "Note is required.";
    }

    if (
      formData.deal_id &&
      !companyDeals.some((deal) => String(deal.id) === formData.deal_id)
    ) {
      nextErrors.deal_id = "Selected deal does not belong to the selected company.";
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
      deal_id: formData.deal_id ? Number(formData.deal_id) : null,
      activity_type: formData.activity_type,
      activity_date: formData.activity_date,
      note: formData.note.trim(),
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
            htmlFor="activity_type"
          >
            Activity type *
          </label>
          <select
            className={inputClassName("activity_type")}
            id="activity_type"
            name="activity_type"
            onChange={handleChange}
            value={formData.activity_type}
          >
            {activityTypeOptions.map((activityType) => (
              <option key={activityType} value={activityType}>
                {activityType}
              </option>
            ))}
          </select>
          {errors.activity_type ? (
            <p className="mt-1 text-sm text-rose-600">{errors.activity_type}</p>
          ) : null}
        </div>

        <div>
          <label
            className="mb-1.5 block text-sm font-medium text-slate-700"
            htmlFor="activity_date"
          >
            Activity date *
          </label>
          <input
            className={inputClassName("activity_date")}
            id="activity_date"
            name="activity_date"
            onChange={handleChange}
            type="date"
            value={formData.activity_date}
          />
          {errors.activity_date ? (
            <p className="mt-1 text-sm text-rose-600">{errors.activity_date}</p>
          ) : null}
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700" htmlFor="deal_id">
          Deal
        </label>
        <select
          className={inputClassName("deal_id")}
          id="deal_id"
          name="deal_id"
          onChange={handleChange}
          value={formData.deal_id}
        >
          <option value="">No related deal</option>
          {companyDeals.map((deal) => (
            <option key={deal.id} value={deal.id}>
              {deal.title}
            </option>
          ))}
        </select>
        {errors.deal_id ? (
          <p className="mt-1 text-sm text-rose-600">{errors.deal_id}</p>
        ) : null}
        {formData.company_id && companyDeals.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">
            No deals found for this company. You can still create a company-level activity.
          </p>
        ) : null}
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700" htmlFor="note">
          Note *
        </label>
        <textarea
          className={`min-h-32 ${inputClassName("note")}`}
          id="note"
          name="note"
          onChange={handleChange}
          placeholder="Add the activity details here..."
          value={formData.note}
        />
        {errors.note ? <p className="mt-1 text-sm text-rose-600">{errors.note}</p> : null}
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

export default ActivityForm;

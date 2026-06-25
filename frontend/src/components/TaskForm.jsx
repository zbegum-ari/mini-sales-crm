import { useEffect, useState } from "react";

const emptyForm = {
  company_id: "",
  deal_id: "",
  title: "",
  description: "",
  due_date: "",
  status: "Open",
};

const taskStatusOptions = ["Open", "Completed", "Cancelled"];
const baseFieldClassName = "crm-field";
const defaultFieldClassName = "crm-field-default";
const errorFieldClassName = "crm-field-error";

function normalizeFormValues(initialValues) {
  return {
    company_id: initialValues?.company_id ? String(initialValues.company_id) : "",
    deal_id: initialValues?.deal_id ? String(initialValues.deal_id) : "",
    title: initialValues?.title ?? "",
    description: initialValues?.description ?? "",
    due_date: initialValues?.due_date ?? "",
    status: initialValues?.status ?? "Open",
  };
}

function TaskForm({
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

    if (!formData.title.trim()) {
      nextErrors.title = "Task title is required.";
    }

    if (!formData.due_date.trim()) {
      nextErrors.due_date = "Due date is required.";
    }

    if (!formData.status.trim()) {
      nextErrors.status = "Status is required.";
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
      title: formData.title.trim(),
      description: formData.description.trim() || null,
      due_date: formData.due_date,
      status: formData.status,
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
      <p className="crm-form-hint">
        Fields marked with * are required.
      </p>

      <div>
        <label className="crm-label" htmlFor="company_id">
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
        {errors.company_id ? <p className="crm-error-text">{errors.company_id}</p> : null}
      </div>

      <div>
        <label className="crm-label" htmlFor="title">
          Task title *
        </label>
        <input
          className={inputClassName("title")}
          id="title"
          name="title"
          onChange={handleChange}
          placeholder="Follow up on pricing proposal"
          value={formData.title}
        />
        {errors.title ? <p className="crm-error-text">{errors.title}</p> : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="crm-label" htmlFor="due_date">
            Due date *
          </label>
          <input
            className={inputClassName("due_date")}
            id="due_date"
            name="due_date"
            onChange={handleChange}
            type="date"
            value={formData.due_date}
          />
          {errors.due_date ? <p className="crm-error-text">{errors.due_date}</p> : null}
        </div>

        <div>
          <label className="crm-label" htmlFor="status">
            Status *
          </label>
          <select
            className={inputClassName("status")}
            id="status"
            name="status"
            onChange={handleChange}
            value={formData.status}
          >
            {taskStatusOptions.map((statusOption) => (
              <option key={statusOption} value={statusOption}>
                {statusOption}
              </option>
            ))}
          </select>
          {errors.status ? <p className="crm-error-text">{errors.status}</p> : null}
        </div>
      </div>

      <div>
        <label className="crm-label" htmlFor="deal_id">
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
        {errors.deal_id ? <p className="crm-error-text">{errors.deal_id}</p> : null}
        {formData.company_id && companyDeals.length === 0 ? (
          <p className="mt-2 text-sm leading-6 text-slate-500">
            No deals found for this company. You can still create a company-level task.
          </p>
        ) : null}
      </div>

      <div>
        <label className="crm-label" htmlFor="description">
          Description
        </label>
        <textarea
          className={`min-h-32 resize-y ${baseFieldClassName} ${defaultFieldClassName}`}
          id="description"
          name="description"
          onChange={handleChange}
          placeholder="Add any follow-up details or context..."
          value={formData.description}
        />
      </div>

      <div className="flex flex-wrap gap-3 pt-2">
        <button
          className="crm-button crm-button-primary"
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? "Saving..." : submitLabel}
        </button>

        {onCancel ? (
          <button
            className="crm-button crm-button-secondary"
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

export default TaskForm;

import { useEffect, useState } from "react";

const emptyForm = {
  company_id: "",
  title: "",
  value: "",
  pipeline_stage: "Lead",
  expected_close_date: "",
  notes: "",
};

const stageOptions = ["Lead", "Qualified", "Proposal", "Negotiation", "Won", "Lost"];
const baseFieldClassName = "crm-field";
const defaultFieldClassName = "crm-field-default";
const errorFieldClassName = "crm-field-error";
const valueErrorMessage = "Deal value must be a positive number.";

function normalizeFormValues(initialValues) {
  return {
    company_id: initialValues?.company_id ? String(initialValues.company_id) : "",
    title: initialValues?.title ?? "",
    value:
      initialValues?.value !== undefined && initialValues?.value !== null
        ? String(initialValues.value)
        : "",
    pipeline_stage: initialValues?.pipeline_stage ?? "Lead",
    expected_close_date: initialValues?.expected_close_date ?? "",
    notes: initialValues?.notes ?? "",
  };
}

function DealForm({
  companies,
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

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: value,
    }));

    setErrors((current) => {
      if (!current[name]) {
        return current;
      }

      const trimmedValue = typeof value === "string" ? value.trim() : value;

      if (name === "value") {
        const numericValue = Number(trimmedValue);
        if (!trimmedValue || Number.isNaN(numericValue) || numericValue <= 0) {
          return current;
        }
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

    if (!formData.title.trim()) {
      nextErrors.title = "Deal title is required.";
    }

    if (!formData.value.trim()) {
      nextErrors.value = "Deal value is required.";
    } else {
      const numericValue = Number(formData.value.trim());
      if (Number.isNaN(numericValue) || numericValue <= 0) {
        nextErrors.value = valueErrorMessage;
      }
    }

    if (!formData.pipeline_stage.trim()) {
      nextErrors.pipeline_stage = "Pipeline stage is required.";
    }

    if (!formData.expected_close_date.trim()) {
      nextErrors.expected_close_date = "Expected close date is required.";
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
      title: formData.title.trim(),
      value: Number(formData.value.trim()),
      pipeline_stage: formData.pipeline_stage,
      expected_close_date: formData.expected_close_date,
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
          Deal title *
        </label>
        <input
          className={inputClassName("title")}
          id="title"
          name="title"
          onChange={handleChange}
          placeholder="Annual software renewal"
          value={formData.title}
        />
        {errors.title ? <p className="crm-error-text">{errors.title}</p> : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="crm-label" htmlFor="value">
            Deal value *
          </label>
          <input
            className={inputClassName("value")}
            id="value"
            inputMode="decimal"
            name="value"
            onChange={handleChange}
            placeholder="15000"
            value={formData.value}
          />
          {errors.value ? <p className="crm-error-text">{errors.value}</p> : null}
        </div>

        <div>
          <label className="crm-label" htmlFor="pipeline_stage">
            Pipeline stage *
          </label>
          <select
            className={inputClassName("pipeline_stage")}
            id="pipeline_stage"
            name="pipeline_stage"
            onChange={handleChange}
            value={formData.pipeline_stage}
          >
            {stageOptions.map((stage) => (
              <option key={stage} value={stage}>
                {stage}
              </option>
            ))}
          </select>
          {errors.pipeline_stage ? (
            <p className="crm-error-text">{errors.pipeline_stage}</p>
          ) : null}
        </div>
      </div>

      <div>
        <label className="crm-label" htmlFor="expected_close_date">
          Expected close date *
        </label>
        <input
          className={inputClassName("expected_close_date")}
          id="expected_close_date"
          name="expected_close_date"
          onChange={handleChange}
          type="date"
          value={formData.expected_close_date}
        />
        {errors.expected_close_date ? (
          <p className="crm-error-text">{errors.expected_close_date}</p>
        ) : null}
      </div>

      <div>
        <label className="crm-label" htmlFor="notes">
          Notes
        </label>
        <textarea
          className={`min-h-32 resize-y ${baseFieldClassName} ${defaultFieldClassName}`}
          id="notes"
          name="notes"
          onChange={handleChange}
          placeholder="Any context about the opportunity..."
          value={formData.notes}
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

export default DealForm;

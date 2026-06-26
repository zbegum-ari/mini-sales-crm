import { useEffect, useState } from "react";

import CRMSelectField from "@/components/ui/crm-select-field";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const emptyForm = {
  company_id: "",
  deal_id: "",
  activity_type: "Note",
  activity_date: "",
  note: "",
};

const activityTypeOptions = ["Note", "Call", "Meeting", "Email", "Follow-up"];
const baseFieldClassName = "crm-field";
const defaultFieldClassName = "crm-field-default";
const errorFieldClassName = "crm-field-error";

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
      <Alert className="crm-form-hint border-slate-200 bg-slate-50/80">
        <AlertDescription>Fields marked with * are required.</AlertDescription>
      </Alert>

      <div>
        <label className="crm-label" htmlFor="company_id">
          Company *
        </label>
        <CRMSelectField
          items={[
            { value: "", label: "Select a company", disabled: true },
            ...companies.map((company) => ({
              value: String(company.id),
              label: company.name,
            })),
          ]}
          onValueChange={(value) => handleChange({ target: { name: "company_id", value } })}
          triggerClassName={inputClassName("company_id")}
          value={formData.company_id}
        />
        {errors.company_id ? <p className="crm-error-text">{errors.company_id}</p> : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="crm-label" htmlFor="activity_type">
            Activity type *
          </label>
          <CRMSelectField
            items={activityTypeOptions.map((activityType) => ({
              value: activityType,
              label: activityType,
            }))}
            onValueChange={(value) =>
              handleChange({ target: { name: "activity_type", value } })
            }
            triggerClassName={inputClassName("activity_type")}
            value={formData.activity_type}
          />
          {errors.activity_type ? (
            <p className="crm-error-text">{errors.activity_type}</p>
          ) : null}
        </div>

        <div>
          <label className="crm-label" htmlFor="activity_date">
            Activity date *
          </label>
          <Input
            className={inputClassName("activity_date")}
            id="activity_date"
            name="activity_date"
            onChange={handleChange}
            type="date"
            value={formData.activity_date}
          />
          {errors.activity_date ? (
            <p className="crm-error-text">{errors.activity_date}</p>
          ) : null}
        </div>
      </div>

      <div>
        <label className="crm-label" htmlFor="deal_id">
          Deal
        </label>
        <CRMSelectField
          items={[
            { value: "", label: "No related deal" },
            ...companyDeals.map((deal) => ({
              value: String(deal.id),
              label: deal.title,
            })),
          ]}
          onValueChange={(value) => handleChange({ target: { name: "deal_id", value } })}
          triggerClassName={inputClassName("deal_id")}
          value={formData.deal_id}
        />
        {errors.deal_id ? <p className="crm-error-text">{errors.deal_id}</p> : null}
        {formData.company_id && companyDeals.length === 0 ? (
          <p className="mt-2 text-sm leading-6 text-slate-500">
            No deals found for this company. You can still create a company-level activity.
          </p>
        ) : null}
      </div>

      <div>
        <label className="crm-label" htmlFor="note">
          Note *
        </label>
        <Textarea
          className={`min-h-32 resize-y ${inputClassName("note")}`}
          id="note"
          name="note"
          onChange={handleChange}
          placeholder="Add the activity details here..."
          value={formData.note}
        />
        {errors.note ? <p className="crm-error-text">{errors.note}</p> : null}
      </div>

      <div className="flex flex-wrap gap-3 pt-2">
        <Button
          className="crm-button crm-button-primary"
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? "Saving..." : submitLabel}
        </Button>

        {onCancel ? (
          <Button
            className="crm-button crm-button-secondary"
            onClick={onCancel}
            type="button"
            variant="outline"
          >
            Cancel
          </Button>
        ) : null}
      </div>
    </form>
  );
}

export default ActivityForm;

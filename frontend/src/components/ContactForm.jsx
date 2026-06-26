import { useEffect, useState } from "react";

import CRMSelectField from "@/components/ui/crm-select-field";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const emptyForm = {
  company_id: "",
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
  job_title: "",
  notes: "",
};

const baseFieldClassName = "crm-field";
const defaultFieldClassName = "crm-field-default";
const errorFieldClassName = "crm-field-error";
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
          <label className="crm-label" htmlFor="first_name">
            First name *
          </label>
          <Input
            className={inputClassName("first_name")}
            id="first_name"
            name="first_name"
            onChange={handleChange}
            value={formData.first_name}
          />
          {errors.first_name ? <p className="crm-error-text">{errors.first_name}</p> : null}
        </div>

        <div>
          <label className="crm-label" htmlFor="last_name">
            Last name *
          </label>
          <Input
            className={inputClassName("last_name")}
            id="last_name"
            name="last_name"
            onChange={handleChange}
            value={formData.last_name}
          />
          {errors.last_name ? <p className="crm-error-text">{errors.last_name}</p> : null}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="crm-label" htmlFor="email">
            Email *
          </label>
          <Input
            className={inputClassName("email")}
            id="email"
            inputMode="email"
            name="email"
            onChange={handleChange}
            placeholder="person@example.com"
            value={formData.email}
          />
          {errors.email ? <p className="crm-error-text">{errors.email}</p> : null}
        </div>

        <div>
          <label className="crm-label" htmlFor="phone">
            Phone *
          </label>
          <Input
            className={inputClassName("phone")}
            id="phone"
            inputMode="numeric"
            maxLength={11}
            name="phone"
            onChange={handleChange}
            placeholder="05555555555"
            value={formData.phone}
          />
          {errors.phone ? <p className="crm-error-text">{errors.phone}</p> : null}
        </div>
      </div>

      <div>
        <label className="crm-label" htmlFor="job_title">
          Job title *
        </label>
        <Input
          className={inputClassName("job_title")}
          id="job_title"
          name="job_title"
          onChange={handleChange}
          placeholder="Sales Manager"
          value={formData.job_title}
        />
        {errors.job_title ? <p className="crm-error-text">{errors.job_title}</p> : null}
      </div>

      <div>
        <label className="crm-label" htmlFor="notes">
          Notes
        </label>
        <Textarea
          className={`min-h-32 resize-y ${baseFieldClassName} ${defaultFieldClassName}`}
          id="notes"
          name="notes"
          onChange={handleChange}
          placeholder="Any useful context about this contact..."
          value={formData.notes}
        />
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

export default ContactForm;

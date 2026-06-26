import { useEffect, useState } from "react";

import CRMSelectField from "@/components/ui/crm-select-field";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

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
const baseFieldClassName = "crm-field";
const defaultFieldClassName = "crm-field-default";
const errorFieldClassName = "crm-field-error";
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
      <Alert className="crm-form-hint border-slate-200 bg-slate-50/80">
        <AlertDescription>Fields marked with * are required.</AlertDescription>
      </Alert>

      <div>
        <label className="crm-label" htmlFor="name">
          Company name *
        </label>
        <Input
          className={inputClassName("name")}
          id="name"
          name="name"
          onChange={handleChange}
          value={formData.name}
        />
        {errors.name ? <p className="crm-error-text">{errors.name}</p> : null}
      </div>

      <div>
        <label className="crm-label" htmlFor="industry">
          Industry *
        </label>
        <Input
          className={inputClassName("industry")}
          id="industry"
          name="industry"
          onChange={handleChange}
          placeholder="Software, Retail, Consulting..."
          value={formData.industry}
        />
        {errors.industry ? <p className="crm-error-text">{errors.industry}</p> : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="crm-label" htmlFor="company_size">
            Company size *
          </label>
          <CRMSelectField
            items={companySizeOptions.map((companySize) => ({
              value: companySize,
              label: companySize,
            }))}
            onValueChange={(value) =>
              handleChange({ target: { name: "company_size", value } })
            }
            triggerClassName={inputClassName("company_size")}
            value={formData.company_size}
          />
          {errors.company_size ? <p className="crm-error-text">{errors.company_size}</p> : null}
        </div>

        <div>
          <label className="crm-label" htmlFor="status">
            Status *
          </label>
          <CRMSelectField
            items={statusOptions.map((status) => ({
              value: status,
              label: status,
            }))}
            onValueChange={(value) => handleChange({ target: { name: "status", value } })}
            triggerClassName={inputClassName("status")}
            value={formData.status}
          />
          {errors.status ? <p className="crm-error-text">{errors.status}</p> : null}
        </div>
      </div>

      <div>
        <label className="crm-label" htmlFor="website">
          Website *
        </label>
        <Input
          className={inputClassName("website")}
          id="website"
          name="website"
          onChange={handleChange}
          placeholder="example.com"
          value={formData.website}
        />
        {errors.website ? <p className="crm-error-text">{errors.website}</p> : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="crm-label" htmlFor="phone">
            Phone
          </label>
          <Input
            className={`${baseFieldClassName} ${defaultFieldClassName}`}
            id="phone"
            name="phone"
            onChange={handleChange}
            placeholder="+90 555 555 55 55"
            value={formData.phone}
          />
        </div>

        <div>
          <label className="crm-label" htmlFor="email">
            Email
          </label>
          <Input
            className={inputClassName("email")}
            id="email"
            inputMode="email"
            name="email"
            onChange={handleChange}
            placeholder="team@example.com"
            value={formData.email}
          />
          {errors.email ? <p className="crm-error-text">{errors.email}</p> : null}
        </div>
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
          placeholder="Anything helpful for future follow-up..."
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

export default CompanyForm;

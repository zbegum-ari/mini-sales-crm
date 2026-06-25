import { useEffect, useState } from "react";

const emptyForm = {
  name: "",
  industry: "",
  website: "",
  phone: "",
  email: "",
  notes: "",
};

function normalizeFormValues(initialValues) {
  return {
    name: initialValues?.name ?? "",
    industry: initialValues?.industry ?? "",
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

  useEffect(() => {
    setFormData(normalizeFormValues(initialValues));
  }, [initialValues]);

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function buildPayload() {
    return {
      name: formData.name.trim(),
      industry: formData.industry.trim() || null,
      website: formData.website.trim() || null,
      phone: formData.phone.trim() || null,
      email: formData.email.trim() || null,
      notes: formData.notes.trim() || null,
    };
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const didSave = await onSubmit(buildPayload());

    if (didSave && !initialValues) {
      setFormData(emptyForm);
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="name">
          Company name
        </label>
        <input
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none transition focus:border-slate-500"
          id="name"
          name="name"
          onChange={handleChange}
          required
          value={formData.name}
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="industry">
          Industry
        </label>
        <input
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none transition focus:border-slate-500"
          id="industry"
          name="industry"
          onChange={handleChange}
          value={formData.industry}
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="website">
          Website
        </label>
        <input
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none transition focus:border-slate-500"
          id="website"
          name="website"
          onChange={handleChange}
          value={formData.website}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="phone">
            Phone
          </label>
          <input
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none transition focus:border-slate-500"
            id="phone"
            name="phone"
            onChange={handleChange}
            value={formData.phone}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="email">
            Email
          </label>
          <input
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none transition focus:border-slate-500"
            id="email"
            name="email"
            onChange={handleChange}
            value={formData.email}
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="notes">
          Notes
        </label>
        <textarea
          className="min-h-28 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none transition focus:border-slate-500"
          id="notes"
          name="notes"
          onChange={handleChange}
          value={formData.notes}
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          className="rounded-lg bg-slate-900 px-4 py-2 font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? "Saving..." : submitLabel}
        </button>

        {onCancel ? (
          <button
            className="rounded-lg border border-slate-300 px-4 py-2 font-medium text-slate-700 transition hover:bg-slate-100"
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

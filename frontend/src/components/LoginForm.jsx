import { useState } from "react";

import konvoLogo from "../assets/konvo-logo.png";
import { Alert, AlertDescription } from "./ui/alert";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Input } from "./ui/input";

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

const initialValues = {
  signup_type: "manager",
  organization_name: "",
  name: "",
  email: "",
  password: "",
};

function LoginForm({
  errorMessage,
  isSubmitting,
  noticeMessage,
  onLogin,
  onModeChange,
  onRegister,
  statusBadge,
}) {
  const [mode, setMode] = useState("login");
  const [showLogoFallback, setShowLogoFallback] = useState(false);
  const [formValues, setFormValues] = useState(initialValues);
  const [errors, setErrors] = useState({});

  function resetForm(nextMode, options = {}) {
    const { preserveNotice = false } = options;
    setMode(nextMode);
    setFormValues(initialValues);
    setErrors({});
    if (!preserveNotice) {
      onModeChange?.();
    }
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setFormValues((current) => ({
      ...current,
      [name]: value,
    }));

    setErrors((current) => {
      if (!current[name]) {
        return current;
      }

      const nextErrors = { ...current };
      delete nextErrors[name];
      return nextErrors;
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const trimmedEmail = formValues.email.trim();
    const trimmedPassword = formValues.password.trim();
    const nextErrors = {};

    if (mode === "signup" && !formValues.organization_name.trim()) {
      nextErrors.organization_name = "Company / Workspace name is required.";
    }

    if (mode === "signup" && !formValues.name.trim()) {
      nextErrors.name = "Full name is required.";
    }

    if (!trimmedEmail) {
      nextErrors.email = "Email is required.";
    } else if (!isValidEmail(trimmedEmail)) {
      nextErrors.email = "Email must be a valid email address.";
    }

    if (!trimmedPassword) {
      nextErrors.password = "Password is required.";
    } else if (mode === "signup" && trimmedPassword.length < 8) {
      nextErrors.password = "Password must be at least 8 characters long.";
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    if (mode === "login") {
      await onLogin({
        email: trimmedEmail,
        password: formValues.password,
      });
      return;
    }

    const result = await onRegister({
      signup_type: formValues.signup_type,
      organization_name: formValues.organization_name.trim(),
      name: formValues.name.trim(),
      email: trimmedEmail,
      password: formValues.password,
    });

    if (result?.success) {
      resetForm("login", { preserveNotice: true });
    }
  }

  return (
    <div className="relative mx-auto flex min-h-screen max-w-[1320px] items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
      <div className="w-full max-w-[980px]">
        <Card className="crm-page-surface crm-theme-companies overflow-hidden py-0">
          <div className="grid gap-0 lg:grid-cols-[0.92fr_1.08fr]">
            <div className="border-b border-slate-200/90 bg-gradient-to-br from-white via-cyan-50/75 to-blue-100/65 px-6 py-8 sm:px-8 lg:border-b-0 lg:border-r">
              <div className="flex h-full flex-col justify-center">
                <div className="flex min-h-[72px] items-center">
                  {showLogoFallback ? (
                    <span className="text-xl font-semibold tracking-tight text-slate-950">
                      Konvo
                    </span>
                  ) : (
                    <img
                      alt="Konvo logo"
                      className="h-12 w-auto object-contain sm:h-14"
                      onError={() => setShowLogoFallback(true)}
                      src={konvoLogo}
                    />
                  )}
                </div>

                <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-700">
                  Mini Sales CRM v2
                </p>
                <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                  Secure CRM access
                </h1>
                <p className="mt-3 max-w-sm text-sm leading-7 text-slate-600 sm:text-base">
                  Manage your company workspace and CRM data securely.
                </p>
              </div>
            </div>

            <div className="bg-white/95 px-6 py-8 sm:px-8">
              <div className="rounded-[1.4rem] border border-slate-200/90 bg-white/88 px-5 py-5 shadow-sm sm:px-6">
                <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50/80 p-1">
                  <button
                    className={`crm-auth-toggle ${mode === "login" ? "crm-auth-toggle-active" : ""}`}
                    onClick={() => resetForm("login")}
                    type="button"
                  >
                    Login
                  </button>
                  <button
                    className={`crm-auth-toggle ${mode === "signup" ? "crm-auth-toggle-active" : ""}`}
                    onClick={() => resetForm("signup")}
                    type="button"
                  >
                    Sign up
                  </button>
                </div>

                <div className="mt-4">
                  <h2 className="text-xl font-semibold tracking-tight text-slate-950">
                    {mode === "login" ? "Login" : "Create or join a workspace"}
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    {mode === "login"
                      ? "Enter your email and password to continue."
                      : "Choose your role and submit your access request."}
                  </p>
                </div>

                {noticeMessage ? (
                  <Alert className="mt-4 border-emerald-200 bg-emerald-50 py-3 text-emerald-700">
                    <AlertDescription>{noticeMessage}</AlertDescription>
                  </Alert>
                ) : null}

                {errorMessage ? (
                  <Alert className="mt-4 border-rose-200 bg-rose-50 py-3 text-rose-700">
                    <AlertDescription>{errorMessage}</AlertDescription>
                  </Alert>
                ) : null}

                <form className="mt-4 space-y-4" noValidate onSubmit={handleSubmit}>
                  {mode === "signup" ? (
                    <div>
                      <span className="crm-label">I am signing up as</span>
                      <div className="inline-flex rounded-2xl border border-slate-200 bg-slate-50/80 p-1">
                        <button
                          className={`crm-auth-toggle px-4 ${formValues.signup_type === "manager" ? "crm-auth-toggle-active" : ""}`}
                          onClick={() =>
                            setFormValues((current) => ({ ...current, signup_type: "manager" }))
                          }
                          type="button"
                        >
                          Manager
                        </button>
                        <button
                          className={`crm-auth-toggle px-4 ${formValues.signup_type === "employee" ? "crm-auth-toggle-active" : ""}`}
                          onClick={() =>
                            setFormValues((current) => ({ ...current, signup_type: "employee" }))
                          }
                          type="button"
                        >
                          Employee
                        </button>
                      </div>
                      <p className="mt-2 text-xs leading-5 text-slate-500">
                        {formValues.signup_type === "manager"
                          ? "Managers create a company workspace and wait for Konvo approval."
                          : "Employees join an existing workspace and wait for manager approval."}
                      </p>
                    </div>
                  ) : null}

                  {mode === "signup" ? (
                    <Field
                      error={errors.organization_name}
                      helperText="Use your company or team workspace name."
                      id="signup-organization-name"
                      label="Company / Workspace name"
                    >
                      <Input
                        className={
                          errors.organization_name
                            ? "crm-field crm-field-error"
                            : "crm-field crm-field-default"
                        }
                        id="signup-organization-name"
                        name="organization_name"
                        onChange={handleChange}
                        placeholder="A Company"
                        type="text"
                        value={formValues.organization_name}
                      />
                    </Field>
                  ) : null}

                  {mode === "signup" ? (
                    <Field error={errors.name} id="signup-name" label="Full name">
                      <Input
                        className={
                          errors.name ? "crm-field crm-field-error" : "crm-field crm-field-default"
                        }
                        id="signup-name"
                        name="name"
                        onChange={handleChange}
                        placeholder="Jane Doe"
                        type="text"
                        value={formValues.name}
                      />
                    </Field>
                  ) : null}

                  <Field error={errors.email} id={`${mode}-email`} label="Email">
                    <Input
                      className={
                        errors.email ? "crm-field crm-field-error" : "crm-field crm-field-default"
                      }
                      id={`${mode}-email`}
                      inputMode="email"
                      name="email"
                      onChange={handleChange}
                      placeholder="you@example.com"
                      type="email"
                      value={formValues.email}
                    />
                  </Field>

                  <Field error={errors.password} id={`${mode}-password`} label="Password">
                    <Input
                      className={
                        errors.password
                          ? "crm-field crm-field-error"
                          : "crm-field crm-field-default"
                      }
                      id={`${mode}-password`}
                      name="password"
                      onChange={handleChange}
                      placeholder={mode === "login" ? "Enter your password" : "At least 8 characters"}
                      type="password"
                      value={formValues.password}
                    />
                  </Field>

                  <Button className="crm-button crm-button-primary w-full" disabled={isSubmitting} type="submit">
                    {isSubmitting
                      ? mode === "login"
                        ? "Signing in..."
                        : "Submitting request..."
                      : mode === "login"
                        ? "Login"
                        : "Submit request"}
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

function Field({ children, error, helperText, id, label }) {
  return (
    <div>
      <label className="crm-label" htmlFor={id}>
        {label}
      </label>
      {children}
      {error ? <p className="crm-error-text">{error}</p> : null}
      {!error && helperText ? <p className="mt-2 text-xs leading-5 text-slate-500">{helperText}</p> : null}
    </div>
  );
}

function StatusBlock({ statusBadge }) {
  return (
    <div>
      <Badge
        className={`inline-flex h-auto items-center gap-2 self-start rounded-full border px-3 py-1.5 text-xs font-semibold shadow-sm ${statusBadge.className}`}
      >
        <span className={`h-2 w-2 rounded-full ${statusBadge.dotClassName}`} />
        {statusBadge.label}
      </Badge>
    </div>
  );
}

export default LoginForm;

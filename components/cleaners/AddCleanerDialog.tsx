"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import instance from "@/auth/instance";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";

type CreateCleanerPayload = {
  name: string;
  email: string;
  password: string;
  group: string;
};

type Props = {
  onCreate?: (payload: CreateCleanerPayload) => void | Promise<void>;
};

export default function AddCleanerDialog({ onCreate }: Props) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [values, setValues] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    group: "",
  });
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  function onChange<K extends keyof typeof values>(key: K, v: string) {
    setValues((curr) => ({ ...curr, [key]: v }));
  }

  function emailValid(email: string) {
    // Basic email validation
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  function passwordValid(pw: string) {
    // At least 8 chars, at least 1 letter and 1 number
    if (pw.length < 8) return false;
    const hasLetter = /[A-Za-z]/.test(pw);
    const hasNumber = /[0-9]/.test(pw);
    return hasLetter && hasNumber;
  }

  const errors = useMemo(() => {
    const e: Partial<Record<keyof typeof values, string>> = {};
    if (!values.name.trim()) e.name = "Name is required";
    if (!values.email.trim()) e.email = "Email is required";
    else if (!emailValid(values.email)) e.email = "Enter a valid email";
    if (!values.group.trim()) e.group = "Group is required";
    if (!values.password) e.password = "Password is required";
    else if (!passwordValid(values.password))
      e.password = "Min 8 chars with letters and numbers";
    if (!values.confirmPassword) e.confirmPassword = "Confirm your password";
    else if (values.confirmPassword !== values.password)
      e.confirmPassword = "Passwords do not match";
    return e;
  }, [values]);

  const isValid = Object.keys(errors).length === 0;

  const createCleaner = useMutation({
    mutationFn: async (payload: CreateCleanerPayload) => {
      const res = await axios.post("https://ur5azskm3m.execute-api.us-east-1.amazonaws.com/add-cleaner", payload);
      return res.data;
    },
    onSuccess: async (_data, variables) => {
      setError(null);
      await onCreate?.(variables);
      setValues({ name: "", email: "", password: "", confirmPassword: "", group: "" });
      setTouched({});
      setOpen(false);
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || err?.message || "Failed to create cleaner";
      setError(String(msg));
    },
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Mark all as touched
    setTouched({ name: true, email: true, password: true, confirmPassword: true, group: true });
    if (!isValid || createCleaner.isPending) return;
    setError(null);
    const payload = { name: values.name.trim(), email: values.email.trim(), password: values.password, group: values.group.trim() };
    await createCleaner.mutateAsync(payload);
  }

  return (
    <>
      <Button onClick={() => setOpen(true)} className="cursor-pointer">Add Cleaner</Button>
      {open ? (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/30" onClick={() => !createCleaner.isPending && setOpen(false)} />
          <div className="absolute left-1/2 top-1/2 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg border border-input/50 bg-background p-5 shadow-xl">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Add Cleaner</h3>
              <button
                type="button"
                aria-label="Close"
                onClick={() => !createCleaner.isPending && setOpen(false)}
                className="rounded-md p-2 hover:bg-accent"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="grid gap-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Name</label>
                <Input
                  value={values.name}
                  onChange={(e) => onChange("name", e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, name: true }))}
                  placeholder="Jane Doe"
                />
                {touched.name && errors.name ? (
                  <p className="mt-1 text-xs text-red-600">{errors.name}</p>
                ) : null}
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Email</label>
                <Input
                  type="email"
                  value={values.email}
                  onChange={(e) => onChange("email", e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                  placeholder="jane@example.com"
                />
                {touched.email && errors.email ? (
                  <p className="mt-1 text-xs text-red-600">{errors.email}</p>
                ) : null}
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Group</label>
                <Input
                  value={values.group}
                  onChange={(e) => onChange("group", e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, group: true }))}
                  placeholder="Team A"
                />
                {touched.group && errors.group ? (
                  <p className="mt-1 text-xs text-red-600">{errors.group}</p>
                ) : null}
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Password</label>
                <Input
                  type="password"
                  value={values.password}
                  onChange={(e) => onChange("password", e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, password: true }))}
                  placeholder="••••••••"
                />
                {touched.password && errors.password ? (
                  <p className="mt-1 text-xs text-red-600">{errors.password}</p>
                ) : (
                  <p className="mt-1 text-[10px] text-muted-foreground">Min 8 chars, include letters and numbers.</p>
                )}
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Confirm Password</label>
                <Input
                  type="password"
                  value={values.confirmPassword}
                  onChange={(e) => onChange("confirmPassword", e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, confirmPassword: true }))}
                  placeholder="••••••••"
                />
                {touched.confirmPassword && errors.confirmPassword ? (
                  <p className="mt-1 text-xs text-red-600">{errors.confirmPassword}</p>
                ) : null}
              </div>

              {error ? (
                <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">{error}</div>
              ) : null}
              <div className="mt-2 flex justify-end gap-2">
                <Button type="button" variant="secondary" onClick={() => setOpen(false)} disabled={createCleaner.isPending}>
                  Cancel
                </Button>
                <Button type="submit" disabled={!isValid || createCleaner.isPending}>
                  {createCleaner.isPending ? "Saving..." : "Save"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}

"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { setSession } from "@/auth/setSession";
import { z } from "zod";
import { useForm, type Resolver } from "react-hook-form";
import axios from "axios";

const LoginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

type LoginValues = z.infer<typeof LoginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [isPending, startTransition] = useTransition();

  // Minimal Zod resolver to avoid extra dependency
  const resolver: Resolver<LoginValues> = async (values) => {
    const parsed = LoginSchema.safeParse(values);
    if (parsed.success) {
      return { values: parsed.data, errors: {} };
    }
    const fieldErrors = parsed.error.flatten().fieldErrors as Record<string, string[] | undefined>;
    const errors: Record<string, any> = {};
    for (const key in fieldErrors) {
      const messages = fieldErrors[key];
      if (messages && messages.length) {
        errors[key] = { type: "zod", message: messages[0] };
      }
    }
    return { values: {}, errors };
  };

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver,
    mode: "onTouched",
    defaultValues: { email: "", password: "" },
  });

  const onValid = async (values: LoginValues) => {
    setSubmitError("");
    try {
      const { data } = await axios.post(
        "https://tq3svdb052.execute-api.us-east-1.amazonaws.com/login",
        values
      );
      if (data.token) {
        startTransition(async () => {
          await setSession(data.token);
          router.push("/");
        });
      } else {
        setSubmitError("Login failed");
      }
    } catch (err: any) {
      console.log({err})
      const message =
        ((err.response?.data as any).error) ||
        err?.message ||
        "Login failed";
      setSubmitError(String(message));
    }
  };

  return (
    <div className="relative grid min-h-dvh grid-cols-1 lg:grid-cols-2">
      {/* Decorative background */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-[36rem] w-[36rem] -translate-x-1/2 rounded-full bg-gradient-to-tr from-primary/20 via-primary/5 to-transparent blur-3xl" />
        <svg className="absolute bottom-0 left-0 h-[240px] w-[480px] text-primary/5" viewBox="0 0 480 240">
          <defs>
            <pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse">
              <path d="M 24 0 L 0 0 0 24" fill="none" stroke="currentColor" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Left panel with brand and illustration */}
      <div className="relative hidden items-center justify-center p-10 lg:flex">
        <div className="relative max-w-md">
          <div className="mb-8 flex items-center gap-3">
            {/* Brand mark (SVG logo) */}
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-primary to-primary/70 shadow-lg ring-1 ring-black/10">
              <svg viewBox="0 0 48 48" className="h-8 w-8 text-primary-foreground">
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="white" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="white" stopOpacity="0.6" />
                  </linearGradient>
                </defs>
                <path fill="url(#g1)" d="M24 6c10 0 18 8 18 18s-8 18-18 18S6 34 6 24 14 6 24 6zm0 6a12 12 0 100 24 12 12 0 000-24z" />
                <circle cx="24" cy="24" r="6" fill="white" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-semibold tracking-tight">Blue Ridge</p>
              <p className="text-sm text-muted-foreground">Admin Dashboard</p>
            </div>
          </div>
          <h2 className="mb-4 text-3xl font-semibold leading-tight">Welcome back.</h2>
          <p className="text-muted-foreground">
            Sign in to access analytics, manage content, and keep your
            operations flowing. Your data is protected with enterprise-grade
            security.
          </p>
          <div className="mt-10">
            <svg viewBox="0 0 400 200" className="h-40 w-[28rem] text-primary/30">
              <path d="M0 160 C80 100, 160 220, 240 160 S400 100, 400 140" fill="none" stroke="currentColor" strokeWidth="18" strokeLinecap="round" />
            </svg>
          </div>
        </div>
      </div>

      {/* Right panel with card form */}
      <div className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            {/* Compact logo for mobile */}
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-gradient-to-br from-primary to-primary/70 shadow-md ring-1 ring-black/10">
              <svg viewBox="0 0 48 48" className="h-6 w-6 text-primary-foreground">
                <circle cx="24" cy="24" r="18" fill="currentColor" opacity="0.25" />
                <circle cx="24" cy="24" r="6" fill="white" />
              </svg>
            </div>
            <div>
              <p className="text-xl font-semibold tracking-tight">Blue Ridge</p>
              <p className="text-xs text-muted-foreground">Admin Dashboard</p>
            </div>
          </div>

          <div className="relative rounded-2xl border border-input/50 bg-white p-6 shadow-xl dark:border-input/70 dark:bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-white/90 dark:supports-[backdrop-filter]:bg-background/60">
            <div className="absolute inset-0 -z-10 rounded-2xl bg-gradient-to-b from-primary/5 to-transparent dark:from-primary/10" />
            <form onSubmit={handleSubmit(onValid)} className="space-y-5">
              <div className="space-y-1">
                <h1 className="text-2xl font-semibold tracking-tight">Sign in</h1>
                <p className="text-sm text-muted-foreground">
                  Enter your credentials to continue
                </p>
              </div>

              {submitError && (
                <div className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-400">
                  {submitError}
                </div>
              )}

              <div className="space-y-4">
                {/* Email field */}
                <div>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-0 top-1/2 grid w-10 -translate-y-1/2 place-items-center text-muted-foreground">
                      {/* Mail icon */}
                      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M3 7l9 6 9-6" />
                        <rect x="3" y="5" width="18" height="14" rx="2" ry="2" />
                      </svg>
                    </span>
                    <Input
                      type="email"
                      placeholder="Email address"
                      className={
                        "pl-10 " +
                        (errors.email ? "border-red-500 focus-visible:ring-red-500" : "")
                      }
                      aria-invalid={!!errors.email}
                      aria-describedby={errors.email ? "email-error" : undefined}
                      autoComplete="email"
                      {...register("email")}
                    />
                  </div>
                  {errors.email && (
                    <p id="email-error" role="alert" className="mt-1 text-xs text-red-600 dark:text-red-400">
                      {errors.email.message as string}
                    </p>
                  )}
                </div>

                {/* Password field */}
                <div>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-0 top-1/2 grid w-10 -translate-y-1/2 place-items-center text-muted-foreground">
                      {/* Lock icon */}
                      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <rect x="4" y="11" width="16" height="9" rx="2" />
                        <path d="M8 11V7a4 4 0 118 0v4" />
                      </svg>
                    </span>
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Password"
                      className={
                        "pr-10 pl-10 " +
                        (errors.password ? "border-red-500 focus-visible:ring-red-500" : "")
                      }
                      aria-invalid={!!errors.password}
                      aria-describedby={errors.password ? "password-error" : undefined}
                      autoComplete="current-password"
                      {...register("password")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-0 top-1/2 grid w-10 -translate-y-1/2 place-items-center text-muted-foreground hover:text-foreground"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        // Eye-off icon
                        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path d="M3 3l18 18" />
                          <path d="M10.58 10.58A3 3 0 0012 15a3 3 0 002.12-.88" />
                          <path d="M9.88 5.09A10.94 10.94 0 0112 5c7 0 10 7 10 7a14.49 14.49 0 01-3.17 4.33" />
                          <path d="M6.61 6.61A14.49 14.49 0 002 12s3 7 10 7a10.94 10.94 0 003.9-.72" />
                        </svg>
                      ) : (
                        // Eye icon
                        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p id="password-error" role="alert" className="mt-1 text-xs text-red-600 dark:text-red-400">
                      {errors.password.message as string}
                    </p>
                  )}
                </div>

                {null}
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-primary to-primary/80 text-primary-foreground hover:from-primary/90 hover:to-primary disabled:opacity-70"
                disabled={isPending || isSubmitting}
              >
                {isPending || isSubmitting ? "Signing in…" : "Sign in"}
              </Button>

              {null}
            </form>
          </div>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            By signing in you agree to our
            <a className="mx-1 text-primary hover:underline" href="#">Terms</a>
            and
            <a className="ml-1 text-primary hover:underline" href="#">Privacy</a>.
          </p>
        </div>
      </div>
    </div>
  );
}

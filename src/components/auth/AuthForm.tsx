"use client";

import { useActionState } from "react";

type Action = (
  prev: unknown,
  formData: FormData,
) => Promise<{ error?: string } | undefined>;

export default function AuthForm({
  action,
  submitLabel,
}: {
  action: Action;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label className="field-label" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="field-input"
        />
      </div>
      <div>
        <label className="field-label" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={6}
          autoComplete="current-password"
          className="field-input"
        />
      </div>

      {state?.error && (
        <p className="font-body text-sm text-red-700">{state.error}</p>
      )}

      <button type="submit" disabled={pending} className="btn btn-primary w-full disabled:opacity-60">
        {pending ? "..." : submitLabel}
      </button>
    </form>
  );
}

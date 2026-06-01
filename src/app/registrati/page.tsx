import Link from "next/link";
import { redirect } from "next/navigation";
import AuthForm from "@/components/auth/AuthForm";
import { signUp } from "@/lib/actions/auth";
import { getUser } from "@/lib/auth/require-user";

export default async function RegistratiPage() {
  if (await getUser()) redirect("/calendario");

  return (
    <div className="mx-auto max-w-sm py-8">
      <h1 className="mb-1 font-head text-4xl font-bold">Registrati</h1>
      <p className="mb-6 font-body text-ink-soft">
        Crea un account per il tuo calendario personale.
      </p>
      <AuthForm action={signUp} submitLabel="Crea account" />
      <p className="mt-4 font-body text-sm text-ink-soft">
        Hai già un account?{" "}
        <Link href="/accedi" className="text-accent-deep underline">
          Accedi
        </Link>
      </p>
    </div>
  );
}

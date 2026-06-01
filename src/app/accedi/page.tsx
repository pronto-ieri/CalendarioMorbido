import Link from "next/link";
import { redirect } from "next/navigation";
import AuthForm from "@/components/auth/AuthForm";
import { signIn } from "@/lib/actions/auth";
import { getUser } from "@/lib/auth/require-user";

export default async function AccediPage() {
  if (await getUser()) redirect("/calendario");

  return (
    <div className="mx-auto max-w-sm py-8">
      <h1 className="mb-1 font-head text-4xl font-bold">Accedi</h1>
      <p className="mb-6 font-body text-ink-soft">
        Entra per salvare eventi e proporre pedalate.
      </p>
      <AuthForm action={signIn} submitLabel="Accedi" />
      <p className="mt-4 font-body text-sm text-ink-soft">
        Non hai un account?{" "}
        <Link href="/registrati" className="text-accent-deep underline">
          Registrati
        </Link>
      </p>
    </div>
  );
}

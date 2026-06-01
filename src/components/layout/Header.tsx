import Link from "next/link";
import { getUser, isAdmin } from "@/lib/auth/require-user";

export default async function Header() {
  const user = await getUser();
  const admin = user ? await isAdmin() : false;

  return (
    <header className="sticky top-0 z-20 border-b border-line bg-paper/90 backdrop-blur">
      <div className="flex items-center justify-between px-4 py-3">
        <Link href="/" className="font-head text-2xl font-bold leading-none">
          CalendarioMorbido
          <span className="ml-1 align-middle text-accent-deep">🚲</span>
        </Link>
        <nav className="flex items-center gap-3 font-body text-sm">
          <Link href="/mappa" className="hover:text-accent-deep">
            Mappa
          </Link>
          {user ? (
            <>
              <Link href="/calendario" className="hover:text-accent-deep">
                Il mio calendario
              </Link>
              <Link href="/proponi" className="hover:text-accent-deep">
                Proponi
              </Link>
              {admin && (
                <Link href="/gestore" className="hover:text-accent-deep">
                  Gestore
                </Link>
              )}
              <form action="/auth/signout" method="post">
                <button className="chip" type="submit">
                  Esci
                </button>
              </form>
            </>
          ) : (
            <Link href="/accedi" className="chip chip-active">
              Accedi
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}

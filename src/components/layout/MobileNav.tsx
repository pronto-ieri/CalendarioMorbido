"use client";

import { useState } from "react";
import Link from "next/link";

export default function MobileNav({
  authed,
  admin,
}: {
  authed: boolean;
  admin: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative sm:hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Menu"
        aria-expanded={open}
        className="chip text-lg leading-none"
      >
        {open ? "✕" : "☰"}
      </button>

      {open && (
        <>
          {/* backdrop per chiudere al tap fuori */}
          <button
            aria-hidden
            tabIndex={-1}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-10 cursor-default"
          />
          <nav
            onClick={() => setOpen(false)}
            className="absolute right-0 z-20 mt-2 flex w-52 flex-col gap-1 rounded-card border border-line bg-paper p-2 font-body text-sm shadow-md"
          >
            {authed ? (
              <>
                <Link href="/calendario" className="rounded-lg px-3 py-2 hover:bg-paper-soft">
                  Il mio calendario
                </Link>
                <Link href="/proponi" className="rounded-lg px-3 py-2 hover:bg-paper-soft">
                  Proponi un evento
                </Link>
                {admin && (
                  <Link href="/gestore" className="rounded-lg px-3 py-2 hover:bg-paper-soft">
                    Area gestore
                  </Link>
                )}
                <form action="/auth/signout" method="post">
                  <button
                    type="submit"
                    className="w-full rounded-lg px-3 py-2 text-left hover:bg-paper-soft"
                  >
                    Esci
                  </button>
                </form>
              </>
            ) : (
              <Link href="/accedi" className="rounded-lg px-3 py-2 hover:bg-paper-soft">
                Accedi
              </Link>
            )}
          </nav>
        </>
      )}
    </div>
  );
}

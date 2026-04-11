import Link from "next/link";
import { redirect } from "next/navigation";

import { LoginForm } from "@/components/admin/login-form";
import { BackgroundLayer } from "@/components/portfolio/background-layer";
import { getCurrentAdmin } from "@/lib/auth";

export default async function LoginPage() {
  const admin = await getCurrentAdmin();

  if (admin) {
    redirect("/admin");
  }

  return (
    <main className="relative isolate flex min-h-screen items-center px-4 py-10 sm:px-6">
      <BackgroundLayer />
      <div className="mx-auto w-full max-w-6xl">
        <div className="mb-10 flex items-center justify-between">
          <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--ui-soft)]">Admin access</p>
          <Link className="text-[11px] uppercase tracking-[0.24em] text-[color:var(--ui-soft)] hover:text-accent" href="/">
            Home
          </Link>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}

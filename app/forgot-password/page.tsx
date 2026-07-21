import type { Metadata } from "next";

import { ForgotPasswordForm } from "@/components/admin/forgot-password-form";
import { WorksFooter, WorksHeader } from "@/components/portfolio/makna-shell";

export const metadata: Metadata = {
  title: "Pemulihan Akun Admin",
  robots: { index: false, follow: false }
};

export default function ForgotPasswordPage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-[color:var(--surface-muted)] text-[color:var(--text)]">
      <WorksHeader active="login" />

      <section className="mx-auto grid min-h-[calc(100svh-5rem)] w-full max-w-7xl items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
        <div>
          <p className="text-[12px] font-black uppercase text-[#ff4f0a]">Account recovery</p>
          <h1 className="mt-5 text-[clamp(4rem,10vw,8.5rem)] font-black leading-[0.86] tracking-normal text-[color:var(--text)]">
            Recover your access.
          </h1>
          <p className="mt-8 max-w-xl text-[17px] font-medium leading-8 text-[color:var(--text)]/58 sm:text-[20px]">
            Enter your admin email and we will send a secure reset link to help you sign in again.
          </p>
        </div>

        <ForgotPasswordForm />
      </section>

      <WorksFooter />
    </main>
  );
}

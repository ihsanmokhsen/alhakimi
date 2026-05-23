import { ForgotPasswordForm } from "@/components/admin/forgot-password-form";
import { MaknaFooter, MaknaHeader } from "@/components/portfolio/makna-shell";

export default function ForgotPasswordPage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f5f5f7] text-[#08080a] [color-scheme:light]">
      <MaknaHeader active="login" />

      <section className="mx-auto grid min-h-[calc(100svh-5rem)] w-full max-w-7xl items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
        <div>
          <p className="text-[12px] font-black uppercase text-[#2563ff]">Account recovery</p>
          <h1 className="mt-5 text-[clamp(4rem,10vw,8.5rem)] font-black leading-[0.86] tracking-normal text-black">
            Recover your access.
          </h1>
          <p className="mt-8 max-w-xl text-[17px] font-medium leading-8 text-black/58 sm:text-[20px]">
            Enter your admin email and we will send a secure reset link to help you sign in again.
          </p>
        </div>

        <ForgotPasswordForm />
      </section>

      <MaknaFooter />
    </main>
  );
}

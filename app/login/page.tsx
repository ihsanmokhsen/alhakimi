import { redirect } from "next/navigation";

import { LoginForm } from "@/components/admin/login-form";
import { MaknaFooter, MaknaHeader } from "@/components/portfolio/makna-shell";
import { clearSessionCookie, getCurrentAdmin } from "@/lib/auth";

type LoginPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function getParam(value: string | string[] | undefined) {
  if (typeof value === "string") {
    return value;
  }

  if (Array.isArray(value)) {
    return value[0] || "";
  }

  return "";
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = searchParams ? await searchParams : {};
  const fresh = getParam(params.fresh).trim() === "1";
  const resetSuccess = getParam(params.reset).trim() === "success";

  if (fresh) {
    await clearSessionCookie();
  }

  const admin = await getCurrentAdmin();

  if (admin) {
    redirect("/admin");
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f5f5f7] text-[#08080a] [color-scheme:light]">
      <MaknaHeader active="login" />

      <section className="mx-auto grid min-h-[calc(100svh-5rem)] w-full max-w-7xl items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
        <div>
          <p className="text-[12px] font-black uppercase text-[#2563ff]">Admin access</p>
          <h1 className="mt-5 text-[clamp(4rem,10vw,8.5rem)] font-black leading-[0.86] tracking-normal text-black">
            Sign in to shape meaning.
          </h1>
          <p className="mt-8 max-w-xl text-[17px] font-medium leading-8 text-black/58 sm:text-[20px]">
            Secure access for managing works, stories, and the creative layer behind makna.im.
          </p>
        </div>

        <LoginForm notice={resetSuccess ? "Password berhasil diubah. Silakan login dengan password baru." : undefined} />
      </section>

      <MaknaFooter />
    </main>
  );
}

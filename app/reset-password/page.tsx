import { ResetPasswordForm } from "@/components/admin/reset-password-form";
import { MaknaFooter, MaknaHeader } from "@/components/portfolio/makna-shell";

type ResetPasswordPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function getToken(value: string | string[] | undefined) {
  if (typeof value === "string") {
    return value;
  }

  if (Array.isArray(value)) {
    return value[0] || "";
  }

  return "";
}

export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  const params = await searchParams;
  const token = getToken(params.token)?.trim();

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f5f5f7] text-[#08080a] [color-scheme:light]">
      <MaknaHeader active="login" />

      <section className="mx-auto grid min-h-[calc(100svh-5rem)] w-full max-w-7xl items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
        <div>
          <p className="text-[12px] font-black uppercase text-[#2563ff]">Security reset</p>
          <h1 className="mt-5 text-[clamp(4rem,10vw,8.5rem)] font-black leading-[0.86] tracking-normal text-black">
            Set a new password.
          </h1>
          <p className="mt-8 max-w-xl text-[17px] font-medium leading-8 text-black/58 sm:text-[20px]">
            Use a strong password with at least 8 characters to protect your admin account.
          </p>
        </div>

        {token ? (
          <ResetPasswordForm token={token} />
        ) : (
          <section className="mx-auto w-full max-w-md rounded-[28px] border border-black/[0.06] bg-white p-6 text-center shadow-[0_24px_90px_rgba(18,22,34,0.12)] sm:p-8">
            <p className="text-sm font-bold text-red-600">Reset token is missing. Please request a new password reset link.</p>
          </section>
        )}
      </section>

      <MaknaFooter />
    </main>
  );
}

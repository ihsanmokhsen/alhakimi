"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";

import { clearSessionCookie, setSessionCookie } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export type AuthFormState = {
  error?: string;
};

export async function loginAction(
  _previousState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "").trim();

  if (!username || !password) {
    return { error: "Please enter your username and password." };
  }

  const admin = await prisma.adminUser.findUnique({
    where: { username }
  });

  if (!admin || !(await bcrypt.compare(password, admin.passwordHash))) {
    return { error: "Incorrect username or password. Hint: asd" };
  }

  await setSessionCookie(admin.username);
  redirect("/admin");
}

export async function logoutAction() {
  await clearSessionCookie();
  redirect("/");
}

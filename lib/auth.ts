import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { createSessionToken, verifySessionToken } from "@/lib/auth-core";
import { prisma } from "@/lib/prisma";

const SESSION_COOKIE = "session";

export async function setSessionCookie(username: string) {
  const token = await createSessionToken(username);
  const store = await cookies();

  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 14
  });
}

export async function clearSessionCookie() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

export async function getCurrentAdmin() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;

  if (!token) {
    return null;
  }

  const username = await verifySessionToken(token);

  if (!username) {
    return null;
  }

  return prisma.adminUser.findUnique({
    where: { username }
  });
}

export async function requireAdmin() {
  const admin = await getCurrentAdmin();

  if (!admin) {
    redirect("/login");
  }

  return admin;
}

export { createSessionToken, verifySessionToken };

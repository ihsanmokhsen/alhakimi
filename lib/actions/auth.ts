"use server";

import bcrypt from "bcryptjs";
import { createHash, randomBytes } from "node:crypto";
import { redirect } from "next/navigation";
import { Resend } from "resend";

import { clearSessionCookie, setSessionCookie } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export type AuthFormState = {
  error?: string;
};

export type ForgotPasswordFormState = {
  error?: string;
  success?: string;
};

export type ResetPasswordFormState = {
  error?: string;
};

const PASSWORD_RESET_TOKEN_MINUTES = 15;

function hashResetToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function getAppUrl() {
  return process.env.APP_URL?.trim().replace(/\/+$/, "");
}

function getEmailFrom() {
  return process.env.EMAIL_FROM?.trim();
}

function getResendApiKey() {
  return process.env.RESEND_API_KEY?.trim();
}

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
    return { error: "Incorrect username or password." };
  }

  await setSessionCookie(admin.username);
  redirect("/admin");
}

export async function logoutAction() {
  await clearSessionCookie();
  redirect("/");
}

export async function forgotPasswordAction(
  _previousState: ForgotPasswordFormState,
  formData: FormData
): Promise<ForgotPasswordFormState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const success = "If your email exists in our system, we've sent a password reset link.";

  if (!email) {
    return { error: "Please enter your email." };
  }

  const admin = await prisma.adminUser.findUnique({
    where: { email }
  });

  if (!admin) {
    return { success };
  }

  const appUrl = getAppUrl();
  const from = getEmailFrom();
  const apiKey = getResendApiKey();

  if (!appUrl || !from || !apiKey) {
    console.error("Password reset email is not configured. Missing APP_URL, EMAIL_FROM, or RESEND_API_KEY.");
    if (process.env.NODE_ENV !== "production") {
      return { error: "Email reset belum dikonfigurasi. Isi APP_URL, EMAIL_FROM, dan RESEND_API_KEY di environment." };
    }
    return { success };
  }

  const token = randomBytes(32).toString("hex");
  const tokenHash = hashResetToken(token);
  const expiresAt = new Date(Date.now() + PASSWORD_RESET_TOKEN_MINUTES * 60 * 1000);

  await prisma.passwordResetToken.create({
    data: {
      tokenHash,
      adminUserId: admin.id,
      expiresAt
    }
  });

  const resetUrl = `${appUrl}/reset-password?token=${token}`;
  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from,
    to: email,
    subject: "Reset your password",
    html: `<p>We received a request to reset your admin password.</p><p><a href="${resetUrl}">Reset password</a></p><p>This link expires in ${PASSWORD_RESET_TOKEN_MINUTES} minutes.</p>`
  });

  if (error) {
    console.error("Failed to send password reset email:", error);
  }

  return { success };
}

export async function resetPasswordAction(
  _previousState: ResetPasswordFormState,
  formData: FormData
): Promise<ResetPasswordFormState> {
  const token = String(formData.get("token") ?? "").trim();
  const password = String(formData.get("password") ?? "").trim();
  const confirmPassword = String(formData.get("confirmPassword") ?? "").trim();

  if (!token) {
    return { error: "Reset token is missing or invalid." };
  }

  if (!password || !confirmPassword) {
    return { error: "Please complete all fields." };
  }

  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }

  if (password !== confirmPassword) {
    return { error: "Password confirmation does not match." };
  }

  const tokenHash = hashResetToken(token);
  const tokenRecord = await prisma.passwordResetToken.findFirst({
    where: {
      tokenHash,
      usedAt: null,
      expiresAt: {
        gt: new Date()
      }
    },
    include: {
      adminUser: {
        select: {
          email: true
        }
      }
    }
  });

  if (!tokenRecord) {
    return { error: "This reset link is invalid or expired." };
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.$transaction([
    prisma.adminUser.update({
      where: { id: tokenRecord.adminUserId },
      data: { passwordHash }
    }),
    prisma.passwordResetToken.update({
      where: { id: tokenRecord.id },
      data: { usedAt: new Date() }
    }),
    prisma.passwordResetToken.deleteMany({
      where: {
        adminUserId: tokenRecord.adminUserId,
        id: {
          not: tokenRecord.id
        }
      }
    })
  ]);

  const appUrl = getAppUrl();
  const from = getEmailFrom();
  const apiKey = getResendApiKey();
  const adminEmail = tokenRecord.adminUser.email?.trim().toLowerCase();

  if (adminEmail && from && apiKey) {
    const resend = new Resend(apiKey);
    const forgotPasswordUrl = appUrl ? `${appUrl}/forgot-password` : null;
    const loginUrl = appUrl ? `${appUrl}/login?fresh=1` : null;
    const { error } = await resend.emails.send({
      from,
      to: adminEmail,
      subject: "Your password was changed",
      html: [
        "<p>Your admin password has just been changed.</p>",
        "<p>If this was you, no action is needed.</p>",
        forgotPasswordUrl
          ? `<p>If this was not you, secure your account now: <a href="${forgotPasswordUrl}">Request a new reset link</a></p>`
          : "<p>If this was not you, immediately request a new reset link.</p>",
        loginUrl ? `<p>Sign in: <a href="${loginUrl}">Open login</a></p>` : ""
      ].join("")
    });

    if (error) {
      console.error("Failed to send password changed notification:", error);
    }
  }

  await clearSessionCookie();
  redirect("/login?reset=success&fresh=1");
}

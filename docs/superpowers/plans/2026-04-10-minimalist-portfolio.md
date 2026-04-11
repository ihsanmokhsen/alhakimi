# Minimalist Portfolio Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a deployable minimalist glassmorphism portfolio app with public project browsing, fullscreen modal details, and a small admin login plus CRUD backed by Prisma + SQLite.

**Architecture:** Use a single Next.js App Router application with server components for data reads and server actions for admin mutations. Prisma handles persistence with SQLite now, while the schema stays generic enough to move to Supabase Postgres later. Admin authentication uses one seeded admin account, password hashing, and cookie-based sessions.

**Tech Stack:** Next.js App Router, React, Tailwind CSS, Prisma, SQLite, server actions, Zod, bcryptjs, cookies API

---

## File Structure

- Create: `package.json`
- Create: `tsconfig.json`
- Create: `next.config.ts`
- Create: `postcss.config.mjs`
- Create: `eslint.config.mjs`
- Create: `.gitignore`
- Create: `.env.example`
- Create: `app/layout.tsx`
- Create: `app/globals.css`
- Create: `app/page.tsx`
- Create: `app/login/page.tsx`
- Create: `app/admin/page.tsx`
- Create: `app/admin/new/page.tsx`
- Create: `app/admin/[id]/edit/page.tsx`
- Create: `app/favicon.ico`
- Create: `components/ui/glass-card.tsx`
- Create: `components/portfolio/portfolio-grid.tsx`
- Create: `components/portfolio/portfolio-modal.tsx`
- Create: `components/portfolio/site-header.tsx`
- Create: `components/portfolio/site-footer.tsx`
- Create: `components/admin/project-form.tsx`
- Create: `components/admin/project-list.tsx`
- Create: `components/admin/login-form.tsx`
- Create: `lib/prisma.ts`
- Create: `lib/auth.ts`
- Create: `lib/actions/auth.ts`
- Create: `lib/actions/projects.ts`
- Create: `lib/data/projects.ts`
- Create: `lib/utils.ts`
- Create: `prisma/schema.prisma`
- Create: `prisma/seed.ts`
- Create: `middleware.ts`
- Create: `tests/lib/auth.test.ts`
- Create: `tests/lib/utils.test.ts`

### Task 1: Scaffold the app and install base dependencies

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `next.config.ts`
- Create: `postcss.config.mjs`
- Create: `eslint.config.mjs`
- Create: `.gitignore`
- Create: `.env.example`

- [ ] **Step 1: Create the package manifest with app, Prisma, auth, and test dependencies**

```json
{
  "name": "minimalist-portfolio",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint",
    "test": "vitest run",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev",
    "prisma:seed": "tsx prisma/seed.ts"
  }
}
```

- [ ] **Step 2: Install dependencies and verify lockfile generation**

Run: `npm install`
Expected: `package-lock.json` created and command exits with code `0`

- [ ] **Step 3: Add the standard Next.js TypeScript, ESLint, Tailwind, and env config files**

```ts
// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {};

export default nextConfig;
```

```env
# .env.example
DATABASE_URL="file:./dev.db"
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="change-me"
SESSION_SECRET="replace-with-a-long-random-string"
```

- [ ] **Step 4: Run lint once to confirm config is wired**

Run: `npm run lint`
Expected: command exits with code `0` or only reports missing app files that will be added in the next task

### Task 2: Define persistence and seed the admin plus starter projects

**Files:**
- Create: `prisma/schema.prisma`
- Create: `prisma/seed.ts`
- Create: `lib/prisma.ts`

- [ ] **Step 1: Write the failing auth utility test that expects a seeded admin-compatible shape**

```ts
import { describe, expect, it } from "vitest";

import { isValidProjectUrl } from "@/lib/utils";

describe("isValidProjectUrl", () => {
  it("accepts https portfolio project links", () => {
    expect(isValidProjectUrl("https://absenpagi-perbidang.vercel.app/")).toBe(true);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails because utilities do not exist yet**

Run: `npm test -- tests/lib/utils.test.ts`
Expected: FAIL with module-not-found or missing export error

- [ ] **Step 3: Add the Prisma schema and seed logic**

```prisma
model Project {
  id          String   @id @default(cuid())
  title       String
  url         String   @unique
  description String
  category    String
  featured    Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model AdminUser {
  id           String   @id @default(cuid())
  username     String   @unique
  passwordHash String
  createdAt    DateTime @default(now())
}
```

```ts
await prisma.project.upsert({
  where: { url: "https://absenpagi-perbidang.vercel.app/" },
  update: {},
  create: {
    title: "Absen Pagi Perbidang",
    url: "https://absenpagi-perbidang.vercel.app/",
    description: "Aplikasi absensi internal dengan alur harian yang ringkas dan fokus.",
    category: "Web App",
    featured: true
  }
});
```

- [ ] **Step 4: Add the minimal utility implementation and verify the test passes**

```ts
export function isValidProjectUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:";
  } catch {
    return false;
  }
}
```

Run: `npm test -- tests/lib/utils.test.ts`
Expected: PASS

### Task 3: Build shared auth and request guards

**Files:**
- Create: `lib/auth.ts`
- Create: `middleware.ts`
- Create: `tests/lib/auth.test.ts`

- [ ] **Step 1: Write the failing test for session signing and verification**

```ts
import { describe, expect, it } from "vitest";

import { verifySessionToken } from "@/lib/auth";

describe("verifySessionToken", () => {
  it("returns null for malformed tokens", async () => {
    await expect(verifySessionToken("bad-token")).resolves.toBeNull();
  });
});
```

- [ ] **Step 2: Run the auth test to verify it fails**

Run: `npm test -- tests/lib/auth.test.ts`
Expected: FAIL with missing module or missing function error

- [ ] **Step 3: Implement cookie session helpers and admin route middleware**

```ts
export async function verifySessionToken(token: string) {
  const [username, signature] = token.split(".");

  if (!username || !signature) {
    return null;
  }

  return safeEqual(signature, await signValue(username)) ? username : null;
}
```

```ts
if (request.nextUrl.pathname.startsWith("/admin")) {
  const token = request.cookies.get("session")?.value;
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
}
```

- [ ] **Step 4: Re-run the auth test**

Run: `npm test -- tests/lib/auth.test.ts`
Expected: PASS

### Task 4: Create the global visual system and public layout

**Files:**
- Create: `app/layout.tsx`
- Create: `app/globals.css`
- Create: `components/portfolio/site-header.tsx`
- Create: `components/portfolio/site-footer.tsx`
- Create: `components/ui/glass-card.tsx`

- [ ] **Step 1: Add the layout shell and CSS variables for the dark glass visual language**

```css
:root {
  --background: #0b0b0b;
  --foreground: #ffffff;
  --accent: #f44a22;
  --glass: rgba(255, 255, 255, 0.08);
  --glass-border: rgba(255, 255, 255, 0.14);
}
```

- [ ] **Step 2: Implement the reusable glass container**

```tsx
export function GlassCard({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-white/10 bg-white/5 backdrop-blur-2xl shadow-[0_20px_80px_rgba(0,0,0,0.45)]",
        className
      )}
      {...props}
    />
  );
}
```

- [ ] **Step 3: Add the public header and footer with small login affordance**

```tsx
<header className="sticky top-4 z-30">
  <GlassCard className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
    <h1 className="text-sm font-medium tracking-[0.18em] text-white/92 sm:text-base">
      Muhammad Ihsanul Hakim Mokhsen
    </h1>
    <Link className="text-xs text-white/55 transition hover:text-[#F44A22]" href="/login">
      Login
    </Link>
  </GlassCard>
</header>
```

- [ ] **Step 4: Run lint to verify the shared UI shell compiles**

Run: `npm run lint`
Expected: no syntax or import errors

### Task 5: Build the portfolio grid and fullscreen modal flow

**Files:**
- Create: `app/page.tsx`
- Create: `components/portfolio/portfolio-grid.tsx`
- Create: `components/portfolio/portfolio-modal.tsx`
- Create: `lib/data/projects.ts`

- [ ] **Step 1: Write the failing page-level test or use build verification for interactive render path**

Run: `npm run build`
Expected: FAIL initially because portfolio page and imports are not complete yet

- [ ] **Step 2: Implement server-side project loading and client modal state**

```ts
export async function getProjects() {
  return prisma.project.findMany({
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }]
  });
}
```

```tsx
const [activeProject, setActiveProject] = useState<Project | null>(null);
```

- [ ] **Step 3: Render large-type cards and fullscreen glass modal**

```tsx
<button
  onClick={() => setActiveProject(project)}
  className="group text-left transition-transform duration-500 hover:-translate-y-1"
>
  <GlassCard className="min-h-[240px] p-6 sm:p-8">
    <p className="text-xs uppercase tracking-[0.24em] text-white/45">{project.category}</p>
    <h2 className="mt-10 max-w-[12ch] text-3xl font-semibold tracking-tight text-white sm:text-4xl">
      {project.title}
    </h2>
  </GlassCard>
</button>
```

- [ ] **Step 4: Re-run the production build**

Run: `npm run build`
Expected: PASS

### Task 6: Add login page and admin authentication action

**Files:**
- Create: `app/login/page.tsx`
- Create: `components/admin/login-form.tsx`
- Create: `lib/actions/auth.ts`

- [ ] **Step 1: Write the failing auth action test indirectly through existing auth test inputs**

Run: `npm test -- tests/lib/auth.test.ts`
Expected: FAIL if login helpers for cookies and password validation are not complete yet

- [ ] **Step 2: Implement admin login action**

```ts
export async function loginAction(_: FormState, formData: FormData): Promise<FormState> {
  const username = String(formData.get("username") ?? "");
  const password = String(formData.get("password") ?? "");

  const admin = await prisma.adminUser.findUnique({ where: { username } });

  if (!admin || !(await bcrypt.compare(password, admin.passwordHash))) {
    return { error: "Username atau password salah." };
  }

  await setSessionCookie(username);
  redirect("/admin");
}
```

- [ ] **Step 3: Re-run the auth test and lint**

Run: `npm test -- tests/lib/auth.test.ts && npm run lint`
Expected: PASS for tests and lint

### Task 7: Implement admin CRUD pages with server actions

**Files:**
- Create: `app/admin/page.tsx`
- Create: `app/admin/new/page.tsx`
- Create: `app/admin/[id]/edit/page.tsx`
- Create: `components/admin/project-form.tsx`
- Create: `components/admin/project-list.tsx`
- Create: `lib/actions/projects.ts`

- [ ] **Step 1: Write the failing validation test for project URLs if more rules were added**

```ts
import { describe, expect, it } from "vitest";

import { isValidProjectUrl } from "@/lib/utils";

describe("isValidProjectUrl", () => {
  it("rejects non-https URLs", () => {
    expect(isValidProjectUrl("http://example.com")).toBe(false);
  });
});
```

- [ ] **Step 2: Run the URL validation test to verify it fails if the rule is missing**

Run: `npm test -- tests/lib/utils.test.ts`
Expected: FAIL until the validator rejects `http`

- [ ] **Step 3: Add create, update, and delete server actions plus the admin pages**

```ts
const projectSchema = z.object({
  title: z.string().min(1),
  url: z.string().url().refine(isValidProjectUrl, "Gunakan URL https://"),
  description: z.string().min(1),
  category: z.string().min(1),
  featured: z.boolean()
});
```

```ts
await prisma.project.create({
  data: parsed.data
});
```

- [ ] **Step 4: Re-run tests and lint**

Run: `npm test -- tests/lib/utils.test.ts && npm run lint`
Expected: PASS

### Task 8: Final verification for deploy readiness

**Files:**
- Verify: entire workspace

- [ ] **Step 1: Generate Prisma client and seed the database**

Run: `npx prisma generate && npm run prisma:seed`
Expected: Prisma client generated and seed inserts admin plus starter projects

- [ ] **Step 2: Run the full test suite**

Run: `npm test`
Expected: all tests pass

- [ ] **Step 3: Run lint and production build**

Run: `npm run lint && npm run build`
Expected: both commands exit with code `0`

- [ ] **Step 4: Smoke-check the app locally**

Run: `npm run dev`
Expected: local server starts and routes `/`, `/login`, and `/admin` respond

# Agents

Operational guide for building reliable, accessible, and type-safe features with Next.js 16, Biome, Zod, Tailwind, and Zustand.

## Purpose

Predictable APIs, minimal surface area, fast iteration, and AI-friendly patterns.

## Principles

* Single API envelope: `{ success, error, data }`
* Server-first architecture; client code is intentional
* Runtime validation at boundaries
* Utilities over comments
* Small, composable modules

## Stack

Next.js 16 App Router
TypeScript + Biome
Zod for validation
Tailwind for UI
Zustand for client state

## Structure

```
app/
  api/**/route.ts
  (routes, layouts, metadata)
components/
lib/
schemas/
stores/
```

## API Contract

All APIs and server actions return the same shape.

```ts
export type ApiOk<T> = { success: true; error: null; data: T };
export type ApiErr = { success: false; error: string; data: null };
export type ApiResult<T> = ApiOk<T> | ApiErr;

export function ok<T>(data: T, init?: ResponseInit) {
  return Response.json<ApiOk<T>>({ success: true, error: null, data }, init);
}

export function err(message: string, init?: ResponseInit) {
  return Response.json<ApiErr>({ success: false, error: message, data: null }, init);
}
```

## Route Handler Template

```ts
import { z } from "zod";
import { ok, err } from "@/lib/api";

const Params = z.object({ id: z.string().uuid() });

export async function GET(_: Request, ctx: { params: unknown }) {
  const parsed = Params.safeParse(ctx.params);
  if (!parsed.success) return err("invalid_params", { status: 400 });

  try {
    const user = await getUser(parsed.data.id);
    return ok(user, { status: 200 });
  } catch {
    return err("internal_error", { status: 500 });
  }
}
```

## Server Action Template

```ts
"use server";

import { z } from "zod";
import { ok, err } from "@/lib/api";

const Input = z.object({ email: z.string().email() });

export async function subscribe(input: unknown) {
  const parsed = Input.safeParse(input);
  if (!parsed.success) return err("invalid_input");

  try {
    const result = await doSubscribe(parsed.data.email);
    return ok(result);
  } catch {
    return err("internal_error");
  }
}
```

## Validation

* Schemas live in `schemas/**`
* Inputs are parsed immediately with `parse` or `safeParse`
* Types are inferred from schemas

```ts
import { z } from "zod";

export const CreatePost = z.object({
  title: z.string().min(1).max(120),
  body: z.string().min(1),
});
export type CreatePost = z.infer<typeof CreatePost>;
```

## State Management

Zustand is for client-only UI state.

```ts
import { create } from "zustand";

type UiState = {
  sidebarOpen: boolean;
  open: () => void;
  close: () => void;
};

export const useUi = create<UiState>((set) => ({
  sidebarOpen: false,
  open: () => set({ sidebarOpen: true }),
  close: () => set({ sidebarOpen: false }),
}));
```

Selectors minimize re-renders.

```ts
const sidebarOpen = useUi((s) => s.sidebarOpen);
```

## Tailwind

* Use tokens; extend theme when needed
* Class order: layout, box, typography, visual, state, responsive, dark
* Prefer utility composition or small helpers

```tsx
export function Button(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className="inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium shadow-sm ring-1 ring-black/5 hover:shadow transition"
    />
  );
}
```

## Accessibility

* Valid, navigable anchors with discernible names
* Buttons have `type` and are focusable
* No positive `tabIndex`
* No `aria-hidden` on focusable elements
* Media has tracks
* SVG has `<title>`
* `html` has `lang`
* `iframe` has `title`

## React Conventions

* Server Components by default
* Client Components require `use client`
* Hooks at top level with complete dependency arrays
* Stable keys, not array indices
* One component per file
* Children via JSX

## Env and Security

* Validate env once at startup with Zod
* Only expose `NEXT_PUBLIC_*` when required
* No secrets in client bundles
* No raw console output in production; use a small logger that no-ops or ships to telemetry

```ts
export function reportError(event: string, err: unknown) {
  if (process.env.NODE_ENV !== "production") {
    console.error(event, err);
    return;
  }
  void sendToTelemetry(event, err);
}
```

## Testing

* No focused or skipped tests in commits
* Assertions live inside `it` or `test`
* Async tests use `async` and `await`
* Prefer integration tests for route handlers and server actions

## Biome

* Format and lint with Biome
* CI uses `bun biome check`
* Local autofix uses `bun biome check --write`

## Commands

```
bun ultracite init
bun ultracite fix
bun ultracite check
```

## PR Checklist

* API returns `{ success, error, data }`
* Inputs validated with Zod at boundaries
* No inline comments added to silence linters
* No console in production paths
* a11y checks pass for interactive elements
* Biome passes locally
* Tests updated or added

---

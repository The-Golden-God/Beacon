import type { auth } from "./lib/auth.js";

export type AppSession = NonNullable<Awaited<ReturnType<typeof auth.api.getSession>>>;
export type AppUser = AppSession["user"];

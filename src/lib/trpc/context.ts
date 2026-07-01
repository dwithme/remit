import { headers } from "next/headers";
import { t } from "./trpc";
import { auth } from "@/lib/auth";
import { TRPCError } from "@trpc/server";
import { getSettings } from "@/lib/settings";

export const createTRPCContext = async (): Promise<TRPCContext> => {
  const requestHeaders = await headers();
  const [session, settings] = await Promise.all([
    auth.api.getSession({ headers: requestHeaders }),
    getSettings(),
  ]);

  return { user: session?.user || null, settings };
};

export type TRPCContext = {
  user: typeof auth.$Infer.Session.user | null;
  settings: Awaited<ReturnType<typeof getSettings>>;
};

export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Unauthorized" });
  }

  return next();
});

const parseWhitelist = (raw: string | null | undefined) => {
  return (raw ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
};

export const whitelistedProcedure = protectedProcedure.use(({ ctx, next }) => {
  const whitelist = parseWhitelist(ctx.settings.emailWhitelist);
  const email = (ctx.user?.email ?? "").toLowerCase();

  if (whitelist.length > 0 && (!email || !whitelist.includes(email))) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Email not allowed",
    });
  }

  return next();
});

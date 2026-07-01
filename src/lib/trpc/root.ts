import { t } from "@/lib/trpc/trpc";
import { settingsRouter } from "./routes/settings";
import { appsRouter } from "./routes/apps";
import { analyticsRouter } from "./routes/analytics";

export const appRouter = t.router({
  settings: settingsRouter,
  apps: appsRouter,
  analytics: analyticsRouter,
});

export type AppRouter = typeof appRouter;

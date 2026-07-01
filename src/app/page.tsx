"use client";

import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6">
      <Logo width={160} height={160} className="size-40" priority />
      <Button
        onClick={() =>
          authClient.signIn.social({
            provider: "google",
            callbackURL: "/dashboard",
          })
        }
      >
        Login with Google
      </Button>
    </div>
  );
}

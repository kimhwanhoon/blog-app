"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { setUsernameAction } from "./actions";

export function OnboardingForm({ initialName }: { initialName: string }) {
  const router = useRouter();
  const t = useTranslations("onboarding");
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState(initialName);
  const [pending, startTransition] = useTransition();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        startTransition(async () => {
          const res = await setUsernameAction({ username, displayName });
          if (!res.ok) {
            toast.error(res.error);
            return;
          }
          toast.success(t("saveSuccess"));
          router.push("/dashboard");
          router.refresh();
        });
      }}
      className="space-y-4"
    >
      <div className="space-y-1.5">
        <Label htmlFor="username">{t("username")}</Label>
        <Input
          id="username"
          value={username}
          onChange={(e) => setUsername(e.target.value.toLowerCase())}
          placeholder={t("usernamePlaceholder")}
          autoComplete="off"
          required
          minLength={3}
          maxLength={20}
          pattern="[a-z0-9_]+"
        />
        <p className="text-xs text-muted-foreground">{t("usernameHint")}</p>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="displayName">{t("displayName")}</Label>
        <Input
          id="displayName"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          required
        />
      </div>
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? t("submitting") : t("submit")}
      </Button>
    </form>
  );
}

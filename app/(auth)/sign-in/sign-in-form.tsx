"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn } from "@/lib/auth-client";

export function SignInForm({ redirectTo }: { redirectTo?: string }) {
  const router = useRouter();
  const t = useTranslations("auth");
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const email = String(data.get("email"));
    const password = String(data.get("password"));
    setPending(true);
    const { error } = await signIn.email({ email, password });
    setPending(false);
    if (error) {
      toast.error(error.message ?? t("signInError"));
      return;
    }
    toast.success(t("signInSuccess"));
    router.push(redirectTo ?? "/dashboard");
    router.refresh();
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2 text-center">
        <h1 className="font-heading text-3xl font-medium tracking-tight">
          {t("signInTitle")}
        </h1>
        <p className="text-sm text-muted-foreground">{t("signInSubtitle")}</p>
      </div>
      <form onSubmit={onSubmit} className="space-y-5">
        <div className="space-y-1.5">
          <Label htmlFor="email">{t("email")}</Label>
          <Input id="email" name="email" type="email" autoComplete="email" required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">{t("password")}</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            minLength={8}
          />
        </div>
        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? t("signInPending") : t("signInAction")}
        </Button>
      </form>
      <p className="text-center text-sm text-muted-foreground">
        {t("noAccount")}{" "}
        <Link
          href="/sign-up"
          className="text-foreground underline underline-offset-4"
        >
          {t("signUpLink")}
        </Link>
      </p>
    </div>
  );
}

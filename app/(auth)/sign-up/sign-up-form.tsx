"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signUp } from "@/lib/auth-client";

export function SignUpForm() {
  const router = useRouter();
  const t = useTranslations("auth");
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const name = String(data.get("name"));
    const email = String(data.get("email"));
    const password = String(data.get("password"));
    setPending(true);
    const { error } = await signUp.email({ name, email, password });
    setPending(false);
    if (error) {
      toast.error(error.message ?? t("signUpError"));
      return;
    }
    toast.success(t("signUpSuccess"));
    router.push("/onboarding");
    router.refresh();
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2 text-center">
        <h1 className="font-heading text-3xl font-medium tracking-tight">
          {t("signUpTitle")}
        </h1>
        <p className="text-sm text-muted-foreground">{t("signUpSubtitle")}</p>
      </div>
      <form onSubmit={onSubmit} className="space-y-5">
        <div className="space-y-1.5">
          <Label htmlFor="name">{t("name")}</Label>
          <Input id="name" name="name" required />
        </div>
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
            autoComplete="new-password"
            required
            minLength={8}
          />
        </div>
        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? t("signUpPending") : t("signUpAction")}
        </Button>
      </form>
      <p className="text-center text-sm text-muted-foreground">
        {t("haveAccount")}{" "}
        <Link
          href="/sign-in"
          className="text-foreground underline underline-offset-4"
        >
          {t("signInLink")}
        </Link>
      </p>
    </div>
  );
}

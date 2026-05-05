"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("errors");
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-5 px-6 text-center">
      <h1 className="font-heading text-3xl font-medium tracking-tight">
        {t("errorTitle")}
      </h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        {t("errorDescription")}
      </p>
      <div className="mt-2 flex gap-2">
        <Button size="sm" onClick={() => reset()}>
          {t("tryAgain")}
        </Button>
        <Button asChild size="sm" variant="outline">
          <Link href="/">{t("goHome")}</Link>
        </Button>
      </div>
    </div>
  );
}

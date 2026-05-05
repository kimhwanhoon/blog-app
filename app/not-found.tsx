import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";

export default async function NotFound() {
  const t = await getTranslations("errors");
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-5 px-6 text-center">
      <p className="font-heading text-7xl font-medium tracking-tight text-muted-foreground">
        404
      </p>
      <h1 className="font-heading text-2xl font-medium tracking-tight">
        {t("notFoundTitle")}
      </h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        {t("notFoundDescription")}
      </p>
      <Button asChild variant="outline" size="sm" className="mt-2">
        <Link href="/">{t("goHome")}</Link>
      </Button>
    </div>
  );
}

import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/shared/header";

export default async function HomePage() {
  const t = await getTranslations("landing");
  return (
    <>
      <Header />
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center gap-8 px-6 py-24 text-center">
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          {t("title")}
        </h1>
        <p className="max-w-xl text-lg text-muted-foreground">
          {t("description")}
        </p>
        <div className="flex gap-3">
          <Button asChild size="lg">
            <Link href="/sign-up">{t("ctaSignUp")}</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/feed">{t("ctaFeed")}</Link>
          </Button>
        </div>
      </main>
    </>
  );
}

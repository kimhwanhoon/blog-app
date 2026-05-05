import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/shared/header";
import { Footer } from "@/components/shared/footer";
import { getLatestPublished } from "@/db/queries/posts";
import { formatDate } from "@/lib/utils-app";

export default async function HomePage() {
  const t = await getTranslations("landing");

  let latest: Awaited<ReturnType<typeof getLatestPublished>> = [];
  try {
    latest = await getLatestPublished(6);
  } catch {
    // DB not connected — show empty state
  }

  return (
    <>
      <Header />
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-6">
        <section className="flex flex-col items-center gap-6 py-24 text-center sm:py-32">
          <h1 className="font-heading text-4xl font-medium leading-tight tracking-tight sm:text-6xl">
            {t("title")}
          </h1>
          <p className="max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
            {t("description")}
          </p>
          <div className="mt-2 flex gap-3">
            <Button asChild size="lg">
              <Link href="/sign-up">{t("ctaSignUp")}</Link>
            </Button>
            <Button asChild variant="ghost" size="lg">
              <Link href="/feed">{t("ctaFeed")}</Link>
            </Button>
          </div>
        </section>

        <section className="border-t border-border/70 pb-24 pt-12">
          <div className="mb-6 flex items-baseline justify-between">
            <h2 className="font-heading text-2xl font-medium tracking-tight">
              {t("latest")}
            </h2>
          </div>
          {latest.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              {t("latestEmpty")}
            </p>
          ) : (
            <ul className="divide-y divide-border/70">
              {latest.map((p) => (
                <li key={p.id}>
                  <Link
                    href={`/@${p.authorUsername}/${p.slug}`}
                    className="grid gap-1 py-5 transition-colors hover:bg-accent/40 -mx-3 px-3 rounded-md"
                  >
                    <div className="flex items-baseline justify-between gap-4">
                      <h3 className="font-heading text-lg font-medium leading-snug tracking-tight">
                        {p.title || "(Untitled)"}
                      </h3>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {p.publishedAt ? formatDate(p.publishedAt) : ""}
                      </span>
                    </div>
                    {p.excerpt ? (
                      <p className="line-clamp-2 text-sm text-muted-foreground">
                        {p.excerpt}
                      </p>
                    ) : null}
                    <p className="text-xs text-muted-foreground">
                      {p.authorName ?? `@${p.authorUsername}`}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}

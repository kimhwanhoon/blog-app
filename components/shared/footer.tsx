import Link from "next/link";
import { getTranslations } from "next-intl/server";

export async function Footer() {
  const t = await getTranslations();
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-border/60">
      <div className="mx-auto flex w-full max-w-5xl flex-col items-start justify-between gap-2 px-4 py-8 text-xs text-muted-foreground sm:flex-row sm:items-center">
        <div className="flex items-center gap-2">
          <span className="font-heading text-sm tracking-tight text-foreground/80">
            {t("common.appName")}
          </span>
          <span>·</span>
          <span>{year}</span>
          <span>·</span>
          <span>{t("footer.tagline")}</span>
        </div>
        <nav className="flex items-center gap-4">
          <Link href="/" className="hover:text-foreground">
            {t("footer.links.about")}
          </Link>
          <Link href="/" className="hover:text-foreground">
            {t("footer.links.terms")}
          </Link>
          <Link href="/" className="hover:text-foreground">
            {t("footer.links.privacy")}
          </Link>
        </nav>
      </div>
    </footer>
  );
}

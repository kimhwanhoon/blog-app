import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./theme-toggle";
import { UserMenu } from "./user-menu";
import { getSession } from "@/lib/session";

export async function Header() {
  const session = await getSession();
  const t = await getTranslations();
  return (
    <header className="sticky top-0 z-30 w-full border-b border-border/60 bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <Link
          href="/"
          className="font-heading text-lg tracking-tight"
        >
          {t("common.appName")}
        </Link>
        <nav className="flex items-center gap-1">
          {session ? (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link href="/feed">{t("header.feed")}</Link>
              </Button>
              <Button asChild variant="ghost" size="sm">
                <Link href="/dashboard">{t("header.dashboard")}</Link>
              </Button>
              <ThemeToggle />
              <UserMenu
                username={session.user.username ?? null}
                name={session.user.name}
                email={session.user.email}
                image={session.user.image ?? null}
              />
            </>
          ) : (
            <>
              <ThemeToggle />
              <Button asChild variant="ghost" size="sm">
                <Link href="/sign-in">{t("header.signIn")}</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/sign-up">{t("header.getStarted")}</Link>
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

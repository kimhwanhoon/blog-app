import Link from "next/link";
import { getTranslations } from "next-intl/server";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = await getTranslations("common");
  return (
    <div className="flex min-h-svh flex-col">
      <div className="border-b border-border/60">
        <div className="mx-auto flex h-14 max-w-5xl items-center px-4">
          <Link
            href="/"
            className="font-heading text-lg tracking-tight"
          >
            {t("appName")}
          </Link>
        </div>
      </div>
      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  );
}

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
      <div className="border-b border-border">
        <div className="mx-auto flex h-14 max-w-5xl items-center px-4">
          <Link href="/" className="text-base font-semibold">
            {t("appName")}
          </Link>
        </div>
      </div>
      <div className="flex flex-1 items-center justify-center px-4 py-10">
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  );
}

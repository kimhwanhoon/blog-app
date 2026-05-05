import { eq } from "drizzle-orm";
import { getTranslations } from "next-intl/server";
import { db } from "@/db/client";
import { user as userTable } from "@/db/schema";
import { requireOnboardedUser } from "@/lib/session";
import { SettingsForm } from "./settings-form";

export default async function SettingsPage() {
  const session = await requireOnboardedUser();
  const [u] = await db
    .select()
    .from(userTable)
    .where(eq(userTable.id, session.user.id))
    .limit(1);
  const t = await getTranslations("settings");

  return (
    <div className="mx-auto max-w-md space-y-8">
      <h1 className="font-heading text-3xl font-medium tracking-tight">
        {t("title")}
      </h1>
      <SettingsForm
        user={{
          username: u.username ?? "",
          displayName: u.displayName ?? u.name,
          bio: u.bio ?? "",
          image: u.image ?? null,
        }}
      />
    </div>
  );
}

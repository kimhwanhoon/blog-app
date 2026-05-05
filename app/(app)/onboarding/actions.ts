"use server";

import { eq } from "drizzle-orm";
import { getTranslations } from "next-intl/server";
import { z } from "zod";
import { db } from "@/db/client";
import { user } from "@/db/schema";
import { requireUser } from "@/lib/session";
import { isValidUsername } from "@/lib/utils-app";

const Schema = z.object({
  username: z.string(),
  displayName: z.string().min(1).max(50),
});

export async function setUsernameAction(input: {
  username: string;
  displayName: string;
}) {
  const t = await getTranslations("onboarding");
  const parsed = Schema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: t("invalidInput") };

  const { username, displayName } = parsed.data;
  if (!isValidUsername(username))
    return { ok: false as const, error: t("invalidUsername") };

  const session = await requireUser();

  const existing = await db
    .select({ id: user.id })
    .from(user)
    .where(eq(user.username, username))
    .limit(1);

  if (existing.length > 0 && existing[0].id !== session.user.id)
    return { ok: false as const, error: t("usernameTaken") };

  await db
    .update(user)
    .set({ username, displayName, updatedAt: new Date() })
    .where(eq(user.id, session.user.id));

  return { ok: true as const };
}

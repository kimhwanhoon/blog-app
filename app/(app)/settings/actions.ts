"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getTranslations } from "next-intl/server";
import { z } from "zod";
import { db } from "@/db/client";
import { user } from "@/db/schema";
import { requireOnboardedUser } from "@/lib/session";

const Schema = z.object({
  displayName: z.string().min(1).max(50),
  bio: z.string().max(280).optional(),
  image: z.string().url().nullable().optional(),
});

export async function saveProfileAction(input: z.input<typeof Schema>) {
  const t = await getTranslations("settings");
  const parsed = Schema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: t("invalidInput") };
  const session = await requireOnboardedUser();
  await db
    .update(user)
    .set({
      displayName: parsed.data.displayName,
      bio: parsed.data.bio ?? null,
      image: parsed.data.image ?? null,
      updatedAt: new Date(),
    })
    .where(eq(user.id, session.user.id));
  revalidatePath(`/@${session.user.username}`);
  revalidatePath("/settings");
  return { ok: true as const };
}

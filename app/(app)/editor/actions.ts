"use server";

import { and, eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { revalidatePath } from "next/cache";
import { getTranslations } from "next-intl/server";
import { z } from "zod";
import { db } from "@/db/client";
import { post, postTag, tag } from "@/db/schema";
import { requireOnboardedUser } from "@/lib/session";
import { slugify } from "@/lib/utils-app";

const emptyPlate = [{ type: "p", children: [{ text: "" }] }];

export async function createDraftAction() {
  const session = await requireOnboardedUser();
  const id = nanoid(12);
  const slug = `draft-${id}`;
  await db.insert(post).values({
    id,
    authorId: session.user.id,
    title: "",
    slug,
    contentJson: emptyPlate,
    contentHtml: "",
    status: "draft",
  });
  revalidatePath("/dashboard");
  return { ok: true as const, postId: id };
}

const SaveSchema = z.object({
  postId: z.string(),
  title: z.string().max(200),
  excerpt: z.string().max(280).optional(),
  contentJson: z.unknown(),
  contentHtml: z.string(),
  coverImageUrl: z.string().url().optional().nullable(),
  tags: z.array(z.string().min(1).max(30)).max(10).optional(),
});

export async function savePostAction(input: z.input<typeof SaveSchema>) {
  const t = await getTranslations("editor");
  const parsed = SaveSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: t("invalidInput") };

  const session = await requireOnboardedUser();
  const existing = await db
    .select()
    .from(post)
    .where(and(eq(post.id, parsed.data.postId), eq(post.authorId, session.user.id)))
    .limit(1);
  if (existing.length === 0)
    return { ok: false as const, error: t("notFound") };

  await db
    .update(post)
    .set({
      title: parsed.data.title,
      excerpt: parsed.data.excerpt ?? null,
      contentJson: parsed.data.contentJson,
      contentHtml: parsed.data.contentHtml,
      coverImageUrl: parsed.data.coverImageUrl ?? null,
      updatedAt: new Date(),
    })
    .where(eq(post.id, parsed.data.postId));

  if (parsed.data.tags) {
    await syncTags(parsed.data.postId, parsed.data.tags);
  }

  revalidatePath(`/@${session.user.username}/${existing[0].slug}`);
  revalidatePath("/dashboard");
  return { ok: true as const };
}

const PublishSchema = SaveSchema.extend({
  slug: z.string().min(1).max(80),
});

export async function publishPostAction(input: z.input<typeof PublishSchema>) {
  const t = await getTranslations("editor");
  const parsed = PublishSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: t("invalidInput") };

  const session = await requireOnboardedUser();
  const targetSlug = slugify(parsed.data.slug) || parsed.data.postId;

  const existing = await db
    .select()
    .from(post)
    .where(and(eq(post.id, parsed.data.postId), eq(post.authorId, session.user.id)))
    .limit(1);
  if (existing.length === 0)
    return { ok: false as const, error: t("notFound") };

  const conflict = await db
    .select({ id: post.id })
    .from(post)
    .where(and(eq(post.authorId, session.user.id), eq(post.slug, targetSlug)))
    .limit(1);
  if (conflict.length > 0 && conflict[0].id !== parsed.data.postId)
    return { ok: false as const, error: t("slugConflict") };

  await db
    .update(post)
    .set({
      title: parsed.data.title,
      slug: targetSlug,
      excerpt: parsed.data.excerpt ?? null,
      contentJson: parsed.data.contentJson,
      contentHtml: parsed.data.contentHtml,
      coverImageUrl: parsed.data.coverImageUrl ?? null,
      status: "published",
      publishedAt: existing[0].publishedAt ?? new Date(),
      updatedAt: new Date(),
    })
    .where(eq(post.id, parsed.data.postId));

  if (parsed.data.tags) {
    await syncTags(parsed.data.postId, parsed.data.tags);
  }

  revalidatePath("/dashboard");
  revalidatePath(`/@${session.user.username}`);
  revalidatePath(`/@${session.user.username}/${targetSlug}`);
  return { ok: true as const, slug: targetSlug, username: session.user.username };
}

export async function deletePostAction(postId: string) {
  const session = await requireOnboardedUser();
  await db
    .delete(post)
    .where(and(eq(post.id, postId), eq(post.authorId, session.user.id)));
  revalidatePath("/dashboard");
  revalidatePath(`/@${session.user.username}`);
  return { ok: true as const };
}

async function syncTags(postId: string, names: string[]) {
  await db.delete(postTag).where(eq(postTag.postId, postId));
  if (names.length === 0) return;
  const normalized = Array.from(
    new Set(names.map((n) => n.trim()).filter(Boolean)),
  );
  for (const name of normalized) {
    const slug = slugify(name) || name;
    const id = nanoid(10);
    await db
      .insert(tag)
      .values({ id, name, slug })
      .onConflictDoNothing({ target: tag.name });
    const existing = await db
      .select({ id: tag.id })
      .from(tag)
      .where(eq(tag.name, name))
      .limit(1);
    if (existing[0]) {
      await db
        .insert(postTag)
        .values({ postId, tagId: existing[0].id })
        .onConflictDoNothing();
    }
  }
}

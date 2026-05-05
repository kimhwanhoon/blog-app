"use server";

import { and, eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { revalidatePath } from "next/cache";
import { getTranslations } from "next-intl/server";
import { z } from "zod";
import { db } from "@/db/client";
import { bookmark, comment, follow, reaction } from "@/db/schema";
import { requireOnboardedUser } from "@/lib/session";

export async function toggleLikeAction(postId: string) {
  const session = await requireOnboardedUser();
  const existing = await db
    .select()
    .from(reaction)
    .where(
      and(eq(reaction.postId, postId), eq(reaction.userId, session.user.id)),
    )
    .limit(1);
  if (existing.length > 0) {
    await db
      .delete(reaction)
      .where(
        and(eq(reaction.postId, postId), eq(reaction.userId, session.user.id)),
      );
    return { ok: true as const, liked: false };
  }
  await db.insert(reaction).values({ postId, userId: session.user.id });
  return { ok: true as const, liked: true };
}

export async function toggleBookmarkAction(postId: string) {
  const session = await requireOnboardedUser();
  const existing = await db
    .select()
    .from(bookmark)
    .where(
      and(eq(bookmark.postId, postId), eq(bookmark.userId, session.user.id)),
    )
    .limit(1);
  if (existing.length > 0) {
    await db
      .delete(bookmark)
      .where(
        and(eq(bookmark.postId, postId), eq(bookmark.userId, session.user.id)),
      );
    return { ok: true as const, bookmarked: false };
  }
  await db.insert(bookmark).values({ postId, userId: session.user.id });
  return { ok: true as const, bookmarked: true };
}

export async function toggleFollowAction(targetId: string) {
  const t = await getTranslations("post");
  const session = await requireOnboardedUser();
  if (targetId === session.user.id)
    return { ok: false as const, error: t("cantFollowSelf") };

  const existing = await db
    .select()
    .from(follow)
    .where(
      and(
        eq(follow.followerId, session.user.id),
        eq(follow.followingId, targetId),
      ),
    )
    .limit(1);

  if (existing.length > 0) {
    await db
      .delete(follow)
      .where(
        and(
          eq(follow.followerId, session.user.id),
          eq(follow.followingId, targetId),
        ),
      );
    revalidatePath("/feed");
    return { ok: true as const, following: false };
  }
  await db
    .insert(follow)
    .values({ followerId: session.user.id, followingId: targetId });
  revalidatePath("/feed");
  return { ok: true as const, following: true };
}

const CommentSchema = z.object({
  postId: z.string(),
  body: z.string().min(1).max(2000),
  parentId: z.string().optional().nullable(),
});

export async function addCommentAction(input: z.input<typeof CommentSchema>) {
  const t = await getTranslations("editor");
  const parsed = CommentSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: t("invalidInput") };
  const session = await requireOnboardedUser();
  const id = nanoid(12);
  await db.insert(comment).values({
    id,
    postId: parsed.data.postId,
    authorId: session.user.id,
    parentId: parsed.data.parentId ?? null,
    body: parsed.data.body.trim(),
  });
  return { ok: true as const, id };
}

export async function deleteCommentAction(commentId: string) {
  const session = await requireOnboardedUser();
  await db
    .delete(comment)
    .where(
      and(eq(comment.id, commentId), eq(comment.authorId, session.user.id)),
    );
  return { ok: true as const };
}

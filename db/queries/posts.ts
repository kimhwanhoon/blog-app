import { and, desc, eq, inArray, sql } from "drizzle-orm";
import { db } from "@/db/client";
import {
  bookmark,
  comment,
  follow,
  post,
  postTag,
  reaction,
  tag,
  user,
} from "@/db/schema";

export type ListedPost = Awaited<
  ReturnType<typeof getPostsByAuthor>
>[number];

export async function getPostsByAuthor(authorId: string, includeDrafts = false) {
  const where = includeDrafts
    ? eq(post.authorId, authorId)
    : and(eq(post.authorId, authorId), eq(post.status, "published"));

  return db
    .select({
      id: post.id,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      coverImageUrl: post.coverImageUrl,
      status: post.status,
      publishedAt: post.publishedAt,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      viewCount: post.viewCount,
      likeCount: sql<number>`(select count(*)::int from ${reaction} where ${reaction.postId} = ${post.id})`,
      commentCount: sql<number>`(select count(*)::int from ${comment} where ${comment.postId} = ${post.id})`,
    })
    .from(post)
    .where(where)
    .orderBy(desc(post.createdAt));
}

export async function getPostByAuthorAndSlug(authorId: string, slug: string) {
  const rows = await db
    .select()
    .from(post)
    .where(and(eq(post.authorId, authorId), eq(post.slug, slug)))
    .limit(1);
  return rows[0] ?? null;
}

export async function getPostById(id: string) {
  const rows = await db.select().from(post).where(eq(post.id, id)).limit(1);
  return rows[0] ?? null;
}

export async function getUserByUsername(username: string) {
  const rows = await db
    .select()
    .from(user)
    .where(eq(user.username, username))
    .limit(1);
  return rows[0] ?? null;
}

export async function getPostTags(postId: string) {
  return db
    .select({ id: tag.id, name: tag.name, slug: tag.slug })
    .from(postTag)
    .innerJoin(tag, eq(postTag.tagId, tag.id))
    .where(eq(postTag.postId, postId));
}

export async function getPostMeta(postId: string, viewerId: string | null) {
  const [[likes], [bookmarks], [comments]] = await Promise.all([
    db
      .select({ n: sql<number>`count(*)::int` })
      .from(reaction)
      .where(eq(reaction.postId, postId)),
    db
      .select({ n: sql<number>`count(*)::int` })
      .from(bookmark)
      .where(eq(bookmark.postId, postId)),
    db
      .select({ n: sql<number>`count(*)::int` })
      .from(comment)
      .where(eq(comment.postId, postId)),
  ]);

  let liked = false;
  let bookmarked = false;
  if (viewerId) {
    const [r] = await db
      .select({ n: sql<number>`count(*)::int` })
      .from(reaction)
      .where(and(eq(reaction.postId, postId), eq(reaction.userId, viewerId)));
    liked = (r?.n ?? 0) > 0;
    const [b] = await db
      .select({ n: sql<number>`count(*)::int` })
      .from(bookmark)
      .where(and(eq(bookmark.postId, postId), eq(bookmark.userId, viewerId)));
    bookmarked = (b?.n ?? 0) > 0;
  }

  return {
    likes: likes?.n ?? 0,
    bookmarks: bookmarks?.n ?? 0,
    comments: comments?.n ?? 0,
    liked,
    bookmarked,
  };
}

export async function getFeed(viewerId: string, opts: { cursor?: string } = {}) {
  const followingRows = await db
    .select({ id: follow.followingId })
    .from(follow)
    .where(eq(follow.followerId, viewerId));
  const ids = followingRows.map((r) => r.id);
  if (ids.length === 0) return [];

  const rows = await db
    .select({
      id: post.id,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      coverImageUrl: post.coverImageUrl,
      publishedAt: post.publishedAt,
      authorId: post.authorId,
      authorUsername: user.username,
      authorName: user.displayName,
      authorImage: user.image,
    })
    .from(post)
    .innerJoin(user, eq(user.id, post.authorId))
    .where(and(inArray(post.authorId, ids), eq(post.status, "published")))
    .orderBy(desc(post.publishedAt))
    .limit(20);

  return rows;
}

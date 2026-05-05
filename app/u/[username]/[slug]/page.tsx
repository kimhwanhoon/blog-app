import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/shared/header";
import { PostActions } from "@/components/post/post-actions";
import { CommentThread } from "@/components/post/comment-thread";
import {
  getPostByAuthorAndSlug,
  getPostMeta,
  getPostTags,
  getUserByUsername,
} from "@/db/queries/posts";
import { getSession } from "@/lib/session";
import { db } from "@/db/client";
import { comment, post, user as userTable } from "@/db/schema";
import { desc, eq, sql } from "drizzle-orm";
import { formatDate } from "@/lib/utils-app";

export default async function PostPage(props: {
  params: Promise<{ username: string; slug: string }>;
}) {
  const { username, slug } = await props.params;
  const author = await getUserByUsername(username);
  if (!author) notFound();
  const found = await getPostByAuthorAndSlug(author.id, slug);
  if (!found || found.status !== "published") notFound();

  const session = await getSession();
  const viewerId = session?.user.id ?? null;

  const [tags, meta, comments] = await Promise.all([
    getPostTags(found.id),
    getPostMeta(found.id, viewerId),
    db
      .select({
        id: comment.id,
        body: comment.body,
        createdAt: comment.createdAt,
        parentId: comment.parentId,
        authorId: comment.authorId,
        authorName: userTable.displayName,
        authorUsername: userTable.username,
        authorImage: userTable.image,
      })
      .from(comment)
      .innerJoin(userTable, eq(userTable.id, comment.authorId))
      .where(eq(comment.postId, found.id))
      .orderBy(desc(comment.createdAt)),
  ]);

  await db
    .update(post)
    .set({ viewCount: sql`${post.viewCount} + 1` })
    .where(eq(post.id, found.id));

  const t = await getTranslations("post");

  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10">
        <article className="prose prose-neutral dark:prose-invert max-w-none">
          <header className="not-prose mb-8 space-y-4">
            <h1 className="text-4xl font-semibold tracking-tight">{found.title}</h1>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <Avatar className="h-8 w-8">
                {author.image ? (
                  <AvatarImage src={author.image} alt={author.displayName ?? ""} />
                ) : null}
                <AvatarFallback>
                  {(author.displayName ?? username)[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <Link href={`/@${username}`} className="hover:text-foreground">
                {author.displayName ?? `@${username}`}
              </Link>
              <span>·</span>
              <span>{found.publishedAt ? formatDate(found.publishedAt) : ""}</span>
            </div>
            {found.coverImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={found.coverImageUrl}
                alt={found.title}
                className="rounded-lg border border-border"
              />
            ) : null}
          </header>
          <div
            className="prose prose-neutral dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: found.contentHtml }}
          />
          {tags.length > 0 ? (
            <div className="not-prose mt-8 flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Link key={tag.id} href={`/@${username}/tag/${tag.slug}`}>
                  <Badge variant="secondary">#{tag.name}</Badge>
                </Link>
              ))}
            </div>
          ) : null}
        </article>

        <div className="mt-10">
          <PostActions
            postId={found.id}
            initialLiked={meta.liked}
            initialBookmarked={meta.bookmarked}
            initialLikes={meta.likes}
            initialBookmarks={meta.bookmarks}
            commentCount={meta.comments}
            isAuthenticated={Boolean(viewerId)}
          />
        </div>

        <section className="mt-12 space-y-6">
          <h2 className="text-lg font-semibold">
            {t("commentCount", { count: meta.comments })}
          </h2>
          <CommentThread
            postId={found.id}
            comments={comments}
            currentUserId={viewerId}
          />
        </section>
      </main>
    </>
  );
}

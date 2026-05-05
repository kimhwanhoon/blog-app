import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Header } from "@/components/shared/header";
import { FollowButton } from "@/components/post/follow-button";
import { getPostsByAuthor, getUserByUsername } from "@/db/queries/posts";
import { getSession } from "@/lib/session";
import { formatDate } from "@/lib/utils-app";
import { db } from "@/db/client";
import { follow } from "@/db/schema";
import { and, eq, sql } from "drizzle-orm";

export default async function UserBlogPage(props: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await props.params;
  const author = await getUserByUsername(username);
  if (!author) notFound();

  const posts = await getPostsByAuthor(author.id, false);

  const [{ followers }] = await db
    .select({ followers: sql<number>`count(*)::int` })
    .from(follow)
    .where(eq(follow.followingId, author.id));

  const session = await getSession();
  const viewerId = session?.user.id ?? null;
  const isMe = viewerId === author.id;

  let isFollowing = false;
  if (viewerId && !isMe) {
    const rows = await db
      .select({ x: sql`1` })
      .from(follow)
      .where(
        and(eq(follow.followerId, viewerId), eq(follow.followingId, author.id)),
      )
      .limit(1);
    isFollowing = rows.length > 0;
  }

  const t = await getTranslations();

  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">
        <section className="flex items-start justify-between gap-4 border-b border-border pb-6">
          <div className="flex gap-4">
            <Avatar className="h-16 w-16">
              {author.image ? (
                <AvatarImage src={author.image} alt={author.displayName ?? username} />
              ) : null}
              <AvatarFallback>
                {(author.displayName ?? username)[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">
                {author.displayName ?? `@${username}`}
              </h1>
              <p className="text-sm text-muted-foreground">@{username}</p>
              {author.bio ? (
                <p className="mt-2 max-w-prose text-sm">{author.bio}</p>
              ) : null}
              <p className="mt-2 text-xs text-muted-foreground">
                {t("userBlog.followers", { count: followers })}
              </p>
            </div>
          </div>
          {!isMe && viewerId ? (
            <FollowButton
              targetId={author.id}
              initialFollowing={isFollowing}
            />
          ) : null}
        </section>

        <section className="divide-y divide-border">
          {posts.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              {t("userBlog.noPostsYet")}
            </p>
          ) : (
            posts.map((p) => (
              <article key={p.id} className="py-6">
                <Link
                  href={`/@${username}/${p.slug}`}
                  className="group block space-y-2"
                >
                  <h2 className="text-xl font-semibold group-hover:underline">
                    {p.title || t("common.untitled")}
                  </h2>
                  {p.excerpt ? (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {p.excerpt}
                    </p>
                  ) : null}
                  <p className="text-xs text-muted-foreground">
                    {p.publishedAt ? formatDate(p.publishedAt) : ""} ·{" "}
                    {t("dashboard.metaLikes", { count: p.likeCount })} ·{" "}
                    {t("dashboard.metaComments", { count: p.commentCount })}
                  </p>
                </Link>
              </article>
            ))
          )}
        </section>
      </main>
    </>
  );
}

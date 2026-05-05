import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Header } from "@/components/shared/header";
import { Footer } from "@/components/shared/footer";
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
      <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-16">
        <section className="flex items-start justify-between gap-6 pb-10">
          <div className="flex gap-5">
            <Avatar className="h-14 w-14">
              {author.image ? (
                <AvatarImage src={author.image} alt={author.displayName ?? username} />
              ) : null}
              <AvatarFallback>
                {(author.displayName ?? username)[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1.5">
              <h1 className="font-heading text-3xl font-medium tracking-tight">
                {author.displayName ?? `@${username}`}
              </h1>
              <p className="text-sm text-muted-foreground">@{username}</p>
              {author.bio ? (
                <p className="max-w-prose pt-1 text-sm leading-6">
                  {author.bio}
                </p>
              ) : null}
              <p className="pt-2 text-xs text-muted-foreground">
                {t("userBlog.followers", { count: followers })} · {posts.length} posts
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

        <section className="border-t border-border/60">
          {posts.length === 0 ? (
            <p className="py-16 text-center text-sm text-muted-foreground">
              {t("userBlog.noPostsYet")}
            </p>
          ) : (
            <ul className="divide-y divide-border/60">
              {posts.map((p) => (
                <li key={p.id}>
                  <Link
                    href={`/@${username}/${p.slug}`}
                    className="block space-y-2 py-7 transition-colors hover:bg-accent/40 -mx-3 px-3 rounded-md"
                  >
                    <div className="flex items-baseline justify-between gap-4">
                      <h2 className="font-heading text-xl font-medium leading-snug tracking-tight">
                        {p.title || t("common.untitled")}
                      </h2>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {p.publishedAt ? formatDate(p.publishedAt) : ""}
                      </span>
                    </div>
                    {p.excerpt ? (
                      <p className="line-clamp-2 text-sm leading-6 text-muted-foreground">
                        {p.excerpt}
                      </p>
                    ) : null}
                    <p className="text-xs text-muted-foreground">
                      {t("dashboard.metaLikes", { count: p.likeCount })} ·{" "}
                      {t("dashboard.metaComments", { count: p.commentCount })}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}

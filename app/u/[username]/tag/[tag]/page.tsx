import Link from "next/link";
import { notFound } from "next/navigation";
import { and, desc, eq } from "drizzle-orm";
import { getTranslations } from "next-intl/server";
import { Header } from "@/components/shared/header";
import { Footer } from "@/components/shared/footer";
import { db } from "@/db/client";
import { post, postTag, tag as tagTable } from "@/db/schema";
import { getUserByUsername } from "@/db/queries/posts";
import { formatDate } from "@/lib/utils-app";

export default async function TagPage(props: {
  params: Promise<{ username: string; tag: string }>;
}) {
  const { username, tag } = await props.params;
  const author = await getUserByUsername(username);
  if (!author) notFound();

  const [t] = await db
    .select()
    .from(tagTable)
    .where(eq(tagTable.slug, tag))
    .limit(1);
  if (!t) notFound();

  const rows = await db
    .select({
      id: post.id,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      publishedAt: post.publishedAt,
    })
    .from(post)
    .innerJoin(postTag, eq(postTag.postId, post.id))
    .where(
      and(
        eq(postTag.tagId, t.id),
        eq(post.authorId, author.id),
        eq(post.status, "published"),
      ),
    )
    .orderBy(desc(post.publishedAt));

  const tr = await getTranslations();

  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-16">
        <div className="mb-10 flex items-baseline gap-2">
          <Link
            href={`/@${username}`}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            @{username}
          </Link>
          <span className="text-muted-foreground">/</span>
          <h1 className="font-heading text-2xl font-medium tracking-tight">
            #{t.name}
          </h1>
        </div>
        {rows.length === 0 ? (
          <p className="py-10 text-sm text-muted-foreground">
            {tr("tag.noPostsForTag")}
          </p>
        ) : (
          <ul className="divide-y divide-border/60 border-t border-border/60">
            {rows.map((p) => (
              <li key={p.id}>
                <Link
                  href={`/@${username}/${p.slug}`}
                  className="block space-y-2 py-7 transition-colors hover:bg-accent/40 -mx-3 px-3 rounded-md"
                >
                  <div className="flex items-baseline justify-between gap-4">
                    <h2 className="font-heading text-xl font-medium leading-snug tracking-tight">
                      {p.title || tr("common.untitled")}
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
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
      <Footer />
    </>
  );
}

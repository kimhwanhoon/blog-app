import Link from "next/link";
import { notFound } from "next/navigation";
import { and, desc, eq } from "drizzle-orm";
import { getTranslations } from "next-intl/server";
import { Header } from "@/components/shared/header";
import { Badge } from "@/components/ui/badge";
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
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">
        <div className="mb-6 flex items-center gap-2">
          <Link href={`/@${username}`} className="text-sm text-muted-foreground hover:underline">
            @{username}
          </Link>
          <span className="text-muted-foreground">/</span>
          <Badge variant="secondary">#{t.name}</Badge>
        </div>
        {rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">{tr("tag.noPostsForTag")}</p>
        ) : (
          <ul className="divide-y divide-border">
            {rows.map((p) => (
              <li key={p.id} className="py-6">
                <Link
                  href={`/@${username}/${p.slug}`}
                  className="group block space-y-2"
                >
                  <h2 className="text-xl font-semibold group-hover:underline">
                    {p.title || tr("common.untitled")}
                  </h2>
                  {p.excerpt ? (
                    <p className="text-sm text-muted-foreground line-clamp-2">{p.excerpt}</p>
                  ) : null}
                  <p className="text-xs text-muted-foreground">
                    {p.publishedAt ? formatDate(p.publishedAt) : ""}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </>
  );
}

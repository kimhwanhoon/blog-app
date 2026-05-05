import { notFound, redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { post, postTag, tag } from "@/db/schema";
import { requireOnboardedUser } from "@/lib/session";
import { EditorClient } from "../editor-client";

export default async function EditorPage(props: {
  params: Promise<{ postId: string }>;
}) {
  const { postId } = await props.params;
  const session = await requireOnboardedUser();

  const rows = await db.select().from(post).where(eq(post.id, postId)).limit(1);
  const found = rows[0];
  if (!found) notFound();
  if (found.authorId !== session.user.id) redirect("/dashboard");

  const tagRows = await db
    .select({ name: tag.name })
    .from(postTag)
    .innerJoin(tag, eq(postTag.tagId, tag.id))
    .where(eq(postTag.postId, postId));

  return (
    <EditorClient
      post={{
        id: found.id,
        title: found.title,
        slug: found.slug.startsWith("draft-") ? "" : found.slug,
        excerpt: found.excerpt ?? "",
        contentJson: found.contentJson,
        coverImageUrl: found.coverImageUrl ?? null,
        status: found.status,
      }}
      initialTags={tagRows.map((t) => t.name)}
      username={session.user.username}
    />
  );
}
